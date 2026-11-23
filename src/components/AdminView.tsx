import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CloudUpload,
  Copy,
  Download,
  ExternalLink,
  FolderKanban,
  Globe,
  GripVertical,
  HardDriveDownload,
  ImagePlus,
  KeyRound,
  LayoutTemplate,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Tv,
  UploadCloud,
  Users,
  X,
} from 'lucide-react';
import rawSiteData from '../content/siteData.json';
import {
  BuildProject,
  HomeConfig,
  ResponsiveImageMeta,
  RoleGroup,
  SiteData,
  TeamMember,
} from '../data/mockData';
import { MinecraftHead } from './MinecraftHead';

const ALL_ROLE_GROUPS: RoleGroup[] = ['剧本创作', '数据包', '建筑', '美工'];

const STORAGE_GATEWAY_URL = 'couriers_cms_gateway_url';
const STORAGE_ACCESS_KEY = 'couriers_cms_access_key';

export interface PendingFileUpload {
  repoPath: string;
  publicUrl: string;
  base64Content: string;
  previewDataUrl: string;
}

interface AdminViewProps {
  onExitAdmin: () => void;
}

/**
 * Extracts a 64x64 crisp pixel avatar (head + hat overlay) from a loaded 64x64 or 64x32 Minecraft skin image.
 */
function extractAvatarFromSkinImage(img: HTMLImageElement): {
  skinBase64: string;
  skinDataUrl: string;
  avatarBase64: string;
  avatarDataUrl: string;
} {
  const skinCanvas = document.createElement('canvas');
  skinCanvas.width = 64;
  skinCanvas.height = img.height === 32 ? 32 : 64;
  const sCtx = skinCanvas.getContext('2d')!;
  sCtx.imageSmoothingEnabled = false;
  sCtx.drawImage(img, 0, 0);
  const skinDataUrl = skinCanvas.toDataURL('image/png');
  const skinBase64 = skinDataUrl.split(',')[1];

  const avatarCanvas = document.createElement('canvas');
  avatarCanvas.width = 64;
  avatarCanvas.height = 64;
  const aCtx = avatarCanvas.getContext('2d')!;
  aCtx.imageSmoothingEnabled = false;
  aCtx.drawImage(img, 8, 8, 8, 8, 0, 0, 64, 64);
  aCtx.drawImage(img, 40, 8, 8, 8, 0, 0, 64, 64);

  const avatarDataUrl = avatarCanvas.toDataURL('image/png');
  const avatarBase64 = avatarDataUrl.split(',')[1];

  return { skinBase64, skinDataUrl, avatarBase64, avatarDataUrl };
}

/**
 * Preserves the uploaded original image file 100% untouched (raw bytes & original resolution),
 * and generates ONLY the additional optimized variants actually referenced by <OptimizedImage>:
 * - Full resolution next-gen variant (<id>.avif or <id>.webp)
 * - 736w card/mobile breakpoint variants (<id>-sm.avif/.webp and <id>-sm.jpg) ONLY when naturalWidth > 736
 */
function buildProjectImageAndReferencedVariants(
  file: File,
  safeId: string
): Promise<{
  originalPublicUrl: string;
  imageMeta: ResponsiveImageMeta;
  uploads: PendingFileUpload[];
}> {
  const SM_WIDTH = 736;

  return new Promise((resolve, reject) => {
    const extMatch = file.name.match(/\.([a-zA-Z0-9]+)$/);
    const rawExt = extMatch ? extMatch[1].toLowerCase() : 'jpg';
    const ext = ['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(rawExt)
      ? rawExt
      : 'jpg';

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('读取原始图片文件失败'));
    reader.onload = () => {
      const originalDataUrl = reader.result as string;
      const originalBase64 = originalDataUrl.split(',')[1];
      const originalPublicUrl = `/images/projects/${safeId}.${ext}`;

      const img = new Image();
      img.onerror = () => reject(new Error('解析图片尺寸失败'));
      img.onload = () => {
        const naturalW = img.naturalWidth || img.width;
        const naturalH = img.naturalHeight || img.height;

        const uploads: PendingFileUpload[] = [
          {
            repoPath: `public${originalPublicUrl}`,
            publicUrl: originalPublicUrl,
            base64Content: originalBase64,
            previewDataUrl: originalDataUrl,
          },
        ];

        const encodeCanvas = (
          targetW: number,
          targetH: number,
          mime: string,
          quality: number
        ): { dataUrl: string; base64: string; actualMime: string } => {
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, targetW, targetH);
          const dataUrl = canvas.toDataURL(mime, quality);
          const actualMime =
            dataUrl.substring(5, dataUrl.indexOf(';')) || 'image/png';
          return {
            dataUrl,
            base64: dataUrl.split(',')[1],
            actualMime,
          };
        };

        let fullNextGen = encodeCanvas(naturalW, naturalH, 'image/avif', 0.82);
        const useAvif = fullNextGen.actualMime === 'image/avif';
        if (!useAvif) {
          fullNextGen = encodeCanvas(naturalW, naturalH, 'image/webp', 0.86);
        }
        const nextGenExt = useAvif ? 'avif' : 'webp';
        const fullNextGenUrl = `/images/projects/${safeId}.${nextGenExt}`;

        if (fullNextGenUrl !== originalPublicUrl) {
          uploads.push({
            repoPath: `public${fullNextGenUrl}`,
            publicUrl: fullNextGenUrl,
            base64Content: fullNextGen.base64,
            previewDataUrl: fullNextGen.dataUrl,
          });
        }

        const imageMeta: ResponsiveImageMeta = {
          jpg: originalPublicUrl,
          width: naturalW,
          height: naturalH,
          ...(useAvif ? { avif: fullNextGenUrl } : { webp: fullNextGenUrl }),
        };

        if (naturalW > SM_WIDTH) {
          const smH = Math.max(
            1,
            Math.round((naturalH * SM_WIDTH) / naturalW)
          );

          const smNextGen = encodeCanvas(
            SM_WIDTH,
            smH,
            useAvif ? 'image/avif' : 'image/webp',
            useAvif ? 0.82 : 0.85
          );
          const smNextGenUrl = `/images/projects/${safeId}-sm.${nextGenExt}`;
          uploads.push({
            repoPath: `public${smNextGenUrl}`,
            publicUrl: smNextGenUrl,
            base64Content: smNextGen.base64,
            previewDataUrl: smNextGen.dataUrl,
          });

          const smJpg = encodeCanvas(SM_WIDTH, smH, 'image/jpeg', 0.86);
          const smJpgUrl = `/images/projects/${safeId}-sm.jpg`;
          uploads.push({
            repoPath: `public${smJpgUrl}`,
            publicUrl: smJpgUrl,
            base64Content: smJpg.base64,
            previewDataUrl: smJpg.dataUrl,
          });

          imageMeta.smWidth = SM_WIDTH;
          imageMeta.jpgSm = smJpgUrl;
          if (useAvif) {
            imageMeta.avifSm = smNextGenUrl;
          } else {
            imageMeta.webpSm = smNextGenUrl;
          }
        }

        resolve({
          originalPublicUrl,
          imageMeta,
          uploads,
        });
      };
      img.src = originalDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function generateSecureMemberKey(memberName: string): string {
  const clean =
    memberName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') || 'member';
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `couriers-${clean}-${hex.slice(0, 8)}-${hex.slice(8, 16)}-${hex.slice(16, 24)}-${hex.slice(24, 32)}`;
}

function reorderList<T>(list: T[], fromIdx: number, toIdx: number): T[] {
  const copy = [...list];
  const [moved] = copy.splice(fromIdx, 1);
  copy.splice(toIdx, 0, moved);
  return copy;
}

export const AdminView: React.FC<AdminViewProps> = ({ onExitAdmin }) => {
  const initialData = rawSiteData as unknown as SiteData;

  const [activeSection, setActiveSection] = useState<
    'projects' | 'home' | 'members' | 'security'
  >('projects');

  const [categories, setCategories] = useState<string[]>(() =>
    Array.from(
      new Set([
        ...(initialData.categories || []),
        ...initialData.projects.map((p) => p.category).filter(Boolean),
      ])
    )
  );
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const [homeConfig, setHomeConfig] = useState<HomeConfig>(() => ({
    ...initialData.homeConfig,
    featuredProjectIds: [...initialData.homeConfig.featuredProjectIds],
  }));
  const [projects, setProjects] = useState<BuildProject[]>(() =>
    initialData.projects.map((p) => ({ ...p, story: [...p.story] }))
  );
  const [members, setMembers] = useState<TeamMember[]>(() =>
    initialData.members.map((m) => ({ ...m, groups: [...m.groups] }))
  );

  const [selectedProjectIdx, setSelectedProjectIdx] = useState(0);
  const [selectedMemberIdx, setSelectedMemberIdx] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  // Drag-and-drop sorting states
  const [projDragIdx, setProjDragIdx] = useState<number | null>(null);
  const [projDropIdx, setProjDropIdx] = useState<number | null>(null);
  const [featuredDragIdx, setFeaturedDragIdx] = useState<number | null>(null);
  const [featuredDropIdx, setFeaturedDropIdx] = useState<number | null>(null);
  const [memberDragIdx, setMemberDragIdx] = useState<number | null>(null);
  const [memberDropIdx, setMemberDropIdx] = useState<number | null>(null);
  const [coverDropActive, setCoverDropActive] = useState(false);

  const [pendingUploads, setPendingUploads] = useState<
    Record<string, PendingFileUpload>
  >({});

  const [skinFetchStatus, setSkinFetchStatus] = useState<
    Record<string, 'idle' | 'fetching' | 'done' | 'error'>
  >({});
  const lastFetchedMcIdRef = useRef<Record<string, string>>({});

  const [gatewayUrl, setGatewayUrl] = useState<string>(
    () => localStorage.getItem(STORAGE_GATEWAY_URL) || ''
  );
  const [accessKey, setAccessKey] = useState<string>(
    () => localStorage.getItem(STORAGE_ACCESS_KEY) || ''
  );
  const [commitNote, setCommitNote] = useState('');
  const [publishState, setPublishState] = useState<
    'idle' | 'publishing' | 'success' | 'error'
  >('idle');
  const [publishMessage, setPublishMessage] = useState('');

  const [keyGenMemberName, setKeyGenMemberName] = useState('Carbonado404');
  const [generatedKey, setGeneratedKey] = useState(() =>
    generateSecureMemberKey('Carbonado404')
  );
  const [copiedKey, setCopiedKey] = useState(false);

  const isLocalDev = Boolean(
    (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV
  );
  const useLocalSaveMode = isLocalDev && !gatewayUrl.trim();

  useEffect(() => {
    localStorage.setItem(STORAGE_GATEWAY_URL, gatewayUrl.trim());
  }, [gatewayUrl]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ACCESS_KEY, accessKey.trim());
  }, [accessKey]);

  const currentMember = members[selectedMemberIdx];
  useEffect(() => {
    if (!currentMember) return;
    const mcId = currentMember.mcId.trim();
    const memberId = currentMember.id;
    if (!mcId || mcId.length < 2) return;

    if (lastFetchedMcIdRef.current[memberId] === mcId) return;
    const initialMember = initialData.members.find((m) => m.id === memberId);
    if (initialMember && initialMember.mcId === mcId && currentMember.skinUrl) {
      lastFetchedMcIdRef.current[memberId] = mcId;
      return;
    }

    const timer = window.setTimeout(() => {
      setSkinFetchStatus((prev) => ({ ...prev, [memberId]: 'fetching' }));
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const {
            skinBase64,
            skinDataUrl,
            avatarBase64,
            avatarDataUrl,
          } = extractAvatarFromSkinImage(img);

          const skinPublicUrl = `/images/skins/${mcId}.png`;
          const avatarPublicUrl = `/images/avatars/${mcId}.png`;

          setPendingUploads((prev) => ({
            ...prev,
            [skinPublicUrl]: {
              repoPath: `public${skinPublicUrl}`,
              publicUrl: skinPublicUrl,
              base64Content: skinBase64,
              previewDataUrl: skinDataUrl,
            },
            [avatarPublicUrl]: {
              repoPath: `public${avatarPublicUrl}`,
              publicUrl: avatarPublicUrl,
              base64Content: avatarBase64,
              previewDataUrl: avatarDataUrl,
            },
          }));

          setMembers((prev) =>
            prev.map((m) =>
              m.id === memberId
                ? { ...m, skinUrl: skinPublicUrl, avatarUrl: avatarPublicUrl }
                : m
            )
          );
          setIsDirty(true);
          lastFetchedMcIdRef.current[memberId] = mcId;
          setSkinFetchStatus((prev) => ({ ...prev, [memberId]: 'done' }));
        } catch {
          setSkinFetchStatus((prev) => ({ ...prev, [memberId]: 'error' }));
        }
      };
      img.onerror = () => {
        setSkinFetchStatus((prev) => ({ ...prev, [memberId]: 'error' }));
      };
      img.src = `https://mc-heads.net/skin/${encodeURIComponent(mcId)}`;
    }, 550);

    return () => window.clearTimeout(timer);
  }, [currentMember?.mcId, currentMember?.id]);

  const resolvePreviewUrl = (publicUrl: string): string => {
    return pendingUploads[publicUrl]?.previewDataUrl || publicUrl;
  };

  // --- Project helpers ---
  const activeProject = projects[selectedProjectIdx] ?? projects[0];

  const updateActiveProject = (patch: Partial<BuildProject>) => {
    setIsDirty(true);
    setProjects((prev) =>
      prev.map((p, idx) =>
        idx === selectedProjectIdx ? { ...p, ...patch } : p
      )
    );
  };

  const handleAddProject = () => {
    const newId = `project-${Date.now().toString().slice(-4)}`;
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const newProj: BuildProject = {
      id: newId,
      title: '未命名作品',
      category: '',
      date: ym,
      playTime: '约 60 分钟',
      players: '1–2 人',
      version: 'Java 1.21.4',
      buildersCount: 1,
      image: '/images/project-silent.jpg',
      imageFit: 'cover',
      downloadUrl: '',
      downloadLabel: '下载地图',
      videoUrl: '',
      pageMode: 'standard',
      customPageUrl: '',
      summary: '',
      story: [''],
      leadBuilderId: members[0]?.id || 'rainswallow',
    };
    setProjects((prev) => [newProj, ...prev]);
    setHomeConfig((prev) => ({
      ...prev,
      featuredProjectIds: [newId, ...prev.featuredProjectIds],
    }));
    setSelectedProjectIdx(0);
    setIsDirty(true);
  };

  const handleDeleteProject = (idx: number) => {
    if (projects.length <= 1) return;
    const target = projects[idx];
    if (!window.confirm(`确定要删除作品《${target.title}》吗？`)) return;
    setProjects((prev) => prev.filter((_, i) => i !== idx));
    setHomeConfig((prev) => ({
      ...prev,
      featuredProjectIds: prev.featuredProjectIds.filter(
        (id) => id !== target.id
      ),
      trailerProjectId:
        prev.trailerProjectId === target.id
          ? projects.find((_, i) => i !== idx)?.id || ''
          : prev.trailerProjectId,
    }));
    setSelectedProjectIdx(Math.max(0, idx - 1));
    setIsDirty(true);
  };

  const handleProjectDrop = (targetIdx: number) => {
    if (projDragIdx === null || projDragIdx === targetIdx) {
      setProjDragIdx(null);
      setProjDropIdx(null);
      return;
    }
    const selectedId = activeProject?.id;
    const reordered = reorderList(projects, projDragIdx, targetIdx);
    setProjects(reordered);
    if (selectedId) {
      const nextSelectedIdx = reordered.findIndex((p) => p.id === selectedId);
      if (nextSelectedIdx !== -1) setSelectedProjectIdx(nextSelectedIdx);
    }
    setProjDragIdx(null);
    setProjDropIdx(null);
    setIsDirty(true);
  };

  const processCoverFile = async (file: File) => {
    if (!activeProject) return;
    try {
      const safeId =
        activeProject.id
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-_]/g, '-') || `project-${Date.now()}`;
      const { originalPublicUrl, imageMeta, uploads } =
        await buildProjectImageAndReferencedVariants(file, safeId);

      setPendingUploads((prev) => {
        const next = { ...prev };
        for (const u of uploads) {
          next[u.publicUrl] = u;
        }
        return next;
      });
      updateActiveProject({
        image: originalPublicUrl,
        imageMeta,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : '图片读取失败');
    }
  };

  const handleProjectImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) await processCoverFile(file);
  };

  // --- Member helpers ---
  const updateActiveMember = (patch: Partial<TeamMember>) => {
    setIsDirty(true);
    setMembers((prev) =>
      prev.map((m, idx) =>
        idx === selectedMemberIdx ? { ...m, ...patch } : m
      )
    );
  };

  const handleAddMember = () => {
    const newId = `member_${Date.now().toString().slice(-4)}`;
    const newMember: TeamMember = {
      id: newId,
      name: '新成员',
      mcId: '',
      isFounder: false,
      role: '建筑',
      groups: ['建筑'],
      bio: '',
      avatarUrl: '',
      skinUrl: '',
    };
    setMembers((prev) => [...prev, newMember]);
    setSelectedMemberIdx(members.length);
    setIsDirty(true);
  };

  const handleDeleteMember = (idx: number) => {
    if (members.length <= 1) return;
    const target = members[idx];
    if (!window.confirm(`确定要移除成员「${target.name}」吗？`)) return;
    setMembers((prev) => prev.filter((_, i) => i !== idx));
    setSelectedMemberIdx(Math.max(0, idx - 1));
    setIsDirty(true);
  };

  const handleMemberDrop = (targetIdx: number) => {
    if (memberDragIdx === null || memberDragIdx === targetIdx) {
      setMemberDragIdx(null);
      setMemberDropIdx(null);
      return;
    }
    const selectedId = currentMember?.id;
    const reordered = reorderList(members, memberDragIdx, targetIdx);
    setMembers(reordered);
    if (selectedId) {
      const nextSelectedIdx = reordered.findIndex((m) => m.id === selectedId);
      if (nextSelectedIdx !== -1) setSelectedMemberIdx(nextSelectedIdx);
    }
    setMemberDragIdx(null);
    setMemberDropIdx(null);
    setIsDirty(true);
  };

  const handleCustomSkinUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentMember) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rawSkinDataUrl = reader.result as string;
      const rawSkinBase64 = rawSkinDataUrl.split(',')[1];
      const img = new Image();
      img.onload = () => {
        const { avatarBase64, avatarDataUrl } = extractAvatarFromSkinImage(img);
        const safeName =
          (currentMember.mcId || currentMember.id)
            .trim()
            .replace(/[^a-zA-Z0-9_-]/g, '_') || 'custom';
        const skinPublicUrl = `/images/skins/${safeName}.png`;
        const avatarPublicUrl = `/images/avatars/${safeName}.png`;

        setPendingUploads((prev) => ({
          ...prev,
          [skinPublicUrl]: {
            repoPath: `public${skinPublicUrl}`,
            publicUrl: skinPublicUrl,
            base64Content: rawSkinBase64,
            previewDataUrl: rawSkinDataUrl,
          },
          [avatarPublicUrl]: {
            repoPath: `public${avatarPublicUrl}`,
            publicUrl: avatarPublicUrl,
            base64Content: avatarBase64,
            previewDataUrl: avatarDataUrl,
          },
        }));
        updateActiveMember({
          skinUrl: skinPublicUrl,
          avatarUrl: avatarPublicUrl,
        });
      };
      img.src = rawSkinDataUrl;
    };
    reader.readAsDataURL(file);
  };

  // --- Home featured rotation helpers ---
  const toggleFeaturedProject = (projectId: string) => {
    setIsDirty(true);
    setHomeConfig((prev) => {
      const exists = prev.featuredProjectIds.includes(projectId);
      const next = exists
        ? prev.featuredProjectIds.filter((id) => id !== projectId)
        : [...prev.featuredProjectIds, projectId];
      return { ...prev, featuredProjectIds: next };
    });
  };

  const handleFeaturedDrop = (targetIdx: number) => {
    if (featuredDragIdx === null || featuredDragIdx === targetIdx) {
      setFeaturedDragIdx(null);
      setFeaturedDropIdx(null);
      return;
    }
    setIsDirty(true);
    setHomeConfig((prev) => ({
      ...prev,
      featuredProjectIds: reorderList(
        prev.featuredProjectIds,
        featuredDragIdx,
        targetIdx
      ),
    }));
    setFeaturedDragIdx(null);
    setFeaturedDropIdx(null);
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    setCategories((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    if (activeProject) {
      updateActiveProject({ category: trimmed });
    }
    setNewCategoryInput('');
    setIsDirty(true);
  };

  const handleDeleteCategory = (cat: string) => {
    setCategories((prev) => prev.filter((c) => c !== cat));
    setProjects((prev) =>
      prev.map((p) => (p.category === cat ? { ...p, category: '' } : p))
    );
    setIsDirty(true);
  };

  // --- Save / Publish ---
  const handleDownloadJson = () => {
    const payload: SiteData = {
      categories,
      homeConfig,
      members,
      projects,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'siteData.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveOrPublish = async () => {
    const siteDataPayload: SiteData = {
      categories,
      homeConfig,
      members,
      projects,
    };
    const filesToCommit = Object.values(pendingUploads).map((item) => ({
      path: item.repoPath,
      contentBase64: item.base64Content,
    }));

    // Local dev disk write when running Vite dev server without remote gateway configured
    if (useLocalSaveMode) {
      setPublishState('publishing');
      setPublishMessage('正在将改动与图片保存到本地仓库...');
      try {
        const res = await fetch('/__cms_local_save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siteData: siteDataPayload,
            files: filesToCommit,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
        };
        if (!res.ok || !data.ok) {
          throw new Error(data.error || `保存失败 (HTTP ${res.status})`);
        }
        setPendingUploads({});
        setIsDirty(false);
        setPublishState('success');
        setPublishMessage(
          '已直接保存到本地项目文件（src/content/siteData.json 与 public/images/），返回前台即可看到最新效果。'
        );
      } catch (err) {
        setPublishState('error');
        setPublishMessage(
          err instanceof Error ? err.message : '本地保存失败'
        );
      }
      return;
    }

    if (!gatewayUrl.trim()) {
      setActiveSection('security');
      setPublishState('error');
      setPublishMessage('请先填写 Cloudflare Worker 网关地址');
      return;
    }
    if (!accessKey.trim()) {
      setActiveSection('security');
      setPublishState('error');
      setPublishMessage('请先填写你的成员专属通行密钥');
      return;
    }

    setPublishState('publishing');
    setPublishMessage('正在加密提交数据与图片到 GitHub 仓库...');

    try {
      const res = await fetch(gatewayUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessKey.trim()}`,
        },
        body: JSON.stringify({
          message: commitNote.trim() || '更新网站作品与成员数据',
          siteData: siteDataPayload,
          files: filesToCommit,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        author?: string;
      };

      if (!res.ok || !data.ok) {
        throw new Error(data.error || `提交失败 (HTTP ${res.status})`);
      }

      setPendingUploads({});
      setCommitNote('');
      setIsDirty(false);
      setPublishState('success');
      setPublishMessage(
        `发布成功（操作人: ${data.author || '团队成员'}）！GitHub Pages 正在重新构建，约 1 分钟后上线。`
      );
    } catch (err) {
      setPublishState('error');
      setPublishMessage(
        err instanceof Error ? err.message : '网络请求失败，请检查网关地址'
      );
    }
  };

  const navItems = [
    {
      id: 'projects' as const,
      label: '作品管理',
      badge: projects.length,
      icon: FolderKanban,
    },
    {
      id: 'home' as const,
      label: '首页展示与宣传片',
      icon: Tv,
    },
    {
      id: 'members' as const,
      label: '团队成员',
      badge: members.length,
      icon: Users,
    },
    {
      id: 'security' as const,
      label: '发布设置与密钥',
      icon: KeyRound,
    },
  ];

  return (
    <div className="min-h-screen bg-[#eef0f6] pb-24 text-[#252333]">
      {/* Sticky Top Workbench Bar */}
      <div className="sticky top-0 z-30 border-b border-[#d5d7e6] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExitAdmin}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#d5d7e6] bg-[#f7f8fc] px-3 py-1.5 text-xs font-semibold text-[#333144] transition hover:border-[#333144] hover:bg-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>返回网站</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-[#252333] sm:text-lg">
                  内容管理工作台
                </h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    useLocalSaveMode
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-[#69699F]/15 text-[#525386]'
                  }`}
                >
                  {useLocalSaveMode ? '本地直存模式' : '云端发布模式'}
                </span>
                {isDirty && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                    有未保存修改
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#d5d7e6] bg-white px-3.5 py-2 text-xs font-semibold text-[#333144] transition hover:border-[#333144]"
            >
              <HardDriveDownload className="h-3.5 w-3.5" />
              <span>导出 JSON</span>
            </button>

            <button
              type="button"
              onClick={handleSaveOrPublish}
              disabled={publishState === 'publishing'}
              className="inline-flex items-center gap-2 rounded-lg bg-[#333144] px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#525386] disabled:opacity-60 sm:text-sm"
            >
              {publishState === 'publishing' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CloudUpload className="h-4 w-4" />
              )}
              <span>
                {useLocalSaveMode ? '保存到本地' : '保存并发布上线'}
                {Object.keys(pendingUploads).length > 0
                  ? ` (+${Object.keys(pendingUploads).length}图)`
                  : ''}
              </span>
            </button>
          </div>
        </div>

        {/* Clean Navigation Tabs */}
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`relative flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition ${
                  active
                    ? 'border-[#333144] text-[#333144]'
                    : 'border-transparent text-[#333144]/55 hover:text-[#333144]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {typeof item.badge === 'number' && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      active
                        ? 'bg-[#333144] text-white'
                        : 'bg-[#e3e5f0] text-[#333144]/75'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-6xl px-4 sm:px-6">
        {/* Feedback Alert */}
        {publishState !== 'idle' && (
          <div
            className={`mb-6 flex items-center justify-between gap-4 rounded-xl border px-5 py-3.5 text-sm font-medium shadow-xs ${
              publishState === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : publishState === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-900'
                : 'border-[#CFCFE5] bg-white text-[#333144]'
            }`}
          >
            <span>{publishMessage}</span>
            <button
              type="button"
              onClick={() => setPublishState('idle')}
              className="shrink-0 text-xs font-bold underline"
            >
              知道了
            </button>
          </div>
        )}

        {/* ==================== 1. PROJECTS TAB ==================== */}
        {activeSection === 'projects' && (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[290px_1fr]">
            {/* Left Draggable List */}
            <aside className="rounded-xl border border-[#d9dbe8] bg-white p-4 shadow-xs">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-[#252333]">
                    作品列表
                  </h2>
                  <p className="mt-0.5 text-xs text-[#333144]/55">
                    拖动左侧手柄调整排序
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#69699F] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#525386]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>新增</span>
                </button>
              </div>

              <div className="space-y-2">
                {projects.map((proj, idx) => {
                  const selected = idx === selectedProjectIdx;
                  const isDragging = projDragIdx === idx;
                  const isDropTarget =
                    projDropIdx === idx && projDragIdx !== idx;
                  return (
                    <div
                      key={proj.id}
                      draggable
                      onDragStart={(e) => {
                        setProjDragIdx(idx);
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', String(idx));
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (projDropIdx !== idx) setProjDropIdx(idx);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleProjectDrop(idx);
                      }}
                      onDragEnd={() => {
                        setProjDragIdx(null);
                        setProjDropIdx(null);
                      }}
                      onClick={() => setSelectedProjectIdx(idx)}
                      className={`group flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 transition ${
                        isDragging ? 'opacity-45' : ''
                      } ${
                        isDropTarget
                          ? 'border-[#69699F] ring-2 ring-[#69699F]/30'
                          : selected
                          ? 'border-[#333144] bg-[#333144] text-white shadow-sm'
                          : 'border-[#e3e5f0] bg-[#f8f9fc] text-[#252333] hover:border-[#b9bdd4] hover:bg-white'
                      }`}
                    >
                      <span
                        title="按住拖动排序"
                        className={`cursor-grab active:cursor-grabbing ${
                          selected ? 'text-white/55' : 'text-[#333144]/35'
                        }`}
                      >
                        <GripVertical className="h-4 w-4" />
                      </span>

                      <img
                        src={resolvePreviewUrl(proj.image)}
                        alt={proj.title}
                        className="h-11 w-11 shrink-0 rounded-md object-cover bg-black/20"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold">
                          {proj.title || '未命名作品'}
                        </div>
                        <div
                          className={`mt-0.5 flex items-center gap-1.5 text-xs ${
                            selected ? 'text-[#CFCFE5]' : 'text-[#333144]/60'
                          }`}
                        >
                          <span>{proj.category || '未分类'}</span>
                          {proj.pageMode === 'custom_url' && (
                            <span className="rounded bg-[#69699F] px-1.5 py-0 text-[10px] text-white">
                              专属网页
                            </span>
                          )}
                          {proj.downloadUrl?.trim() && (
                            <span
                              className={`rounded px-1.5 py-0 text-[10px] ${
                                selected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              含下载
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Right Editor Workbench (3 spacious focused cards) */}
            {activeProject && (
              <div className="space-y-6">
                {/* CARD A: Core Display (Cover, Title, Category, Summary) */}
                <section className="rounded-xl border border-[#d9dbe8] bg-white p-6 shadow-xs sm:p-8">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#69699F]">
                        第一步 · 视觉与基础展示
                      </span>
                      <h2 className="mt-1 text-xl font-extrabold text-[#252333]">
                        {activeProject.title || '未命名作品'}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteProject(selectedProjectIdx)}
                      disabled={projects.length <= 1}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>删除作品</span>
                    </button>
                  </div>

                  {/* Cover Image Dropzone */}
                  <div className="mb-6">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <label className="text-sm font-bold text-[#252333]">
                        作品封面图
                      </label>
                      <div className="flex items-center gap-1.5 rounded-lg bg-[#f3f4f9] p-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateActiveProject({ imageFit: 'cover' })
                          }
                          className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                            (activeProject.imageFit || 'cover') === 'cover'
                              ? 'bg-[#333144] text-white shadow-xs'
                              : 'text-[#333144]/70 hover:text-[#333144]'
                          }`}
                        >
                          铺满裁切（场景图）
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateActiveProject({ imageFit: 'contain' })
                          }
                          className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                            activeProject.imageFit === 'contain'
                              ? 'bg-black text-white shadow-xs'
                              : 'text-[#333144]/70 hover:text-[#333144]'
                          }`}
                        >
                          黑底完整展示（带字海报）
                        </button>
                      </div>
                    </div>

                    <label
                      onDragOver={(e) => {
                        e.preventDefault();
                        setCoverDropActive(true);
                      }}
                      onDragLeave={() => setCoverDropActive(false)}
                      onDrop={async (e) => {
                        e.preventDefault();
                        setCoverDropActive(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                          await processCoverFile(file);
                        }
                      }}
                      className={`group relative block aspect-[16/9] max-h-[300px] w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition ${
                        coverDropActive
                          ? 'border-[#69699F] ring-4 ring-[#69699F]/20'
                          : 'border-[#c8cbe0] hover:border-[#333144]'
                      } ${
                        activeProject.imageFit === 'contain'
                          ? 'bg-black'
                          : 'bg-[#252333]'
                      }`}
                    >
                      <img
                        src={resolvePreviewUrl(activeProject.image)}
                        alt={activeProject.title}
                        className={`h-full w-full transition duration-300 group-hover:opacity-75 ${
                          activeProject.imageFit === 'contain'
                            ? 'object-contain p-3'
                            : 'object-cover'
                        }`}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 opacity-0 transition group-hover:opacity-100">
                        <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-[#252333] shadow-lg">
                          <UploadCloud className="h-4 w-4 text-[#69699F]" />
                          <span>点击上传新封面，或将图片拖入此处</span>
                        </div>
                        <p className="mt-2 text-xs text-white/85">
                          原图 100% 保留不压缩，仅额外生成网页引用的 736w 优化版本
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProjectImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Title, Slug & Category */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-bold text-[#252333]">
                        作品名称
                      </label>
                      <input
                        type="text"
                        value={activeProject.title}
                        onChange={(e) =>
                          updateActiveProject({ title: e.target.value })
                        }
                        placeholder="例如：沉默乐章：错位音"
                        className="mt-2 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-4 py-2.5 text-base font-bold text-[#252333] focus:border-[#333144] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#252333]">
                        英文标识 (用于图片命名与链接)
                      </label>
                      <input
                        type="text"
                        value={activeProject.id}
                        onChange={(e) =>
                          updateActiveProject({
                            id: e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-_]/g, '-'),
                          })
                        }
                        placeholder="silent-movement"
                        className="mt-2 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-4 py-2.5 font-mono text-sm text-[#333144] focus:border-[#333144] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Category Pills + Custom Add/Delete */}
                  <div className="mt-5">
                    <label className="block text-sm font-bold text-[#252333]">
                      作品分类
                    </label>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {categories.length === 0 ? (
                        <span className="text-xs text-[#333144]/55">
                          暂未添加分类标签，请在下方输入名称并点击「添加分类」
                        </span>
                      ) : (
                        categories.map((cat) => {
                          const selected = activeProject.category === cat;
                          return (
                            <div
                              key={cat}
                              className={`inline-flex items-center overflow-hidden rounded-lg border text-xs font-bold transition ${
                                selected
                                  ? 'border-[#333144] bg-[#333144] text-white'
                                  : 'border-[#d5d7e6] bg-[#f8f9fc] text-[#333144]/80 hover:border-[#333144]'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  updateActiveProject({
                                    category: selected ? '' : cat,
                                  })
                                }
                                className="px-3 py-1.5"
                              >
                                {cat}
                              </button>
                              <button
                                type="button"
                                title={`删除分类「${cat}」`}
                                onClick={() => handleDeleteCategory(cat)}
                                className={`border-l px-1.5 py-1.5 transition ${
                                  selected
                                    ? 'border-white/20 text-white/75 hover:bg-white/15 hover:text-white'
                                    : 'border-[#d5d7e6] text-[#333144]/45 hover:bg-rose-50 hover:text-rose-600'
                                }`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="mt-3 flex max-w-sm items-center gap-2">
                      <input
                        type="text"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCategory();
                          }
                        }}
                        placeholder="输入新分类名称，如：叙事解谜"
                        className="flex-1 rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-3 py-2 text-xs font-semibold text-[#252333] focus:border-[#333144] focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#69699F] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#525386]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>添加分类</span>
                      </button>
                    </div>
                  </div>

                  {/* One-line summary */}
                  <div className="mt-5">
                    <label className="block text-sm font-bold text-[#252333]">
                      一句话简介
                    </label>
                    <textarea
                      rows={2}
                      value={activeProject.summary}
                      onChange={(e) =>
                        updateActiveProject({ summary: e.target.value })
                      }
                      placeholder="用一两句话概括地图氛围或故事钩子，将展示在首页预告与作品详情页顶部..."
                      className="mt-2 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] p-3.5 text-sm leading-6 text-[#252333] focus:border-[#333144] focus:bg-white focus:outline-none"
                    />
                  </div>
                </section>

                {/* CARD B: Download Button & Custom Webpage Mode */}
                <section className="rounded-xl border border-[#d9dbe8] bg-white p-6 shadow-xs sm:p-8">
                  <div className="mb-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#69699F]">
                      第二步 · 地图下载与页面形式
                    </span>
                    <h3 className="mt-1 text-lg font-extrabold text-[#252333]">
                      下载按钮、宣传片与专属网页设置
                    </h3>
                  </div>

                  {/* Download button block */}
                  <div className="rounded-xl border border-[#e3e5f0] bg-[#f8f9fc] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-extrabold text-[#252333]">
                        <Download className="h-4 w-4 text-[#69699F]" />
                        <span>地图下载按钮</span>
                      </div>

                      {activeProject.downloadUrl?.trim() ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-[#333144] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs">
                          <Download className="h-3.5 w-3.5" />
                          <span>
                            预览：{activeProject.downloadLabel?.trim() || '下载地图'}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#333144]/50">
                          未填写链接，详情页暂不显示下载按钮
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_200px]">
                      <div>
                        <label className="block text-xs font-bold text-[#333144]/75">
                          地图下载地址（网盘分享链接或直链）
                        </label>
                        <input
                          type="url"
                          value={activeProject.downloadUrl || ''}
                          onChange={(e) =>
                            updateActiveProject({ downloadUrl: e.target.value })
                          }
                          placeholder="https://pan.baidu.com/... 或 GitHub Release / CurseForge 链接"
                          className="mt-1.5 w-full rounded-lg border border-[#cfd2e3] bg-white px-3.5 py-2.5 text-sm focus:border-[#333144] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#333144]/75">
                          按钮文字
                        </label>
                        <input
                          type="text"
                          value={activeProject.downloadLabel ?? '下载地图'}
                          onChange={(e) =>
                            updateActiveProject({
                              downloadLabel: e.target.value,
                            })
                          }
                          placeholder="下载地图"
                          className="mt-1.5 w-full rounded-lg border border-[#cfd2e3] bg-white px-3.5 py-2.5 text-sm font-semibold focus:border-[#333144] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Page Mode Switcher */}
                  <div className="mt-5">
                    <label className="block text-sm font-bold text-[#252333]">
                      点击作品时的页面打开方式
                    </label>
                    <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveProject({ pageMode: 'standard' })
                        }
                        className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition ${
                          (activeProject.pageMode || 'standard') === 'standard'
                            ? 'border-[#333144] bg-[#333144]/5'
                            : 'border-[#e3e5f0] bg-white hover:border-[#b9bdd4]'
                        }`}
                      >
                        <LayoutTemplate className="mt-0.5 h-5 w-5 shrink-0 text-[#333144]" />
                        <div>
                          <div className="text-sm font-extrabold text-[#252333]">
                            使用标准作品详情页
                          </div>
                          <p className="mt-1 text-xs leading-5 text-[#333144]/65">
                            打开站内统一排版的图文详情页，展示地图参数、下载按钮和下文介绍。
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateActiveProject({ pageMode: 'custom_url' })
                        }
                        className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition ${
                          activeProject.pageMode === 'custom_url'
                            ? 'border-[#69699F] bg-[#69699F]/8'
                            : 'border-[#e3e5f0] bg-white hover:border-[#b9bdd4]'
                        }`}
                      >
                        <Globe className="mt-0.5 h-5 w-5 shrink-0 text-[#69699F]" />
                        <div>
                          <div className="text-sm font-extrabold text-[#252333]">
                            跳转至专属定制网页
                          </div>
                          <p className="mt-1 text-xs leading-5 text-[#333144]/65">
                            该作品有专门设计的专题网页时选择此项，点击作品卡片直接进入定制页面。
                          </p>
                        </div>
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-[#333144]/75">
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>
                            {activeProject.pageMode === 'custom_url'
                              ? '专属定制网页地址（必填）'
                              : '专属网页补充链接（选填，填写后详情页会多一个跳转按钮）'}
                          </span>
                        </label>
                        <input
                          type="text"
                          value={activeProject.customPageUrl || ''}
                          onChange={(e) =>
                            updateActiveProject({
                              customPageUrl: e.target.value,
                            })
                          }
                          placeholder="/special/silent-movement/ 或 https://..."
                          className="mt-1.5 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-3.5 py-2.5 text-sm focus:border-[#333144] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-[#333144]/75">
                          <Play className="h-3.5 w-3.5" />
                          <span>Bilibili 宣传片链接（选填）</span>
                        </label>
                        <input
                          type="url"
                          value={activeProject.videoUrl || ''}
                          onChange={(e) =>
                            updateActiveProject({ videoUrl: e.target.value })
                          }
                          placeholder="https://www.bilibili.com/video/BV..."
                          className="mt-1.5 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-3.5 py-2.5 text-sm focus:border-[#333144] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* CARD C: Story & Map Specs */}
                <section
                  className={`rounded-xl border border-[#d9dbe8] bg-white p-6 shadow-xs sm:p-8 ${
                    activeProject.pageMode === 'custom_url' ? 'opacity-75' : ''
                  }`}
                >
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#69699F]">
                        第三步 · 详细介绍与地图参数
                      </span>
                      <h3 className="mt-1 text-lg font-extrabold text-[#252333]">
                        正文故事与规格参数
                      </h3>
                    </div>
                    {activeProject.pageMode === 'custom_url' && (
                      <span className="rounded-md bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                        已设为直接跳转专属网页，此区域仅作站内档案留存
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#252333]">
                      详情页正文介绍（直接回车分段）
                    </label>
                    <textarea
                      rows={7}
                      value={activeProject.story.join('\n\n')}
                      onChange={(e) =>
                        updateActiveProject({
                          story: e.target.value
                            .split(/\n+/)
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="在这里讲述地图的背景设定、解谜/机关特色、团队创作故事..."
                      className="mt-2 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] p-4 text-sm leading-7 text-[#252333] focus:border-[#333144] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-bold text-[#333144]/75">
                        主创负责人
                      </label>
                      <select
                        value={activeProject.leadBuilderId}
                        onChange={(e) =>
                          updateActiveProject({ leadBuilderId: e.target.value })
                        }
                        className="mt-1.5 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-3 py-2.5 text-sm font-semibold focus:border-[#333144] focus:bg-white focus:outline-none"
                      >
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} · {m.role}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#333144]/75">
                        发布年月 (YYYY-MM)
                      </label>
                      <input
                        type="text"
                        value={activeProject.date}
                        onChange={(e) =>
                          updateActiveProject({ date: e.target.value })
                        }
                        placeholder="2026-11"
                        className="mt-1.5 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-3 py-2.5 text-sm focus:border-[#333144] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#333144]/75">
                        适配 MC 版本
                      </label>
                      <input
                        type="text"
                        value={activeProject.version}
                        onChange={(e) =>
                          updateActiveProject({ version: e.target.value })
                        }
                        placeholder="Java 1.21.4"
                        className="mt-1.5 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-3 py-2.5 text-sm focus:border-[#333144] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#333144]/75">
                        建议游玩时长
                      </label>
                      <input
                        type="text"
                        value={activeProject.playTime}
                        onChange={(e) =>
                          updateActiveProject({ playTime: e.target.value })
                        }
                        placeholder="约 90 分钟"
                        className="mt-1.5 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-3 py-2.5 text-sm focus:border-[#333144] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#333144]/75">
                        游玩人数
                      </label>
                      <input
                        type="text"
                        value={activeProject.players}
                        onChange={(e) =>
                          updateActiveProject({ players: e.target.value })
                        }
                        placeholder="1–2 人"
                        className="mt-1.5 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-3 py-2.5 text-sm focus:border-[#333144] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#333144]/75">
                        参与制作人数
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={activeProject.buildersCount}
                        onChange={(e) =>
                          updateActiveProject({
                            buildersCount: Math.max(
                              1,
                              Number.parseInt(e.target.value || '1', 10)
                            ),
                          })
                        }
                        className="mt-1.5 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-3 py-2.5 text-sm focus:border-[#333144] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        )}

        {/* ==================== 2. HOME CONFIG TAB ==================== */}
        {activeSection === 'home' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left: Featured Carousel with Drag & Drop */}
            <section className="rounded-xl border border-[#d9dbe8] bg-white p-6 shadow-xs sm:p-8">
              <h2 className="text-lg font-extrabold text-[#252333]">
                首页「作品」展示与轮换顺序
              </h2>
              <p className="mt-1 text-sm text-[#333144]/65">
                按住卡片左侧手柄上下拖动，即可调整作品在首页的展示顺序。
              </p>

              <div className="mt-5 space-y-2.5">
                {homeConfig.featuredProjectIds.map((id, idx) => {
                  const proj = projects.find((p) => p.id === id);
                  if (!proj) return null;
                  const isDragging = featuredDragIdx === idx;
                  const isDropTarget =
                    featuredDropIdx === idx && featuredDragIdx !== idx;
                  return (
                    <div
                      key={id}
                      draggable
                      onDragStart={(e) => {
                        setFeaturedDragIdx(idx);
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', String(idx));
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (featuredDropIdx !== idx) setFeaturedDropIdx(idx);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleFeaturedDrop(idx);
                      }}
                      onDragEnd={() => {
                        setFeaturedDragIdx(null);
                        setFeaturedDropIdx(null);
                      }}
                      className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition ${
                        isDragging ? 'opacity-45' : ''
                      } ${
                        isDropTarget
                          ? 'border-[#69699F] bg-[#69699F]/5 ring-2 ring-[#69699F]/30'
                          : 'border-[#d5d7e6] bg-[#f8f9fc]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          title="按住拖动排序"
                          className="cursor-grab text-[#333144]/40 active:cursor-grabbing"
                        >
                          <GripVertical className="h-4 w-4" />
                        </span>
                        <span className="grid h-6 w-6 place-items-center rounded-md bg-[#333144] text-xs font-bold text-white">
                          {idx + 1}
                        </span>
                        <img
                          src={resolvePreviewUrl(proj.image)}
                          alt={proj.title}
                          className="h-11 w-11 rounded-md object-cover"
                        />
                        <div>
                          <div className="text-sm font-bold text-[#252333]">
                            {proj.title}
                          </div>
                          <div className="text-xs text-[#69699F]">
                            {proj.category} · {proj.date}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleFeaturedProject(id)}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        移出首页
                      </button>
                    </div>
                  );
                })}
              </div>

              {projects.some(
                (p) => !homeConfig.featuredProjectIds.includes(p.id)
              ) && (
                <div className="mt-6 border-t border-[#e3e5f0] pt-5">
                  <div className="mb-2.5 text-xs font-bold text-[#333144]/65">
                    未加入首页的作品（点击添加到首页）：
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {projects
                      .filter(
                        (p) => !homeConfig.featuredProjectIds.includes(p.id)
                      )
                      .map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleFeaturedProject(p.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#d5d7e6] bg-white px-3.5 py-2 text-xs font-bold text-[#252333] hover:border-[#333144]"
                        >
                          <Plus className="h-3.5 w-3.5 text-[#69699F]" />
                          <span>{p.title}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </section>

            {/* Right: Retro TV Trailer */}
            <section className="rounded-xl border border-[#d9dbe8] bg-white p-6 shadow-xs sm:p-8">
              <h2 className="text-lg font-extrabold text-[#252333]">
                首页复古电视机 · 主打宣传片
              </h2>
              <p className="mt-1 text-sm text-[#333144]/65">
                设定首页邮局下方的复古电视机默认推荐哪部作品及其宣传视频。
              </p>

              <div className="mt-5 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#252333]">
                    电视机主打作品
                  </label>
                  <select
                    value={homeConfig.trailerProjectId}
                    onChange={(e) => {
                      setIsDirty(true);
                      setHomeConfig((prev) => ({
                        ...prev,
                        trailerProjectId: e.target.value,
                      }));
                    }}
                    className="mt-2 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-3.5 py-2.5 text-sm font-bold focus:border-[#333144] focus:bg-white focus:outline-none"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.date})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#252333]">
                    宣传片视频链接 (Bilibili)
                  </label>
                  <input
                    type="url"
                    value={homeConfig.trailerVideoUrl}
                    onChange={(e) => {
                      setIsDirty(true);
                      setHomeConfig((prev) => ({
                        ...prev,
                        trailerVideoUrl: e.target.value,
                      }));
                    }}
                    placeholder="https://www.bilibili.com/video/BV..."
                    className="mt-2 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-3.5 py-2.5 text-sm focus:border-[#333144] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#252333]">
                    覆盖标题（留空默认同步所选作品标题）
                  </label>
                  <input
                    type="text"
                    value={homeConfig.trailerCustomTitle || ''}
                    onChange={(e) => {
                      setIsDirty(true);
                      setHomeConfig((prev) => ({
                        ...prev,
                        trailerCustomTitle: e.target.value,
                      }));
                    }}
                    placeholder="留空则自动使用作品标题"
                    className="mt-2 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-3.5 py-2.5 text-sm focus:border-[#333144] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#252333]">
                    覆盖简介（留空默认同步所选作品简介）
                  </label>
                  <textarea
                    rows={3}
                    value={homeConfig.trailerCustomSummary || ''}
                    onChange={(e) => {
                      setIsDirty(true);
                      setHomeConfig((prev) => ({
                        ...prev,
                        trailerCustomSummary: e.target.value,
                      }));
                    }}
                    placeholder="留空则自动使用作品的一句话简介"
                    className="mt-2 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] p-3.5 text-sm leading-6 focus:border-[#333144] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ==================== 3. MEMBERS TAB ==================== */}
        {activeSection === 'members' && (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[290px_1fr]">
            {/* Left Draggable Member List */}
            <aside className="rounded-xl border border-[#d9dbe8] bg-white p-4 shadow-xs">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-[#252333]">
                    团队成员
                  </h2>
                  <p className="mt-0.5 text-xs text-[#333144]/55">
                    拖动左侧手柄调整展示顺序
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#69699F] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#525386]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>新增</span>
                </button>
              </div>

              <div className="space-y-2">
                {members.map((m, idx) => {
                  const selected = idx === selectedMemberIdx;
                  const isDragging = memberDragIdx === idx;
                  const isDropTarget =
                    memberDropIdx === idx && memberDragIdx !== idx;
                  return (
                    <div
                      key={m.id}
                      draggable
                      onDragStart={(e) => {
                        setMemberDragIdx(idx);
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', String(idx));
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (memberDropIdx !== idx) setMemberDropIdx(idx);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleMemberDrop(idx);
                      }}
                      onDragEnd={() => {
                        setMemberDragIdx(null);
                        setMemberDropIdx(null);
                      }}
                      onClick={() => setSelectedMemberIdx(idx)}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 transition ${
                        isDragging ? 'opacity-45' : ''
                      } ${
                        isDropTarget
                          ? 'border-[#69699F] ring-2 ring-[#69699F]/30'
                          : selected
                          ? 'border-[#333144] bg-[#333144] text-white shadow-sm'
                          : 'border-[#e3e5f0] bg-[#f8f9fc] text-[#252333] hover:border-[#b9bdd4] hover:bg-white'
                      }`}
                    >
                      <span
                        title="按住拖动排序"
                        className={`cursor-grab active:cursor-grabbing ${
                          selected ? 'text-white/55' : 'text-[#333144]/35'
                        }`}
                      >
                        <GripVertical className="h-4 w-4" />
                      </span>

                      <MinecraftHead
                        seed={m.mcId || m.name}
                        avatarUrl={resolvePreviewUrl(m.avatarUrl)}
                        size={38}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold">
                          {m.name}
                        </div>
                        <div
                          className={`truncate text-xs ${
                            selected ? 'text-[#CFCFE5]' : 'text-[#333144]/60'
                          }`}
                        >
                          {m.role}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Right Member Form */}
            {currentMember && (
              <div className="space-y-6">
                <section className="rounded-xl border border-[#d9dbe8] bg-white p-6 shadow-xs sm:p-8">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-extrabold text-[#252333]">
                      编辑成员：{currentMember.name}
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleDeleteMember(selectedMemberIdx)}
                      disabled={members.length <= 1}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>移除成员</span>
                    </button>
                  </div>

                  {/* Auto MC Skin & Avatar Sync Card */}
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e3e5f0] bg-[#f8f9fc] p-5">
                    <div className="flex items-center gap-4">
                      <MinecraftHead
                        seed={currentMember.mcId || currentMember.name}
                        avatarUrl={resolvePreviewUrl(currentMember.avatarUrl)}
                        size={64}
                      />
                      {currentMember.skinUrl && (
                        <img
                          src={resolvePreviewUrl(currentMember.skinUrl)}
                          alt="2D 皮肤贴图"
                          style={{ imageRendering: 'pixelated' }}
                          className="h-16 w-16 rounded-lg border border-[#d5d7e6] bg-white object-contain p-1"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-1.5 text-sm font-extrabold text-[#252333]">
                          <Sparkles className="h-4 w-4 text-[#69699F]" />
                          <span>正版皮肤与头像全自动同步</span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-[#333144]/70">
                          {skinFetchStatus[currentMember.id] === 'fetching'
                            ? '正在根据输入的 Minecraft ID 自动拉取正版皮肤并裁剪头像...'
                            : skinFetchStatus[currentMember.id] === 'done'
                            ? '已自动同步正版皮肤与头像！前台首页将自动用该贴图渲染 3D 角色。'
                            : skinFetchStatus[currentMember.id] === 'error'
                            ? '未找到该正版 ID 的皮肤，可检查拼写或点击右侧手动上传离线皮肤。'
                            : '填写下方 Minecraft 正版 ID 后停顿 0.5 秒自动获取，无需手动传图。'}
                        </p>
                      </div>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#cfd2e3] bg-white px-3.5 py-2 text-xs font-bold text-[#252333] transition hover:border-[#333144]">
                      <ImagePlus className="h-3.5 w-3.5" />
                      <span>上传离线皮肤 PNG</span>
                      <input
                        type="file"
                        accept="image/png"
                        onChange={handleCustomSkinUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-bold text-[#252333]">
                        Minecraft 正版 ID
                      </label>
                      <input
                        type="text"
                        value={currentMember.mcId}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateActiveMember({
                            mcId: val,
                            name:
                              currentMember.name === '新成员' ||
                              currentMember.name === currentMember.mcId
                                ? val
                                : currentMember.name,
                            id:
                              currentMember.id.startsWith('member_') &&
                              val.trim()
                                ? val.trim().toLowerCase()
                                : currentMember.id,
                          });
                        }}
                        placeholder="输入后自动拉取皮肤，如: RainSwallow"
                        className="mt-2 w-full rounded-lg border-2 border-[#69699F]/60 bg-[#fafbfd] px-3.5 py-2.5 text-base font-bold focus:border-[#333144] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#252333]">
                        展示名称
                      </label>
                      <input
                        type="text"
                        value={currentMember.name}
                        onChange={(e) =>
                          updateActiveMember({ name: e.target.value })
                        }
                        className="mt-2 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-3.5 py-2.5 text-base font-bold focus:border-[#333144] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#252333]">
                        职位头衔文本
                      </label>
                      <input
                        type="text"
                        value={currentMember.role}
                        onChange={(e) =>
                          updateActiveMember({ role: e.target.value })
                        }
                        placeholder="例如: 数据包 / 建筑"
                        className="mt-2 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-3.5 py-2.5 text-sm focus:border-[#333144] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="flex items-end pb-2.5">
                      <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-bold text-[#252333]">
                        <input
                          type="checkbox"
                          checked={Boolean(currentMember.isFounder)}
                          onChange={(e) =>
                            updateActiveMember({ isFounder: e.target.checked })
                          }
                          className="h-4 w-4 accent-[#333144]"
                        />
                        <span>显示「发起者」专属徽章</span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="block text-sm font-bold text-[#252333]">
                      所属分工（点击多选）
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {ALL_ROLE_GROUPS.map((grp) => {
                        const active = currentMember.groups.includes(grp);
                        return (
                          <button
                            key={grp}
                            type="button"
                            onClick={() => {
                              const exists = currentMember.groups.includes(grp);
                              const next = exists
                                ? currentMember.groups.filter((g) => g !== grp)
                                : [...currentMember.groups, grp];
                              if (next.length > 0) {
                                updateActiveMember({ groups: next });
                              }
                            }}
                            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                              active
                                ? 'bg-[#333144] text-white'
                                : 'border border-[#d5d7e6] bg-[#f8f9fc] text-[#333144]/75 hover:border-[#333144]'
                            }`}
                          >
                            {grp}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="block text-sm font-bold text-[#252333]">
                      成员个人简介
                    </label>
                    <textarea
                      rows={3}
                      value={currentMember.bio}
                      onChange={(e) =>
                        updateActiveMember({ bio: e.target.value })
                      }
                      placeholder="简介将显示在首页成员 3D 展示卡片下方..."
                      className="mt-2 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] p-3.5 text-sm leading-6 focus:border-[#333144] focus:bg-white focus:outline-none"
                    />
                  </div>
                </section>
              </div>
            )}
          </div>
        )}

        {/* ==================== 4. SECURITY & GATEWAY TAB ==================== */}
        {activeSection === 'security' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section className="rounded-xl border border-[#d9dbe8] bg-white p-6 shadow-xs sm:p-8">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-[#69699F]" />
                <h2 className="text-lg font-extrabold text-[#252333]">
                  线上发布连接配置（GitHub Pages 多人协作）
                </h2>
              </div>
              <p className="mt-1.5 text-sm leading-6 text-[#333144]/65">
                {isLocalDev
                  ? '你当前正在本地运行开发服务器，网关地址留空时点击右上角「保存到本地」会直接修改本地项目文件；部署到线上后，只需把 Cloudflare Worker 地址和密钥填在下方即可远程发布。'
                  : '团队成员无需注册 GitHub 账号。首次填入网关地址和发起人分发的高强度密钥后，浏览器会自动保存凭证。'}
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#252333]">
                    Cloudflare Worker 网关地址
                  </label>
                  <input
                    type="url"
                    value={gatewayUrl}
                    onChange={(e) => setGatewayUrl(e.target.value)}
                    placeholder="https://couriers-cms.你的子域名.workers.dev"
                    className="mt-1.5 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-3.5 py-2.5 text-sm focus:border-[#333144] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#252333]">
                    你的成员专属密钥 (Access Key)
                  </label>
                  <input
                    type="password"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="粘贴 couriers-xxx-... 长密钥"
                    className="mt-1.5 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-3.5 py-2.5 font-mono text-sm focus:border-[#333144] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#252333]">
                    更新说明备注（选填）
                  </label>
                  <input
                    type="text"
                    value={commitNote}
                    onChange={(e) => setCommitNote(e.target.value)}
                    placeholder="例如：补充作品下载链接与介绍"
                    className="mt-1.5 w-full rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-3.5 py-2.5 text-sm focus:border-[#333144] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#d9dbe8] bg-white p-6 shadow-xs sm:p-8">
              <div className="flex items-center gap-2.5">
                <KeyRound className="h-5 w-5 text-[#69699F]" />
                <h2 className="text-lg font-extrabold text-[#252333]">
                  成员专属 128 位高强度密钥生成器
                </h2>
              </div>
              <p className="mt-1.5 text-sm leading-6 text-[#333144]/65">
                为每位需要上传作品的成员生成独立密钥，一人一钥。搭配 Worker 网关的 IP 输错 5 次锁定 15 分钟防护，既免去注册 GitHub 的麻烦，又防止弱口令被暴力破解。
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#252333]">
                    成员名称
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      type="text"
                      value={keyGenMemberName}
                      onChange={(e) => setKeyGenMemberName(e.target.value)}
                      placeholder="例如: Carbonado404"
                      className="flex-1 rounded-lg border border-[#cfd2e3] bg-[#fafbfd] px-3.5 py-2.5 text-sm font-semibold focus:border-[#333144] focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setGeneratedKey(
                          generateSecureMemberKey(keyGenMemberName)
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#333144] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#525386]"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>重新生成</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-[#d5d7e6] bg-[#f8f9fc] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#69699F]">
                      生成的 128 位密钥
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedKey);
                        setCopiedKey(true);
                        window.setTimeout(() => setCopiedKey(false), 1800);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#333144] hover:text-[#69699F]"
                    >
                      {copiedKey ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-700">已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>复制密钥</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="mt-2 break-all font-mono text-xs font-bold text-[#252333]">
                    {generatedKey}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
