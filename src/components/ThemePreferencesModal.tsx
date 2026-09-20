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
  HardDrive, 
  Key,
  Accessibility,
  ShieldCheck,
  UserCheck
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
      id: 'hardcore',
      nameFr: 'Hardcore mode DegreeUnlocker',
      nameEn: 'Hardcore mode DegreeUnlocker',
      descFr: 'Noir obsidienne et fusain profond optimisé pour poste de travail haute performance.',
      descEn: 'Deep obsidian & charcoal dark mode optimized for high-performance desktop workstation.',
      icon: Monitor,
      colorBg: 'bg-[#050507]',
      colorCard: 'bg-[#0c0d12]',
      colorBorder: 'border-amber-500/40',
    },
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
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
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
                        ? 'border-indigo-600 dark:border-amber-500 bg-indigo-50/50 dark:bg-amber-500/10 shadow-sm' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg ${t.colorBg} flex items-center justify-center border ${t.colorBorder}`}>
                          <Icon className={`w-3.5 h-3.5 ${t.id === 'light' || t.id === 'paper' ? 'text-slate-800' : 'text-indigo-400 dark:text-amber-400'}`} />
                        </div>
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {lang === 'fr' ? t.nameFr : t.nameEn}
                        </span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-amber-400 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {lang === 'fr' ? t.descFr : t.descEn}
                    </p>

                    {/* Color Preview Swatch */}
                    <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className={`w-4 h-4 rounded-full ${t.colorBg} border ${t.colorBorder}`} title="Background" />
                      <div className={`w-4 h-4 rounded-full ${t.colorCard} border border-slate-300 dark:border-slate-700`} title="Card" />
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono capitalize ml-1">{t.id}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. MENU POSITION & LAYOUT (Left Sidebar vs Top Bar) */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-indigo-600 dark:text-amber-400" />
              <span>{lang === 'fr' ? '2. Disposition du Menu & Écran Large' : '2. Menu Position & Screen Real Estate'}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Left Sidebar */}
              <button
                onClick={() => onUpdatePreferences({ menuPosition: 'left' })}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                  preferences.menuPosition === 'left'
                    ? 'border-indigo-600 dark:border-amber-500 bg-indigo-50/50 dark:bg-amber-500/10 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <SidebarIcon className="w-4 h-4 text-indigo-600 dark:text-amber-400" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {lang === 'fr' ? 'Barre Latérale (Gauche)' : 'Left Sidebar'}
                    </span>
                  </div>
                  {preferences.menuPosition === 'left' && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-amber-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
                    ? 'border-indigo-600 dark:border-amber-500 bg-indigo-50/50 dark:bg-amber-500/10 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-indigo-600 dark:text-amber-400" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {lang === 'fr' ? 'Barre Supérieure (Haut)' : 'Top Horizontal Bar'}
                    </span>
                  </div>
                  {preferences.menuPosition === 'top' && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-amber-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {lang === 'fr' 
                    ? 'Libère 100% de la largeur de l\'écran pour vos notes et révisions.' 
                    : 'Frees 100% screen width horizontally for distraction-free view.'}
                </p>
              </button>
            </div>
          </div>

          {/* 3. LANGUAGE SELECTION */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-indigo-600 dark:text-amber-400" />
              <span>{lang === 'fr' ? '3. Langue de l\'Interface' : '3. Interface Language'}</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onUpdatePreferences({ language: 'fr' })}
                className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  preferences.language === 'fr'
                    ? 'border-indigo-600 dark:border-amber-500 bg-indigo-50 dark:bg-amber-500/10 text-indigo-950 dark:text-amber-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🇫🇷</span>
                  <span className="text-xs">Français</span>
                </div>
                {preferences.language === 'fr' && <Check className="w-4 h-4 text-indigo-600 dark:text-amber-400" />}
              </button>

              <button
                onClick={() => onUpdatePreferences({ language: 'en' })}
                className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  preferences.language === 'en'
                    ? 'border-indigo-600 dark:border-amber-500 bg-indigo-50 dark:bg-amber-500/10 text-indigo-950 dark:text-amber-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🇬🇧</span>
                  <span className="text-xs">English</span>
                </div>
                {preferences.language === 'en' && <Check className="w-4 h-4 text-indigo-600 dark:text-amber-400" />}
              </button>
            </div>
          </div>

          {/* 4. GEMINI API KEY (Bring Your Own Key - BYOK) */}
          <div className="space-y-2.5 p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-600 dark:text-amber-400" />
                <span>{lang === 'fr' ? '4. Clé API Gemini Personnelle (BYOK)' : '4. Custom Gemini API Key (BYOK)'}</span>
              </label>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-amber-400 bg-indigo-100 dark:bg-amber-500/20 px-2 py-0.5 rounded-full">
                {lang === 'fr' ? 'Optionnel' : 'Optional'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {lang === 'fr'
                ? 'Utilisez votre propre clé Gemini pour profiter de quotas illimités et de modèles puissants (Gemini 2.5 Pro) sans dépendre des crédits partagés.'
                : 'Provide your own Gemini API key for higher quotas and high-capacity models (Gemini 2.5 Pro) with your own credits.'}
            </p>
            <div className="relative">
              <input
                type="password"
                value={preferences.customGeminiKey || ''}
                onChange={(e) => onUpdatePreferences({ customGeminiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-16"
              />
              {preferences.customGeminiKey && (
                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ customGeminiKey: '' })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-red-500 font-semibold px-1.5 py-0.5"
                >
                  {lang === 'fr' ? 'Effacer' : 'Clear'}
                </button>
              )}
            </div>
          </div>

          {/* 5. SPECIAL PARAMETERS, ACCESSIBILITY ADA & CLAUSES */}
          <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{lang === 'fr' ? '5. Paramètres Spéciaux, Accessibilité & Clauses' : '5. Special Settings, Accessibility & Clauses'}</span>
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-ada-accessibility-menu'));
                  onClose();
                }}
                className="p-2.5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Accessibility className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>{lang === 'fr' ? 'Menu Accessibilité ADA' : 'ADA Accessibility Menu'}</span>
                </div>
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-1.5 py-0.5 rounded">
                  Alt+A
                </span>
              </button>

              <div className="p-2.5 rounded-xl border border-amber-300/60 dark:border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-[11px] leading-snug flex items-start gap-2">
                <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {lang === 'fr'
                    ? 'Petite équipe indépendante : améliorations au jour le jour.'
                    : 'Small independent team: daily continuous improvements.'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => onUpdatePreferences({
                theme: 'light',
                menuPosition: 'left',
                isSidebarCollapsed: false,
                language: 'fr',
              })}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Réinitialiser' : 'Reset Defaults'}</span>
            </button>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono pl-5">
              v6.4.3
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'fr' ? 'Appliquer & Enregistrer' : 'Apply & Save'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
