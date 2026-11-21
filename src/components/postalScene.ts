export const paradeImage = '/images/post-office/mail-outlined.png';

const artFiles = {
  sky: '/images/post-office/sky.webp',
  cloud: '/images/post-office/cloud.webp',
  district: '/images/post-office/district.webp',
  steam: '/images/post-office/steam.webp',
  title: '/images/post-office/masthead.webp',
} as const;

type Artwork = Record<keyof typeof artFiles, HTMLImageElement>;
type Frame = { width: number; height: number; samplesPerUnit: number };

const clamp = (value: number) => Math.max(0, Math.min(1, value));

function posterLayout(width: number, height: number) {
  const compact = width < 272;
  const districtY = Math.max(height * 0.37, height - 355 + 28);
  const titleScale = compact ? 0.75 : 0.85;
  // Seat the subtitle between the towers.
  const titleBottom = districtY + (compact ? 8 : 20);
  const titleY = titleBottom - 86 * titleScale;
  return { districtY, titleY, titleScale };
}

function drawPoster(ctx: CanvasRenderingContext2D, art: Artwork, progress: number, frame: Frame) {
  const { width, height, samplesPerUnit } = frame;
  const center = Math.round(width / 2);
  const travel = progress * progress * (3 - 2 * progress);
  const { districtY, titleY, titleScale } = posterLayout(width, height);
  const snap = (value: number) => Math.round(value * samplesPerUnit) / samplesPerUnit;
  const draw = (img: HTMLImageElement, x: number, y: number, displayWidth: number) => {
    const displayHeight = displayWidth * img.naturalHeight / img.naturalWidth;
    ctx.drawImage(img, snap(x), snap(y), snap(x + displayWidth) - snap(x), snap(y + displayHeight) - snap(y));
  };

  ctx.globalAlpha = 1;
  ctx.fillStyle = '#cfcfe5';
  ctx.fillRect(0, 0, width, height);
  const skyY = Math.max(districtY - 100, Math.min(districtY - 37, height * 0.125 + 53));
  draw(art.sky, center - 178, skyY - travel * height * 0.14, 360);
  draw(art.cloud, center - 69, districtY + 9 - travel * height * 0.27, 153);
  const titleTop = titleY - travel * height * 0.23;
  ctx.drawImage(art.title, 0, 36, 250, 44, center - 125 * titleScale, snap(titleTop), 250 * titleScale, 44 * titleScale);
  ctx.drawImage(art.title, 94, 0, 62, 32, center - 31 * titleScale, snap(titleTop + 54 * titleScale), 62 * titleScale, 32 * titleScale);

  draw(art.steam, center - 165 + travel * 16, districtY + 12 - travel * height * 1.25, 118 * (1 + progress));
  draw(art.district, center - 137, districtY - travel * height * 0.65, 284);
}

export function mountPostalScene(track: HTMLElement, stage: HTMLElement, canvas: HTMLCanvasElement, intro: HTMLElement) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce), (max-height: 32rem)');
  let disposed = false;
  let art: Artwork | undefined;
  let layout: Frame = { width: 0, height: 0, samplesPerUnit: 1 };
  let start = 0;
  let distance = 1;
  let current = 0;
  let target = 0;
  let paradeStep = 0;
  const mascotFadeMs = 220;
  let frame = 0;
  let lastTime = 0;

  function paint(time: number) {
    frame = 0;
    const elapsed = lastTime ? Math.min(time - lastTime, 64) : 16.67;
    lastTime = time;
    current += (target - current) * (1 - Math.pow(0.93, elapsed / 16.67));
    if (Math.abs(current - target) < 0.0006) current = target;
    const posterProgress = clamp(current / 0.78);
    if (ctx && art) drawPoster(ctx, art, posterProgress, layout);
    track.style.setProperty('--poster-opacity', String(1 - clamp((posterProgress - 0.6) / 0.2)));
    track.style.setProperty('--intro-opacity', String(clamp((posterProgress - 0.8) / 0.2)));
    track.toggleAttribute('data-hide-caption', current > 0.5);
    track.toggleAttribute('data-show-intro', reduced.matches || posterProgress > 0.8);
    const desiredStep = 5 * clamp((Math.min(current, target) - 0.72) / 0.27);
    paradeStep = reduced.matches ? 5 : Math.min(desiredStep, paradeStep + elapsed / mascotFadeMs);
    track.style.setProperty('--parade-step', String(paradeStep));
    if (current !== target || (!reduced.matches && paradeStep < desiredStep)) schedule();
    else lastTime = 0;
  }

  function schedule() {
    if (!frame && !disposed) frame = requestAnimationFrame(paint);
  }

  function onScroll() {
    const next = reduced.matches ? 0 : clamp((window.scrollY - start) / distance);
    if (next === target) return;
    target = next;
    schedule();
  }

  function measure() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    const ideal = Math.min(height / 320, width / (width < height ? 233 : 340));
    const devicePixelsPerUnit = Math.max(1, Math.round(ideal * dpr));
    const unit = devicePixelsPerUnit / dpr;
    // Separate illustration size from raster detail. Each output cell still covers whole device pixels.
    const devicePixelsPerSample = Math.max(1, Math.floor(devicePixelsPerUnit / 3));
    const sampleSize = devicePixelsPerSample / dpr;
    layout = {
      width: Math.ceil(width / unit),
      height: Math.ceil(height / unit),
      samplesPerUnit: devicePixelsPerUnit / devicePixelsPerSample,
    };
    canvas.width = Math.ceil(width / sampleSize);
    canvas.height = Math.ceil(height / sampleSize);
    canvas.style.width = canvas.width * sampleSize + 'px';
    canvas.style.height = canvas.height * sampleSize + 'px';
    if (ctx) {
      ctx.setTransform(layout.samplesPerUnit, 0, 0, layout.samplesPerUnit, 0, 0);
      ctx.imageSmoothingEnabled = false;
    }

    start = window.scrollY + track.getBoundingClientRect().top - (parseFloat(getComputedStyle(stage).top) || 0);
    distance = Math.max(1, intro.offsetTop + height);
    current = target = reduced.matches ? 0 : clamp((window.scrollY - start) / distance);
    schedule();
  }

  const observer = new ResizeObserver(measure);
  observer.observe(stage);
  observer.observe(intro);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  reduced.addEventListener('change', measure);
  measure();

  if (ctx) {
    const entries = Object.entries(artFiles).map(async ([name, file]) => {
      const img = new Image();
      img.src = file;
      await img.decode();
      return [name, img] as const;
    });
    Promise.all(entries).then(images => {
      if (disposed) return;
      art = Object.fromEntries(images) as Artwork;
      schedule();
      stage.setAttribute('data-ready', '');
    }).catch(() => { /* The static poster remains visible if an image cannot load. */ });
  }
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', measure);
    reduced.removeEventListener('change', measure);
  };
}
