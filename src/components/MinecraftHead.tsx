import React, { useEffect, useState } from 'react';

interface MinecraftHeadProps {
  seed: string;
  avatarUrl: string;
  size?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
}

interface SkinPalette {
  skin: string;
  skinShade: string;
  hair: string;
  hairLight: string;
  eyes: string;
  accent: string;
  style: 'crown' | 'goggles' | 'headband' | 'hood' | 'visor' | 'classic';
}

const PRESET_SKINS: Record<string, SkinPalette> = {
  kai: {
    skin: '#f2c7a5',
    skinShade: '#dfa981',
    hair: '#1e293b',
    hairLight: '#334155',
    eyes: '#0284c7',
    accent: '#f59e0b',
    style: 'crown',
  },
  lyra: {
    skin: '#f6d2b8',
    skinShade: '#e5b695',
    hair: '#0ea5e9',
    hairLight: '#38bdf8',
    eyes: '#0369a1',
    accent: '#fb923c',
    style: 'goggles',
  },
  zeno: {
    skin: '#e8b893',
    skinShade: '#d19b72',
    hair: '#7c2d12',
    hairLight: '#9a3412',
    eyes: '#15803d',
    accent: '#eab308',
    style: 'headband',
  },
  sora: {
    skin: '#f4ceb1',
    skinShade: '#deb08e',
    hair: '#15803d',
    hairLight: '#22c55e',
    eyes: '#047857',
    accent: '#86efac',
    style: 'hood',
  },
  milo: {
    skin: '#d9a47c',
    skinShade: '#c1875d',
    hair: '#4c1d95',
    hairLight: '#6d28d9',
    eyes: '#a855f7',
    accent: '#f472b6',
    style: 'classic',
  },
  iris: {
    skin: '#f7d6bf',
    skinShade: '#e4ba9d',
    hair: '#be123c',
    hairLight: '#f43f5e',
    eyes: '#0ea5e9',
    accent: '#38bdf8',
    style: 'visor',
  },
  ren: {
    skin: '#f0c4a0',
    skinShade: '#d8a67e',
    hair: '#334155',
    hairLight: '#475569',
    eyes: '#d97706',
    accent: '#38bdf8',
    style: 'headband',
  },
  nova: {
    skin: '#f2ccb0',
    skinShade: '#dcaf8e',
    hair: '#0f766e',
    hairLight: '#14b8a6',
    eyes: '#06b6d4',
    accent: '#fde047',
    style: 'goggles',
  },
};

function getPalette(seed: string): SkinPalette {
  if (PRESET_SKINS[seed]) return PRESET_SKINS[seed];
  const keys = Object.keys(PRESET_SKINS);
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  }
  return PRESET_SKINS[keys[hash % keys.length]];
}

export const MinecraftHead: React.FC<MinecraftHeadProps> = ({
  seed,
  avatarUrl,
  size = 36,
  className = '',
  loading = 'lazy',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [avatarUrl]);

  if (avatarUrl && !imgFailed) {
    return (
      <div
        className={`relative inline-flex shrink-0 select-none ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={avatarUrl}
          alt={seed}
          width={size}
          height={size}
          loading={loading}
          decoding="async"
          onError={() => setImgFailed(true)}
          style={{ imageRendering: 'pixelated' }}
          className="h-full w-full rounded-[4px] bg-[#f5f6fb] object-cover ring-2 ring-[#333144]/20"
        />
      </div>
    );
  }

  const p = getPalette(seed);

  return (
    <div
      className={`relative inline-flex shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 8 8"
        width={size}
        height={size}
        shapeRendering="crispEdges"
        className="rounded-[4px] ring-2 ring-[#333144]/20"
        aria-hidden="true"
      >
        <rect x="0" y="0" width="8" height="8" fill={p.skin} />
        <rect x="0" y="6" width="1" height="2" fill={p.skinShade} />
        <rect x="7" y="6" width="1" height="2" fill={p.skinShade} />
        <rect x="2" y="7" width="4" height="1" fill={p.skinShade} />

        <rect x="0" y="0" width="8" height="2" fill={p.hair} />
        <rect x="0" y="2" width="1" height="2" fill={p.hair} />
        <rect x="7" y="2" width="1" height="2" fill={p.hair} />
        <rect x="1" y="0" width="2" height="1" fill={p.hairLight} />
        <rect x="5" y="1" width="2" height="1" fill={p.hairLight} />
        <rect x="1" y="2" width="1" height="1" fill={p.hair} />

        <rect x="1" y="4" width="1" height="1" fill="#ffffff" />
        <rect x="2" y="4" width="1" height="1" fill={p.eyes} />
        <rect x="5" y="4" width="1" height="1" fill={p.eyes} />
        <rect x="6" y="4" width="1" height="1" fill="#ffffff" />

        <rect x="3" y="6" width="2" height="1" fill={p.skinShade} />

        {p.style === 'crown' && (
          <>
            <rect x="1" y="0" width="6" height="1" fill={p.accent} />
            <rect x="1" y="1" width="1" height="1" fill="#fde047" />
            <rect x="3" y="1" width="2" height="1" fill="#38bdf8" />
            <rect x="6" y="1" width="1" height="1" fill="#fde047" />
          </>
        )}
        {p.style === 'goggles' && (
          <>
            <rect x="0" y="2" width="8" height="1" fill="#334155" />
            <rect x="1" y="1" width="2" height="2" fill={p.accent} />
            <rect x="5" y="1" width="2" height="2" fill={p.accent} />
            <rect x="2" y="2" width="1" height="1" fill="#e0f2fe" />
            <rect x="5" y="2" width="1" height="1" fill="#e0f2fe" />
          </>
        )}
        {p.style === 'headband' && (
          <>
            <rect x="0" y="2" width="8" height="1" fill={p.accent} />
            <rect x="3" y="2" width="2" height="1" fill="#ffffff" />
          </>
        )}
        {p.style === 'hood' && (
          <>
            <rect x="0" y="0" width="8" height="1" fill={p.hair} />
            <rect x="0" y="0" width="1" height="7" fill={p.hair} />
            <rect x="7" y="0" width="1" height="7" fill={p.hair} />
            <rect x="3" y="1" width="2" height="1" fill={p.accent} />
          </>
        )}
        {p.style === 'visor' && (
          <>
            <rect x="1" y="3" width="6" height="1" fill={p.accent} />
            <rect x="2" y="3" width="2" height="1" fill="#e0f2fe" />
          </>
        )}
      </svg>
    </div>
  );
};
