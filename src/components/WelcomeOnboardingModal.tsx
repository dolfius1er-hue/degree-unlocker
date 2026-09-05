import React, { useState } from 'react';
import { AppLanguage } from '../types';
import { GraduationCap, Cloud, Smartphone, Monitor, CheckCircle2, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { loginWithGoogle } from '../lib/firebase';

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserConnected: (user: any) => void;
  lang: AppLanguage;
}

export const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({
  isOpen,
  onClose,
  onUserConnected,
  lang = 'fr',
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleConnect = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const user = await loginWithGoogle();
      onUserConnected(user);
      localStorage.setItem('degreelocker_welcomed', 'true');
      onClose();
    } catch (err: any) {
      console.error('Google login error during onboarding:', err);
      setErrorMsg(
        lang === 'fr'
          ? 'Connexion Google annulée ou impossible. Vous pouvez continuer en mode local.'
          : 'Google sign-in canceled or failed. You can continue in local mode.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkipToLocal = () => {
    localStorage.setItem('degreelocker_welcomed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-12 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl text-white p-6 sm:p-8 space-y-6">
        
        {/* Top Glow Accent */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header Icon & Title */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 border border-indigo-400/40 flex items-center justify-center shadow-lg shadow-indigo-950/50 shrink-0">
            <GraduationCap className="w-7 h-7 text-amber-300" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-1">
              <Sparkles className="w-3 h-3" />
              <span>{lang === 'fr' ? 'Bienvenue sur Degree Unlocker' : 'Welcome to Degree Unlocker'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {lang === 'fr' ? 'Votre Espace d’Étude & Révision' : 'Your Academic Study & Revision Hub'}
            </h2>
          </div>
        </div>

        {/* Body Description */}
        <div className="relative z-10 space-y-3 text-slate-300 text-sm leading-relaxed">
          <p>
            {lang === 'fr'
              ? 'Pour profiter pleinement de l’application, synchroniser vos cours entre votre ordinateur (PC) et votre smartphone, et utiliser le scanner photo de notes, connectez votre compte Google ou Microsoft OneDrive.'
              : 'To sync your revision courses between your PC and smartphone and use the notebook photo scanner, connect your Google account or OneDrive cloud storage.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {lang === 'fr' ? 'PC ⇄ Téléphone' : 'PC ⇄ Phone Sync'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {lang === 'fr' ? 'Transférez vos cours instantanément.' : 'Transfer courses instantly across devices.'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {lang === 'fr' ? 'Sauvegarde Cloud' : 'Cloud Backup'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {lang === 'fr' ? 'Conservez vos fiches en toute sécurité.' : 'Keep your revision notes secure.'}
                </p>
              </div>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-amber-300 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/50">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={handleGoogleConnect}
            disabled={loading}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Cloud className="w-4 h-4 text-amber-300" />
            <span>{lang === 'fr' ? 'Se connecter avec Google / OneDrive' : 'Connect with Google / OneDrive'}</span>
          </button>

          <button
            onClick={handleSkipToLocal}
            disabled={loading}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            {lang === 'fr' ? 'Continuer en mode local' : 'Continue in local mode'}
          </button>
        </div>

      </div>
    </div>
  );
};
