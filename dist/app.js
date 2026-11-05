// ─────────────────────────────────────────────────────────────
//  寄语 Couriers
//  像素在这里是「材质」：开场的像素幕布、从方块解析的主视觉、
//  方块视图透镜、抖动过渡、未公开作品的马赛克、逐格替换的成员头像。
// ─────────────────────────────────────────────────────────────

// 内容数据 ────────────────────────────────────────────────────
// 作品索引。status：live 已公开 / wip 制作中 / hidden 未公开（标题与封面打码）。
// 带 sample:true 的是占位数据，换成真实作品后删掉。
const works = [
  { no:'01', title:'沉默乐章：错位音', kind:'Minecraft 地图', year:'2026', status:'live', href:'https://www.bilibili.com/video/BV1M8NQ6GE8M', image:'./assets/img/cmyz-hero-background-v2.png', focus:[.52, .45], zoom:1.6 },
  { no:'02', title:'', redact:5, kind:'—', year:'—', status:'hidden', sample:true },
  { no:'03', title:'', redact:3, kind:'—', year:'—', status:'hidden', sample:true },
];
const statusText = { live:'现已公开', wip:'制作中', hidden:'未公开' };

// 成员（示例）。
// 立绘：有正式立绘时填 art:{ idle:'站立图', action:'选中时的动作图' }（建议透明底 PNG，人物脚底对齐）；
// 没填就用 face（8×8 头像）+ outfit 生成一个方块小人，prop 是选中时拿出来的道具。
const outfits = [
  { shirt:'#3B3856', pants:'#2A2838', shoes:'#1A1826', accent:'#929FD8', prop:'envelope' },
  { shirt:'#C0703A', pants:'#4A3A30', shoes:'#2A201A', accent:'#E8B04A', prop:'block' },
  { shirt:'#3E5C4E', pants:'#2A2838', shoes:'#1A1826', accent:'#7FD3A6', prop:'terminal' },
  { shirt:'#F2E6D0', pants:'#5E3A44', shoes:'#2A1A20', accent:'#B4443A', prop:'brush' },
  { shirt:'#595F91', pants:'#302D41', shoes:'#1A1826', accent:'#E9E4EE', prop:'note' },
  { shirt:'#E8D3DC', pants:'#4A3A5E', shoes:'#2A2238', accent:'#E59AB0', prop:'book' },
];
const crew = [
  { name:'成员 01', role:'策划', bio:'把一个模糊的念头，整理成可以开工的方案。每一封信从哪里开始写，通常是从这里。', facts:[['擅长', '世界观、流程设计'], ['喜欢', '凌晨的灵感'], ['不喜欢', '改第十版需求']],
    face:['HHHHHHHH','HHHHHHHH','HSSHHSSH','SSSSSSSS','GWEGGEWG','SSSSSSSS','SSSMMSSS','SSSSSSSS'], colors:{ H:'#302D41', E:'#595F91', G:'#302D41' } },
  { name:'成员 02', role:'建筑', bio:'一砖一瓦，把草图变成可以走进去的地方。地图里你看到的每一处风景，都在这里成形。', facts:[['擅长', '地形、室内装潢'], ['喜欢', '深色橡木'], ['不喜欢', '对不齐的屋檐']],
    face:['AAAAAAAA','AYAAAAAA','aaaaaaaa','HSSSSSSH','SWESSEWS','SSSSSSSS','SSSMMSSS','SSSSSSSS'], colors:{ H:'#6B4A35', E:'#3F6E4E', A:'#E8B04A', Y:'#F8DE8C', a:'#B9822E' } },
  { name:'成员 03', role:'指令', bio:'用命令方块和数据包，让世界回应玩家的每一步。机关、谜题和小游戏都归这里管。', facts:[['擅长', '数据包、机制'], ['喜欢', '一次跑通'], ['不喜欢', '神秘的 bug']],
    face:['AAAAAAAA','AHHHHHHA','AHSSSSHA','ASSSSSSA','AWESSEWA','ASSSSSSA','ASSMMSSA','ASSSSSSA'], colors:{ H:'#2A2638', E:'#7FD3A6', A:'#3E5C4E' } },
  { name:'成员 04', role:'美术', bio:'海报、材质和每一张宣传图。地图寄出去之前，先由这里给它贴上邮票。', facts:[['擅长', '渲染、海报'], ['喜欢', '暖色的光'], ['不喜欢', '压缩画质']],
    face:['.AAAAA..','AAAAAAA.','HHHHHHHH','HSSSSSSH','SWESSEWS','SSSSSSSS','SSSMMSSS','SSSSSSSS'], colors:{ H:'#C98B5A', E:'#7A4B8C', A:'#B4443A' } },
  { name:'成员 05', role:'音乐', bio:'为每一个场景谱一段旋律。安静的时候，你听到的那段声音大概就是这里写的。', facts:[['擅长', '作曲、音效'], ['喜欢', '小调'], ['不喜欢', '走调']],
    face:['HAAAAAAH','HHHHHHHH','HSSSSSSH','SSSSSSSS','AWESSEWA','ASSSSSSA','SSSMMSSS','SSSSSSSS'], colors:{ H:'#E9E4EE', E:'#B4443A', A:'#595F91' } },
  { name:'成员 06', role:'剧情', bio:'写台词、埋线索、安排结局。把真正想说的话，藏在地图的某个角落里。', facts:[['擅长', '台词、分支剧情'], ['喜欢', '开放式结局'], ['不喜欢', '剧透']],
    face:['HHHHHHHH','HHHHHHHH','HHSSSSHH','HSSSSSSH','HWESSEWH','HSSSSSSH','HSSMMSSH','HSSSSSSH'], colors:{ H:'#E59AB0', E:'#595F91' } },
];
const crewIsSample = true;

// 招募方向（文案草稿）。
const roles = ['建筑', '指令', '剧情', '美术', '音乐', '测试'];

// 工具 ────────────────────────────────────────────────────────
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const images = new Map();
function loadImage(src) {
  if (!images.has(src)) images.set(src, new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; }));
  return images.get(src);
}
function seeded(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
document.documentElement.classList.add('js');

// 方块画布 ────────────────────────────────────────────────────
// 把图片按 object-fit: cover 画进画布；block > 1 时先缩小再用最近邻放大，得到方块效果。
function sourceRect(img, w, h, [fx, fy] = [.5, .5], zoom = 1) {
  let sw = img.naturalWidth / zoom, sh = sw * h / w;
  if (sh > img.naturalHeight / zoom) { sh = img.naturalHeight / zoom; sw = sh * w / h; }
  return [clamp(fx * img.naturalWidth - sw / 2, 0, img.naturalWidth - sw), clamp(fy * img.naturalHeight - sh / 2, 0, img.naturalHeight - sh), sw, sh];
}
const scratch = document.createElement('canvas');
function drawBlocks(canvas, img, { focus, zoom, block = 1 } = {}) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
  const ctx = canvas.getContext('2d');
  const [sx, sy, sw, sh] = sourceRect(img, w, h, focus, zoom);
  if (block <= 1) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    return;
  }
  const bw = Math.max(1, Math.ceil(w / block)), bh = Math.max(1, Math.ceil(h / block));
  scratch.width = bw; scratch.height = bh;
  const sctx = scratch.getContext('2d');
  sctx.imageSmoothingEnabled = true;
  sctx.drawImage(img, sx, sy, sw, sh, 0, 0, bw, bh);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(scratch, 0, 0, bw, bh, 0, 0, bw * block * dpr, bh * block * dpr);
}
async function resolveIn(canvas, img, opts, steps = [40, 24, 14, 8, 4, 2, 1]) {
  const token = (canvas._token = (canvas._token || 0) + 1);
  if (reducedMotion.matches) { drawBlocks(canvas, img, { ...opts, block:1 }); return; }
  for (const block of steps) {
    if (canvas._token !== token) return;
    drawBlocks(canvas, img, { ...opts, block });
    await wait(block > 8 ? 70 : 55);
  }
}

// 主视觉：开场 ────────────────────────────────────────────────
// 1. 黑底上先亮出信封标志；2. 像素幕布从中心向外一格格散开；
// 3. 幕布后面的主视觉同时从粗方块解析成高清；4. 标题与按钮按格跳入。
const hero = $('.hero'), heroCanvas = $('#hero-canvas'), curtain = $('#curtain'), lensTag = $('#lens-tag');
const heroOpts = { focus:[.5, .5], zoom:1 };
const sharp = document.createElement('canvas'), coarse = document.createElement('canvas');
let heroImg, lens = null, lensQueued = false, skipOpening = false;
const LENS_BLOCK = 12, LENS_SIZE = 14;

const bayer8 = (() => {
  const m = [[0]];
  let out = m;
  for (let n = 1; n < 8; n *= 2) {
    const next = Array.from({ length:n * 2 }, () => Array(n * 2).fill(0));
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const v = out[y][x] * 4;
      next[y][x] = v; next[y][x + n] = v + 2; next[y + n][x] = v + 3; next[y + n][x + n] = v + 1;
    }
    out = next;
  }
  return out;
})();

function cacheHero() {
  sharp.width = heroCanvas.width; sharp.height = heroCanvas.height;
  sharp.getContext('2d').drawImage(heroCanvas, 0, 0);
  coarse.width = Math.ceil(heroCanvas.clientWidth / LENS_BLOCK); coarse.height = Math.ceil(heroCanvas.clientHeight / LENS_BLOCK);
  const cctx = coarse.getContext('2d');
  cctx.imageSmoothingEnabled = true;
  cctx.drawImage(sharp, 0, 0, sharp.width, sharp.height, 0, 0, coarse.width, coarse.height);
}
function drawHero() {
  lensQueued = false;
  const ctx = heroCanvas.getContext('2d');
  ctx.drawImage(sharp, 0, 0);
  if (!lens) return;
  const dpr = heroCanvas.width / heroCanvas.clientWidth, size = LENS_BLOCK * LENS_SIZE;
  const bx = Math.round(lens.x / LENS_BLOCK - LENS_SIZE / 2), by = Math.round(lens.y / LENS_BLOCK - LENS_SIZE / 2);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(coarse, bx, by, LENS_SIZE, LENS_SIZE, bx * LENS_BLOCK * dpr, by * LENS_BLOCK * dpr, size * dpr, size * dpr);
  ctx.strokeStyle = 'rgba(246,243,246,.9)';
  ctx.lineWidth = 2 * dpr;
  ctx.strokeRect(bx * LENS_BLOCK * dpr + dpr, by * LENS_BLOCK * dpr + dpr, size * dpr - 2 * dpr, size * dpr - 2 * dpr);
  lensTag.style.transform = `translate(${bx * LENS_BLOCK}px, ${(by + LENS_SIZE) * LENS_BLOCK + 8}px)`;
}

async function opening() {
  const imgPromise = loadImage(heroCanvas.dataset.src);
  const block = 24, cols = Math.ceil(curtain.clientWidth / block), rows = Math.ceil(curtain.clientHeight / block);
  curtain.width = cols; curtain.height = rows;
  const cctx = curtain.getContext('2d');
  cctx.fillStyle = '#121118';
  cctx.fillRect(0, 0, cols, rows);
  // 每一格的出场顺序：离中心越近越早，再叠一层 Bayer 抖动，边缘就会碎成像素而不是一条直线。
  const rnd = seeded(29), order = [];
  const cx = (cols - 1) / 2, cy = (rows - 1) / 2, maxD = Math.hypot(cx, cy);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    order.push({ x, y, t:Math.hypot((x - cx) * .8, y - cy) / maxD * .7 + bayer8[y % 8][x % 8] / 64 * .22 + rnd() * .08 });
  }
  hero.classList.add('is-opening');
  heroImg = await imgPromise;
  drawBlocks(heroCanvas, heroImg, { ...heroOpts, block:64 });

  if (reducedMotion.matches) skipOpening = true;
  if (!skipOpening) await wait(650);
  const steps = [64, 40, 24, 14, 8, 4, 2, 1], duration = 1100, start = performance.now();
  hero.classList.add('is-revealing');
  await new Promise(done => {
    let lastBlock = 64;
    (function frame(now) {
      const p = skipOpening ? 1 : clamp((now - start) / duration, 0, 1);
      cctx.clearRect(0, 0, cols, rows);
      cctx.fillStyle = '#121118';
      for (const cell of order) if (cell.t > p) cctx.fillRect(cell.x, cell.y, 1, 1);
      const b = steps[Math.min(steps.length - 1, Math.floor(p * steps.length))];
      if (b !== lastBlock) { drawBlocks(heroCanvas, heroImg, { ...heroOpts, block:b }); lastBlock = b; }
      if (p < 1) requestAnimationFrame(frame); else done();
    })(start);
  });
  drawBlocks(heroCanvas, heroImg, heroOpts);
  cacheHero();
  hero.classList.add('is-ready');
  hero.classList.remove('is-opening');
}
opening();
// 不想看开场：点一下或按任意键就跳过。
['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(type => addEventListener(type, () => { skipOpening = true; }, { once:true, passive:true }));

hero.addEventListener('pointermove', event => {
  if (!finePointer.matches || !hero.classList.contains('is-ready') || event.target.closest('a, button')) {
    if (lens) { lens = null; hero.classList.remove('has-lens'); drawHero(); }
    return;
  }
  const rect = heroCanvas.getBoundingClientRect();
  lens = { x:(event.clientX - rect.left) * heroCanvas.clientWidth / rect.width, y:(event.clientY - rect.top) * heroCanvas.clientHeight / rect.height };
  hero.classList.add('has-lens');
  if (!lensQueued) { lensQueued = true; requestAnimationFrame(drawHero); }
});
hero.addEventListener('pointerleave', () => { lens = null; hero.classList.remove('has-lens'); if (hero.classList.contains('is-ready')) drawHero(); });

// 抖动像素过渡（4×4 Bayer 矩阵） ─────────────────────────────
const bayer4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
$$('.dither').forEach(strip => {
  const rows = 12, c = document.createElement('canvas');
  c.width = 4; c.height = rows;
  const ctx = c.getContext('2d');
  for (let y = 0; y < rows; y++) for (let x = 0; x < 4; x++) {
    ctx.fillStyle = (y + .5) / rows > (bayer4[y % 4][x] + .5) / 16 ? strip.dataset.to : strip.dataset.from;
    ctx.fillRect(x, y, 1, 1);
  }
  strip.style.backgroundImage = `url(${c.toDataURL()})`;
});

// 像素小工具 ──────────────────────────────────────────────────
function paintFace(canvas, member) {
  const pal = { S:'#F2C9A9', M:'#C98A72', W:'#FFFFFF', '.':'#D7D3E2', ...member.colors };
  canvas.width = 8; canvas.height = 8;
  const ctx = canvas.getContext('2d');
  member.face.forEach((row, y) => [...row].forEach((ch, x) => { ctx.fillStyle = pal[ch] || '#D7D3E2'; ctx.fillRect(x, y, 1, 1); }));
}
function noiseBlocks(canvas, seed) {
  const w = canvas.clientWidth, h = canvas.clientHeight, b = 20;
  canvas.width = Math.ceil(w / b); canvas.height = Math.ceil(h / b);
  const ctx = canvas.getContext('2d'), pal = ['#1C1A24', '#24222F', '#302D41', '#3B3856', '#595F91', '#929FD8'], rnd = seeded(seed);
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
    const v = rnd(), light = (x + y) / (canvas.width + canvas.height);
    ctx.fillStyle = pal[Math.min(pal.length - 1, Math.floor(v * v * pal.length * (.6 + light)))];
    ctx.fillRect(x, y, 1, 1);
  }
}

// 作品索引 ────────────────────────────────────────────────────
const live = works.filter(w => w.status === 'live').length;
$('#works-count').textContent = `已公开 ${live} · 未公开 ${works.length - live}`;
$('#work-list').innerHTML = works.map((work, i) => {
  const title = work.status === 'hidden'
    ? `<canvas class="redact" style="--n:${work.redact}" data-n="${work.redact}" data-seed="${i * 977 + 13}" role="img" aria-label="未公开作品"></canvas>`
    : esc(work.title);
  const external = work.href && /^https?:/.test(work.href);
  const tag = work.href ? 'a' : 'div';
  const attrs = work.href ? ` href="${esc(work.href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''} data-cursor="${external ? '预告片 ↗' : '查看 →'}"` : ' data-cursor="未公开"';
  return `<li class="work-row is-${work.status}" data-index="${i}">
    <${tag} class="work-link"${attrs}>
      <span class="wr-no">${esc(work.no)}</span>
      <span class="wr-title">${title}</span>
      <span class="wr-meta">${work.status === 'hidden' ? '' : `${esc(work.kind)} · ${esc(work.year)}`}${work.sample ? '<em class="sample">示例</em>' : ''}</span>
      <span class="wr-status"><i aria-hidden="true"></i>${statusText[work.status]}</span>
    </${tag}>
  </li>`;
}).join('');
function drawRedactions() {
  $$('canvas.redact').forEach(c => {
    const n = Number(c.dataset.n), block = 6;
    c.width = Math.max(1, Math.ceil(c.clientWidth / block));
    c.height = Math.max(1, Math.ceil(c.clientHeight / block));
    const ctx = c.getContext('2d'), per = c.width / n, rnd = seeded(Number(c.dataset.seed));
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      if (x % per > per - 1.15) continue;
      ctx.fillStyle = ['#3B3856', '#595F91', '#595F91', '#7C7990', '#929FD8'][Math.floor(rnd() * 5)];
      ctx.fillRect(x, y, 1, 1);
    }
  });
}
drawRedactions();
document.fonts?.ready.then(drawRedactions);

// 悬停预览：跟随鼠标，位置对齐到 4px 网格
const preview = $('#preview'), previewCanvas = preview.querySelector('canvas'), previewCap = preview.querySelector('.preview-cap');
const pv = { x:0, y:0, tx:0, ty:0, on:false };
let pvRunning = false, noiseTimer;
function previewLoop() {
  pv.x += (pv.tx - pv.x) * .18; pv.y += (pv.ty - pv.y) * .18;
  preview.style.transform = `translate(${Math.round(pv.x / 4) * 4}px, ${Math.round(pv.y / 4) * 4}px)`;
  if (pv.on || Math.abs(pv.tx - pv.x) > .5) requestAnimationFrame(previewLoop); else pvRunning = false;
}
$$('.work-row').forEach(row => {
  const work = works[Number(row.dataset.index)];
  row.addEventListener('pointerenter', async event => {
    if (!finePointer.matches) return;
    pv.on = true; pv.tx = pv.x = event.clientX + 28; pv.ty = pv.y = event.clientY - 170;
    preview.classList.add('is-on');
    previewCap.textContent = work.status === 'hidden' ? '信号未到 · 未公开' : `NO.${work.no} — ${work.title}`;
    clearInterval(noiseTimer);
    if (!pvRunning) { pvRunning = true; requestAnimationFrame(previewLoop); }
    if (work.image) {
      const img = await loadImage(work.image);
      if (pv.on) resolveIn(previewCanvas, img, { focus:work.focus, zoom:work.zoom }, [32, 16, 8, 4, 1]);
    } else {
      let seed = 7 + Number(work.no) * 131;
      noiseBlocks(previewCanvas, seed);
      if (!reducedMotion.matches) noiseTimer = setInterval(() => noiseBlocks(previewCanvas, seed += 17), 160);
    }
  });
  row.addEventListener('pointermove', event => { pv.tx = event.clientX + 28; pv.ty = event.clientY - 170; });
  row.addEventListener('pointerleave', () => { pv.on = false; preview.classList.remove('is-on'); clearInterval(noiseTimer); });
});

// 成员：立绘并排站在窗里，点谁谁换动作，下方介绍跟着替换 ───
const mix = (a, b, t) => {
  const pa = a.match(/\w\w/g).map(h => parseInt(h, 16)), pb = b.match(/\w\w/g).map(h => parseInt(h, 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
const shade = (hex, amt) => mix(hex, amt > 0 ? '#FFFFFF' : '#000000', Math.abs(amt));
const props = {
  envelope:{ rows:['LLLLLL','LBLLBL','LLBBLL','LLLLLL'], pal:{ L:'#F6F3F6', B:'#595F91' } },
  block:{ rows:['GGGGG','GgGgG','DDDDD','DdDdD','DDDDD'], pal:{ G:'#6F9C6A', g:'#5B8A5E', D:'#7C5846', d:'#5A3D30' } },
  terminal:{ rows:['KKKKKK','KGKKKK','KKGKKK','KGKKKK','KKKGGK','KKKKKK'], pal:{ K:'#1A1826', G:'#7FD3A6' } },
  brush:{ rows:['RR','RR','WW','ww','ww','ww','ww'], pal:{ R:'#B4443A', W:'#D7D3E2', w:'#8A5A35' } },
  note:{ rows:['..KKK','..K.K','..K..','..K..','KKK..','KKK..'], pal:{ K:'#302D41' } },
  book:{ rows:['RRRRR','RWWWR','RWLWR','RWWWR','RRRRR'], pal:{ R:'#B4443A', W:'#F6F3F6', L:'#929FD8' } },
};
// 方块小人：头 8×8、身体 8×12、手脚各 4×12，和 Minecraft 皮肤的比例一样。
const FW = 22, FH = 37;
function drawFigure(canvas, member, outfit, pose) {
  canvas.width = FW; canvas.height = FH;
  const ctx = canvas.getContext('2d'), ox = 3, oy = 5, skin = '#F2C9A9';
  const px = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  ctx.clearRect(0, 0, FW, FH);
  px(ox + 4, oy + 20, 4, 10, outfit.pants); px(ox + 8, oy + 20, 4, 10, shade(outfit.pants, -.18));
  px(ox + 4, oy + 30, 4, 2, outfit.shoes); px(ox + 8, oy + 30, 4, 2, shade(outfit.shoes, .1));
  px(ox + 4, oy + 8, 8, 12, outfit.shirt); px(ox + 11, oy + 8, 1, 12, shade(outfit.shirt, -.16));
  px(ox + 6, oy + 8, 4, 1, '#D6A588'); px(ox + 9, oy + 11, 2, 2, outfit.accent); px(ox + 4, oy + 19, 8, 1, shade(outfit.pants, -.35));
  const armDown = x => { px(x, oy + 8, 4, 10, outfit.shirt); px(x + 3, oy + 8, 1, 10, shade(outfit.shirt, -.16)); px(x, oy + 18, 4, 2, skin); };
  armDown(ox);
  if (pose === 'action') { px(ox + 12, oy - 4, 4, 2, skin); px(ox + 12, oy - 2, 4, 10, outfit.shirt); px(ox + 15, oy - 2, 1, 10, shade(outfit.shirt, -.16)); }
  else armDown(ox + 12);
  const pal = { S:skin, M:'#C98A72', W:'#FFFFFF', '.':shade(member.colors.H || '#302D41', 0), ...member.colors };
  member.face.forEach((row, y) => [...row].forEach((ch, x) => ch !== '.' && px(ox + 4 + x, oy + y, 1, 1, x === 7 ? shade(pal[ch] || skin, -.12) : (pal[ch] || skin))));
  if (pose === 'action') {
    const prop = props[outfit.prop];
    prop.rows.forEach((row, y) => [...row].forEach((ch, x) => { if (prop.pal[ch]) px(ox - 2 + x, oy + 15 + y, 1, 1, prop.pal[ch]); }));
  }
}
const castFigures = $('#cast-figures'), castCard = $('#cast-card');
castFigures.innerHTML = crew.map((member, i) => `
  <button class="figure" id="figure-${i}" role="tab" aria-controls="cast-card" aria-selected="false" tabindex="-1" data-cursor="${esc(member.name)}">
    ${member.art ? `<img src="${esc(member.art.idle)}" alt="" aria-hidden="true">` : '<canvas aria-hidden="true"></canvas>'}
    <span class="sr-only">${esc(member.name)} · ${esc(member.role)}</span>
  </button>`).join('');
function setPose(i, pose) {
  const fig = $(`#figure-${i}`), member = crew[i];
  if (member.art) fig.querySelector('img').src = member.art[pose];
  else drawFigure(fig.querySelector('canvas'), member, outfits[i % outfits.length], pose);
}
let crewIndex = -1;
function selectCrew(index, focus = false) {
  if (index === crewIndex) return;
  const prev = crewIndex;
  crewIndex = index;
  if (prev >= 0) setPose(prev, 'idle');
  setPose(index, 'action');
  $$('.figure').forEach((fig, i) => { fig.setAttribute('aria-selected', i === index); fig.tabIndex = i === index ? 0 : -1; });
  const fig = $(`#figure-${index}`);
  fig.classList.remove('is-acting'); void fig.offsetWidth; fig.classList.add('is-acting');
  if (focus) fig.focus();
  const member = crew[index];
  castCard.setAttribute('aria-labelledby', `figure-${index}`);
  castCard.innerHTML = `
    <div class="cast-main">
      <p class="label on-dark">No.${String(index + 1).padStart(2, '0')} · ${esc(member.role)}</p>
      <h3 class="cast-name">${esc(member.name)}</h3>
      <p class="cast-bio">${esc(member.bio)}</p>
    </div>
    <dl class="cast-facts">${member.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
  castCard.classList.remove('is-swapping'); void castCard.offsetWidth; castCard.classList.add('is-swapping');
}
crew.forEach((_, i) => setPose(i, 'idle'));
$$('.figure').forEach((fig, i) => {
  fig.addEventListener('click', () => selectCrew(i));
  fig.addEventListener('keydown', event => {
    const keys = { ArrowRight:i + 1, ArrowDown:i + 1, ArrowLeft:i - 1, ArrowUp:i - 1, Home:0, End:crew.length - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    selectCrew((keys[event.key] + crew.length) % crew.length, true);
  });
});
selectCrew(0);
$('#crew-note').innerHTML = crewIsSample
  ? '<em class="sample">示例</em> 立绘和名单都是占位，在 <code>app.js</code> 的 crew 里换成真实成员。'
  : '点一位邮差，看看他们在忙什么。';

// 窗口：一块边缘碎成像素的椭圆，像 Eastward 那扇手绘的窗，只是换成了方块。
function drawCastBg() {
  const c = $('#cast-bg'), b = 8;
  const w = Math.max(1, Math.ceil(c.clientWidth / b)), h = Math.max(1, Math.ceil(c.clientHeight / b));
  c.width = w; c.height = h;
  const ctx = c.getContext('2d'), rnd = seeded(5);
  const wobble = Array.from({ length:5 }, (_, k) => [.01 + rnd() * .022, rnd() * 6.28, k + 2]);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const nx = (x + .5) / w * 2 - 1, ny = (y + .5) / h * 2 - 1, a = Math.atan2(ny, nx);
    const r = .97 + wobble.reduce((s, [amp, ph, k]) => s + amp * Math.sin(k * a + ph), 0);
    const d = Math.hypot(nx, ny) / r;
    if (d < .92 || (d < 1 && (bayer8[y % 8][x % 8] + .5) / 64 > (d - .92) / .08)) {
      ctx.fillStyle = d < .86 ? '#F1EEE9' : (x + y) % 3 ? '#E6E2DC' : '#F1EEE9';
      ctx.fillRect(x, y, 1, 1);
    }
  }
}
drawCastBg();

// 关于区右侧的「烟」：几团柔和的形状，用 Bayer 抖动压成三档像素色。
function drawSmoke() {
  const c = $('#about-smoke'), b = 6;
  const w = Math.max(1, Math.ceil(c.clientWidth / b)), h = Math.max(1, Math.ceil(c.clientHeight / b));
  c.width = w; c.height = h;
  const ctx = c.getContext('2d'), aspect = w / h;
  const blobs = [[.66, .3, .18], [.8, .45, .24], [.95, .2, .2], [.72, .76, .2], [.9, .84, .22], [.56, .6, .12], [.86, .64, .18], [.62, .12, .12]];
  const tones = ['#2A2238', '#352B47', '#41365A'];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const nx = x / w, ny = y / h;
    let dens = 0;
    for (const [bx, by, br] of blobs) dens = Math.max(dens, 1 - Math.hypot((nx - bx) * aspect, ny - by) / (br * aspect * .62));
    if (dens <= 0) continue;
    const t = (bayer8[y % 8][x % 8] + .5) / 64;
    const level = Math.min(2, Math.floor(dens * 3 + t - .5));
    if (level < 0) continue;
    ctx.fillStyle = tones[level];
    ctx.fillRect(x, y, 1, 1);
  }
}
drawSmoke();

// 招募字幕 ────────────────────────────────────────────────────
const marqueeItems = roles.map(role => `<span>${esc(role)}</span><i></i>`).join('');
$('#marquee').innerHTML = `<div>${marqueeItems}${marqueeItems}</div><div>${marqueeItems}${marqueeItems}</div>`;

// 重新排版时重画画布 ──────────────────────────────────────────
let resizeTimer;
addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (heroImg && hero.classList.contains('is-ready')) { drawBlocks(heroCanvas, heroImg, heroOpts); cacheHero(); drawHero(); }
    drawRedactions(); drawCastBg(); drawSmoke();
  }, 150);
});

// 出现动画 ────────────────────────────────────────────────────
const revealer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('is-in'); revealer.unobserve(entry.target); }
}), { threshold:.2 });
$$('[data-reveal], .work-row, .sec-head, .cast, .pair-art').forEach(el => revealer.observe(el));

// 滚动：页眉状态 + 主视觉视差 ────────────────────────────────
const hdr = $('#hdr');
const lightSections = $$('.works, .join');
let ticking = false;
function onScroll() {
  ticking = false;
  hdr.classList.toggle('is-scrolled', scrollY > 24);
  const light = lightSections.some(el => { const r = el.getBoundingClientRect(); return r.top <= 36 && r.bottom >= 36; });
  hdr.classList.toggle('on-light', light);
  if (!reducedMotion.matches) hero.style.setProperty('--hp', clamp(scrollY / hero.offsetHeight, 0, 1).toFixed(3));
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive:true });
onScroll();
function setMenu(open) {
  $('.menu-toggle').setAttribute('aria-expanded', open);
  $('.menu-toggle').setAttribute('aria-label', open ? '关闭导航' : '打开导航');
  hdr.classList.toggle('menu-open', open);
}
$('.menu-toggle').addEventListener('click', () => setMenu($('.menu-toggle').getAttribute('aria-expanded') !== 'true'));
$$('#main-nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });

// 对齐网格的光标 ──────────────────────────────────────────────
if (finePointer.matches && !reducedMotion.matches) {
  const cursor = $('#cursor'), label = cursor.querySelector('span');
  let cx = -100, cy = -100, tx = -100, ty = -100;
  addEventListener('pointermove', event => { tx = event.clientX; ty = event.clientY; cursor.classList.add('is-on'); }, { passive:true });
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
  document.addEventListener('pointerover', event => {
    const target = event.target.closest('[data-cursor]');
    cursor.classList.toggle('has-label', !!target);
    label.textContent = target ? target.dataset.cursor : '';
  });
  (function loop() {
    cx += (tx - cx) * .3; cy += (ty - cy) * .3;
    cursor.style.transform = `translate(${Math.round(cx / 8) * 8 + 14}px, ${Math.round(cy / 8) * 8 + 14}px)`;
    requestAnimationFrame(loop);
  })();
}
