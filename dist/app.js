// ─────────────────────────────────────────────────────────────
//  寄语 Couriers
//  像素在这里是「材质」：图片从方块解析成高清，鼠标下的画面变回方块，
//  区块之间用抖动像素过渡，未公开的作品打上马赛克。
// ─────────────────────────────────────────────────────────────

// 内容数据 ────────────────────────────────────────────────────
// 作品索引。status：live 已公开 / wip 制作中 / hidden 未公开（标题与封面打码）。
// 带 sample:true 的是占位数据，换成真实作品后删掉。
const works = [
  { no:'01', title:'沉默乐章：错位音', kind:'Minecraft 地图', year:'2026', status:'live', href:'#feature', image:'./assets/img/cmyz-hero-background-v2.png', focus:[.52, .45], zoom:1.6 },
  { no:'02', title:'', redact:5, kind:'—', year:'—', status:'hidden', sample:true },
  { no:'03', title:'', redact:3, kind:'—', year:'—', status:'hidden', sample:true },
];
const statusText = { live:'现已公开', wip:'制作中', hidden:'未公开' };

// 新作的规格表。公布后把「待公布」换掉。
const specs = [['类型', 'Minecraft 地图'], ['游戏版本', '待公布'], ['游玩人数', '待公布'], ['发布时间', '待公布']];

// 新作的细节图：都是从主视觉里裁出来的局部。focus 是焦点位置（0–1），zoom 是放大倍数。
const shots = [
  { cap:'FIG.01 — 观众席', focus:[.62, .38], zoom:2.1, shape:'wide' },
  { cap:'FIG.02 — 落地钟', focus:[.52, .44], zoom:3.4, shape:'tall' },
  { cap:'FIG.03 — 唱片与音符', focus:[.33, .3], zoom:3.2, shape:'square' },
];

// 成员（示例）。face 是 8×8 像素头像，字母对应 colors。
const crew = [
  { name:'成员 01', role:'策划', line:'把想法写成一封信。', face:['HHHHHHHH','HHHHHHHH','HSSHHSSH','SSSSSSSS','GWEGGEWG','SSSSSSSS','SSSMMSSS','SSSSSSSS'], colors:{ H:'#302D41', E:'#595F91', G:'#302D41' } },
  { name:'成员 02', role:'建筑', line:'把草图变成方块。', face:['AAAAAAAA','AYAAAAAA','aaaaaaaa','HSSSSSSH','SWESSEWS','SSSSSSSS','SSSMMSSS','SSSSSSSS'], colors:{ H:'#6B4A35', E:'#3F6E4E', A:'#E8B04A', Y:'#F8DE8C', a:'#B9822E' } },
  { name:'成员 03', role:'指令', line:'让世界回应每一步。', face:['AAAAAAAA','AHHHHHHA','AHSSSSHA','ASSSSSSA','AWESSEWA','ASSSSSSA','ASSMMSSA','ASSSSSSA'], colors:{ H:'#2A2638', E:'#7FD3A6', A:'#3E5C4E' } },
  { name:'成员 04', role:'美术', line:'给每封信画上邮票。', face:['.AAAAA..','AAAAAAA.','HHHHHHHH','HSSSSSSH','SWESSEWS','SSSSSSSS','SSSMMSSS','SSSSSSSS'], colors:{ H:'#C98B5A', E:'#7A4B8C', A:'#B4443A' } },
  { name:'成员 05', role:'音乐', line:'为场景谱一段旋律。', face:['HAAAAAAH','HHHHHHHH','HSSSSSSH','SSSSSSSS','AWESSEWA','ASSSSSSA','SSSMMSSS','SSSSSSSS'], colors:{ H:'#E9E4EE', E:'#B4443A', A:'#595F91' } },
  { name:'成员 06', role:'剧情', line:'把结局藏在角落里。', face:['HHHHHHHH','HHHHHHHH','HHSSSSHH','HSSSSSSH','HWESSEWH','HSSSSSSH','HSSMMSSH','HSSSSSSH'], colors:{ H:'#E59AB0', E:'#595F91' } },
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
document.documentElement.classList.add('js');

// 方块画布 ────────────────────────────────────────────────────
// 把图片按 object-fit: cover 画进画布；block > 1 时先缩小再用最近邻放大，得到方块效果。
function sourceRect(img, w, h, [fx, fy] = [.5, .5], zoom = 1) {
  let sw = img.naturalWidth / zoom, sh = sw * h / w;
  if (sh > img.naturalHeight / zoom) { sh = img.naturalHeight / zoom; sw = sh * w / h; }
  return [clamp(fx * img.naturalWidth - sw / 2, 0, img.naturalWidth - sw), clamp(fy * img.naturalHeight - sh / 2, 0, img.naturalHeight - sh), sw, sh];
}
const scratch = document.createElement('canvas');
function drawBlocks(canvas, img, { focus, zoom, block = 1, dim = 1 } = {}) {
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
  } else {
    const bw = Math.max(1, Math.ceil(w / block)), bh = Math.max(1, Math.ceil(h / block));
    scratch.width = bw; scratch.height = bh;
    const sctx = scratch.getContext('2d');
    sctx.imageSmoothingEnabled = true;
    sctx.drawImage(img, sx, sy, sw, sh, 0, 0, bw, bh);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(scratch, 0, 0, bw, bh, 0, 0, bw * block * dpr, bh * block * dpr);
  }
  if (dim < 1) { ctx.fillStyle = `rgba(18,17,24,${1 - dim})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
}
const resolveSteps = [40, 24, 14, 8, 4, 2, 1];
async function resolveIn(canvas, img, opts, steps = resolveSteps) {
  const token = (canvas._token = (canvas._token || 0) + 1);
  if (reducedMotion.matches) { drawBlocks(canvas, img, { ...opts, block:1 }); return; }
  for (const block of steps) {
    if (canvas._token !== token) return;
    drawBlocks(canvas, img, { ...opts, block });
    await wait(block > 8 ? 70 : 55);
  }
}
const optsOf = el => ({
  focus:(el.dataset.focus || '.5,.5').split(',').map(Number),
  zoom:Number(el.dataset.zoom || 1),
  dim:Number(el.dataset.dim || 1),
});

// 主视觉 + 方块视图透镜 ──────────────────────────────────────
const hero = $('.hero'), heroCanvas = $('#hero-canvas'), lensTag = $('#lens-tag');
const heroOpts = { focus:[.5, .5], zoom:1 };
const sharp = document.createElement('canvas'), coarse = document.createElement('canvas');
let heroImg, lens = null, lensQueued = false;
const LENS_BLOCK = 12, LENS_SIZE = 14;
function cacheHero() {
  // 用离屏画布缓存高清与方块两份，移动透镜时只做拷贝。
  sharp.width = heroCanvas.width; sharp.height = heroCanvas.height;
  sharp.getContext('2d').drawImage(heroCanvas, 0, 0);
  const w = heroCanvas.clientWidth, h = heroCanvas.clientHeight;
  coarse.width = Math.ceil(w / LENS_BLOCK); coarse.height = Math.ceil(h / LENS_BLOCK);
  const cctx = coarse.getContext('2d');
  cctx.imageSmoothingEnabled = true;
  cctx.drawImage(sharp, 0, 0, sharp.width, sharp.height, 0, 0, coarse.width, coarse.height);
}
function drawHero() {
  lensQueued = false;
  const ctx = heroCanvas.getContext('2d');
  ctx.drawImage(sharp, 0, 0);
  if (!lens) return;
  const dpr = heroCanvas.width / heroCanvas.clientWidth;
  const size = LENS_BLOCK * LENS_SIZE;
  const bx = Math.round(lens.x / LENS_BLOCK - LENS_SIZE / 2), by = Math.round(lens.y / LENS_BLOCK - LENS_SIZE / 2);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(coarse, bx, by, LENS_SIZE, LENS_SIZE, bx * LENS_BLOCK * dpr, by * LENS_BLOCK * dpr, size * dpr, size * dpr);
  ctx.strokeStyle = 'rgba(246,243,246,.9)';
  ctx.lineWidth = 2 * dpr;
  ctx.strokeRect(bx * LENS_BLOCK * dpr + dpr, by * LENS_BLOCK * dpr + dpr, size * dpr - 2 * dpr, size * dpr - 2 * dpr);
  lensTag.style.transform = `translate(${bx * LENS_BLOCK}px, ${(by + LENS_SIZE) * LENS_BLOCK + 8}px)`;
}
async function startHero() {
  heroImg = await loadImage(heroCanvas.dataset.src);
  hero.classList.add('is-loaded');
  await resolveIn(heroCanvas, heroImg, heroOpts, [64, 40, 24, 14, 8, 4, 2, 1]);
  cacheHero();
  hero.classList.add('is-ready');
}
startHero();
hero.addEventListener('pointermove', event => {
  if (!finePointer.matches || !hero.classList.contains('is-ready') || event.target.closest('a, button')) { if (lens) { lens = null; hero.classList.remove('has-lens'); drawHero(); } return; }
  const rect = heroCanvas.getBoundingClientRect();
  lens = { x:event.clientX - rect.left, y:event.clientY - rect.top };
  hero.classList.add('has-lens');
  if (!lensQueued) { lensQueued = true; requestAnimationFrame(drawHero); }
});
hero.addEventListener('pointerleave', () => { lens = null; hero.classList.remove('has-lens'); if (hero.classList.contains('is-ready')) drawHero(); });

// 进入视口时从方块解析 ────────────────────────────────────────
function mountResolvers(root = document) {
  const observer = new IntersectionObserver(entries => entries.forEach(async entry => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);
    const img = await loadImage(entry.target.dataset.src);
    entry.target._img = img;
    resolveIn(entry.target, img, optsOf(entry.target));
  }), { threshold:.25 });
  root.querySelectorAll('canvas[data-resolve]').forEach(c => observer.observe(c));
}

// 抖动像素过渡（4×4 Bayer 矩阵） ─────────────────────────────
const bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
$$('.dither').forEach(strip => {
  const rows = 12, c = document.createElement('canvas');
  c.width = 4; c.height = rows;
  const ctx = c.getContext('2d');
  for (let y = 0; y < rows; y++) for (let x = 0; x < 4; x++) {
    ctx.fillStyle = (y + .5) / rows > (bayer[y % 4][x] + .5) / 16 ? strip.dataset.to : strip.dataset.from;
    ctx.fillRect(x, y, 1, 1);
  }
  strip.style.backgroundImage = `url(${c.toDataURL()})`;
});

// 像素小工具 ──────────────────────────────────────────────────
function pixelCanvas(rows, palette) {
  const c = document.createElement('canvas');
  c.width = rows[0].length; c.height = rows.length;
  const ctx = c.getContext('2d');
  rows.forEach((row, y) => [...row].forEach((ch, x) => { const fill = palette[ch]; if (fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, 1, 1); } }));
  return c;
}
// 未公开作品的「信号」：随机方块，偶尔闪一下。
function noiseBlocks(canvas, seed) {
  const w = canvas.clientWidth, h = canvas.clientHeight, b = 20;
  canvas.width = Math.ceil(w / b); canvas.height = Math.ceil(h / b);
  const ctx = canvas.getContext('2d'), pal = ['#1C1A24', '#24222F', '#302D41', '#3B3856', '#595F91', '#929FD8'];
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
    const v = rnd(), light = (x + y) / (canvas.width + canvas.height);
    ctx.fillStyle = pal[Math.min(pal.length - 1, Math.floor(v * v * pal.length * (0.6 + light)))];
    ctx.fillRect(x, y, 1, 1);
  }
}

// 渲染：作品索引 ──────────────────────────────────────────────
const live = works.filter(w => w.status === 'live').length;
$('#works-count').textContent = `(${String(works.length).padStart(2, '0')}) 已公开 ${live} · 未公开 ${works.length - live}`;
$('#work-list').innerHTML = works.map((work, i) => {
  const title = work.status === 'hidden'
    ? `<canvas class="redact" style="--n:${work.redact}" data-n="${work.redact}" data-seed="${i * 977 + 13}" role="img" aria-label="未公开作品"></canvas>`
    : esc(work.title);
  const tag = work.href ? 'a' : 'div';
  const attrs = work.href ? ` href="${esc(work.href)}" data-cursor="查看 →"` : ' data-cursor="未公开"';
  return `<li class="work-row is-${work.status}" data-index="${i}">
    <${tag} class="work-link"${attrs}>
      <span class="wr-no">${esc(work.no)}</span>
      <span class="wr-title">${title}</span>
      <span class="wr-kind">${esc(work.kind)}${work.sample ? ' <em class="sample">示例</em>' : ''}</span>
      <span class="wr-year">${esc(work.year)}</span>
      <span class="wr-status"><i aria-hidden="true"></i>${statusText[work.status]}</span>
      <span class="wr-arrow" aria-hidden="true">→</span>
    </${tag}>
  </li>`;
}).join('');

// 未公开作品的标题：一条按字切开的马赛克。
function drawRedactions() {
  $$('canvas.redact').forEach(c => {
    const n = Number(c.dataset.n), block = 6;
    c.width = Math.max(1, Math.ceil(c.clientWidth / block));
    c.height = Math.max(1, Math.ceil(c.clientHeight / block));
    const ctx = c.getContext('2d'), per = c.width / n;
    let s = Number(c.dataset.seed);
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    ctx.clearRect(0, 0, c.width, c.height);
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
let pv = { x:0, y:0, tx:0, ty:0, on:false }, pvRunning = false, noiseTimer;
function previewLoop() {
  pv.x += (pv.tx - pv.x) * .18; pv.y += (pv.ty - pv.y) * .18;
  preview.style.transform = `translate(${Math.round(pv.x / 4) * 4}px, ${Math.round(pv.y / 4) * 4}px)`;
  if (pv.on || Math.abs(pv.tx - pv.x) > .5) requestAnimationFrame(previewLoop); else pvRunning = false;
}
$$('.work-row').forEach(row => {
  const work = works[Number(row.dataset.index)];
  row.addEventListener('pointerenter', async event => {
    if (!finePointer.matches) return;
    pv.on = true; pv.tx = pv.x = event.clientX + 24; pv.ty = pv.y = event.clientY - 160;
    preview.classList.add('is-on');
    preview.classList.toggle('is-hidden-work', work.status === 'hidden');
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
  row.addEventListener('pointermove', event => { pv.tx = event.clientX + 24; pv.ty = event.clientY - 160; });
  row.addEventListener('pointerleave', () => { pv.on = false; preview.classList.remove('is-on'); clearInterval(noiseTimer); });
});

// 渲染：新作 ──────────────────────────────────────────────────
$('#specs').innerHTML = specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd${v === '待公布' ? ' class="pending"' : ''}>${esc(v)}</dd></div>`).join('');
$('#feature-shots').innerHTML = shots.map(shot => `
  <figure class="shot is-${shot.shape}">
    <canvas data-resolve data-src="./assets/img/cmyz-hero-background-v2.png" data-focus="${shot.focus.join(',')}" data-zoom="${shot.zoom}" aria-hidden="true"></canvas>
    <figcaption>${esc(shot.cap)}</figcaption>
  </figure>`).join('');

// 渲染：成员 ──────────────────────────────────────────────────
$('#crew-list').innerHTML = crew.map((member, i) => `
  <li class="crew-row" data-reveal>
    <span class="crew-no">${String(i + 1).padStart(2, '0')}</span>
    <span class="crew-face" data-face="${i}"></span>
    <span class="crew-name">${esc(member.name)}</span>
    <span class="crew-role">${esc(member.role)}</span>
    <span class="crew-line">${esc(member.line)}</span>
  </li>`).join('');
$$('.crew-face').forEach(slot => {
  const member = crew[Number(slot.dataset.face)];
  slot.append(pixelCanvas(member.face, { S:'#F2C9A9', M:'#C98A72', W:'#FFFFFF', '.':'#D7D3E2', ...member.colors }));
});
$('#crew-note').innerHTML = crewIsSample
  ? '<em class="sample">示例</em> 名单为占位数据，在 <code>app.js</code> 的 crew 里换成真实成员。'
  : '每一封信背后，都有人在认真地写。';

// 渲染：招募字幕 ──────────────────────────────────────────────
const marqueeItems = roles.map(role => `<span>${esc(role)}</span><i></i>`).join('');
$('#marquee').innerHTML = `<div>${marqueeItems}${marqueeItems}</div><div>${marqueeItems}${marqueeItems}</div>`;

mountResolvers();

// 预告片封面：平时是粗方块，鼠标移上去才「加载」成高清。
const trailer = $('.trailer'), trailerCanvas = $('#trailer-canvas');
const trailerOpts = optsOf(trailerCanvas);
loadImage(trailerCanvas.dataset.src).then(img => {
  trailerCanvas._img = img;
  drawBlocks(trailerCanvas, img, { ...trailerOpts, block:22 });
  trailerCanvas._block = 22;
  const sharpen = () => { trailerCanvas._block = 1; resolveIn(trailerCanvas, img, trailerOpts, [14, 8, 4, 2, 1]); };
  const blur = () => { trailerCanvas._block = 22; resolveIn(trailerCanvas, img, trailerOpts, [4, 8, 14, 22]); };
  if (finePointer.matches) {
    trailer.addEventListener('pointerenter', sharpen);
    trailer.addEventListener('pointerleave', blur);
    trailer.addEventListener('focus', sharpen);
    trailer.addEventListener('blur', blur);
  } else {
    new IntersectionObserver((entries, io) => { if (entries[0].isIntersecting) { sharpen(); io.disconnect(); } }, { threshold:.5 }).observe(trailer);
  }
});

// 重新排版时重画画布 ──────────────────────────────────────────
let resizeTimer;
addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (heroImg && hero.classList.contains('is-ready')) { drawBlocks(heroCanvas, heroImg, heroOpts); cacheHero(); drawHero(); }
    $$('canvas[data-resolve]').forEach(c => { if (c._img) drawBlocks(c, c._img, optsOf(c)); });
    if (trailerCanvas._img) drawBlocks(trailerCanvas, trailerCanvas._img, { ...trailerOpts, block:trailerCanvas._block });
    drawRedactions();
  }, 150);
});

// 出现动画 ────────────────────────────────────────────────────
const revealer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('is-in'); revealer.unobserve(entry.target); }
}), { threshold:.2 });
$$('[data-reveal], .work-row, .shot, .feature-head, .join-title').forEach(el => revealer.observe(el));

// 页眉 ────────────────────────────────────────────────────────
const hdr = $('#hdr');
const lightSections = $$('.about, .works, .crew, .join');
let ticking = false;
function onScroll() {
  ticking = false;
  hdr.classList.toggle('is-scrolled', scrollY > 24);
  // 页眉下方是浅色区块时，换成浅色毛玻璃和深色标志。
  const light = lightSections.some(el => { const r = el.getBoundingClientRect(); return r.top <= 36 && r.bottom >= 36; });
  hdr.classList.toggle('on-light', light);
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
// 系统光标照常显示；旁边跟一个按 8px 网格跳动的小方块，悬停链接时展开成标签。
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
