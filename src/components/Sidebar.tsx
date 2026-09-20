import React, { useState, useEffect, useCallback } from 'react';
import { AppLanguage, AppTheme, MenuPosition, UIPreferences, NavTabType } from '../types';
import { isTauri } from '../lib/tauri-bridge';
import { AppLogo } from './AppLogo';
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
  Camera,
  Smartphone,
  Download,
  Share2,
  Monitor,
  X,
  Crown,
  Accessibility,
  Landmark,
  Globe,
  Laptop
} from 'lucide-react';
import { useDownloadWindowsExe } from '../hooks/useDownloadWindowsExe';

export type { NavTabType };

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
  onOpenCredits?: () => void;
  onOpenBackup?: () => void;
  onOpenExportGuide?: () => void;
  onOpenCoach?: () => void;
  onOpenPhotoScanner?: () => void;
  onOpenAuthModal?: () => void;
  onOpenKeyboardShortcuts?: () => void;
  onOpenOneDrive?: () => void;
  onOpenGoogleWorkspace?: () => void;
  onOpenPrivacy?: () => void;
  onOpenAccessibility?: () => void;
  onOpenNotionExercises?: (subject?: string) => void;
  onFilterSubject?: (subject: string) => void;
  totalDocs: number;
  lang: AppLanguage;
  onToggleLang: () => void;
  streakDays?: number;
  subjectCounts?: Record<string, number>;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  activeTheme?: AppTheme;
  isOpen?: boolean;
  onClose?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onInstallPwa?: () => void;
  isPwaInstalled?: boolean;
  onSelectQuotesCategory?: (category: string, subcategory?: 'all' | 'dolfius_4_maximes' | 'image_maximes') => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: number | string;
  isActive?: boolean;
  onClick: () => void;
  collapsed?: boolean;
  activeColorClass?: string;
  title?: string;
}

const NavItem: React.FC<NavItemProps> = React.memo(({
  icon,
  label,
  badge,
  isActive = false,
  onClick,
  collapsed = false,
  activeColorClass = 'bg-blue-600 text-white font-bold shadow-sm',
  title,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
        isActive
          ? activeColorClass
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
      title={title || label}
    >
      <div className="flex items-center gap-2.5 truncate">
        {icon}
        {!collapsed && <span className="truncate">{label}</span>}
      </div>
      {!collapsed && badge !== undefined && (
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-slate-300 font-mono">
          {badge}
        </span>
      )}
    </button>
  );
});

interface SectionDividerProps {
  title?: string;
  collapsed?: boolean;
  icon?: React.ReactNode;
}

export const SectionDivider: React.FC<SectionDividerProps> = React.memo(({ title, collapsed, icon }) => {
  if (collapsed) {
    return <div className="my-2 h-[1px] bg-white/10 mx-2" />;
  }

  if (!title) {
    return <div className="my-2 h-[1px] bg-white/10 mx-1" />;
  }

  return (
    <div className="pt-2.5 pb-1 px-2 flex items-center justify-between gap-2 border-b border-white/10 mb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400/90 select-none">
      <div className="flex items-center gap-1.5 min-w-0">
        {icon && <span className="opacity-80 shrink-0">{icon}</span>}
        <span className="truncate">{title}</span>
      </div>
      <div className="flex-1 h-[1px] bg-white/10 ml-1 rounded-full" />
    </div>
  );
});

interface VirtualizedSubjectListProps {
  subjects: string[];
  subjectCounts: Record<string, number>;
  onSelectSubject: (subj: string) => void;
  collapsed: boolean;
  itemHeight?: number;
}

export const VirtualizedSubjectList: React.FC<VirtualizedSubjectListProps> = React.memo(({
  subjects,
  subjectCounts,
  onSelectSubject,
  collapsed,
  itemHeight = 36,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(220);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      setScrollTop(el.scrollTop);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    setContainerHeight(el.clientHeight || 220);

    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  if (subjects.length === 0) return null;

  // Direct render if 8 or fewer items for zero layout shift
  if (subjects.length <= 8) {
    return (
      <div className="space-y-0.5">
        {subjects.map((subj) => (
          <button
            key={subj}
            onClick={() => onSelectSubject(subj)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all group cursor-pointer"
            title={subj}
          >
            <div className="flex items-center gap-2 truncate">
              <Folder className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300 transition-colors shrink-0" />
              {!collapsed && <span className="truncate">{subj}</span>}
            </div>
            {!collapsed && (
              <span className="text-[10px] font-mono text-slate-400 bg-black/20 px-1.5 py-0.5 rounded-md">
                {subjectCounts[subj]}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Virtual window calculation for large dataset
  const totalHeight = subjects.length * itemHeight;
  const buffer = 2;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const endIndex = Math.min(subjects.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer);

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push({ index: i, subj: subjects[i] });
  }

  return (
    <div
      ref={containerRef}
      className="max-h-[220px] overflow-y-auto scrollbar-thin relative rounded-xl bg-black/20 border border-white/5 p-1"
      style={{ height: Math.min(subjects.length * itemHeight + 8, 220) }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ index, subj }) => (
          <div
            key={subj}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            <button
              onClick={() => onSelectSubject(subj)}
              className="w-full h-full flex items-center justify-between px-2 py-1 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all group cursor-pointer"
              title={subj}
            >
              <div className="flex items-center gap-2 truncate min-w-0">
                <Folder className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300 transition-colors shrink-0" />
                {!collapsed && <span className="truncate">{subj}</span>}
              </div>
              {!collapsed && (
                <span className="text-[10px] font-mono text-slate-400 bg-black/30 px-1.5 py-0.5 rounded">
                  {subjectCounts[subj]}
                </span>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

export const Sidebar: React.FC<SidebarProps> = React.memo(({
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
  onOpenCredits,
  onOpenBackup,
  onOpenExportGuide,
  onOpenCoach,
  onOpenPhotoScanner,
  onOpenAuthModal,
  onOpenKeyboardShortcuts,
  onOpenOneDrive,
  onOpenGoogleWorkspace,
  onOpenPrivacy,
  onOpenAccessibility,
  onOpenNotionExercises,
  onFilterSubject,
  totalDocs,
  lang,
  onToggleLang,
  streakDays = 1,
  subjectCounts = {},
  collapsed,
  onToggleCollapsed,
  activeTheme = 'light',
  isOpen,
  onClose,
  isMobileOpen = false,
  onCloseMobile,
  onInstallPwa,
  isPwaInstalled = false,
  onSelectQuotesCategory,
}) => {
  const { isDownloadingExe, downloadWindowsExe } = useDownloadWindowsExe();
  const isShown = isOpen ?? isMobileOpen;
  const handleClose = onClose || onCloseMobile;

  const handleTabClick = useCallback((tab: NavTabType) => {
    setActiveTab(tab);
    handleClose?.();
  }, [setActiveTab, handleClose]);

  const handleSelectSubject = useCallback((subj: string) => {
    if (onFilterSubject) {
      onFilterSubject(subj);
    }
    setActiveTab('library');
    handleClose?.();
  }, [onFilterSubject, setActiveTab, handleClose]);

  const wrapAction = useCallback((action?: () => void) => () => {
    action?.();
    handleClose?.();
  }, [handleClose]);

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
      {isShown && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-150"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] transform transition-transform duration-200 ease-in-out md:static md:h-[100dvh] md:sticky md:top-0 md:shrink-0 flex flex-col ${sidebarThemeClass} select-none shadow-2xl md:shadow-none ${
          isShown ? 'translate-x-0' : '-translate-x-full md:hidden'
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-amber-500/20 via-slate-900 to-black border border-amber-400/40 flex items-center justify-center text-white shadow-md shadow-amber-950/40 group-hover:scale-105 transition-transform shrink-0">
                <AppLogo size="sm" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5 min-w-0">
                  <span className="truncate font-serif tracking-wide">Degree Unlocker Lite</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider shrink-0">
                    LITE
                  </span>
                </span>
                <p className="block text-[10px] text-amber-300/80 font-medium truncate">
                  {lang === 'fr' ? 'Édition Allégée & Rapide' : 'Lightweight Study Station'}
                </p>
              </div>
            </button>
          ) : (
            <button 
              onClick={() => handleTabClick('dashboard')}
              className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-b from-amber-500/20 via-slate-900 to-black border border-amber-400/40 flex items-center justify-center text-white shadow-md hover:border-amber-400 transition-colors shrink-0 cursor-pointer"
              title="Degree Unlocker Lite"
            >
              <AppLogo size="sm" />
            </button>
          )}

          {/* Controls: Close / Collapse toggle */}
          <div className="flex items-center shrink-0 gap-1">
            {handleClose && (
              <button
                id="btn-sidebar-close"
                onClick={handleClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
                title={lang === 'fr' ? 'Masquer le menu sur le côté' : 'Hide sidebar'}
                aria-label="Fermer le menu"
              >
                <PanelLeftClose className="w-5 h-5 text-slate-300" />
              </button>
            )}
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

              {/* Google Workspace Hub (Drive, Docs, Tasks) */}
              {onOpenGoogleWorkspace && (
                <button
                  onClick={wrapAction(onOpenGoogleWorkspace)}
                  className="w-full px-2 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm border border-blue-400/40 cursor-pointer"
                  title="Google Drive, Docs & Tasks"
                >
                  <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0" />
                  <span className="truncate">Google Workspace</span>
                </button>
              )}

              {/* OneDrive Cloud Sync */}
              {onOpenOneDrive && (
                <button
                  onClick={wrapAction(onOpenOneDrive)}
                  className="w-full px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm border border-slate-600 cursor-pointer"
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
              {onOpenGoogleWorkspace && (
                <button
                  onClick={wrapAction(onOpenGoogleWorkspace)}
                  className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-sm transition-all border border-blue-400/40 cursor-pointer"
                  title="Google Workspace (Drive, Docs, Tasks)"
                >
                  <Folder className="w-4 h-4 text-amber-300" />
                </button>
              )}
              {onOpenOneDrive && (
                <button
                  onClick={wrapAction(onOpenOneDrive)}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center shadow-sm transition-all border border-slate-600 cursor-pointer"
                  title="OneDrive Cloud"
                >
                  <Cloud className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-3 scrollbar-thin">
        
        {/* SECTION 1: QUICK ACCESS */}
        <div>
          <SectionDivider
            title={lang === 'fr' ? 'Accès Rapide' : 'Quick Access'}
            collapsed={collapsed}
            icon={<Compass className="w-3.5 h-3.5 text-blue-400" />}
          />
          <nav className="space-y-0.5">
            <NavItem
              icon={<LayoutGrid className="w-4 h-4 text-blue-400 shrink-0" />}
              label={lang === 'fr' ? 'Tableau de Bord' : 'Dashboard'}
              isActive={activeTab === 'dashboard'}
              onClick={() => handleTabClick('dashboard')}
              collapsed={collapsed}
              activeColorClass="bg-blue-600 text-white font-bold shadow-sm"
              title={lang === 'fr' ? 'Tableau de bord' : 'Dashboard'}
            />

            <NavItem
              icon={<FileText className="w-4 h-4 text-emerald-400 shrink-0" />}
              label={lang === 'fr' ? 'Mes Fichiers' : 'My Files'}
              badge={totalDocs}
              isActive={activeTab === 'library'}
              onClick={() => handleTabClick('library')}
              collapsed={collapsed}
              activeColorClass="bg-emerald-600 text-white font-bold shadow-sm"
              title={lang === 'fr' ? 'Tous les documents' : 'All Files'}
            />

            <NavItem
              icon={<BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />}
              label={lang === 'fr' ? 'Manuels Scolaires' : 'School Textbooks'}
              isActive={activeTab === 'school_books'}
              onClick={() => handleTabClick('school_books')}
              collapsed={collapsed}
              activeColorClass="bg-indigo-600 text-white font-bold shadow-sm"
              title={lang === 'fr' ? 'Bibliothèque de Manuels & Exercices' : 'School Textbooks & Exercises'}
            />

            {onOpenNotionExercises && (
              <button
                id="btn-sidebar-notion-exercises"
                onClick={wrapAction(() => onOpenNotionExercises())}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-500/20 hover:text-white border border-amber-500/30 transition-all cursor-pointer shadow-xs group"
                title={lang === 'fr' ? 'Exercices Notion Indépendants (Espagnol, Allemand, Latin...)' : 'Independent Notion Exercises'}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-sm shrink-0">📓</span>
                  {!collapsed && <span className="truncate font-bold">{lang === 'fr' ? 'Exercices Notion' : 'Notion Drills'}</span>}
                </div>
                {!collapsed && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 font-mono">
                    {lang === 'fr' ? 'Indépendant' : 'New'}
                  </span>
                )}
              </button>
            )}

            <NavItem
              icon={<Search className="w-4 h-4 text-cyan-400 shrink-0" />}
              label={lang === 'fr' ? 'Recherche & Indexation IA' : 'AI Search & Index'}
              isActive={activeTab === 'search'}
              onClick={() => handleTabClick('search')}
              collapsed={collapsed}
              activeColorClass="bg-cyan-600 text-white font-bold shadow-sm"
              title={lang === 'fr' ? 'Recherche Plein Texte & Sémantique IA' : 'Semantic & Full-Text AI Search'}
            />

            <NavItem
              icon={<Sparkles className="w-4 h-4 text-fuchsia-400 shrink-0" />}
              label={lang === 'fr' ? 'Résumés & Sources' : 'Summaries & Sources'}
              isActive={activeTab === 'resumer'}
              onClick={() => handleTabClick('resumer')}
              collapsed={collapsed}
              activeColorClass="bg-fuchsia-600 text-white font-bold shadow-sm"
              title={lang === 'fr' ? 'Résumés & Sources IA' : 'AI Summaries'}
            />

            <NavItem
              icon={<PenTool className="w-4 h-4 text-amber-300 shrink-0" />}
              label={lang === 'fr' ? 'Bloc-Notes Cahier' : 'Blocknote Sheet'}
              isActive={activeTab === 'blocknote'}
              onClick={() => handleTabClick('blocknote')}
              collapsed={collapsed}
              activeColorClass="bg-amber-500 text-slate-950 font-extrabold shadow-sm"
              title={lang === 'fr' ? 'Bloc-Notes Manuscrit' : 'Blocknote Sheet'}
            />
          </nav>
        </div>

        {/* SECTION 2: STUDY MODES & FLASHCARDS */}
        <div>
          <SectionDivider
            title={lang === 'fr' ? 'Modes de Révision' : 'Study Modes'}
            collapsed={collapsed}
            icon={<Brain className="w-3.5 h-3.5 text-purple-400" />}
          />
          <nav className="space-y-0.5">
            <NavItem
              icon={<Layers className="w-4 h-4 text-rose-400 shrink-0" />}
              label={lang === 'fr' ? 'Fiches Flashcards' : 'Flashcards'}
              isActive={activeTab === 'flashcards'}
              onClick={() => handleTabClick('flashcards')}
              collapsed={collapsed}
              activeColorClass="bg-rose-600 text-white font-bold shadow-sm"
              title={lang === 'fr' ? 'Fiches Flashcards Personnalisées' : 'Custom Flashcards'}
            />

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

        {/* SECTION 2.5: GRANDES LANGUES (Collège → Lycée) */}
        <div>
          <SectionDivider
            title={lang === 'fr' ? 'Langues Vivantes' : 'Languages'}
            collapsed={collapsed}
            icon={<Globe className="w-3.5 h-3.5 text-emerald-400" />}
          />
          <nav className="space-y-0.5">
            <NavItem
              icon={<span className="text-sm shrink-0">🇬🇧</span>}
              label={lang === 'fr' ? 'Anglais (Mots & Notes)' : 'English (Words & Notes)'}
              isActive={activeTab === 'english'}
              onClick={() => handleTabClick('english')}
              collapsed={collapsed}
              activeColorClass="bg-blue-600 text-white font-bold shadow-sm"
              title={lang === 'fr' ? 'Anglais : Mots Prioritaires & Notes de Cours' : 'English Priority Words & Notes'}
            />
            <NavItem
              icon={<span className="text-sm shrink-0">🇪🇸</span>}
              label={lang === 'fr' ? 'Espagnol (5e - Tale)' : 'Spanish (5th - 12th)'}
              isActive={activeTab === 'spanish'}
              onClick={() => handleTabClick('spanish')}
              collapsed={collapsed}
              activeColorClass="bg-amber-600 text-white font-bold shadow-sm"
              title={lang === 'fr' ? 'Cours Complet d\'Espagnol Collège-Lycée' : 'Comprehensive Spanish Course'}
            />
            <NavItem
              icon={<span className="text-sm shrink-0">🇩🇪</span>}
              label={lang === 'fr' ? 'Allemand (5e - Tale)' : 'German (5th - 12th)'}
              isActive={activeTab === 'german'}
              onClick={() => handleTabClick('german')}
              collapsed={collapsed}
              activeColorClass="bg-yellow-600 text-white font-bold shadow-sm"
              title={lang === 'fr' ? 'Cours Complet d\'Allemand Collège-Lycée' : 'Comprehensive German Course'}
            />
          </nav>
        </div>

        {/* SECTION 3: DYNAMIC REAL SUBJECT FOLDERS (Virtualised for performance) */}
        {dynamicSubjects.length > 0 && (
          <div>
            <SectionDivider
              title={lang === 'fr' ? 'Mes Matières & Dossiers' : 'My Subjects'}
              collapsed={collapsed}
              icon={<Folder className="w-3.5 h-3.5 text-amber-400" />}
            />
            <VirtualizedSubjectList
              subjects={dynamicSubjects}
              subjectCounts={subjectCounts}
              onSelectSubject={handleSelectSubject}
              collapsed={collapsed}
            />
          </div>
        )}

        {/* SECTION 4: STUDY TOOLS & CULTURE */}
        <div>
          <SectionDivider
            title={lang === 'fr' ? 'Outils & Culture' : 'Tools & Culture'}
            collapsed={collapsed}
            icon={<Sliders className="w-3.5 h-3.5 text-indigo-400" />}
          />
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

            {/* Educational Videos (inside tools and culture) - Web only */}
            {!isTauri() && (
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
            )}

            {/* Playlists & Soundscapes - Web only */}
            {!isTauri() && (
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
            )}

            {/* Photo Scanner (Handwritten Notes) */}
            {onOpenPhotoScanner && (
              <button
                onClick={wrapAction(onOpenPhotoScanner)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-purple-300 hover:bg-purple-900/30 hover:text-white transition-all cursor-pointer"
                title={lang === 'fr' ? 'Scanner des notes manuscrites (Photo / Caméra)' : 'Scan handwritten notes (Camera / Photo)'}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Camera className="w-4 h-4 text-purple-400 shrink-0" />
                  {!collapsed && <span className="truncate">{lang === 'fr' ? 'Photo Notes Scanner' : 'Photo Scanner'}</span>}
                </div>
              </button>
            )}

            {/* Cross-Device Phone ↔ PC Sync */}
            {onOpenAuthModal && (
              <button
                onClick={wrapAction(onOpenAuthModal)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-300 hover:bg-emerald-900/30 hover:text-white transition-all cursor-pointer"
                title={lang === 'fr' ? 'Liaison Téléphone ↔ Ordinateur (Firestore)' : 'Phone ↔ PC Sync'}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                  {!collapsed && <span className="truncate">{lang === 'fr' ? 'Liaison Téléphone ↔ PC' : 'Phone ↔ PC Sync'}</span>}
                </div>
              </button>
            )}

            {/* Mobile Export Guide Hub */}
            {onOpenExportGuide && (
              <button
                onClick={wrapAction(onOpenExportGuide)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-900/30 hover:text-white transition-all cursor-pointer"
                title={lang === 'fr' ? 'Exporter depuis mon Téléphone' : 'Export from Phone'}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Share2 className="w-4 h-4 text-amber-400 shrink-0" />
                  {!collapsed && <span className="truncate">{lang === 'fr' ? 'Export Téléphone' : 'Phone Export'}</span>}
                </div>
              </button>
            )}

            {/* Backup & Export JSON */}
            {onOpenBackup && (
              <button
                onClick={wrapAction(onOpenBackup)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 hover:bg-cyan-900/30 hover:text-white transition-all cursor-pointer"
                title={lang === 'fr' ? 'Sauvegarde & Export (.JSON)' : 'Backup & Export (.JSON)'}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Download className="w-4 h-4 text-cyan-400 shrink-0" />
                  {!collapsed && <span className="truncate">{lang === 'fr' ? 'Sauvegarde .JSON' : 'Backup .JSON'}</span>}
                </div>
              </button>
            )}

            {/* Semantic Search */}
            <NavItem
              icon={<Search className="w-4 h-4 text-indigo-400 shrink-0" />}
              label={lang === 'fr' ? 'Recherche Sémantique' : 'Semantic Search'}
              isActive={activeTab === 'search'}
              onClick={() => handleTabClick('search')}
              collapsed={collapsed}
              activeColorClass="bg-indigo-600 text-white font-bold shadow-sm"
              title={lang === 'fr' ? 'Recherche Sémantique' : 'Semantic Search'}
            />

            {/* Local Database */}
            <NavItem
              icon={<HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />}
              label={lang === 'fr' ? 'Base Locale PC' : 'Local Database'}
              isActive={activeTab === 'database'}
              onClick={() => handleTabClick('database')}
              collapsed={collapsed}
              activeColorClass="bg-indigo-600 text-white font-bold shadow-sm"
              title={lang === 'fr' ? 'Base de Données Locale' : 'Local Database'}
            />

            {/* OneDrive Cloud Hub */}
            {onOpenOneDrive && (
              <button
                onClick={wrapAction(onOpenOneDrive)}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer"
                title="OneDrive & Synchronisation Cloud"
              >
                <Cloud className="w-4 h-4 text-sky-400 shrink-0" />
                {!collapsed && <span className="truncate">OneDrive Cloud</span>}
              </button>
            )}

            {/* Download Windows Exe (.exe) Direct Button */}
            <button
              onClick={() => downloadWindowsExe()}
              disabled={isDownloadingExe}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-black transition-all bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-extrabold shadow-md border border-amber-300 cursor-pointer mt-1.5 disabled:opacity-50"
              title={lang === 'fr' ? 'Télécharger DegreeUnlocker pour Windows (.exe)' : 'Download DegreeUnlocker for Windows (.exe)'}
            >
              <Laptop className="w-4 h-4 text-slate-950 shrink-0 stroke-[2.5]" />
              {!collapsed && <span className="truncate">{isDownloadingExe ? (lang === 'fr' ? 'TÉLÉCHARGEMENT...' : 'DOWNLOADING...') : (lang === 'fr' ? '💻 Télécharger .exe Windows' : '💻 Download .exe Windows')}</span>}
            </button>

            {/* Show Credits & Creators Button */}
            {onOpenCredits && (
              <button
                onClick={wrapAction(onOpenCredits)}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-950/50 hover:text-amber-200 border border-amber-400/30 transition-all cursor-pointer mt-1"
                title={lang === 'fr' ? 'Voir les crédits & créateurs (Dolfius 1er, L0fya, Black2Myth...)' : 'Show Credits & Creators'}
              >
                <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                {!collapsed && <span className="truncate">{lang === 'fr' ? 'Crédits & Générique' : 'Show Credits'}</span>}
              </button>
            )}

            {/* PWA / App Install Guide Button */}
            {onInstallPwa && (
              <button
                onClick={wrapAction(onInstallPwa)}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer mt-1"
                title={lang === 'fr' ? 'Guide PWA & Mobile' : 'PWA & Mobile Guide'}
              >
                <Download className="w-4 h-4 text-indigo-400 shrink-0 stroke-[2]" />
                {!collapsed && <span className="truncate">{lang === 'fr' ? 'Guide d\'installation' : 'Installation Guide'}</span>}
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
                title={lang === 'fr' ? 'Basculer la langue (FR / EN / DE / ES)' : 'Switch language (FR / EN / DE / ES)'}
              >
                <Languages className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="tracking-wide truncate">
                  {lang === 'fr' ? '🇫🇷 FR' : lang === 'en' ? '🇬🇧 EN' : lang === 'de' ? '🇩🇪 DE' : '🇪🇸 ES'}
                </span>
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

              {/* Privacy Policy & Google Compliance Modal Trigger */}
              {onOpenPrivacy && (
                <button
                  onClick={onOpenPrivacy}
                  className="p-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-400/30 flex items-center justify-center transition-all cursor-pointer shrink-0"
                  title={lang === 'fr' ? 'Confidentialité & Règles Google (RGPD)' : 'Privacy Policy & Google Compliance'}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </button>
              )}

              {/* Accessibility & ADA Compliance Trigger */}
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-ada-accessibility-menu'));
                  if (onOpenAccessibility) onOpenAccessibility();
                }}
                className="p-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/30 flex items-center justify-center transition-all cursor-pointer shrink-0"
                title={lang === 'fr' ? 'Accessibilité & Normes ADA (WCAG 2.1 AA)' : 'Accessibility & ADA Standards (WCAG 2.1 AA)'}
              >
                <Accessibility className="w-4 h-4 text-purple-300" />
              </button>
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

            {/* Collapsed Privacy button */}
            {onOpenPrivacy && (
              <button
                onClick={onOpenPrivacy}
                className="w-9 h-9 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-400 flex items-center justify-center border border-emerald-400/30 transition-all cursor-pointer"
                title={lang === 'fr' ? 'Confidentialité & Règles Google' : 'Privacy Policy & Google Compliance'}
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}

            {/* Collapsed Accessibility button */}
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-ada-accessibility-menu'));
                if (onOpenAccessibility) onOpenAccessibility();
              }}
              className="w-9 h-9 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 flex items-center justify-center border border-purple-400/30 transition-all cursor-pointer"
              title={lang === 'fr' ? 'Accessibilité & ADA' : 'Accessibility & ADA'}
            >
              <Accessibility className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

    </aside>
    </>
  );
});
