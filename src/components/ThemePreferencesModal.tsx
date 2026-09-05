import React from 'react';
import { AppTheme, MenuPosition, UIPreferences, AppLanguage } from '../types';
import { 
  Palette, 
  Layout, 
  Sun, 
  Moon, 
  Sparkles, 
  BookOpen, 
  Languages, 
  X, 
  Check, 
  Sliders, 
  Sidebar as SidebarIcon,
  Monitor,
  CheckCircle2,
  Save,
  RotateCcw,
  HardDrive
} from 'lucide-react';

interface ThemePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UIPreferences;
  onUpdatePreferences: (updated: Partial<UIPreferences>) => void;
  onOpenBackup?: () => void;
  lang: AppLanguage;
}

export const ThemePreferencesModal: React.FC<ThemePreferencesModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onOpenBackup,
  lang,
}) => {
  if (!isOpen) return null;

  const themes: { id: AppTheme; nameFr: string; nameEn: string; descFr: string; descEn: string; icon: any; colorBg: string; colorCard: string; colorBorder: string }[] = [
    {
      id: 'light',
      nameFr: 'Clair Académique',
      nameEn: 'Academic Light',
      descFr: 'Contraste optimal pour la lecture de jour et les révisions.',
      descEn: 'Optimal contrast for daytime reading and revision.',
      icon: Sun,
      colorBg: 'bg-slate-100',
      colorCard: 'bg-white',
      colorBorder: 'border-slate-300',
    },
    {
      id: 'dark',
      nameFr: 'Sombre Ardoise',
      nameEn: 'Slate Dark',
      descFr: 'Confort visuel nocturne, faible éblouissement pour les sessions tardives.',
      descEn: 'Night-friendly contrast, low glare for late-night study sessions.',
      icon: Moon,
      colorBg: 'bg-slate-950',
      colorCard: 'bg-slate-900',
      colorBorder: 'border-slate-700',
    },
    {
      id: 'midnight',
      nameFr: 'Minuit Indigo',
      nameEn: 'Midnight Indigo',
      descFr: 'Ambiance profonde bleutée et immersive pour la concentration maximale.',
      descEn: 'Deep indigo immersive focus mode for deep concentration.',
      icon: Sparkles,
      colorBg: 'bg-[#060913]',
      colorCard: 'bg-[#0f172a]',
      colorBorder: 'border-indigo-900',
    },
    {
      id: 'paper',
      nameFr: 'Papier & Cahier Chaud',
      nameEn: 'Warm Paper Journal',
      descFr: 'Teinte sépia chaleureuse imitant le grain du papier et des fiches Bristol.',
      descEn: 'Warm sepia tones mimicking notebook paper & Bristol index cards.',
      icon: BookOpen,
      colorBg: 'bg-[#f6f1e6]',
      colorCard: 'bg-[#fffef9]',
      colorBorder: 'border-[#dfd3c1]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-12 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {lang === 'fr' ? 'Gestionnaire de Thème & Affichage' : 'Theme & Display Manager'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {lang === 'fr' ? 'Préférences sauvegardées sur votre base de données locale' : 'Preferences saved to your local database'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* 1. THEME SELECTION */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-600" />
              <span>{lang === 'fr' ? '1. Thème Visuel de l\'Application' : '1. Visual Application Theme'}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themes.map((t) => {
                const Icon = t.icon;
                const isSelected = preferences.theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onUpdatePreferences({ theme: t.id })}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg ${t.colorBg} flex items-center justify-center border ${t.colorBorder}`}>
                          <Icon className={`w-3.5 h-3.5 ${t.id === 'light' || t.id === 'paper' ? 'text-slate-800' : 'text-indigo-400'}`} />
                        </div>
                        <span className="font-extrabold text-xs text-slate-900">
                          {lang === 'fr' ? t.nameFr : t.nameEn}
                        </span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 leading-tight">
                      {lang === 'fr' ? t.descFr : t.descEn}
                    </p>

                    {/* Color Preview Swatch */}
                    <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                      <div className={`w-4 h-4 rounded-full ${t.colorBg} border ${t.colorBorder}`} title="Background" />
                      <div className={`w-4 h-4 rounded-full ${t.colorCard} border border-slate-300`} title="Card" />
                      <span className="text-[10px] text-slate-400 font-mono capitalize ml-1">{t.id}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. MENU POSITION & LAYOUT (Left Sidebar vs Top Bar) */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-indigo-600" />
              <span>{lang === 'fr' ? '2. Disposition du Menu & Écran Large' : '2. Menu Position & Screen Real Estate'}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Left Sidebar */}
              <button
                onClick={() => onUpdatePreferences({ menuPosition: 'left' })}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                  preferences.menuPosition === 'left'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <SidebarIcon className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-xs text-slate-900">
                      {lang === 'fr' ? 'Barre Latérale (Gauche)' : 'Left Sidebar'}
                    </span>
                  </div>
                  {preferences.menuPosition === 'left' && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  {lang === 'fr' 
                    ? 'Menu vertical repliable à gauche avec accès rapide complet.' 
                    : 'Collapsible vertical menu on the left for quick access.'}
                </p>
              </button>

              {/* Top Navigation */}
              <button
                onClick={() => onUpdatePreferences({ menuPosition: 'top' })}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                  preferences.menuPosition === 'top'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-xs text-slate-900">
                      {lang === 'fr' ? 'Barre Supérieure (Haut)' : 'Top Horizontal Bar'}
                    </span>
                  </div>
                  {preferences.menuPosition === 'top' && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  {lang === 'fr' 
                    ? 'Libère 100% de la largeur de l\'écran pour vos notes et révisions.' 
                    : 'Frees 100% screen width horizontally for distraction-free view.'}
                </p>
              </button>
            </div>
          </div>

          {/* 3. LANGUAGE SELECTION */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-indigo-600" />
              <span>{lang === 'fr' ? '3. Langue de l\'Interface' : '3. Interface Language'}</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onUpdatePreferences({ language: 'fr' })}
                className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  preferences.language === 'fr'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🇫🇷</span>
                  <span className="text-xs">Français</span>
                </div>
                {preferences.language === 'fr' && <Check className="w-4 h-4 text-indigo-600" />}
              </button>

              <button
                onClick={() => onUpdatePreferences({ language: 'en' })}
                className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  preferences.language === 'en'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🇬🇧</span>
                  <span className="text-xs">English</span>
                </div>
                {preferences.language === 'en' && <Check className="w-4 h-4 text-indigo-600" />}
              </button>
            </div>
          </div>

          {/* 4. BACKUP & PROGRESS SECURITY */}
          {onOpenBackup && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shrink-0">
                  <HardDrive className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-white">
                    {lang === 'fr' ? 'Sauvegarde de la Progression (.JSON)' : 'Study Progress Backup (.JSON)'}
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'fr' ? 'Exportez séries, quiz et lexique.' : 'Export streaks, quizzes, and vocabulary.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenBackup();
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                {lang === 'fr' ? 'Ouvrir' : 'Open'}
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => onUpdatePreferences({
              theme: 'light',
              menuPosition: 'left',
              isSidebarCollapsed: false,
              language: 'fr',
            })}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Réinitialiser' : 'Reset Defaults'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'fr' ? 'Appliquer & Enregistrer' : 'Apply & Save'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
