import React, { useId } from 'react';
import { ArrowUpRight } from 'lucide-react';

export type NavTab = 'home' | 'portfolio' | 'members' | 'join';

interface TopNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onPrefetchTab?: (tab: NavTab) => void;
}

const NAV_ITEMS: { id: NavTab; label: string }[] = [
  { id: 'home', label: '首页' },
  { id: 'portfolio', label: '作品' },
  { id: 'members', label: '成员' },
  { id: 'join', label: '加入我们' },
];

const NAV_EDGE_CELL = 16;
const NAV_EDGE_STEP_H = 4;
const NAV_EDGE_TILE_W = 60 * NAV_EDGE_CELL; // 960px
const NAV_EDGE_SEAM = 1;
const NAV_EDGE_H = NAV_EDGE_SEAM + 2 * NAV_EDGE_STEP_H; // 9px (8px visible overhang + 1px seam overlap)

const NAV_EDGE_ROW1: Array<[number, number]> = [
  [2, 3],
  [8, 2],
  [13, 4],
  [20, 2],
  [25, 3],
  [31, 2],
  [36, 4],
  [43, 2],
  [48, 3],
  [54, 4],
];

const NAV_EDGE_ROW2: number[] = [3, 14, 26, 37, 49, 56];

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSelectTab,
  onPrefetchTab,
}) => {
  const edgePatternId = useId();

  return (
    <nav className="fixed inset-x-0 top-0 z-40 h-16 bg-[#F5F6FB]">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Top-Left Logo */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className="flex min-h-11 min-w-11 shrink-0 items-center transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-[#69699F]"
          aria-label="寄语 Couriers 首页"
        >
          <picture>
            <source
              media="(min-width: 640px)"
              srcSet="/images/couriers-bilingual-horizontal.svg"
            />
            <img
              src="/images/couriers-envelope.svg"
              alt="寄语 Couriers"
              decoding="async"
              className="h-7 w-auto select-none sm:h-8 md:h-9"
            />
          </picture>
        </button>

        {/* Right Navigation Links */}
        <div className="flex items-center gap-2 sm:gap-10">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                onMouseEnter={() => onPrefetchTab?.(item.id)}
                onFocus={() => onPrefetchTab?.(item.id)}
                className={`group relative inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-0.5 py-1.5 text-sm font-semibold tracking-wider transition-colors sm:min-w-0 sm:text-base ${
                  active
                    ? 'text-[#69699F]'
                    : 'text-[#333144]/65 hover:text-[#333144]'
                }`}
              >
                <span className="relative">
                  {item.label}
                  <span
                    className={`absolute -bottom-1 inset-x-0.5 h-[2px] rounded-full transition-transform duration-200 origin-left ${
                      active
                        ? 'scale-x-100 bg-[#69699F]'
                        : 'scale-x-0 bg-current group-hover:scale-x-100'
                    }`}
                  />
                </span>
                {item.id === 'join' && (
                  <ArrowUpRight className="-mt-0.5 h-4 w-4" strokeWidth={2.75} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fixed-size stepped pixel-block bottom edge */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[calc(100%-1px)] overflow-hidden leading-none"
        style={{ height: NAV_EDGE_H }}
      >
        <svg
          aria-hidden="true"
          width="100%"
          height={NAV_EDGE_H}
          shapeRendering="crispEdges"
          className="block w-full"
        >
          <defs>
            <pattern
              id={edgePatternId}
              width={NAV_EDGE_TILE_W}
              height={NAV_EDGE_H}
              patternUnits="userSpaceOnUse"
            >
              <g fill="#F5F6FB">
                <rect x="0" y="0" width={NAV_EDGE_TILE_W} height={NAV_EDGE_SEAM} />
                {NAV_EDGE_ROW1.map(([col, span], i) => (
                  <rect
                    key={i}
                    x={col * NAV_EDGE_CELL}
                    y={NAV_EDGE_SEAM}
                    width={span * NAV_EDGE_CELL}
                    height={NAV_EDGE_STEP_H}
                  />
                ))}
                {NAV_EDGE_ROW2.map((col, i) => (
                  <rect
                    key={i}
                    x={col * NAV_EDGE_CELL}
                    y={NAV_EDGE_SEAM + NAV_EDGE_STEP_H}
                    width={NAV_EDGE_CELL}
                    height={NAV_EDGE_STEP_H}
                  />
                ))}
              </g>
            </pattern>
          </defs>
          <rect width="100%" height={NAV_EDGE_H} fill={`url(#${edgePatternId})`} />
        </svg>
      </div>
    </nav>
  );
};
