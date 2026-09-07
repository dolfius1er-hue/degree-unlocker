import React, { useState, useEffect } from 'react';
import { WifiOff, Database, ShieldCheck } from 'lucide-react';
import { AppLanguage } from '../types';

interface OfflineIndicatorProps {
  lang: AppLanguage;
  isUsingOfflineDB?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  lang,
  isUsingOfflineDB = false,
}) => {
  const isFr = lang === 'fr';
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !isUsingOfflineDB) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/95 border border-amber-500/40 text-white shadow-2xl shadow-amber-950/40 backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-300">
      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
        {!isOnline ? <WifiOff className="w-4 h-4 animate-pulse" /> : <Database className="w-4 h-4 text-indigo-400" />}
      </div>
      <div className="text-xs space-y-0.5">
        <div className="font-bold text-amber-300 flex items-center gap-1.5">
          <span>{!isOnline ? (isFr ? 'Mode Hors Ligne' : 'Offline Mode') : (isFr ? 'Base IndexedDB Locale' : 'IndexedDB Cache')}</span>
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        </div>
        <p className="text-[11px] text-slate-300 leading-tight">
          {isFr
            ? 'Vos documents sont sécurisés localement dans IndexedDB.'
            : 'Your documents are safely stored in IndexedDB.'}
        </p>
      </div>
    </div>
  );
};
