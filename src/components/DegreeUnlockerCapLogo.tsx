import React from 'react';

interface DegreeUnlockerCapLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  withContainer?: boolean;
}

/**
 * DegreeUnlockerCapLogo - The Iconic Graduation Cap ("Chapeau du Diplôme") Logo
 * Features the signature academic graduation mortarboard cap with golden tassel,
 * diamond skull cap, and golden trim.
 */
export const DegreeUnlockerCapLogo: React.FC<DegreeUnlockerCapLogoProps> = ({
  className = '',
  size = 'md',
  withContainer = false,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
    custom: '',
  };

  const svgContent = (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${size !== 'custom' ? sizeClasses[size] : ''} ${className} shrink-0 drop-shadow-md select-none`}
    >
      <defs>
        {/* Cap Top Gradient - Deep Indigo Obsidian */}
        <linearGradient id="capTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="40%" stopColor="#312e81" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Cap Rim / Skull Base Gradient */}
        <linearGradient id="capBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#090d16" />
        </linearGradient>

        {/* Gold Tassel Gradient */}
        <linearGradient id="goldTasselGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#fbbf24" />
          <stop offset="80%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Gold Trim Glow */}
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#f59e0b" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* --- UNDER CAP SKULL CAP / BASE --- */}
      <path
        d="M32 50 Q50 64 68 50 L68 62 Q50 76 32 62 Z"
        fill="url(#capBaseGrad)"
        stroke="#4f46e5"
        strokeWidth="1.5"
      />

      {/* --- SCROLL / DIPLOMA ACCENT (Subtle below cap) --- */}
      <rect
        x="36"
        y="65"
        width="28"
        height="6"
        rx="3"
        fill="#fef3c7"
        stroke="#d97706"
        strokeWidth="1"
      />
      <rect
        x="48"
        y="64.5"
        width="4"
        height="7"
        rx="1"
        fill="#ef4444"
      />

      {/* --- GRADUATION CAP DIAMOND BOARD (CHAPEAU DU DIPLOME) --- */}
      {/* Outer Golden Border / Trim */}
      <polygon
        points="50,16 92,34 50,52 8,34"
        fill="url(#goldTasselGrad)"
        filter="url(#goldGlow)"
      />
      {/* Inner Cap Diamond Surface */}
      <polygon
        points="50,18.5 89,34 50,49.5 11,34"
        fill="url(#capTopGrad)"
      />
      {/* Shading / Reflection on Cap */}
      <polygon
        points="50,18.5 89,34 50,34"
        fill="#ffffff"
        opacity="0.12"
      />

      {/* --- CAP CENTER BUTTON --- */}
      <ellipse
        cx="50"
        cy="34"
        rx="3.5"
        ry="2.5"
        fill="url(#goldTasselGrad)"
        stroke="#ffffff"
        strokeWidth="0.8"
      />

      {/* --- GOLDEN TASSEL / POMPON DU DIPLOME --- */}
      {/* Tassel Cord hanging from button to right side */}
      <path
        d="M50 34 Q68 33 76 45"
        fill="none"
        stroke="url(#goldTasselGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Tassel Band Knot */}
      <ellipse
        cx="76"
        cy="46"
        rx="2.5"
        ry="2"
        fill="#d97706"
        stroke="#fef08a"
        strokeWidth="0.5"
      />

      {/* Tassel Fringe / Brush */}
      <path
        d="M74 47 L72 65 Q76 67 80 65 L78 47 Z"
        fill="url(#goldTasselGrad)"
        filter="url(#goldGlow)"
      />

      {/* Highlights on Tassel */}
      <line
        x1="76"
        y1="48"
        x2="76"
        y2="65"
        stroke="#ffffff"
        strokeWidth="1"
        opacity="0.8"
      />
    </svg>
  );

  if (withContainer) {
    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-indigo-950 via-slate-900 to-black border border-amber-400/50 flex items-center justify-center text-white shadow-md shadow-amber-950/40 shrink-0 p-1">
        {svgContent}
      </div>
    );
  }

  return svgContent;
};

export default DegreeUnlockerCapLogo;
