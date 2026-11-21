import { useCallback, useEffect, useRef, useState } from 'react';
import './TrailerScene.css';

const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 144;
const STATIC_FRAMES = 4;
// Keep the tuned picture when returning from a project in the same page load.
let tunedThisPageLoad = false;

function drawStatic(strip: HTMLCanvasElement) {
  const context = strip.getContext('2d');
  if (!context) return;

  const frame = context.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
  for (let i = 0; i < STATIC_FRAMES; i++) {
    for (let y = 0; y < SCREEN_HEIGHT; y++) {
      const scan = (y + 37 * i) % SCREEN_HEIGHT;
      const trackingBand = scan < 4 ? 40 : scan < 16 ? -24 : 0;
      const rowLevel = 38 + trackingBand + (y % 3 === 0 ? -12 : 0);
      for (let x = 0; x < SCREEN_WIDTH; x++) {
        const offset = (y * SCREEN_WIDTH + x) * 4;
        const value = rowLevel + Math.random() * 110;
        frame.data[offset] = value;
        frame.data[offset + 1] = value + 2;
        frame.data[offset + 2] = value + 17;
        frame.data[offset + 3] = 255;
      }
    }
    context.putImageData(frame, i * SCREEN_WIDTH, 0);
  }
}

export function TrailerScene() {
  const screenRef = useRef<HTMLAnchorElement>(null);
  const staticRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'waiting' | 'tuning' | 'ready'>(
    () => tunedThisPageLoad ? 'ready' : 'waiting',
  );
  const showTrailer = useCallback(() => {
    tunedThisPageLoad = true;
    setPhase('ready');
  }, []);

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen || tunedThisPageLoad) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches || !window.IntersectionObserver) {
      showTrailer();
      return;
    }

    let mounted = true;
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      try {
        await screen.querySelector('img')?.decode();
      } catch {
        if (mounted) showTrailer();
        return;
      }
      if (!mounted || tunedThisPageLoad) return;
      if (staticRef.current) drawStatic(staticRef.current);
      tunedThisPageLoad = true;
      setPhase('tuning');
    }, { rootMargin: '-64px 0px 0px', threshold: 0.25 });
    observer.observe(screen);

    const onMotionChange = () => {
      if (reducedMotion.matches) {
        observer.disconnect();
        showTrailer();
      }
    };
    reducedMotion.addEventListener('change', onMotionChange);
    return () => {
      mounted = false;
      observer.disconnect();
      reducedMotion.removeEventListener('change', onMotionChange);
    };
  }, [showTrailer]);

  return (
    <section className="bg-[#F5F6FB] px-4 pt-6 pb-14 sm:px-6 sm:pt-10 sm:pb-20" aria-label="《沉默乐章：错位音》预告片">
      <div className="postal-tv relative mx-auto">
        <a
          ref={screenRef}
          data-phase={phase}
          href="https://www.bilibili.com/video/BV1M8NQ6GE8M/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="在哔哩哔哩观看《沉默乐章：错位音》"
          className="postal-tv-screen block aspect-video overflow-hidden bg-[#201e2c] focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-white"
          onFocus={showTrailer}
        >
          {phase !== 'ready' && (
            <canvas
              ref={staticRef}
              className="trailer-static"
              aria-hidden="true"
              width={SCREEN_WIDTH * STATIC_FRAMES}
              height={SCREEN_HEIGHT}
            />
          )}
          <span className="trailer-picture absolute inset-0" onAnimationEnd={showTrailer}>
            <img
              src="/images/7B72BE4F12172E88A363666AF76CA9B7.png"
              alt=""
              width="1280"
              height="720"
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 m-auto grid size-14 place-items-center rounded-md border-2 border-white bg-black/70 text-white sm:size-20">
              <span aria-hidden="true" className="h-[calc(1.26rem+2px)] w-[calc(1.125rem+2px)] translate-x-px bg-current [clip-path:polygon(0_0,100%_50%,0_100%)] sm:h-[calc(1.68rem+2px)] sm:w-[calc(1.5rem+2px)]" />
            </span>
          </span>
        </a>
        <img
          className="pointer-events-none relative block h-auto w-full select-none [image-rendering:pixelated]"
          src="/images/post-office/television.png"
          alt=""
          width="342"
          height="224"
        />
      </div>
    </section>
  );
}
