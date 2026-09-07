import React from 'react';
import { NavTabType } from './Sidebar';
import { AppLanguage, AppTheme } from '../types';
import { 
  LayoutGrid, 
  FileText, 
  Layers, 
  CheckSquare, 
  PenTool, 
  Sparkles,
  Upload,
  Cloud,
  Menu
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  onOpenUpload: () => void;
  onOpenOneDrive: () => void;
  onOpenMenu: () => void;
  lang?: AppLanguage;
  activeTheme?: AppTheme;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenOneDrive,
  onOpenMenu,
  lang = 'fr',
  activeTheme = 'light',
}) => {
  const isDark = activeTheme === 'dark' || activeTheme === 'midnight';
  const isPaper = activeTheme === 'paper';

  const navClass = isPaper
    ? 'bg-[#2b251f]/95 border-t border-[#453b31] text-amber-200'
    : isDark
    ? 'bg-slate-950/95 border-t border-slate-800 text-slate-300'
    : 'bg-white/95 border-t border-slate-200 text-slate-700';

  const tabs: { id: NavTabType; label: string; icon: any; color: string }[] = [
    { id: 'dashboard', label: lang === 'fr' ? 'Accueil' : 'Home', icon: LayoutGrid, color: 'text-blue-500' },
    { id: 'library', label: lang === 'fr' ? 'Cours' : 'Files', icon: FileText, color: 'text-emerald-500' },
    { id: 'flashcards', label: 'Flashcards', icon: Layers, color: 'text-rose-500' },
    { id: 'quiz', label: 'Quiz', icon: CheckSquare, color: 'text-teal-500' },
    { id: 'blocknote', label: lang === 'fr' ? 'Cahier' : 'Notes', icon: PenTool, color: 'text-amber-500' },
  ];

  return (
    <nav 
      className={`fixed bottom-0 inset-x-0 z-30 md:hidden backdrop-blur-md px-2 py-1.5 flex items-center justify-around shadow-lg transition-colors duration-200 pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))] ${navClass}`}
      aria-label="Navigation Mobile"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative cursor-pointer min-w-[50px] ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''}`}>
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : ''}`} />
            </div>
            <span className="text-[10px] tracking-tight truncate max-w-[54px]">
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            )}
          </button>
        );
      })}

      {/* Quick OneDrive Sync Button on Mobile */}
      <button
        onClick={onOpenOneDrive}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-sky-600 dark:text-sky-400 hover:text-sky-700 transition-all cursor-pointer min-w-[50px]"
        title="OneDrive Cloud"
      >
        <div className="p-1 rounded-lg bg-sky-50 dark:bg-sky-950/50">
          <Cloud className="w-4 h-4 text-sky-500" />
        </div>
        <span className="text-[10px] tracking-tight font-medium">
          OneDrive
        </span>
      </button>

      {/* Menu Drawer Toggle */}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer min-w-[48px]"
        title={lang === 'fr' ? 'Plus de rubriques' : 'More tabs'}
      >
        <div className="p-1 rounded-lg">
          <Menu className="w-4 h-4" />
        </div>
        <span className="text-[10px] tracking-tight font-medium">
          {lang === 'fr' ? 'Menu' : 'More'}
        </span>
      </button>
    </nav>
  );
};
