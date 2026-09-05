import React from 'react';
import { 
  BookOpen, 
  Search, 
  FileText, 
  PenTool, 
  Database, 
  Plus, 
  Upload, 
  Sparkles, 
  HelpCircle,
  HardDrive,
  Youtube,
  Lightbulb,
  Globe,
  Brain,
  Zap,
  Languages,
  Quote,
  LayoutDashboard,
  Unlock,
  GraduationCap
} from 'lucide-react';
import { AppLanguage } from '../types';

export type NavTabType = 'dashboard' | 'library' | 'search' | 'resumer' | 'blocknote' | 'quotes' | 'flashcards' | 'quiz' | 'bilingual' | 'database';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  onNewNote: () => void;
  onUploadPdf: () => void;
  onOpenTutorial?: () => void;
  totalDocs: number;
  selectedDocTitle?: string;
  lang: AppLanguage;
  onToggleLang: () => void;
  onOpenLocalStorage: () => void;
  onOpenVideos: () => void;
  onOpenTips: () => void;
  onOpenQuickQuote?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNewNote,
  onUploadPdf,
  onOpenTutorial,
  totalDocs,
  selectedDocTitle,
  lang,
  onToggleLang,
  onOpenLocalStorage,
  onOpenVideos,
  onOpenTips,
  onOpenQuickQuote,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
          
          {/* Brand & Degree Unlocker Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              id="brand-home-btn"
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 text-left focus:outline-hidden group"
            >
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-600 to-indigo-800 group-hover:from-indigo-700 group-hover:to-indigo-900 flex items-center justify-center text-white shadow-xs transition-all">
                <Unlock className="w-4.5 h-4.5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                    Degree Unlocker
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                    150MB PC
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 truncate hidden sm:block font-semibold">
                  {lang === 'fr' ? 'Base de Connaissances & Révision' : 'Academic Notes & AI Companion'}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden xl:flex items-center space-x-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Tableau' : 'Dashboard'}</span>
            </button>

            <button
              id="nav-tab-library"
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'library'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Mes Cours' : 'Notes'}</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono font-bold">
                {totalDocs}
              </span>
            </button>

            <button
              id="nav-tab-search"
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'search'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Recherche IA' : 'AI Search'}</span>
            </button>

            <button
              id="nav-tab-resumer"
              onClick={() => setActiveTab('resumer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'resumer'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>{lang === 'fr' ? 'Synthèse' : 'Summaries'}</span>
            </button>

            <button
              id="nav-tab-blocknote"
              onClick={() => setActiveTab('blocknote')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'blocknote'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Blocknote' : 'Blocknote'}</span>
            </button>

            <button
              id="nav-tab-quotes"
              onClick={() => setActiveTab('quotes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'quotes'
                  ? 'bg-amber-500 text-slate-950 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Quote className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'fr' ? '100+ Citations' : '100+ Quotes'}</span>
            </button>

            <button
              id="nav-tab-flashcards"
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'flashcards'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Flashcards' : 'Flashcards'}</span>
            </button>

            <button
              id="nav-tab-quiz"
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'quiz'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'fr' ? 'Quiz' : 'Quiz Arena'}</span>
            </button>

            <button
              id="nav-tab-bilingual"
              onClick={() => setActiveTab('bilingual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'bilingual'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Languages className="w-3.5 h-3.5 text-teal-300" />
              <span>{lang === 'fr' ? 'Langues' : 'Languages'}</span>
            </button>

            <button
              id="nav-tab-database"
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'database'
                  ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Disque PC' : 'PC Storage'}</span>
            </button>
          </nav>

          {/* Action Controls & Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Language Switcher */}
            <button
              id="btn-lang-toggle"
              onClick={onToggleLang}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200 shadow-2xs"
              title={lang === 'fr' ? 'Basculer en anglais' : 'Switch to French'}
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>{lang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}</span>
            </button>

            {/* Note Taking Guide */}
            <button
              id="btn-tips-guide"
              onClick={onOpenTips}
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition-colors border border-amber-200/80 shadow-2xs"
              title={lang === 'fr' ? 'Guide & Astuces de prise de notes' : 'Tips & Guide'}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'fr' ? 'Astuces' : 'Guide'}</span>
            </button>

            {/* Educational Videos */}
            <button
              id="btn-educational-videos"
              onClick={onOpenVideos}
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors border border-red-200/80 shadow-2xs"
              title={lang === 'fr' ? 'Vidéos de révision YouTube' : 'Educational Videos'}
            >
              <Youtube className="w-3.5 h-3.5 text-red-600" />
              <span>{lang === 'fr' ? 'Vidéos' : 'Videos'}</span>
            </button>

            {/* Local PC Storage */}
            <button
              id="btn-local-storage"
              onClick={onOpenLocalStorage}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors border border-emerald-200/80 shadow-2xs"
              title={lang === 'fr' ? 'Stockage local PC sécurisé (150MB)' : 'Local PC Storage (150MB)'}
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden xl:inline">{lang === 'fr' ? 'Stockage PC' : 'Storage'}</span>
            </button>

            {/* Upload PDF / Word / Excel */}
            <button
              id="btn-upload-pdf"
              onClick={onUploadPdf}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all active:scale-95"
              title={lang === 'fr' ? 'Importer un document (PDF, Word, Excel, Google Docs)' : 'Upload document (PDF, Word, Excel, Google Docs)'}
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'fr' ? '+ Importer' : '+ Upload'}</span>
            </button>

            {/* New Note */}
            <button
              id="btn-new-note"
              onClick={onNewNote}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all shadow-2xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">{lang === 'fr' ? 'Nouvelle Note' : 'New Note'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex xl:hidden overflow-x-auto py-2 gap-1.5 border-t border-slate-100 scrollbar-thin">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-semibold ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {lang === 'fr' ? 'Tableau' : 'Dashboard'}
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-semibold ${
              activeTab === 'library' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {lang === 'fr' ? 'Mes Cours' : 'Notes'} ({totalDocs})
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-semibold ${
              activeTab === 'quotes' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {lang === 'fr' ? '100+ Citations' : '100+ Quotes'}
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-semibold ${
              activeTab === 'search' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {lang === 'fr' ? 'Recherche IA' : 'AI Search'}
          </button>
          <button
            onClick={() => setActiveTab('resumer')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-semibold ${
              activeTab === 'resumer' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {lang === 'fr' ? 'Synthèse' : 'Summary'}
          </button>
          <button
            onClick={() => setActiveTab('blocknote')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-semibold ${
              activeTab === 'blocknote' ? 'bg-amber-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {lang === 'fr' ? 'Blocknote' : 'Blocknote'}
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-semibold ${
              activeTab === 'flashcards' ? 'bg-purple-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {lang === 'fr' ? 'Flashcards' : 'Flashcards'}
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-semibold ${
              activeTab === 'quiz' ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {lang === 'fr' ? 'Quiz' : 'Quiz'}
          </button>
          <button
            onClick={() => setActiveTab('bilingual')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-semibold ${
              activeTab === 'bilingual' ? 'bg-teal-700 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {lang === 'fr' ? 'Langues' : 'Languages'}
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-semibold ${
              activeTab === 'database' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {lang === 'fr' ? 'Disque PC' : 'PC Storage'}
          </button>
        </div>
      </div>
    </header>
  );
};
