import React from 'react';

interface ResponsiveImageMeta {
  avif: string;
  avifSm: string;
  jpg: string;
  jpgSm: string;
  width: number;
  height: number;
  smWidth: number;
}

const RESPONSIVE_IMAGES: Record<string, ResponsiveImageMeta> = {
  '/images/project-silent.jpg': {
    avif: '/images/project-silent.avif',
    avifSm: '/images/project-silent-sm.avif',
    jpg: '/images/project-silent.jpg',
    jpgSm: '/images/project-silent-sm.jpg',
    width: 1280,
    height: 720,
    smWidth: 736,
  },
  '/images/project-skyport.jpg': {
    avif: '/images/project-skyport.avif',
    avifSm: '/images/project-skyport-sm.avif',
    jpg: '/images/project-skyport.jpg',
    jpgSm: '/images/project-skyport-sm.jpg',
    width: 1376,
    height: 768,
    smWidth: 736,
  },
  '/images/project-sanctum.jpg': {
    avif: '/images/project-sanctum.avif',
    avifSm: '/images/project-sanctum-sm.avif',
    jpg: '/images/project-sanctum.jpg',
    jpgSm: '/images/project-sanctum-sm.jpg',
    width: 1376,
    height: 768,
    smWidth: 736,
  },
  '/images/project-lantern.jpg': {
    avif: '/images/project-lantern.avif',
    avifSm: '/images/project-lantern-sm.avif',
    jpg: '/images/project-lantern.jpg',
    jpgSm: '/images/project-lantern-sm.jpg',
    width: 1376,
    height: 768,
    smWidth: 736,
  },
  '/images/project-clockwork.jpg': {
    avif: '/images/project-clockwork.avif',
    avifSm: '/images/project-clockwork-sm.avif',
    jpg: '/images/project-clockwork.jpg',
    jpgSm: '/images/project-clockwork-sm.jpg',
    width: 1376,
    height: 768,
    smWidth: 736,
  },
  '/images/project-citadel.jpg': {
    avif: '/images/project-citadel.avif',
    avifSm: '/images/project-citadel-sm.avif',
    jpg: '/images/project-citadel.jpg',
    jpgSm: '/images/project-citadel-sm.jpg',
    width: 1376,
    height: 768,
    smWidth: 736,
  },
  '/images/hero-banner.jpg': {
    avif: '/images/hero-banner.avif',
    avifSm: '/images/hero-banner-sm.avif',
    jpg: '/images/hero-banner.jpg',
    jpgSm: '/images/hero-banner-sm.jpg',
    width: 1376,
    height: 768,
    smWidth: 736,
  },
};

export interface OptimizedImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  sizes?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt = '',
  sizes = '100vw',
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  width,
  height,
  className,
  ...rest
}) => {
  const meta = RESPONSIVE_IMAGES[src];

  if (!meta) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        className={className}
        {...rest}
      />
    );
  }

  return (
    <picture className="contents">
      <source
        type="image/avif"
        srcSet={`${meta.avifSm} ${meta.smWidth}w, ${meta.avif} ${meta.width}w`}
        sizes={sizes}
      />
      <img
        src={meta.jpg}
        srcSet={`${meta.jpgSm} ${meta.smWidth}w, ${meta.jpg} ${meta.width}w`}
        sizes={sizes}
        alt={alt}
        width={width ?? meta.width}
        height={height ?? meta.height}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        className={className}
        {...rest}
      />
    </picture>
  );
};
