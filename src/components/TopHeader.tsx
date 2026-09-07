import React from 'react';
import { AppLanguage, AppTheme, MenuPosition, UIPreferences } from '../types';
import { NavTabType } from './Sidebar';
import { AppUpdateManager } from './AppUpdateManager';
import { 
  Search, 
  Sparkles, 
  Plus, 
  Upload, 
  Flame, 
  Headphones, 
  User, 
  Languages, 
  ChevronDown,
  Palette,
  LayoutGrid,
  FileText,
  Layers,
  CheckSquare,
  Zap,
  Quote,
  HardDrive,
  PanelLeftOpen,
  PenTool,
  Sun,
  Moon,
  Bot,
  Menu,
  Camera,
  Smartphone,
  Keyboard,
  Folder,
  Cloud,
  RefreshCw,
  CheckCircle2,
  Minus,
  Square,
  Copy,
  X,
  Monitor
} from 'lucide-react';
import { isTauri, minimizeWindow, toggleMaximizeWindow, closeWindow, isWindowMaximized, handleHeaderMouseDown } from '../utils/tauri';

interface TopHeaderProps {
  onSearchClick: () => void;
  onNewNote: () => void;
  onUploadPdf: () => void;
  onSummarizeClick: () => void;
  onOpenPlaylists: () => void;
  onOpenPreferences: () => void;
  onOpenBackup?: () => void;
  onOpenCoach?: () => void;
  onOpenPhotoScanner?: () => void;
  onOpenAuthModal?: () => void;
  onOpenGoogleWorkspace?: () => void;
  onOpenOneDrive?: () => void;
  onOpenKeyboardShortcuts?: () => void;
  currentUser?: any;
  isSyncing?: boolean;
  lang: AppLanguage;
  onToggleLang: () => void;
  onToggleTheme?: () => void;
  streakDays?: number;
  currentWorkspace?: string;
  menuPosition: MenuPosition;
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  activeTheme?: AppTheme;
  onOpenMobileMenu?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onSearchClick,
  onNewNote,
  onUploadPdf,
  onSummarizeClick,
  onOpenPlaylists,
  onOpenPreferences,
  onOpenBackup,
  onOpenCoach,
  onOpenPhotoScanner,
  onOpenAuthModal,
  onOpenGoogleWorkspace,
  onOpenOneDrive,
  onOpenKeyboardShortcuts,
  currentUser,
  isSyncing = false,
  lang,
  onToggleLang,
  onToggleTheme,
  streakDays = 1,
  currentWorkspace = 'Espace Personnel',
  menuPosition,
  activeTab,
  setActiveTab,
  isSidebarCollapsed,
  onToggleSidebar,
  activeTheme = 'light',
  onOpenMobileMenu,
}) => {
  // Theme classes for header
  const headerThemeClass = 
    activeTheme === 'paper'
      ? 'bg-[#fcfaf4] border-b border-[#e2d7c5] text-slate-800'
      : activeTheme === 'midnight'
      ? 'bg-[#0b0f19] border-b border-indigo-950/80 text-white'
      : activeTheme === 'dark'
      ? 'bg-slate-900 border-b border-slate-800 text-white'
      : 'bg-white border-b border-slate-200 text-slate-900';

  const isDarkish = activeTheme === 'dark' || activeTheme === 'midnight';
  const [isMax, setIsMax] = React.useState(false);

  React.useEffect(() => {
    if (isTauri()) {
      isWindowMaximized().then(setIsMax);
    }
  }, []);

  const handleMinimize = async () => {
    await minimizeWindow();
  };

  const handleMaximize = async () => {
    await toggleMaximizeWindow();
    const max = await isWindowMaximized();
    setIsMax(max);
  };

  const handleClose = async () => {
    await closeWindow();
  };

  const topTabs: { id: NavTabType; labelFr: string; labelEn: string; icon: any }[] = [
    { id: 'dashboard', labelFr: 'Tableau de bord', labelEn: 'Dashboard', icon: LayoutGrid },
    { id: 'library', labelFr: 'Mes Cours', labelEn: 'My Files', icon: FileText },
    { id: 'flashcards', labelFr: 'Flashcards', labelEn: 'Flashcards', icon: Layers },
    { id: 'quiz', labelFr: 'Quiz', labelEn: 'Quiz', icon: CheckSquare },
    { id: 'blocknote', labelFr: 'Bloc-Notes', labelEn: 'Blocknote', icon: PenTool },
    { id: 'resumer', labelFr: 'Résumés IA', labelEn: 'Summaries', icon: Sparkles },
    { id: 'bilingual', labelFr: 'Bilingue', labelEn: 'Bilingual', icon: Zap },
    { id: 'database', labelFr: 'Base Locale', labelEn: 'Local DB', icon: HardDrive },
  ];

  return (
    <header 
      data-tauri-drag-region
      onMouseDown={handleHeaderMouseDown}
      className={`px-3 sm:px-6 ${headerThemeClass} flex flex-col sticky top-0 z-20 shadow-xs transition-colors duration-200`}
    >
      
      {/* Top Bar Row - Only Search Bar and Menu Toggle */}
      <div className="h-16 flex items-center justify-between gap-2 sm:gap-3">
        
        {/* Left: Mobile hamburger menu + Sidebar toggle if collapsed + Search bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {/* Mobile hamburger menu toggle */}
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 md:hidden flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
              title={lang === 'fr' ? 'Ouvrir le menu complet' : 'Open full menu'}
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </button>
          )}

          {menuPosition === 'left' && isSidebarCollapsed && (
            <button
              onClick={onToggleSidebar}
              className="hidden md:flex p-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 items-center gap-1.5 transition-all cursor-pointer shrink-0"
              title={lang === 'fr' ? 'Afficher le menu complet' : 'Show full sidebar'}
            >
              <PanelLeftOpen className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">{lang === 'fr' ? 'Menu' : 'Menu'}</span>
            </button>
          )}

          {/* Quick Search - Always prominent and flexible */}
          <button
            onClick={onSearchClick}
            className={`flex-1 min-w-0 flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group border ${
              isDarkish
                ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200/80'
            }`}
            title={lang === 'fr' ? 'Recherche rapide (Ctrl+K)' : 'Quick Search (Ctrl+K)'}
          >
            <div className="flex items-center gap-2 truncate min-w-0">
              <Search className="w-4 h-4 text-indigo-500 transition-colors shrink-0" />
              <span className="truncate">
                {lang === 'fr' 
                  ? 'Rechercher cours, fiches, quiz...' 
                  : 'Search notes, flashcards, quiz...'}
              </span>
            </div>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0 ml-2">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Minimal status indicator & Version badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span 
            className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-mono text-[11px] font-bold"
            title={lang === 'fr' ? 'Version de l’application' : 'App Version'}
          >
            v3.2.1
          </span>

          {isSyncing ? (
            <div 
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold animate-pulse"
              title="Syncing..."
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
              <span className="hidden sm:inline">Sync...</span>
            </div>
          ) : (
            <div 
              className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium"
              title="Saved"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{lang === 'fr' ? 'Sauvegardé' : 'Saved'}</span>
            </div>
          )}

          {/* Desktop & Tauri Window Controls (Minimize, Maximize, Close) */}
          <div className="hidden lg:flex items-center h-8 ml-1 border-l border-slate-200 dark:border-slate-800 pl-1.5">
            <button
              id="btn-topheader-minimize"
              onClick={handleMinimize}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={lang === 'fr' ? 'Réduire' : 'Minimize'}
              aria-label="Minimize Window"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-topheader-maximize"
              onClick={handleMaximize}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isMax ? (lang === 'fr' ? 'Restaurer' : 'Restore') : (lang === 'fr' ? 'Agrandir' : 'Maximize')}
              aria-label="Maximize Window"
            >
              {isMax ? <Copy className="w-3 h-3 rotate-180" /> : <Square className="w-3 h-3" />}
            </button>
            <button
              id="btn-topheader-close"
              onClick={handleClose}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
              title={lang === 'fr' ? 'Fermer' : 'Close'}
              aria-label="Close Window"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Optional Top Horizontal Menu Navigation if menuPosition === 'top' */}
      {menuPosition === 'top' && (
        <div className="flex items-center gap-1 py-1.5 overflow-x-auto scrollbar-none border-t border-slate-200/60 dark:border-slate-800/60">
          {topTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-indigo-500'}`} />
                <span>{lang === 'fr' ? tab.labelFr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      )}

    </header>
  );
};

