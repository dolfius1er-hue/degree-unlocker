import React, { useState, useEffect } from 'react';
import { WifiOff, Database, ShieldCheck, Server, RefreshCw } from 'lucide-react';
import { AppLanguage } from '../types';
import { offlineStorageService } from '../services/offlineStorageService';

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
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = offlineStorageService.subscribeSyncStatus((status) => {
      setPendingCount(status.pendingCount + status.failedCount);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  if (isOnline && !isUsingOfflineDB && pendingCount === 0) return null;

  return (
    <div 
      onClick={onOpenSyncManager}
      className={`fixed bottom-20 sm:bottom-6 left-4 z-50 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-slate-900/95 border text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-300 ${
        onOpenSyncManager ? 'cursor-pointer hover:scale-105 active:scale-95 transition-all' : ''
      } ${
        !isOnline || pendingCount > 0 
          ? 'border-amber-500/50 shadow-amber-950/40' 
          : 'border-indigo-500/40 shadow-indigo-950/40'
      }`}
      title={isFr ? "Cliquer pour ouvrir le Gestionnaire de Synchronisation Hors-Ligne" : "Click to open Offline Sync Manager"}
    >
      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
        {!isOnline ? <WifiOff className="w-4 h-4 animate-pulse" /> : <Server className="w-4 h-4 text-indigo-400" />}
      </div>
      <div className="text-xs space-y-0.5">
        <div className="font-bold text-amber-300 flex items-center gap-1.5">
          <span>
            {!isOnline 
              ? (isFr ? 'Mode Hors Ligne' : 'Offline Mode') 
              : pendingCount > 0
              ? (isFr ? `${pendingCount} modif(s) en attente` : `${pendingCount} pending sync(s)`)
              : (isFr ? 'Base IndexedDB Sécurisée' : 'IndexedDB Cache Secured')}
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        </div>
        <p className="text-[10px] text-slate-300 leading-tight">
          {isFr
            ? 'Données sauvegardées en local • Cliquez pour gérer'
            : 'Saved in local cache • Click to manage sync'}
        </p>
      </div>
    </div>
  );
};
