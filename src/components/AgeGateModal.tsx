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
const POLICY_VIEWED_KEY = 'degreeunlocker_policy_viewed_v1';

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
    // Also record consent to essential functional storage
    localStorage.setItem('degreeunlocker_cookie_consent_v1', 'accepted');
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
  const [hasConfirmedAge, setHasConfirmedAge] = useState<boolean>(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(false);
  const [hasViewedPolicy, setHasViewedPolicy] = useState<boolean>(() => {
    try {
      return localStorage.getItem(POLICY_VIEWED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const minimumYear = currentYear - 15; // 15 years minimum (French digital age of consent)

  useEffect(() => {
    if (birthYear) {
      const yearNum = parseInt(birthYear, 10);
      if (isNaN(yearNum) || yearNum < 1920 || yearNum > currentYear) {
        setErrorMsg(lang === 'fr' ? 'Année de naissance invalide.' : 'Invalid birth year.');
      } else if (yearNum > minimumYear) {
        setErrorMsg(
          lang === 'fr'
            ? `Conformément au RGPD et à la majorité numérique (loi n° 2018-493), l'utilisation autonome requiert 15 ans minimum (nés en ${minimumYear} ou avant), ou l'accord d'un représentant légal.`
            : `Under GDPR and French digital age laws, independent use requires 15+ years of age (born in ${minimumYear} or earlier), or parental consent.`
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
  const canSubmit = isValidAge && hasConfirmedAge && hasAcceptedTerms && hasViewedPolicy;

  const markPolicyOpened = () => {
    setHasViewedPolicy(true);
    try {
      localStorage.setItem(POLICY_VIEWED_KEY, 'true');
    } catch (e) {}
  };

  const handleOpenPolicyInternal = (e: React.MouseEvent) => {
    markPolicyOpened();
    onOpenPrivacyPolicy();
  };

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
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5"
      >
        {/* Header Icon & Disclaimer */}
        <div className="flex flex-col items-center text-center space-y-2.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 p-2">
            <DegreeUnlockerCapLogo size="lg" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-1.5 border border-indigo-200/60 dark:border-indigo-800/60">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{lang === 'fr' ? 'Majorité numérique & RGPD (15 ans)' : 'Digital Age & GDPR (15+)'}</span>
            </div>
            <h2 id="agegate-title" className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {lang === 'fr' ? 'Degree Unlocker Lite' : 'Degree Unlocker Lite'}
            </h2>
            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              {lang === 'fr' 
                ? 'Assistant méthodologique de révision scolaire & universitaire' 
                : 'Academic revision & study flashcards workspace'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              {lang === 'fr'
                ? 'Outil privé d’entraînement et de fiches de cours. Cette application ne délivre aucun diplôme officiel ni certification académique.'
                : 'Study tool for revision and practice. Does not issue any official diplomas or academic certifications.'}
            </p>
          </div>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="birthYearInput" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'fr' ? 'Votre année de naissance (15 ans minimum requis)' : 'Your birth year (15+ required)'}
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
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white text-sm focus:outline-none transition-all ${
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

          {/* RGPD Link Opener Reminder */}
          <div className={`p-3 rounded-xl border transition-all text-xs ${
            hasViewedPolicy
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
          }`}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                {hasViewedPolicy
                  ? (lang === 'fr' ? 'Charte de confidentialité consultée' : 'Privacy policy consulted')
                  : (lang === 'fr' ? 'Consultation obligatoire de la charte :' : 'Mandatory policy consultation:')}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={markPolicyOpened}
                  className="inline-flex items-center gap-1 font-bold underline hover:opacity-80 text-indigo-600 dark:text-indigo-400"
                >
                  <span>{lang === 'fr' ? 'Ouvrir /privacy' : 'Open /privacy'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-slate-400">ou</span>
                <button
                  type="button"
                  onClick={handleOpenPolicyInternal}
                  className="font-bold underline hover:opacity-80 text-indigo-600 dark:text-indigo-400 cursor-pointer"
                >
                  {lang === 'fr' ? 'Lire ici' : 'Read here'}
                </button>
              </div>
            </div>
          </div>

          {/* Distinct Checkboxes */}
          <div className="space-y-2.5">
            {/* Checkbox 1: Age verification */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasConfirmedAge}
                  onChange={(e) => setHasConfirmedAge(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                  {lang === 'fr' ? (
                    <>
                      J'atteste avoir <strong>au moins 15 ans</strong> (majorité numérique en France) ou utiliser cette station d'étude avec l'accord de mes parents / tuteurs légaux.
                    </>
                  ) : (
                    <>
                      I certify that I am <strong>at least 15 years old</strong> or using this study app with the consent of my legal guardians.
                    </>
                  )}
                </span>
              </label>
            </div>

            {/* Checkbox 2: Terms and Privacy Acceptance */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasAcceptedTerms}
                  onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                  {lang === 'fr' ? (
                    <>
                      J'ai pris connaissance et j'accepte la <strong>Charte de Confidentialité (RGPD)</strong> et les <strong>Conditions Générales d'Utilisation</strong>.
                    </>
                  ) : (
                    <>
                      I have read and agree to the <strong>Privacy Policy (GDPR)</strong> and the <strong>Terms of Service</strong>.
                    </>
                  )}
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              canSubmit
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-[0.98]'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>
              {!hasViewedPolicy
                ? (lang === 'fr' ? 'Ouvrez la charte ci-dessus pour débloquer' : 'Open policy above to unlock')
                : !isValidAge
                ? (lang === 'fr' ? 'Renseignez une année valide (15 ans)' : 'Enter valid birth year (15+)')
                : !hasConfirmedAge || !hasAcceptedTerms
                ? (lang === 'fr' ? 'Cochez les deux déclarations ci-dessus' : 'Check both boxes above')
                : (lang === 'fr' ? 'Accéder à mes révisions' : 'Access My Study Space')}
            </span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </form>

        {/* Footer Security Badge */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Stockage 100% local par défaut &bull; Aucune revente de données scolaires</span>
          </p>
        </div>
      </div>
    </div>
  );
};
