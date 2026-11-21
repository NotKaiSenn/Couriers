import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0d0c14] py-12 text-[#CFCFE5]/70">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-6 sm:flex-row sm:items-end">
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

        <p className="text-xs text-[#CFCFE5]/50">
          © 2026 寄语 Couriers
        </p>
      </div>
    </footer>
  );
};
