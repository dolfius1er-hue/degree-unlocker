import React, { useState, useEffect, useId, useRef } from 'react';
import {
  Accessibility,
  X,
  Type,
  Contrast,
  Sliders,
  RotateCcw,
  Check,
  Eye,
  Activity,
  Sparkles,
  BookOpen,
  Volume2,
  ExternalLink,
  ChevronRight,
  Maximize2,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAccessibilityEnhancements, AdaFontSize, AdaContrastMode, AdaLineSpacing } from '../hooks/useAccessibilityEnhancements';
import { AppLanguage } from '../types';
import { soundFx } from '../utils/soundEffects';

interface AccessibilityMenuToggleProps {
  lang?: AppLanguage;
  onOpenAccessibilityStatement?: () => void;
}

export const AccessibilityMenuToggle: React.FC<AccessibilityMenuToggleProps> = ({
  lang = 'fr',
  onOpenAccessibilityStatement,
}) => {
  const baseId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [isFloatingVisible, setIsFloatingVisible] = useState(true);
  const { settings, updateSetting, resetAll, activeCount } = useAccessibilityEnhancements();
  const isFr = lang === 'fr';

  // Reading Ruler cursor tracker
  const [rulerY, setRulerY] = useState(250);
  const [isRulerDragging, setIsRulerDragging] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const autoHideTimerRef = useRef<any>(null);

  // 2-minute auto-hide timer for the floating badge
  const resetAutoHideTimer = () => {
    setIsFloatingVisible(true);
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
    }
    // 2 minutes = 120,000 ms
    autoHideTimerRef.current = setTimeout(() => {
      // Auto hide only if dialog is not currently open
      if (!isOpen) {
        setIsFloatingVisible(false);
      }
    }, 120000);
  };

  useEffect(() => {
    resetAutoHideTimer();
    return () => {
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    };
  }, [isOpen]);

  // Listen to external triggers from Sidebar footer or Preferences modal
  useEffect(() => {
    const handleOpenMenu = () => {
      setIsFloatingVisible(true);
      setIsOpen(true);
      soundFx.playSwitch();
    };

    const handleToggleMenu = () => {
      setIsFloatingVisible(true);
      setIsOpen((prev) => !prev);
      soundFx.playSwitch();
    };

    window.addEventListener('open-ada-accessibility-menu', handleOpenMenu);
    window.addEventListener('toggle-ada-accessibility-menu', handleToggleMenu);

    return () => {
      window.removeEventListener('open-ada-accessibility-menu', handleOpenMenu);
      window.removeEventListener('toggle-ada-accessibility-menu', handleToggleMenu);
    };
  }, []);

  // Global shortcut: Alt + A (or Option + A on Mac) to toggle menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsFloatingVisible(true);
        resetAutoHideTimer();
        setIsOpen((prev) => {
          const next = !prev;
          if (next) soundFx.playSwitch();
          else soundFx.playClick(600);
          return next;
        });
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Reading ruler tracking
  useEffect(() => {
    if (!settings.readingRuler) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      setRulerY(clientY);
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, [settings.readingRuler]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) soundFx.playSwitch();
      else soundFx.playClick(600);
      return next;
    });
  };

  const handleReset = () => {
    soundFx.playClick(500);
    resetAll();
  };

  return (
    <>
      {/* 1. Interactive ADA Reading Ruler Overlay */}
      {settings.readingRuler && (
        <div
          id={`${baseId}-reading-ruler`}
          aria-hidden="true"
          className="fixed left-0 right-0 pointer-events-none z-[9999] transition-transform duration-75"
          style={{
            top: `${rulerY - 18}px`,
            height: '36px',
          }}
        >
          <div className="w-full h-full bg-amber-400/20 border-y-2 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.3)] backdrop-brightness-110" />
        </div>
      )}

      {/* 2. Floating Trigger Button (Auto-hides after 2 minutes, accessible via Sidebar/Settings footer) */}
      <AnimatePresence>
        {(isFloatingVisible || isOpen || activeCount > 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={resetAutoHideTimer}
            className="fixed bottom-5 left-5 z-40 print:hidden select-none"
          >
            <button
              id={`${baseId}-trigger-btn`}
              onClick={handleToggle}
              aria-expanded={isOpen}
              aria-haspopup="dialog"
              aria-controls={`${baseId}-dialog`}
              aria-label={
                isFr
                  ? `Ouvrir le menu d'accessibilité ADA (Raccourci Alt+A). ${activeCount} option(s) active(s).`
                  : `Open ADA Accessibility Menu (Shortcut Alt+A). ${activeCount} active setting(s).`
              }
              className={`group flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl shadow-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-400/50 ${
                isOpen || activeCount > 0
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 text-white border-2 border-indigo-400/80 shadow-indigo-500/25 scale-105'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-indigo-500/60 backdrop-blur-md hover:shadow-2xl'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <div className={`p-1.5 rounded-xl ${activeCount > 0 ? 'bg-indigo-950/60 text-amber-300' : 'bg-slate-800 text-indigo-400 group-hover:text-indigo-300'} transition-colors`}>
                  <Accessibility className="w-5 h-5 animate-pulse" />
                </div>
                {activeCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center border-2 border-slate-900 shadow-sm animate-in zoom-in-50 duration-150">
                    {activeCount}
                  </span>
                )}
              </div>

              <div className="hidden sm:flex flex-col text-left pr-1">
                <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>{isFr ? 'Accessibilité' : 'Accessibility'}</span>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-white/20 text-white">
                    ADA
                  </span>
                </span>
                <span className="text-[10px] text-slate-300 font-mono">
                  {activeCount > 0 ? (isFr ? `${activeCount} actif(s)` : `${activeCount} active`) : 'Alt + A'}
                </span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Sliding Accessible Floating Dialog / Flyout */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`${baseId}-dialog`}
            ref={menuRef}
            role="dialog"
            aria-modal="false"
            aria-labelledby={`${baseId}-heading`}
            initial={{ opacity: 0, scale: 0.94, y: 20, x: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-20 left-4 sm:left-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[85vh] bg-slate-900/95 border-2 border-indigo-500/60 text-slate-100 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col print:hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
                  <Accessibility className="w-5 h-5" />
                </div>
                <div>
                  <h3 id={`${baseId}-heading`} className="font-extrabold text-sm text-white flex items-center gap-2">
                    <span>{isFr ? 'Menu d\'Accessibilité ADA' : 'ADA Accessibility Menu'}</span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      WCAG 2.1 AA
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isFr ? 'Conformité & adaptations visuelles persistantes' : 'Persistent accommodations & ergonomics'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {activeCount > 0 && (
                  <button
                    onClick={handleReset}
                    title={isFr ? 'Réinitialiser tous les paramètres' : 'Reset all accessibility settings'}
                    className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700/60 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[10px] font-bold">{isFr ? 'RÀZ' : 'Reset'}</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer focus:ring-2 focus:ring-indigo-500"
                  aria-label={isFr ? 'Fermer le menu' : 'Close menu'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Controls Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs custom-scrollbar max-h-[62vh]">
              
              {/* CONTROL 1: FONT SIZE STEPPER */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200 font-bold">
                    <Type className="w-4 h-4 text-indigo-400" />
                    <span>{isFr ? 'Taille du texte' : 'Font Size Scaling'}</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-indigo-300">
                    {settings.fontSize === 'normal' && '100%'}
                    {settings.fontSize === 'large' && '115% (Grand)'}
                    {settings.fontSize === 'xlarge' && '130% (Très Grand)'}
                    {settings.fontSize === 'huge' && '145% (Max)'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {(['normal', 'large', 'xlarge', 'huge'] as AdaFontSize[]).map((level, idx) => {
                    const labels = ['A', 'A+', 'A++', 'A+++'];
                    const isSelected = settings.fontSize === level;
                    return (
                      <button
                        key={level}
                        onClick={() => {
                          soundFx.playClick(650 + idx * 80);
                          updateSetting('fontSize', level);
                        }}
                        aria-pressed={isSelected}
                        className={`py-2 rounded-xl text-center font-bold text-xs transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-md scale-[1.02]'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <span className="block font-black">{labels[idx]}</span>
                        <span className="text-[9px] block opacity-75">{idx === 0 ? '100%' : `+${idx * 15}%`}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CONTROL 2: HIGH CONTRAST MODES (WCAG AAA) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200 font-bold">
                    <Contrast className="w-4 h-4 text-amber-400" />
                    <span>{isFr ? 'Modes Contraste Élevé (ADA)' : 'High Contrast Modes'}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-400">WCAG AAA</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      soundFx.playClick(700);
                      updateSetting('contrastMode', settings.contrastMode === 'contrast-light' ? 'off' : 'contrast-light');
                    }}
                    aria-pressed={settings.contrastMode === 'contrast-light'}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[58px] ${
                      settings.contrastMode === 'contrast-light'
                        ? 'bg-white text-slate-950 border-white ring-2 ring-indigo-500 font-black shadow-md'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">{isFr ? 'Contraste Clair' : 'High Contrast Light'}</span>
                    <span className="text-[10px] opacity-75">{isFr ? 'Fond blanc & texte noir' : 'Pure black on white'}</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick(700);
                      updateSetting('contrastMode', settings.contrastMode === 'contrast-dark' ? 'off' : 'contrast-dark');
                    }}
                    aria-pressed={settings.contrastMode === 'contrast-dark'}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[58px] ${
                      settings.contrastMode === 'contrast-dark'
                        ? 'bg-black text-amber-300 border-amber-400 ring-2 ring-amber-400 font-black shadow-md'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">{isFr ? 'Contraste Sombre' : 'High Contrast Dark'}</span>
                    <span className="text-[10px] opacity-75">{isFr ? 'Onyx & Jaune vif AAA' : 'Yellow on Onyx AAA'}</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick(650);
                      updateSetting('contrastMode', settings.contrastMode === 'contrast-mono' ? 'off' : 'contrast-mono');
                    }}
                    aria-pressed={settings.contrastMode === 'contrast-mono'}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[58px] ${
                      settings.contrastMode === 'contrast-mono'
                        ? 'bg-slate-300 text-slate-950 border-white ring-2 ring-slate-400 font-bold shadow-md'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">{isFr ? 'Monochrome' : 'Monochrome / Gray'}</span>
                    <span className="text-[10px] opacity-75">{isFr ? 'Zéro distraction couleur' : 'Zero saturation'}</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick(600);
                      updateSetting('contrastMode', 'off');
                    }}
                    aria-pressed={settings.contrastMode === 'off'}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[58px] ${
                      settings.contrastMode === 'off'
                        ? 'bg-indigo-600/30 text-white border-indigo-500 font-bold'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">{isFr ? 'Contraste Standard' : 'Standard Contrast'}</span>
                    <span className="text-[10px] opacity-75">{isFr ? 'Couleurs d\'origine' : 'Original palette'}</span>
                  </button>
                </div>
              </div>

              {/* CONTROL 3: REDUCE MOTION (ADA REQUIREMENT) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-slate-200 font-bold">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>{isFr ? 'Réduire les mouvements' : 'Reduce Motion'}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {isFr ? 'Désactive toutes les animations et transitions' : 'Disables all visual animations & transitions'}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.reduceMotion}
                  onClick={() => {
                    soundFx.playClick(settings.reduceMotion ? 500 : 750);
                    updateSetting('reduceMotion', !settings.reduceMotion);
                  }}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer border ${
                    settings.reduceMotion
                      ? 'bg-emerald-600 border-emerald-400'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.reduceMotion ? 'translate-x-5.5 shadow-md' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* CONTROL 4: DYSLEXIA FONT */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-slate-200 font-bold">
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span>{isFr ? 'Police DYS (OpenDyslexic)' : 'Dyslexia Friendly Font'}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {isFr ? 'Lettres pondérées pour faciliter le déchiffrage' : 'Enhanced letter weighting & legibility'}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.dyslexiaFont}
                  onClick={() => {
                    soundFx.playClick(settings.dyslexiaFont ? 500 : 750);
                    updateSetting('dyslexiaFont', !settings.dyslexiaFont);
                  }}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer border ${
                    settings.dyslexiaFont
                      ? 'bg-sky-600 border-sky-400'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.dyslexiaFont ? 'translate-x-5.5 shadow-md' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* CONTROL 5: ENHANCED FOCUS RINGS FOR KEYBOARD */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-slate-200 font-bold">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>{isFr ? 'Indicateurs de Focus Renforcés' : 'Enhanced Focus Indicators'}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {isFr ? 'Contours dorés ultra-visibles lors de la navigation au clavier' : 'Bright 3.5px gold outlines on active focused elements'}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.focusRings}
                  onClick={() => {
                    soundFx.playClick(settings.focusRings ? 500 : 750);
                    updateSetting('focusRings', !settings.focusRings);
                  }}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer border ${
                    settings.focusRings
                      ? 'bg-amber-600 border-amber-400'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.focusRings ? 'translate-x-5.5 shadow-md' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* CONTROL 6: READING RULER */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-slate-200 font-bold">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span>{isFr ? 'Guide de Lecture / Règle' : 'Reading Guide / Ruler'}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {isFr ? 'Ligne de surbrillance dorée suivant le curseur' : 'Highlight band following pointer to reduce tracking fatigue'}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.readingRuler}
                  onClick={() => {
                    soundFx.playClick(settings.readingRuler ? 500 : 750);
                    updateSetting('readingRuler', !settings.readingRuler);
                  }}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer border ${
                    settings.readingRuler
                      ? 'bg-purple-600 border-purple-400'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.readingRuler ? 'translate-x-5.5 shadow-md' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* CONTROL 7: LINE SPACING */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-bold">{isFr ? 'Espacement des Lignes' : 'Line Spacing'}</span>
                  <span className="text-[10px] font-mono text-indigo-300">
                    {settings.lineSpacing === 'normal' && (isFr ? 'Standard' : 'Standard')}
                    {settings.lineSpacing === 'relaxed' && (isFr ? 'Aéré (+25%)' : 'Relaxed (+25%)')}
                    {settings.lineSpacing === 'expanded' && (isFr ? 'Très Aéré (+50%)' : 'Expanded (+50%)')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {(['normal', 'relaxed', 'expanded'] as AdaLineSpacing[]).map((sp) => (
                    <button
                      key={sp}
                      onClick={() => {
                        soundFx.playClick(650);
                        updateSetting('lineSpacing', sp);
                      }}
                      className={`py-1.5 px-2 rounded-xl text-center font-bold text-[11px] transition-all cursor-pointer border ${
                        settings.lineSpacing === sp
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {sp === 'normal' ? '1.5x' : sp === 'relaxed' ? '1.8x' : '2.1x'}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
              {onOpenAccessibilityStatement ? (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAccessibilityStatement();
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isFr ? 'Déclaration ADA & RGPD' : 'Full ADA Statement'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-[11px] text-slate-500 font-mono">
                  Degree Unlocker Lite ADA v2.6
                </span>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors cursor-pointer text-xs"
              >
                {isFr ? 'Fermer' : 'Close'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccessibilityMenuToggle;
