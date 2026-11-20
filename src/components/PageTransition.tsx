import React from 'react';

export type TransitionPhase = 'idle' | 'in' | 'hold' | 'out';

interface PageTransitionProps {
  phase: TransitionPhase;
}

const BLOCKS = [
  { color: 'bg-[#333144]', delay: '0ms' },
  { color: 'bg-[#69699F]', delay: '45ms' },
  { color: 'bg-[#8F99D2]', delay: '90ms' },
];

export const PageTransition: React.FC<PageTransitionProps> = ({ phase }) => {
  if (phase === 'idle') return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 grid grid-rows-3 overflow-hidden"
      aria-hidden="true"
    >
      {BLOCKS.map((block, idx) => {
        if (phase === 'hold') {
          return (
            <div
              key={idx}
              className={`h-full w-full ${block.color}`}
              style={{ transform: 'translate3d(0, 0, 0)' }}
            />
          );
        }

        const animClass =
          phase === 'in' ? 'transition-block-in' : 'transition-block-out';

        return (
          <div
            key={idx}
            className={`h-full w-full ${block.color} ${animClass}`}
            style={{ animationDelay: block.delay }}
          />
        );
      })}
    </div>
  );
};
