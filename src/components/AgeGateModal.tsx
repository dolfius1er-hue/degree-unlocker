import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Lock, ArrowRight, ExternalLink } from 'lucide-react';
import { AppLanguage } from '../types';
import { DegreeUnlockerCapLogo } from './DegreeUnlockerCapLogo';

interface AgeGateModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onOpenPrivacyPolicy: () => void;
  lang?: AppLanguage;
}

const AGE_GATE_STORAGE_KEY = 'degreeunlocker_age_verified_v1';

export function isAgeGateVerified(): boolean {
  try {
    return localStorage.getItem(AGE_GATE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAgeGateVerified(): void {
  try {
    localStorage.setItem(AGE_GATE_STORAGE_KEY, 'true');
    localStorage.setItem('degreeunlocker_age_verified_timestamp', new Date().toISOString());
  } catch (e) {
    console.error('Failed to save age verification:', e);
  }
}

export const AgeGateModal: React.FC<AgeGateModalProps> = ({
  isOpen,
  onConfirm,
  onOpenPrivacyPolicy,
  lang = 'fr',
}) => {
  const [birthYear, setBirthYear] = useState<string>('');
  const [hasConfirmedCheckbox, setHasConfirmedCheckbox] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const minimumYear = currentYear - 15; // 15 years minimum

  useEffect(() => {
    if (birthYear) {
      const yearNum = parseInt(birthYear, 10);
      if (isNaN(yearNum) || yearNum < 1920 || yearNum > currentYear) {
        setErrorMsg(lang === 'fr' ? 'Année de naissance invalide.' : 'Invalid birth year.');
      } else if (yearNum > minimumYear) {
        setErrorMsg(
          lang === 'fr'
            ? `Conformément au RGPD et à la réglementation de protection des mineurs, l'utilisation autonome requiert 15 ans minimum (nés en ${minimumYear} ou avant).`
            : `Under GDPR & digital age regulations, independent access requires 15+ years of age (born in ${minimumYear} or earlier).`
        );
      } else {
        setErrorMsg(null);
      }
    } else {
      setErrorMsg(null);
    }
  }, [birthYear, currentYear, minimumYear, lang]);

  if (!isOpen) return null;

  const isValidAge = birthYear && !errorMsg && parseInt(birthYear, 10) <= minimumYear;
  const canSubmit = isValidAge && hasConfirmedCheckbox;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setAgeGateVerified();
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="agegate-title"
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6"
      >
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 p-2">
            <DegreeUnlockerCapLogo size="lg" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2 border border-indigo-200/60 dark:border-indigo-800/60">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{lang === 'fr' ? 'Vérification de majorité numérique' : 'Digital Age Verification'}</span>
            </div>
            <h2 id="agegate-title" className="text-xl font-bold text-slate-900 dark:text-white">
              {lang === 'fr' ? 'Bienvenue sur DegreeUnlocker' : 'Welcome to DegreeUnlocker'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              {lang === 'fr'
                ? 'Conformément au RGPD et à la loi sur la protection des mineurs, veuillez confirmer votre âge (15 ans minimum).'
                : 'In accordance with GDPR and privacy regulations, please verify you are 15 years of age or older.'}
            </p>
          </div>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="birthYearInput" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'fr' ? 'Votre année de naissance' : 'Your birth year'}
            </label>
            <div className="relative">
              <input
                id="birthYearInput"
                type="number"
                min="1920"
                max={currentYear}
                placeholder={`Ex: ${minimumYear - 2}`}
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value.trim())}
                required
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white text-sm focus:outline-none transition-all ${
                  errorMsg
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : isValidAge
                    ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                }`}
              />
              {isValidAge && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              )}
            </div>

            {errorMsg && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 flex items-start gap-1 font-medium leading-normal">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          {/* RGPD & Terms Checkbox */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasConfirmedCheckbox}
                onChange={(e) => setHasConfirmedCheckbox(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                {lang === 'fr' ? (
                  <>
                    J'atteste avoir <strong>au moins 15 ans</strong> et j'accepte les{' '}
                    <button
                      type="button"
                      onClick={onOpenPrivacyPolicy}
                      className="text-indigo-600 dark:text-indigo-400 underline font-semibold hover:text-indigo-700 inline-flex items-center gap-0.5"
                    >
                      <span>CGU & Politique de Confidentialité</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    .
                  </>
                ) : (
                  <>
                    I certify that I am <strong>at least 15 years old</strong> and accept the{' '}
                    <button
                      type="button"
                      onClick={onOpenPrivacyPolicy}
                      className="text-indigo-600 dark:text-indigo-400 underline font-semibold hover:text-indigo-700 inline-flex items-center gap-0.5"
                    >
                      <span>Terms & Privacy Policy</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    .
                  </>
                )}
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              canSubmit
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-[0.98]'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{lang === 'fr' ? 'Accéder à l\'application' : 'Access Application'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </form>

        {/* Footer Security Badge */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Stockage local chiffré & respect strict de la vie privée</span>
          </p>
        </div>
      </div>
    </div>
  );
};
