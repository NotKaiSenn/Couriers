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
  ABOUT_STORY_BLOCKS,
  AboutStoryBlock,
  BuildProject,
  PORTFOLIO_PROJECTS,
  TEAM_MEMBERS,
} from '../data/mockData';
import { useReveal } from '../hooks/useReveal';
import { MinecraftHead } from './MinecraftHead';
import { Mojavatar3D } from './Mojavatar3D';
import { VoxelCubeLoop } from './VoxelCubeLoop';
import { PixelDivider } from './PixelDivider';

interface LandingPageProps {
  onOpenProject: (project: BuildProject) => void;
  onGoPortfolio: () => void;
  onGoMembers: () => void;
  onGoJoin: () => void;
}

const STUDIO_PILLARS = [
  {
    title: '叙事解谜地图',
    desc: '围绕剧情、机关与环境线索打造的沉浸式体验，让玩家亲手推进故事进程。',
    image: '/images/project-skyport.jpg',
  },
  {
    title: '箱庭探索世界',
    desc: '兼顾立体动线与全内饰细节的开放箱庭，推开每一扇门都有新的发现。',
    image: '/images/project-sanctum.jpg',
  },
  {
    title: '音画与机制演出',
    desc: '结合数据包交互、自定义音效与光影调度，为地图注入剧场级的演出节奏。',
    image: '/images/project-clockwork.jpg',
  },
];

const StoryRow: React.FC<{ block: AboutStoryBlock; index: number }> = ({
  block,
  index,
}) => {
  const leftReveal = useReveal<HTMLDivElement>(0.15);
  const rightReveal = useReveal<HTMLDivElement>(0.15);
  const isImageLeft = block.align === 'image-left';

  const floatingVisual =
    block.id === 'vision' ? (
      <VoxelCubeLoop />
    ) : (
      <div className="relative flex items-center justify-center py-4">
        <img
          src={block.image}
          alt={`${block.titleTop} ${block.titleBottom}`}
          decoding="async"
          style={{
            animationDelay: `${index * 0.9}s`,
            WebkitMaskImage:
              'radial-gradient(ellipse 72% 72% at 50% 50%, #000 68%, transparent 98%)',
            maskImage:
              'radial-gradient(ellipse 72% 72% at 50% 50%, #000 68%, transparent 98%)',
          }}
          className="animate-float-gentle w-full max-w-[440px] select-none object-contain brightness-[1.02] contrast-[1.04] mix-blend-multiply transition-transform duration-500 hover:scale-[1.03]"
        />
      </div>
    );

  const textBlock = (
    <div className="max-w-lg">
      <h2 className="text-3xl font-black leading-tight tracking-tight text-[#333144] sm:text-4xl">
        <span className="block">{block.titleTop}</span>
        <span className="mt-2 block pl-16 text-[#69699F] sm:pl-28">
          {block.titleBottom}
        </span>
      </h2>
      <p className="mt-7 pl-4 text-sm leading-8 text-[#333144]/80 sm:pl-8 sm:text-base sm:leading-8">
        {block.description}
      </p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
      {isImageLeft ? (
        <>
          <div
            ref={leftReveal.ref}
            className={`reveal-left lg:col-span-6 ${
              leftReveal.visible ? 'is-visible' : ''
            }`}
          >
            {floatingVisual}
          </div>
          <div
            ref={rightReveal.ref}
            className={`reveal-right lg:col-span-6 lg:pl-8 ${
              rightReveal.visible ? 'is-visible' : ''
            }`}
          >
            {textBlock}
          </div>
        </>
      ) : (
        <>
          <div
            ref={leftReveal.ref}
            className={`reveal-left order-2 lg:order-1 lg:col-span-6 lg:flex lg:justify-end lg:pr-8 ${
              leftReveal.visible ? 'is-visible' : ''
            }`}
          >
            {textBlock}
          </div>
          <div
            ref={rightReveal.ref}
            className={`reveal-right order-1 lg:order-2 lg:col-span-6 ${
              rightReveal.visible ? 'is-visible' : ''
            }`}
          >
            {floatingVisual}
          </div>
        </>
      )}
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenProject,
  onGoPortfolio,
  onGoMembers,
  onGoJoin,
}) => {
  const pillarsReveal = useReveal<HTMLDivElement>(0.12);
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
          1. HERO — Full-Screen Pure Dark Stage + Feathered Artwork + Buttons
         ================================================================ */}
      <section className="relative flex h-screen min-h-[640px] w-full flex-col items-center justify-between overflow-hidden bg-black px-0 pb-9 pt-20 text-center sm:px-6">
        <div className="flex min-h-0 w-full max-w-6xl flex-1 items-center justify-center">
          <div className="relative flex h-full w-full items-center justify-center">
            <img
              src="/images/7B72BE4F12172E88A363666AF76CA9B7.png"
              alt="沉默乐章 错位音"
              style={{
                WebkitMaskImage:
                  'linear-gradient(to right, transparent 0%, #000 6%, #000 94%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 12%, #000 84%, transparent 100%)',
                WebkitMaskComposite: 'source-in',
                maskImage:
                  'linear-gradient(to right, transparent 0%, #000 6%, #000 94%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 12%, #000 84%, transparent 100%)',
                maskComposite: 'intersect',
              }}
              className="h-[50vh] min-h-[360px] w-full select-none object-cover object-center sm:h-auto sm:max-h-[calc(100vh-170px)] sm:min-h-0 sm:w-auto sm:max-w-full sm:object-contain"
            />
          </div>
        </div>

        <div className="relative z-10 mt-3 flex shrink-0 items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={onGoPortfolio}
            className="rounded-md border-2 border-white/85 bg-[#69699F] px-7 py-2.5 text-sm font-semibold tracking-wider text-white shadow-lg shadow-black/40 transition hover:bg-[#8F99D2]"
          >
            浏览作品
          </button>
          <a
            href="#about"
            className="rounded-md border-2 border-white/50 bg-black/50 px-7 py-2.5 text-sm font-semibold tracking-wider text-white backdrop-blur-md transition hover:border-white hover:bg-black/70"
          >
            了解团队
          </a>
        </div>
      </section>

      {/* ================================================================
          2. NOXCREW "WHAT WE DO" — 3-Column Framed Studio Pillar Cards
         ================================================================ */}
      <section className="bg-black py-24 text-white sm:py-28">
        <div
          ref={pillarsReveal.ref}
          className={`reveal mx-auto max-w-6xl px-6 ${
            pillarsReveal.visible ? 'is-visible' : ''
          }`}
        >
          <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
            我们的创作方向
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {STUDIO_PILLARS.map((pillar) => (
              <button
                key={pillar.title}
                type="button"
                onClick={onGoPortfolio}
                className="group flex flex-col overflow-hidden rounded-md border-2 border-[#8F99D2]/85 bg-[#0c0b14] text-left transition duration-300 hover:-translate-y-1 hover:border-[#CFCFE5]"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#1b1929]">
                  <img
                    src={pillar.image}
                    alt={pillar.title}
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-extrabold tracking-wide text-white transition-colors group-hover:text-[#8F99D2]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2.5 text-xs leading-6 text-[#CFCFE5]/75 sm:text-sm sm:leading-6">
                    {pillar.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stepped Pixelated Dither Transition (#000000 -> #FFFFFF) */}
      <PixelDivider topColor="#000000" bottomColor="#FFFFFF" />

      {/* ================================================================
          3. ABOUT — Alternating Studio Story + Cozy Minecraft 3D Block Loop
         ================================================================ */}
      <section id="about" className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-6xl space-y-24 px-6 sm:space-y-32">
          {ABOUT_STORY_BLOCKS.map((block, idx) => (
            <StoryRow key={block.id} block={block} index={idx} />
          ))}
        </div>
      </section>

      {/* Stepped Pixelated Dither Transition (#FFFFFF -> #191825) */}
      <PixelDivider topColor="#FFFFFF" bottomColor="#191825" />

      {/* ================================================================
          4. NOXCREW "MINECRAFT PROJECTS" — 3-Up 16:9 Carousel on Deep Twilight
         ================================================================ */}
      <section
        className="py-24 text-white sm:py-28"
        style={{
          background: 'linear-gradient(135deg, #191825 0%, #0d0c14 100%)',
        }}
      >
        <div
          ref={worksReveal.ref}
          className={`reveal mx-auto max-w-6xl px-6 ${
            worksReveal.visible ? 'is-visible' : ''
          }`}
        >
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              精选作品
            </h2>

            {/* Noxcrew-style top-right arrow controls */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => goSlide('prev')}
                disabled={slidePage === 0}
                aria-label="上一组作品"
                className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-[#CFCFE5]/60 bg-transparent text-white transition hover:border-white hover:bg-white/10 disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => goSlide('next')}
                disabled={slidePage === totalPages - 1}
                aria-label="下一组作品"
                className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-[#CFCFE5]/60 bg-transparent text-white transition hover:border-white hover:bg-white/10 disabled:opacity-30"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 3-Up 16:9 Horizontal Carousel */}
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
                <div
                  className={`aspect-video w-full overflow-hidden rounded-md border-2 border-[#CFCFE5]/25 transition-colors group-hover:border-[#8F99D2] ${
                    project.id === 'silent-movement' ? 'bg-black' : 'bg-[#333144]'
                  }`}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    decoding="async"
                    className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${
                      project.id === 'silent-movement'
                        ? 'object-contain'
                        : 'object-cover'
                    }`}
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
              className="inline-flex items-center gap-2 rounded-md border-2 border-white/80 px-6 py-2.5 text-xs font-bold tracking-wider text-white transition hover:bg-white hover:text-[#333144]"
            >
              <span>全部作品</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================
          5. MEMBERS SHOWCASE — Noxcrew-Inspired 3D Mojavatar + Overlapping Card
         ================================================================ */}
      <section className="overflow-x-clip bg-[#f5f6fb] py-24 sm:py-28">
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
                <div className="mt-6 h-[212px] w-full rounded-md border-2 border-[#CFCFE5] bg-white p-6 shadow-xl shadow-[#333144]/8 sm:h-[176px] sm:py-6 sm:pl-7 sm:pr-14">
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
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#69699F]/70 transition hover:bg-white hover:text-[#333144]"
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
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#69699F]/70 transition hover:bg-white hover:text-[#333144]"
                >
                  <ChevronDown className="h-4 w-4 -rotate-90 lg:rotate-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              想和我们一起创作体验地图？
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

          <div className="lg:col-span-6 lg:flex lg:justify-end">
            <div className="relative w-full max-w-md rounded-md border-2 border-[#8F99D2]/70 bg-[#252336] p-6 shadow-xl sm:p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border-2 border-[#CFCFE5]/40 bg-white/95 p-2">
                  <img
                    src="/images/couriers-envelope.svg"
                    alt="寄语 Couriers"
                    className="h-full w-auto"
                  />
                </div>
                <div>
                  <div className="text-base font-bold text-white">
                    寄语 Couriers 创作室
                  </div>
                  <div className="mt-0.5 text-xs text-[#CFCFE5]/75">
                    原创 Minecraft 体验类地图团队
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2.5 border-t border-white/12 pt-5 text-xs text-[#CFCFE5]">
                <div className="flex items-center justify-between">
                  <span className="text-[#CFCFE5]/60">玩家交流群</span>
                  <span className="font-semibold text-white">QQ 892410376</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#CFCFE5]/60">合作联系</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                    <Mail className="h-3.5 w-3.5 text-[#8F99D2]" />
                    contact@couriers.studio
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
