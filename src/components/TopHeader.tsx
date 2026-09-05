import React from 'react';
import { AppLanguage, AppTheme, MenuPosition, UIPreferences } from '../types';
import { NavTabType } from './Sidebar';
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
  Keyboard
} from 'lucide-react';

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
  onOpenKeyboardShortcuts?: () => void;
  currentUser?: any;
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
  onOpenKeyboardShortcuts,
  currentUser,
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
    <header className={`px-3 sm:px-6 ${headerThemeClass} flex flex-col sticky top-0 z-20 shadow-xs transition-colors duration-200`}>
      
      {/* Top Bar Row */}
      <div className="h-16 flex items-center justify-between gap-2 sm:gap-3">
        
        {/* Left: Mobile hamburger menu + Sidebar toggle if collapsed + Search bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl">
          {/* Mobile hamburger menu toggle */}
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 md:hidden flex items-center justify-center shrink-0 cursor-pointer"
              title={lang === 'fr' ? 'Menu de navigation' : 'Navigation menu'}
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

          {/* Quick Search */}
          <button
            onClick={onSearchClick}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all group border ${
              isDarkish
                ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-500 border-slate-200/80'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search className="w-4 h-4 text-indigo-500 transition-colors shrink-0" />
              <span className="truncate">
                {lang === 'fr' 
                  ? 'Rechercher cours, fiches flashcards, questions...' 
                  : 'Search notes, flashcards, questions...'}
              </span>
            </div>
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Action Controls: High Visibility Import & Language & Theme */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 overflow-x-auto no-scrollbar max-w-[65vw] md:max-w-none pb-1 sm:pb-0 flex-nowrap">
          
          {/* High-Visibility Prominent Import Button */}
          <button
            onClick={onUploadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs transition-all shadow-sm border border-amber-300/60 cursor-pointer"
            title="Importer un fichier (PDF, Word, Excel, Docs)"
          >
            <Upload className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span className="tracking-tight">{lang === 'fr' ? '📥 IMPORTER' : '📥 IMPORT'}</span>
          </button>

          {/* Photo Notes Scanner (Webcam / Smartphone) */}
          {onOpenPhotoScanner && (
            <button
              onClick={onOpenPhotoScanner}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all shadow-xs border border-purple-400/40 cursor-pointer"
              title={lang === 'fr' ? 'Photo de notes manuscrites (Caméra / Fichier)' : 'Snap handwritten notes (Camera / Upload)'}
            >
              <Camera className="w-4 h-4 text-amber-300 stroke-[2.5]" />
              <span className="tracking-tight hidden sm:inline">{lang === 'fr' ? '📷 PHOTO NOTES' : '📷 PHOTO NOTES'}</span>
            </button>
          )}

          {/* Cross-Device Phone ↔ PC Sync Account */}
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer border ${
                currentUser
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300/50'
                  : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-300/50'
              }`}
              title={lang === 'fr' ? 'Liaison Téléphone ↔ Ordinateur & Compte Firestore' : 'Phone ↔ PC Sync & Firestore Account'}
            >
              <Smartphone className={`w-4 h-4 ${currentUser ? 'text-emerald-500' : 'text-indigo-500'}`} />
              <span className="hidden lg:inline">
                {currentUser 
                  ? (currentUser.displayName ? currentUser.displayName.split(' ')[0] : (lang === 'fr' ? 'Connecté' : 'Connected')) 
                  : (lang === 'fr' ? 'Sync Mobile' : 'Sync Mobile')}
              </span>
            </button>
          )}

          {/* Quick New Note / Flashcard */}
          <button
            onClick={onNewNote}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer border border-indigo-400/40"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{lang === 'fr' ? '+ Note / Fiche' : '+ Note / Card'}</span>
          </button>

          {/* Socratic Study Coach (Anti-Triche) */}
          {onOpenCoach && (
            <button
              id="btn-open-socratic-coach"
              onClick={onOpenCoach}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300/40 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
              title={lang === 'fr' ? 'Tuteur Socratique IA (Méthode de Réflexion)' : 'Socratic Study Coach'}
            >
              <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="hidden md:inline">{lang === 'fr' ? 'Coach IA' : 'AI Coach'}</span>
            </button>
          )}

          {/* Audio Study Playlist */}
          <button
            onClick={onOpenPlaylists}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-700 dark:text-pink-300 border border-pink-300/40 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
            title={lang === 'fr' ? 'Ambiance sonore & Bruit Blanc' : 'Soundscapes & Ambient Audio'}
          >
            <Headphones className="w-4 h-4 text-pink-500" />
            <span className="hidden md:inline">{lang === 'fr' ? 'Audio Focus' : 'Focus Audio'}</span>
          </button>

          {/* High-Visibility Language Switcher Button */}
          <button
            onClick={onToggleLang}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title={lang === 'fr' ? 'Langue: Français (Cliquer pour English)' : 'Language: English (Click for French)'}
          >
            <Languages className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{lang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}</span>
          </button>

          {/* 1-Click Global Theme Toggle (Light / Dark) */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center justify-center transition-all cursor-pointer"
            title={
              isDarkish
                ? (lang === 'fr' ? 'Basculer en Mode Clair' : 'Switch to Light Mode')
                : (lang === 'fr' ? 'Basculer en Mode Sombre' : 'Switch to Dark Mode')
            }
          >
            {isDarkish ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Theme & Layout Preferences Manager Trigger */}
          <button
            onClick={onOpenPreferences}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center justify-center transition-all cursor-pointer"
            title={lang === 'fr' ? 'Gestionnaire de Thème & Affichage' : 'Theme & Layout Settings'}
          >
            <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </button>

          {/* Study Progress Backup & Export Quick Action */}
          {onOpenBackup && (
            <button
              onClick={onOpenBackup}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center justify-center transition-all cursor-pointer"
              title={lang === 'fr' ? 'Sauvegarde & Sécurité de Progression (.JSON)' : 'Study Progress Backup (.JSON)'}
            >
              <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>
          )}

          {/* Global Keyboard Shortcuts Guide Button */}
          {onOpenKeyboardShortcuts && (
            <button
              onClick={onOpenKeyboardShortcuts}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center justify-center transition-all cursor-pointer"
              title={lang === 'fr' ? 'Raccourcis Clavier (Tapez ? ou Ctrl+K)' : 'Keyboard Shortcuts (Press ? or Ctrl+K)'}
            >
              <Keyboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </button>
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

