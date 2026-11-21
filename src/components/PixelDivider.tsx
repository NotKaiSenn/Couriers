import React from 'react';

interface PixelDividerProps {
  topColor: string;
  bottomColor: string;
  variant?: 0 | 3 | 4;
}

interface RectDef {
  x: number;
  y: number;
  w: number;
}

const VARIANTS: Record<
  0 | 3 | 4,
  { bottom: RectDef[]; topNotches: RectDef[] }
> = {
  // 0: Balanced scattered checkerboard dither
  0: {
    bottom: [
      { x: 60, y: 0, w: 24 },
      { x: 180, y: 0, w: 24 },
      { x: 336, y: 0, w: 24 },
      { x: 492, y: 0, w: 24 },
      { x: 648, y: 0, w: 24 },
      { x: 792, y: 0, w: 24 },
      { x: 948, y: 0, w: 24 },
      { x: 1104, y: 0, w: 24 },
      { x: 1260, y: 0, w: 24 },
      { x: 1380, y: 0, w: 24 },
      { x: 12, y: 16, w: 24 },
      { x: 84, y: 16, w: 48 },
      { x: 204, y: 16, w: 24 },
      { x: 276, y: 16, w: 48 },
      { x: 384, y: 16, w: 48 },
      { x: 468, y: 16, w: 24 },
      { x: 552, y: 16, w: 48 },
      { x: 672, y: 16, w: 48 },
      { x: 756, y: 16, w: 24 },
      { x: 840, y: 16, w: 48 },
      { x: 924, y: 16, w: 24 },
      { x: 1008, y: 16, w: 48 },
      { x: 1128, y: 16, w: 48 },
      { x: 1224, y: 16, w: 24 },
      { x: 1308, y: 16, w: 48 },
      { x: 1404, y: 16, w: 36 },
    ],
    topNotches: [
      { x: 48, y: 32, w: 24 },
      { x: 240, y: 32, w: 24 },
      { x: 432, y: 32, w: 24 },
      { x: 612, y: 32, w: 24 },
      { x: 804, y: 32, w: 24 },
      { x: 984, y: 32, w: 24 },
      { x: 1188, y: 32, w: 24 },
      { x: 1356, y: 32, w: 24 },
    ],
  },
  // 3: Fine pixel-dust scatter (airier rhythm)
  3: {
    bottom: [
      { x: 96, y: 0, w: 24 },
      { x: 216, y: 0, w: 24 },
      { x: 384, y: 0, w: 24 },
      { x: 456, y: 0, w: 24 },
      { x: 624, y: 0, w: 24 },
      { x: 768, y: 0, w: 24 },
      { x: 864, y: 0, w: 24 },
      { x: 1032, y: 0, w: 24 },
      { x: 1176, y: 0, w: 24 },
      { x: 1296, y: 0, w: 24 },
      { x: 24, y: 16, w: 48 },
      { x: 144, y: 16, w: 24 },
      { x: 240, y: 16, w: 48 },
      { x: 336, y: 16, w: 24 },
      { x: 408, y: 16, w: 48 },
      { x: 528, y: 16, w: 24 },
      { x: 600, y: 16, w: 48 },
      { x: 696, y: 16, w: 24 },
      { x: 792, y: 16, w: 48 },
      { x: 912, y: 16, w: 24 },
      { x: 984, y: 16, w: 48 },
      { x: 1080, y: 16, w: 24 },
      { x: 1152, y: 16, w: 48 },
      { x: 1272, y: 16, w: 24 },
      { x: 1344, y: 16, w: 48 },
    ],
    topNotches: [
      { x: 72, y: 32, w: 24 },
      { x: 192, y: 32, w: 24 },
      { x: 312, y: 32, w: 24 },
      { x: 480, y: 32, w: 24 },
      { x: 576, y: 32, w: 24 },
      { x: 744, y: 32, w: 24 },
      { x: 864, y: 32, w: 24 },
      { x: 960, y: 32, w: 24 },
      { x: 1128, y: 32, w: 24 },
      { x: 1224, y: 32, w: 24 },
      { x: 1416, y: 32, w: 24 },
    ],
  },
  // 4: Asymmetric stepped ledges (clean footer finish)
  4: {
    bottom: [
      { x: 168, y: 0, w: 24 },
      { x: 360, y: 0, w: 48 },
      { x: 672, y: 0, w: 24 },
      { x: 840, y: 0, w: 48 },
      { x: 1128, y: 0, w: 24 },
      { x: 1272, y: 0, w: 48 },
      { x: 0, y: 16, w: 48 },
      { x: 96, y: 16, w: 72 },
      { x: 240, y: 16, w: 48 },
      { x: 336, y: 16, w: 96 },
      { x: 504, y: 16, w: 72 },
      { x: 648, y: 16, w: 48 },
      { x: 768, y: 16, w: 120 },
      { x: 960, y: 16, w: 72 },
      { x: 1104, y: 16, w: 48 },
      { x: 1224, y: 16, w: 96 },
      { x: 1368, y: 16, w: 72 },
    ],
    topNotches: [
      { x: 72, y: 32, w: 24 },
      { x: 216, y: 32, w: 24 },
      { x: 456, y: 32, w: 24 },
      { x: 600, y: 32, w: 24 },
      { x: 720, y: 32, w: 24 },
      { x: 912, y: 32, w: 24 },
      { x: 1056, y: 32, w: 24 },
      { x: 1176, y: 32, w: 24 },
      { x: 1344, y: 32, w: 24 },
    ],
  },
};

// Noxcrew-style stepped pixelated checkerboard transition between dark & light bands
export const PixelDivider: React.FC<PixelDividerProps> = ({
  topColor,
  bottomColor,
  variant = 0,
}) => {
  const pattern = VARIANTS[variant];

  return (
    <div
      className="flex w-full justify-center overflow-hidden leading-none select-none"
      style={{ backgroundColor: topColor }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
        className="block h-6 w-[720px] max-w-none shrink-0 sm:h-12 sm:w-full"
      >
        {/* Scattered & clustered bottom-color pixels rising into top band */}
        <g fill={bottomColor}>
          {pattern.bottom.map((r, i) => (
            <rect key={i} x={r.x} y={r.y} width={r.w} height="16" />
          ))}
          {/* Row 3 solid bottom base with stepped notches */}
          <rect x="0" y="32" width="1440" height="16" />
        </g>

        {/* Occasional top-color notches dipping into row 3 */}
        <g fill={topColor}>
          {pattern.topNotches.map((r, i) => (
            <rect key={i} x={r.x} y={r.y} width={r.w} height="16" />
          ))}
        </g>
      </svg>
    </div>
  );
};
