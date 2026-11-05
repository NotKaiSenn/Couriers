// ─────────────────────────────────────────────────────────────
//  内容数据：改文字、换作品、加成员，都只需要改这里。
//  带 sample:true 的条目是示例数据，页面上会显示「示例」标记；
//  换成真实内容后删掉 sample 字段即可。
// ─────────────────────────────────────────────────────────────

const crafts = [
  { icon:'cube',   title:'搭建', en:'BUILD', text:'一砖一瓦，搭出可以走进去的场景。' },
  { icon:'prompt', title:'机制', en:'LOGIC', text:'用指令与数据包，让世界回应你的每一步。' },
  { icon:'book',   title:'叙事', en:'STORY', text:'台词、线索与结局，藏在地图的角落里。' },
  { icon:'note',   title:'声音', en:'SOUND', text:'为每一个场景，配上属于它的旋律。' },
];

// 本期作品的「物流单」。版本和日期公布后替换「待公布」。
const waybill = [
  ['寄件人', '寄语 Couriers'],
  ['收件人', '每一位玩家'],
  ['内件', 'Minecraft 地图'],
  ['游戏版本', '待公布'],
  ['预计送达', '待公布'],
];

// 投递进度：current 是当前所处步骤的序号（从 0 开始）。
const tracking = {
  current: 2,
  steps: [
    { label:'立项', note:'已揽收' },
    { label:'制作', note:'运输中' },
    { label:'公开', note:'现已公开' },
    { label:'测试', note:'待派送' },
    { label:'发布', note:'待签收' },
  ],
};

// 作品档案。有封面图就写 image；没有就用 scene 生成一张像素风景占位。
const archive = [
  { no:'01', title:'沉默乐章：错位音', meta:'2026 · 新作', status:'派送中', image:'./assets/img/cmyz-hero-background-v2.png', href:'https://space.bilibili.com/146080411' },
  { no:'02', title:'雾港来信', meta:'20XX · 剧情解谜', status:'已送达', scene:{ seed:7, palette:'fog' }, sample:true },
  { no:'03', title:'第七号站台', meta:'20XX · 冒险', status:'已送达', scene:{ seed:23, palette:'night' }, sample:true },
  { no:'04', title:'冬眠计划', meta:'20XX · 跑酷', status:'已送达', scene:{ seed:41, palette:'snow' }, sample:true },
];

// 邮差名册。face 是 8×8 像素头像，颜色在 colors 里定义。
const crew = [
  { id:'001', name:'Courier_01', role:'策划', line:'把想法写成一封信。', sample:true,
    face:['HHHHHHHH','HHHHHHHH','HSSHHSSH','SSSSSSSS','GWEGGEWG','SSSSSSSS','SSSMMSSS','SSSSSSSS'],
    colors:{ H:'#302D41', E:'#595F91', G:'#302D41' } },
  { id:'002', name:'Courier_02', role:'建筑', line:'把草图变成方块。', sample:true,
    face:['AAAAAAAA','AYAAAAAA','aaaaaaaa','HSSSSSSH','SWESSEWS','SSSSSSSS','SSSMMSSS','SSSSSSSS'],
    colors:{ H:'#6B4A35', E:'#3F6E4E', A:'#E8B04A', Y:'#F8DE8C', a:'#B9822E' } },
  { id:'003', name:'Courier_03', role:'指令', line:'让世界回应每一步。', sample:true,
    face:['AAAAAAAA','AHHHHHHA','AHSSSSHA','ASSSSSSA','AWESSEWA','ASSSSSSA','ASSMMSSA','ASSSSSSA'],
    colors:{ H:'#2A2638', E:'#7FD3A6', A:'#3E5C4E' } },
  { id:'004', name:'Courier_04', role:'美术', line:'给每封信画上邮票。', sample:true,
    face:['.AAAAA..','AAAAAAA.','HHHHHHHH','HSSSSSSH','SWESSEWS','SSSSSSSS','SSSMMSSS','SSSSSSSS'],
    colors:{ H:'#C98B5A', E:'#7A4B8C', A:'#B4443A' } },
  { id:'005', name:'Courier_05', role:'音乐', line:'为场景谱一段旋律。', sample:true,
    face:['HAAAAAAH','HHHHHHHH','HSSSSSSH','SSSSSSSS','AWESSEWA','ASSSSSSA','SSSMMSSS','SSSSSSSS'],
    colors:{ H:'#E9E4EE', E:'#B4443A', A:'#595F91' } },
  { id:'006', name:'Courier_06', role:'剧情', line:'把结局藏在角落里。', sample:true,
    face:['HHHHHHHH','HHHHHHHH','HHSSSSHH','HSSSSSSH','HWESSEWH','HSSSSSSH','HSSMMSSH','HSSSSSSH'],
    colors:{ H:'#E59AB0', E:'#595F91' } },
];

// 招募方向（文案草稿，按实际在招的岗位删改）。
const routes = [
  { code:'A1', role:'建筑', text:'地形、建筑与室内，一砖一瓦。' },
  { code:'B2', role:'指令', text:'命令方块、数据包与小游戏机制。' },
  { code:'C3', role:'剧情', text:'世界观、台词与分支结局。' },
  { code:'D4', role:'美术', text:'海报、材质包与宣传物料。' },
  { code:'E5', role:'音乐', text:'作曲、编曲与音效设计。' },
  { code:'F6', role:'测试', text:'把每一个 bug 寄回给我们。' },
];

// 页脚信箱里随机掉出来的话。
const mailNotes = [
  '今天也在搭方块。',
  '下一封信，正在路上。',
  '谢谢你读到这里。',
  '记得常回来看看信箱。',
  '这一页，是用方块写成的。',
  '钟摆停下的时候，旋律会悄悄错位。',
];

// ─────────────────────────────────────────────────────────────
//  像素绘制工具
// ─────────────────────────────────────────────────────────────

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);

const ink = { K:'#302D41', D:'#595F91', B:'#929FD8', L:'#D7D3E2', W:'#F6F3F6', R:'#B4443A', Y:'#E8B04A' };

// rows：字符串数组，每个字符对应 palette 里的一个颜色；「.」为透明。
function pixelSVG(rows, palette, className = '') {
  const height = rows.length;
  const width = Math.max(...rows.map(row => row.length));
  let rects = '';
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      const fill = palette[row[x]];
      let run = 1;
      while (row[x + run] === row[x]) run++;
      if (fill) rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${fill}"/>`;
      x += run;
    }
  });
  return `<svg class="${className}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${rects}</svg>`;
}

const icons = {
  cube:['.....KK.....','...KKBBKK...','.KKBBBBBBKK.','KBBBBBBBBBBK','KDDBBBBBBLLK','KDDDDBBLLLLK','KDDDDDLLLLLK','KDDDDDLLLLLK','KDDDDDLLLLLK','.KKDDDLLLKK.','...KKDLKK...','.....KK.....'],
  prompt:['KKKKKKKKKKKK','KLDLDDDDDDDK','KKKKKKKKKKKK','KWWWWWWWWWWK','KWBWWWWWWWWK','KWWBWWWWWWWK','KWWWBWWWWWWK','KWWBWWWWWWWK','KWBWWWBBBBWK','KWWWWWWWWWWK','KWWWWWWWWWWK','KKKKKKKKKKKK'],
  book:['............','.KKKK..KKKK.','KWWWWKKWWWWK','KWLLWKKWLLWK','KWWWWKKWWWWK','KWLLLKKWLLWK','KWWWWKKWWWWK','KWLLWKKWLLLK','KWWWWKKWWWWK','KDDDDKKDDDDK','.KKKKBBKKKK.','.....BB.....'],
  note:['....KKKKKKK.','....KBBBBBK.','....KKKKKKK.','....K.....K.','....K.....K.','....K.....K.','....K.....K.','.KKKK..KKKK.','KBBBK.KBBBK.','KBBBK.KBBBK.','.KKK...KKK..','............'],
};

const mailboxArt = ['....KKKKKKKK....','..KKBBBBBBBBKK..','.KBBLLBBBBBBBBK.','.KBLBBBBBBBBBBK.','KKKKKKKKKKKKKKKK','KDDDDDDDDDDDDDDK','KBBBBBBBBBBBBBBK','KBBKKKKKKKKKKBBK','KBBBBBBBBBBBBBBK','KBLBBBWWWWBBBBBK','KBLBBBWRRWBBBBBK','KBLBBBWWWWBBBBBK','KBLBBBBBBBBBBBBK','KBLBBBBBBBBBBBBK','KBBBBBBBBBBBBBBK','KDDDDDDDDDDDDDDK','KKKKKKKKKKKKKKKK','...KDDDDDDDDK...','...KDDDDDDDDK...','.KKKKKKKKKKKKKK.'];

// 像素邮戳：外圈 + 内圈 + 右侧波浪注销线。
function postmarkSVG() {
  const size = 34, c = 16.5, rows = [];
  for (let y = 0; y < size; y++) {
    let row = '';
    for (let x = 0; x < 66; x++) {
      const d = Math.hypot(x + .5 - c, y + .5 - c);
      let on = d <= 16 && d >= 14.2;
      if (x > 32) on = [9, 16, 23].some(line => y === line + Math.round(Math.sin((x - 33) / 2.6) * 1.4));
      row += on ? 'C' : '.';
    }
    rows.push(row);
  }
  return pixelSVG(rows, { C:'currentColor' }, 'postmark-art');
}

// 可重复的伪随机数，让占位风景每次刷新都一样。
function seeded(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const scenePalettes = {
  fog:   { sky:['#8FA5BA','#B5C5D3','#DCE4EB'], sun:'#FFFFFF', far:'#7C91A6', top:'#93ABBF', ground:'#4F6B84', speck:'#456078', build:'#2E3A4A', glow:'#F4E3B0' },
  night: { sky:['#141629','#22284A','#363C6B'], sun:'#F4E9C1', far:'#2A2F55', top:'#4E5C8E', ground:'#1E2240', speck:'#262B4F', build:'#0E0F1E', glow:'#E8B04A' },
  snow:  { sky:['#AEBDE3','#CBD5EF','#E8EDF8'], sun:'#FFF6D8', far:'#98A6CC', top:'#FFFFFF', ground:'#C6D0E8', speck:'#B3BEDB', build:'#595F91', glow:'#FCE7A6' },
};
const landmarks = { fog:'tower', night:'lamps', snow:'house' };
function sceneSVG({ seed, palette }) {
  const pal = scenePalettes[palette], rnd = seeded(seed), W = 24, H = 30, grid = [];
  for (let y = 0; y < H; y++) grid.push(Array.from({ length:W }, () => pal.sky[y < 9 ? 0 : y < 15 ? 1 : 2]));
  const sx = 3 + Math.floor(rnd() * 16), sy = 3 + Math.floor(rnd() * 4);
  [[1,0],[0,1],[1,1],[2,1],[1,2],[0,0],[2,0],[0,2],[2,2]].slice(0, 9).forEach(([dx,dy], i) => { if (i < 5 || rnd() > .3) grid[sy+dy][sx+dx] = pal.sun; });
  const phase = rnd() * 6;
  for (let x = 0; x < W; x++) {
    const far = 15 + Math.round(Math.sin(x / 3.2 + phase) * 2 + rnd() * .8);
    for (let y = far; y < H; y++) grid[y][x] = pal.far;
  }
  const ground = [];
  for (let x = 0; x < W; x++) ground.push(21 + Math.round(Math.sin(x / 4.5 + phase * 2) * 1.3));
  const landmark = landmarks[palette] || 'tower';
  const tw = landmark === 'house' ? 7 : landmark === 'lamps' ? 13 : 3;
  const tx = 3 + Math.floor(rnd() * (W - tw - 6));
  const base = Math.min(...ground.slice(tx, tx + tw));
  for (let x = tx; x < tx + tw; x++) ground[x] = base;
  const put = (x, y, c) => { if (y >= 0 && y < H && x >= 0 && x < W) grid[y][x] = c; };
  if (landmark === 'tower') {
    // 灯塔：条纹塔身 + 顶部灯室
    for (let y = base - 10; y < base; y++) for (let x = tx; x < tx + 3; x++) put(x, y, (base - y) % 4 < 2 ? pal.build : pal.sky[2]);
    for (let x = tx - 1; x < tx + 4; x++) put(x, base - 11, pal.build);
    put(tx + 1, base - 12, pal.glow); put(tx + 1, base - 13, pal.build);
  } else if (landmark === 'lamps') {
    // 站台：一条长椅般的月台和三盏路灯
    for (let x = tx; x < tx + tw; x++) { put(x, base - 1, pal.build); put(x, base - 2, pal.top); }
    for (const lx of [tx + 1, tx + 6, tx + 11]) { for (let y = base - 7; y < base - 2; y++) put(lx, y, pal.build); put(lx, base - 8, pal.glow); put(lx - 1, base - 8, pal.build); put(lx + 1, base - 8, pal.build); }
  } else {
    // 小屋：阶梯屋顶、亮着的窗和烟囱
    for (let y = base - 4; y < base; y++) for (let x = tx + 1; x < tx + 6; x++) put(x, y, pal.build);
    for (let r = 0; r < 3; r++) for (let x = tx + r; x < tx + tw - r; x++) put(x, base - 5 - r, pal.far === pal.build ? pal.speck : pal.top);
    put(tx + 2, base - 3, pal.glow); put(tx + 4, base - 3, pal.glow);
    put(tx + 5, base - 8, pal.build); put(tx + 5, base - 9, pal.build);
  }
  for (let x = 0; x < W; x++) for (let y = ground[x]; y < H; y++) grid[y][x] = y === ground[x] ? pal.top : rnd() < .14 ? pal.speck : pal.ground;
  let rects = '';
  grid.forEach((row, y) => { for (let x = 0; x < W;) { let run = 1; while (row[x + run] === row[x]) run++; rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${row[x]}"/>`; x += run; } });
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${rects}</svg>`;
}

// 阶梯状的边：给页眉纸边、分区边缘、信封口共用。
function stairs(x0, y0, x1, y1, step) {
  const points = [], count = Math.max(1, Math.round(Math.abs(x1 - x0) / step));
  for (let i = 0; i < count; i++) {
    const xa = x0 + (x1 - x0) * i / count, xb = x0 + (x1 - x0) * (i + 1) / count;
    const y = Math.round((y0 + (y1 - y0) * (i + .5) / count) / 4) * 4;
    points.push(`${xa.toFixed(1)}px ${y}px`, `${xb.toFixed(1)}px ${y}px`);
  }
  return points;
}
function raggedEdge(width, pixel, depths, runs, top, flip) {
  const points = [];
  let x = 0, step = 0;
  while (x < width) {
    const y = flip ? top + depths[step % depths.length] * pixel : top - depths[step % depths.length] * pixel;
    points.push(`${x}px ${y}px`);
    x = Math.min(width, x + runs[step % runs.length] * pixel);
    points.push(`${x}px ${y}px`);
    step++;
  }
  return points;
}

// ─────────────────────────────────────────────────────────────
//  页眉与分区边缘
// ─────────────────────────────────────────────────────────────

const paperHeader = $('.site-header');
const headerDepths = [1,2,2,1,0,1,3,2,1,1,0,2,3,1,2,0,1,2,1,3,2,1,0];
const headerRuns = [4,2,5,3,2,4,2,3,5,2,3,4,2,5,3,2,4];
function updatePaperEdge() {
  const width = paperHeader.clientWidth;
  const style = getComputedStyle(paperHeader);
  const pixel = Number(style.getPropertyValue('--paper-pixel')) || 4;
  const base = Number(style.getPropertyValue('--paper-base')) || 72;
  const points = ['0px 0px', `0px ${base + headerDepths[0] * pixel}px`, ...raggedEdge(width, pixel, headerDepths, headerRuns, base, true), `${width}px 0px`];
  paperHeader.style.setProperty('--paper-edge', `polygon(${points.join(',')})`);
}
updatePaperEdge();
new ResizeObserver(updatePaperEdge).observe(paperHeader);

// 每个 .edge 分区顶部都长出一排像素「纸齿」，图案按顺序错开。
$$('.edge').forEach((section, index) => {
  const depths = headerDepths.slice(index * 3).concat(headerDepths.slice(0, index * 3)).map(d => d + 1);
  const runs = headerRuns.slice(index * 2).concat(headerRuns.slice(0, index * 2));
  const draw = () => {
    const width = section.clientWidth, pixel = 4, height = pixel * 4;
    const points = ['0px 100%', ...raggedEdge(width, pixel, depths, runs, height, false), `${width}px 100%`];
    section.style.setProperty('--edge-path', `polygon(${points.join(',')})`);
  };
  draw();
  new ResizeObserver(draw).observe(section);
});

// ─────────────────────────────────────────────────────────────
//  主视觉滚动
// ─────────────────────────────────────────────────────────────

let scrollQueued = false;
function updateScene() {
  const hero = $('.hero');
  const travel = Math.max(1, hero.offsetHeight - innerHeight);
  const progress = reducedMotion.matches ? 0 : Math.min(1, Math.max(0, scrollY / travel));
  hero.style.setProperty('--progress', progress.toFixed(4));
  scrollQueued = false;
}
addEventListener('scroll', () => {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScene); }
}, { passive:true });
addEventListener('resize', updateScene);
updateScene();

const trailerShortcut = $('.trailer-shortcut');
const overlapping = new Set();
const tuckObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.isIntersecting ? overlapping.add(entry.target) : overlapping.delete(entry.target));
  trailerShortcut.classList.toggle('is-tucked', overlapping.size > 0);
}, { rootMargin:'0px 0px -35% 0px' });
[$('#works'), $('.site-footer')].forEach(el => tuckObserver.observe(el));

// ─────────────────────────────────────────────────────────────
//  导航
// ─────────────────────────────────────────────────────────────

function setMenu(open) {
  $('.menu-toggle').setAttribute('aria-expanded', open);
  $('.menu-toggle').setAttribute('aria-label', open ? '关闭导航' : '打开导航');
  $('#main-nav').classList.toggle('open', open);
}
$('.menu-toggle').addEventListener('click', () => setMenu($('.menu-toggle').getAttribute('aria-expanded') !== 'true'));
$$('#main-nav a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });

// 滚动时高亮当前分区对应的导航。
const navLinks = $$('#main-nav a');
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.toggleAttribute('aria-current', link.hash === `#${entry.target.id}`));
  });
}, { rootMargin:'-45% 0px -50% 0px' });
navLinks.forEach(link => { const target = $(link.hash); if (target) navObserver.observe(target); });
navObserver.observe($('#home'));

// ─────────────────────────────────────────────────────────────
//  渲染内容
// ─────────────────────────────────────────────────────────────

$('#crafts').innerHTML = crafts.map(craft => `
  <li class="craft">
    <span class="craft-icon">${pixelSVG(icons[craft.icon], ink)}</span>
    <div><h3><span>${esc(craft.title)}</span><i>${esc(craft.en)}</i></h3><p>${esc(craft.text)}</p></div>
  </li>`).join('');

$('#waybill').innerHTML = waybill.map(([key, value]) => `<div><dt>${esc(key)}</dt><dd${value === '待公布' ? ' class="pending"' : ''}>${esc(value)}</dd></div>`).join('');

$('#tracking-steps').innerHTML = tracking.steps.map((step, i) => {
  const state = i < tracking.current ? 'done' : i === tracking.current ? 'current' : 'todo';
  return `<li class="step is-${state}"${state === 'current' ? ' aria-current="step"' : ''}><span class="step-dot" aria-hidden="true"></span><b>${esc(step.label)}</b><span>${esc(step.note)}</span></li>`;
}).join('');
$('#tracking-steps').style.setProperty('--done', tracking.current / (tracking.steps.length - 1));

$('#stamp-grid').innerHTML = archive.map((work, i) => {
  const art = work.image
    ? `<img src="${esc(work.image)}" alt="" loading="lazy">`
    : sceneSVG(work.scene);
  const tag = work.href ? 'a' : 'article';
  const link = work.href ? ` href="${esc(work.href)}" target="_blank" rel="noopener noreferrer"` : '';
  return `<${tag} class="stamp${work.image ? ' has-photo' : ''}"${link} style="--tilt:${[-2, 1.5, -1, 2][i % 4]}deg" data-reveal>
    <div class="stamp-paper perf">
      <div class="stamp-art">${art}<span class="stamp-no">No.${esc(work.no)}</span></div>
      <div class="stamp-info"><h3>${esc(work.title)}</h3><p>${esc(work.meta)}</p></div>
    </div>
    <span class="postmark-slot" data-postmark="${esc(work.status)}" data-postmark-color="${work.status === '派送中' ? '#B4443A' : '#595F91'}"></span>
    ${work.sample ? '<span class="sample-tag">示例</span>' : ''}
  </${tag}>`;
}).join('');

$('#crew-grid').innerHTML = crew.map(member => {
  const palette = { S:'#F2C9A9', M:'#C98A72', W:'#FFFFFF', '.':'#D7D3E2', ...member.colors };
  const bars = [...member.id + member.name].map(ch => ch.charCodeAt(0) % 3 + 1);
  return `<li class="crew-card" data-reveal>
    <div class="crew-top"><span>寄语邮政 · 邮差证</span><span>No.${esc(member.id)}</span></div>
    <div class="crew-body">
      <span class="crew-face">${pixelSVG(member.face, palette)}</span>
      <div><h3>${esc(member.name)}</h3><p class="crew-role">${esc(member.role)}</p><p class="crew-line">${esc(member.line)}</p></div>
    </div>
    <div class="crew-foot"><span class="barcode" aria-hidden="true">${bars.map(w => `<i style="width:${w * 2}px"></i>`).join('')}</span><span>COURIER</span></div>
  </li>`;
}).join('');
if (crew.some(member => member.sample)) $('#crew-note').innerHTML = '<span class="sample-tag inline">示例</span> 名册为占位数据，在 <code>app.js</code> 的 crew 里换成真实成员。';
else $('#crew-note').textContent = '每一封信背后，都有人在认真地写。';

$('#routes').innerHTML = routes.map(route => `
  <li class="route"><span class="route-code">${esc(route.code)}</span><div><h3>${esc(route.role)}</h3><p>${esc(route.text)}</p></div><span class="route-stub" aria-hidden="true">线路</span></li>`).join('');

$$('.postmark-slot').forEach(slot => {
  slot.classList.add('postmark');
  slot.style.setProperty('--pm', slot.dataset.postmarkColor);
  slot.innerHTML = `${postmarkSVG()}<span class="postmark-text"><small>COURIERS</small><b>${esc(slot.dataset.postmark)}</b><small>2026</small></span>`;
});

$('#mailbox-art').innerHTML = pixelSVG(mailboxArt, ink);

// ─────────────────────────────────────────────────────────────
//  出现动画与信封
// ─────────────────────────────────────────────────────────────

document.documentElement.classList.add('js');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-in');
    revealObserver.unobserve(entry.target);
  });
}, { threshold:.18 });
$$('[data-reveal]').forEach(el => revealObserver.observe(el));

const envelope = $('#envelope');
new IntersectionObserver((entries, observer) => {
  if (entries.some(entry => entry.isIntersecting)) { envelope.classList.add('is-open'); observer.disconnect(); }
}, { threshold:.35 }).observe(envelope);

// 信封口袋的 V 形开口与背后的翻盖，都按当前宽度画成像素台阶。
function drawEnvelope() {
  const pocket = $('.pocket-shape'), back = $('.envelope-back');
  const w = pocket.clientWidth, h = pocket.clientHeight, v = Math.round(h * .5 / 4) * 4, step = w > 600 ? 16 : 8;
  pocket.style.clipPath = `polygon(${['0px 0px', ...stairs(0, 0, w / 2, v, step), ...stairs(w / 2, v, w, 0, step), `${w}px ${h}px`, `0px ${h}px`].join(',')})`;
  const bw = back.clientWidth, flap = Math.round(bw * .26 / 4) * 4;
  back.style.setProperty('--flap', `${flap}px`);
  back.style.setProperty('--flap-path', `polygon(${['0px ' + flap + 'px', ...stairs(0, flap, bw / 2, 0, step), ...stairs(bw / 2, 0, bw, flap, step), `${bw}px ${flap}px`].join(',')})`);
}
drawEnvelope();
new ResizeObserver(drawEnvelope).observe(envelope);

// ─────────────────────────────────────────────────────────────
//  音符盒：用 Web Audio 合成，不加载任何音频文件。
// ─────────────────────────────────────────────────────────────

const scale = [
  ['Do', 523.25], ['Re', 587.33], ['Mi', 659.25], ['Fa', 698.46],
  ['Sol', 783.99], ['La', 880.00], ['Si', 987.77], ['Do', 1046.50],
];
const drift = [1, -1, 1, 1, -1, 1, -1, -1];
const sparkColors = ['#E8B04A', '#F08DA6', '#929FD8', '#7FD3A6', '#F6F3F6'];
let audio;
function tone(freq) {
  audio ??= new (window.AudioContext || window.webkitAudioContext)();
  if (audio.state === 'suspended') audio.resume();
  const t = audio.currentTime, out = audio.createGain();
  out.connect(audio.destination);
  out.gain.setValueAtTime(.0001, t);
  out.gain.exponentialRampToValueAtTime(.2, t + .012);
  out.gain.exponentialRampToValueAtTime(.0001, t + .9);
  [['triangle', 1, 1], ['sine', 2, .3], ['square', 1, .03]].forEach(([type, mult, level]) => {
    const osc = audio.createOscillator(), gain = audio.createGain();
    osc.type = type; osc.frequency.value = freq * mult; gain.gain.value = level;
    osc.connect(gain).connect(out); osc.start(t); osc.stop(t + 1);
  });
}
const row = $('#noteblock-row');
row.innerHTML = scale.map(([name], i) => `<button class="noteblock" data-i="${i}" style="--drift:${drift[i]}" aria-label="音符 ${name}${i === 7 ? '（高音）' : ''}"><span class="nb-label">${name}</span></button>`).join('');
row.addEventListener('click', event => {
  const block = event.target.closest('.noteblock');
  if (!block) return;
  const i = Number(block.dataset.i), shifted = row.classList.contains('is-shifted');
  tone(scale[i][1] * (shifted ? 2 ** (drift[i] / 12) : 1));
  block.classList.remove('is-hit'); void block.offsetWidth; block.classList.add('is-hit');
  if (reducedMotion.matches) return;
  const spark = document.createElement('span');
  spark.className = 'note-spark';
  spark.textContent = '♪';
  spark.style.color = sparkColors[(i + (shifted ? 2 : 0)) % sparkColors.length];
  spark.style.left = `${block.offsetLeft + block.offsetWidth / 2 + (shifted ? drift[i] * 18 : 0)}px`;
  spark.addEventListener('animationend', () => spark.remove());
  row.append(spark);
});
$('#shift-toggle').addEventListener('click', event => {
  const on = event.currentTarget.getAttribute('aria-pressed') !== 'true';
  event.currentTarget.setAttribute('aria-pressed', on);
  row.classList.toggle('is-shifted', on);
});

// ─────────────────────────────────────────────────────────────
//  页脚信箱
// ─────────────────────────────────────────────────────────────

let lastNote = -1, noteTimer;
$('#mailbox').addEventListener('click', () => {
  let i;
  do { i = Math.floor(Math.random() * mailNotes.length); } while (i === lastNote && mailNotes.length > 1);
  lastNote = i;
  const note = $('#mail-note');
  note.textContent = mailNotes[i];
  note.classList.remove('is-shown'); void note.offsetWidth; note.classList.add('is-shown');
  $('#mailbox').classList.remove('is-shaking'); void $('#mailbox').offsetWidth; $('#mailbox').classList.add('is-shaking');
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => note.classList.remove('is-shown'), 4200);
});
