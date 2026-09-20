import React from 'react';
import {
  FileText,
  Award,
  Search,
  BookOpen,
  FolderOpen,
  PlusCircle,
  RefreshCw,
  Sparkles,
  Layers
} from 'lucide-react';
import { AppLanguage } from '../types';

export type EmptyStateType =
  | 'no-documents'
  | 'no-degrees'
  | 'search-no-results'
  | 'no-flashcards'
  | 'no-history'
  | 'error';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  lang?: AppLanguage;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  lang = 'fr',
  className = '',
}) => {
  const isFr = lang === 'fr';

  const configs: Record<
    EmptyStateType,
    {
      icon: React.ComponentType<{ className?: string }>;
      colorBg: string;
      colorIcon: string;
      colorBorder: string;
      defaultTitle: string;
      defaultDesc: string;
      defaultAction?: string;
    }
  > = {
    'no-documents': {
      icon: BookOpen,
      colorBg: 'bg-indigo-950/40',
      colorIcon: 'text-indigo-400',
      colorBorder: 'border-indigo-500/30',
      defaultTitle: isFr ? 'Votre bibliothèque académique est prête' : 'Your academic library is ready',
      defaultDesc: isFr
        ? 'Créez votre première fiche de cours ou importez un document pour débuter vos révisions interactives.'
        : 'Create your first course note or import a document to start interactive revisions.',
      defaultAction: isFr ? 'Créer une fiche' : 'Create Note',
    },
    'no-degrees': {
      icon: Award,
      colorBg: 'bg-amber-950/40',
      colorIcon: 'text-amber-400',
      colorBorder: 'border-amber-500/30',
      defaultTitle: isFr ? 'Débloquez votre premier degré académique' : 'Unlock your first academic degree',
      defaultDesc: isFr
        ? 'Chaque session de révision, flashcard mémorisée et quiz validé vous rapproche du grade supérieur !'
        : 'Every revision session, mastered flashcard, and passed quiz moves you closer to the next honor rank!',
      defaultAction: isFr ? 'Lancer une révision' : 'Start Revision',
    },
    'search-no-results': {
      icon: Search,
      colorBg: 'bg-slate-900',
      colorIcon: 'text-slate-400',
      colorBorder: 'border-slate-800',
      defaultTitle: isFr ? 'Aucun résultat trouvé' : 'No results found',
      defaultDesc: isFr
        ? 'Vérifiez l\'orthographe ou essayez d\'autres mots-clés pour retrouver vos fiches.'
        : 'Check your spelling or try different keywords to find your documents.',
      defaultAction: isFr ? 'Effacer la recherche' : 'Clear search',
    },
    'no-flashcards': {
      icon: Layers,
      colorBg: 'bg-emerald-950/40',
      colorIcon: 'text-emerald-400',
      colorBorder: 'border-emerald-500/30',
      defaultTitle: isFr ? 'Aucune flashcard dans ce paquet' : 'No flashcards in this deck',
      defaultDesc: isFr
        ? 'Générez des cartes de répétition espacée (SRS) à partir de vos cours pour mémoriser sans effort.'
        : 'Generate spaced repetition (SRS) flashcards from your notes to memorize effortlessly.',
      defaultAction: isFr ? 'Générer des cartes' : 'Generate cards',
    },
    'no-history': {
      icon: FolderOpen,
      colorBg: 'bg-purple-950/40',
      colorIcon: 'text-purple-400',
      colorBorder: 'border-purple-500/30',
      defaultTitle: isFr ? 'Historique vierge' : 'No history yet',
      defaultDesc: isFr
        ? 'Vos récentes sessions de travail, quiz et révisions s\'afficheront ici automatiquement.'
        : 'Your recent revision sessions, quizzes, and notes will appear here automatically.',
    },
    error: {
      icon: RefreshCw,
      colorBg: 'bg-rose-950/40',
      colorIcon: 'text-rose-400',
      colorBorder: 'border-rose-500/30',
      defaultTitle: isFr ? 'Un imprévu est survenu' : 'Something went wrong',
      defaultDesc: isFr
        ? 'Impossible de charger ces éléments. Vos données locales restent sécurisées.'
        : 'Unable to load these items. Your local data remains safe.',
      defaultAction: isFr ? 'Réessayer' : 'Retry',
    },
  };

  const current = configs[type];
  const Icon = current.icon;
  const displayTitle = title || current.defaultTitle;
  const displayDesc = description || current.defaultDesc;
  const displayAction = actionLabel || current.defaultAction;

  return (
    <div
      role="status"
      className={`w-full p-8 sm:p-12 rounded-3xl border ${current.colorBorder} ${current.colorBg} flex flex-col items-center justify-center text-center space-y-4 my-4 animate-in fade-in duration-200 ${className}`}
    >
      <div className={`p-4 rounded-2xl bg-slate-900/90 border ${current.colorBorder} ${current.colorIcon} shadow-md`}>
        <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
      </div>

      <div className="space-y-1.5 max-w-md">
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {displayTitle}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {displayDesc}
        </p>
      </div>

      {(onAction || onSecondaryAction) && (
        <div className="flex items-center gap-3 pt-2 flex-wrap justify-center">
          {onAction && displayAction && (
            <button
              onClick={onAction}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {displayAction}
            </button>
          )}

          {onSecondaryAction && secondaryActionLabel && (
            <button
              onClick={onSecondaryAction}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer focus:ring-2 focus:ring-slate-500 focus:outline-none"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
