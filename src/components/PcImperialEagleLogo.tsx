import React from 'react';

interface PcImperialEagleLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  withContainer?: boolean;
}

/**
 * PcImperialEagleLogo - The Imperial Double-Headed Aquila Logo for the PC Desktop App
 * Based on the stone/gunmetal double-headed imperial eagle with expansive wings and lightning talons.
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
      className={`${size !== 'custom' ? sizeClasses[size] : ''} ${className} shrink-0 drop-shadow-md select-none`}
    >
      <defs>
        {/* Stone / Steel Hardcore Gradient */}
        <linearGradient id="aquilaStone" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4d4d8" />
          <stop offset="35%" stopColor="#a1a1aa" />
          <stop offset="70%" stopColor="#71717a" />
          <stop offset="100%" stopColor="#3f3f46" />
        </linearGradient>

        {/* Gold Inlay Trim */}
        <linearGradient id="aquilaGoldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        <filter id="aquilaShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.8" floodColor="#000000" floodOpacity="0.8" />
        </filter>
      </defs>

      {/* --- AQUILA UPPER WING BARS --- */}
      {/* Top Left Wing Bar */}
      <polygon
        points="6,22 50,22 46,27 14,27"
        fill="url(#aquilaStone)"
        stroke="#27272a"
        strokeWidth="0.8"
        filter="url(#aquilaShadow)"
      />
      {/* Top Right Wing Bar */}
      <polygon
        points="114,22 70,22 74,27 106,27"
        fill="url(#aquilaStone)"
        stroke="#27272a"
        strokeWidth="0.8"
        filter="url(#aquilaShadow)"
      />

      {/* --- LEFT WING FEATHERS (Cascading blades) --- */}
      <polygon points="10,29 46,29 44,34 16,34" fill="url(#aquilaStone)" stroke="#27272a" strokeWidth="0.6" />
      <polygon points="14,36 44,36 42,41 20,41" fill="url(#aquilaStone)" stroke="#27272a" strokeWidth="0.6" />
      <polygon points="18,43 42,43 40,48 24,48" fill="url(#aquilaStone)" stroke="#27272a" strokeWidth="0.6" />
      <polygon points="22,50 40,50 38,55 28,55" fill="url(#aquilaStone)" stroke="#27272a" strokeWidth="0.6" />
      <polygon points="26,57 38,57 36,62 30,62" fill="url(#aquilaStone)" stroke="#27272a" strokeWidth="0.6" />

      {/* --- RIGHT WING FEATHERS (Cascading blades) --- */}
      <polygon points="110,29 74,29 76,34 104,34" fill="url(#aquilaStone)" stroke="#27272a" strokeWidth="0.6" />
      <polygon points="106,36 76,36 78,41 100,41" fill="url(#aquilaStone)" stroke="#27272a" strokeWidth="0.6" />
      <polygon points="102,43 78,43 80,48 96,48" fill="url(#aquilaStone)" stroke="#27272a" strokeWidth="0.6" />
      <polygon points="98,50 80,50 82,55 92,55" fill="url(#aquilaStone)" stroke="#27272a" strokeWidth="0.6" />
      <polygon points="94,57 82,57 84,62 90,62" fill="url(#aquilaStone)" stroke="#27272a" strokeWidth="0.6" />

      {/* --- DOUBLE HEADS (Left Head & Right Head) --- */}
      {/* Left Head */}
      <polygon
        points="48,26 43,26 40,29 45,31 43,35 48,34 52,38 52,28"
        fill="url(#aquilaStone)"
        stroke="#18181b"
        strokeWidth="0.8"
      />
      <circle cx="46" cy="30" r="1" fill="#f59e0b" />

      {/* Right Head */}
      <polygon
        points="72,26 77,26 80,29 75,31 77,35 72,34 68,38 68,28"
        fill="url(#aquilaStone)"
        stroke="#18181b"
        strokeWidth="0.8"
      />
      <circle cx="74" cy="30" r="1" fill="#f59e0b" />

      {/* --- CENTRAL DIAMOND SHIELD / TORSO --- */}
      <polygon
        points="60,30 70,44 60,68 50,44"
        fill="url(#aquilaStone)"
        stroke="#18181b"
        strokeWidth="1.2"
        filter="url(#aquilaShadow)"
      />
      <polygon
        points="60,35 66,45 60,62 54,45"
        fill="url(#aquilaGoldTrim)"
        stroke="#78350f"
        strokeWidth="0.6"
      />

      {/* --- TALONS / CLAWS (Geometric mechanical grip) --- */}
      {/* Left Talon */}
      <polygon points="46,70 52,70 50,78 44,78" fill="url(#aquilaStone)" stroke="#27272a" strokeWidth="0.8" />
      <polygon points="42,78 46,78 44,84 40,84" fill="url(#aquilaStone)" stroke="#27272a" strokeWidth="0.8" />
      <polygon points="48,78 52,78 54,84 50,84" fill="url(#aquilaStone)" stroke="#27272a" strokeWidth="0.8" />

      {/* Right Talon */}
      <polygon points="74,70 68,70 70,78 76,78" fill="url(#aquilaStone)" stroke="#27272a" strokeWidth="0.8" />
      <polygon points="78,78 74,78 76,84 80,84" fill="url(#aquilaStone)" stroke="#27272a" strokeWidth="0.8" />
      <polygon points="72,78 68,78 66,84 70,84" fill="url(#aquilaStone)" stroke="#27272a" strokeWidth="0.8" />

      {/* Central Tail Feathers */}
      <polygon points="56,68 64,68 62,80 58,80" fill="url(#aquilaStone)" stroke="#27272a" strokeWidth="0.8" />
      <polygon points="58,80 62,80 60,86" fill="url(#aquilaGoldTrim)" />
    </svg>
  );

  if (withContainer) {
    return (
      <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-gradient-to-b from-[#18181b] via-[#09090b] to-black border border-zinc-700/60 shadow-lg shadow-black/80 group">
        {svgContent}
      </div>
    );
  }

  return svgContent;
};

export default PcImperialEagleLogo;
