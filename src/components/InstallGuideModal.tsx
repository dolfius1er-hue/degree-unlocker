import React, { useState } from 'react';
import { AppLanguage } from '../types';
import { isTauri } from '../lib/tauri-bridge';
import { 
  X, 
  Monitor, 
  Smartphone, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Share2, 
  MoreVertical, 
  Wifi, 
  Zap, 
  Laptop,
  Terminal,
  Cpu,
  ShieldCheck,
  FolderDown,
  ArrowRight,
  ExternalLink,
  Layers,
  BookOpen
} from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  deferredPrompt: any;
  onInstallSuccess: () => void;
  isPwaInstalled?: boolean;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
  deferredPrompt,
  onInstallSuccess,
  isPwaInstalled = false,
}) => {
  const isFr = lang === 'fr';

  // Primary mode selection: 'pwa' (Web Browser PWA) or 'native_pc' (Local Native Tauri Desktop App)
  const [installMode, setInstallMode] = useState<'pwa' | 'native_pc'>('native_pc');

  // Platform tab for PWA mode
  const [activePlatform, setActivePlatform] = useState<'pc' | 'android' | 'ios'>(() => {
    if (typeof window === 'undefined') return 'pc';
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'android';
    if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
    return 'pc';
  });

  const [isTriggeringInstall, setIsTriggeringInstall] = useState(false);
  const [copiedCliCommand, setCopiedCliCommand] = useState(false);
  const [isDownloadingApp, setIsDownloadingApp] = useState(false);

  if (!isOpen) return null;

  const handleDirectPwaInstall = async () => {
    if (!deferredPrompt) return;
    setIsTriggeringInstall(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onInstallSuccess();
        onClose();
      }
    } catch (err) {
      console.error('PWA install prompt error:', err);
    } finally {
      setIsTriggeringInstall(false);
    }
  };

  const handleCopyCli = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCliCommand(true);
    setTimeout(() => setCopiedCliCommand(false), 2000);
  };

  const handleDownloadWindowsBatLauncher = () => {
    setIsDownloadingApp(true);
    try {
      const origin = window.location.origin;
      const batContent = `@echo off
title DegreeUnlocker Desktop Launcher
echo ========================================================
echo   DegreeUnlocker - Lancement de l'Application PC
echo ========================================================
echo.
echo Ouverture en mode fenetre autonome dediee...
echo.

REM Verifier Edge puis Chrome pour lancer en mode Application autonome (sans barre d'adresse)
if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app="${origin}" --window-size=1280,800
    exit
)
if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" --app="${origin}" --window-size=1280,800
    exit
)
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="${origin}" --window-size=1280,800
    exit
)
if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" --app="${origin}" --window-size=1280,800
    exit
)
if exist "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" --app="${origin}" --window-size=1280,800
    exit
)

REM Fallback vers le navigateur par defaut
start "" "${origin}"
exit
`;
      const blob = new Blob([batContent], { type: 'application/x-bat' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DegreeUnlocker-Windows-Launcher.bat';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('BAT download error:', e);
    } finally {
      setTimeout(() => setIsDownloadingApp(false), 1200);
    }
  };

  const handleDownloadStandaloneDesktopPackage = () => {
    setIsDownloadingApp(true);
    try {
      // Create a bundled quick-launcher html and instructions for instant local zero-install PC execution
      const launcherHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DegreeUnlocker - Lanceur Application PC Direct</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1.5rem; box-sizing: border-box; }
    .card { background: linear-gradient(180deg, #111827 0%, #0f172a 100%); padding: 2.5rem; border-radius: 1.5rem; max-width: 520px; text-align: center; border: 1px solid rgba(245, 158, 11, 0.4); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); }
    .badge { display: inline-block; background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); font-size: 0.75rem; font-weight: 800; padding: 0.25rem 0.75rem; border-radius: 9999px; text-transform: uppercase; margin-bottom: 1rem; }
    h1 { color: #f8fafc; font-size: 1.75rem; margin: 0 0 0.5rem 0; font-weight: 900; }
    p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin: 0.75rem 0; }
    .actions { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.5rem; }
    .btn-primary { display: block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #0f172a; padding: 0.85rem 1.5rem; border-radius: 0.85rem; text-decoration: none; font-weight: 900; font-size: 1rem; transition: transform 0.15s ease, filter 0.15s ease; box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3); }
    .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .footer { margin-top: 1.5rem; font-size: 0.75rem; color: #64748b; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Application Scolaire & Universitaire</div>
    <h1>DegreeUnlocker Direct</h1>
    <p>Lanceur Bureau Dédié pour PC (Windows, macOS, Linux). Accédez instantanément à vos documents, fiches, manuels scolaires et moteur de synthèse.</p>
    <div class="actions">
      <a href="${window.location.origin}" class="btn-primary">🚀 Ouvrir DegreeUnlocker</a>
    </div>
    <div class="footer">DegreeUnlocker • Conçu par Dolfius 1er • Micro-version PC</div>
  </div>
</body>
</html>`;
      const blob = new Blob([launcherHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DegreeUnlocker-PC-Launcher.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Launcher download error:', e);
    } finally {
      setTimeout(() => setIsDownloadingApp(false), 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/30 text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-black/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40 shrink-0 text-slate-950">
              <Download className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                {isFr ? "Installer DegreeUnlocker" : "Install DegreeUnlocker"}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase font-black">
                  PC & Mobile
                </span>
              </h3>
              <p className="text-xs text-indigo-200/80">
                {isFr ? "Choisissez votre format d'installation selon votre usage" : "Select your preferred installation channel"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer shrink-0"
            title={isFr ? "Fermer" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Dual Option Switcher (Web PWA vs Native PC App) */}
        <div className="px-5 sm:px-6 pt-5">
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-black/40 rounded-2xl border border-white/10">
            
            {/* OPTION 1: NATIVE DIRECT PC (Tauri / Local Bundle) */}
            <button
              onClick={() => setInstallMode('native_pc')}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center relative ${
                installMode === 'native_pc'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg border border-amber-300'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 stroke-[2.5]" />
                <span>{isFr ? "Application PC Directe" : "Native PC App"}</span>
              </div>
              <span className={`text-[10px] font-medium ${installMode === 'native_pc' ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                {isFr ? "Micro-version locale autonome (Tauri / Bureau)" : "Autonomous Local Micro-App"}
              </span>
            </button>

            {/* OPTION 2: PWA WEB (Browser-based PWA) */}
            <button
              onClick={() => setInstallMode('pwa')}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center relative ${
                installMode === 'pwa'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg border border-indigo-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-300 shrink-0 stroke-[2.5]" />
                <span>{isFr ? "Version Web en PWA" : "Web PWA Option"}</span>
              </div>
              <span className={`text-[10px] font-medium ${installMode === 'pwa' ? 'text-indigo-200' : 'text-slate-400'}`}>
                {isFr ? "Chrome, Edge, Android & iOS" : "Browser Web App"}
              </span>
            </button>

          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 scrollbar-thin flex-1">
          
          {/* ============================================================ */}
          {/* MODE 1: NATIVE DIRECT PC (Tauri / Local Micro App) */}
          {/* ============================================================ */}
          {installMode === 'native_pc' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Highlight Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-900/30 to-black/40 border border-amber-400/40 space-y-3 shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-amber-200">
                        {isFr ? "Micro-Version PC Autonome Directe" : "Autonomous Local Desktop App"}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        {isFr
                          ? "Version allégée optimisée pour le travail intensif : connexion Internet directe automatique, manuels scolaires intégrés et suppression totale des bruits parasites."
                          : "Lightweight version optimized for deep focus: direct internet sync, bundled textbooks, and clean academic workspace."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features Pill Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{isFr ? "Connexion Internet directe intégrée" : "Direct internet connectivity"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{isFr ? "Bibliothèque de manuels scolaires" : "Bundled school books library"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{isFr ? "Zéro distraction vidéo ou bruit blanc" : "Clean zero-distraction layout"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{isFr ? "Accès direct au système de fichiers (PDF/Word)" : "Native filesystem dialogs"}</span>
                  </div>
                </div>
              </div>

              {/* Action: Direct PC Launchers Download Options */}
              <div className="space-y-3">
                {/* 1. Windows Dedicated Window Launcher (.BAT) */}
                <div className="p-4 rounded-2xl bg-black/40 border border-amber-400/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300 shrink-0 border border-amber-400/30">
                      <Laptop className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-amber-200 flex items-center gap-2">
                        {isFr ? "1. Lanceur Windows Direct (.bat)" : "1. Windows Direct Launcher (.bat)"}
                        <span className="text-[10px] px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black rounded uppercase">Recommandé PC</span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        {isFr ? "Double-cliquez pour ouvrir DegreeUnlocker dans sa propre fenêtre isolée (sans barre d'adresse ni onglets)." : "Double-click to open DegreeUnlocker in a dedicated frameless standalone app window."}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadWindowsBatLauncher}
                    disabled={isDownloadingApp}
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>{isFr ? (isDownloadingApp ? "GÉNÉRATION..." : "TÉLÉCHARGER .BAT (WINDOWS)") : (isDownloadingApp ? "GENERATING..." : "DOWNLOAD .BAT (WINDOWS)")}</span>
                  </button>
                </div>

                {/* 2. Universal Desktop Shortcut (.HTML) */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0 border border-indigo-400/30">
                      <FolderDown className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {isFr ? "2. Lanceur Universel Bureau (.html)" : "2. Universal Desktop Shortcut (.html)"}
                        <span className="text-[10px] px-1.5 py-0.2 bg-indigo-500/30 text-indigo-200 font-bold rounded uppercase ml-2">Mac / Linux / PC</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {isFr ? "Fichier de raccourci léger à poser sur votre bureau pour lancer l'application en 1 clic." : "Universal launcher file to drop on your desktop for 1-click startup."}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadStandaloneDesktopPackage}
                    disabled={isDownloadingApp}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition-all shadow-sm border border-indigo-400/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isFr ? "TÉLÉCHARGER .HTML" : "DOWNLOAD .HTML"}</span>
                  </button>
                </div>
              </div>

              {/* Developer / Tauri Native Binary Build Command */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <Terminal className="w-4 h-4 text-amber-300" />
                    <span>{isFr ? "Pour compiler l'exécutable natif .exe / .msi (Tauri Rust CLI) :" : "To compile native .exe / .msi binary (Tauri Rust CLI) :"}</span>
                  </div>
                  <button
                    onClick={() => handleCopyCli("npm run tauri:build")}
                    className="px-2 py-1 rounded-lg bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 hover:text-white text-[10px] font-mono font-bold transition-colors cursor-pointer"
                  >
                    {copiedCliCommand ? (isFr ? "Copié !" : "Copied!") : (isFr ? "Copier commande" : "Copy command")}
                  </button>
                </div>
                
                <div className="p-3 rounded-xl bg-black/60 font-mono text-xs text-amber-300 border border-white/5 flex items-center justify-between overflow-x-auto">
                  <code>npm run tauri:build</code>
                  <span className="text-[10px] text-slate-500 font-sans ml-2">Windows .exe / Mac .app / Linux .deb</span>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* MODE 2: PWA WEB (Browser-based PWA) */}
          {/* ============================================================ */}
          {installMode === 'pwa' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Direct 1-Click Banner if Deferred Prompt Available */}
              {deferredPrompt && !isPwaInstalled && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-indigo-600/30 to-indigo-900/40 border border-amber-400/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="w-7 h-7 text-amber-300 shrink-0 animate-bounce" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-200">
                        {isFr ? "Installation Directe Disponible en 1 Clic !" : "Direct 1-Click Install Ready!"}
                      </h4>
                      <p className="text-xs text-slate-300">
                        {isFr ? "Cliquez sur le bouton ci-contre pour l'ajouter à votre bureau immédiatement." : "Click the button to immediately add Degree Unlocker to your PC / Mobile."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDirectPwaInstall}
                    disabled={isTriggeringInstall}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>{isFr ? "INSTALLER MAINTENANT" : "INSTALL NOW"}</span>
                  </button>
                </div>
              )}

              {/* Platform Switcher Tabs */}
              <div className="flex items-center p-1 bg-black/40 rounded-2xl border border-white/10">
                <button
                  onClick={() => setActivePlatform('pc')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activePlatform === 'pc'
                      ? 'bg-indigo-600 text-white shadow-md border border-indigo-400/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Monitor className="w-4 h-4 text-amber-300" />
                  <span>PC / Bureau (PWA)</span>
                </button>
                <button
                  onClick={() => setActivePlatform('android')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activePlatform === 'android'
                      ? 'bg-indigo-600 text-white shadow-md border border-indigo-400/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Android</span>
                </button>
                <button
                  onClick={() => setActivePlatform('ios')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activePlatform === 'ios'
                      ? 'bg-indigo-600 text-white shadow-md border border-indigo-400/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-rose-400" />
                  <span>iOS (iPhone/iPad)</span>
                </button>
              </div>

              {/* Step by step for PC PWA */}
              {activePlatform === 'pc' && (
                <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-amber-300" />
                    {isFr ? "Guide PWA pour Navigateur PC & Mac (Chrome / Edge)" : "PWA Desktop Guide (Chrome / Edge)"}
                  </h4>
                  <ol className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/30 text-indigo-200 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-400/30">1</span>
                      <div>
                        <span className="font-semibold text-white">{isFr ? "Menu Navigateur :" : "Browser Menu:"}</span>{" "}
                        {isFr ? "Cliquez sur les 3 points verticaux en haut à droite de Chrome ou Edge." : "Click the 3 dots at the top right of Chrome or Edge."}
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/30 text-indigo-200 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-400/30">2</span>
                      <div>
                        <span className="font-semibold text-white">{isFr ? "Option d'installation :" : "Install Option:"}</span>{" "}
                        {isFr ? "Sélectionnez " : "Select "}
                        <span className="inline-flex items-center gap-1 bg-indigo-600/40 px-2 py-0.5 rounded border border-indigo-400/40 font-bold text-white">
                          <Download className="w-3 h-3 text-amber-300" />
                          {isFr ? "'Installer Degree Unlocker...'" : "'Install Degree Unlocker...'"}
                        </span>.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/30 text-indigo-200 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-400/30">3</span>
                      <div>
                        <span className="font-semibold text-white">{isFr ? "Raccourci Bureau :" : "Desktop Shortcut:"}</span>{" "}
                        {isFr ? "L'icône s'affiche sur votre bureau avec fenêtre dédiée indépendante." : "An application icon is added to your desktop with standalone window support."}
                      </div>
                    </li>
                  </ol>
                </div>
              )}

              {/* Step by step for Android */}
              {activePlatform === 'android' && (
                <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    {isFr ? "Guide pour Smartphone Android (Chrome)" : "Android Guide (Chrome)"}
                  </h4>
                  <ol className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/30 text-emerald-200 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-400/30">1</span>
                      <div>
                        <span className="font-semibold text-white">{isFr ? "Menu Chrome :" : "Chrome Menu:"}</span>{" "}
                        {isFr ? "Appuyez sur les 3 points en haut à droite." : "Tap the 3 vertical dots at the top right."}
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/30 text-emerald-200 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-400/30">2</span>
                      <div>
                        <span className="font-semibold text-white">{isFr ? "Installer :" : "Install:"}</span>{" "}
                        {isFr ? "Sélectionnez 'Installer l'application' ou 'Ajouter à l'écran d'accueil'." : "Select 'Install app' or 'Add to Home screen'."}
                      </div>
                    </li>
                  </ol>
                </div>
              )}

              {/* Step by step for iOS */}
              {activePlatform === 'ios' && (
                <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-rose-400" />
                    {isFr ? "Guide pour iPhone & iPad (Safari)" : "iOS Guide (Safari)"}
                  </h4>
                  <ol className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-rose-500/30 text-rose-200 font-bold flex items-center justify-center text-xs shrink-0 border border-rose-400/30">1</span>
                      <div>
                        <span className="font-semibold text-white">{isFr ? "Bouton Partager :" : "Share Button:"}</span>{" "}
                        {isFr ? "Dans Safari, appuyez sur l'icône de partage " : "In Safari, tap the Share icon "}
                        <span className="inline-flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/20 text-white font-mono">
                          <Share2 className="w-3 h-3 text-rose-400" /> Partager
                        </span> au bas de l'écran.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-rose-500/30 text-rose-200 font-bold flex items-center justify-center text-xs shrink-0 border border-rose-400/30">2</span>
                      <div>
                        <span className="font-semibold text-white">{isFr ? "Écran d'accueil :" : "Home Screen:"}</span>{" "}
                        {isFr ? "Faites défiler vers le bas et appuyez sur 'Sur l'écran d'accueil'." : "Scroll down and tap 'Add to Home Screen'."}
                      </div>
                    </li>
                  </ol>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isFr ? "Certifié Sécurisé & Hors-Ligne" : "Secure & Offline Certified"}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            {isFr ? "J'ai Compris / Continuer" : "Got It / Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};
