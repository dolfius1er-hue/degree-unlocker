import React from 'react';
import { AppLanguage, AppTheme, MenuPosition, UIPreferences } from '../types';
import { NavTabType } from './Sidebar';
import { AppUpdateManager } from './AppUpdateManager';
import { FocusPomodoroTimer } from './FocusPomodoroTimer';
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
  Monitor,
  Info
} from 'lucide-react';
import { isTauri, minimizeWindow, toggleMaximizeWindow, closeWindow, isWindowMaximized, handleHeaderMouseDown } from '../utils/tauri';
import { soundFx } from '../utils/soundEffects';

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
  onOpenInstallGuide?: () => void;
  onOpenSyncManager?: () => void;
  onOpenSoundHUD?: () => void;
  onOpenLiteOptimizer?: () => void;
  isPwaInstalled?: boolean;
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
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeTheme?: AppTheme;
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
  onOpenInstallGuide,
  onOpenSyncManager,
  onOpenSoundHUD,
  onOpenLiteOptimizer,
  isPwaInstalled = false,
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
  isSidebarOpen,
  onToggleSidebar,
  activeTheme = 'light',
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
  const [showImportTooltip, setShowImportTooltip] = React.useState(false);

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

  const [headerSearchQuery, setHeaderSearchQuery] = React.useState('');

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = headerSearchQuery.trim();
    if (q) {
      try {
        localStorage.setItem('degreelocker_pending_search', q);
        window.dispatchEvent(new CustomEvent('degreelocker:search', { detail: { query: q } }));
      } catch (err) {}
    }
    setActiveTab('search');
    onSearchClick();
  };

  const topTabs: { id: NavTabType; labelFr: string; labelEn: string; icon: any }[] = [
    { id: 'dashboard', labelFr: 'Tableau de bord', labelEn: 'Dashboard', icon: LayoutGrid },
    { id: 'school_books', labelFr: 'Manuels & Exos', labelEn: 'Textbooks', icon: FileText },
    { id: 'library', labelFr: 'Mes Cours', labelEn: 'My Files', icon: Layers },
    { id: 'search', labelFr: 'Recherche IA', labelEn: 'Search', icon: Search },
    { id: 'flashcards', labelFr: 'Flashcards', labelEn: 'Flashcards', icon: Zap },
    { id: 'quiz', labelFr: 'Quiz & Tests', labelEn: 'Quiz', icon: CheckSquare },
    { id: 'blocknote', labelFr: 'Bloc-Notes', labelEn: 'Blocknote', icon: PenTool },
    { id: 'resumer', labelFr: 'Résumés IA', labelEn: 'Summaries', icon: Sparkles },
    { id: 'bilingual', labelFr: 'Bilingue', labelEn: 'Bilingual', icon: Languages },
    { id: 'database', labelFr: 'Base Locale', labelEn: 'Local DB', icon: HardDrive },
  ];

  return (
    <header 
      data-tauri-drag-region
      onMouseDown={handleHeaderMouseDown}
      className={`px-3 sm:px-6 ${headerThemeClass} flex flex-col sticky top-0 z-20 shadow-xs transition-colors duration-200`}
    >
      
      {/* Top Bar Row - Search Bar, Focus Timer, Actions and Window Controls */}
      <div className="h-16 flex items-center justify-between gap-2 sm:gap-3">
        
        {/* Left: 3-line hamburger menu button + Search bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-xl">
          {/* Circular 3-line button directly controlling the sidebar */}
          <button
            id="btn-toggle-sidebar"
            onClick={onToggleSidebar}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-all active:scale-95 ${
              isSidebarOpen
                ? 'bg-indigo-600 text-white shadow-indigo-600/20 border border-indigo-500'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700'
            }`}
            title={
              isSidebarOpen
                ? (lang === 'fr' ? 'Masquer le menu sur le côté (Ctrl+B)' : 'Hide sidebar (Ctrl+B)')
                : (lang === 'fr' ? 'Afficher le menu sur le côté (Ctrl+B)' : 'Show sidebar (Ctrl+B)')
            }
            aria-label={lang === 'fr' ? 'Afficher ou masquer le menu latéral' : 'Toggle sidebar navigation'}
            aria-expanded={isSidebarOpen}
          >
            <Menu className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Quick Search - Direct input & Command Deck launcher */}
          <form
            onSubmit={handleHeaderSearchSubmit}
            data-no-drag
            onMouseDown={(e) => e.stopPropagation()}
            className={`flex-1 min-w-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all group border ${
              isDarkish
                ? 'bg-slate-800/90 focus-within:bg-slate-800 text-slate-300 border-slate-700/80 focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500'
                : 'bg-slate-100/90 focus-within:bg-white text-slate-700 border-slate-200/80 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'
            }`}
            title={lang === 'fr' ? 'Recherche rapide (Entrée pour chercher)' : 'Quick Search (Enter to search)'}
          >
            <Search className="w-4 h-4 text-indigo-500 transition-colors shrink-0 cursor-pointer" onClick={handleHeaderSearchSubmit} />
            <input
              id="header-quick-search-input"
              type="text"
              data-no-drag
              value={headerSearchQuery}
              onChange={(e) => setHeaderSearchQuery(e.target.value)}
              onFocus={() => {
                // Keep input responsive
              }}
              placeholder={lang === 'fr' 
                ? 'Rechercher cours, notions, quiz...' 
                : 'Search notes, concepts, quiz...'}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium"
            />
            {headerSearchQuery && (
              <button
                type="button"
                data-no-drag
                onClick={(e) => {
                  e.stopPropagation();
                  setHeaderSearchQuery('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            )}
            <button
              type="button"
              data-no-drag
              onClick={onSearchClick}
              className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 hover:text-indigo-400 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0 cursor-pointer"
              title={lang === 'fr' ? 'Ouvrir le pont de commande (Ctrl+K)' : 'Open Command Deck (Ctrl+K)'}
            >
              ⌘K
            </button>
          </form>
        </div>

        {/* Center/Right: Focus Pomodoro Timer & Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Integrated Pomodoro Focus Timer */}
          <FocusPomodoroTimer lang={lang} />

          {/* Degree Unlocker Lite Engine & Optimizer */}
          {onOpenLiteOptimizer && (
            <button
              id="btn-lite-optimizer-topheader"
              onClick={() => {
                soundFx.playClick(920);
                onOpenLiteOptimizer();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/40 text-xs font-black transition-all cursor-pointer shadow-2xs active:scale-95 group"
              title={lang === 'fr' ? 'Optimiseur Degree Unlocker Lite & Systèmes' : 'Degree Unlocker Lite Optimizer & Systems'}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
              <span className="font-mono tracking-tight font-black">LITE ⚡</span>
            </button>
          )}

          {/* Quantum Studio & Focus Soundscape Button */}
          {onOpenSoundHUD && (
            <button
              id="btn-sound-hud-topheader"
              onClick={() => {
                soundFx.playClick(850);
                onOpenSoundHUD();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-amber-500/15 hover:from-amber-500/25 hover:to-indigo-500/25 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-xs font-black transition-all cursor-pointer shadow-2xs active:scale-95 group"
              title={lang === 'fr' ? 'Ouvrir le Studio Quantique (Ondes Alpha, Thêta, Pluie & Synthétiseur)' : 'Open Quantum Focus Audio Studio'}
            >
              <Headphones className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-mono tracking-tight font-black">FLOW 🎧</span>
            </button>
          )}

          {/* Importer Document Button with hover tooltip */}
          <div className="relative">
            <button
              id="btn-import-document-header"
              onClick={onUploadPdf}
              onMouseEnter={() => setShowImportTooltip(true)}
              onMouseLeave={() => setShowImportTooltip(false)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Importer Document' : 'Import Document'}</span>
            </button>

            {/* Rich tooltip on hover */}
            {showImportTooltip && (
              <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-slate-900 text-white rounded-2xl shadow-xl z-50 text-[11px] border border-slate-700 pointer-events-none animate-in fade-in duration-150 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Importer des documents' : 'Import Documents'}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {lang === 'fr' 
                    ? 'Formats pris en charge : PDF, Word (.docx), Scans & Photos de cours, TXT, Markdown avec OCR & extraction IA instantanée.'
                    : 'Supported formats: PDF, Word (.docx), Handwritten Scans, TXT, Markdown with instant AI OCR.'}
                </p>
              </div>
            )}
          </div>

          {/* Install PC App Launcher Button */}
          {onOpenInstallGuide && (
            <button
              id="btn-install-app-topheader"
              onClick={onOpenInstallGuide}
              className={`flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                isPwaInstalled
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
              title={isPwaInstalled ? (lang === 'fr' ? 'Application PC active sur cet appareil' : 'PC Application active on this device') : (lang === 'fr' ? 'Télécharger l\'application PC & Launcher' : 'Download PC Application & Launcher')}
            >
              <Smartphone className={`w-3.5 h-3.5 ${isPwaInstalled ? 'text-emerald-400' : 'text-indigo-200'}`} />
              <span className="hidden md:inline">
                {isPwaInstalled 
                  ? (lang === 'fr' ? 'App PC Active ✅' : 'PC App Active ✅') 
                  : (lang === 'fr' ? 'App PC 💻' : 'PC App 💻')}
              </span>
            </button>
          )}

          {/* Account / User Space Button */}
          {onOpenAuthModal && (
            <button
              id="btn-user-account-header"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer"
              title={currentUser ? currentUser.email : (lang === 'fr' ? 'Espace Compte & Cloud' : 'Account & Cloud')}
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                {currentUser ? (currentUser.displayName?.[0] || currentUser.email?.[0]?.toUpperCase() || 'U') : <User className="w-3 h-3 text-white" />}
              </div>
              <span className="hidden lg:inline truncate max-w-[100px]">
                {currentUser ? (currentUser.displayName || currentUser.email?.split('@')[0]) : (lang === 'fr' ? 'Compte' : 'Account')}
              </span>
            </button>
          )}

          {onOpenSyncManager ? (
            <button
              onClick={onOpenSyncManager}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                isSyncing
                  ? 'bg-amber-500/15 text-amber-500 border-amber-500/30 animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
              title={lang === 'fr' ? 'Gestionnaire de Synchronisation Hors-Ligne (IndexedDB / Cloud)' : 'Offline Sync Manager (IndexedDB / Cloud)'}
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-indigo-500" />
              )}
              <span className="hidden xl:inline">{isSyncing ? 'Sync...' : 'Cloud Sync'}</span>
            </button>
          ) : isSyncing ? (
            <div 
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold animate-pulse"
              title="Syncing..."
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
              <span className="hidden sm:inline">Sync...</span>
            </div>
          ) : (
            <div 
              className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium"
              title="Cloud Sync Active"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{lang === 'fr' ? 'Cloud Sync' : 'Cloud Sync'}</span>
            </div>
          )}
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


