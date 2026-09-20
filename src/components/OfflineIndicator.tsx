import React, { useState, useEffect } from 'react';
import { WifiOff, Database } from 'lucide-react';
import { AppLanguage } from '../types';

interface OfflineIndicatorProps {
  lang: AppLanguage;
  isUsingOfflineDB?: boolean;
  onOpenSyncManager?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  lang,
  isUsingOfflineDB = false,
  onOpenSyncManager
}) => {
  const isFr = lang === 'fr';
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setDismissed(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // When online, do not show persistent notifications or badges
  if (isOnline || dismissed) return null;

  return (
    <div 
      className="fixed bottom-20 sm:bottom-6 left-4 z-50 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-slate-900/95 border border-amber-500/50 text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-300"
      title={isFr ? "Mode Hors-Ligne actif" : "Offline mode active"}
    >
      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
        <WifiOff className="w-4 h-4" />
      </div>
      <div className="text-xs space-y-0.5">
        <div className="font-bold text-amber-300 flex items-center gap-1.5">
          <span>{isFr ? 'Mode Hors Ligne' : 'Offline Mode'}</span>
        </div>
        <p className="text-[10px] text-slate-300 leading-tight">
          {isFr
            ? 'Données sauvegardées en local sur votre appareil'
            : 'Data saved locally on your device'}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setDismissed(true);
        }}
        className="ml-2 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 text-xs transition-colors cursor-pointer"
        title={isFr ? 'Fermer la notification' : 'Dismiss notification'}
      >
        ✕
      </button>
    </div>
  );
};

