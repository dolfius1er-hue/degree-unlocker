import React, { useState, useMemo } from 'react';
import { CURRICULUM_EXERCISES_DATABASE, CurriculumGeneratedExercise } from '../data/curriculumExercisesData';
import { AppLanguage, AppTheme } from '../types';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  HelpCircle, 
  Bookmark, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Award, 
  Check, 
  FileText, 
  Layers, 
  Lightbulb, 
  Zap,
  Filter,
  Flame,
  ChevronRight,
  Languages
} from 'lucide-react';

interface TextbookWorkoutEngineProps {
  lang?: AppLanguage;
  activeTheme?: AppTheme;
  onOpenInBlocknote?: (title: string, subject: string, content: string) => void;
  onNavigateToLanguage?: (langId: 'espagnol' | 'allemand' | 'antiquite') => void;
}

export const TextbookWorkoutEngine: React.FC<TextbookWorkoutEngineProps> = ({
  lang = 'fr',
  activeTheme = 'light',
  onOpenInBlocknote,
  onNavigateToLanguage
}) => {
  const isFr = lang === 'fr';

  // Filters
  const [selectedGrade, setSelectedGrade] = useState<'all' | 'seconde' | 'premiere' | 'terminale'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'accessible' | 'standard_bac' | 'approfondissement'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active workout exercise
  const [activeExerciseId, setActiveExerciseId] = useState<string>(CURRICULUM_EXERCISES_DATABASE[0]?.id || '');
  const [showHintIndex, setShowHintIndex] = useState<number>(-1);
  const [showFullSolution, setShowFullSolution] = useState<boolean>(false);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [starredExercises, setStarredExercises] = useState<Record<string, boolean>>({});

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return CURRICULUM_EXERCISES_DATABASE.filter((exo) => {
      if (selectedGrade !== 'all' && exo.gradeLevel !== selectedGrade) return false;
      if (selectedSubject !== 'all' && !(exo.subject || '').toLowerCase().includes(selectedSubject.toLowerCase())) return false;
      if (selectedDifficulty !== 'all' && exo.difficulty !== selectedDifficulty) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = (exo.chapterTitle || '').toLowerCase().includes(query);
        const matchTextbook = (exo.textbookCollection || '').toLowerCase().includes(query);
        const matchQuestion = (exo.question || '').toLowerCase().includes(query);
        const matchSubject = (exo.subject || '').toLowerCase().includes(query);
        if (!matchTitle && !matchTextbook && !matchQuestion && !matchSubject) return false;
      }
      return true;
    });
  }, [selectedGrade, selectedSubject, selectedDifficulty, searchQuery]);

  // Current active exercise
  const currentExercise = useMemo(() => {
    return CURRICULUM_EXERCISES_DATABASE.find(e => e.id === activeExerciseId) || filteredExercises[0] || CURRICULUM_EXERCISES_DATABASE[0];
  }, [activeExerciseId, filteredExercises]);

  const toggleComplete = (id: string) => {
    setCompletedExercises(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleStarred = (id: string) => {
    setStarredExercises(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Subjects available across curriculum
  const availableSubjects = [
    { id: 'all', label: 'Toutes les matières' },
    { id: 'Français', label: 'Français (2nde & 1ère EAF)' },
    { id: 'Philosophie', label: 'Philosophie (Terminale)' },
    { id: 'Mathématiques', label: 'Mathématiques & Spécialités' },
    { id: 'Physique-Chimie', label: 'Physique-Chimie' },
    { id: 'SVT', label: 'SVT' },
    { id: 'SES', label: 'SES' },
    { id: 'Histoire-Géographie', label: 'Histoire-Géographie' },
    { id: 'HGGSP', label: 'HGGSP (Géopolitique)' },
    { id: 'NSI', label: 'NSI (Informatique)' },
  ];

  return (
    <div className="space-y-6" data-cursor="exercise">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-indigo-900 via-slate-900 to-slate-950 text-white border border-indigo-800/40 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Zap className="w-3.5 h-3.5" />
            <span>Moteur d'Entraînement Conforme aux Programmes & Manuels Officiels</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-200">
            <Award className="w-4 h-4 text-amber-400" />
            <span>{Object.values(completedExercises).filter(Boolean).length} / {CURRICULUM_EXERCISES_DATABASE.length} Exercices Maîtrisés</span>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          Exercices Résolus par Manuel, Chapitre et Niveau
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Français pour les Secondes, Philosophie pour les Terminales, Mathématiques, Physique-Chimie, SES, SVT, Histoire-Géo, HGGSP et NSI. Choisissez votre classe et votre matière pour vous entraîner avec résolutions méthodiques étape par étape.
        </p>

        {/* Grade Filters */}
        <div className="pt-2 flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Tous les niveaux (2nde → Tle)' },
            { id: 'seconde', label: 'Classe de Seconde' },
            { id: 'premiere', label: 'Classe de Première' },
            { id: 'terminale', label: 'Classe de Terminale' },
          ].map((grade) => (
            <button
              key={grade.id}
              onClick={() => {
                setSelectedGrade(grade.id as any);
                setShowFullSolution(false);
                setShowHintIndex(-1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedGrade === grade.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/10 hover:bg-white/15 text-slate-300'
              }`}
            >
              {grade.label}
            </button>
          ))}
        </div>
      </div>

      {/* Language Redirection Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Languages className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Exercices d'Allemand, d'Espagnol et de Latin :</strong> Chaque langue dispose de sa propre page dédiée avec cours complets et entraînement interactif autonome !
          </span>
        </div>
        {onNavigateToLanguage && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onNavigateToLanguage('espagnol')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-950 dark:text-amber-200 font-bold transition-all cursor-pointer"
            >
              🇪🇸 Espagnol
            </button>
            <button
              onClick={() => onNavigateToLanguage('allemand')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-950 dark:text-amber-200 font-bold transition-all cursor-pointer"
            >
              🇩🇪 Allemand
            </button>
            <button
              onClick={() => onNavigateToLanguage('antiquite')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-950 dark:text-amber-200 font-bold transition-all cursor-pointer"
            >
              🏛️ Latin & Grec
            </button>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Subject and Exercise Selector */}
        <div className="lg:col-span-4 space-y-4">
          {/* Subject Pills */}
          <div className="p-4 rounded-2xl bg-slate-900/5 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Matières</span>
              <span>{filteredExercises.length} fiches</span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {availableSubjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubject(sub.id);
                    setShowFullSolution(false);
                    setShowHintIndex(-1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedSubject === sub.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                      : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrer un thème, un auteur, une notion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* List of matching exercises */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredExercises.map((exo) => {
              const isActive = currentExercise?.id === exo.id;
              const isDone = completedExercises[exo.id];
              return (
                <div
                  key={exo.id}
                  onClick={() => {
                    setActiveExerciseId(exo.id);
                    setShowFullSolution(false);
                    setShowHintIndex(-1);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {exo.subject}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {exo.gradeLevelLabel}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                    {exo.chapterTitle}
                  </h4>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400">
                    <span className="truncate max-w-[170px]">{exo.textbookCollection}</span>
                    {isDone && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Fait
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Workout Workspace */}
        {currentExercise && (
          <div className="lg:col-span-8 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                      {currentExercise.subject}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
                      {currentExercise.gradeLevelLabel}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {currentExercise.chapterTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Source : {currentExercise.textbookCollection} ({currentExercise.publisher})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleComplete(currentExercise.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                      completedExercises[currentExercise.id]
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{completedExercises[currentExercise.id] ? 'Exercice Validé' : 'Marquer comme fait'}</span>
                  </button>

                  {onOpenInBlocknote && (
                    <button
                      onClick={() => onOpenInBlocknote(
                        `${currentExercise.subject} - ${currentExercise.chapterTitle}`,
                        currentExercise.subject,
                        `## Énoncé\n${currentExercise.question}\n\n## Corrigé méthodique\n${currentExercise.correctionSteps.map(s => `### ${s.stepTitle}\n${s.explanation}\n${s.formula ? `*Formule:* ${s.formula}\n` : ''}*Conclusion:* ${s.conclusion}`).join('\n\n')}`
                      )}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Exporter dans le Carnet</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Context or Document if any */}
              {currentExercise.contextOrDoc && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-800 dark:text-white mr-1.5">Contexte du programme :</span>
                  {currentExercise.contextOrDoc}
                </div>
              )}

              {/* Question / Énoncé */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Énoncé de l'Exercice</h4>
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                  {currentExercise.question}
                </div>
              </div>

              {/* Key formulas or notions if any */}
              {currentExercise.keyFormulas && currentExercise.keyFormulas.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Notions & Formules Clés</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentExercise.keyFormulas.map((f, i) => (
                      <div key={i} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-indigo-600 dark:text-indigo-400">
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hints Progressive Reveal */}
              {currentExercise.hints && currentExercise.hints.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>Indices de Résolution</span>
                    </h4>
                    <button
                      onClick={() => setShowHintIndex(prev => prev < currentExercise.hints.length - 1 ? prev + 1 : -1)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                    >
                      {showHintIndex === -1 ? 'Afficher un indice' : showHintIndex === currentExercise.hints.length - 1 ? 'Masquer les indices' : 'Indice suivant'}
                    </button>
                  </div>

                  {showHintIndex >= 0 && (
                    <div className="space-y-2">
                      {currentExercise.hints.slice(0, showHintIndex + 1).map((hint, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200">
                          <span className="font-bold mr-1.5">Indice {idx + 1} :</span>
                          {hint}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Solution Button & Step-by-Step Breakdown */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowFullSolution(!showFullSolution)}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  {showFullSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showFullSolution ? 'Masquer le corrigé détaillé' : 'Dévoiler la résolution étape par étape'}</span>
                </button>

                {showFullSolution && (
                  <div className="space-y-4 animate-fade-in">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Corrigé officiel et méthodologie pas à pas</span>
                    </h4>

                    <div className="space-y-3">
                      {currentExercise.correctionSteps.map((step, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-2">
                          <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                            {step.stepTitle}
                          </h5>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {step.explanation}
                          </p>
                          {step.formula && (
                            <div className="p-2 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/30 text-xs font-mono text-emerald-900 dark:text-emerald-200">
                              {step.formula}
                            </div>
                          )}
                          <div className="pt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            ✓ {step.conclusion}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
