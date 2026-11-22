export const paradeImage = '/images/post-office/mail-outlined.png';

const artFiles = {
  letterBalloons: '/images/post-office/letter-balloons.png',
  sageBalloon: '/images/post-office/sage-balloon.png',
  sky: '/images/post-office/sky.webp',
  cloud: '/images/post-office/cloud.webp',
  district: '/images/post-office/district.webp',
  steam: '/images/post-office/steam.webp',
  title: '/images/post-office/masthead-outlined.svg',
} as const;

const highPriorityArt = new Set<keyof typeof artFiles>(['district', 'sky', 'title']);

type Artwork = Record<keyof typeof artFiles, HTMLImageElement>;

let cachedArtwork: Artwork | null = null;
let artworkPromise: Promise<Artwork> | null = null;

function loadArtwork(): Promise<Artwork> {
  if (cachedArtwork) return Promise.resolve(cachedArtwork);
  if (artworkPromise) return artworkPromise;

  const entries = (Object.entries(artFiles) as [keyof typeof artFiles, string][]).map(
    async ([name, file]) => {
      const img = new Image();
      img.decoding = 'async';
      if (highPriorityArt.has(name)) {
        img.fetchPriority = 'high';
      }
      img.src = file;
      await img.decode();
      return [name, img] as const;
    }
  );

  artworkPromise = Promise.all(entries)
    .then((images) => {
      cachedArtwork = Object.fromEntries(images) as Artwork;
      return cachedArtwork;
    })
    .catch((err) => {
      artworkPromise = null;
      throw err;
    });

  return artworkPromise;
}
type Frame = { width: number; height: number; samplesPerUnit: number; phonePortrait: boolean };

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const easeTravel = (t: number) => t * t * (3 - 2 * t);

function posterLayout({ width, height, phonePortrait }: Frame) {
  if (phonePortrait) {
    const titleScale = 0.94;
    const districtY = (height - 355 + 86 * titleScale) / 2;
    return { districtY, titleY: districtY + 6 - 86 * titleScale, titleScale };
  }
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
  const travel = easeTravel(progress);
  const { districtY, titleY, titleScale } = posterLayout(frame);
  const snap = (value: number) => Math.round(value * samplesPerUnit) / samplesPerUnit;
  const draw = (img: HTMLImageElement, x: number, y: number, displayWidth: number) => {
    const displayHeight = displayWidth * img.naturalHeight / img.naturalWidth;
    ctx.drawImage(img, snap(x), snap(y), snap(x + displayWidth) - snap(x), snap(y + displayHeight) - snap(y));
  };

  ctx.globalAlpha = 1;
  ctx.fillStyle = '#F5F6FB';
  ctx.fillRect(0, 0, width, height);
  const skyY = Math.max(districtY - 100, Math.min(districtY - 37, height * 0.125 + 53));
  draw(art.sky, center - 178, skyY - travel * height * 0.14, 360);
  draw(art.cloud, center - 69, districtY + 9 - travel * height * 0.27, 153);
  const drawRising = (img: HTMLImageElement, x: number, y: number, baseWidth: number, riseProgress = progress) => {
    const rise = easeTravel(riseProgress);
    draw(img, x + rise * 16, y - rise * height * 1.25, baseWidth * (1 + riseProgress));
  };
  const titleTop = titleY - travel * height * 0.23;
  draw(art.title, center - 128 * titleScale, titleTop - 3 * titleScale, 256 * titleScale);

  drawRising(art.steam, center - 165, districtY + 12, 118);
  draw(art.district, center - 137, districtY - travel * height * 0.65, 284);

  const narrowSky = width < 400;
  const spread = Math.min(center - 5, narrowSky ? 140 : 158);
  const drawBalloon = (img: HTMLImageElement, x: number, baseWidth: number, bottomGap: number, delay = 0) => {
    const spriteHeight = baseWidth * img.naturalHeight / img.naturalWidth;
    const riseProgress = clamp((progress - delay) / (1 - delay));
    drawRising(img, x, height - bottomGap - spriteHeight, baseWidth, riseProgress);
  };
  const sageWidth = narrowSky ? 17 : 22;
  drawBalloon(art.letterBalloons, center - spread, narrowSky ? 23 : 32, 5, 0.14);
  drawBalloon(art.sageBalloon, center + spread - sageWidth, sageWidth, 24);
}

let paradeSeen = false;

export function mountPostalScene(track: HTMLElement, stage: HTMLElement, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce), (max-height: 32rem) and (pointer: fine)');
  let disposed = false;
  let art: Artwork | undefined = cachedArtwork ?? undefined;
  if (art) {
    stage.setAttribute('data-ready', '');
  }
  let layout: Frame = { width: 0, height: 0, samplesPerUnit: 1, phonePortrait: false };
  let start = 0;
  let distance = 1;
  let current = 0;
  let target = 0;
  let paradeStep = paradeSeen ? 5 : 0;
  let paradeStarted = paradeSeen;
  const mascotFadeMs = 220;
  let drawnProgress = -1;
  let frame = 0;
  let lastTime = 0;

  function paint(time: number) {
    frame = 0;
    const elapsed = lastTime ? Math.min(time - lastTime, 64) : 16.67;
    lastTime = time;
    current += (target - current) * (1 - Math.pow(0.93, elapsed / 16.67));
    if (Math.abs(current - target) < 0.0006) current = target;
    const posterProgress = clamp(current / 0.78);
    if (ctx && art && drawnProgress !== posterProgress) {
      drawPoster(ctx, art, posterProgress, layout);
      drawnProgress = posterProgress;
    }
    track.style.setProperty('--poster-opacity', String(1 - clamp((posterProgress - 0.6) / 0.2)));
    track.style.setProperty('--intro-opacity', String(clamp((posterProgress - 0.6) / 0.2)));
    track.toggleAttribute('data-show-intro', reduced.matches || posterProgress > 0.6);
    if (posterProgress >= 0.8 || reduced.matches) paradeStarted = true;
    if (paradeStarted && !paradeSeen) {
      paradeStep = reduced.matches ? 5 : Math.min(5, paradeStep + elapsed / mascotFadeMs);
      paradeSeen = paradeStep === 5;
    }
    track.style.setProperty('--parade-step', String(paradeStep));
    if (current !== target || (paradeStarted && !paradeSeen)) schedule();
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
    if (!width || !height) return;
    const dpr = window.devicePixelRatio || 1;
    const ideal = Math.min(height / 320, width / (width < height ? 233 : 340));
    const devicePixelsPerUnit = Math.max(1, Math.round(ideal * dpr));
    const phonePortrait = width < 640 && width < height;
    // Fit the full illustration and its smoke on portrait phones, independent of display density.
    const unit = phonePortrait ? Math.min(width / 320, height / 465) : devicePixelsPerUnit / dpr;
    // Separate illustration size from raster detail. Each output cell still covers whole device pixels.
    const devicePixelsPerSample = phonePortrait ? 1 : Math.max(1, Math.floor(devicePixelsPerUnit / 3));
    const sampleSize = devicePixelsPerSample / dpr;
    layout = {
      width: Math.ceil(width / unit),
      height: Math.ceil(height / unit),
      samplesPerUnit: unit / sampleSize,
      phonePortrait,
    };
    drawnProgress = -1;
    canvas.width = Math.ceil(width / sampleSize);
    canvas.height = Math.ceil(height / sampleSize);
    canvas.style.width = canvas.width * sampleSize + 'px';
    canvas.style.height = canvas.height * sampleSize + 'px';
    if (ctx) {
      ctx.setTransform(layout.samplesPerUnit, 0, 0, layout.samplesPerUnit, 0, 0);
      ctx.imageSmoothingEnabled = false;
    }

    start = window.scrollY + track.getBoundingClientRect().top - parseFloat(getComputedStyle(track).marginTop);
    distance = 2 * height;
    current = target = reduced.matches ? 0 : clamp((window.scrollY - start) / distance);
    schedule();
  }

  const observer = new ResizeObserver(measure);
  observer.observe(stage);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  reduced.addEventListener('change', measure);
  // A direct #about link can arrive before React mounts the scroll target.
  if (window.location.hash === '#' + track.id && window.scrollY === 0) {
    track.scrollIntoView({ behavior: 'instant' });
  }
  measure();

  if (ctx && !art) {
    loadArtwork().then((images) => {
      if (disposed) return;
      art = images;
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
