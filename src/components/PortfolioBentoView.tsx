import React, { useState } from 'react';
import {
  BuildProject,
  getMemberById,
  PORTFOLIO_PROJECTS,
} from '../data/mockData';
import { OptimizedImage } from './OptimizedImage';

interface PortfolioBentoViewProps {
  onOpenProject: (project: BuildProject) => void;
  onGoMembers: () => void;
}

export const PortfolioBentoView: React.FC<PortfolioBentoViewProps> = ({
  onOpenProject,
  onGoMembers,
}) => {
  const [selected, setSelected] = useState('全部');

  const categories = [
    '全部',
    ...Array.from(
      new Set(PORTFOLIO_PROJECTS.map((p) => p.category).filter(Boolean))
    ),
  ];

  const projects =
    selected === '全部'
      ? PORTFOLIO_PROJECTS
      : PORTFOLIO_PROJECTS.filter((p) => p.category === selected);

  const isBentoAll = selected === '全部' && projects.length >= 5;
  const isSingleCard = projects.length === 1;

  return (
    <div className="min-h-screen bg-[#f5f6fb] pb-24 pt-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Top Full-Width Editorial Banner */}
        <div className="relative mb-7 overflow-hidden rounded-md border-2 border-[#333144] bg-[#333144]">
          <OptimizedImage
            src="/images/hero-banner.jpg"
            alt=""
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#333144]/95 via-[#333144]/75 to-[#69699F]/35" />

          <div className="relative flex flex-col items-start justify-between gap-5 px-8 py-9 sm:flex-row sm:items-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Couriers 作品集
            </h1>

            <button
              type="button"
              onClick={onGoMembers}
              className="shrink-0 rounded-md border-2 border-white/80 bg-[#69699F]/45 px-5 py-2 text-xs font-semibold tracking-wider text-white backdrop-blur-xs transition hover:bg-white hover:text-[#333144]"
            >
              认识创作者
            </button>
          </div>
        </div>

        {/* Category Filters */}
        {categories.length > 2 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = selected === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelected(cat)}
                  className={`rounded-md px-4 py-1.5 text-xs font-semibold tracking-wide transition ${
                    active
                      ? 'border-2 border-[#333144] bg-[#333144] text-white'
                      : 'border-2 border-[#CFCFE5] bg-white text-[#333144]/75 hover:border-[#333144] hover:text-[#333144]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Asymmetric 2-Column Bento Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {projects.map((project, index) => {
            const lead = getMemberById(project.leadBuilderId);
            const isTallHero = isBentoAll && index === 0;
            const isSilentArtwork =
              project.imageFit === 'contain' || project.id === 'silent-movement';
            const isFullWidthLast =
              isSingleCard ||
              (isBentoAll &&
                index === projects.length - 1 &&
                projects.length % 2 === 0);

            return (
              <article
                key={project.id}
                onClick={() => onOpenProject(project)}
                className={`bento-tile group cursor-pointer ${
                  isSilentArtwork ? 'bg-black' : 'bg-[#333144]'
                } ${
                  isSingleCard
                    ? 'min-h-[380px] md:col-span-2 md:min-h-[460px]'
                    : isTallHero
                    ? 'min-h-[340px] md:row-span-2 md:min-h-[520px]'
                    : isFullWidthLast
                    ? 'min-h-[250px] md:col-span-2 md:min-h-[280px]'
                    : 'min-h-[250px]'
                }`}
              >
                <OptimizedImage
                  src={project.image}
                  alt={project.title}
                  loading={index < 2 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : undefined}
                  sizes={
                    isFullWidthLast
                      ? '(min-width: 1152px) 1104px, 100vw'
                      : '(min-width: 768px) 542px, 100vw'
                  }
                  className={`absolute left-0 right-0 top-0 w-full transition-transform duration-500 group-hover:scale-105 ${
                    isSilentArtwork
                      ? 'h-[82%] object-contain object-center px-4 pt-3'
                      : 'h-full object-cover'
                  }`}
                />

                <div
                  className={`absolute inset-0 ${
                    isSilentArtwork
                      ? 'bg-gradient-to-t from-black via-black/30 to-transparent'
                      : 'bg-gradient-to-t from-[#211f2d]/85 via-[#333144]/20 to-transparent'
                  }`}
                />

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                  <h2
                    className={`font-bold text-white ${
                      isTallHero ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
                    }`}
                  >
                    {project.title}
                  </h2>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-[#CFCFE5]">
                    <span className="underline decoration-[#8F99D2]/70 underline-offset-4">
                      {lead.name}
                    </span>
                    <span className="text-[#CFCFE5]/70">{project.date}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};
