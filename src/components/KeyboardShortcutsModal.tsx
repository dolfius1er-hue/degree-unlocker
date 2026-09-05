import React from 'react';
import { AppLanguage } from '../types';
import { 
  Keyboard, 
  Search, 
  Plus, 
  Upload, 
  PenTool, 
  Layers, 
  CheckSquare, 
  SunMoon, 
  X, 
  Globe, 
  Sparkles,
  BookOpen,
  LayoutGrid,
  Bot,
  Camera
} from 'lucide-react';

interface ShortcutItem {
  keys: string[];
  descriptionFr: string;
  descriptionEn: string;
  category: 'navigation' | 'creation' | 'study' | 'system';
  action?: () => void;
  icon: any;
}

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  onTriggerSearch?: () => void;
  onTriggerNewNote?: () => void;
  onTriggerUploadPdf?: () => void;
  onTriggerBlocknote?: () => void;
  onTriggerFlashcards?: () => void;
  onTriggerQuiz?: () => void;
  onTriggerLibrary?: () => void;
  onTriggerDashboard?: () => void;
  onTriggerThemeToggle?: () => void;
  onTriggerCoach?: () => void;
  onTriggerPhotoScanner?: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  lang = 'fr',
  onTriggerSearch,
  onTriggerNewNote,
  onTriggerUploadPdf,
  onTriggerBlocknote,
  onTriggerFlashcards,
  onTriggerQuiz,
  onTriggerLibrary,
  onTriggerDashboard,
  onTriggerThemeToggle,
  onTriggerCoach,
  onTriggerPhotoScanner,
}) => {
  if (!isOpen) return null;

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts: ShortcutItem[] = [
    // Creation & Ingestion
    {
      keys: [modKey, 'N'],
      descriptionFr: 'Créer une nouvelle note de cours',
      descriptionEn: 'Create a new study note',
      category: 'creation',
      action: onTriggerNewNote,
      icon: Plus,
    },
    {
      keys: [modKey, 'U'],
      descriptionFr: 'Importer un document (PDF, Word, Excel)',
      descriptionEn: 'Upload document (PDF, Word, Excel)',
      category: 'creation',
      action: onTriggerUploadPdf,
      icon: Upload,
    },
    {
      keys: [modKey, 'Shift', 'P'],
      descriptionFr: 'Scanner des notes manuscrites par photo',
      descriptionEn: 'Scan handwritten notes via photo',
      category: 'creation',
      action: onTriggerPhotoScanner,
      icon: Camera,
    },

    // Navigation & Search
    {
      keys: [modKey, 'K'],
      descriptionFr: 'Ouvrir la recherche IA sémantique',
      descriptionEn: 'Open AI semantic search',
      category: 'navigation',
      action: onTriggerSearch,
      icon: Search,
    },
    {
      keys: [modKey, '1'],
      descriptionFr: 'Aller au Tableau de bord',
      descriptionEn: 'Go to Dashboard',
      category: 'navigation',
      action: onTriggerDashboard,
      icon: LayoutGrid,
    },
    {
      keys: [modKey, '2'],
      descriptionFr: 'Ouvrir la bibliothèque de cours',
      descriptionEn: 'Open Notes Library',
      category: 'navigation',
      action: onTriggerLibrary,
      icon: BookOpen,
    },
    {
      keys: [modKey, 'B'],
      descriptionFr: 'Ouvrir le Cahier Blocknote Cornell',
      descriptionEn: 'Open Cornell Blocknote',
      category: 'study',
      action: onTriggerBlocknote,
      icon: PenTool,
    },
    {
      keys: [modKey, 'Shift', 'F'],
      descriptionFr: 'Aller aux Flashcards & Répétition Espacée',
      descriptionEn: 'Go to Spaced Repetition Flashcards',
      category: 'study',
      action: onTriggerFlashcards,
      icon: Layers,
    },
    {
      keys: [modKey, 'Shift', 'Q'],
      descriptionFr: 'Générer ou réviser avec un Quiz IA',
      descriptionEn: 'Take or generate an AI Quiz',
      category: 'study',
      action: onTriggerQuiz,
      icon: CheckSquare,
    },
    {
      keys: [modKey, 'Shift', 'C'],
      descriptionFr: 'Ouvrir le Tuteur Socratique IA',
      descriptionEn: 'Open Socratic AI Coach',
      category: 'study',
      action: onTriggerCoach,
      icon: Bot,
    },

    // System & Display
    {
      keys: [modKey, 'Shift', 'D'],
      descriptionFr: 'Basculer le Thème (Clair / Sombre)',
      descriptionEn: 'Toggle Theme (Light / Dark)',
      category: 'system',
      action: onTriggerThemeToggle,
      icon: SunMoon,
    },
    {
      keys: ['?'],
      descriptionFr: 'Afficher ce guide des raccourcis',
      descriptionEn: 'Show this keyboard shortcuts guide',
      category: 'system',
      icon: Keyboard,
    },
    {
      keys: ['Esc'],
      descriptionFr: 'Fermer la boîte de dialogue active',
      descriptionEn: 'Close active modal / overlay',
      category: 'system',
      action: onClose,
      icon: X,
    },
  ];

  const categories = [
    { id: 'creation', labelFr: 'Création & Documents', labelEn: 'Creation & Documents' },
    { id: 'navigation', labelFr: 'Navigation & Recherche', labelEn: 'Navigation & Search' },
    { id: 'study', labelFr: 'Outils d’Étude & Révision', labelEn: 'Study & Revision Tools' },
    { id: 'system', labelFr: 'Interface & Système', labelEn: 'Interface & System' },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-12 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {lang === 'fr' ? 'Raccourcis Clavier Globaux' : 'Global Keyboard Shortcuts'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'fr'
                  ? 'Naviguez et créez à la vitesse de l’éclair partout dans l’application.'
                  : 'Navigate and create instantly anywhere in the application.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list grouped by category */}
        <div className="p-6 overflow-y-auto space-y-6">
          {categories.map((cat) => {
            const items = shortcuts.filter((s) => s.category === cat.id);
            if (items.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {lang === 'fr' ? cat.labelFr : cat.labelEn}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {items.map((item, idx) => {
                    const IconComp = item.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (item.action) {
                            item.action();
                            onClose();
                          }
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all ${
                          item.action ? 'cursor-pointer group' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            <IconComp className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-950 dark:group-hover:text-indigo-200">
                            {lang === 'fr' ? item.descriptionFr : item.descriptionEn}
                          </span>
                        </div>

                        {/* Keys Badge */}
                        <div className="flex items-center gap-1">
                          {item.keys.map((k, kIdx) => (
                            <kbd
                              key={kIdx}
                              className="px-2 py-1 text-[11px] font-mono font-bold rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs group-hover:border-indigo-300 dark:group-hover:border-indigo-600"
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              {lang === 'fr'
                ? 'Astuce : Tapez "?" n’importe où pour réouvrir ce menu.'
                : 'Tip: Press "?" anywhere to reopen this shortcuts sheet.'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            {lang === 'fr' ? 'Fermer' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
