import React, { useState } from 'react';
import { AppLanguage } from '../types';
import { DegreeUnlockerCapLogo } from './DegreeUnlockerCapLogo';
import { 
  X, 
  Monitor, 
  Smartphone, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Share2, 
  MoreVertical, 
  Wifi, 
  Zap, 
  Laptop,
  ShieldCheck,
  AppWindow,
  Globe
} from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  deferredPrompt: any;
  onInstallSuccess: () => void;
  isPwaInstalled?: boolean;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
  deferredPrompt,
  onInstallSuccess,
  isPwaInstalled = false,
}) => {
  const isFr = lang === 'fr';

  // Platform tab for PWA mode (PC / Android / iOS)
  const [activePlatform, setActivePlatform] = useState<'pc' | 'android' | 'ios'>(() => {
    if (typeof window === 'undefined') return 'pc';
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'android';
    if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
    return 'pc';
  });

  const [isTriggeringInstall, setIsTriggeringInstall] = useState(false);

  if (!isOpen) return null;

  const handleDirectPwaInstall = async () => {
    if (!deferredPrompt) return;
    setIsTriggeringInstall(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onInstallSuccess();
        onClose();
      }
    } catch (err) {
      console.error('PWA install prompt error:', err);
    } finally {
      setIsTriggeringInstall(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 flex min-h-full items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/30 text-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-black/40 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/40 shrink-0 text-white">
              <AppWindow className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                {isFr ? "Installer DegreeUnlocker" : "Install DegreeUnlocker"}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase font-black">
                  PWA Officielle
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-indigo-200/80">
                {isFr ? "Application certifiée sans aucun blocage • PC, Mac, Android & iOS" : "Certified web application • PC, Mac, Android & iOS"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer shrink-0"
            title={isFr ? "Fermer" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 scrollbar-thin max-h-[75vh]">
          
          {/* Direct 1-Click Banner if Deferred Prompt Available */}
          {deferredPrompt && !isPwaInstalled && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/25 via-indigo-600/30 to-purple-900/40 border border-amber-400/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-amber-200">
                    {isFr ? "Installation Directe Prête !" : "Direct 1-Click Install Ready!"}
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    {isFr ? "Votre navigateur prend en charge l'installation directe en 1 clic." : "Your browser supports instant 1-click installation."}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDirectPwaInstall}
                disabled={isTriggeringInstall}
                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95 disabled:opacity-50 border border-amber-300"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{isFr ? "INSTALLER EN 1 CLIC" : "INSTALL IN 1 CLICK"}</span>
              </button>
            </div>
          )}

          {/* Key Advantages Checklist */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isFr ? "Avantages de l'application installée (PWA) :" : "Benefits of installed app (PWA):"}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{isFr ? "Zéro blocage Google ou antivirus" : "Zero antivirus or browser warnings"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{isFr ? "Fenêtre indépendante (sans barre web)" : "Standalone window (no URL bar)"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{isFr ? "Icône sur le Bureau & Menu Démarrer" : "Desktop & Start menu icon"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{isFr ? "Mode hors-ligne & accès instantané" : "Offline mode & instant cache"}</span>
              </div>
            </div>
          </div>

          {/* Platform Switcher Tabs */}
          <div className="flex items-center p-1 bg-black/50 rounded-xl border border-white/10">
            <button
              onClick={() => setActivePlatform('pc')}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePlatform === 'pc'
                  ? 'bg-indigo-600 text-white shadow-md border border-indigo-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-amber-300" />
              <span>{isFr ? "PC / Mac" : "PC / Mac"}</span>
            </button>
            <button
              onClick={() => setActivePlatform('android')}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePlatform === 'android'
                  ? 'bg-indigo-600 text-white shadow-md border border-indigo-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Android</span>
            </button>
            <button
              onClick={() => setActivePlatform('ios')}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePlatform === 'ios'
                  ? 'bg-indigo-600 text-white shadow-md border border-indigo-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-rose-400" />
              <span>iOS (iPhone/iPad)</span>
            </button>
          </div>

          {/* Guide for PC Windows & Mac */}
          {activePlatform === 'pc' && (
            <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-4 animate-in fade-in duration-150">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-amber-300" />
                <span>{isFr ? "Guide d'installation PC Windows & Mac (Chrome / Edge)" : "Desktop Installation (Chrome / Edge)"}</span>
              </h4>
              <ol className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-indigo-500/30 text-indigo-200 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-400/30">1</span>
                  <div>
                    <span className="font-semibold text-white">{isFr ? "Dans la barre d'adresse :" : "In your address bar:"}</span>{" "}
                    {isFr ? "Cliquez sur l'icône d'installation " : "Look for the install icon "}
                    <span className="inline-flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded border border-white/20 text-white font-mono text-[10px]">
                      <Download className="w-3 h-3 text-amber-300" /> {isFr ? "Installer" : "Install"}
                    </span> {isFr ? "qui apparaît tout à droite de la barre d'URL." : "at the right of the URL bar."}
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-indigo-500/30 text-indigo-200 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-400/30">2</span>
                  <div>
                    <span className="font-semibold text-white">{isFr ? "Ou via le Menu (3 points) :" : "Or via the 3-dots Menu:"}</span>{" "}
                    {isFr ? "Cliquez sur les 3 points en haut à droite > " : "Click the 3 dots at top right > "}
                    <span className="inline-flex items-center gap-1 bg-indigo-600/40 px-1.5 py-0.5 rounded border border-indigo-400/40 font-bold text-white text-[11px]">
                      {isFr ? "« Enregistrer et partager » > « Installer DegreeUnlocker »" : "« Cast, save, share » > « Install DegreeUnlocker »"}
                    </span>.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-indigo-500/30 text-indigo-200 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-400/30">3</span>
                  <div>
                    <span className="font-semibold text-white">{isFr ? "Résultat instantané :" : "Instant result:"}</span>{" "}
                    {isFr ? "DegreeUnlocker s'ouvre dans sa propre fenêtre sans barre d'adresse et place son icône sur votre Bureau." : "DegreeUnlocker opens in a dedicated window and places its icon on your Desktop."}
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* Guide for Android */}
          {activePlatform === 'android' && (
            <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-4 animate-in fade-in duration-150">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>{isFr ? "Guide pour Smartphone Android (Chrome)" : "Android Installation (Chrome)"}</span>
              </h4>
              <ol className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/30 text-emerald-200 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-400/30">1</span>
                  <div>
                    <span className="font-semibold text-white">{isFr ? "Menu Chrome :" : "Chrome Menu:"}</span>{" "}
                    {isFr ? "Appuyez sur les 3 points verticaux en haut à droite." : "Tap the 3 vertical dots at top right."}
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/30 text-emerald-200 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-400/30">2</span>
                  <div>
                    <span className="font-semibold text-white">{isFr ? "Sélectionnez :" : "Select:"}</span>{" "}
                    <span className="inline-flex items-center gap-1 bg-emerald-500/30 px-1.5 py-0.5 rounded border border-emerald-400/40 font-bold text-white text-[11px]">
                      {isFr ? "« Installer l'application » ou « Ajouter à l'écran d'accueil »" : "« Install app » or « Add to Home screen »"}
                    </span>.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/30 text-emerald-200 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-400/30">3</span>
                  <div>
                    <span className="font-semibold text-white">{isFr ? "Validation :" : "Confirmation:"}</span>{" "}
                    {isFr ? "Confirmez l'installation. L'icône DegreeUnlocker apparaît parmi vos applications Android." : "Confirm install. The DegreeUnlocker app icon is added to your app drawer."}
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* Guide for iOS */}
          {activePlatform === 'ios' && (
            <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-4 animate-in fade-in duration-150">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-rose-400" />
                <span>{isFr ? "Guide pour iPhone & iPad (Safari)" : "iOS Installation (Safari)"}</span>
              </h4>
              <ol className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-rose-500/30 text-rose-200 font-bold flex items-center justify-center text-xs shrink-0 border border-rose-400/30">1</span>
                  <div>
                    <span className="font-semibold text-white">{isFr ? "Bouton Partager :" : "Share Button:"}</span>{" "}
                    {isFr ? "Dans Safari, appuyez sur l'icône Partager " : "In Safari, tap the Share icon "}
                    <span className="inline-flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/20 text-white font-mono text-[10px]">
                      <Share2 className="w-3 h-3 text-rose-400" /> {isFr ? "Partager" : "Share"}
                    </span> {isFr ? "au bas de l'écran." : "at the bottom bar."}
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-rose-500/30 text-rose-200 font-bold flex items-center justify-center text-xs shrink-0 border border-rose-400/30">2</span>
                  <div>
                    <span className="font-semibold text-white">{isFr ? "Faites défiler :" : "Scroll down:"}</span>{" "}
                    {isFr ? "Appuyez sur " : "Tap "}
                    <span className="inline-flex items-center gap-1 bg-rose-500/30 px-1.5 py-0.5 rounded border border-rose-400/40 font-bold text-white text-[11px]">
                      {isFr ? "« Sur l'écran d'accueil »" : "« Add to Home Screen »"}
                    </span>.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-rose-500/30 text-rose-200 font-bold flex items-center justify-center text-xs shrink-0 border border-rose-400/30">3</span>
                  <div>
                    <span className="font-semibold text-white">{isFr ? "Appuyez sur Ajouter :" : "Tap Add:"}</span>{" "}
                    {isFr ? "L'application DegreeUnlocker s'affiche sur votre écran d'accueil comme une application native iOS." : "DegreeUnlocker is now on your home screen and launches full screen."}
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* Future roadmap note */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
            <Globe className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-indigo-300">
                {isFr ? "Prochaine étape (Portail & Version PC dédiée) :" : "Roadmap (Dedicated PC Portal & Installer):"}
              </span>{" "}
              {isFr
                ? "La version exécutable installable avec son propre site dédié et installateur PC autonome est prévue dans l'écosystème global. En attendant, cette installation PWA vous offre dès maintenant le confort d'une vraie application de bureau sécurisée."
                : "A standalone executable version with dedicated download portal is planned for the ecosystem. Meanwhile, this certified PWA delivers the full standalone desktop experience."}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isFr ? "100% Sécurisé & Certifié" : "100% Secure & Certified"}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            {isFr ? "Fermer" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
