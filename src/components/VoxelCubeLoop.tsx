import React, { useState } from 'react';

type BlockVariant = 'grass' | 'parcel' | 'oak';

const VARIANTS: BlockVariant[] = ['grass', 'parcel', 'oak'];

const TopFaceSvg: React.FC<{ variant: BlockVariant }> = ({ variant }) => {
  if (variant === 'parcel') {
    return (
      <svg viewBox="0 0 8 8" className="h-full w-full" shapeRendering="crispEdges">
        <rect width="8" height="8" fill="#d9b487" />
        <rect x="0" y="0" width="8" height="1" fill="#c39a6b" />
        <rect x="0" y="7" width="8" height="1" fill="#c39a6b" />
        <rect x="0" y="0" width="1" height="8" fill="#c39a6b" />
        <rect x="7" y="0" width="1" height="8" fill="#c39a6b" />
        <rect x="3" y="0" width="2" height="8" fill="#8F99D2" />
        <rect x="0" y="3" width="8" height="2" fill="#8F99D2" />
        <rect x="3" y="3" width="2" height="2" fill="#69699F" />
      </svg>
    );
  }
  if (variant === 'oak') {
    return (
      <svg viewBox="0 0 8 8" className="h-full w-full" shapeRendering="crispEdges">
        <rect width="8" height="8" fill="#c2935d" />
        <rect x="0" y="0" width="8" height="1" fill="#9c7042" />
        <rect x="0" y="3" width="8" height="1" fill="#a87948" />
        <rect x="0" y="6" width="8" height="1" fill="#9c7042" />
        <rect x="2" y="1" width="2" height="1" fill="#d4a670" />
        <rect x="5" y="4" width="2" height="1" fill="#d4a670" />
        <rect x="1" y="7" width="3" height="1" fill="#b3824e" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 8 8" className="h-full w-full" shapeRendering="crispEdges">
      <rect width="8" height="8" fill="#72b35b" />
      <rect x="1" y="1" width="2" height="1" fill="#87c76d" />
      <rect x="5" y="2" width="1" height="2" fill="#619c4c" />
      <rect x="2" y="4" width="2" height="1" fill="#619c4c" />
      <rect x="6" y="5" width="1" height="2" fill="#87c76d" />
      <rect x="1" y="6" width="1" height="1" fill="#87c76d" />
      <rect x="4" y="6" width="1" height="1" fill="#599145" />
    </svg>
  );
};

const SideFaceSvg: React.FC<{ variant: BlockVariant; shade?: boolean }> = ({
  variant,
  shade = false,
}) => {
  if (variant === 'parcel') {
    return (
      <svg viewBox="0 0 8 8" className="h-full w-full" shapeRendering="crispEdges">
        <rect width="8" height="8" fill={shade ? '#c79f72' : '#d6b082'} />
        <rect x="0" y="0" width="8" height="1" fill="#b58d60" />
        <rect x="0" y="7" width="8" height="1" fill="#a67e52" />
        <rect x="3" y="0" width="2" height="8" fill={shade ? '#69699F' : '#8F99D2'} />
        <rect x="5" y="2" width="2" height="2" fill="#FAF6F4" />
      </svg>
    );
  }
  if (variant === 'oak') {
    return (
      <svg viewBox="0 0 8 8" className="h-full w-full" shapeRendering="crispEdges">
        <rect width="8" height="8" fill={shade ? '#b38350' : '#c49560'} />
        <rect x="0" y="0" width="8" height="1" fill="#9a6e40" />
        <rect x="0" y="4" width="8" height="1" fill="#9a6e40" />
        <rect x="4" y="0" width="1" height="4" fill="#9a6e40" />
        <rect x="2" y="4" width="1" height="4" fill="#9a6e40" />
        <rect x="6" y="4" width="1" height="4" fill="#9a6e40" />
        <rect x="1" y="2" width="2" height="1" fill="#d4a772" />
        <rect x="4" y="6" width="2" height="1" fill="#d4a772" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 8 8" className="h-full w-full" shapeRendering="crispEdges">
      <rect width="8" height="8" fill={shade ? '#7c5940' : '#8c664a'} />
      <rect x="1" y="4" width="1" height="1" fill="#6e4d36" />
      <rect x="5" y="5" width="2" height="1" fill="#6e4d36" />
      <rect x="2" y="6" width="1" height="1" fill="#9e7658" />
      <rect x="6" y="7" width="1" height="1" fill="#6e4d36" />
      <rect x="3" y="4" width="1" height="1" fill="#9e7658" />
      <rect x="0" y="0" width="8" height="2" fill={shade ? '#5e994a' : '#6cb056'} />
      <rect x="1" y="2" width="2" height="1" fill={shade ? '#5e994a' : '#6cb056'} />
      <rect x="4" y="2" width="1" height="1" fill={shade ? '#5e994a' : '#6cb056'} />
      <rect x="6" y="2" width="2" height="1" fill={shade ? '#5e994a' : '#6cb056'} />
      <rect x="2" y="0" width="2" height="1" fill="#82c46b" />
    </svg>
  );
};

const BottomFaceSvg: React.FC<{ variant: BlockVariant }> = ({ variant }) => {
  const fill =
    variant === 'grass' ? '#6e4d36' : variant === 'oak' ? '#9c7042' : '#a67e52';
  return (
    <svg viewBox="0 0 8 8" className="h-full w-full" shapeRendering="crispEdges">
      <rect width="8" height="8" fill={fill} />
    </svg>
  );
};

export const VoxelCubeLoop: React.FC = () => {
  const [variantIdx, setVariantIdx] = useState(0);
  const [hopSpin, setHopSpin] = useState(0);

  const variant = VARIANTS[variantIdx];
  const size = 148;
  const half = size / 2;

  const handleClick = () => {
    setVariantIdx((i) => (i + 1) % VARIANTS.length);
    setHopSpin((s) => s + 90);
  };

  return (
    <div
      onClick={handleClick}
      title="点击切换方块"
      className="group relative flex h-[320px] w-full cursor-pointer select-none flex-col items-center justify-center sm:h-[360px]"
    >
      <div
        className="flex items-center justify-center"
        style={{ perspective: '900px', width: '240px', height: '230px' }}
      >
        <div className="mc-cube-bob flex items-center justify-center">
          <div
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateY(${hopSpin}deg)`,
              transition: 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div
              className="mc-cube-spin relative transition-transform duration-300 group-hover:scale-105"
              style={{ width: `${size}px`, height: `${size}px` }}
            >
              <div
                style={{ transform: `translateZ(${half}px)` }}
                className="absolute inset-0 overflow-hidden shadow-inner"
              >
                <SideFaceSvg variant={variant} />
              </div>

              <div
                style={{ transform: `rotateY(180deg) translateZ(${half}px)` }}
                className="absolute inset-0 overflow-hidden"
              >
                <SideFaceSvg variant={variant} />
              </div>

              <div
                style={{ transform: `rotateY(90deg) translateZ(${half}px)` }}
                className="absolute inset-0 overflow-hidden"
              >
                <SideFaceSvg variant={variant} shade />
              </div>

              <div
                style={{ transform: `rotateY(-90deg) translateZ(${half}px)` }}
                className="absolute inset-0 overflow-hidden"
              >
                <SideFaceSvg variant={variant} shade />
              </div>

              <div
                style={{ transform: `rotateX(90deg) translateZ(${half}px)` }}
                className="absolute inset-0 overflow-hidden"
              >
                <TopFaceSvg variant={variant} />
              </div>

              <div
                style={{ transform: `rotateX(-90deg) translateZ(${half}px)` }}
                className="absolute inset-0 overflow-hidden"
              >
                <BottomFaceSvg variant={variant} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="mc-shadow-bob mt-1 h-4 w-36 rounded-full blur-md"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(51,49,68,0.42) 0%, transparent 72%)',
        }}
      />
    </div>
  );
};
