import React, { useState, useEffect } from 'react';
import { FAMOUS_QUOTES, FamousQuote } from '../data/famousQuotes';
import { STUDY_TIPS, StudyTip } from '../data/studyPlaylists';
import { AppLanguage } from '../types';
import { 
  Sparkles, 
  Loader2, 
  ChevronRight, 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  Quote, 
  Atom, 
  ShieldAlert, 
  Landmark, 
  ScrollText, 
  Skull, 
  BookOpen,
  Clock,
  Lightbulb,
  Headphones,
  Music
} from 'lucide-react';

interface QuoteLoadingModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  lang?: AppLanguage;
  onOpenPlaylists?: () => void;
}

export const QuoteLoadingModal: React.FC<QuoteLoadingModalProps> = ({
  isOpen,
  title,
  subtitle,
  lang = 'fr',
  onOpenPlaylists,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [progress, setProgress] = useState(15);
  const [secondsLeft, setSecondsLeft] = useState(60); // Exact 60 seconds rotation requirement

  // Rotate quotes every 60 seconds with live countdown
  useEffect(() => {
    if (!isOpen) {
      setSpeaking(false);
      setSecondsLeft(60);
      return;
    }

    setSecondsLeft(60);

    const timerInterval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Switch quote every 60 seconds
          setQuoteIndex((q) => (q + 1) % FAMOUS_QUOTES.length);
          setTipIndex((t) => (t + 1) % STUDY_TIPS.length);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        return prev + Math.floor(Math.random() * 6) + 1;
      });
    }, 1200);

    return () => {
      clearInterval(timerInterval);
      clearInterval(progressInterval);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQuote: FamousQuote = FAMOUS_QUOTES[quoteIndex] || FAMOUS_QUOTES[0];
  const currentTip: StudyTip = STUDY_TIPS[tipIndex] || STUDY_TIPS[0];

  const handleNext = () => {
    setQuoteIndex((prev) => (prev + 1) % FAMOUS_QUOTES.length);
    setSecondsLeft(60);
  };

  const handlePrev = () => {
    setQuoteIndex((prev) => (prev - 1 + FAMOUS_QUOTES.length) % FAMOUS_QUOTES.length);
    setSecondsLeft(60);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }
      window.speechSynthesis.cancel();
      const textToSpeak = `${lang === 'fr' ? currentQuote.quoteFr : currentQuote.quote}. Par ${currentQuote.author}.`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
      utterance.rate = 0.95;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const getCategoryIcon = (category: FamousQuote['category']) => {
    switch (category) {
      case 'science_cosmos': return Atom;
      case 'war_speeches': return ShieldAlert;
      case 'philosophy': return Landmark;
      case 'historic_declarations': return ScrollText;
      case 'famous_deaths': return Skull;
      case 'literature_wisdom': return BookOpen;
    }
  };

  const CategoryIcon = getCategoryIcon(currentQuote.category);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-12 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 text-white overflow-hidden space-y-5">
        
        {/* Ambient light glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        {/* Loading header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shadow-inner">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {title || (lang === 'fr' ? 'Traitement IA & Ingestion en cours...' : 'AI Processing & Ingestion...')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {subtitle || (lang === 'fr' ? 'Extraction approfondie & calcul des fiches de révision' : 'Deep academic extraction and cognitive synthesis')}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs font-mono font-bold text-indigo-400 px-2.5 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/60">
              {progress}%
            </span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-linear-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Quote Card Display with 60-Second Indicator */}
        <div className="relative bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-inner">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-semibold">
              <CategoryIcon className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Citation & Discours Historique' : 'Historical Wisdom & Speech'}</span>
            </div>
            
            {/* 60s rotation countdown badge */}
            <div className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-950/50 border border-amber-800/60 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3 text-amber-400 animate-spin" />
              <span>{lang === 'fr' ? `Suivante dans ${secondsLeft}s` : `Next in ${secondsLeft}s`}</span>
            </div>
          </div>

          {/* Quote Body */}
          <blockquote className="text-sm sm:text-base font-serif italic text-slate-200 leading-relaxed">
            &ldquo;{lang === 'fr' ? currentQuote.quoteFr : currentQuote.quote}&rdquo;
          </blockquote>

          {/* Author info & TTS */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-white">{currentQuote.author}</h4>
              <p className="text-[11px] text-slate-400">{currentQuote.role} • {currentQuote.year}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSpeak}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title={lang === 'fr' ? 'Écouter la voix' : 'Listen with TTS'}
              >
                {speaking ? <VolumeX className="w-4 h-4 text-rose-400 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Context footnote */}
          <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
            <span className="text-slate-300 font-semibold">{lang === 'fr' ? 'Contexte : ' : 'Context: '}</span>
            {lang === 'fr' ? currentQuote.contextFr : currentQuote.context}
          </div>
        </div>

        {/* Temporary Distraction Tip / Playlist Bar */}
        <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-indigo-200 truncate">
                {lang === 'fr' ? 'Astuce Révision :' : 'Study Tip:'} {lang === 'fr' ? currentTip.titleFr : currentTip.title}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {lang === 'fr' ? currentTip.tipFr : currentTip.tip}
              </div>
            </div>
          </div>

          {onOpenPlaylists && (
            <button
              onClick={onOpenPlaylists}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors shadow-xs"
            >
              <Headphones className="w-3 h-3" />
              <span>{lang === 'fr' ? 'Musique' : 'Music'}</span>
            </button>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span className="font-mono text-[10px]">
            #{quoteIndex + 1} / {FAMOUS_QUOTES.length} citations
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={lang === 'fr' ? 'Citation précédente' : 'Previous Quote'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={lang === 'fr' ? 'Citation suivante' : 'Next Quote'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
