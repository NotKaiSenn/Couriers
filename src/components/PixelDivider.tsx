import React, { useId } from 'react';

interface PixelDividerProps {
  topColor: string;
  bottomColor: string;
  variant?: 0 | 3 | 4;
}

interface CellRun {
  /** Starting column in 16px grid units (0..TILE_COLS-1) */
  c: number;
  /** Row index (0 = top, 1 = middle, 2 = bottom base) */
  r: 0 | 1 | 2;
  /** Width in 16px grid units */
  span: number;
}

const CELL = 16;
const TILE_COLS = 60;
const TILE_W = TILE_COLS * CELL; // 960px repeating tile
const TILE_H = 3 * CELL; // 48px fixed height

const VARIANTS: Record<
  0 | 3 | 4,
  { bottom: CellRun[]; topNotches: CellRun[] }
> = {
  // 0: Balanced scattered checkerboard dither
  0: {
    bottom: [
      { c: 2, r: 0, span: 1 },
      { c: 7, r: 0, span: 1 },
      { c: 14, r: 0, span: 1 },
      { c: 20, r: 0, span: 1 },
      { c: 27, r: 0, span: 1 },
      { c: 33, r: 0, span: 1 },
      { c: 40, r: 0, span: 1 },
      { c: 46, r: 0, span: 1 },
      { c: 52, r: 0, span: 1 },
      { c: 57, r: 0, span: 1 },
      { c: 1, r: 1, span: 1 },
      { c: 4, r: 1, span: 2 },
      { c: 8, r: 1, span: 1 },
      { c: 11, r: 1, span: 2 },
      { c: 16, r: 1, span: 2 },
      { c: 20, r: 1, span: 1 },
      { c: 23, r: 1, span: 2 },
      { c: 28, r: 1, span: 2 },
      { c: 32, r: 1, span: 1 },
      { c: 35, r: 1, span: 2 },
      { c: 39, r: 1, span: 1 },
      { c: 42, r: 1, span: 2 },
      { c: 47, r: 1, span: 2 },
      { c: 51, r: 1, span: 1 },
      { c: 54, r: 1, span: 2 },
      { c: 58, r: 1, span: 2 },
    ],
    topNotches: [
      { c: 2, r: 2, span: 1 },
      { c: 10, r: 2, span: 1 },
      { c: 18, r: 2, span: 1 },
      { c: 26, r: 2, span: 1 },
      { c: 34, r: 2, span: 1 },
      { c: 41, r: 2, span: 1 },
      { c: 50, r: 2, span: 1 },
      { c: 57, r: 2, span: 1 },
    ],
  },
  // 3: Fine pixel-dust scatter (airier rhythm)
  3: {
    bottom: [
      { c: 4, r: 0, span: 1 },
      { c: 9, r: 0, span: 1 },
      { c: 16, r: 0, span: 1 },
      { c: 19, r: 0, span: 1 },
      { c: 26, r: 0, span: 1 },
      { c: 32, r: 0, span: 1 },
      { c: 36, r: 0, span: 1 },
      { c: 43, r: 0, span: 1 },
      { c: 49, r: 0, span: 1 },
      { c: 54, r: 0, span: 1 },
      { c: 1, r: 1, span: 2 },
      { c: 6, r: 1, span: 1 },
      { c: 10, r: 1, span: 2 },
      { c: 14, r: 1, span: 1 },
      { c: 17, r: 1, span: 2 },
      { c: 22, r: 1, span: 1 },
      { c: 25, r: 1, span: 2 },
      { c: 29, r: 1, span: 1 },
      { c: 33, r: 1, span: 2 },
      { c: 38, r: 1, span: 1 },
      { c: 41, r: 1, span: 2 },
      { c: 45, r: 1, span: 1 },
      { c: 48, r: 1, span: 2 },
      { c: 53, r: 1, span: 1 },
      { c: 56, r: 1, span: 2 },
    ],
    topNotches: [
      { c: 3, r: 2, span: 1 },
      { c: 8, r: 2, span: 1 },
      { c: 13, r: 2, span: 1 },
      { c: 20, r: 2, span: 1 },
      { c: 24, r: 2, span: 1 },
      { c: 31, r: 2, span: 1 },
      { c: 36, r: 2, span: 1 },
      { c: 40, r: 2, span: 1 },
      { c: 47, r: 2, span: 1 },
      { c: 51, r: 2, span: 1 },
      { c: 59, r: 2, span: 1 },
    ],
  },
  // 4: Asymmetric stepped ledges (clean footer finish)
  4: {
    bottom: [
      { c: 7, r: 0, span: 1 },
      { c: 15, r: 0, span: 2 },
      { c: 28, r: 0, span: 1 },
      { c: 35, r: 0, span: 2 },
      { c: 47, r: 0, span: 1 },
      { c: 53, r: 0, span: 2 },
      { c: 0, r: 1, span: 2 },
      { c: 4, r: 1, span: 3 },
      { c: 10, r: 1, span: 2 },
      { c: 14, r: 1, span: 4 },
      { c: 21, r: 1, span: 3 },
      { c: 27, r: 1, span: 2 },
      { c: 32, r: 1, span: 5 },
      { c: 40, r: 1, span: 3 },
      { c: 46, r: 1, span: 2 },
      { c: 51, r: 1, span: 4 },
      { c: 57, r: 1, span: 3 },
    ],
    topNotches: [
      { c: 3, r: 2, span: 1 },
      { c: 9, r: 2, span: 1 },
      { c: 19, r: 2, span: 1 },
      { c: 25, r: 2, span: 1 },
      { c: 30, r: 2, span: 1 },
      { c: 38, r: 2, span: 1 },
      { c: 44, r: 2, span: 1 },
      { c: 49, r: 2, span: 1 },
      { c: 56, r: 2, span: 1 },
    ],
  },
};

// Fixed 16px × 16px stepped pixel transition tiled horizontally without stretching
export const PixelDivider: React.FC<PixelDividerProps> = ({
  topColor,
  bottomColor,
  variant = 0,
}) => {
  const patternId = useId();
  const pattern = VARIANTS[variant];

  return (
    <div
      className="w-full overflow-hidden leading-none select-none"
      style={{ backgroundColor: topColor, height: TILE_H }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height={TILE_H}
        shapeRendering="crispEdges"
        className="block w-full"
      >
        <defs>
          <pattern
            id={patternId}
            width={TILE_W}
            height={TILE_H}
            patternUnits="userSpaceOnUse"
          >
            <rect x="0" y="0" width={TILE_W} height={TILE_H} fill={topColor} />

            {/* Scattered & clustered bottom-color pixels rising into top band */}
            <g fill={bottomColor}>
              {pattern.bottom.map((run, i) => (
                <rect
                  key={i}
                  x={run.c * CELL}
                  y={run.r * CELL}
                  width={run.span * CELL}
                  height={CELL}
                />
              ))}
              {/* Row 3 solid bottom base with stepped notches */}
              <rect x="0" y={2 * CELL} width={TILE_W} height={CELL} />
            </g>

            {/* Occasional top-color notches dipping into row 3 */}
            <g fill={topColor}>
              {pattern.topNotches.map((run, i) => (
                <rect
                  key={i}
                  x={run.c * CELL}
                  y={run.r * CELL}
                  width={run.span * CELL}
                  height={CELL}
                />
              ))}
            </g>
          </pattern>
        </defs>
        <rect width="100%" height={TILE_H} fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};
