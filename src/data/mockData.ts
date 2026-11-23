import rawSiteData from '../content/siteData.json';

export type RoleGroup = '剧本创作' | '数据包' | '建筑' | '美工';

export interface ResponsiveImageMeta {
  avif?: string;
  avifSm?: string;
  webp?: string;
  webpSm?: string;
  jpg: string;
  jpgSm?: string;
  width: number;
  height: number;
  smWidth?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  mcId: string;
  isFounder?: boolean;
  role: string;
  groups: RoleGroup[];
  bio: string;
  avatarUrl: string;
  skinUrl: string;
}

export interface BuildProject {
  id: string;
  title: string;
  category: string;
  date: string;
  playTime: string;
  players: string;
  version: string;
  buildersCount: number;
  image: string;
  imageMeta?: ResponsiveImageMeta;
  imageFit?: 'cover' | 'contain';
  downloadUrl?: string;
  downloadLabel?: string;
  videoUrl?: string;
  pageMode?: 'standard' | 'custom_url';
  customPageUrl?: string;
  summary: string;
  story: string[];
  leadBuilderId: string;
}

export interface HomeConfig {
  trailerProjectId: string;
  trailerVideoUrl: string;
  trailerCustomTitle?: string;
  trailerCustomSummary?: string;
  featuredProjectIds: string[];
}

export interface SiteData {
  categories?: string[];
  homeConfig: HomeConfig;
  members: TeamMember[];
  projects: BuildProject[];
}

/**
 * Returns an automatic Minecraft head avatar URL from mcId if avatarUrl is not manually provided.
 */
export function resolveMemberAvatarUrl(mcId: string, avatarUrl?: string): string {
  const trimmed = avatarUrl?.trim();
  if (trimmed) return trimmed;
  const cleanId = mcId.trim() || 'MHF_Steve';
  return `https://mc-heads.net/avatar/${encodeURIComponent(cleanId)}/64`;
}

/**
 * Returns an automatic Minecraft 64x64 skin texture URL from mcId if skinUrl is not manually provided.
 */
export function resolveMemberSkinUrl(mcId: string, skinUrl?: string): string {
  const trimmed = skinUrl?.trim();
  if (trimmed) return trimmed;
  const cleanId = mcId.trim() || 'MHF_Steve';
  return `https://mc-heads.net/skin/${encodeURIComponent(cleanId)}`;
}

const typedSiteData = rawSiteData as unknown as SiteData;

export const HOME_CONFIG: HomeConfig = typedSiteData.homeConfig;

export const TEAM_MEMBERS: TeamMember[] = typedSiteData.members.map((m) => ({
  ...m,
  avatarUrl: resolveMemberAvatarUrl(m.mcId, m.avatarUrl),
  skinUrl: resolveMemberSkinUrl(m.mcId, m.skinUrl),
}));

export const PORTFOLIO_PROJECTS: BuildProject[] = typedSiteData.projects;

export function getFeaturedProjects(
  projects: BuildProject[] = PORTFOLIO_PROJECTS,
  config: HomeConfig = HOME_CONFIG
): BuildProject[] {
  const idMap = new Map(projects.map((p) => [p.id, p]));
  const ordered = config.featuredProjectIds
    .map((id) => idMap.get(id))
    .filter((p): p is BuildProject => Boolean(p));
  return ordered.length > 0 ? ordered : projects;
}

export function getTrailerProject(
  projects: BuildProject[] = PORTFOLIO_PROJECTS,
  config: HomeConfig = HOME_CONFIG
): BuildProject {
  return (
    projects.find((p) => p.id === config.trailerProjectId) ??
    projects[0]
  );
}

export function getMemberById(
  id: string,
  members: TeamMember[] = TEAM_MEMBERS
): TeamMember {
  return members.find((m) => m.id === id) ?? members[0];
}
