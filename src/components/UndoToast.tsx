import React, { useEffect, useState } from 'react';
import { Undo2, X, CheckCircle2 } from 'lucide-react';
import { AppLanguage } from '../types';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  durationMs?: number;
  lang?: AppLanguage;
}

export const UndoToast: React.FC<UndoToastProps> = ({
  message,
  onUndo,
  onDismiss,
  durationMs = 8000,
  lang = 'fr',
}) => {
  const [progress, setProgress] = useState(100);
  const isFr = lang === 'fr';

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remainingPct);
      if (elapsed >= durationMs) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [durationMs, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl animate-in slide-in-from-bottom-5 duration-200 min-w-[300px] max-w-sm"
    >
      <div className="flex items-center justify-between p-3.5 gap-3">
        <div className="flex items-center gap-2.5 text-xs text-slate-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium truncate">{message}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onUndo}
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-xs cursor-pointer focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          >
            <Undo2 className="w-3 h-3" />
            <span>{isFr ? 'Annuler' : 'Undo'}</span>
          </button>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={isFr ? 'Fermer' : 'Dismiss'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Countdown Progress Bar */}
      <div className="w-full h-1 bg-slate-800">
        <div
          className="h-full bg-indigo-500 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default UndoToast;
