import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Mail,
} from 'lucide-react';
import {
  BuildProject,
  PORTFOLIO_PROJECTS,
  TEAM_MEMBERS,
} from '../data/mockData';
import { useReveal } from '../hooks/useReveal';
import { MinecraftHead } from './MinecraftHead';
import { Mojavatar3D } from './Mojavatar3D';
import { PixelDivider } from './PixelDivider';

interface LandingPageProps {
  onOpenProject: (project: BuildProject) => void;
  onGoPortfolio: () => void;
  onGoMembers: () => void;
  onGoJoin: () => void;
}

const MASCOT_PARADE_SLICES = [
  {
    id: 'mailbox-leader',
    delayMs: 120,
    clipPath:
      'polygon(0% 0%, 41.63% 0%, 41.63% 58.90%, 39.18% 58.90%, 39.18% 64.41%, 33.06% 64.41%, 33.06% 100%, 0% 100%)',
  },
  {
    id: 'parcel-buddy',
    delayMs: 440,
    clipPath:
      'polygon(41.63% 0%, 51.63% 0%, 51.63% 100%, 33.06% 100%, 33.06% 64.41%, 39.18% 64.41%, 39.18% 58.90%, 41.63% 58.90%)',
  },
  {
    id: 'radio-bot',
    delayMs: 760,
    clipPath: 'polygon(51.63% 0%, 68.57% 0%, 68.57% 100%, 51.63% 100%)',
  },
  {
    id: 'messenger-bird',
    delayMs: 1080,
    clipPath: 'polygon(68.57% 0%, 86.33% 0%, 86.33% 100%, 68.57% 100%)',
  },
  {
    id: 'winged-letter',
    delayMs: 1400,
    clipPath: 'polygon(86.33% 0%, 100% 0%, 100% 100%, 86.33% 100%)',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenProject,
  onGoPortfolio,
  onGoMembers,
  onGoJoin,
}) => {
  const aboutReveal = useReveal<HTMLDivElement>(0.15);
  const worksReveal = useReveal<HTMLDivElement>(0.12);
  const castReveal = useReveal<HTMLDivElement>(0.12);
  const joinReveal = useReveal<HTMLDivElement>(0.15);

  // Noxcrew-style 3-up 16:9 horizontal carousel (2 slides of 3 items)
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

  const castList = TEAM_MEMBERS;
  const [selectedMemberId, setSelectedMemberId] = useState(castList[0].id);
  const activeIndex = Math.max(
    0,
    castList.findIndex((m) => m.id === selectedMemberId)
  );
  const activeMember = castList[activeIndex];

  const stepMember = (delta: number) => {
    setSelectedMemberId((prevId) => {
      const idx = Math.max(
        0,
        castList.findIndex((m) => m.id === prevId)
      );
      const nextIdx = (idx + delta + castList.length) % castList.length;
      return castList[nextIdx].id;
    });
  };

  const windowStart = Math.max(
    0,
    Math.min(castList.length - 3, activeIndex - 1)
  );
  const visibleMembers = castList.slice(windowStart, windowStart + 3);

  const memberRailRef = useRef<HTMLDivElement | null>(null);
  const wheelAccumRef = useRef(0);

  useEffect(() => {
    const el = memberRailRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
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
    <div className="w-full">
      {/* ================================================================
          1. HERO — Noxcrew-Inspired Blurred Backdrop + Sharp Card + Pixel Wave + 3 Action Cards
         ================================================================ */}
      <section className="relative w-full overflow-hidden bg-[#f5f6fb] pb-12 pt-20 sm:pb-14 sm:pt-22">
        {/* Top Ambient Blurred Backdrop with Stepped Pixel Wave Horizon */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[375px] overflow-hidden bg-[#120b14] sm:h-[580px] lg:h-[605px]">
          <img
            src="/images/7B72BE4F12172E88A363666AF76CA9B7.png"
            alt=""
            aria-hidden="true"
            className="h-full w-full scale-125 object-cover object-center blur-2xl saturate-150 brightness-[0.82]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/35"
          />

          {/* Stepped Pixel Wave Transition along horizon */}
          <svg
            aria-hidden="true"
            viewBox="0 0 1440 48"
            preserveAspectRatio="none"
            shapeRendering="crispEdges"
            className="absolute inset-x-0 bottom-0 h-8 w-full fill-[#f5f6fb] sm:h-11"
          >
            <path d="M0 48V24h60v-8h60v8h60v8h60v-16h60v-8h60v8h60v16h60v-8h60v-8h60v8h60v16h60v-16h60v-8h60v8h60v8h60v-16h60v8h60v16h60v-8h60v-8h60v8h60v8h60v-16h60v16h60v8H0Z" />
          </svg>
        </div>

        {/* Foreground: Wide Sharp Hero Feature Card + Bottom 3 Channel Cards */}
        <div className="relative z-20 mx-auto mt-[120px] flex max-w-[1060px] flex-col items-center px-4 sm:px-6">
          {/* Borderless Wide Showcase Card straddling the pixel horizon */}
          <div className="flex w-full flex-col overflow-hidden rounded-md bg-black shadow-2xl shadow-[#191825]/45">
            <div className="relative flex aspect-[5/2] w-full items-center justify-center overflow-hidden bg-black">
              {/* Scaled-down foreground key art with natural 4-edge rectangular feathering */}
              <div className="relative flex h-[92%] items-center justify-center">
                <img
                  src="/images/7B72BE4F12172E88A363666AF76CA9B7.png"
                  alt="沉默乐章 错位音"
                  className="h-full w-auto select-none object-contain"
                />
                {/* Gentle 4-sided linear feathering into pure black */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-[10%] bg-gradient-to-b from-black to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[11%] bg-gradient-to-t from-black to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 w-[8%] bg-gradient-to-r from-black to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 w-[8%] bg-gradient-to-l from-black to-transparent"
                />
              </div>
            </div>

            {/* Clean Footer Caption & Side-by-Side CTAs below the baked title */}
            <div className="relative z-10 -mt-1 flex flex-col items-center bg-black px-5 pb-5 pt-1 text-center sm:px-8 sm:pb-6">
              <p className="max-w-lg text-xs leading-relaxed text-[#CFCFE5]/90 sm:text-sm">
                寄语 Couriers 叙事解谜地图 —— 在停摆的午夜剧场中拼合错位乐章。
              </p>

              <div className="mt-3.5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenProject(PORTFOLIO_PROJECTS[0])}
                  className="rounded-md bg-[#69699F] px-6 py-2 text-xs font-bold tracking-wider text-white shadow-md transition hover:bg-[#8282B8] sm:px-7 sm:py-2.5 sm:text-sm"
                >
                  查看新作详情
                </button>
                <a
                  href="#about"
                  className="rounded-md bg-[#232133] px-6 py-2 text-xs font-bold tracking-wider text-white transition hover:bg-[#333144] sm:px-7 sm:py-2.5 sm:text-sm"
                >
                  了解团队
                </a>
              </div>
            </div>
          </div>

          {/* Bottom 3 Borderless Social / Community Cards with Direct Icons */}
          <div className="mt-5 grid w-full grid-cols-1 gap-3.5 sm:mt-6 sm:grid-cols-3 sm:gap-4">
            <a
              href="https://space.bilibili.com/146080411"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-md bg-[#FB7299] px-5 py-4 text-left text-white shadow-md shadow-[#FB7299]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#FF85A8] hover:shadow-lg"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-7 w-7 shrink-0 text-white"
                aria-hidden="true"
              >
                <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z" />
              </svg>
              <div className="min-w-0">
                <div className="text-[11px] font-bold tracking-widest text-white/85">
                  BILIBILI
                </div>
                <div className="mt-0.5 truncate text-sm font-extrabold tracking-wide">
                  关注最新地图动态
                </div>
              </div>
            </a>

            <a
              href="https://qm.qq.com/q/97UVC3aEA8"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-md bg-[#12B7F5] px-5 py-4 text-left text-white shadow-md shadow-[#12B7F5]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#2EC2F8] hover:shadow-lg"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-7 w-7 shrink-0 text-white"
                aria-hidden="true"
              >
                <path d="M21.395 15.035a39.548 39.548 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a38.97 38.97 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673z" />
              </svg>
              <div className="min-w-0">
                <div className="text-[11px] font-bold tracking-widest text-white/85">
                  QQ 交流群
                </div>
                <div className="mt-0.5 truncate text-sm font-extrabold tracking-wide">
                  加入玩家交流社群
                </div>
              </div>
            </a>

            <button
              type="button"
              onClick={onGoJoin}
              className="group flex items-center gap-4 rounded-md bg-[#69699F] px-5 py-4 text-left text-white shadow-md shadow-[#69699F]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#7A7AB2] hover:shadow-lg"
            >
              <Mail className="h-7 w-7 shrink-0 text-white" strokeWidth={2} />
              <div className="min-w-0">
                <div className="text-[11px] font-bold tracking-widest text-white/85">
                  加入我们
                </div>
                <div className="mt-0.5 truncate text-sm font-extrabold tracking-wide">
                  一起创作下一张地图
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Stepped Pixelated Dither Transition (#F5F6FB -> #2C273D) */}
      <PixelDivider topColor="#F5F6FB" bottomColor="#2C273D" variant={0} />

      {/* ================================================================
          2. ABOUT — Full-Screen Eastward-Inspired Studio Introduction
         ================================================================ */}
      <section
        id="about"
        className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden bg-[#2C273D] py-20 text-[#F5F6FB] sm:py-24"
      >
        <div
          ref={aboutReveal.ref}
          className={`reveal relative z-10 mx-auto w-full max-w-6xl px-6 ${
            aboutReveal.visible ? 'is-visible' : ''
          }`}
        >
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
            {/* Left Staggered Display Title + Intro Copy */}
            <div className="lg:col-span-6 lg:pr-4">
              <h2 className="text-4xl font-black leading-tight tracking-wider text-[#F5F6FB] sm:text-6xl">
                <span className="block">下一站...</span>
                <span className="mt-2 block pl-14 text-[#F5F6FB] sm:mt-3 sm:pl-32 lg:pl-36">
                  寄语！
                </span>
              </h2>

              <p className="mt-8 max-w-xl text-base leading-8 text-[#CFCFE5]/90 sm:mt-10 sm:pl-12 sm:text-lg sm:leading-9">
                我们是寄语，一众同好一路走来。始建立于2015年，最初为游侠对战平台MC同好，现为摸鱼划水地图创作团队。因共爱而聚，伴联结而存。我们把剧本、建筑、美术与数据包机关揉进每一张地图，等你亲自踏上未知的旅途。
              </p>
            </div>

            {/* Right Mascot Parade: 5 characters appearing one by one */}
            <div className="flex justify-center lg:col-span-6 lg:justify-end">
              <div className="relative w-full max-w-[420px] select-none sm:max-w-[480px] lg:max-w-[520px]">
                {MASCOT_PARADE_SLICES.map((slice, idx) => (
                  <img
                    key={slice.id}
                    src="/images/mail.png?v=2"
                    alt={idx === 0 ? '寄语 Couriers 吉祥物队列' : ''}
                    aria-hidden={idx !== 0}
                    decoding="async"
                    style={{
                      imageRendering: 'pixelated',
                      WebkitClipPath: slice.clipPath,
                      clipPath: slice.clipPath,
                      transitionDelay: aboutReveal.visible
                        ? `${slice.delayMs}ms`
                        : '0ms',
                    }}
                    className={`${
                      idx === 0
                        ? 'relative block w-full'
                        : 'pointer-events-none absolute inset-0 h-full w-full'
                    } object-contain transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      aboutReveal.visible
                        ? 'translate-x-0 translate-y-0 scale-100 opacity-100'
                        : 'translate-x-4 translate-y-5 scale-95 opacity-0'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stepped Pixelated Dither Transition (#2C273D -> #191825) */}
      <PixelDivider topColor="#2C273D" bottomColor="#191825" variant={1} />

      {/* ================================================================
          4. NOXCREW "MINECRAFT PROJECTS" — 3-Up 16:9 Carousel on Deep Twilight
         ================================================================ */}
      <section
        className="py-24 text-white sm:py-28"
        style={{
          background: 'linear-gradient(180deg, #191825 0%, #0d0c14 100%)',
        }}
      >
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

            {/* Noxcrew-style top-right arrow controls */}
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

          {/* 3-Up Square Horizontal Carousel */}
          <div
            ref={trackRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2"
          >
            {PORTFOLIO_PROJECTS.map((project) => (
              <article
                key={project.id}
                onClick={() => onOpenProject(project)}
                className="group w-[82vw] shrink-0 snap-start cursor-pointer sm:w-[calc((100%-3rem)/3)]"
              >
                <div className="aspect-square w-full overflow-hidden rounded-md border-2 border-[#CFCFE5]/25 bg-[#333144] transition-colors group-hover:border-[#8F99D2]">
                  <img
                    src={project.image}
                    alt={project.title}
                    decoding="async"
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

          {/* Noxcrew-style bottom-right CTA */}
          <div className="mt-10 flex justify-end">
            <button
              type="button"
              onClick={onGoPortfolio}
              className="inline-flex items-center gap-2 rounded-md border-2 border-white/80 px-7 py-3 text-sm font-bold tracking-wider text-white transition hover:bg-[#F5F6FB] hover:text-[#333144]"
            >
              <span>全部作品</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Stepped Pixelated Dither Transition (#0d0c14 -> #F5F6FB) */}
      <PixelDivider topColor="#0d0c14" bottomColor="#F5F6FB" variant={2} />

      {/* ================================================================
          5. MEMBERS SHOWCASE — Noxcrew-Inspired 3D Mojavatar + Overlapping Card
         ================================================================ */}
      <section className="overflow-x-clip bg-[#F5F6FB] py-24 sm:py-28">
        <div
          ref={castReveal.ref}
          className={`reveal mx-auto max-w-6xl px-6 ${
            castReveal.visible ? 'is-visible' : ''
          }`}
        >
          <div className="flex flex-col items-center justify-center lg:flex-row lg:items-center">
            {/* Left: Flat-Color Circular Stage Tiled with Couriers Logo + Shadowed 3D Mojavatar */}
            <div className="relative z-0 mx-auto h-[300px] w-[300px] shrink-0 overflow-hidden rounded-full border-2 border-[#333144] bg-[#64659B] shadow-2xl shadow-[#333144]/20 sm:h-[380px] sm:w-[380px] lg:mx-0">
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full"
              >
                <defs>
                  <pattern
                    id="couriers-logo-tile"
                    width="96"
                    height="84"
                    patternUnits="userSpaceOnUse"
                  >
                    <g
                      transform="translate(4 4) scale(0.76)"
                      fill="#525386"
                      opacity="0.72"
                      shapeRendering="crispEdges"
                    >
                      <path d="M34 2h7v2H34ZM27 4h16v1H27ZM24 5h11v1H24ZM19 6h13v1H19ZM17 7h10v1H17ZM12 8h13v1H12ZM41 5h2v4H41ZM9 9h10v1H9ZM40 9h4v1H40ZM5 10h10v1H5ZM38 10h6v1H38ZM4 11h8v1H4ZM38 11h2v1H38ZM2 12h9v1H2ZM37 12h3v1H37ZM36 13h3v1H36ZM2 13h3v2H2ZM36 14h1v1H36ZM42 11h3v4H42ZM2 15h4v1H2ZM34 15h3v1H34ZM2 16h7v1H2ZM33 16h3v1H33ZM43 15h2v2H43ZM2 17h4v1H2ZM8 17h3v1H8ZM3 18h3v1H3ZM8 18h4v1H8ZM32 17h2v2H32ZM11 19h4v1H11ZM30 19h2v1H30ZM43 17h3v3H43ZM12 20h7v1H12ZM44 20h2v1H44ZM15 21h4v1H15ZM19 22h3v1H19ZM30 20h1v3H30ZM44 21h3v2H44ZM21 23h1v1H21ZM4 19h3v6H4ZM45 23h2v2H45ZM31 23h1v3H31ZM5 25h3v3H5ZM22 26h1v2H22ZM6 28h2v1H6ZM45 25h3v4H45ZM40 29h8v1H40ZM37 30h11v1H37ZM6 29h3v3H6ZM32 31h13v1H32ZM27 32h14v1H27ZM23 33h14v1H23ZM19 34h13v1H19ZM7 32h3v4H7ZM15 35h17v1H15ZM7 36h18v1H7ZM9 37h14v1H9ZM9 38h7v2H9Z" />
                      <path d="M22 20h2v1H22ZM26 19h3v2H26ZM23 21h6v1H23ZM23 22h7v3H23ZM24 25h6v1H24ZM24 26h3v1H24ZM28 26h2v1H28ZM24 27h2v1H24Z" />
                    </g>
                    <g
                      transform="translate(52 46) scale(0.76)"
                      fill="#525386"
                      opacity="0.72"
                      shapeRendering="crispEdges"
                    >
                      <path d="M34 2h7v2H34ZM27 4h16v1H27ZM24 5h11v1H24ZM19 6h13v1H19ZM17 7h10v1H17ZM12 8h13v1H12ZM41 5h2v4H41ZM9 9h10v1H9ZM40 9h4v1H40ZM5 10h10v1H5ZM38 10h6v1H38ZM4 11h8v1H4ZM38 11h2v1H38ZM2 12h9v1H2ZM37 12h3v1H37ZM36 13h3v1H36ZM2 13h3v2H2ZM36 14h1v1H36ZM42 11h3v4H42ZM2 15h4v1H2ZM34 15h3v1H34ZM2 16h7v1H2ZM33 16h3v1H33ZM43 15h2v2H43ZM2 17h4v1H2ZM8 17h3v1H8ZM3 18h3v1H3ZM8 18h4v1H8ZM32 17h2v2H32ZM11 19h4v1H11ZM30 19h2v1H30ZM43 17h3v3H43ZM12 20h7v1H12ZM44 20h2v1H44ZM15 21h4v1H15ZM19 22h3v1H19ZM30 20h1v3H30ZM44 21h3v2H44ZM21 23h1v1H21ZM4 19h3v6H4ZM45 23h2v2H45ZM31 23h1v3H31ZM5 25h3v3H5ZM22 26h1v2H22ZM6 28h2v1H6ZM45 25h3v4H45ZM40 29h8v1H40ZM37 30h11v1H37ZM6 29h3v3H6ZM32 31h13v1H32ZM27 32h14v1H27ZM23 33h14v1H23ZM19 34h13v1H19ZM7 32h3v4H7ZM15 35h17v1H15ZM7 36h18v1H7ZM9 37h14v1H9ZM9 38h7v2H9Z" />
                      <path d="M22 20h2v1H22ZM26 19h3v2H26ZM23 21h6v1H23ZM23 22h7v3H23ZM24 25h6v1H24ZM24 26h3v1H24ZM28 26h2v1H28ZM24 27h2v1H24Z" />
                    </g>
                  </pattern>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill="url(#couriers-logo-tile)"
                />
              </svg>

              <div className="relative z-10 h-full w-full">
                <Mojavatar3D
                  mcId={activeMember.mcId}
                  skinUrl={activeMember.skinUrl}
                  avatarUrl={activeMember.avatarUrl}
                />
              </div>
            </div>

            {/* Right: Big Heading + Overlapping Intro Card + 3-Member Scrollable Avatar Rail */}
            <div className="relative z-10 mt-10 flex w-full flex-col items-center lg:mt-0 lg:-ml-16 lg:w-auto lg:flex-row lg:items-center">
              <div className="flex w-full flex-col items-center lg:w-[540px]">
                <h2 className="text-center text-4xl font-black tracking-[0.12em] text-[#333144] sm:text-5xl">
                  成员
                </h2>

                {/* Fixed-size Intro Card overlapping the left circle on desktop */}
                <div className="mt-6 h-[212px] w-full rounded-md border-2 border-[#CFCFE5] bg-[#F5F6FB] p-6 shadow-xl shadow-[#333144]/8 sm:h-[176px] sm:py-6 sm:pl-7 sm:pr-14">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-xl font-extrabold text-[#333144]">
                      {activeMember.name}
                    </h3>
                    {activeMember.isFounder && (
                      <span className="rounded border border-[#69699F]/40 bg-[#69699F]/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-[#69699F]">
                        发起者
                      </span>
                    )}
                    <span className="text-xs font-semibold text-[#69699F]">
                      {activeMember.role}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#333144]/75">
                    {activeMember.bio}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onGoMembers}
                  className="mt-6 inline-flex items-center gap-2 rounded-md border-2 border-[#333144] bg-[#333144] px-7 py-3 text-sm font-bold text-white shadow-md shadow-[#333144]/15 transition hover:border-[#69699F] hover:bg-[#69699F]"
                >
                  <span>查看全部 {TEAM_MEMBERS.length} 位成员</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Far-right enlarged 3-member scrollable selector rail */}
              <div
                ref={memberRailRef}
                title="鼠标上下滚动切换成员"
                className="relative z-20 mt-6 flex select-none flex-row items-center justify-center gap-3 lg:mt-0 lg:-ml-7 lg:flex-col lg:gap-2.5"
              >
                <button
                  type="button"
                  aria-label="上一位成员"
                  onClick={() => stepMember(-1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#69699F]/70 transition hover:bg-[#F5F6FB] hover:text-[#333144]"
                >
                  <ChevronUp className="h-4 w-4 -rotate-90 lg:rotate-0" />
                </button>

                <div className="flex flex-row items-center gap-3.5 lg:flex-col lg:gap-3.5">
                  {visibleMembers.map((member) => {
                    const isSelected = member.id === activeMember.id;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        title={member.name}
                        aria-label={member.name}
                        onClick={() => setSelectedMemberId(member.id)}
                        className={`relative flex items-center justify-center transition-all duration-200 focus:outline-none ${
                          isSelected
                            ? 'h-16 w-16 scale-105'
                            : 'h-14 w-14 opacity-85 hover:opacity-100'
                        }`}
                      >
                        {isSelected ? (
                          <span
                            aria-hidden="true"
                            className="absolute inset-1 rotate-45 rounded-md border-2 border-[#333144] bg-[#69699F] shadow-lg"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 rounded-full border-2 border-[#CFCFE5] bg-[#333144] shadow-md transition-colors hover:border-[#69699F]"
                          />
                        )}
                        <span className="relative z-10 flex items-center justify-center">
                          <MinecraftHead
                            seed={member.mcId}
                            avatarUrl={member.avatarUrl}
                            size={isSelected ? 36 : 34}
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  aria-label="下一位成员"
                  onClick={() => stepMember(1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#69699F]/70 transition hover:bg-[#F5F6FB] hover:text-[#333144]"
                >
                  <ChevronDown className="h-4 w-4 -rotate-90 lg:rotate-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stepped Pixelated Dither Transition (#F5F6FB -> #333144) */}
      <PixelDivider topColor="#F5F6FB" bottomColor="#333144" variant={3} />

      {/* ================================================================
          6. NOXCREW-STYLE SPLIT CALLOUT — Community & Recruitment Split
         ================================================================ */}
      <section className="bg-[#333144] py-20 text-white sm:py-24">
        <div
          ref={joinReveal.ref}
          className={`reveal mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-12 ${
            joinReveal.visible ? 'is-visible' : ''
          }`}
        >
          <div className="lg:col-span-6">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              想和我们一起创作地图？
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[#CFCFE5]/85 sm:text-base sm:leading-7">
              无论你擅长关卡策划、场景搭建、数据包机关还是音画渲染，都欢迎带着你的想法和作品来到寄语 Couriers。
            </p>
            <div className="mt-7 flex flex-wrap gap-3.5">
              <button
                type="button"
                onClick={onGoJoin}
                className="inline-flex items-center gap-1.5 rounded-md border-2 border-white bg-[#69699F] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8F99D2]"
              >
                <span>加入我们</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-center lg:col-span-6 lg:justify-center">
            <img
              src="/images/birdmail.png"
              alt="寄语 Couriers"
              decoding="async"
              style={{ imageRendering: 'pixelated' }}
              className="h-auto w-auto max-w-full select-none"
            />
          </div>
        </div>
      </section>

      {/* Stepped Pixelated Dither Transition (#333144 -> #0d0c14 Footer) */}
      <PixelDivider topColor="#333144" bottomColor="#0d0c14" variant={4} />
    </div>
  );
};
