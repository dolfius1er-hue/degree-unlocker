import React, { useId } from 'react';
import {
  Accessibility,
  X,
  CheckCircle2,
  Keyboard,
  Contrast,
  Eye,
  Volume2,
  ExternalLink,
  Mail
} from 'lucide-react';
import { AppLanguage } from '../types';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: AppLanguage;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  onClose,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id={`${baseId}-container`}
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Accessibility className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h3 id={`${baseId}-title`} className="font-extrabold text-base text-white flex items-center gap-2">
                <span>{isFr ? 'Accessibilité & Normes ADA' : 'Accessibility & ADA Standards'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  WCAG 2.1 AA
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isFr ? 'Engagement d\'inclusion et d\'ergonomie universelle' : 'Commitment to inclusive & universal ergonomics'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            aria-label={isFr ? 'Fermer' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-300 text-xs sm:text-sm space-y-4 leading-relaxed">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isFr ? 'Principales fonctionnalités intégrées' : 'Core Accessibility Features'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <Keyboard className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>{isFr ? 'Navigation complète au clavier (Tab, Espace, Entrée)' : 'Full keyboard navigation (Tab, Space, Enter)'}</span>
              </div>
              <div className="flex items-start gap-2">
                <Contrast className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{isFr ? 'Contraste élevé certifié (> 4.5:1 ratio)' : 'High contrast certified (> 4.5:1 ratio)'}</span>
              </div>
              <div className="flex items-start gap-2">
                <Eye className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{isFr ? 'Balisage ARIA et compatibilité lecteurs d\'écran' : 'ARIA landmarks & screen reader compatibility'}</span>
              </div>
              <div className="flex items-start gap-2">
                <Volume2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>{isFr ? 'Synthèse vocale (Text-to-Speech) pour les cours' : 'Text-to-Speech audio study engine'}</span>
              </div>
              <div className="flex items-start gap-2 sm:col-span-2 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                <Accessibility className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {isFr 
                    ? 'Menu flottant d\'accessibilité rapide (raccourci Alt+A) : agrandissement texte jusqu\'à 145%, contrastes élevés WCAG AAA, police DYS, règle de lecture et réduction de mouvement persistants.'
                    : 'Persistent floating ADA quick-menu (shortcut Alt+A): text scaling up to 145%, WCAG AAA high contrast, dyslexia font, reading ruler, and motion reduction.'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2 text-xs text-indigo-200">
            <p className="font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              <span>{isFr ? 'Besoin d\'un aménagement spécifique RGAA / WCAG ?' : 'Need custom accessibility assistance?'}</span>
            </p>
            <p>
              {isFr
                ? 'Contactez notre référent accessibilité à degreeunlocker.devteam@yahoo.com (DPO : dolfius1er@gmail.com) pour tout aménagement.'
                : 'Contact our accessibility officer at degreeunlocker.devteam@yahoo.com (DPO: dolfius1er@gmail.com) for any required adaptation.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <a
            href="/accessibility"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline inline-flex items-center gap-1"
          >
            <span>{isFr ? 'Voir la page complète' : 'View full statement'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer shadow-xs"
          >
            {isFr ? 'Compris' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityModal;
