import React from 'react';

interface PwaAcademicLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  withContainer?: boolean;
}

/**
 * PwaAcademicLogo - The original official Degree Unlocker PWA & Web Logo
 * Features the academic owl with illuminated golden-amber wings,
 * graduation cap / emblem, and parchment diploma scroll with scarlet red ribbon.
 */
export const PwaAcademicLogo: React.FC<PwaAcademicLogoProps> = ({
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
        {/* Amber / Golden Wing Gradient */}
        <linearGradient id="pwaWingGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="80%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Soft Wing Glow Gradient */}
        <linearGradient id="pwaWingGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        {/* Owl Body / Silver Silk Gradient */}
        <linearGradient id="pwaOwlBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        {/* Diploma Parchment Gradient */}
        <linearGradient id="pwaDiplomaParchment" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>

        {/* Red Ribbon Gradient */}
        <linearGradient id="pwaRibbonRed" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>

        {/* Golden Crown Gradient */}
        <linearGradient id="pwaCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <filter id="pwaLogoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#f59e0b" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* --- LEFT WING (Butterfly/Angel Wing 3 segments) --- */}
      {/* Top Left Wing Feather */}
      <path
        d="M44 26 C36 18 20 18 12 24 C10 32 20 40 38 34 Z"
        fill="url(#pwaWingGold)"
        filter="url(#pwaLogoGlow)"
      />
      <path
        d="M40 28 C34 22 22 22 16 26 C15 31 23 37 36 33 Z"
        fill="url(#pwaWingGlow)"
        opacity="0.9"
      />
      {/* Mid Left Wing Feather */}
      <path
        d="M42 36 C34 32 18 34 10 44 C12 52 24 54 40 46 Z"
        fill="url(#pwaWingGold)"
        filter="url(#pwaLogoGlow)"
      />
      {/* Bottom Left Wing Feather */}
      <path
        d="M44 48 C36 48 22 52 14 62 C18 68 30 66 42 56 Z"
        fill="url(#pwaWingGold)"
      />

      {/* --- RIGHT WING (Butterfly/Angel Wing 3 segments) --- */}
      {/* Top Right Wing Feather */}
      <path
        d="M56 26 C64 18 80 18 88 24 C90 32 80 40 62 34 Z"
        fill="url(#pwaWingGold)"
        filter="url(#pwaLogoGlow)"
      />
      <path
        d="M60 28 C66 22 78 22 84 26 C85 31 77 37 64 33 Z"
        fill="url(#pwaWingGlow)"
        opacity="0.9"
      />
      {/* Mid Right Wing Feather */}
      <path
        d="M58 36 C66 32 82 34 90 44 C88 52 76 54 60 46 Z"
        fill="url(#pwaWingGold)"
        filter="url(#pwaLogoGlow)"
      />
      {/* Bottom Right Wing Feather */}
      <path
        d="M56 48 C64 48 78 52 86 62 C82 68 70 66 58 56 Z"
        fill="url(#pwaWingGold)"
      />

      {/* --- CENTRAL ACADEMIC OWL / TORSO --- */}
      {/* Owl Head & Torso */}
      <path
        d="M44 22 C44 16 47 13 50 13 C53 13 56 16 56 22 C56 26 58 32 58 44 C58 56 54 64 50 64 C46 64 42 56 42 44 C42 32 44 26 44 22 Z"
        fill="url(#pwaOwlBody)"
        stroke="#1e293b"
        strokeWidth="1.2"
      />

      {/* Mortarboard / Graduation Cap / Crown Crest */}
      <path
        d="M43 14 L50 9 L57 14 L50 18 Z"
        fill="url(#pwaCrownGrad)"
        stroke="#78350f"
        strokeWidth="0.8"
      />
      <polygon points="50,11 51,13 53,13.5 51.5,15 52,17 50,16 48,17 48.5,15 47,13.5 49,13" fill="#ffffff" />
      <circle cx="50" cy="9" r="1.2" fill="#ffffff" />

      {/* Owl Eyes */}
      <ellipse cx="46.5" cy="24" rx="2.5" ry="3" fill="#0f172a" />
      <circle cx="46" cy="23.5" r="1.2" fill="#f59e0b" />
      <circle cx="45.6" cy="23.2" r="0.5" fill="#ffffff" />

      <ellipse cx="53.5" cy="24" rx="2.5" ry="3" fill="#0f172a" />
      <circle cx="54" cy="23.5" r="1.2" fill="#f59e0b" />
      <circle cx="54.4" cy="23.2" r="0.5" fill="#ffffff" />

      {/* Owl Beak */}
      <polygon points="50,26 48.5,29 51.5,29" fill="#f59e0b" stroke="#78350f" strokeWidth="0.5" />

      {/* Torso Golden Medallion Badge */}
      <ellipse cx="50" cy="40" rx="3.5" ry="5.5" fill="url(#pwaWingGold)" stroke="#78350f" strokeWidth="0.8" />
      <circle cx="50" cy="40" r="1.8" fill="#ffffff" />

      {/* --- DIPLOMA SCROLL (HELD HORIZONTALLY) --- */}
      {/* Scroll Cylinder */}
      <rect
        x="18"
        y="66"
        width="64"
        height="12"
        rx="3"
        fill="url(#pwaDiplomaParchment)"
        stroke="#78350f"
        strokeWidth="1.2"
      />
      {/* Scroll Rolled Ends */}
      <ellipse cx="18" cy="72" rx="3.5" ry="6" fill="#fef08a" stroke="#78350f" strokeWidth="1" />
      <ellipse cx="18" cy="72" rx="1.5" ry="3" fill="#d97706" />
      <ellipse cx="82" cy="72" rx="3.5" ry="6" fill="#fef08a" stroke="#78350f" strokeWidth="1" />

      {/* Red Ribbon Tie & Seal */}
      <rect x="47" y="65.5" width="6" height="13" fill="url(#pwaRibbonRed)" rx="1" />
      {/* Ribbon Tails hanging below */}
      <path d="M47 78.5 L44 89 L50 85 L56 89 L53 78.5 Z" fill="url(#pwaRibbonRed)" stroke="#7f1d1d" strokeWidth="0.6" />
      {/* Golden Seal */}
      <circle cx="50" cy="72" r="3" fill="url(#pwaWingGold)" stroke="#78350f" strokeWidth="0.6" />
      <circle cx="50" cy="72" r="1.2" fill="#ffffff" />

      {/* Talons Holding Scroll */}
      <path d="M43 62 C43 65 42 68 45 68 C46 66 46 63 46 62 Z" fill="#f59e0b" />
      <path d="M54 62 C54 65 55 68 57 68 C58 66 57 63 57 62 Z" fill="#f59e0b" />
    </svg>
  );

  if (withContainer) {
    return (
      <div className="relative flex items-center justify-center p-1.5 rounded-2xl bg-gradient-to-b from-[#0f172a] via-[#080c14] to-black border border-amber-500/30 shadow-md shadow-amber-500/10 group">
        {svgContent}
      </div>
    );
  }

  return svgContent;
};

export default PwaAcademicLogo;
