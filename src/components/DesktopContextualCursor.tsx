import React, { useState, useEffect } from 'react';
import { AppTheme } from '../types';

export type CursorContextType = 'default' | 'pointer' | 'exercise' | 'grammar' | 'textbook' | 'formula' | 'drag' | 'code' | 'search';

interface DesktopContextualCursorProps {
  enabled?: boolean;
  activeTheme?: AppTheme;
}

export const DesktopContextualCursor: React.FC<DesktopContextualCursorProps> = ({ 
  enabled = true,
  activeTheme = 'hardcore'
}) => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);
  const [cursorType, setCursorType] = useState<CursorContextType>('default');
  const [badgeText, setBadgeText] = useState<string>('');

  useEffect(() => {
    if (!enabled) return;

    // Detect if touchscreen device only
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Determine element under cursor
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check for explicit data-cursor attributes or smart heuristic detection
      const cursorEl = target.closest('[data-cursor]') as HTMLElement | null;
      if (cursorEl) {
        const val = cursorEl.getAttribute('data-cursor') as CursorContextType;
        setCursorType(val);
        switch (val) {
          case 'exercise':
            setBadgeText('EXO 🎯');
            break;
          case 'grammar':
            setBadgeText('GRAMMAR 📖');
            break;
          case 'textbook':
            setBadgeText('MANUEL 📚');
            break;
          case 'formula':
            setBadgeText('FORMULE ∑');
            break;
          case 'drag':
            setBadgeText('DÉPLACER ↔');
            break;
          case 'code':
            setBadgeText('CODE </>');
            break;
          case 'search':
            setBadgeText('RECHERCHE 🔍');
            break;
          default:
            setBadgeText('');
        }
        return;
      }

      // Check for button or interactive links
      const isInteractive = target.closest('button, a, input, select, textarea, [role="button"], label, .cursor-pointer');
      if (isInteractive) {
        setCursorType('pointer');
        setBadgeText('');
        return;
      }

      // Normal state
      setCursorType('default');
      setBadgeText('');
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, isVisible]);

  if (!enabled || !isVisible) return null;

  // Visual styling adapted to activeTheme
  const isHardcore = activeTheme === 'hardcore';
  const isMidnight = activeTheme === 'midnight';
  const isDark = activeTheme === 'dark';

  // Styles for outer ring
  let ringClasses = 'w-4 h-4 border border-amber-400/40 bg-amber-400/10';
  let dotClasses = 'bg-amber-300/80';
  let badgeClasses = 'bg-black/95 text-amber-400 border-amber-500/50 shadow-amber-500/20';

  if (isHardcore) {
    // TACTICAL LASER AMBER HUD RETICLE
    if (cursorType === 'exercise' || cursorType === 'grammar' || cursorType === 'textbook' || cursorType === 'formula' || cursorType === 'code' || cursorType === 'search') {
      ringClasses = 'w-9 h-9 border-2 border-amber-400 bg-amber-500/20 shadow-[0_0_16px_rgba(245,158,11,0.6)] animate-pulse';
      dotClasses = 'bg-amber-300 w-1.5 h-1.5 shadow-[0_0_8px_#fbbf24]';
    } else if (cursorType === 'pointer') {
      ringClasses = 'w-6 h-6 border-2 border-amber-400 bg-amber-400/20 shadow-[0_0_12px_rgba(245,158,11,0.4)] scale-110';
      dotClasses = 'bg-amber-400 w-1 h-1';
    } else {
      ringClasses = 'w-3.5 h-3.5 border border-amber-400/60 bg-amber-400/10 shadow-[0_0_6px_rgba(245,158,11,0.3)]';
      dotClasses = 'bg-amber-300/90 w-1 h-1';
    }
    badgeClasses = 'bg-[#020305]/95 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]';
  } else if (isMidnight) {
    // ASTRAL CYAN / VIOLET COSMIC STARLIGHT RETICLE
    if (cursorType === 'exercise' || cursorType === 'grammar' || cursorType === 'textbook' || cursorType === 'formula' || cursorType === 'code' || cursorType === 'search') {
      ringClasses = 'w-9 h-9 border-2 border-cyan-400 bg-cyan-500/25 shadow-[0_0_16px_rgba(6,182,212,0.6)] animate-pulse';
      dotClasses = 'bg-cyan-200 w-1.5 h-1.5 shadow-[0_0_8px_#22d3ee]';
    } else if (cursorType === 'pointer') {
      ringClasses = 'w-6 h-6 border-2 border-cyan-400 bg-indigo-500/20 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-110';
      dotClasses = 'bg-cyan-300 w-1 h-1';
    } else {
      ringClasses = 'w-3.5 h-3.5 border border-cyan-400/60 bg-cyan-400/10 shadow-[0_0_6px_rgba(6,182,212,0.3)]';
      dotClasses = 'bg-cyan-300/90 w-1 h-1';
    }
    badgeClasses = 'bg-[#04081a]/95 text-cyan-300 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]';
  } else if (isDark) {
    // SAPPHIRE INDIGO PRECISION RETICLE
    if (cursorType === 'exercise' || cursorType === 'grammar' || cursorType === 'textbook' || cursorType === 'formula' || cursorType === 'code' || cursorType === 'search') {
      ringClasses = 'w-9 h-9 border-2 border-indigo-400 bg-indigo-500/25 shadow-[0_0_14px_rgba(99,102,241,0.5)] animate-pulse';
      dotClasses = 'bg-indigo-200 w-1.5 h-1.5';
    } else if (cursorType === 'pointer') {
      ringClasses = 'w-6 h-6 border-2 border-indigo-400 bg-indigo-400/20 shadow-[0_0_10px_rgba(99,102,241,0.3)] scale-110';
      dotClasses = 'bg-indigo-300 w-1 h-1';
    } else {
      ringClasses = 'w-3.5 h-3.5 border border-indigo-400/60 bg-indigo-400/10';
      dotClasses = 'bg-indigo-300/90 w-1 h-1';
    }
    badgeClasses = 'bg-[#0b1022]/95 text-indigo-300 border-indigo-500/60 shadow-[0_0_10px_rgba(99,102,241,0.25)]';
  } else {
    // CLASSICAL / LIGHT CLEAN ACADEMIC POINTER
    if (cursorType === 'exercise' || cursorType === 'grammar' || cursorType === 'textbook' || cursorType === 'formula' || cursorType === 'code' || cursorType === 'search') {
      ringClasses = 'w-8 h-8 border-2 border-indigo-600 bg-indigo-600/15 shadow-md';
      dotClasses = 'bg-indigo-600 w-1.5 h-1.5';
    } else if (cursorType === 'pointer') {
      ringClasses = 'w-5.5 h-5.5 border border-indigo-600 bg-indigo-600/10';
      dotClasses = 'bg-indigo-600 w-1 h-1';
    } else {
      ringClasses = 'w-3 h-3 border border-indigo-500/50 bg-indigo-500/5';
      dotClasses = 'bg-indigo-600/80 w-1 h-1';
    }
    badgeClasses = 'bg-slate-900/95 text-indigo-300 border-slate-700 shadow-md';
  }

  return (
    <div
      className="pointer-events-none fixed z-9999 transition-transform duration-75 ease-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Outer Reticle / Ring */}
      <div className={`rounded-full transition-all duration-150 flex items-center justify-center ${ringClasses}`}>
        {/* Core Center Dot */}
        <div className={`rounded-full transition-colors ${dotClasses}`} />
      </div>

      {/* Floating Micro-Badge Tag */}
      {badgeText && (
        <div
          className={`absolute left-6 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider whitespace-nowrap shadow-md backdrop-blur-md transition-all duration-150 border ${badgeClasses}`}
        >
          {badgeText}
        </div>
      )}
    </div>
  );
};

export default DesktopContextualCursor;
