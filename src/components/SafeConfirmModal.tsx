import React, { useId } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';
import { AppLanguage } from '../types';

interface SafeConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  lang?: AppLanguage;
}

export const SafeConfirmModal: React.FC<SafeConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  isDestructive = true,
  onConfirm,
  onCancel,
  lang = 'fr',
}) => {
  const baseId = useId();
  const isFr = lang === 'fr';

  if (!isOpen) return null;

  return (
    <div
      id={`${baseId}-overlay`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${baseId}-title`}
      aria-describedby={`${baseId}-desc`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        id={`${baseId}-card`}
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`p-3 rounded-2xl ${
              isDestructive
                ? 'bg-rose-950/60 border border-rose-500/30 text-rose-400'
                : 'bg-amber-950/60 border border-amber-500/30 text-amber-400'
            }`}
          >
            {isDestructive ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div className="space-y-1 flex-1">
            <h3 id={`${baseId}-title`} className="text-base font-bold text-white leading-tight">
              {title}
            </h3>
            <p id={`${baseId}-desc`} className="text-xs text-slate-400 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer focus:ring-2 focus:ring-slate-500 focus:outline-none"
          >
            {cancelLabel || (isFr ? 'Annuler' : 'Cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer focus:ring-2 focus:outline-none ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500 shadow-rose-900/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-500 shadow-indigo-900/30'
            }`}
          >
            {confirmLabel || (isFr ? 'Confirmer la suppression' : 'Confirm Delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafeConfirmModal;
