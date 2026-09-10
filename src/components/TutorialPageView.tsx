import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  ArrowLeft,
  Search,
  PenTool,
  CheckCircle2,
  Sparkles,
  Zap,
  HelpCircle,
  FileText,
  Keyboard,
  Layers,
  ArrowRight,
  ShieldCheck,
  Languages,
  RotateCcw
} from 'lucide-react';
import { AppLanguage, AppTheme } from '../types';

interface TutorialPageViewProps {
  onBack: () => void;
  onNavigateTab: (tab: any) => void;
  lang?: AppLanguage;
  activeTheme?: AppTheme;
}

export const TutorialPageView: React.FC<TutorialPageViewProps> = ({
  onBack,
  onNavigateTab,
  lang = 'fr',
  activeTheme = 'dark',
}) => {
  const isFr = lang === 'fr';
  const [activeCategory, setActiveCategory] = useState<'overview' | 'textbooks' | 'notion' | 'notes' | 'anki' | 'shortcuts'>('overview');

  const categories = [
    { id: 'overview', label: isFr ? '1. Prise en Main & Nouveautés' : '1. Overview & Changelog', icon: Sparkles },
    { id: 'textbooks', label: isFr ? '2. Manuels Scolaires & Exercices' : '2. Textbooks & Practice', icon: BookOpen },
    { id: 'notion', label: isFr ? '3. Espaces Notion Spécialisés' : '3. Notion Workspaces', icon: Languages },
    { id: 'notes', label: isFr ? '4. Bloc-notes Cornell & Recopie' : '4. Cornell Blocknote', icon: PenTool },
    { id: 'anki', label: isFr ? '5. Flashcards & Répétition Espacée' : '5. Anki & Flashcards', icon: Zap },
    { id: 'shortcuts', label: isFr ? '6. Clavier AZERTY/QWERTY & Raccourcis' : '6. Keyboard & Shortcuts', icon: Keyboard },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200 pb-16">
      
      {/* Top Breadcrumb & Page Banner */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isFr ? 'Retour au tableau de bord' : 'Back to Dashboard'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {isFr ? 'Guide Officiel • Version 6.5 à jour' : 'Official Guide • v6.5 Updated'}
          </span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-800/50 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-xs font-extrabold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFr ? 'Tutoriel Interactif de l\'Académie' : 'Interactive Academy Tutorial'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isFr ? 'Maîtriser Degree Unlocker Academy de A à Z' : 'Master Degree Unlocker Academy'}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
              {isFr
                ? 'Apprenez à combiner les manuels scolaires officiels, les espaces Notion interactifs, le bloc-notes manuscrit et le système de révision espacée pour maximiser vos résultats scolaires.'
                : 'Learn how to leverage official textbooks, interactive Notion workspaces, Cornell handwriting notes, and spaced repetition to excel academically.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateTab('school_books')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>{isFr ? 'Explorer les Manuels' : 'Explore Textbooks'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('blocknote')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <PenTool className="w-4 h-4" />
              <span>{isFr ? 'Ouvrir le Bloc-Notes' : 'Open Notebook'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-thin">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* CATEGORY 1: OVERVIEW & CHANGELOG */}
      {activeCategory === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Pilier 1</span>
                <h3 className="text-base font-extrabold text-white">{isFr ? '100% Local & Hors-Ligne' : '100% Local & Offline'}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isFr
                    ? 'Vos fiches, cours, résumés et progression restent stockés directement sur votre machine. Aucune fuite de données.'
                    : 'All your notes, flashcards, and progress remain securely stored on your device.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-semibold text-indigo-300">
                🔒 {isFr ? 'Stockage IndexedDB chiffré' : 'IndexedDB encrypted'}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Pilier 2</span>
                <h3 className="text-base font-extrabold text-white">{isFr ? 'Méthode Cornell & Recopie' : 'Cornell & Handwriting'}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isFr
                    ? 'Un bloc-notes formaté pour répliquer le lignage Séyès, les repères de marge et le code couleur pour vos vrais cahiers.'
                    : 'A structured notebook mimicking real school paper ruling with dedicated cue margins.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-semibold text-amber-300">
                ✍️ {isFr ? 'Mémorisation gestuelle' : 'Kinesthetic memory'}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Pilier 3</span>
                <h3 className="text-base font-extrabold text-white">{isFr ? 'Algorithme Leitner / Anki' : 'Leitner / Anki Spaced Repetition'}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isFr
                    ? 'Des flashcards intelligentes qui s\'adaptent à votre taux de rétention pour réviser juste avant d\'oublier.'
                    : 'Intelligent flashcards that automatically adapt review intervals based on difficulty.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-semibold text-emerald-300">
                🧠 {isFr ? 'Courbe d\'Ebbinghaus optimisée' : 'Optimized forgetting curve'}
              </div>
            </div>
          </div>

          {/* Version updates changelog */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isFr ? 'Historique des dernières mises à jour (v6.5)' : 'Latest Update Changelog (v6.5)'}</span>
            </h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300">
                    {isFr ? '✦ Nouveau Menu Plein Écran & Hub Visuel' : '✦ Full-Screen Command Hub'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">v6.5</span>
                </div>
                <p className="text-xs text-slate-300">
                  {isFr
                    ? 'Ouverture instantanée de l\'ensemble des catégories et options de l\'application en plein écran avec barre de recherche globale.'
                    : 'Instant access to all modules, Notion workspaces, and pages in a full-screen deck.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">
                    {isFr ? '✦ Recherche Unifiée Manuels & Espaces Notion' : '✦ Unified Textbooks & Notion Search'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">v6.5</span>
                </div>
                <p className="text-xs text-slate-300">
                  {isFr
                    ? 'Recherchez simultanément dans les manuels scolaires et les espaces Notion de langues, français et philosophie avec anneaux de progression circulaire.'
                    : 'Search across books and Notion workspaces simultaneously with circular progress rings.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300">
                    {isFr ? '✦ Clavier AZERTY/QWERTY & Micro-Rédaction' : '✦ AZERTY/QWERTY & Micro-Writing'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">v6.5</span>
                </div>
                <p className="text-xs text-slate-300">
                  {isFr
                    ? 'Entraînez-vous à rédiger des réponses courtes et synthétiques sous contrainte avec barre d\'accents adaptée à votre disposition de clavier.'
                    : 'Practice micro-writing with real-time target constraints and dedicated accent helpers.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 2: TEXTBOOKS */}
      {activeCategory === 'textbooks' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>{isFr ? 'Comment utiliser la Bibliothèque de Manuels Scolaires' : 'How to Use the Textbooks Library'}</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isFr
              ? 'La bibliothèque rassemble les manuels de Mathématiques, Physique-Chimie, SVT et Histoire-Géo du lycée. Chaque manuel contient ses chapitres officiels, les formules essentielles et une batterie d\'exercices résolus pas à pas.'
              : 'The textbook library contains complete official high school curriculum materials with step-by-step solved problems.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-extrabold text-amber-300 block">1. Suivi de révision circulaire</span>
              <p className="text-xs text-slate-300">
                {isFr
                  ? 'Chaque manuel affiche un anneau circulaire qui mesure précisément le pourcentage d\'exercices que vous avez validés.'
                  : 'A circular progress ring shows exactly how much material has been reviewed and solved.'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-extrabold text-indigo-300 block">2. Export direct en Fiche Cahier</span>
              <p className="text-xs text-slate-300">
                {isFr
                  ? 'Cliquez sur "Exporter en Fiche Cahier" pour transférer n\'importe quel énoncé et corrigé dans le Bloc-notes pour le recopier à la main.'
                  : 'Export any exercise and worked solution straight into the Cornell blocknote for handwritten practice.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 3: NOTION WORKSPACES */}
      {activeCategory === 'notion' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Languages className="w-5 h-5 text-emerald-400" />
            <span>{isFr ? 'Espaces Notion Spécialisés (Espagnol, Allemand, Latin, Français, Philo)' : 'Specialized Notion Workspaces'}</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isFr
              ? 'Les espaces Notion proposent des fiches de synthèse interactives dédiées aux matières littéraires et linguistiques : règles de grammaire, déclinaisons, repères philosophiques et méthodes de dissertation.'
              : 'Interactive Notion-style workspaces tailored for humanities and languages.'}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {['Français 2nde', 'Philosophie Tale', 'Espagnol LVB/LVA', 'Allemand LVB/LVA', 'Latin & Antiquité'].map((subj) => (
              <span key={subj} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700">
                {subj}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORY 4: CORNELL NOTES */}
      {activeCategory === 'notes' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <PenTool className="w-5 h-5 text-amber-400" />
            <span>{isFr ? 'Le Bloc-notes Cornell : Votre pont vers le papier' : 'Cornell Notebook: Kinesthetic Bridge'}</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isFr
              ? 'Le bloc-notes ne remplace pas votre vrai cahier : il le guide ! Grâce à la marge gauche pour les mots-clés, la zone centrale pour le développement et la zone basse pour la synthèse en 2 phrases, vous gagnez un temps précieux lors de vos recopies.'
              : 'The Cornell notebook provides visual cues and guidelines to optimize physical handwriting notes.'}
          </p>
        </div>
      )}

      {/* CATEGORY 5: ANKI & FLASHCARDS */}
      {activeCategory === 'anki' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <span>{isFr ? 'Répétition Espacée : Ne plus jamais oublier' : 'Spaced Repetition: Long-Term Retention'}</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isFr
              ? 'L\'algorithme classe vos fiches mémo en 4 boîtes. Les cartes difficiles reviennent tous les jours, tandis que les cartes maîtrisées ne sont revues que tous les 14 jours.'
              : 'Four-box Leitner system ensuring difficult cards are practiced daily while mastered ones are refreshed periodically.'}
          </p>
        </div>
      )}

      {/* CATEGORY 6: KEYBOARD & SHORTCUTS */}
      {activeCategory === 'shortcuts' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-indigo-400" />
            <span>{isFr ? 'Raccourcis Clavier & Modes AZERTY / QWERTY' : 'Keyboard Shortcuts & Layouts'}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300">{isFr ? 'Ouvrir la Recherche Rapide' : 'Quick Search'}</span>
              <kbd className="px-2 py-1 text-[11px] font-mono bg-slate-800 text-indigo-300 rounded border border-slate-700">Ctrl + K</kbd>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300">{isFr ? 'Ouvrir le Grand Menu Plein Écran' : 'Toggle Command Deck'}</span>
              <kbd className="px-2 py-1 text-[11px] font-mono bg-slate-800 text-indigo-300 rounded border border-slate-700">Ctrl + B</kbd>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300">{isFr ? 'Fermer la vue ou modale active' : 'Close Active Modal'}</span>
              <kbd className="px-2 py-1 text-[11px] font-mono bg-slate-800 text-indigo-300 rounded border border-slate-700">Échap / Esc</kbd>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300">{isFr ? 'Accents rapides (é, è, à, ç, ñ)' : 'Quick Accents'}</span>
              <span className="text-xs font-mono text-amber-300">{isFr ? 'Boutons en 1-clic' : '1-click toolbar'}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
