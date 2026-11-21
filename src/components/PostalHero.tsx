import { useId, useLayoutEffect, useRef } from 'react';
import { mountPostalScene, paradeImage } from './postalScene';
import { PixelDivider } from './PixelDivider';
import { TrailerScene } from './TrailerScene';
import './PostalHero.css';

// Native 490 × 236 sheet coordinates follow the gaps around the scarf, wings and shadows.
const paradeParts = [
  'M0 0H210V141H194V148H156V236H0Z',
  'M210 0H254V215H247V236H156V148H194V141H210Z',
  'M254 0H338V201H351V236H247V215H254Z',
  'M338 0H425V195H490V236H351V201H338Z',
  'M425 0H490V195H425Z',
];

export function PostalHero() {
  const sheetId = useId();
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (track && stage && canvas) return mountPostalScene(track, stage, canvas);
  }, []);

  return (
    <section ref={trackRef} id="about" className="postal-hero" aria-labelledby="postal-next-stop">
      <div className="postal-intro-track">
        <div className="postal-pin">
          <section ref={stageRef} className="postal-stage" aria-labelledby="postal-title">
            <h1 id="postal-title" className="sr-only">寄语 Couriers</h1>
            <div className="postal-poster" aria-hidden="true">
              <div className="postal-fallback">
                <img
                  src="/images/post-office/masthead-outlined.svg"
                  alt=""
                  width="256"
                  height="92"
                  decoding="async"
                  fetchPriority="high"
                />
              </div>
              <canvas ref={canvasRef} />
            </div>
          </section>
          <div className="postal-intro">
            <div className="postal-story mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2">
              <div>
                <h2 id="postal-next-stop" className="text-4xl font-black leading-tight tracking-wider sm:text-6xl">
                  <span className="block">下一站...</span>
                  <span className="mt-2 block pl-14 sm:mt-3 sm:pl-32">寄语！</span>
                </h2>
                <p className="mt-8 max-w-xl text-base leading-8 text-[#CFCFE5] sm:mt-10 sm:pl-12 sm:text-lg sm:leading-9">
                  我们是寄语，一众同好一路走来。始建立于2015年，最初为游侠对战平台MC同好，现为摸鱼划水地图创作团队。因共爱而聚，伴联结而存。我们把剧本、建筑、美术与数据包机关揉进每一张地图，等你亲自踏上未知的旅途。
                </p>
              </div>
              <svg className="postal-parade" viewBox="0 0 490 236" role="img" aria-label="寄语 Couriers 吉祥物队列">
                <defs>
                  <image id={sheetId} href={paradeImage} width="490" height="236" />
                  {paradeParts.map((path, i) => (
                    <clipPath key={path} id={sheetId + '-part-' + i}><path d={path} /></clipPath>
                  ))}
                </defs>
                {paradeParts.map((path, i) => (
                  <g key={path} style={{ opacity: `clamp(0, calc(var(--parade-step, 5) - ${i}), 1)` }}>
                    <use href={'#' + sheetId} clipPath={`url(#${sheetId}-part-${i})`} />
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>
      <PixelDivider topColor="var(--ink)" bottomColor="#F5F6FB" />
      <TrailerScene />
    </section>
  );
}
