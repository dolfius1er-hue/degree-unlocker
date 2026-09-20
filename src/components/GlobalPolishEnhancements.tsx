import React, { useState, useEffect } from 'react';
import { ArrowUp, Cookie, Sparkles, Check, X, Shield, ChevronRight } from 'lucide-react';
import { AppLanguage } from '../types';

interface GlobalPolishProps {
  lang?: AppLanguage;
}

export const GlobalPolishEnhancements: React.FC<GlobalPolishProps> = ({ lang = 'fr' }) => {
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Check cookie consent
    const consent = localStorage.getItem('degree_cookie_consent');
    if (!consent) {
      setShowCookieBanner(true);
    }

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(currentProgress);
      }
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('degree_cookie_consent', 'accepted');
    setShowCookieBanner(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = {
    fr: {
      cookieTitle: 'Respect de votre vie privée',
      cookieDesc: 'Nous utilisons uniquement des cookies de session essentiels et du stockage local sécurisé pour mémoriser vos fiches et notes. Aucun pistage publicitaire tiers.',
      accept: 'Accepter et continuer',
      privacy: 'Politique de confidentialité',
      backTop: 'Retour en haut',
      skip: 'Aller au contenu principal'
    },
    en: {
      cookieTitle: 'Privacy & Cookies',
      cookieDesc: 'We use essential session cookies and secure local storage to save your flashcards and notes. No third-party ad tracking.',
      accept: 'Accept & Continue',
      privacy: 'Privacy Policy',
      backTop: 'Back to top',
      skip: 'Skip to main content'
    },
    de: {
      cookieTitle: 'Datenschutz & Cookies',
      cookieDesc: 'Wir verwenden essenzielle Session-Cookies und lokalen Speicher für Ihre Notizen. Kein Werbe-Tracking.',
      accept: 'Akzeptieren',
      privacy: 'Datenschutz',
      backTop: 'Nach oben',
      skip: 'Zum Hauptinhalt'
    },
    es: {
      cookieTitle: 'Privacidad y Cookies',
      cookieDesc: 'Utilizamos cookies esenciales y almacenamiento local seguro para guardar tus notas. Sin rastreo publicitario.',
      accept: 'Aceptar y continuar',
      privacy: 'Política de privacidad',
      backTop: 'Volver arriba',
      skip: 'Ir al contenido principal'
    }
  }[lang] || {
    cookieTitle: 'Respect de votre vie privée',
    cookieDesc: 'Nous utilisons uniquement des cookies de session essentiels et du stockage local sécurisé pour mémoriser vos fiches et notes.',
    accept: 'Accepter',
    privacy: 'Politique de confidentialité',
    backTop: 'Retour en haut',
    skip: 'Aller au contenu principal'
  };

  return (
    <>
      {/* 1. Skip to Content (Accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[9999] bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-xl outline-none ring-4 ring-amber-300"
      >
        {t.skip}
      </a>

      {/* 2. Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-[9997] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 3. Cookie Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-[9998] bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 shadow-2xl rounded-2xl p-5 text-slate-100 animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-slate-100 mb-1 flex items-center gap-1.5">
                {t.cookieTitle}
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {t.cookieDesc}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={acceptCookies}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  {t.accept}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label={t.backTop}
          title={t.backTop}
          className="fixed bottom-6 right-6 z-[9996] w-11 h-11 rounded-2xl bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-md text-amber-400 border border-amber-500/30 shadow-2xl flex items-center justify-center hover:bg-amber-500 hover:text-slate-950 transition-all duration-200 group cursor-pointer"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}
    </>
  );
};

// Thinking Orbs Loader Component (for AI / async states)
interface ThinkingOrbsProps {
  text?: string;
  subtext?: string;
}

export const ThinkingOrbsLoader: React.FC<ThinkingOrbsProps> = ({ 
  text = 'Analyse en cours par l’IA...', 
  subtext = 'Synthèse intelligente et structuration des connaissances' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
        {/* Outer orbital ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/30 animate-spin" style={{ animationDuration: '8s' }} />
        <div className="absolute inset-2 rounded-full border border-indigo-500/20 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
        
        {/* Glowing Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-amber-400 rounded-full shadow-[0_0_15px_#f59e0b] animate-pulse" />
        <div className="absolute bottom-1 right-2 w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_15px_#6366f1] animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1 left-2 w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_#10b981] animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Center Sparkle */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
          <Sparkles className="w-4 h-4 animate-bounce" />
        </div>
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
        {text}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
        {subtext}
      </p>
    </div>
  );
};
