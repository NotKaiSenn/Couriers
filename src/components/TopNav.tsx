import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export type NavTab = 'home' | 'portfolio' | 'members' | 'join';

interface TopNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

const NAV_ITEMS: { id: NavTab; label: string }[] = [
  { id: 'home', label: '首页' },
  { id: 'portfolio', label: '作品' },
  { id: 'members', label: '成员' },
  { id: 'join', label: '加入我们' },
];

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
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
          <img
            src="/images/couriers-envelope.svg"
            alt="寄语 Couriers"
            className="h-7 w-auto select-none sm:hidden"
          />
          <img
            src="/images/couriers-bilingual-horizontal.svg"
            alt="寄语 Couriers"
            className="hidden h-8 w-auto select-none sm:block md:h-9"
          />
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

      {/* Stepped pixel-block bottom edge */}
      <div className="pointer-events-none absolute inset-x-0 top-full flex h-2 justify-center overflow-hidden sm:h-2.5">
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 16"
          preserveAspectRatio="none"
          shapeRendering="crispEdges"
          className="block h-full w-[720px] max-w-none shrink-0 fill-[#F5F6FB] sm:w-full"
        >
          <rect x="0" y="0" width="1440" height="4" />
          <rect x="48" y="4" width="72" height="4" />
          <rect x="192" y="4" width="48" height="4" />
          <rect x="312" y="4" width="96" height="4" />
          <rect x="480" y="4" width="48" height="4" />
          <rect x="600" y="4" width="72" height="4" />
          <rect x="744" y="4" width="48" height="4" />
          <rect x="864" y="4" width="96" height="4" />
          <rect x="1032" y="4" width="48" height="4" />
          <rect x="1152" y="4" width="72" height="4" />
          <rect x="1296" y="4" width="96" height="4" />
          <rect x="72" y="8" width="24" height="4" />
          <rect x="336" y="8" width="24" height="4" />
          <rect x="624" y="8" width="24" height="4" />
          <rect x="888" y="8" width="24" height="4" />
          <rect x="1176" y="8" width="24" height="4" />
          <rect x="1344" y="8" width="24" height="4" />
        </svg>
      </div>
    </nav>
  );
};
