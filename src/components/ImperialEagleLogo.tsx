import React from 'react';

interface ImperialEagleLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  withContainer?: boolean;
}

export const ImperialEagleLogo: React.FC<ImperialEagleLogoProps> = ({
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
        {/* Imperial Gold Gradient */}
        <linearGradient id="eagleGold" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#f59e0b" />
          <stop offset="70%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Imperial Silver/Steel Highlights */}
        <linearGradient id="eagleSilver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        {/* Scroll Parchment Gradient */}
        <linearGradient id="parchmentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="40%" stopColor="#ffffff" />
          <stop offset="80%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>

        {/* Ribbon Scarlet Red Gradient */}
        <linearGradient id="ribbonRed" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>

        {/* Subtle Glow Filter */}
        <filter id="imperialGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#f59e0b" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* --- CROWN / IMPERIAL CREST --- */}
      <path
        d="M44 14 L47 8 L50 12 L53 8 L56 14 Z"
        fill="url(#eagleGold)"
        stroke="#78350f"
        strokeWidth="1"
      />
      <circle cx="50" cy="9.5" r="1" fill="#ffffff" />

      {/* --- EAGLE HEAD & BEAK --- */}
      {/* Head facing left majestically */}
      <path
        d="M48 15 C44 15 42 18 42 21 C39 21.5 35 22.5 34 25 C37 25.5 39 25.2 41 25.5 C40 27.5 42 30 46 31 L54 31 C58 30 60 27.5 59 25.5 C61 25.2 63 25.5 66 25 C65 22.5 61 21.5 58 21 C58 18 56 15 48 15 Z"
        fill="url(#eagleSilver)"
        stroke="#1e293b"
        strokeWidth="1.2"
      />
      {/* Fierce Beak */}
      <path
        d="M39 22 C34 23 31 25 30 28 C34 28 38 27 40 25.5 Z"
        fill="url(#eagleGold)"
        stroke="#78350f"
        strokeWidth="0.8"
      />
      {/* Eagle Eye */}
      <circle cx="43" cy="21" r="1.5" fill="#f59e0b" />
      <circle cx="42.8" cy="20.8" r="0.7" fill="#09090b" />

      {/* --- IMPERIAL WINGS (LEFT & RIGHT EXPANDED) --- */}
      {/* Left Wing (Majestic layered feathers) */}
      <path
        d="M45 28 C38 24 25 18 10 20 C6 24 8 32 14 36 C8 37 6 44 12 48 C7 50 6 58 15 60 C24 62 38 52 44 42 Z"
        fill="url(#eagleGold)"
        stroke="#78350f"
        strokeWidth="1.2"
        filter="url(#imperialGlow)"
      />
      <path
        d="M42 33 C34 30 22 27 15 28 C18 33 24 37 32 39 Z"
        fill="url(#eagleSilver)"
        opacity="0.9"
      />
      <path
        d="M40 40 C32 40 22 39 16 42 C20 46 28 47 35 46 Z"
        fill="url(#eagleSilver)"
        opacity="0.85"
      />

      {/* Right Wing (Symmetric & Grand) */}
      <path
        d="M55 28 C62 24 75 18 90 20 C94 24 92 32 86 36 C92 37 94 44 88 48 C93 50 94 58 85 60 C76 62 62 52 56 42 Z"
        fill="url(#eagleGold)"
        stroke="#78350f"
        strokeWidth="1.2"
        filter="url(#imperialGlow)"
      />
      <path
        d="M58 33 C66 30 78 27 85 28 C82 33 76 37 68 39 Z"
        fill="url(#eagleSilver)"
        opacity="0.9"
      />
      <path
        d="M60 40 C68 40 78 39 84 42 C80 46 72 47 65 46 Z"
        fill="url(#eagleSilver)"
        opacity="0.85"
      />

      {/* --- EAGLE BODY & CHEST SHIELD --- */}
      <path
        d="M44 31 C40 37 39 46 42 56 C45 64 50 68 50 68 C50 68 55 64 58 56 C61 46 60 37 56 31 Z"
        fill="url(#eagleSilver)"
        stroke="#1e293b"
        strokeWidth="1.4"
      />
      {/* Imperial Breastplate Emblem */}
      <path
        d="M46 36 L50 33 L54 36 L54 44 L50 48 L46 44 Z"
        fill="url(#eagleGold)"
        stroke="#78350f"
        strokeWidth="1"
      />
      {/* Subtle Star in Shield */}
      <polygon
        points="50,37 51,39 53.5,39.5 51.5,41 52,43.5 50,42 48,43.5 48.5,41 46.5,39.5 49,39"
        fill="#ffffff"
      />

      {/* --- EAGLE TAIL FEATHERS --- */}
      <path
        d="M45 66 L41 78 L47 75 L50 82 L53 75 L59 78 L55 66 Z"
        fill="url(#eagleGold)"
        stroke="#78350f"
        strokeWidth="1"
      />

      {/* --- DIPLOMA SCROLL (HELD IN TALONS) --- */}
      {/* Parchment Cylinder Body */}
      <rect
        x="18"
        y="70"
        width="64"
        height="12"
        rx="3"
        fill="url(#parchmentGrad)"
        stroke="#78350f"
        strokeWidth="1.4"
      />
      {/* Rolled Ends Details */}
      <ellipse cx="18" cy="76" rx="3.5" ry="6" fill="#fef08a" stroke="#78350f" strokeWidth="1.2" />
      <ellipse cx="18" cy="76" rx="1.5" ry="3.5" fill="#d97706" />
      <ellipse cx="82" cy="76" rx="3.5" ry="6" fill="#fef08a" stroke="#78350f" strokeWidth="1.2" />

      {/* Academic Diploma Ribbon & Wax Seal */}
      <rect x="47" y="69.5" width="6" height="13" fill="url(#ribbonRed)" rx="1" />
      {/* Hanging Ribbon Tails */}
      <path d="M47 82.5 L45 92 L50 88 L55 92 L53 82.5 Z" fill="url(#ribbonRed)" stroke="#7f1d1d" strokeWidth="0.8" />
      {/* Gold Seal Medallion */}
      <circle cx="50" cy="76" r="3.2" fill="url(#eagleGold)" stroke="#78350f" strokeWidth="0.8" />
      <circle cx="50" cy="76" r="1.4" fill="#ffffff" />

      {/* --- TALONS / CLAWS GRASPING THE DIPLOMA --- */}
      {/* Left Talon grasping scroll */}
      <path
        d="M38 65 C37 68 36 71 36 73 C37 74 39 74 40 72 C41 74 43 74 44 72 C45 74 47 73 47 71 C46 68 44 65 42 64 Z"
        fill="url(#eagleGold)"
        stroke="#78350f"
        strokeWidth="1"
      />
      {/* Right Talon grasping scroll */}
      <path
        d="M62 65 C63 68 64 71 64 73 C63 74 61 74 60 72 C59 74 57 74 56 72 C55 74 53 73 53 71 C54 68 56 65 58 64 Z"
        fill="url(#eagleGold)"
        stroke="#78350f"
        strokeWidth="1"
      />
    </svg>
  );

  if (withContainer) {
    return (
      <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-gradient-to-b from-amber-500/20 via-slate-900 to-black border border-amber-400/40 shadow-lg shadow-amber-500/10 group">
        {svgContent}
      </div>
    );
  }

  return svgContent;
};
