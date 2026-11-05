// ─────────────────────────────────────────────────────────────
//  寄语 Couriers · 送信路线
//  页面是一条横向的像素路线：往下滚，邮差往右走；停下，他也停下。
//  世界坐标以「格」为单位（1 格 = S 个 CSS 像素），y 从地面往上数。
// ─────────────────────────────────────────────────────────────

// 内容数据 ────────────────────────────────────────────────────
// 营火边的邮差。name 留空时头顶显示「???」；填上名字和 role 就会显示出来。
const crew = [
  { name:'', role:'', cap:'#E8B04A', jacket:'#3E5C4E', x:910, facing:1 },
  { name:'', role:'', cap:'#B4443A', jacket:'#4A3A5E', x:928, facing:1 },
  { name:'', role:'', cap:'#F6F3F6', jacket:'#2F4A6B', x:974, facing:-1 },
  { name:'', role:'', cap:'#E59AB0', jacket:'#5E3A44', x:992, facing:-1 },
];
// 招募方向（文案草稿，按实际在招的岗位删改）。
const roles = ['建筑', '指令', '剧情', '美术', '音乐', '测试'];
// 音符盒的旋律：每敲一下走一个音；带 * 的音会「错位」半音。
const melody = ['E5','G5','A5','G5','E5','D5','C5*','D5','E5','E5','D5','C5','B4*','C5','D5','C5'];

// 世界里各站的位置（格）。
const STOP = { po:76, theater:460, site:748, camp:950, board:1075, end:1196 };
const CLIFF = 1250;
const G = 48;              // 地面以下的厚度（格）
const COURIER_AT = .35;    // 邮差站在屏幕宽度的这个位置

// 工具 ────────────────────────────────────────────────────────
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
function seeded(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const mix = (a, b, t) => {
  const pa = a.match(/\w\w/g).map(h => parseInt(h, 16)), pb = b.match(/\w\w/g).map(h => parseInt(h, 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
};

// 像素精灵 ────────────────────────────────────────────────────
const courierHead = ['...KKKKK....','..KCCCCCK...','..KCCCCCCK..','..KccccccCCK','..KHSSSSSKK.','..KHSSSSESK.','..KHsSSSSSK.','...KsSSSSK..'];
const courierBody = ['...KJJTJJK..','..KJJJJTJJK.','..KjJJJJTJK.','..KjJJJJBBBK','..KJJJJJBWBK','..KJJJJJbbbK','...KPPPPKKK.'];
const legs = {
  idle:['...KPPKPPK..','...KPPKPPK..','...KFFKFFK..'],
  a:['...KPPPPPK..','..KppK.KPPK.','.KFFK...KFFK'],
  b:['....KPPPK...','....KPPK....','....KFFFK...'],
  c:['...KPPPPPK..','..KPPK.KppK.','.KFFK...KFFK'],
};
const courierFrames = ['idle', 'a', 'b', 'c', 'b'].map(k => [...courierHead, ...courierBody, ...legs[k]]);
const courierPalette = { K:'#1A1826', C:'#929FD8', c:'#6E77B6', S:'#F2C9A9', s:'#D6A588', E:'#1A1826', H:'#4A3428', J:'#3B3856', j:'#514E73', T:'#C08A52', B:'#9A6A3E', b:'#74502E', W:'#F6F3F6', P:'#2A2838', p:'#22202F', F:'#2B2433' };
const mailbox = ['....KKKKKKKK....','..KKBBBBBBBBKK..','.KBBLLBBBBBBBBK.','.KBLBBBBBBBBBBK.','KKKKKKKKKKKKKKKK','KDDDDDDDDDDDDDDK','KBBBBBBBBBBBBBBK','KBBKKKKKKKKKKBBK','KBBBBBBBBBBBBBBK','KBLBBBWWWWBBBBBK','KBLBBBWRRWBBBBBK','KBLBBBWWWWBBBBBK','KBLBBBBBBBBBBBBK','KBLBBBBBBBBBBBBK','KBBBBBBBBBBBBBBK','KDDDDDDDDDDDDDDK','KKKKKKKKKKKKKKKK','...KDDDDDDDDK...','...KDDDDDDDDK...','.KKKKKKKKKKKKKK.'];
const mailboxPalette = { K:'#2A2838', D:'#595F91', B:'#929FD8', L:'#D7D3E2', W:'#F6F3F6', R:'#B4443A' };
const fireFrames = [
  ['...R....','...RR...','..RYR...','..RYYR..','.RYWYR..','.RYWWYR.','.RYWWYR.','..RYYR..','BBKBBKBB','KBBKKBBK'],
  ['....R...','...RR...','...RYR..','..RYYR..','..RYWYR.','.RYWWYR.','.RYWWYR.','..RYYR..','BBKBBKBB','KBBKKBBK'],
];
const firePalette = { R:'#D9503A', Y:'#F2A541', W:'#FCE7A6', B:'#6E4A2A', K:'#3A2A20' };

function blit(ctx, map, pal, x, top, flip = false) {
  const w = map[0].length;
  map.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const c = pal[row[i]];
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(x + (flip ? w - 1 - i : i), top + j, 1, 1);
    }
  });
}
function spriteCanvas(map, pal, flip = false) {
  const c = document.createElement('canvas');
  c.width = map[0].length; c.height = map.length;
  blit(c.getContext('2d'), map, pal, 0, 0, flip);
  return c;
}
function pixelDisc(r, fill, edge) {
  const c = document.createElement('canvas'), d = r * 2 + 1;
  c.width = c.height = d;
  const ctx = c.getContext('2d');
  for (let y = 0; y < d; y++) for (let x = 0; x < d; x++) {
    const dist = Math.hypot(x - r, y - r);
    if (dist <= r + .3) { ctx.fillStyle = dist > r - 1.2 && edge ? edge : fill; ctx.fillRect(x, y, 1, 1); }
  }
  return c;
}

// 布局 ────────────────────────────────────────────────────────
const world = $('#world'), stage = $('#stage'), overlay = $('#overlay');
const layers = $$('.layer').map(el => ({ el, f:Number(el.dataset.f) }));
let S = 4, vwU = 360, H = 225, W = 1460, travel = 0;

function paint(canvas, widthU, draw) {
  canvas.width = Math.ceil(widthU);
  canvas.height = H;
  canvas.style.width = `${canvas.width * S}px`;
  canvas.style.height = `${H * S}px`;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const base = H - G;
  // r(x, y, w, h)：左下角在 (x, y)，y 为离地高度（负数在地下）。
  const r = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(base - y - h), Math.round(w), Math.round(h)); };
  draw({ ctx, r, base, width:canvas.width });
}
const layerWidth = f => vwU + (W - vwU) * f;

function layout() {
  const vw = innerWidth, vh = innerHeight;
  S = clamp(Math.min(Math.floor((vh - 100) / 198), Math.floor(vw / 125)), 2, 4);
  vwU = Math.ceil(vw / S);
  H = Math.ceil(vh / S);
  W = Math.ceil(STOP.end + (1 - COURIER_AT) * vwU);
  travel = Math.max(0, W * S - vw);
  world.style.height = `${vh + travel}px`;
  const root = document.documentElement.style;
  root.setProperty('--s', S);
  root.setProperty('--g', G);
  overlay.style.width = `${W * S}px`;
  $('#end').style.setProperty('--x', W - vwU + 6);
  $('#ground-note').style.setProperty('--x', W - vwU + 6);

  paint($('#l-stars'), layerWidth(.04), drawStars);
  paint($('#l-far'), layerWidth(.16), drawFar);
  paint($('#l-mid'), layerWidth(.45), drawMid);
  paint($('#l-main'), W, drawMain);
  paint($('#l-lights'), W, drawLights);
  paint($('#l-fg'), layerWidth(1.3), drawForeground);

  const moon = pixelDisc(6, '#F4E9C1', '#DCCFA6'), sun = pixelDisc(9, '#FCE7A6', '#F6B66A');
  [[$('#moon'), moon], [$('#sun'), sun]].forEach(([el, src]) => {
    el.width = src.width; el.height = src.height;
    el.getContext('2d').drawImage(src, 0, 0);
    el.style.width = el.style.height = `${src.width * S}px`;
  });
  const courier = $('#courier');
  courier.width = 12; courier.height = 18;
  courier.style.left = `${Math.round(vwU * COURIER_AT - 6) * S}px`;
  lastFrame = -1;
  update();
}

// 绘制：天空与远景 ────────────────────────────────────────────
function drawStars({ ctx, width }) {
  const rnd = seeded(3);
  for (let i = 0; i < width * .9; i++) {
    const x = Math.floor(rnd() * width), y = Math.floor(rnd() * (H - G - 40));
    ctx.fillStyle = rnd() > .85 ? '#FCE7A6' : '#D7D3E2';
    ctx.globalAlpha = .35 + rnd() * .65;
    ctx.fillRect(x, y, 1, 1);
    if (rnd() > .94) { ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3); }
  }
  ctx.globalAlpha = 1;
}
function ridge(r, width, seed, min, max, step, color) {
  const rnd = seeded(seed);
  let h = (min + max) / 2, drift = 0;
  for (let x = 0; x < width; x += step) {
    drift = clamp(drift + (rnd() - .5) * 3, -3, 3);
    h = clamp(h + drift, min, max);
    r(x, -G, step, G + Math.round(h / 2) * 2, color);
  }
}
function drawFar({ r, width }) {
  ridge(r, width, 5, 40, 86, 4, '#5D629B');
  ridge(r, width, 9, 16, 48, 3, '#464A82');
}
function drawMid({ r, width }) {
  const rnd = seeded(21);
  for (let x = 4; x < width; x += 10 + Math.floor(rnd() * 26)) {
    if (rnd() > .78) {
      // 远处的小屋：亮着一两扇窗
      const w = 14 + Math.floor(rnd() * 8), h = 10 + Math.floor(rnd() * 6);
      r(x, -G, w, G + h, '#2E3158');
      for (let i = 0; i < w / 2; i++) r(x + i, h + i, w - i * 2, 1, '#2E3158');
      if (rnd() > .3) r(x + 3, 4, 2, 3, '#E8B04A');
      if (rnd() > .5) r(x + w - 6, 5, 2, 3, '#E8B04A');
      x += w;
    } else {
      const h = 14 + Math.floor(rnd() * 22), w = 10 + Math.floor(rnd() * 8);
      r(x + w / 2 - 1, -G, 3, G + h, '#262949');
      r(x, h - 2, w, 10, '#2A2D52');
      r(x + 2, h + 8, w - 4, 4, '#2A2D52');
      r(x + 4, h + 12, w - 8, 2, '#2A2D52');
    }
  }
}

// 绘制：主路线 ────────────────────────────────────────────────
const OL = '#2A2838';
function tree(r, x, h, tint = 0) {
  const leaf = ['#2F5A4A', '#2B5264'][tint], hi = ['#3E6E58', '#386877'][tint], lo = ['#244A3C', '#20414F'][tint];
  r(x + 7, 0, 4, h, '#5A3D30'); r(x + 7, 0, 1, h, '#47302A');
  r(x, h - 2, 18, 10, leaf); r(x + 2, h + 8, 14, 4, leaf); r(x + 5, h + 12, 8, 3, leaf);
  r(x, h - 2, 18, 2, lo); r(x + 2, h + 6, 6, 3, hi); r(x + 5, h + 10, 4, 2, hi);
}
function lamp(r, x) {
  r(x, 0, 2, 26, OL); r(x - 1, 26, 4, 5, OL); r(x, 27, 2, 3, '#F2C46A'); r(x - 2, 31, 6, 1, OL); r(x - 1, 0, 4, 2, OL);
}
function stoneBlock(r, x, y) {
  r(x, y, 8, 8, OL); r(x + 1, y + 1, 7, 7, '#8A8698'); r(x + 1, y + 7, 7, 1, '#A39FB2'); r(x + 7, y + 1, 1, 6, '#6F6B80');
}
function drawMain({ ctx, r, width }) {
  const rnd = seeded(11);
  // 地面
  r(0, -G, CLIFF, G, '#6B4A3A');
  r(0, -G, CLIFF, 20, '#4E4A5E');
  for (let i = 0; i < CLIFF * 4; i++) {
    const x = Math.floor(rnd() * CLIFF), y = -Math.ceil(rnd() * (G - 4)) - 3;
    r(x, y, 1 + (rnd() > .7), 1, y < -G + 20 ? (rnd() > .5 ? '#5C586E' : '#433F52') : (rnd() > .5 ? '#5A3D30' : '#7C5846'));
  }
  r(0, -3, CLIFF, 3, '#5B8A5E'); r(0, -1, CLIFF, 1, '#6F9C6A');
  for (let x = 0; x < CLIFF; x += 2 + Math.floor(rnd() * 5)) r(x, -4 - Math.floor(rnd() * 2), 1, 2, '#5B8A5E');
  for (let x = 6; x < CLIFF; x += 5 + Math.floor(rnd() * 9)) {
    if (rnd() > .55) continue;
    r(x, 0, 1, 1, '#5B8A5E'); r(x, 1, 1, 1, ['#F08DA6', '#F6F3F6', '#E8B04A', '#929FD8'][Math.floor(rnd() * 4)]);
  }
  // 悬崖与海
  for (let i = 0; i < 3; i++) r(CLIFF + i * 2, -G, 2, G - 3 - i * 4, i % 2 ? '#433F52' : '#4E4A5E');
  r(CLIFF, -1, 4, 1, '#6F9C6A');
  r(CLIFF + 6, -G, width, G - 12, '#2E4A7A');
  r(CLIFF + 6, -13, width, 1, '#4D6FA8');
  for (let x = CLIFF + 8; x < width; x += 3 + Math.floor(rnd() * 8)) r(x, -G + 4 + Math.floor(rnd() * (G - 20)), 2 + Math.floor(rnd() * 3), 1, rnd() > .7 ? '#F4C79A' : '#6F8FC4');

  // 树与路灯
  [[-6, 16], [250, 15, 1], [330, 18], [590, 14, 1], [640, 17], [846, 15], [868, 19, 1], [1130, 16], [1226, 14, 1]].forEach(([x, h, t]) => tree(r, x, h, t || 0));
  [20, 300, 622, 860, 1160].forEach(x => lamp(r, x));

  // 邮局
  r(40, 0, 72, 44, OL); r(41, 0, 70, 43, '#E4DEEA'); r(105, 0, 6, 43, '#CFC8DA');
  r(41, 0, 70, 4, '#9A93A8'); r(41, 4, 70, 1, '#7F7891');
  [48, 91].forEach(wx => { r(wx, 15, 13, 13, OL); r(wx + 1, 16, 11, 11, '#F2C46A'); r(wx + 6, 16, 1, 11, OL); r(wx + 1, 21, 11, 1, OL); r(wx - 1, 14, 15, 1, '#9A93A8'); });
  r(66, 0, 20, 4, '#9A93A8'); r(69, 4, 14, 24, OL); r(70, 4, 12, 23, '#3B3856'); r(70, 4, 5, 23, '#454268'); r(79, 15, 1, 2, '#E8B04A');
  r(59, 29, 34, 11, OL); r(60, 30, 32, 9, '#8A5A35');
  r(93, 50, 9, 20, OL); r(94, 50, 7, 19, '#8A8698'); r(92, 69, 11, 2, OL);
  r(34, 43, 84, 2, '#3E4377');
  for (let i = 0; i < 12; i++) { const inset = i * 3, y = 45 + i * 2; r(36 + inset, y, 80 - inset * 2, 2, '#6E77B6'); r(36 + inset, y + 1, 3, 1, '#929FD8'); }
  blit(ctx, mailbox, mailboxPalette, 118, H - G - 20);

  // 音乐厅
  r(394, 0, 132, 2, '#8A8698'); r(397, 2, 126, 2, '#9A93A8');
  r(400, 4, 120, 88, OL); r(401, 4, 118, 87, '#7A1F26');
  [401, 410, 506, 515].forEach(px => { r(px, 4, 4, 87, '#5E161C'); r(px, 4, 1, 87, '#8E2C33'); });
  r(416, 38, 88, 51, '#C8963E'); r(417, 39, 86, 49, '#1A0D10');
  r(426, 28, 68, 6, OL); r(427, 29, 66, 4, '#C8963E'); r(427, 32, 66, 1, '#E8C27A');
  r(446, 4, 28, 24, OL); r(447, 4, 26, 23, '#2A0E12'); r(448, 4, 11, 22, '#4A1418'); r(461, 4, 11, 22, '#4A1418'); r(457, 13, 1, 3, '#E8B04A'); r(462, 13, 1, 3, '#E8B04A');
  r(396, 91, 128, 5, '#C8963E'); r(396, 91, 128, 1, '#8E6A2A'); r(396, 95, 128, 1, '#E8C27A');
  r(400, 96, 120, 4, '#6A1A20');
  for (let i = 0; i < 8; i++) r(436 + i * 3, 100 + i * 2, 48 - i * 6, 2, i % 3 ? '#6A1A20' : '#5E161C');
  const face = pixelDisc(6, '#F2E6C8', '#C8963E');
  ctx.drawImage(face, 454, H - G - 107 - 6);
  r(424, 100, 2, 16, '#3A2A2A'); r(494, 100, 2, 16, '#3A2A2A');

  // 工地：半截石墙、脚手架、塔吊
  [3, 4, 2, 4, 3, 1, 2, 0, 1, 2].forEach((n, i) => { for (let k = 0; k < n; k++) stoneBlock(r, 700 + i * 8, k * 8); });
  [696, 742, 788].forEach(px => r(px, 0, 2, 54, '#8A5A35'));
  [24, 48].forEach(py => r(694, py, 98, 2, '#A8784A'));
  for (let k = 0; k < 22; k++) r(698 + k * 2, 2 + k, 2, 1, '#8A5A35');
  r(806, 0, 4, 94, '#E8B04A'); for (let y = 2; y < 92; y += 4) r(807, y, 2, 2, '#8E6A2A');
  r(758, 92, 64, 3, '#E8B04A'); r(814, 86, 8, 6, '#5A5A6A'); r(806, 94, 4, 4, '#3A3A4A');

  // 营火：长凳、石圈与帐篷
  r(902, 0, 16, 3, '#6E4A2A'); r(902, 3, 16, 1, '#8A5E36'); r(984, 0, 16, 3, '#6E4A2A'); r(984, 3, 16, 1, '#8A5E36');
  [[944, 0], [948, 0], [962, 0], [966, 0]].forEach(([x, y]) => r(x, y, 3, 2, '#8A8698'));
  for (let y = 0; y < 22; y++) {
    const half = Math.round((22 - y) * .75);
    for (let x = 1018 - half; x < 1018 + half; x++) r(x, y, 1, 1, Math.floor((x - 1000) / 3) % 2 ? '#929FD8' : '#F6F3F6');
  }
  for (let y = 0; y < 10; y++) r(1018 - Math.round((10 - y) * .4), y, Math.round((10 - y) * .8) + 1, 1, '#2A2838');

  // 终点邮筒
  blit(ctx, mailbox, mailboxPalette, 1204, H - G - 20);
}
function drawLights({ ctx, base }) {
  ctx.globalCompositeOperation = 'lighter';
  const glow = (x, y, rad, color, alpha) => {
    const g = ctx.createRadialGradient(x, base - y, 0, x, base - y, rad);
    g.addColorStop(0, color + Math.round(alpha * 255).toString(16).padStart(2, '0'));
    g.addColorStop(1, color + '00');
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, base - y - rad, rad * 2, rad * 2);
  };
  [20, 300, 622, 860, 1160].forEach(x => glow(x + 1, 28, 16, '#F2C46A', .45));
  [[54, 21], [97, 21]].forEach(([x, y]) => glow(x, y, 14, '#F2C46A', .35));
  glow(460, 63, 58, '#F2A541', .3); glow(460, 30, 30, '#F2C46A', .4); glow(460, 12, 18, '#F2A541', .3);
  glow(955, 6, 34, '#F2A541', .5);
  glow(808, 96, 5, '#F0505A', .9);
}
function drawForeground({ r, width }) {
  // 近景：零星几丛深色灌木，比路面走得快一点，制造纵深。
  const rnd = seeded(77), c = '#191A30';
  for (let x = 30 + Math.floor(rnd() * 60); x < width; x += 90 + Math.floor(rnd() * 140)) {
    const w = 8 + Math.floor(rnd() * 8), h = 4 + Math.floor(rnd() * 4);
    r(x, -10, w, h + 6, c); r(x + 2, -4 + h, w - 4, 2, c); r(x + 4, -2 + h, w - 8, 1, c);
    if (rnd() > .5) { r(x + w + 1, -10, 1, 9, c); r(x + w, -1, 3, 1, c); }
  }
}

// 营火边的邮差与告示牌 ───────────────────────────────────────
const npcFrames = crew.map(member => {
  const pal = { ...courierPalette, C:member.cap, c:mix(member.cap.slice(1), '302D41', .35), J:member.jacket, j:mix(member.jacket.slice(1), 'FFFFFF', .12), T:member.jacket, B:member.jacket, b:member.jacket, W:member.jacket };
  return spriteCanvas([...courierHead, ...courierBody, ...legs.idle], pal, member.facing < 0);
});
$('#crew').outerHTML = crew.map((member, i) => `
  <span class="npc at" style="--x:${member.x};--y:0;--d:${i * .37}s" ${member.name ? '' : 'aria-hidden="true"'}>
    <span class="nametag">${member.name ? esc(member.name) : '???'}${member.role ? `<small>${esc(member.role)}</small>` : ''}</span>
  </span>`).join('');
$$('.npc').forEach((el, i) => { const c = npcFrames[i]; c.className = 'npc-sprite'; el.prepend(c); });
if (crew.every(member => member.name)) $('#camp-note').textContent = '路过的话，打个招呼。';
$('#slips').innerHTML = roles.map((role, i) => `<li style="--r:${[-3, 2, -1, 3, -2, 1][i % 6]}deg">${esc(role)}</li>`).join('');

const fireSheet = document.createElement('canvas');
fireSheet.width = 16; fireSheet.height = 10;
fireFrames.forEach((frame, i) => blit(fireSheet.getContext('2d'), frame, firePalette, i * 8, 0));
$('.fire').style.backgroundImage = `url(${fireSheet.toDataURL()})`;

// 滚动 → 行走 ────────────────────────────────────────────────
const skyStops = [
  [0, '3D4183', 'D7A6B8', 0, 1],
  [.32, '252858', '6B6AA6', .6, .8],
  [.58, '0E1027', '262A58', 1, .62],
  [.84, '1A1D45', '5A5E9A', .7, .72],
  [1, '4A5594', 'F4C79A', .15, .95],
];
function skyAt(t) {
  let i = 0;
  while (i < skyStops.length - 2 && t > skyStops[i + 1][0]) i++;
  const [t0, top0, bot0, n0, d0] = skyStops[i], [t1, top1, bot1, n1, d1] = skyStops[i + 1];
  const k = clamp((t - t0) / (t1 - t0), 0, 1);
  return { top:mix(top0, top1, k), bottom:mix(bot0, bot1, k), night:n0 + (n1 - n0) * k, dim:d0 + (d1 - d0) * k };
}

const courierCtx = $('#courier').getContext('2d');
let lastPx = 0, facing = 1, lastFrame = -1, idleTimer, delivered = false, queued = false;
function drawCourier(frame) {
  if (frame === lastFrame) return;
  lastFrame = frame;
  courierCtx.clearRect(0, 0, 12, 18);
  blit(courierCtx, courierFrames[frame], courierPalette, 0, 0);
}
function update() {
  queued = false;
  const px = clamp(scrollY - world.offsetTop, 0, travel);
  const t = travel ? px / travel : 0;
  layers.forEach(({ el, f }) => { el.style.transform = `translate3d(${-Math.round(px * f)}px,0,0)`; });

  const sky = skyAt(t);
  stage.style.setProperty('--sky-top', sky.top);
  stage.style.setProperty('--sky-bottom', sky.bottom);
  stage.style.setProperty('--night', sky.night.toFixed(3));
  stage.style.setProperty('--dim', sky.dim.toFixed(3));
  stage.style.setProperty('--fg', clamp((1 - t) / .1, 0, 1).toFixed(3));
  stage.style.setProperty('--hour', `${(t * 360).toFixed(1)}deg`);
  stage.style.setProperty('--minute', `${(t * 360 * 12).toFixed(1)}deg`);
  const moon = $('#moon');
  moon.style.transform = `translate(${Math.round(innerWidth * (.86 - t * .72))}px, ${Math.round(innerHeight * (.34 - Math.sin(t * Math.PI) * .2))}px)`;
  const rise = clamp((t - .84) / .16, 0, 1);
  moon.style.opacity = clamp(sky.night * 1.4 - rise, 0, 1);
  $('#sun').style.transform = `translate(${Math.round(innerWidth * .72)}px, ${Math.round(innerHeight - G * S - rise * innerHeight * .42)}px)`;
  $('#sun').style.opacity = rise;

  // 邮差：滚动多少走多少，往回滚就转身
  const moved = px - lastPx;
  if (Math.abs(moved) > .5) {
    facing = moved > 0 ? 1 : -1;
    drawCourier(1 + Math.floor(Math.abs(px) / (5 * S)) % 4);
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => drawCourier(0), 140);
  } else if (lastFrame < 0) drawCourier(0);
  lastPx = px;
  $('#courier').style.transform = `scaleX(${facing})`;

  const at = px / S + vwU * COURIER_AT;
  stage.classList.toggle('at-theater', at > 396 && at < 540);
  stage.classList.toggle('at-camp', at > 880 && at < 1030);
  $('.trailer-shortcut').classList.toggle('is-tucked', at > 380 && at < 600 || at > 1120);
  const zone = at < 330 ? 'po' : at > 370 && at < 640 ? 'theater' : at > 870 && at < 1035 ? 'camp' : at >= 1035 && at < 1140 ? 'board' : '';
  $$('#main-nav a').forEach(link => link.toggleAttribute('aria-current', link.dataset.stop === zone));
  if (!delivered && at >= STOP.end - 2) deliver();
}
addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive:true });
let resizeTimer;
addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 120); });

function deliver() {
  delivered = true;
  stage.classList.add('is-delivered');
  const letter = $('#letter-fly');
  letter.style.setProperty('--from', `${Math.round(vwU * COURIER_AT) * S}px`);
  letter.style.setProperty('--to', `${(1212 - (W - vwU)) * S}px`);
  letter.classList.remove('is-flying'); void letter.offsetWidth; letter.classList.add('is-flying');
}

// 去某一站：平滑滚动，邮差会一路小跑过去。
function travelTo(stop) {
  const x = STOP[stop] ?? 0;
  const target = world.offsetTop + clamp((x - vwU * COURIER_AT) * S, 0, travel);
  scrollTo({ top:target, behavior:reducedMotion.matches ? 'auto' : 'smooth' });
}
$$('[data-stop]').forEach(el => el.addEventListener('click', event => { event.preventDefault(); setMenu(false); travelTo(el.dataset.stop); }));
document.addEventListener('keydown', event => {
  if (event.target.closest('input, textarea, dialog')) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    scrollBy({ top:(event.key === 'ArrowRight' ? 1 : -1) * 48 * S, behavior:reducedMotion.matches ? 'auto' : 'smooth' });
  }
});

// 页眉纸边与导航 ──────────────────────────────────────────────
const paperHeader = $('.site-header');
function updatePaperEdge() {
  const width = paperHeader.clientWidth, pixel = 4, base = 72;
  const depths = [1,2,2,1,0,1,3,2,1,1,0,2,3,1,2,0,1,2,1,3,2,1,0], runs = [4,2,5,3,2,4,2,3,5,2,3,4,2,5,3,2,4];
  const points = ['0px 0px', `0px ${base + depths[0] * pixel}px`];
  for (let x = 0, step = 0; x < width; step++) {
    const y = base + depths[step % depths.length] * pixel;
    points.push(`${x}px ${y}px`);
    x = Math.min(width, x + runs[step % runs.length] * pixel);
    points.push(`${x}px ${y}px`);
  }
  points.push(`${width}px 0px`);
  paperHeader.style.setProperty('--paper-edge', `polygon(${points.join(',')})`);
}
updatePaperEdge();
new ResizeObserver(updatePaperEdge).observe(paperHeader);
function setMenu(open) {
  $('.menu-toggle').setAttribute('aria-expanded', open);
  $('.menu-toggle').setAttribute('aria-label', open ? '关闭导航' : '打开导航');
  $('#main-nav').classList.toggle('open', open);
}
$('.menu-toggle').addEventListener('click', () => setMenu($('.menu-toggle').getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });

// 音符盒 ──────────────────────────────────────────────────────
const NOTE = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
const freq = name => 440 * 2 ** ((NOTE[name[0]] + (Number(name[1]) + 1) * 12 - 69) / 12);
let audio, step = 0;
function tone(f) {
  audio ??= new (window.AudioContext || window.webkitAudioContext)();
  if (audio.state === 'suspended') audio.resume();
  const t = audio.currentTime, out = audio.createGain();
  out.connect(audio.destination);
  out.gain.setValueAtTime(.0001, t);
  out.gain.exponentialRampToValueAtTime(.2, t + .012);
  out.gain.exponentialRampToValueAtTime(.0001, t + .9);
  [['triangle', 1, 1], ['sine', 2, .3], ['square', 1, .03]].forEach(([type, mult, level]) => {
    const osc = audio.createOscillator(), gain = audio.createGain();
    osc.type = type; osc.frequency.value = f * mult; gain.gain.value = level;
    osc.connect(gain).connect(out); osc.start(t); osc.stop(t + 1);
  });
}
$('#noteblock').addEventListener('click', event => {
  const note = melody[step % melody.length], off = note.endsWith('*');
  tone(freq(note) * (off ? 2 ** (1 / 12) : 1));
  step++;
  const block = event.currentTarget;
  block.classList.remove('is-hit'); void block.offsetWidth; block.classList.add('is-hit');
  if (reducedMotion.matches) return;
  const spark = document.createElement('span');
  spark.className = `note-spark${off ? ' is-off' : ''}`;
  spark.textContent = '♪';
  spark.style.color = ['#E8B04A', '#F08DA6', '#929FD8', '#7FD3A6'][step % 4];
  spark.addEventListener('animationend', () => spark.remove());
  block.append(spark);
});

// 进场：幕布拉开 ──────────────────────────────────────────────
const theater = $('#theater-dialog');
let theaterTrigger;
$('#enter-theater').addEventListener('click', event => {
  theaterTrigger = event.currentTarget;
  document.body.classList.add('modal-open');
  theater.showModal();
  requestAnimationFrame(() => requestAnimationFrame(() => theater.classList.add('is-open')));
});
$('#theater-close').addEventListener('click', () => theater.close());
theater.addEventListener('close', () => {
  theater.classList.remove('is-open');
  document.body.classList.remove('modal-open');
  theaterTrigger?.focus({ preventScroll:true });
});

document.documentElement.classList.add('js');
layout();
