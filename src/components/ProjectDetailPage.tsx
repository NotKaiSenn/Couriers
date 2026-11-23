import React from 'react';
import { ArrowLeft, ArrowRight, Download, ExternalLink, Play } from 'lucide-react';
import {
  BuildProject,
  getMemberById,
  PORTFOLIO_PROJECTS,
} from '../data/mockData';
import { MinecraftHead } from './MinecraftHead';
import { OptimizedImage } from './OptimizedImage';

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
  const isContainArtwork =
    project.imageFit === 'contain' || project.id === 'silent-movement';

  return (
    <article className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 pb-24 pt-24">
        {/* Back Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#CFCFE5] bg-white px-4 py-2 text-xs font-semibold tracking-wide text-[#333144] shadow-xs transition hover:border-[#333144]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回</span>
          </button>
        </div>

        {/* Centered Editorial Cover Frame */}
        <div
          className={`aspect-video w-full overflow-hidden rounded-md border-2 border-[#CFCFE5] ${
            isContainArtwork ? 'bg-black' : 'bg-[#333144]'
          }`}
        >
          <OptimizedImage
            src={project.image}
            alt={project.title}
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 896px) 848px, 100vw"
            className={`h-full w-full ${
              isContainArtwork ? 'object-contain' : 'object-cover'
            }`}
          />
        </div>

        {/* Standalone Editorial Project Page Content */}
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#69699F]">
            {project.category && (
              <>
                <span>{project.category}</span>
                <span className="text-[#CFCFE5]">·</span>
              </>
            )}
            <span className="text-[#333144]/55">{project.date}</span>
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#333144] sm:text-5xl">
            {project.title}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-8 text-[#333144]/75 sm:text-lg">
            {project.summary}
          </p>

          {(project.downloadUrl?.trim() ||
            project.videoUrl?.trim() ||
            (project.pageMode !== 'custom_url' && project.customPageUrl?.trim())) && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {project.downloadUrl?.trim() && (
                <a
                  href={project.downloadUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border-2 border-[#333144] bg-[#333144] px-6 py-2.5 text-sm font-bold tracking-wide text-white shadow-md shadow-[#333144]/15 transition hover:border-[#69699F] hover:bg-[#69699F]"
                >
                  <Download className="h-4 w-4" />
                  <span>{project.downloadLabel?.trim() || '下载地图'}</span>
                </a>
              )}

              {project.videoUrl?.trim() && (
                <a
                  href={project.videoUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border-2 border-[#333144] bg-white px-5 py-2.5 text-sm font-bold tracking-wide text-[#333144] transition hover:bg-[#f5f6fb]"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>观看宣传片</span>
                </a>
              )}

              {project.pageMode !== 'custom_url' && project.customPageUrl?.trim() && (
                <a
                  href={project.customPageUrl.trim()}
                  target={/^https?:\/\//i.test(project.customPageUrl.trim()) ? '_blank' : undefined}
                  rel={/^https?:\/\//i.test(project.customPageUrl.trim()) ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center gap-2 rounded-md border-2 border-[#69699F] bg-[#69699F]/10 px-5 py-2.5 text-sm font-bold tracking-wide text-[#333144] transition hover:bg-[#69699F] hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>进入专属网页</span>
                </a>
              )}
            </div>
          )}
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
        {PORTFOLIO_PROJECTS.length > 1 && (
          <div className="mt-16 border-t-2 border-[#CFCFE5] pt-10">
            <button
              type="button"
              onClick={() => onSelectProject(nextProject)}
              className="group flex w-full items-center justify-between gap-6 rounded-md border-2 border-[#CFCFE5] bg-[#f7f7fb] p-4 text-left transition hover:border-[#333144] hover:bg-white sm:p-5"
            >
              <div className="flex items-center gap-4">
                <OptimizedImage
                  src={nextProject.image}
                  alt={nextProject.title}
                  loading="lazy"
                  sizes="96px"
                  className="h-16 w-24 rounded-[4px] object-cover"
                />
                <div>
                  {nextProject.category && (
                    <div className="text-xs font-medium text-[#69699F]">
                      {nextProject.category}
                    </div>
                  )}
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
        )}
      </div>
    </article>
  );
};
