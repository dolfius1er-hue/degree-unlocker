import React, { useState, useEffect, ReactNode } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { 
  isTauri, 
  minimizeWindow, 
  toggleMaximizeWindow, 
  closeWindow, 
  isWindowMaximized 
} from '../utils/tauri';
import { AppLanguage, AppTheme } from '../types';

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
          className={`h-9 px-3.5 flex items-center justify-between border-b select-none shrink-0 text-xs font-medium z-30 transition-colors cursor-default ${
            isDark 
              ? 'bg-slate-900/95 border-slate-800/80 text-slate-300' 
              : 'bg-slate-100/90 border-slate-200 text-slate-700'
          }`}
        >
          {/* Left Titlebar: App Identity & Status */}
          <div data-tauri-drag-region className="flex items-center gap-2.5 truncate pointer-events-none">
            {/* Custom App Icon */}
            <div className="w-4 h-4 rounded-md bg-linear-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-[10px] font-black shadow-2xs shrink-0">
              U
            </div>
            
            <span className="font-semibold text-xs tracking-tight truncate text-slate-800 dark:text-slate-200">
              DegreeUnlocker — {lang === 'fr' ? 'Plateforme Universitaire & Études' : 'Academic Study & Research'}
            </span>

            {/* Environment Badge */}
            <span className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              isTauriEnv 
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
            }`}>
              <Laptop className="w-3 h-3" />
              <span>{isTauriEnv ? 'Tauri 1.5 Desktop' : 'Windows 11 Desktop UI'}</span>
            </span>
          </div>

          {/* Right Titlebar: Custom Windows 11 Window Controls */}
          <div className="flex items-center h-full">
            {/* Window Frame Mode Toggle for previewers */}
            <button
              id="btn-desktop-frame-toggle"
              onClick={() => setIsForceWindowed(prev => !prev)}
              className={`h-full px-2.5 flex items-center gap-1 text-[11px] transition-colors rounded-sm cursor-pointer ${
                shouldApplyWindowFrame 
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title={shouldApplyWindowFrame 
                ? (lang === 'fr' ? 'Passer en plein écran' : 'Switch to edge-to-edge')
                : (lang === 'fr' ? 'Cadre fenêtre Windows 11' : 'Windows 11 window frame')}
            >
              <Monitor className="w-3 h-3" />
              <span className="hidden xl:inline">{shouldApplyWindowFrame ? 'Fenêtré' : 'Plein écran'}</span>
            </button>

            {/* Separator */}
            <div className="w-[1px] h-3.5 bg-slate-300 dark:bg-slate-700 mx-1" />

            {/* 1. Minimize Button */}
            <button
              id="btn-win-minimize"
              onClick={handleMinimize}
              className="h-full w-10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={lang === 'fr' ? 'Réduire' : 'Minimize'}
              aria-label="Minimize Window"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* 2. Maximize / Restore Button */}
            <button
              id="btn-win-maximize"
              onClick={handleToggleMaximize}
              className="h-full w-10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isMaximized ? (lang === 'fr' ? 'Restaurer' : 'Restore') : (lang === 'fr' ? 'Agrandir' : 'Maximize')}
              aria-label="Maximize Window"
            >
              {isMaximized ? (
                <Copy className="w-3 h-3 rotate-180" />
              ) : (
                <Square className="w-3 h-3" />
              )}
            </button>

            {/* 3. Close Button (Classic Windows Red on hover) */}
            <button
              id="btn-win-close"
              onClick={handleClose}
              className="h-full w-11 flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
              title={lang === 'fr' ? 'Fermer' : 'Close'}
              aria-label="Close Window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inner Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
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
