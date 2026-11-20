import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t-2 border-[#333144]/40 bg-[#0d0c14] py-12 text-[#CFCFE5]/70">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-6 sm:flex-row sm:items-end">
        <div>
          <img
            src="/images/couriers-bilingual-horizontal-light.svg"
            alt="寄语 Couriers"
            className="h-8 w-auto select-none"
          />
          <p className="mt-3 text-xs text-[#CFCFE5]/55">
            原创体验类 Minecraft 地图创作团队
          </p>
        </div>

        <p className="text-xs text-[#CFCFE5]/50">
          © 2026 寄语 Couriers · Not an official Minecraft product.
        </p>
      </div>
    </footer>
  );
};
