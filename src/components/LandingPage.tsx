import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  BuildProject,
  PORTFOLIO_PROJECTS,
  TEAM_MEMBERS,
} from '../data/mockData';
import { useReveal } from '../hooks/useReveal';
import { MinecraftHead } from './MinecraftHead';
import { OptimizedImage } from './OptimizedImage';
import { PixelDivider } from './PixelDivider';
import { PostalHero } from './PostalHero';
import './MemberShowcase.css';

const loadMojavatar3D = () =>
  import('./Mojavatar3D').then((m) => ({ default: m.Mojavatar3D }));
const Mojavatar3D = lazy(loadMojavatar3D);

let mojavatarLoadedOnce = false;

const ALL_MEMBER_SKIN_URLS = TEAM_MEMBERS.map((m) => m.skinUrl);

interface LandingPageProps {
  onOpenProject: (project: BuildProject) => void;
  onGoPortfolio: () => void;
  onGoMembers: () => void;
  onGoJoin: () => void;
  onPrefetchProjectDetail?: () => void;
  onPrefetchPortfolio?: () => void;
  onPrefetchMembers?: () => void;
  onPrefetchJoin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenProject,
  onGoPortfolio,
  onGoMembers,
  onGoJoin,
  onPrefetchProjectDetail,
  onPrefetchPortfolio,
  onPrefetchMembers,
  onPrefetchJoin,
}) => {
  const worksReveal = useReveal<HTMLDivElement>(0.12);
  const castReveal = useReveal<HTMLDivElement>(0.12);
  const joinReveal = useReveal<HTMLDivElement>(0.15);

  const portraitRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad3D, setShouldLoad3D] = useState(mojavatarLoadedOnce);

  useEffect(() => {
    if (shouldLoad3D) return;
    const el = portraitRef.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      mojavatarLoadedOnce = true;
      setShouldLoad3D(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          mojavatarLoadedOnce = true;
          setShouldLoad3D(true);
          observer.disconnect();
        }
      },
      { rootMargin: '500px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldLoad3D]);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [slidePage, setSlidePage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(PORTFOLIO_PROJECTS.length / 3));

  const goSlide = (dir: 'prev' | 'next') => {
    const next =
      dir === 'next'
        ? Math.min(totalPages - 1, slidePage + 1)
        : Math.max(0, slidePage - 1);
    setSlidePage(next);
    if (trackRef.current) {
      trackRef.current.scrollTo({
        left: next * trackRef.current.clientWidth,
        behavior: 'smooth',
      });
    }
  };

  const [activeIndex, setActiveIndex] = useState(0);
  const activeMember = TEAM_MEMBERS[activeIndex];
  const stepMember = (delta: number) => {
    const count = TEAM_MEMBERS.length;
    setActiveIndex(index => (index + delta + count) % count);
  };

  const windowStart = Math.max(
    0,
    Math.min(TEAM_MEMBERS.length - 3, activeIndex - 1)
  );
  const visibleMembers = TEAM_MEMBERS.slice(windowStart, windowStart + 3);

  const memberRailRef = useRef<HTMLDivElement | null>(null);
  const wheelAccumRef = useRef(0);

  useEffect(() => {
    const el = memberRailRef.current;
    if (!el) return;

    const desktopRail = window.matchMedia('(min-width: 64rem) and (hover: hover)');
    const handleWheel = (e: WheelEvent) => {
      if (!desktopRail.matches) return;
      e.preventDefault();
      wheelAccumRef.current += e.deltaY;
      const threshold = 36;
      if (Math.abs(wheelAccumRef.current) >= threshold) {
        const dir = wheelAccumRef.current > 0 ? 1 : -1;
        wheelAccumRef.current = 0;
        stepMember(dir);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="postal-home w-full">
      <PostalHero
        onOpenTrailerProject={() => onOpenProject(PORTFOLIO_PROJECTS[0])}
        onPrefetchProjectDetail={onPrefetchProjectDetail}
      />

      <section className="works-panel py-16 text-white sm:py-24">
        <div
          ref={worksReveal.ref}
          className={`reveal mx-auto max-w-6xl px-6 ${
            worksReveal.visible ? 'is-visible' : ''
          }`}
        >
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-4xl font-black tracking-[0.12em] text-white sm:text-5xl">
              作品
            </h2>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => goSlide('prev')}
                disabled={slidePage === 0}
                aria-label="上一组作品"
                className="flex h-11 w-11 items-center justify-center rounded-md border-2 border-[#CFCFE5]/60 bg-transparent text-white transition hover:border-white hover:bg-white/10 disabled:opacity-30 sm:h-12 sm:w-12"
              >
                <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => goSlide('next')}
                disabled={slidePage === totalPages - 1}
                aria-label="下一组作品"
                className="flex h-11 w-11 items-center justify-center rounded-md border-2 border-[#CFCFE5]/60 bg-transparent text-white transition hover:border-white hover:bg-white/10 disabled:opacity-30 sm:h-12 sm:w-12"
              >
                <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div
            ref={trackRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2"
          >
            {PORTFOLIO_PROJECTS.map((project) => (
              <article
                key={project.id}
                onClick={() => onOpenProject(project)}
                onMouseEnter={onPrefetchProjectDetail}
                className="group w-[min(100%,82vw)] shrink-0 snap-start cursor-pointer sm:w-[calc((100%-3rem)/3)]"
              >
                <div className="aspect-square w-full overflow-hidden rounded-md border-2 border-[#CFCFE5]/25 bg-[#333144] transition-colors group-hover:border-[#8F99D2]">
                  <OptimizedImage
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    sizes="(min-width: 640px) 360px, 82vw"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="mt-4 flex items-baseline justify-between gap-2 px-0.5">
                  <h3 className="text-base font-bold text-white transition-colors group-hover:text-[#8F99D2]">
                    {project.title}
                  </h3>
                  <span className="text-xs text-[#CFCFE5]/70">
                    {project.category}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 flex justify-end">
            <button
              type="button"
              onClick={onGoPortfolio}
              onMouseEnter={onPrefetchPortfolio}
              onFocus={onPrefetchPortfolio}
              className="inline-flex items-center gap-2 rounded-md border-2 border-white/80 px-7 py-3 text-sm font-bold tracking-wider text-white transition hover:bg-[#F5F6FB] hover:text-[#333144]"
            >
              <span>全部作品</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-x-clip bg-[#F5F6FB] py-14 sm:py-20 lg:py-28" aria-labelledby="member-heading">
        <div
          ref={castReveal.ref}
          className={`reveal mx-auto max-w-6xl px-4 sm:px-6 ${castReveal.visible ? 'is-visible' : ''}`}
        >
          <div className="member-showcase">
            <h2 id="member-heading" className="text-center text-4xl font-black tracking-[0.12em] text-[#333144] sm:text-5xl">
              成员
            </h2>

            <div className="member-portrait">
              <div className="member-portrait-stage">
                <svg
                  aria-hidden="true"
                  className="member-envelope-drift pointer-events-none absolute top-0 left-0"
                >
                  <defs>
                    <pattern
                      id="couriers-logo-tile"
                      width="96"
                      height="84"
                      patternUnits="userSpaceOnUse"
                    >
                      <g
                        id="couriers-profile-stamp"
                        transform="translate(4 4) scale(0.76)"
                        fill="#525386"
                        opacity="0.72"
                        shapeRendering="crispEdges"
                      >
                        <path d="M34 2h7v2H34ZM27 4h16v1H27ZM24 5h11v1H24ZM19 6h13v1H19ZM17 7h10v1H17ZM12 8h13v1H12ZM41 5h2v4H41ZM9 9h10v1H9ZM40 9h4v1H40ZM5 10h10v1H5ZM38 10h6v1H38ZM4 11h8v1H4ZM38 11h2v1H38ZM2 12h9v1H2ZM37 12h3v1H37ZM36 13h3v1H36ZM2 13h3v2H2ZM36 14h1v1H36ZM42 11h3v4H42ZM2 15h4v1H2ZM34 15h3v1H34ZM2 16h7v1H2ZM33 16h3v1H33ZM43 15h2v2H43ZM2 17h4v1H2ZM8 17h3v1H8ZM3 18h3v1H3ZM8 18h4v1H8ZM32 17h2v2H32ZM11 19h4v1H11ZM30 19h2v1H30ZM43 17h3v3H43ZM12 20h7v1H12ZM44 20h2v1H44ZM15 21h4v1H15ZM19 22h3v1H19ZM30 20h1v3H30ZM44 21h3v2H44ZM21 23h1v1H21ZM4 19h3v6H4ZM45 23h2v2H45ZM31 23h1v3H31ZM5 25h3v3H5ZM22 26h1v2H22ZM6 28h2v1H6ZM45 25h3v4H45ZM40 29h8v1H40ZM37 30h11v1H37ZM6 29h3v3H6ZM32 31h13v1H32ZM27 32h14v1H27ZM23 33h14v1H23ZM19 34h13v1H19ZM7 32h3v4H7ZM15 35h17v1H15ZM7 36h18v1H7ZM9 37h14v1H9ZM9 38h7v2H9Z" />
                        <path d="M22 20h2v1H22ZM26 19h3v2H26ZM23 21h6v1H23ZM23 22h7v3H23ZM24 25h6v1H24ZM24 26h3v1H24ZM28 26h2v1H28ZM24 27h2v1H24Z" />
                      </g>
                      <use href="#couriers-profile-stamp" x="48" y="42" />
                    </pattern>
                  </defs>
                  <rect
                    width="100%"
                    height="100%"
                    fill="url(#couriers-logo-tile)"
                  />
                </svg>
              </div>

              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                shapeRendering="crispEdges"
                className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
              >
                <polygon
                  points="2,2 4,2 4,1 9,1 9,2 13,2 13,0 19,0 19,1 22,1 22,3 23,3 23,7 22,7 22,11 24,11 24,17 23,17 23,21 21,21 21,22 18,22 18,23 13,23 13,22 9,22 9,24 4,24 4,22 2,22 2,20 1,20 1,16 2,16 2,12 0,12 0,6 1,6 1,3 2,3"
                  fill="none"
                  stroke="#333144"
                  strokeWidth="2.5"
                  strokeLinejoin="miter"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <div ref={portraitRef} className="member-portrait-model absolute -inset-[35%] z-30">
                {shouldLoad3D ? (
                  <Suspense
                    fallback={
                      <div className="flex h-full w-full items-center justify-center">
                        <MinecraftHead
                          seed={activeMember.mcId}
                          avatarUrl={activeMember.avatarUrl}
                          size={140}
                        />
                      </div>
                    }
                  >
                    <Mojavatar3D
                      mcId={activeMember.mcId}
                      skinUrl={activeMember.skinUrl}
                      avatarUrl={activeMember.avatarUrl}
                      preloadSkinUrls={ALL_MEMBER_SKIN_URLS}
                    />
                  </Suspense>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <MinecraftHead
                      seed={activeMember.mcId}
                      avatarUrl={activeMember.avatarUrl}
                      size={140}
                    />
                  </div>
                )}
              </div>
            </div>

            <div ref={memberRailRef} className="member-switcher" role="group" aria-label="选择成员">
              <button type="button" aria-label="上一位成员" onClick={() => stepMember(-1)} className="member-step">
                <ChevronUp aria-hidden="true" className="size-5 -rotate-90 lg:size-4 lg:rotate-0" />
              </button>
              <div className="member-faces">
                {visibleMembers.map((member, offset) => {
                  const selected = member.id === activeMember.id;
                  return (
                    <button
                      key={member.id}
                      type="button"
                      title={member.name}
                      aria-label={member.name}
                      aria-pressed={selected}
                      onClick={() => setActiveIndex(windowStart + offset)}
                      className={`relative grid size-12 place-items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#69699F] ${selected ? 'lg:size-16 lg:scale-105' : 'lg:size-14'}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute inset-0 rounded-md border-2 ${selected
                          ? 'border-[#333144] bg-[#69699F] shadow-md lg:inset-1 lg:rotate-45'
                          : 'border-[#CFCFE5] bg-[#333144] lg:rounded-full'}`}
                      />
                      <span className="relative grid place-items-center">
                        <MinecraftHead seed={member.mcId} avatarUrl={member.avatarUrl} size={32} />
                      </span>
                    </button>
                  );
                })}
              </div>
              <button type="button" aria-label="下一位成员" onClick={() => stepMember(1)} className="member-step">
                <ChevronDown aria-hidden="true" className="size-5 -rotate-90 lg:size-4 lg:rotate-0" />
              </button>
            </div>

            <div className="relative z-20 w-full rounded-md border-2 border-[#CFCFE5] bg-[#F5F6FB] p-4 shadow-xl shadow-[#333144]/8 sm:p-6 lg:h-[176px] lg:pl-7 lg:pr-14" aria-live="polite" aria-atomic="true">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <h3 className="break-all text-xl font-extrabold text-[#333144]">{activeMember.name}</h3>
                {activeMember.isFounder && (
                  <span className="rounded border border-[#69699F]/40 bg-[#69699F]/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-[#69699F]">
                    发起者
                  </span>
                )}
                <span className="basis-full text-sm font-semibold text-[#69699F] lg:basis-auto lg:text-xs">{activeMember.role}</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[#333144]/75 lg:line-clamp-3">{activeMember.bio}</p>
            </div>

            <button
              type="button"
              onClick={onGoMembers}
              onMouseEnter={onPrefetchMembers}
              onFocus={onPrefetchMembers}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border-2 border-[#333144] bg-[#333144] px-7 py-3 text-sm font-bold text-white shadow-md shadow-[#333144]/15 transition hover:border-[#69699F] hover:bg-[#69699F] lg:w-auto"
            >
              <span>查看全部 {TEAM_MEMBERS.length} 位成员</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      <PixelDivider topColor="#F5F6FB" bottomColor="#333144" variant={3} />

      <section className="bg-[#333144] py-20 text-white sm:py-24">
        <div
          ref={joinReveal.ref}
          className={`reveal mx-auto grid max-w-5xl items-center justify-items-center gap-8 px-6 text-center lg:grid-cols-[minmax(0,32rem)_minmax(0,22.5rem)] lg:justify-center lg:gap-16 lg:pl-10 lg:text-left ${
            joinReveal.visible ? 'is-visible' : ''
          }`}
        >
          <div className="w-full max-w-lg">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              想和我们一起创作地图？
            </h2>
            <p className="mt-4 text-pretty text-sm leading-7 text-[#CFCFE5]/85 sm:text-base sm:leading-7">
              无论你擅长关卡策划、场景搭建、数据包机关还是音画渲染，都欢迎带着你的想法和作品来到寄语 Couriers。
            </p>
            <div className="mt-7 flex justify-center lg:justify-start">
              <button
                type="button"
                onClick={onGoJoin}
                onMouseEnter={onPrefetchJoin}
                onFocus={onPrefetchJoin}
                className="inline-flex items-center gap-1.5 rounded-md border-2 border-white bg-[#69699F] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8F99D2]"
              >
                <span>加入我们</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <img
            src="/images/birdmail.png"
            alt="寄语 Couriers"
            width="360"
            height="204"
            loading="lazy"
            decoding="async"
            style={{ imageRendering: 'pixelated' }}
            className="h-auto w-full max-w-[360px] select-none"
          />
        </div>
      </section>

      <PixelDivider topColor="#333144" bottomColor="#0d0c14" variant={4} />
    </div>
  );
};
