import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Compass, 
  Home, 
  Search, 
  BookOpen, 
  Layers, 
  FileText, 
  Brain, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { AppLanguage, AppTheme, NavTabType } from '../types';

interface NotFoundPageViewProps {
  onGoHome: () => void;
  onNavigate?: (tab: NavTabType) => void;
  onSearchQuery?: (query: string) => void;
  lang?: AppLanguage;
  activeTheme?: AppTheme;
}

export const NotFoundPageView: React.FC<NotFoundPageViewProps> = ({
  onGoHome,
  onNavigate,
  onSearchQuery,
  lang = 'fr',
  activeTheme = 'dark',
}) => {
  const isFr = lang === 'fr';
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    if (onSearchQuery) {
      onSearchQuery(searchTerm.trim());
    } else if (onNavigate) {
      onNavigate('search');
    } else {
      onGoHome();
    }
  };

  const handleQuickTagClick = (tagQuery: string, targetTab?: NavTabType) => {
    if (targetTab && onNavigate) {
      onNavigate(targetTab);
    } else if (onSearchQuery) {
      onSearchQuery(tagQuery);
    } else if (onNavigate) {
      onNavigate('search');
    } else {
      onGoHome();
    }
  };

  const isDarkTone = activeTheme === 'dark' || activeTheme === 'midnight';
  const isPaperTone = activeTheme === 'paper';

  const quickLinks: Array<{
    titleFr: string;
    titleEn: string;
    descFr: string;
    descEn: string;
    tab: NavTabType;
    icon: React.FC<{ className?: string }>;
    accentColor: string;
  }> = [
    {
      titleFr: 'Tableau de Bord',
      titleEn: 'Main Dashboard',
      descFr: 'Vue d\'ensemble de vos révisions',
      descEn: 'Overview of your study workflow',
      tab: 'dashboard',
      icon: Home,
      accentColor: 'from-indigo-500 to-indigo-700 text-indigo-400',
    },
    {
      titleFr: 'Bibliothèque de Cours',
      titleEn: 'Course Library',
      descFr: 'Vos notes, fiches & manuels',
      descEn: 'Your notes, flashcards & textbooks',
      tab: 'library',
      icon: BookOpen,
      accentColor: 'from-emerald-500 to-teal-700 text-emerald-400',
    },
    {
      titleFr: 'Bloc-Notes Structuré',
      titleEn: 'Study Notebook',
      descFr: 'Créer et éditer vos résumés',
      descEn: 'Create & edit structured notes',
      tab: 'blocknote',
      icon: FileText,
      accentColor: 'from-amber-500 to-orange-700 text-amber-400',
    },
    {
      titleFr: 'Quiz & Flashcards',
      titleEn: 'Quiz & Flashcards',
      descFr: 'Entraînement et mémorisation active',
      descEn: 'Active recall & memory training',
      tab: 'quiz',
      icon: Brain,
      accentColor: 'from-purple-500 to-pink-700 text-purple-400',
    },
  ];

  const suggestedKeywords = isFr
    ? [
        { label: 'Droit Constitutionnel', tab: 'library' as NavTabType },
        { label: 'Quiz IA', tab: 'quiz' as NavTabType },
        { label: 'Méthodologie', tab: 'tips' as NavTabType },
        { label: 'Flashcards', tab: 'flashcards' as NavTabType },
        { label: 'Nouveau cours', tab: 'blocknote' as NavTabType },
      ]
    : [
        { label: 'Constitutional Law', tab: 'library' as NavTabType },
        { label: 'AI Quiz', tab: 'quiz' as NavTabType },
        { label: 'Methodology Tips', tab: 'tips' as NavTabType },
        { label: 'Flashcards', tab: 'flashcards' as NavTabType },
        { label: 'New Notebook', tab: 'blocknote' as NavTabType },
      ];

  return (
    <div
      id="not-found-page-container"
      className={`min-h-[85vh] w-full flex items-center justify-center p-4 sm:p-6 lg:p-10 transition-colors duration-200 ${
        isPaperTone
          ? 'bg-[#f8f5ee] text-[#2c2621]'
          : isDarkTone
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="w-full max-w-4xl mx-auto space-y-8">
        
        {/* Top Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          
          {/* Animated Compass Locator Beacon */}
          <div className="relative inline-flex items-center justify-center mb-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative w-24 h-24 rounded-3xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500 shadow-xl backdrop-blur-md"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
              >
                <Compass className="w-12 h-12" />
              </motion.div>
              
              {/* Pulse Ring */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
              </span>
            </motion.div>
          </div>

          {/* Badge & Code */}
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 border border-indigo-500/30">
              Code HTTP 404 &bull; {isFr ? 'Page Non Trouvée' : 'Page Not Found'}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {isFr ? 'Vous semblez égaré dans le campus' : 'Lost in the Academic Cosmos'}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
            {isFr
              ? 'Le document, la note de cours ou le lien que vous essayez d\'ouvrir n\'existe pas, a été renommé ou déplacé vers un autre dossier.'
              : 'The document, course note, or link you are trying to reach does not exist or has been relocated within your workspace.'}
          </p>
        </div>

        {/* Interactive Search Bar Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center shadow-lg rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
          >
            <div className="pl-4 pr-2 text-slate-400 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <input
              id="input-404-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                isFr
                  ? 'Rechercher un cours, une notion, un auteur...'
                  : 'Search for a course, concept, author, or keyword...'
              }
              className="w-full py-4 pr-32 bg-transparent text-sm sm:text-base font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none text-slate-900 dark:text-white"
            />
            <button
              id="btn-404-search-submit"
              type="submit"
              className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>{isFr ? 'Explorer' : 'Search'}</span>
            </button>
          </form>

          {/* Quick Suggestion Pills */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {isFr ? 'Suggestions :' : 'Quick links:'}
            </span>
            {suggestedKeywords.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickTagClick(item.label, item.tab)}
                className="px-2.5 py-1 rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors font-semibold cursor-pointer border border-slate-300/50 dark:border-slate-700/50"
              >
                {item.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Hub of Direct Navigation Pathways */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {isFr ? 'Raccourcis & Espaces de Révision' : 'Quick Access Hub & Workspaces'}
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-500">
              {isFr ? 'Accès direct' : 'Instant access'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <button
                  key={idx}
                  id={`btn-404-nav-${link.tab}`}
                  type="button"
                  onClick={() => {
                    if (link.tab === 'dashboard') {
                      onGoHome();
                    } else if (onNavigate) {
                      onNavigate(link.tab);
                    } else {
                      onGoHome();
                    }
                  }}
                  className="group relative text-left p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-400/80 dark:hover:border-indigo-500/60 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {/* Subtle ambient hover glow */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${link.accentColor.split(' ')[0]} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-300 pointer-events-none`} />

                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${link.accentColor} flex items-center justify-center text-white shadow-md shadow-slate-950/10 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300`}>
                        <Icon className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 group-hover:border-indigo-400/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                        {link.tab}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                        <span>{isFr ? link.titleFr : link.titleEn}</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                        {isFr ? link.descFr : link.descEn}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors relative z-10">
                    <span className="text-[11px] font-semibold">{isFr ? 'Ouvrir l\'espace' : 'Open workspace'}</span>
                    <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span className="text-sm font-black">&rarr;</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom Primary Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            id="btn-404-return-dashboard"
            type="button"
            onClick={onGoHome}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-indigo-600/25 active:scale-95 cursor-pointer focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          >
            <Home className="w-4 h-4" />
            <span>{isFr ? 'Retourner au Tableau de Bord' : 'Back to Dashboard'}</span>
          </button>

          {typeof window !== 'undefined' && window.history && window.history.length > 1 && (
            <button
              id="btn-404-history-back"
              type="button"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-300/60 dark:border-slate-700/60"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isFr ? 'Page précédente' : 'Go Back'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default NotFoundPageView;
