import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SchoolDocument, AppLanguage } from '../types';
import { extractSlidesFromDocument, exportSlidesDeckPdf, SlideData } from '../utils/slidePdfExport';
import { speechEngine } from '../utils/speech';
import { 
  Tv, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  FileText, 
  Sparkles, 
  Layers, 
  Bookmark, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Sliders, 
  Layout, 
  HelpCircle,
  FolderOpen
} from 'lucide-react';

interface PresentationModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: SchoolDocument[];
  initialDocument?: SchoolDocument | null;
  lang?: AppLanguage;
}

type SlideTheme = 'midnight' | 'obsidian' | 'academic' | 'warm';

export const PresentationModeModal: React.FC<PresentationModeModalProps> = ({
  isOpen,
  onClose,
  documents,
  initialDocument,
  lang = 'fr',
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(
    initialDocument?.id || (documents.length > 0 ? documents[0].id : '')
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showSlideList, setShowSlideList] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayIntervalSec, setAutoPlayIntervalSec] = useState(8);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [slideTheme, setSlideTheme] = useState<SlideTheme>('midnight');
  const [exportingPdf, setExportingPdf] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<any>(null);

  // Sync selected doc with initialDocument when opening
  useEffect(() => {
    if (initialDocument) {
      setSelectedDocId(initialDocument.id);
      setCurrentSlideIndex(0);
    } else if (documents.length > 0 && !selectedDocId) {
      setSelectedDocId(documents[0].id);
      setCurrentSlideIndex(0);
    }
  }, [initialDocument, documents, isOpen]);

  const activeDoc = useMemo(() => {
    return documents.find(d => d.id === selectedDocId) || documents[0] || null;
  }, [documents, selectedDocId]);

  const slides = useMemo(() => {
    if (!activeDoc) return [];
    return extractSlidesFromDocument(activeDoc, (lang || 'fr') as AppLanguage);
  }, [activeDoc, lang]);

  const currentSlide: SlideData | undefined = slides[currentSlideIndex] || slides[0];

  // Reset slide index when changing document
  const handleSelectDocument = (docId: string) => {
    setSelectedDocId(docId);
    setCurrentSlideIndex(0);
    speechEngine.stop();
    setIsSpeaking(false);
  };

  // Stop speech when modal closes or slide changes
  useEffect(() => {
    return () => {
      speechEngine.stop();
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, []);

  // Slide navigation
  const goToNextSlide = () => {
    speechEngine.stop();
    setIsSpeaking(false);
    setCurrentSlideIndex(prev => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  const goToPrevSlide = () => {
    speechEngine.stop();
    setIsSpeaking(false);
    setCurrentSlideIndex(prev => (prev > 0 ? prev - 1 : 0));
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        goToNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevSlide();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          handleToggleFullscreen();
        } else {
          onClose();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        handleToggleFullscreen();
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNotes(prev => !prev);
      } else if (e.key === 'Home') {
        setCurrentSlideIndex(0);
      } else if (e.key === 'End') {
        setCurrentSlideIndex(slides.length - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, slides.length, isFullscreen]);

  // Auto-play slideshow timer
  useEffect(() => {
    if (isAutoPlaying && isOpen) {
      autoPlayTimerRef.current = setInterval(() => {
        setCurrentSlideIndex(prev => {
          if (prev >= slides.length - 1) {
            setIsAutoPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, autoPlayIntervalSec * 1000);
    } else {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isAutoPlaying, isOpen, autoPlayIntervalSec, slides.length]);

  // Fullscreen API toggle
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {
        setIsFullscreen(!isFullscreen);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Speech narration
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      speechEngine.stop();
      setIsSpeaking(false);
      return;
    }

    if (!currentSlide) return;

    let textToSpeak = `${currentSlide.title}. `;
    if (currentSlide.subtitle) textToSpeak += `${currentSlide.subtitle}. `;
    if (currentSlide.bullets && currentSlide.bullets.length > 0) {
      textToSpeak += currentSlide.bullets.join('. ') + '. ';
    }
    if (currentSlide.content) {
      textToSpeak += currentSlide.content;
    }

    speechEngine.speak(textToSpeak, {
      lang: lang === 'fr' ? 'fr' : 'en',
      rate: 0.95,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // Export PDF Slide Deck
  const handleDownloadSlides = () => {
    if (!activeDoc) return;
    setExportingPdf(true);
    try {
      exportSlidesDeckPdf(activeDoc, (lang || 'fr') as AppLanguage);
    } catch (e) {
      console.error('Failed to export slides deck PDF:', e);
    } finally {
      setTimeout(() => setExportingPdf(false), 500);
    }
  };

  if (!isOpen) return null;

  // Theme Styles
  const themeClasses = {
    midnight: {
      bg: 'bg-[#0B0F19]',
      card: 'bg-[#111827] border-[#1F293D] text-slate-100 shadow-2xl',
      bulletBox: 'bg-[#161F30] border-[#25324B] text-slate-200',
      badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
      accent: 'text-indigo-400',
      navButton: 'bg-[#1E293B] hover:bg-[#334155] text-slate-200 border-[#334155]',
    },
    obsidian: {
      bg: 'bg-black',
      card: 'bg-[#0a0a0a] border-[#222222] text-slate-100 shadow-2xl',
      bulletBox: 'bg-[#141414] border-[#2a2a2a] text-slate-200',
      badge: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
      accent: 'text-sky-400',
      navButton: 'bg-[#181818] hover:bg-[#282828] text-slate-200 border-[#333]',
    },
    academic: {
      bg: 'bg-slate-100',
      card: 'bg-white border-slate-300 text-slate-900 shadow-xl',
      bulletBox: 'bg-slate-50 border-slate-200 text-slate-800',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      accent: 'text-indigo-600',
      navButton: 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs',
    },
    warm: {
      bg: 'bg-[#F4EDE0]',
      card: 'bg-[#FCF9F2] border-[#DFD5C3] text-[#292524] shadow-xl',
      bulletBox: 'bg-[#EFE8DA] border-[#D8CDBC] text-[#44403C]',
      badge: 'bg-amber-100 text-amber-900 border-amber-300/60',
      accent: 'text-amber-800',
      navButton: 'bg-[#FCF9F2] hover:bg-[#ECE3D2] text-[#44403C] border-[#DFD5C3]',
    },
  }[slideTheme];

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col ${themeClasses.bg} select-none overflow-hidden transition-colors duration-200`}
    >
      {/* Top Presentation Bar */}
      <header className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-white/10 bg-black/30 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-white">
            <Tv className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm tracking-tight hidden sm:inline">
              {lang === 'fr' ? 'Mode Présentation Diaporama' : 'Slide Deck Presentation Mode'}
            </span>
          </div>

          {/* Document Picker Dropdown */}
          <div className="relative">
            <select
              value={selectedDocId}
              onChange={(e) => handleSelectDocument(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white border border-white/15 hover:bg-white/15 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer max-w-[180px] sm:max-w-xs truncate"
            >
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id} className="bg-slate-900 text-white">
                  [{doc.subject}] {doc.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls in Top Bar */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <div className="hidden md:flex items-center gap-1 bg-white/10 p-1 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => setSlideTheme('midnight')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                slideTheme === 'midnight' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Midnight
            </button>
            <button
              onClick={() => setSlideTheme('obsidian')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                slideTheme === 'obsidian' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setSlideTheme('academic')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                slideTheme === 'academic' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Clair
            </button>
            <button
              onClick={() => setSlideTheme('warm')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                slideTheme === 'warm' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Papier
            </button>
          </div>

          {/* Download PDF Slide Deck Button */}
          <button
            onClick={handleDownloadSlides}
            disabled={exportingPdf || !activeDoc}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-indigo-400/30"
            title={lang === 'fr' ? 'Télécharger les diapositives au format PDF 16:9' : 'Download PDF Slide Deck 16:9'}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{exportingPdf ? (lang === 'fr' ? 'Export...' : 'Exporting...') : (lang === 'fr' ? 'PDF Diaporama' : 'PDF Slides')}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer"
            title={lang === 'fr' ? 'Plein écran (Touche F)' : 'Fullscreen (Key F)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Modal */}
          <button
            onClick={() => {
              speechEngine.stop();
              onClose();
            }}
            className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-100 text-xs transition-colors border border-rose-500/30 cursor-pointer"
            title={lang === 'fr' ? 'Quitter la présentation (Touche Échap)' : 'Exit presentation (Esc)'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Slide Presentation Stage */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Slide Progress bar */}
        <div className="w-full max-w-5xl h-1 bg-white/10 rounded-full mb-4 overflow-hidden shrink-0">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${((currentSlideIndex + 1) / Math.max(1, slides.length)) * 100}%` }}
          />
        </div>

        {/* 16:9 Aspect Ratio Slide Canvas */}
        <div className="w-full max-w-5xl aspect-16/9 relative rounded-2xl sm:rounded-3xl border overflow-hidden flex flex-col justify-between p-6 sm:p-10 shadow-2xl transition-all duration-300 shrink-0">
          <div className={`absolute inset-0 ${themeClasses.card} -z-10`} />

          {/* Ambient Header Bar in Slide */}
          <div className="flex items-center justify-between border-b border-current/10 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase border ${themeClasses.badge}`}>
                {currentSlide?.badge || activeDoc?.subject || 'RÉVISION'}
              </span>
              <span className="text-xs text-current/60 font-medium truncate max-w-xs sm:max-w-md">
                {activeDoc?.title}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-current/60">
              <span>{currentSlideIndex + 1} / {slides.length}</span>
            </div>
          </div>

          {/* Animated Slide Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide?.id || currentSlideIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex-1 flex flex-col justify-center py-4 space-y-4 overflow-y-auto"
            >
              {/* Slide Title */}
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  {currentSlide?.title}
                </h1>
                {currentSlide?.subtitle && (
                  <p className="text-sm sm:text-base text-current/70 mt-1 font-medium">
                    {currentSlide.subtitle}
                  </p>
                )}
              </div>

              {/* Slide Bullets or Paragraph Body */}
              {currentSlide?.bullets && currentSlide.bullets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                  {currentSlide.bullets.map((bullet, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.2 }}
                      className={`p-4 rounded-xl border flex items-start gap-3 shadow-xs ${themeClasses.bulletBox}`}
                    >
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold border border-indigo-400/30">
                        {idx + 1}
                      </div>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">
                        {bullet}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className={`p-6 rounded-2xl border text-sm sm:text-base leading-relaxed whitespace-pre-line shadow-xs ${themeClasses.bulletBox}`}>
                  {currentSlide?.content}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Slide Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-current/10 text-[11px] text-current/50">
            <span>Degree Unlocker • Slide Deck</span>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Naviguez avec Flèches Gauche / Droite ou Espace</span>
            </div>
          </div>
        </div>

        {/* Floating Speaker Notes Panel (if toggled) */}
        {showNotes && currentSlide?.notes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-5xl mt-3 p-3.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-100 text-xs shadow-lg backdrop-blur-md flex items-start gap-2.5 shrink-0"
          >
            <Bookmark className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">{lang === 'fr' ? 'Notes de l\'orateur / Conseils de révision :' : 'Speaker Notes & Revision Tips:'}</strong>
              <p className="mt-0.5 text-amber-200/90 leading-relaxed">{currentSlide.notes}</p>
            </div>
          </motion.div>
        )}
      </main>

      {/* Bottom Presentation Controls Toolbar */}
      <footer className="h-16 px-4 sm:px-6 flex items-center justify-between border-t border-white/10 bg-black/40 backdrop-blur-md shrink-0">
        {/* Left: Slide Selector Drawer Button & Notes Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSlideList(!showSlideList)}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Afficher toutes les diapositives"
          >
            <Layout className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">{lang === 'fr' ? 'Toutes les diapos' : 'Slide List'}</span>
          </button>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showNotes ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40' : 'bg-white/10 hover:bg-white/15 text-slate-300'
            }`}
            title="Afficher/Masquer les notes de l'orateur (Touche N)"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{lang === 'fr' ? 'Notes' : 'Notes'}</span>
          </button>
        </div>

        {/* Center: Slide Navigation (Prev / Counter / Next) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={goToPrevSlide}
            disabled={currentSlideIndex === 0}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              currentSlideIndex === 0 
                ? 'opacity-40 cursor-not-allowed border-white/5 text-slate-500' 
                : 'bg-white/10 hover:bg-white/20 text-white border-white/15 active:scale-95'
            }`}
            title="Diapositive précédente (Flèche Gauche)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs font-mono font-bold">
            {currentSlideIndex + 1} / {slides.length}
          </div>

          <button
            onClick={goToNextSlide}
            disabled={currentSlideIndex === slides.length - 1}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              currentSlideIndex === slides.length - 1 
                ? 'opacity-40 cursor-not-allowed border-white/5 text-slate-500' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/40 active:scale-95 shadow-md shadow-indigo-950'
            }`}
            title="Diapositive suivante (Flèche Droite ou Espace)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right: AI Voice Narration & Auto-Play Slideshow */}
        <div className="flex items-center gap-2">
          {/* AI Voice Readout */}
          <button
            onClick={handleToggleSpeech}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSpeaking 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 animate-pulse' 
                : 'bg-white/10 hover:bg-white/15 text-white'
            }`}
            title={lang === 'fr' ? 'Écouter la narration audio IA de cette diapositive' : 'Listen to AI voice narration for this slide'}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-emerald-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden sm:inline">{isSpeaking ? (lang === 'fr' ? 'Arrêter' : 'Stop') : (lang === 'fr' ? 'Voix IA' : 'AI Voice')}</span>
          </button>

          {/* Auto-play Timer */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isAutoPlaying 
                ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/40' 
                : 'bg-white/10 hover:bg-white/15 text-slate-300'
            }`}
            title={lang === 'fr' ? 'Défilement automatique du diaporama' : 'Auto-play presentation'}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5 text-indigo-400" /> : <Play className="w-3.5 h-3.5 text-indigo-400" />}
            <span className="hidden sm:inline">{isAutoPlaying ? (lang === 'fr' ? 'Pause' : 'Pause') : (lang === 'fr' ? 'Auto-Play' : 'Auto-Play')}</span>
          </button>
        </div>
      </footer>

      {/* Slide Thumbnails Drawer Modal (When triggered) */}
      <AnimatePresence>
        {showSlideList && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="w-80 max-w-[90vw] h-full bg-slate-900 border-l border-slate-800 p-5 flex flex-col text-white shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Layout className="w-4 h-4 text-indigo-400" />
                  <span>{lang === 'fr' ? 'Plan du Diaporama' : 'Slide Deck Overview'}</span>
                </h3>
                <button
                  onClick={() => setShowSlideList(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
                {slides.map((slide, idx) => {
                  const isCurrent = idx === currentSlideIndex;
                  return (
                    <button
                      key={slide.id}
                      onClick={() => {
                        setCurrentSlideIndex(idx);
                        setShowSlideList(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isCurrent 
                          ? 'bg-indigo-600/25 border-indigo-400 text-white font-bold ring-1 ring-indigo-400/40' 
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>Diapo #{idx + 1}</span>
                        <span className="uppercase text-[10px] text-indigo-300 font-mono">{slide.badge}</span>
                      </div>
                      <p className="text-xs truncate font-medium">{slide.title}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
