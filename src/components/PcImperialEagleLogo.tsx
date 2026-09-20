import React from 'react';

interface PcImperialEagleLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  withContainer?: boolean;
}

/**
 * DegreeUnlockerAcademicEagleLogo (formerly PcImperialEagleLogo)
 * 100% Original Geometric Knowledge Crest & Academic Wings.
 * Clean, modern, compliant with international copyright and IP laws.
 */
export const PcImperialEagleLogo: React.FC<PcImperialEagleLogoProps> = ({
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
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${size !== 'custom' ? sizeClasses[size] : ''} ${className} shrink-0 drop-shadow-md select-none transition-transform duration-200`}
    >
      <defs>
        {/* Obsidian & Titanium Gradient */}
        <linearGradient id="crestTitanium" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f4f4f5" />
          <stop offset="35%" stopColor="#a1a1aa" />
          <stop offset="70%" stopColor="#52525b" />
          <stop offset="100%" stopColor="#27272a" />
        </linearGradient>

        {/* Academic Gold Inlay */}
        <linearGradient id="crestGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>

        {/* Cyber Cyan Accent */}
        <linearGradient id="crestCyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        <filter id="crestShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* --- GEOMETRIC ACADEMIC CREST WINGS --- */}
      {/* Left Wing Facets */}
      <polygon points="10,24 54,24 48,32 16,32" fill="url(#crestTitanium)" stroke="#18181b" strokeWidth="0.8" filter="url(#crestShadow)" />
      <polygon points="14,34 50,34 46,42 22,42" fill="url(#crestTitanium)" stroke="#18181b" strokeWidth="0.8" />
      <polygon points="20,44 48,44 44,52 28,52" fill="url(#crestTitanium)" stroke="#18181b" strokeWidth="0.8" />
      <polygon points="26,54 46,54 42,62 34,62" fill="url(#crestGold)" stroke="#713f12" strokeWidth="0.8" />

      {/* Right Wing Facets */}
      <polygon points="110,24 66,24 72,32 104,32" fill="url(#crestTitanium)" stroke="#18181b" strokeWidth="0.8" filter="url(#crestShadow)" />
      <polygon points="106,34 70,34 74,42 98,42" fill="url(#crestTitanium)" stroke="#18181b" strokeWidth="0.8" />
      <polygon points="100,44 72,44 76,52 92,52" fill="url(#crestTitanium)" stroke="#18181b" strokeWidth="0.8" />
      <polygon points="94,54 74,54 78,62 86,62" fill="url(#crestGold)" stroke="#713f12" strokeWidth="0.8" />

      {/* --- CENTRAL ACADEMIC SHIELD & DEGREE EMBLEM --- */}
      {/* Central Diamond/Shield Body */}
      <polygon points="60,12 74,38 60,68 46,38" fill="url(#crestTitanium)" stroke="#18181b" strokeWidth="1" filter="url(#crestShadow)" />
      <polygon points="60,20 70,40 60,62 50,40" fill="#09090b" stroke="url(#crestGold)" strokeWidth="0.8" />

      {/* Academic Mortarboard in Center Shield */}
      <polygon points="60,28 68,34 60,40 52,34" fill="url(#crestGold)" />
      <path d="M55,37 L55,43 C55,45 65,45 65,43 L65,37" fill="none" stroke="url(#crestGold)" strokeWidth="1" />
      <circle cx="60" cy="34" r="1.2" fill="#ffffff" />
      <path d="M60,34 L66,37 L66,42" fill="none" stroke="url(#crestCyan)" strokeWidth="0.8" />

      {/* Lower Laurels / Lightning Talons */}
      <polygon points="48,68 56,68 54,78 46,78" fill="url(#crestGold)" stroke="#713f12" strokeWidth="0.6" />
      <polygon points="72,68 64,68 66,78 74,78" fill="url(#crestGold)" stroke="#713f12" strokeWidth="0.6" />
      <polygon points="56,76 64,76 60,88" fill="url(#crestTitanium)" stroke="#18181b" strokeWidth="0.8" />
    </svg>
  );

  if (withContainer) {
    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-zinc-800 to-black border border-amber-500/40 flex items-center justify-center p-1.5 shadow-lg shadow-black/50">
        {svgContent}
      </div>
    );
  }

  return svgContent;
};

export default PcImperialEagleLogo;
