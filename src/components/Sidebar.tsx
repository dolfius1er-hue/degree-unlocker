import React, { useState } from 'react';
import { AppLanguage, AppTheme, MenuPosition, UIPreferences } from '../types';
import { 
  GraduationCap, 
  Folder, 
  Layers, 
  Brain, 
  FileText, 
  Sparkles, 
  BookOpen, 
  Quote, 
  Headphones, 
  Database, 
  Search, 
  CheckSquare, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Upload, 
  Languages, 
  Flame, 
  HardDrive, 
  ShieldCheck,
  HelpCircle, 
  Video, 
  PenTool, 
  Clock, 
  Compass, 
  LayoutGrid, 
  Palette, 
  Sliders, 
  PanelLeftClose, 
  PanelLeftOpen,
  Keyboard,
  Cloud,
  X 
} from 'lucide-react';

export type NavTabType = 
  | 'dashboard' 
  | 'library' 
  | 'search' 
  | 'resumer' 
  | 'blocknote' 
  | 'quotes' 
  | 'flashcards' 
  | 'quiz' 
  | 'bilingual' 
  | 'database';

interface SidebarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  onNewNote: () => void;
  onUploadPdf: () => void;
  onOpenTutorial: () => void;
  onOpenPlaylists: () => void;
  onOpenLocalStorage: () => void;
  onOpenVideos: () => void;
  onOpenTips: () => void;
  onOpenPreferences: () => void;
  onOpenBackup?: () => void;
  onOpenCoach?: () => void;
  onOpenKeyboardShortcuts?: () => void;
  onOpenOneDrive?: () => void;
  onFilterSubject?: (subject: string) => void;
  totalDocs: number;
  lang: AppLanguage;
  onToggleLang: () => void;
  streakDays?: number;
  subjectCounts?: Record<string, number>;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  activeTheme?: AppTheme;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onNewNote,
  onUploadPdf,
  onOpenTutorial,
  onOpenPlaylists,
  onOpenLocalStorage,
  onOpenVideos,
  onOpenTips,
  onOpenPreferences,
  onOpenBackup,
  onOpenCoach,
  onOpenKeyboardShortcuts,
  onOpenOneDrive,
  onFilterSubject,
  totalDocs,
  lang,
  onToggleLang,
  streakDays = 1,
  subjectCounts = {},
  collapsed,
  onToggleCollapsed,
  activeTheme = 'light',
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const handleTabClick = (tab: NavTabType) => {
    setActiveTab(tab);
    onCloseMobile?.();
  };

  const handleSelectSubject = (subj: string) => {
    if (onFilterSubject) {
      onFilterSubject(subj);
    }
    setActiveTab('library');
    onCloseMobile?.();
  };

  const wrapAction = (action?: () => void) => () => {
    action?.();
    onCloseMobile?.();
  };

  const dynamicSubjects = Object.keys(subjectCounts);

  // Background styling according to active theme
  const sidebarThemeClass = 
    activeTheme === 'paper'
      ? 'bg-[#2b251f] border-r border-[#3d342c] text-amber-100'
      : activeTheme === 'midnight'
      ? 'bg-[#060913] border-r border-indigo-950/80 text-slate-300'
      : 'bg-slate-900 border-r border-slate-800 text-slate-300';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 md:h-[100dvh] md:sticky md:top-0 md:shrink-0 flex flex-col ${sidebarThemeClass} select-none shadow-2xl md:shadow-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${
          collapsed ? 'md:w-[72px]' : 'md:w-[240px] lg:w-[280px]'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-3 flex items-center justify-between border-b border-white/10 bg-black/20 gap-2">
          {!collapsed ? (
            <button 
              onClick={() => handleTabClick('dashboard')}
              className="flex items-center gap-2.5 text-left group overflow-hidden cursor-pointer min-w-0"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 border border-indigo-400/40 flex items-center justify-center text-white shadow-md shadow-indigo-950/50 group-hover:scale-105 transition-transform shrink-0">
                <GraduationCap className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block font-extrabold text-sm tracking-tight text-white group-hover:text-indigo-300 transition-colors truncate">
                  Degree Unlocker
                </span>
                <p className="block text-[10px] text-slate-400 truncate">
                  {lang === 'fr' ? 'Espace d\'Étude & Révision' : 'Academic Study Hub'}
                </p>
              </div>
            </button>
          ) : (
            <button 
              onClick={() => handleTabClick('dashboard')}
              className="w-10 h-10 mx-auto rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md hover:bg-indigo-500 transition-colors shrink-0 cursor-pointer"
              title="Degree Unlocker"
            >
              <GraduationCap className="w-5 h-5 text-amber-300" />
            </button>
          )}

          {/* Controls: Close for mobile, collapse toggle for desktop */}
          <div className="flex items-center shrink-0">
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors md:hidden cursor-pointer"
                title={lang === 'fr' ? 'Fermer le menu' : 'Close menu'}
              >
                <X className="w-5 h-5 text-slate-300" />
              </button>
            )}
            <button
              onClick={onToggleCollapsed}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors items-center justify-center cursor-pointer"
              title={collapsed ? (lang === 'fr' ? 'Agrandir le menu' : 'Expand sidebar') : (lang === 'fr' ? 'Réduire le menu (plein écran)' : 'Collapse sidebar (full screen)')}
            >
              {collapsed ? <PanelLeftOpen className="w-5 h-5 text-indigo-400" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* High-Visibility Action Buttons Hub (New Note / Prominent Import) */}
        <div className="p-2 sm:p-3 border-b border-white/10 bg-black/10 space-y-2">
          {!collapsed ? (
            <div className="flex flex-col gap-2">
              {/* Prominent Import Button with high contrast */}
              <button
                onClick={wrapAction(onUploadPdf)}
                className="w-full px-2 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm shadow-amber-400/30 transition-all border border-amber-300 cursor-pointer"
                title="Importer un fichier cours (PDF, Word, Excel, Docs)"
              >
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 stroke-[2.5] shrink-0" />
                <span className="tracking-tight truncate">{lang === 'fr' ? 'IMPORTER UN COURS' : 'IMPORT COURSE FILE'}</span>
              </button>

              {/* Create Note / Flashcard */}
              <button
                onClick={wrapAction(onNewNote)}
                className="w-full px-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm border border-indigo-400/30 cursor-pointer"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] shrink-0" />
                <span className="truncate">{lang === 'fr' ? 'Nouvelle Note' : 'New Note'}</span>
              </button>

              {/* OneDrive Cloud Sync */}
              {onOpenOneDrive && (
                <button
                  onClick={wrapAction(onOpenOneDrive)}
                  className="w-full px-2 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm border border-blue-400/30 cursor-pointer"
                  title="OneDrive & Synchronisation Cloud"
                >
                  <Cloud className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="truncate">OneDrive Cloud</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={wrapAction(onUploadPdf)}
                className="w-9 h-9 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shadow-sm shadow-amber-400/30 transition-all border border-amber-300 cursor-pointer"
                title="Importer un cours (PDF, Word, Excel)"
              >
                <Upload className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </button>
              <button
                onClick={wrapAction(onNewNote)}
                className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-sm transition-all border border-indigo-400/30 cursor-pointer"
                title="Nouvelle Note"
              >
                <Plus className="w-4 h-4" />
              </button>
              {onOpenOneDrive && (
                <button
                  onClick={wrapAction(onOpenOneDrive)}
                  className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-sm transition-all border border-blue-400/30 cursor-pointer"
                  title="OneDrive Cloud"
                >
                  <Cloud className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-4 scrollbar-thin">
        
        {/* SECTION 1: QUICK ACCESS */}
        <div>
          {!collapsed && (
            <div className="px-2.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {lang === 'fr' ? 'Accès Rapide' : 'Quick Access'}
            </div>
          )}
          <nav className="space-y-0.5">
            <button
              onClick={() => handleTabClick('dashboard')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title={lang === 'fr' ? 'Tableau de bord' : 'Dashboard'}
            >
              <LayoutGrid className="w-4 h-4 text-blue-400 shrink-0" />
              {!collapsed && <span className="truncate">{lang === 'fr' ? 'Tableau de Bord' : 'Dashboard'}</span>}
            </button>

            <button
              onClick={() => handleTabClick('library')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'library'
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title={lang === 'fr' ? 'Tous les documents' : 'All Files'}
            >
              <div className="flex items-center gap-2.5 truncate">
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                {!collapsed && <span className="truncate">{lang === 'fr' ? 'Mes Fichiers' : 'My Files'}</span>}
              </div>
              {!collapsed && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-slate-300 font-mono">
                  {totalDocs}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabClick('resumer')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'resumer'
                  ? 'bg-fuchsia-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title={lang === 'fr' ? 'Résumés & Sources IA' : 'AI Summaries'}
            >
              <Sparkles className="w-4 h-4 text-fuchsia-400 shrink-0" />
              {!collapsed && <span className="truncate">{lang === 'fr' ? 'Résumés & Sources' : 'Summaries & Sources'}</span>}
            </button>

            <button
              onClick={() => handleTabClick('blocknote')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'blocknote'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title={lang === 'fr' ? 'Bloc-Notes Manuscrit' : 'Blocknote Sheet'}
            >
              <PenTool className="w-4 h-4 text-amber-300 shrink-0" />
              {!collapsed && <span className="truncate">{lang === 'fr' ? 'Bloc-Notes Cahier' : 'Blocknote Sheet'}</span>}
            </button>
          </nav>
        </div>

        {/* SECTION 2: STUDY MODES & FLASHCARDS */}
        <div>
          {!collapsed && (
            <div className="px-2.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {lang === 'fr' ? 'Modes de Révision' : 'Study Modes'}
            </div>
          )}
          <nav className="space-y-0.5">
            <button
              onClick={() => handleTabClick('flashcards')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'flashcards'
                  ? 'bg-rose-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title={lang === 'fr' ? 'Fiches Flashcards Personnalisées' : 'Custom Flashcards'}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Layers className="w-4 h-4 text-rose-400 shrink-0" />
                {!collapsed && <span className="truncate">{lang === 'fr' ? 'Fiches Flashcards' : 'Flashcards'}</span>}
              </div>
            </button>

            <button
              onClick={() => handleTabClick('quiz')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'quiz'
                  ? 'bg-teal-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title={lang === 'fr' ? 'Quiz Active Recall' : 'Active Recall Quiz'}
            >
              <CheckSquare className="w-4 h-4 text-teal-400 shrink-0" />
              {!collapsed && <span className="truncate">{lang === 'fr' ? 'Quiz Recall' : 'Recall Quiz'}</span>}
            </button>

            <button
              onClick={() => handleTabClick('bilingual')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'bilingual'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title={lang === 'fr' ? 'Labo Bilingue & Match' : 'Bilingual Lab'}
            >
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              {!collapsed && <span className="truncate">{lang === 'fr' ? 'Labo Bilingue' : 'Bilingual Lab'}</span>}
            </button>

            {onOpenCoach && (
              <button
                id="btn-sidebar-socratic-coach"
                onClick={wrapAction(onOpenCoach)}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-purple-300 hover:bg-purple-900/40 hover:text-white transition-all cursor-pointer"
                title={lang === 'fr' ? 'Tuteur Socratique IA (Anti-Triche)' : 'Socratic Study Coach'}
              >
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                {!collapsed && <span className="truncate">{lang === 'fr' ? 'Coach Socratique IA' : 'Socratic Coach'}</span>}
              </button>
            )}
          </nav>
        </div>

        {/* SECTION 3: DYNAMIC REAL SUBJECT FOLDERS (Only real data created by user) */}
        {dynamicSubjects.length > 0 && (
          <div>
            {!collapsed && (
              <div className="px-2.5 mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>{lang === 'fr' ? 'Mes Matières' : 'My Subjects'}</span>
              </div>
            )}
            <div className="space-y-0.5">
              {dynamicSubjects.map((subj) => (
                <button
                  key={subj}
                  onClick={() => handleSelectSubject(subj)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all group cursor-pointer"
                  title={subj}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300 transition-colors shrink-0" />
                    {!collapsed && <span className="truncate">{subj}</span>}
                  </div>
                  {!collapsed && (
                    <span className="text-[10px] font-mono text-slate-400">
                      {subjectCounts[subj]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: STUDY TOOLS & CULTURE (Now includes Guide & Videos directly here) */}
        <div>
          {!collapsed && (
            <div className="px-2.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {lang === 'fr' ? 'Outils & Culture' : 'Tools & Culture'}
            </div>
          )}
          <nav className="space-y-0.5">
            {/* Study Guide (inside tools and culture) */}
            <button
              onClick={wrapAction(onOpenTips)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              title={lang === 'fr' ? 'Guide d\'étude & Conseils' : 'Study Guide & Tips'}
            >
              <div className="flex items-center gap-2.5 truncate">
                <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                {!collapsed && <span className="truncate">{lang === 'fr' ? 'Guide & Méthodes' : 'Study Guide'}</span>}
              </div>
            </button>

            {/* Educational Videos (inside tools and culture) */}
            <button
              onClick={wrapAction(onOpenVideos)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              title={lang === 'fr' ? 'Vidéos Pédagogiques' : 'Educational Videos'}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Video className="w-4 h-4 text-rose-400 shrink-0" />
                {!collapsed && <span className="truncate">{lang === 'fr' ? 'Vidéos de Révision' : 'Study Videos'}</span>}
              </div>
            </button>

            {/* Famous Quotes */}
            <button
              onClick={() => handleTabClick('quotes')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'quotes'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title={lang === 'fr' ? '100+ Citations & Discours' : '100+ Quotes'}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Quote className="w-4 h-4 text-amber-400 shrink-0" />
                {!collapsed && <span className="truncate">{lang === 'fr' ? '100+ Citations' : '100+ Quotes'}</span>}
              </div>
            </button>

            {/* Playlists & Soundscapes */}
            <button
              onClick={wrapAction(onOpenPlaylists)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              title={lang === 'fr' ? 'Playlists & Bruit Blanc' : 'Playlists & Soundscapes'}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Headphones className="w-4 h-4 text-pink-400 shrink-0" />
                {!collapsed && <span className="truncate">{lang === 'fr' ? 'Bruit Blanc & Audio' : 'Audio Soundscapes'}</span>}
              </div>
            </button>

            {/* Semantic Search */}
            <button
              onClick={() => handleTabClick('search')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'search'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title={lang === 'fr' ? 'Recherche Sémantique' : 'Semantic Search'}
            >
              <Search className="w-4 h-4 text-indigo-400 shrink-0" />
              {!collapsed && <span className="truncate">{lang === 'fr' ? 'Recherche Sémantique' : 'Semantic Search'}</span>}
            </button>

            {/* Local Database */}
            <button
              onClick={() => handleTabClick('database')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'database'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title={lang === 'fr' ? 'Base de Données Locale' : 'Local Database'}
            >
              <HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />
              {!collapsed && <span className="truncate">{lang === 'fr' ? 'Base Locale PC' : 'Local Database'}</span>}
            </button>

            {/* Study Progress Backup & Export */}
            {onOpenBackup && (
              <button
                onClick={wrapAction(onOpenBackup)}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer"
                title={lang === 'fr' ? 'Sauvegarde & Sécurité de Progression (.JSON)' : 'Study Progress Backup (.JSON)'}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                {!collapsed && <span className="truncate">{lang === 'fr' ? 'Sauvegarde .JSON' : 'Backup .JSON'}</span>}
              </button>
            )}
          </nav>
        </div>

      </div>

      {/* Footer / High-Visibility Language Switcher & Theme Manager */}
      <div className="p-2 border-t border-white/10 bg-black/30 space-y-2">
        {!collapsed ? (
          <div className="space-y-2">
            
            {/* Prominent High-Visibility Language & Theme Row */}
            <div className="flex items-center gap-1.5">
              {/* High-Visibility Language Changer Button */}
              <button
                onClick={onToggleLang}
                className="flex-1 min-w-0 py-1.5 px-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title={lang === 'fr' ? 'Basculer la langue (FR / EN)' : 'Switch language (FR / EN)'}
              >
                <Languages className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="tracking-wide truncate">{lang === 'fr' ? 'FR Français' : 'EN English'}</span>
              </button>

              {/* Theme & Layout Preferences Manager Button */}
              <button
                onClick={onOpenPreferences}
                className="p-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-400/30 flex items-center justify-center transition-all cursor-pointer shrink-0"
                title={lang === 'fr' ? 'Gestionnaire de Thème & Affichage' : 'Theme & Layout Settings'}
              >
                <Palette className="w-4 h-4 text-indigo-300" />
              </button>

              {/* Keyboard Shortcuts Trigger Button */}
              {onOpenKeyboardShortcuts && (
                <button
                  onClick={onOpenKeyboardShortcuts}
                  className="p-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-400/30 flex items-center justify-center transition-all cursor-pointer shrink-0"
                  title={lang === 'fr' ? 'Raccourcis Clavier (?)' : 'Keyboard Shortcuts (?)'}
                >
                  <Keyboard className="w-4 h-4 text-amber-300" />
                </button>
              )}
            </div>

            {/* Streak & Status */}
            <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{streakDays} {lang === 'fr' ? 'Jours d\'Étude' : 'Day Streak'}</span>
              </div>
              <span className="font-mono text-[9px] text-emerald-400">100% Local PC</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {/* Collapsed high-visibility language button */}
            <button
              onClick={onToggleLang}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 flex items-center justify-center text-xs font-extrabold border border-white/20 transition-all cursor-pointer"
              title={lang === 'fr' ? 'Langue: Français (Cliquer pour English)' : 'Language: English (Click for Français)'}
            >
              {lang.toUpperCase()}
            </button>

            {/* Collapsed Theme button */}
            <button
              onClick={onOpenPreferences}
              className="w-9 h-9 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 flex items-center justify-center border border-indigo-400/30 transition-all cursor-pointer"
              title={lang === 'fr' ? 'Thèmes & Affichage' : 'Theme Manager'}
            >
              <Palette className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

    </aside>
    </>
  );
};
