import React, { useState, useEffect, ReactNode } from 'react';
import { motion } from 'motion/react';
import { appWindow } from '@tauri-apps/api/window';
import { 
  Minus, 
  Square, 
  Copy, 
  X, 
  Monitor, 
  Maximize2, 
  Sparkles, 
  Check, 
  Laptop,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  MousePointer,
  Download,
  Share2,
  CheckCheck,
  Volume2,
  VolumeX
} from 'lucide-react';
import { 
  isTauri, 
  minimizeWindow, 
  toggleMaximizeWindow, 
  closeWindow, 
  isWindowMaximized 
} from '../utils/tauri';
import { AppLanguage, AppTheme } from '../types';
import { DesktopContextualCursor } from './DesktopContextualCursor';
import { soundFx } from '../utils/soundEffects';

interface DesktopLayoutWrapperProps {
  children: ReactNode;
  lang?: AppLanguage;
  activeTheme?: AppTheme;
}

export const DesktopLayoutWrapper: React.FC<DesktopLayoutWrapperProps> = ({
  children,
  lang = 'fr',
  activeTheme = 'light'
}) => {
  const [isLargeViewport, setIsLargeViewport] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  const [isTauriEnv, setIsTauriEnv] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isMinimizedState, setIsMinimizedState] = useState<boolean>(false);
  const [isForceWindowed, setIsForceWindowed] = useState<boolean>(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleShareLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.warn('Clipboard write failed', e);
    }
  };

  // PC Hardcore Onyx Mode (darker, denser, strict academic workstation style)
  const [isHardcoreOnyx, setIsHardcoreOnyx] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('degreelocker_pc_hardcore');
      if (saved !== null) return saved === 'true';
      return true; // Default to true for the requested hardcore PC experience
    } catch {
      return true;
    }
  });

  const [isFxEnabled, setIsFxEnabled] = useState<boolean>(() => soundFx.isEnabled());

  const toggleHardcoreOnyx = () => {
    setIsHardcoreOnyx(prev => {
      const next = !prev;
      if (next) {
        soundFx.playLockIn();
      } else {
        soundFx.playSwitch();
      }
      try {
        localStorage.setItem('degreelocker_pc_hardcore', String(next));
      } catch {}
      return next;
    });
  };

  // Check Tauri environment & viewport resize listener
  useEffect(() => {
    const tauriDetected = isTauri();
    setIsTauriEnv(tauriDetected);

    const checkWindowStatus = async () => {
      if (tauriDetected) {
        const max = await isWindowMaximized();
        setIsMaximized(max);
      }
    };
    checkWindowStatus();

    const handleResize = () => {
      const isLarge = window.innerWidth >= 1024;
      setIsLargeViewport(isLarge);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers for Window Controls
  const handleMinimize = async () => {
    if (isTauriEnv) {
      await minimizeWindow();
    } else {
      // In web preview: toggle simulated minimized state
      setIsMinimizedState(true);
    }
  };

  const handleToggleMaximize = async () => {
    if (isTauriEnv) {
      await toggleMaximizeWindow();
      const max = await isWindowMaximized();
      setIsMaximized(max);
    } else {
      // In web preview: toggle maximized vs windowed mode
      setIsMaximized(prev => !prev);
      setIsForceWindowed(prev => !prev);
    }
  };

  const handleClose = async () => {
    if (isTauriEnv) {
      await closeWindow();
    } else {
      // In web preview: show exit confirmation
      setShowCloseConfirm(true);
    }
  };

  // Drag handler using @tauri-apps/api/window handle appWindow.startDragging()
  const handleTitlebarMouseDown = async (e: React.MouseEvent<HTMLElement>) => {
    // Only primary left click triggers window dragging
    if (e.button !== 0) return;

    // Do not initiate drag if user clicked an interactive control (buttons, toggles, inputs)
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, a, input, select, textarea, [role="button"], [data-no-drag]')) {
      return;
    }

    if (isTauriEnv) {
      try {
        await appWindow.startDragging();
      } catch (err) {
        console.warn('[DesktopLayoutWrapper] Drag error via appWindow:', err);
      }
    }
  };

  const handleTitlebarDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, a, input, select, textarea, [role="button"], [data-no-drag]')) {
      return;
    }
    handleToggleMaximize();
  };

  const isDark = activeTheme === 'dark' || activeTheme === 'midnight';

  // If minimized in simulated web mode
  if (isMinimizedState) {
    return (
      <div className={`min-h-screen w-full flex items-center justify-center p-6 ${
        isDark ? 'bg-slate-950 text-white' : 'bg-slate-900 text-slate-100'
      }`}>
        <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-2xl space-y-4 text-center animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center border border-indigo-500/30">
            <Monitor className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">DegreeUnlocker Desktop</h3>
            <p className="text-xs text-slate-400">
              {lang === 'fr' 
                ? "L'application est minimisée dans la barre des tâches." 
                : "The application is minimized to the taskbar."}
            </p>
          </div>
          <button
            id="btn-restore-desktop-window"
            onClick={() => setIsMinimizedState(false)}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
            <span>{lang === 'fr' ? "Agrandir / Restaurer la fenêtre" : "Restore Window"}</span>
          </button>
        </div>
      </div>
    );
  }

  // Small viewport / mobile: render normal children without desktop window wrapper
  if (!isLargeViewport) {
    return <>{children}</>;
  }

  // Large Viewport Desktop Mode:
  // Apply 'win11-window' styling when in desktop mode and not edge-to-edge maximized
  const shouldApplyWindowFrame = isForceWindowed || (!isMaximized && isTauriEnv);

  return (
    <div 
      className={`min-h-screen w-full transition-colors duration-200 ${
        shouldApplyWindowFrame 
          ? (isDark ? 'bg-slate-950/95 p-3 sm:p-5 flex flex-col items-center justify-center' : 'bg-slate-200/80 p-3 sm:p-5 flex flex-col items-center justify-center')
          : 'flex flex-col'
      }`}
    >
      {/* Desktop Application Frame with Windows 11 Styling */}
      <div 
        className={`w-full flex flex-col transition-all duration-200 overflow-hidden ${
          shouldApplyWindowFrame 
            ? 'win11-window max-w-[1560px] h-[95vh] bg-white dark:bg-slate-950 relative shadow-2xl border'
            : 'h-screen'
        }`}
      >
        {/* Top Desktop Window Titlebar (Windows 11 Fluent Style with data-tauri-drag-region) */}
        <div 
          data-tauri-drag-region
          onMouseDown={handleTitlebarMouseDown}
          onDoubleClick={handleTitlebarDoubleClick}
          className={`h-10 px-3 flex items-center justify-between border-b select-none shrink-0 text-xs font-medium z-30 transition-all cursor-default ${
            isHardcoreOnyx
              ? 'bg-black/85 backdrop-blur-xl border-amber-500/20 text-slate-100 shadow-md pc-hardcore-onyx-entry'
              : isDark 
                ? 'bg-slate-900/90 backdrop-blur-md border-slate-800/80 text-slate-300' 
                : 'bg-slate-100/90 backdrop-blur-md border-slate-200 text-slate-700'
          }`}
        >
          {/* Left Titlebar: App Identity & Status */}
          <div data-tauri-drag-region className="flex items-center gap-2.5 truncate pointer-events-none">
            {/* Custom App Icon with subtle Fluent glow */}
            <div className="w-5 h-5 rounded-md bg-linear-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white text-[10px] font-black shadow-xs shrink-0 ring-1 ring-white/20">
              U
            </div>
            
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-xs tracking-tight truncate text-slate-800 dark:text-slate-100">
                DegreeUnlocker
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal hidden lg:inline">
                — {lang === 'fr' ? 'Plateforme Universitaire & Études' : 'Academic Study & Research'}
              </span>
            </div>

            {/* Environment Badge */}
            <span className={`hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
              isTauriEnv 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
            }`}>
              <Laptop className="w-3 h-3" />
              <span>{isTauriEnv ? 'Tauri Desktop' : 'Windows 11 Fluent'}</span>
            </span>
          </div>

          {/* Right Titlebar: Custom Windows 11 Window Controls & Integrated Action Group */}
          <div className="flex items-center h-full gap-1">
            {/* Contextual Action Group Pill (Fluent Segmented Container) */}
            <div className="flex items-center gap-1 bg-slate-200/50 dark:bg-slate-800/50 p-0.5 rounded-lg border border-slate-300/40 dark:border-slate-700/50">
              {/* Mode PC Hardcore Onyx Toggle */}
              <button
                id="btn-hardcore-onyx-toggle"
                onClick={toggleHardcoreOnyx}
                className={`h-7 px-2.5 flex items-center gap-1.5 text-[11px] font-bold transition-all rounded-md cursor-pointer ${
                  isHardcoreOnyx
                    ? 'bg-black text-amber-400 shadow-xs border border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
                }`}
                title={lang === 'fr' ? 'Activer/Désactiver le Hardcore mode DegreeUnlocker (Interface sombre, dense et curseur réactif)' : 'Toggle Hardcore mode DegreeUnlocker'}
              >
                <Zap className={`w-3.5 h-3.5 ${isHardcoreOnyx ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">{isHardcoreOnyx ? 'Hardcore mode DegreeUnlocker' : 'Normal mode DegreeUnlocker'}</span>
              </button>

              {/* Sound FX Audio Toggle */}
              <button
                id="btn-desktop-sound-fx-toggle"
                onClick={() => {
                  const next = soundFx.toggleSound();
                  setIsFxEnabled(next);
                  if (next) soundFx.playChime();
                }}
                className={`h-7 px-2 flex items-center gap-1 text-[11px] transition-all rounded-md cursor-pointer ${
                  isFxEnabled
                    ? 'text-amber-400 hover:bg-amber-400/10'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/10'
                }`}
                title={lang === 'fr' ? (isFxEnabled ? 'Sons tactiles & Audio activés' : 'Sons désactivés') : (isFxEnabled ? 'Tactile Audio FX ON' : 'Audio FX OFF')}
              >
                {isFxEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span className="hidden xl:inline text-[10px] font-mono">{isFxEnabled ? 'FX' : 'MUTED'}</span>
              </button>

              {/* Window Frame Mode Toggle for previewers */}
              <button
                id="btn-desktop-frame-toggle"
                onClick={() => setIsForceWindowed(prev => !prev)}
                className={`h-7 px-2.5 flex items-center gap-1.5 text-[11px] transition-all rounded-md cursor-pointer ${
                  shouldApplyWindowFrame 
                    ? 'bg-white dark:bg-slate-700/80 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
                }`}
                title={shouldApplyWindowFrame 
                  ? (lang === 'fr' ? 'Passer en plein écran' : 'Switch to edge-to-edge')
                  : (lang === 'fr' ? 'Cadre fenêtre Windows 11' : 'Windows 11 window frame')}
              >
                <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden xl:inline">{shouldApplyWindowFrame ? 'Fenêtré' : 'Plein écran'}</span>
              </button>

              {/* Micro Divider */}
              <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700/80 mx-0.5" />

              {/* Download as PDF Button (Fluent Aesthetic with Entrance Animation & Micro-Interactions) */}
              <motion.button
                id="btn-win-download-pdf"
                onClick={handleDownloadPDF}
                initial={{ opacity: 0, scale: 0.92, y: -2 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="h-7.5 px-3 py-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-white/90 dark:hover:bg-slate-700/90 border border-transparent hover:border-slate-300/50 dark:hover:border-slate-600/50 transition-all rounded-md cursor-pointer group shadow-2xs"
                title={lang === 'fr' ? 'Télécharger / Imprimer la vue en PDF (Ctrl+P)' : 'Download / Print as PDF (Ctrl+P)'}
                aria-label={lang === 'fr' ? 'Télécharger ou imprimer la page actuelle au format PDF' : 'Download or print the current page as PDF'}
              >
                <Download className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400 group-hover:translate-y-0.5 transition-transform" />
                <span className="hidden md:inline tracking-tight">{lang === 'fr' ? 'Export PDF' : 'Export PDF'}</span>
              </motion.button>

              {/* Share / Copy Link Button (Fluent Aesthetic with Entrance Animation & Active State) */}
              <motion.button
                id="btn-win-share-link"
                onClick={handleShareLink}
                initial={{ opacity: 0, scale: 0.92, y: -2 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className={`h-7.5 px-3 py-1 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all rounded-md cursor-pointer shadow-2xs border ${
                  copiedLink
                    ? 'bg-emerald-500 text-white font-bold border-emerald-400 animate-pulse'
                    : 'text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-white/90 dark:hover:bg-slate-700/90 border-transparent hover:border-slate-300/50 dark:hover:border-slate-600/50'
                }`}
                title={lang === 'fr' ? 'Copier le lien pour partager la page ou la note' : 'Copy link to share page or note'}
                aria-label={lang === 'fr' ? (copiedLink ? 'Lien de partage copié dans le presse-papier' : 'Copier le lien de partage pour cette page ou note') : (copiedLink ? 'Shareable link copied to clipboard' : 'Copy shareable link for this page or note')}
              >
                {copiedLink ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 shrink-0 text-white" />
                    <span className="tracking-tight">{lang === 'fr' ? 'Lien Copié !' : 'Link Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 shrink-0 text-amber-500 dark:text-amber-400" />
                    <span className="hidden md:inline tracking-tight">{lang === 'fr' ? 'Partager' : 'Share'}</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Standard Windows 11 Window Controls (Rendered ONLY inside native Tauri Desktop executable) */}
            {isTauriEnv && (
              <>
                <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
                <div className="flex items-center h-full -mr-3">
                  {/* 1. Minimize Button */}
                  <button
                    id="btn-win-minimize"
                    onClick={handleMinimize}
                    className="h-10 w-11 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title={lang === 'fr' ? 'Réduire' : 'Minimize'}
                    aria-label="Minimize Window"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  {/* 2. Maximize / Restore Button */}
                  <button
                    id="btn-win-maximize"
                    onClick={handleToggleMaximize}
                    className="h-10 w-11 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title={isMaximized ? (lang === 'fr' ? 'Restaurer' : 'Restore') : (lang === 'fr' ? 'Agrandir' : 'Maximize')}
                    aria-label="Maximize Window"
                  >
                    {isMaximized ? (
                      <Copy className="w-3.5 h-3.5 rotate-180" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* 3. Close Button (Authentic Windows 11 Red on hover) */}
                  <button
                    id="btn-win-close"
                    onClick={handleClose}
                    className="h-10 w-11 flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#e81123] transition-colors cursor-pointer rounded-tr-2xl"
                    title={lang === 'fr' ? 'Fermer' : 'Close'}
                    aria-label="Close Window"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Desktop Contextual Reactive Cursor (PC Hardcore) */}
        <DesktopContextualCursor enabled={isHardcoreOnyx} />

        {/* Inner Content Area */}
        <div className={`flex-1 flex flex-col min-h-0 overflow-hidden relative transition-colors duration-200 ${
          isHardcoreOnyx ? 'pc-hardcore-onyx bg-[#020617] text-slate-100' : ''
        }`}>
          {children}
        </div>
      </div>

      {/* Close Confirmation Modal for Web Preview */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {lang === 'fr' ? 'Quitter DegreeUnlocker' : 'Quit DegreeUnlocker'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'fr' ? 'Contrôle fenêtre bureau' : 'Desktop window control'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isTauriEnv 
                ? (lang === 'fr' ? 'Voulez-vous fermer la fenêtre native de l’application ?' : 'Do you want to close the desktop application window?')
                : (lang === 'fr' ? 'Dans l’exécutable Tauri Desktop, cette action ferme la fenêtre native. En aperçu web, vous pouvez minimiser ou continuer.' : 'In the Tauri Desktop executable, this closes the native window.')}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {lang === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  setShowCloseConfirm(false);
                  setIsMinimizedState(true);
                }}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {lang === 'fr' ? 'Minimiser l’app' : 'Minimize App'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
