import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  BuildProject,
  getMemberById,
  PORTFOLIO_PROJECTS,
} from '../data/mockData';
import { MinecraftHead } from './MinecraftHead';

interface ProjectDetailPageProps {
  project: BuildProject;
  onBack: () => void;
  onSelectProject: (project: BuildProject) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  project,
  onBack,
  onSelectProject,
}) => {
  const lead = getMemberById(project.leadBuilderId);
  const currentIdx = PORTFOLIO_PROJECTS.findIndex((p) => p.id === project.id);
  const nextProject =
    PORTFOLIO_PROJECTS[(currentIdx + 1) % PORTFOLIO_PROJECTS.length];

  return (
    <article className="min-h-screen bg-white">
      {/* Full-bleed Hero Artwork */}
      <div
        className={`relative h-[62vh] min-h-[420px] max-h-[680px] w-full overflow-hidden ${
          project.id === 'silent-movement' ? 'bg-black' : 'bg-[#333144]'
        }`}
      >
        <img
          src={project.image}
          alt={project.title}
          decoding="async"
          className={`h-full w-full ${
            project.id === 'silent-movement'
              ? 'object-contain pb-12 pt-14'
              : 'object-cover'
          }`}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              project.id === 'silent-movement'
                ? 'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.08) 68%, rgba(255,255,255,0.92) 94%, #ffffff 100%)'
                : 'linear-gradient(180deg, rgba(51,49,68,0.28) 0%, rgba(51,49,68,0.12) 55%, rgba(255,255,255,0.92) 92%, #ffffff 100%)',
          }}
        />

        {/* Back Button */}
        <div className="absolute left-6 top-20 z-10">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#CFCFE5] bg-white/92 px-4 py-2 text-xs font-semibold tracking-wide text-[#333144] shadow-sm backdrop-blur-md transition hover:border-[#333144] hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回</span>
          </button>
        </div>
      </div>

      {/* Standalone Editorial Project Page Content */}
      <div className="mx-auto max-w-4xl px-6 pb-24">
        <div className="relative z-10 -mt-12">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#69699F]">
            <span>{project.category}</span>
            <span className="text-[#CFCFE5]">·</span>
            <span className="text-[#333144]/55">{project.date}</span>
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#333144] sm:text-5xl">
            {project.title}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-8 text-[#333144]/75 sm:text-lg">
            {project.summary}
          </p>
        </div>

        {/* Creator & Specs Bar */}
        <div className="mt-10 flex flex-col justify-between gap-6 border-y border-[#CFCFE5] py-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <MinecraftHead
              seed={lead.mcId}
              avatarUrl={lead.avatarUrl}
              size={42}
            />
            <div>
              <div className="text-sm font-bold text-[#333144]">
                {lead.name}
              </div>
              <div className="text-xs text-[#69699F]">{lead.role}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            <div>
              <div className="text-[11px] text-[#333144]/50">建议时长</div>
              <div className="mt-0.5 text-sm font-semibold text-[#333144]">
                {project.playTime}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#333144]/50">游玩人数</div>
              <div className="mt-0.5 text-sm font-semibold text-[#333144]">
                {project.players}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#333144]/50">适配版本</div>
              <div className="mt-0.5 text-sm font-semibold text-[#333144]">
                {project.version}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#333144]/50">参与成员</div>
              <div className="mt-0.5 text-sm font-semibold text-[#333144]">
                {project.buildersCount} 人
              </div>
            </div>
          </div>
        </div>

        {/* Story Paragraphs */}
        <div className="mt-12 space-y-6 text-base leading-8 text-[#333144]/80">
          {project.story.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>

        {/* Next Project Switcher */}
        <div className="mt-16 border-t-2 border-[#CFCFE5] pt-10">
          <button
            type="button"
            onClick={() => onSelectProject(nextProject)}
            className="group flex w-full items-center justify-between gap-6 rounded-md border-2 border-[#CFCFE5] bg-[#f7f7fb] p-4 text-left transition hover:border-[#333144] hover:bg-white sm:p-5"
          >
            <div className="flex items-center gap-4">
              <img
                src={nextProject.image}
                alt={nextProject.title}
                decoding="async"
                className="h-16 w-24 rounded-[4px] object-cover"
              />
              <div>
                <div className="text-xs font-medium text-[#69699F]">
                  {nextProject.category}
                </div>
                <div className="mt-0.5 text-lg font-bold text-[#333144] transition-colors group-hover:text-[#69699F]">
                  {nextProject.title}
                </div>
              </div>
            </div>
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-[#CFCFE5] bg-white text-[#333144] transition group-hover:translate-x-0.5 group-hover:border-[#333144] group-hover:text-[#69699F]">
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </div>
      </div>
    </article>
  );
};
