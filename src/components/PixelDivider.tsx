import React from 'react';

interface PixelDividerProps {
  topColor: string;
  bottomColor: string;
}

// Noxcrew-style stepped pixelated checkerboard transition between dark & light bands
export const PixelDivider: React.FC<PixelDividerProps> = ({
  topColor,
  bottomColor,
}) => {
  return (
    <div
      className="w-full overflow-hidden leading-none select-none"
      style={{ backgroundColor: topColor }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        className="block h-8 w-full sm:h-12"
      >
        {/* Row 1 scattered bottom-color pixels rising into top band */}
        <g fill={bottomColor}>
          <rect x="60" y="0" width="24" height="16" />
          <rect x="180" y="0" width="24" height="16" />
          <rect x="336" y="0" width="24" height="16" />
          <rect x="492" y="0" width="24" height="16" />
          <rect x="648" y="0" width="24" height="16" />
          <rect x="792" y="0" width="24" height="16" />
          <rect x="948" y="0" width="24" height="16" />
          <rect x="1104" y="0" width="24" height="16" />
          <rect x="1260" y="0" width="24" height="16" />
          <rect x="1380" y="0" width="24" height="16" />

          {/* Row 2 checkerboard clusters */}
          <rect x="12" y="16" width="24" height="16" />
          <rect x="84" y="16" width="48" height="16" />
          <rect x="204" y="16" width="24" height="16" />
          <rect x="276" y="16" width="48" height="16" />
          <rect x="384" y="16" width="48" height="16" />
          <rect x="468" y="16" width="24" height="16" />
          <rect x="552" y="16" width="48" height="16" />
          <rect x="672" y="16" width="48" height="16" />
          <rect x="756" y="16" width="24" height="16" />
          <rect x="840" y="16" width="48" height="16" />
          <rect x="924" y="16" width="24" height="16" />
          <rect x="1008" y="16" width="48" height="16" />
          <rect x="1128" y="16" width="48" height="16" />
          <rect x="1224" y="16" width="24" height="16" />
          <rect x="1308" y="16" width="48" height="16" />
          <rect x="1404" y="16" width="36" height="16" />

          {/* Row 3 solid bottom base with stepped notches */}
          <rect x="0" y="32" width="1440" height="16" />
        </g>

        {/* Occasional top-color notches dipping into row 3 */}
        <g fill={topColor}>
          <rect x="48" y="32" width="24" height="16" />
          <rect x="240" y="32" width="24" height="16" />
          <rect x="432" y="32" width="24" height="16" />
          <rect x="612" y="32" width="24" height="16" />
          <rect x="804" y="32" width="24" height="16" />
          <rect x="984" y="32" width="24" height="16" />
          <rect x="1188" y="32" width="24" height="16" />
          <rect x="1356" y="32" width="24" height="16" />
        </g>
      </svg>
    </div>
  );
};
