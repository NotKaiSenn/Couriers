import React from 'react';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="bg-[#0d0c14] py-12 text-[#CFCFE5]/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-center sm:flex-row sm:items-end sm:gap-6 sm:text-left">
        <div>
          <img
            src="/images/couriers-bilingual-horizontal-light.svg"
            alt="寄语 Couriers"
            width="258"
            height="50"
            loading="lazy"
            decoding="async"
            className="h-8 w-auto select-none"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-[#CFCFE5]/50">
          <span>© 2026 寄语 Couriers</span>
          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="text-[#CFCFE5]/35 underline-offset-4 transition hover:text-[#CFCFE5]/80 hover:underline"
            >
              内容管理
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
