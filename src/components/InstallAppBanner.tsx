import React, { useState } from 'react';
import { AppLanguage } from '../types';
import { Download, X } from 'lucide-react';
import { DegreeUnlockerCapLogo } from './DegreeUnlockerCapLogo';

interface InstallAppBannerProps {
  deferredPrompt: any;
  lang: AppLanguage;
  onInstallSuccess: () => void;
  onDismiss: () => void;
}

export const InstallAppBanner: React.FC<InstallAppBannerProps> = ({
  deferredPrompt,
  lang,
  onInstallSuccess,
  onDismiss,
}) => {
  const [isInstalling, setIsInstalling] = useState(false);

  if (!deferredPrompt) return null;

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onInstallSuccess();
      }
    } catch (err) {
      console.error('Error triggering PWA install prompt:', err);
    } finally {
      setIsInstalling(false);
      onDismiss();
    }
  };

  const isFr = lang === 'fr';

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-700/80 text-white rounded-2xl shadow-2xl p-4 sm:p-4.5 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 backdrop-blur-md">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 bg-slate-950 rounded-xl flex items-center justify-center shrink-0 shadow-inner border border-amber-400/40 p-1">
          <DegreeUnlockerCapLogo size="sm" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-white tracking-tight truncate flex items-center gap-1.5">
            Degree Unlocker
            <span className="text-[10px] uppercase tracking-wider font-extrabold bg-indigo-500/40 text-indigo-200 px-1.5 py-0.5 rounded-md border border-indigo-400/30">
              PWA
            </span>
          </h4>
          <p className="text-xs text-indigo-200/90 truncate">
            {isFr
              ? "Installer pour un accès hors-ligne rapide sur PC & Mobile"
              : "Install for fast offline access on PC & Mobile"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isFr ? 'Installer' : 'Install'}</span>
        </button>
        <button
          onClick={onDismiss}
          className="p-1.5 text-indigo-300 hover:text-white hover:bg-indigo-800/60 rounded-lg transition-colors cursor-pointer"
          title={isFr ? 'Fermer' : 'Dismiss'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
