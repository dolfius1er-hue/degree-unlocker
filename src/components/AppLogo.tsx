import React from 'react';
import { AppTheme } from '../types';
import { DegreeUnlockerCapLogo } from './DegreeUnlockerCapLogo';
import { PcImperialEagleLogo } from './PcImperialEagleLogo';

export interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  withContainer?: boolean;
  variant?: 'auto' | 'cap' | 'pc' | 'hardcore' | 'dark' | 'midnight' | 'paper' | 'light';
  activeTheme?: AppTheme;
}

/**
 * AppLogo - Degree Unlocker Official Adaptive Brand Logo & Icon Suite
 * Dynamically switches icon and styling according to the active mode:
 * - Hardcore PC Workstation: Imperial Aquila & Cyber Gold Crest
 * - Bleu Minuit: Astral Midnight Celestial Cap with Neon Cyan / Violet Glow
 * - Sombre Élégant: Sapphire Obsidian Academic Crest & Cap
 * - Papier Chaud: Classical Vintage Sepia Mortarboard Seal
 * - Clair Académique: Royal Indigo Graduation Cap & Gold Tassel
 */
export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  size = 'md',
  withContainer = false,
  variant = 'auto',
  activeTheme = 'light',
}) => {
  // Determine effective mode: explicit variant takes priority, then activeTheme
  const effectiveTheme: AppTheme = 
    variant === 'pc' || variant === 'hardcore'
      ? 'hardcore'
      : variant === 'midnight'
      ? 'midnight'
      : variant === 'dark'
      ? 'dark'
      : variant === 'paper'
      ? 'paper'
      : variant === 'light' || variant === 'cap'
      ? 'light'
      : activeTheme;

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
    custom: '',
  };

  const dimClass = size !== 'custom' ? sizeClasses[size] : '';

  // 1. HARDCORE PC MODE: Imperial Aquila & Cyber Gold Crest
  if (effectiveTheme === 'hardcore') {
    if (withContainer) {
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-amber-500/20 via-black to-zinc-950 border border-amber-400/60 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0 p-1 group-hover:border-amber-400 transition-all">
          <PcImperialEagleLogo
            className={className}
            size={size}
            withContainer={false}
          />
        </div>
      );
    }
    return (
      <PcImperialEagleLogo
        className={className}
        size={size}
        withContainer={false}
      />
    );
  }

  // 2. BLEU MINUIT MODE: Astral Midnight Celestial Cap & Luminous Star
  if (effectiveTheme === 'midnight') {
    const midnightSvg = (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${dimClass} ${className} shrink-0 drop-shadow-[0_0_12px_rgba(6,182,212,0.5)] select-none`}
      >
        <defs>
          <linearGradient id="midnightCapTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="45%" stopColor="#4c1d95" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="cyanNeonTassel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#06b6d4" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Skull base with cosmic glow */}
        <path
          d="M32 50 Q50 64 68 50 L68 62 Q50 76 32 62 Z"
          fill="#0f172a"
          stroke="#06b6d4"
          strokeWidth="1.5"
        />

        {/* Star Diploma Scroll */}
        <rect x="36" y="65" width="28" height="6" rx="3" fill="#0e7490" stroke="#38bdf8" strokeWidth="1" />
        <circle cx="50" cy="68" r="2.5" fill="#a855f7" />

        {/* Diamond Board */}
        <polygon points="50,16 92,34 50,52 8,34" fill="url(#cyanNeonTassel)" filter="url(#cyanGlow)" />
        <polygon points="50,18.5 89,34 50,49.5 11,34" fill="url(#midnightCapTop)" />
        <polygon points="50,18.5 89,34 50,34" fill="#ffffff" opacity="0.18" />

        {/* Cosmic Celestial Star in Center */}
        <ellipse cx="50" cy="34" rx="3.5" ry="2.5" fill="url(#cyanNeonTassel)" stroke="#ffffff" strokeWidth="0.8" />
        
        {/* Glowing Tassel */}
        <path d="M50 34 Q68 33 76 45" fill="none" stroke="url(#cyanNeonTassel)" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="76" cy="46" rx="2.5" ry="2" fill="#0891b2" stroke="#67e8f9" strokeWidth="0.5" />
        <path d="M74 47 L72 65 Q76 67 80 65 L78 47 Z" fill="url(#cyanNeonTassel)" filter="url(#cyanGlow)" />
      </svg>
    );

    if (withContainer) {
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-indigo-900/60 via-slate-950 to-black border border-cyan-400/50 flex items-center justify-center text-white shadow-lg shadow-cyan-900/40 shrink-0 p-1">
          {midnightSvg}
        </div>
      );
    }
    return midnightSvg;
  }

  // 3. SOMBRE ÉLÉGANT MODE: Sapphire Obsidian Crest & Cap
  if (effectiveTheme === 'dark') {
    const darkSvg = (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${dimClass} ${className} shrink-0 drop-shadow-[0_2px_8px_rgba(99,102,241,0.35)] select-none`}
      >
        <defs>
          <linearGradient id="darkCapTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3730a3" />
            <stop offset="45%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>
          <linearGradient id="sapphireTassel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>

        <path d="M32 50 Q50 64 68 50 L68 62 Q50 76 32 62 Z" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" />
        <rect x="36" y="65" width="28" height="6" rx="3" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
        <polygon points="50,16 92,34 50,52 8,34" fill="url(#sapphireTassel)" />
        <polygon points="50,18.5 89,34 50,49.5 11,34" fill="url(#darkCapTop)" />
        <polygon points="50,18.5 89,34 50,34" fill="#ffffff" opacity="0.12" />

        <ellipse cx="50" cy="34" rx="3.5" ry="2.5" fill="url(#sapphireTassel)" stroke="#ffffff" strokeWidth="0.8" />
        <path d="M50 34 Q68 33 76 45" fill="none" stroke="url(#sapphireTassel)" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="76" cy="46" rx="2.5" ry="2" fill="#d97706" stroke="#fef08a" strokeWidth="0.5" />
        <path d="M74 47 L72 65 Q76 67 80 65 L78 47 Z" fill="url(#sapphireTassel)" />
      </svg>
    );

    if (withContainer) {
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-indigo-950 via-slate-900 to-black border border-indigo-500/40 flex items-center justify-center text-white shadow-md shadow-indigo-950/40 shrink-0 p-1">
          {darkSvg}
        </div>
      );
    }
    return darkSvg;
  }

  // 4. PAPIER & CLAIR DEFAULT: Classic DegreeUnlocker Cap
  return (
    <DegreeUnlockerCapLogo
      className={className}
      size={size}
      withContainer={withContainer}
    />
  );
};

export default AppLogo;
