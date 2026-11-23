/**
 * Couriers CMS — Cloudflare Worker 安全代交网关 (防暴力破解 + 单次原子 Commit)
 *
 * 部署步骤（全程免费，约 3 分钟）：
 * 1. 登录 https://dash.cloudflare.com -> Workers & Pages -> Create Worker
 * 2. 将本文件全部代码粘贴进去并点击 Deploy
 * 3. 在 Worker 的 Settings -> Variables and Secrets 中添加以下环境变量：
 *    - GITHUB_TOKEN : 你的 GitHub Personal Access Token (Fine-grained token，仅勾选当前仓库的 Contents: Read and write 权限)
 *    - GITHUB_OWNER : 你的 GitHub 用户名或组织名 (例如 "kaisenn")
 *    - GITHUB_REPO  : 你的仓库名 (例如 "Couriers")
 *    - GITHUB_BRANCH: 分支名 (默认 "main")
 *    - MEMBER_KEYS  : 成员专属高强度密钥列表（可在网站 #admin 后台第 4 页一键生成），多个成员用英文逗号分隔：
 *                     格式：成员名1:高强度密钥1,成员名2:高强度密钥2
 *                     例如：RainSwallow:couriers-rainswallow-8f9a1c2e-4b7d903a-...,Carbonado404:couriers-carbonado404-3e71a9c0-...
 *    - ALLOWED_ORIGIN: (可选) 限制只允许你的 GitHub Pages 域名跨域调用，例如 "https://你的域名.github.io"（留空默认允许 *）
 */

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 分钟封禁窗口
const ALLOWED_IMAGE_PATH_REGEX =
  /^public\/images\/(projects|skins|avatars)\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp|avif)$/;

// 内存级 IP 防爆破计数器（同一 Worker 实例内生效）
const ipFailureMap = new Map();

function getCorsHeaders(env, request) {
  const origin = request.headers.get('Origin') || '*';
  const allowed = env.ALLOWED_ORIGIN ? env.ALLOWED_ORIGIN.trim() : '*';
  return {
    'Access-Control-Allow-Origin': allowed === '*' ? origin : allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

/**
 * 恒定时间字符串哈希比对，防止通过响应时间差猜测密码长度或前缀 (Timing Attack 防护)
 */
async function timingSafeEqualStr(a, b) {
  const enc = new TextEncoder();
  const hashA = new Uint8Array(
    await crypto.subtle.digest('SHA-256', enc.encode(a))
  );
  const hashB = new Uint8Array(
    await crypto.subtle.digest('SHA-256', enc.encode(b))
  );
  let diff = a.length ^ b.length;
  for (let i = 0; i < hashA.length; i++) {
    diff |= hashA[i] ^ hashB[i];
  }
  return diff === 0;
}

/**
 * 校验成员专属密钥，返回匹配的成员名称；若不匹配则返回 null
 */
async function authenticateMember(token, memberKeysRaw) {
  if (!token || token.length < 16 || !memberKeysRaw) return null;
  const entries = memberKeysRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  let matchedAuthor = null;
  for (const entry of entries) {
    const colonIdx = entry.indexOf(':');
    if (colonIdx === -1) continue;
    const memberName = entry.slice(0, colonIdx).trim();
    const expectedKey = entry.slice(colonIdx + 1).trim();
    if (!expectedKey || expectedKey.length < 16) continue;

    const isMatch = await timingSafeEqualStr(token, expectedKey);
    if (isMatch) {
      matchedAuthor = memberName;
    }
  }
  return matchedAuthor;
}

async function githubRequest(env, path, method = 'GET', body = undefined) {
  const url = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'Couriers-CMS-Worker',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GitHub API 错误 (${res.status}): ${errText}`);
  }
  return res.json();
}

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(env, request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ ok: false, error: '仅支持 POST 请求' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const clientIp =
      request.headers.get('CF-Connecting-IP') ||
      request.headers.get('X-Forwarded-For') ||
      'unknown';

    // 1. 检查该 IP 是否处于暴力破解封禁期
    const now = Date.now();
    const record = ipFailureMap.get(clientIp);
    if (record && now - record.firstFailAt < LOCKOUT_WINDOW_MS) {
      if (record.count >= MAX_FAILED_ATTEMPTS) {
        const remainMin = Math.ceil(
          (LOCKOUT_WINDOW_MS - (now - record.firstFailAt)) / 60000
        );
        return new Response(
          JSON.stringify({
            ok: false,
            error: `输错次数过多，当前 IP 已被临时保护锁定，请 ${remainMin} 分钟后再试`,
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else if (record) {
      ipFailureMap.delete(clientIp);
    }

    // 2. 提取并恒定时间校验 Bearer 成员密钥
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const author = await authenticateMember(token, env.MEMBER_KEYS || '');

    if (!author) {
      const prev = ipFailureMap.get(clientIp) || {
        count: 0,
        firstFailAt: now,
      };
      ipFailureMap.set(clientIp, {
        count: prev.count + 1,
        firstFailAt: prev.firstFailAt,
      });

      // 故意延迟 900ms 响应，彻底阻断高速脚本爆破
      await new Promise((r) => setTimeout(r, 900));

      return new Response(
        JSON.stringify({
          ok: false,
          error: `通行密钥无效（剩余尝试次数: ${Math.max(
            0,
            MAX_FAILED_ATTEMPTS - (prev.count + 1)
          )}）`,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 验证通过，清除该 IP 的失败记录
    ipFailureMap.delete(clientIp);

    try {
      const payload = await request.json();
      const { message, siteData, files = [] } = payload;

      if (
        !siteData ||
        !Array.isArray(siteData.projects) ||
        !Array.isArray(siteData.members) ||
        !siteData.homeConfig
      ) {
        throw new Error('siteData 数据结构不完整');
      }

      // 3. 严格校验所有上传文件的路径白名单与大小限制
      if (!Array.isArray(files) || files.length > 25) {
        throw new Error('单次上传图片数量超出限制');
      }

      for (const file of files) {
        if (
          typeof file.path !== 'string' ||
          !ALLOWED_IMAGE_PATH_REGEX.test(file.path)
        ) {
          throw new Error(`禁止写入非白名单路径: ${file.path}`);
        }
        if (
          typeof file.contentBase64 !== 'string' ||
          file.contentBase64.length > 8 * 1024 * 1024
        ) {
          throw new Error(`图片文件过大: ${file.path}`);
        }
      }

      const branch = (env.GITHUB_BRANCH || 'main').trim();

      // 4. 使用 GitHub Git Data API 将 JSON 与多张图片打包为单次原子 Commit
      const refData = await githubRequest(
        env,
        `/git/ref/heads/${encodeURIComponent(branch)}`
      );
      const latestCommitSha = refData.object.sha;
      const latestCommit = await githubRequest(
        env,
        `/git/commits/${latestCommitSha}`
      );
      const baseTreeSha = latestCommit.tree.sha;

      const treeItems = [];

      // 为每张新上传的图片创建 Git Blob
      for (const file of files) {
        const blob = await githubRequest(env, '/git/blobs', 'POST', {
          content: file.contentBase64,
          encoding: 'base64',
        });
        treeItems.push({
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blob.sha,
        });
      }

      // 添加更新后的 src/content/siteData.json
      treeItems.push({
        path: 'src/content/siteData.json',
        mode: '100644',
        type: 'blob',
        content: JSON.stringify(siteData, null, 2) + '\n',
      });

      const newTree = await githubRequest(env, '/git/trees', 'POST', {
        base_tree: baseTreeSha,
        tree: treeItems,
      });

      const commitTitle = `cms(${author}): ${
        (message || '更新网站作品与成员数据').slice(0, 80)
      }`;
      const newCommit = await githubRequest(env, '/git/commits', 'POST', {
        message: commitTitle,
        tree: newTree.sha,
        parents: [latestCommitSha],
      });

      await githubRequest(
        env,
        `/git/refs/heads/${encodeURIComponent(branch)}`,
        'PATCH',
        {
          sha: newCommit.sha,
        }
      );

      return new Response(
        JSON.stringify({
          ok: true,
          author,
          commitSha: newCommit.sha,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: err instanceof Error ? err.message : '服务器内部错误',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
