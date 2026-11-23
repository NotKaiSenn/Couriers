import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import {
  BuildProject,
  getTrailerProject,
  HOME_CONFIG,
  HomeConfig,
} from '../data/mockData';
import { OptimizedImage } from './OptimizedImage';
import './TrailerScene.css';

const SCREEN_WIDTH = 202;
const SCREEN_HEIGHT = 144;
const STATIC_FRAMES = 4;
// Keep the tuned picture when returning from a project in the same page load.
let tunedThisPageLoad = false;

interface TrailerSceneProps {
  project?: BuildProject;
  homeConfig?: HomeConfig;
  onOpenProject?: () => void;
  onPrefetchProjectDetail?: () => void;
}

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

export function TrailerScene({
  project,
  homeConfig = HOME_CONFIG,
  onOpenProject,
  onPrefetchProjectDetail,
}: TrailerSceneProps) {
  const trailerProject = project ?? getTrailerProject();
  const displayTitle =
    homeConfig.trailerCustomTitle?.trim() || trailerProject.title;
  const displaySummary =
    homeConfig.trailerCustomSummary?.trim() || trailerProject.summary;
  const videoUrl =
    homeConfig.trailerVideoUrl?.trim() ||
    'https://www.bilibili.com/video/BV1M8NQ6GE8M/';

  const screenRef = useRef<HTMLAnchorElement>(null);
  const staticRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'waiting' | 'tuning' | 'ready'>(
    () => (tunedThisPageLoad ? 'ready' : 'waiting'),
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
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        try {
          const img = screen.querySelector('img');
          if (img) {
            if (!img.complete) img.loading = 'eager';
            await img.decode();
          }
        } catch {
          if (mounted) showTrailer();
          return;
        }
        if (!mounted || tunedThisPageLoad) return;
        if (staticRef.current) drawStatic(staticRef.current);
        tunedThisPageLoad = true;
        setPhase('tuning');
      },
      { rootMargin: '-64px 0px 0px', threshold: 0.25 },
    );
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
    <section
      className="bg-[#F5F6FB] py-14 sm:py-20 lg:py-24"
      aria-label={`《${displayTitle}》预告片`}
    >
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-[minmax(0,36rem)_minmax(0,20rem)] lg:justify-center lg:gap-12 lg:pl-10">
        <div className="postal-tv mx-auto lg:mx-0">
          <div className="relative">
            <a
              ref={screenRef}
              data-phase={phase}
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`在哔哩哔哩观看《${displayTitle}》`}
              className="postal-tv-screen block overflow-hidden bg-[#201e2c] focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-white"
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
                <OptimizedImage
                  src={trailerProject.image}
                  alt=""
                  width={1280}
                  height={720}
                  loading="lazy"
                  sizes="(min-width: 1024px) 520px, 70vw"
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 m-auto grid size-14 place-items-center rounded-md border-2 border-white bg-black/70 text-white sm:size-20">
                  <span
                    aria-hidden="true"
                    className="h-[calc(1.26rem+2px)] w-[calc(1.125rem+2px)] translate-x-px bg-current [clip-path:polygon(0_0,100%_50%,0_100%)] sm:h-[calc(1.68rem+2px)] sm:w-[calc(1.5rem+2px)]"
                  />
                </span>
              </span>
            </a>
            <img
              className="pointer-events-none relative block h-auto w-full select-none [image-rendering:pixelated]"
              src="/images/post-office/television.png"
              alt=""
              width="288"
              height="224"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div
            aria-hidden="true"
            className="mx-auto -mt-1.5 h-4 w-[90%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(44,39,61,0.22)_0%,rgba(44,39,61,0.08)_55%,transparent_76%)]"
          />
        </div>

        <div className="mx-auto w-full max-w-xl text-center lg:mx-0 lg:max-w-none lg:pt-8 lg:text-left">
          <h2 className="text-3xl font-black tracking-tight text-[#333144] sm:text-4xl">
            {displayTitle}
          </h2>
          <p className="mt-4 text-pretty text-sm leading-7 text-[#333144]/75 sm:text-base sm:leading-8">
            {displaySummary}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#333144] bg-[#333144] px-5 py-2.5 text-sm font-bold tracking-wide text-white shadow-md shadow-[#333144]/12 transition hover:border-[#69699F] hover:bg-[#69699F]"
            >
              <span>观看宣传片</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
            {onOpenProject && (
              <button
                type="button"
                onClick={onOpenProject}
                onMouseEnter={onPrefetchProjectDetail}
                onFocus={onPrefetchProjectDetail}
                className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#CFCFE5] bg-white px-5 py-2.5 text-sm font-bold tracking-wide text-[#333144] transition hover:border-[#333144]"
              >
                <span>查看详情</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
