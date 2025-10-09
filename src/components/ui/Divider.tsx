// components/Divider.tsx
import type React from "react";

interface DividerProps {
  className?: string;
}

const Divider: React.FC<DividerProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 100"
        width="100%"
        height="100"
        preserveAspectRatio="none"
        className="fill-current text-amber-500" // Default color, can be overridden by parent className
      >
        {/* Left Arrow */}
        <path
          d="M0,50 L50,50 M50,50 L40,40 M50,50 L40,60"
          strokeWidth="4"
          stroke="currentColor"
          fill="none"
        />

        {/* Left Line */}
        <line x1="50" y1="50" x2="300" y2="50" strokeWidth="4" stroke="currentColor" />

        {/* Central Ornament */}
        <path
          d="
          M300,50
          C310,30 330,30 340,50
          C350,70 370,70 380,50
          C390,30 410,30 420,50
          C430,70 450,70 460,50
          C470,30 490,30 500,50
          C510,70 530,70 540,50
          C550,30 570,30 580,50
          C590,70 610,70 620,50
          C630,30 650,30 660,50
          C670,70 690,70 700,50
          C710,30 730,30 740,50
          C750,70 770,70 780,50
          C790,30 810,30 820,50
          C830,70 850,70 860,50
          C870,30 890,30 900,50
          C910,70 930,70 940,50
          C950,30 970,30 980,50
          C990,70 1000,70 1000,50
          "
          strokeWidth="4"
          stroke="currentColor"
          fill="none"
        />

        {/* Right Line */}
        <line x1="700" y1="50" x2="950" y2="50" strokeWidth="4" stroke="currentColor" />

        {/* Right Arrow */}
        <path
          d="M950,50 L1000,50 M1000,50 L990,40 M1000,50 L990,60"
          strokeWidth="4"
          stroke="currentColor"
          fill="none"
        />

        {/* Central Diamond (Optional, if needed) */}
        <polygon points="500,40 510,50 500,60 490,50" fill="currentColor" />
      </svg>
    </div>
  );
};

export default Divider;
