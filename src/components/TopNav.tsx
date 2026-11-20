import React, { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

export type NavTab = 'home' | 'portfolio' | 'members' | 'join';

interface TopNavProps {
  activeTab: NavTab;
  isProjectPage?: boolean;
  onSelectTab: (tab: NavTab) => void;
}

const NAV_ITEMS: { id: Exclude<NavTab, 'join'>; label: string }[] = [
  { id: 'home', label: '首页' },
  { id: 'portfolio', label: '作品' },
  { id: 'members', label: '成员' },
];

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  isProjectPage = false,
  onSelectTab,
}) => {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setScrolledPastHero(window.scrollY > window.innerHeight * 0.72);
    };

    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const isDarkHeroTop =
    activeTab === 'home' && !isProjectPage && !scrolledPastHero;

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-40 h-16 transition-colors duration-300 ${
        isDarkHeroTop
          ? 'bg-transparent'
          : 'border-b border-[#CFCFE5]/70 bg-white/90 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto grid h-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
        {/* Top-Left Logo */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className="flex shrink-0 items-center justify-self-start transition-opacity hover:opacity-80 focus:outline-none"
          aria-label="寄语 Couriers 首页"
        >
          <img
            src="/images/couriers-envelope.svg"
            alt="寄语 Couriers"
            className="h-7 w-auto select-none sm:hidden"
          />
          <img
            src={
              isDarkHeroTop
                ? '/images/couriers-bilingual-horizontal-light.svg'
                : '/images/couriers-bilingual-horizontal.svg'
            }
            alt="寄语 Couriers"
            className="hidden h-8 w-auto select-none sm:block md:h-9"
          />
        </button>

        {/* Center Navigation Links (Mathematically centered via 1fr-auto-1fr grid) */}
        <div className="flex items-center justify-self-center gap-6 sm:gap-12">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-1.5 text-sm font-semibold tracking-wider transition-colors sm:text-base ${
                  isDarkHeroTop
                    ? active
                      ? 'text-white'
                      : 'text-white/65 hover:text-white'
                    : active
                    ? 'text-[#69699F]'
                    : 'text-[#333144]/65 hover:text-[#333144]'
                }`}
              >
                {item.label}
                {active && (
                  <span
                    className={`absolute inset-x-0 -bottom-0.5 h-[2.5px] transition-colors ${
                      isDarkHeroTop ? 'bg-[#8F99D2]' : 'bg-[#69699F]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Far-Right Join Us + ↗ Badge */}
        <button
          type="button"
          onClick={() => onSelectTab('join')}
          className={`relative inline-flex shrink-0 items-center justify-self-end gap-1 py-1.5 text-sm font-semibold tracking-wider transition-colors sm:text-base ${
            isDarkHeroTop
              ? 'text-white/85 hover:text-white'
              : activeTab === 'join'
              ? 'text-[#69699F]'
              : 'text-[#333144] hover:text-[#69699F]'
          }`}
        >
          <span>加入我们</span>
          <ArrowUpRight className="-mt-1 h-4 w-4 text-[#8F99D2]" strokeWidth={2.4} />
          {activeTab === 'join' && (
            <span className="absolute inset-x-0 -bottom-0.5 h-[2.5px] bg-[#69699F]" />
          )}
        </button>
      </div>
    </nav>
  );
};
