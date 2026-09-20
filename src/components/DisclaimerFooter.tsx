import React, { useId } from 'react';
import {
  Sparkles,
  Heart,
  Mail,
  ShieldCheck,
  Accessibility,
  FileText,
  AlertCircle,
  UserCheck,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { AppLanguage } from '../types';

interface DisclaimerFooterProps {
  lang?: AppLanguage;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenAccessibility?: () => void;
  className?: string;
}

export const DisclaimerFooter: React.FC<DisclaimerFooterProps> = ({
  lang = 'fr',
  onOpenPrivacy,
  onOpenTerms,
  onOpenAccessibility,
  className = '',
}) => {
  const baseId = useId();
  const isFr = lang === 'fr';

  return (
    <footer
      id={`${baseId}-disclaimer-footer`}
      aria-label={isFr ? 'Avis légal et clause de transparence' : 'Legal notice and disclaimer'}
      className={`mt-12 pt-8 pb-10 border-t border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 text-xs ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Main Notice Box */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/5 via-indigo-500/5 to-slate-500/5 dark:from-amber-950/20 dark:via-indigo-950/20 dark:to-slate-900/40 border border-amber-500/20 dark:border-amber-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <span>{isFr ? 'Notice Légale & Développement Continu' : 'Legal Notice & Continuous Development'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 font-bold text-[10px] uppercase tracking-wider border border-amber-500/30">
                    {isFr ? 'Petite Équipe' : 'Small Team'}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isFr
                    ? 'Projet éducatif indépendant optimisé quotidiennement'
                    : 'Independent educational project continuously optimized'}
                </p>
              </div>
            </div>

            {/* Direct contact badge */}
            <a
              id={`${baseId}-feedback-contact-btn`}
              href="mailto:degreeunlocker.devteam@yahoo.com?subject=Degree%20Unlocker%20-%20Retour%20ou%20Suggestion"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-sm shadow-amber-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
              title={isFr ? 'Envoyer un retour ou demander une assistance' : 'Send feedback or request help'}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{isFr ? 'Écrire à l\'équipe' : 'Contact Team'}</span>
            </a>
          </div>

          {/* Legal Disclaimer text */}
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 leading-relaxed text-[11px] sm:text-xs space-y-2">
            <p>
              {isFr ? (
                <>
                  <strong>Degré Unlocker</strong> est propulsé par une <strong>petite équipe indépendante et passionnée</strong> dédiée à la réussite scolaire et universitaire. L’application fait l’objet de déploiements et d’améliorations au jour le jour. Bien que nous mettions tout en œuvre pour offrir une expérience fluide, des ajustements mineurs peuvent survenir selon vos navigateurs ou configurations matérielles.
                </>
              ) : (
                <>
                  <strong>Degree Unlocker</strong> is built by a <strong>small, passionate independent team</strong> committed to academic learning. The platform undergoes continuous day-to-day enhancements. While we strive for absolute reliability, minor imperfections may occasionally arise across varied browser and hardware environments.
                </>
              )}
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              {isFr ? (
                <>
                  💬 <strong>Vos retours sont notre priorité absolue :</strong> Si vous rencontrez la moindre difficulté, un bug, ou si vous avez une idée d’amélioration, écrivez-nous sans hésiter à{' '}
                  <a href="mailto:degreeunlocker.devteam@yahoo.com" className="font-mono font-bold text-amber-600 dark:text-amber-400 underline hover:text-amber-500">
                    degreeunlocker.devteam@yahoo.com
                  </a>
                  . Chaque message est lu et traité directement par les concepteurs.
                </>
              ) : (
                <>
                  💬 <strong>User Feedback is highly encouraged:</strong> Should you encounter any issue, accessibility barrier, or feature idea, please contact us at{' '}
                  <a href="mailto:degreeunlocker.devteam@yahoo.com" className="font-mono font-bold text-amber-600 dark:text-amber-400 underline hover:text-amber-500">
                    degreeunlocker.devteam@yahoo.com
                  </a>
                  . We read and prioritize every student submission.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Links & Sub-Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span>&copy; {new Date().getFullYear()} Degree Unlocker.</span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isFr ? '100% Stockage Local Privé' : '100% Private Local Storage'}</span>
            </span>
          </div>

          {/* Quick Action Navigation buttons */}
          <div className="flex items-center gap-3 flex-wrap justify-center font-medium">
            {onOpenAccessibility && (
              <button
                type="button"
                onClick={onOpenAccessibility}
                className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Accessibility className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isFr ? 'Accessibilité ADA' : 'ADA Accessibility'}</span>
              </button>
            )}

            {onOpenPrivacy && (
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isFr ? 'Confidentialité & RGPD' : 'Privacy & GDPR'}</span>
              </button>
            )}

            {onOpenTerms && (
              <button
                type="button"
                onClick={onOpenTerms}
                className="hover:text-amber-600 dark:hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>{isFr ? 'Conditions & Transparence' : 'Terms & Team'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DisclaimerFooter;
