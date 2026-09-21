import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  DailyStudyGoal, 
  DailyGoalsState, 
  CustomMilestone, 
  AppLanguage, 
  AppTheme,
  SchoolDocument
} from '../types';
import { offlineStorageService } from '../services/offlineStorageService';
import { 
  Target, 
  Flame, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Layers, 
  CheckSquare, 
  BookOpen, 
  Plus, 
  Settings2, 
  Sparkles, 
  Trophy, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  ChevronRight,
  TrendingUp,
  Award,
  Calendar,
  RefreshCw
} from 'lucide-react';

interface DailyStudyGoalsProps {
  lang: AppLanguage;
  activeTheme?: AppTheme;
  onNavigateTab?: (tab: any) => void;
  documents?: SchoolDocument[];
}

const STORAGE_KEY = 'degreeunlocker_daily_goals_state_v1';

// Helper function to build dynamic document-driven adaptive milestones
export function generateAdaptiveMilestones(
  docs: SchoolDocument[],
  isFr: boolean = true
): CustomMilestone[] {
  const validDocs = (docs || []).filter(d => {
    const t = (d.title || '').trim().toLowerCase();
    if (!t || t === 'document sans titre' || t === 'sans titre' || t === 'untitled') {
      if (!d.content || d.content.trim() === '') return false;
    }
    return true;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  if (validDocs.length === 0) {
    return [
      {
        id: `adaptive-m-1-${Date.now()}`,
        title: isFr 
          ? 'Importer votre premier cours (PDF, Word ou Note)' 
          : 'Import your first course document (PDF, Word or Note)',
        completed: false,
        subject: isFr ? 'Orientation' : 'General',
        createdAt: todayStr
      },
      {
        id: `adaptive-m-2-${Date.now()}`,
        title: isFr 
          ? 'Créer une fiche de révision pour démarrer' 
          : 'Create a study note to get started',
        completed: false,
        subject: isFr ? 'Méthodologie' : 'Methodology',
        createdAt: todayStr
      }
    ];
  }

  const milestones: CustomMilestone[] = [];

  // Milestone 1: Review the main/most recent document
  const doc1 = validDocs[0];
  if (doc1) {
    milestones.push({
      id: `adaptive-m-doc1-${Date.now()}`,
      title: isFr 
        ? `Réviser et relire : « ${doc1.title || 'Note de cours'} »` 
        : `Review course note: "${doc1.title || 'Study Note'}"`,
      completed: false,
      subject: doc1.subject || 'Général',
      createdAt: todayStr
    });
  }

  // Milestone 2: Quiz or test on second document or first
  const doc2 = validDocs[1] || validDocs[0];
  if (doc2) {
    milestones.push({
      id: `adaptive-m-doc2-${Date.now()}`,
      title: isFr 
        ? `S'évaluer avec 1 Quiz sur « ${doc2.title || 'Points clés'} »` 
        : `Self-test quiz on "${doc2.title || 'Key points'}"`,
      completed: false,
      subject: doc2.subject || 'Général',
      createdAt: todayStr
    });
  }

  // Milestone 3: Subject mastery if distinct subjects exist
  const subjects = Array.from(new Set(validDocs.map(d => d.subject).filter(Boolean)));
  if (subjects.length > 0) {
    const mainSubject = subjects[0];
    const subDocsCount = validDocs.filter(d => d.subject === mainSubject).length;
    milestones.push({
      id: `adaptive-m-subj-${Date.now()}`,
      title: isFr 
        ? `Consolider les acquis en ${mainSubject} (${subDocsCount} cours)` 
        : `Consolidate ${mainSubject} concepts (${subDocsCount} courses)`,
      completed: false,
      subject: mainSubject,
      createdAt: todayStr
    });
  }

  // Milestone 4: If 3+ documents, add 4th milestone for 3rd doc
  if (validDocs.length >= 3) {
    const doc3 = validDocs[2];
    milestones.push({
      id: `adaptive-m-doc3-${Date.now()}`,
      title: isFr 
        ? `Mémoriser les points clés de « ${doc3.title} »` 
        : `Memorize key takeaways from "${doc3.title}"`,
      completed: false,
      subject: doc3.subject || 'Général',
      createdAt: todayStr
    });
  }

  return milestones;
}

const DEFAULT_GOALS: DailyStudyGoal[] = [
  {
    id: 'goal-focus-time',
    title: 'Focus Study Time',
    titleFr: 'Temps de Concentration',
    targetValue: 45,
    currentValue: 0,
    unit: 'minutes',
    unitFr: 'minutes',
    category: 'focus_time',
    completed: false,
    color: 'amber',
    iconName: 'clock'
  },
  {
    id: 'goal-flashcards',
    title: 'Flashcards SRS Review',
    titleFr: 'Fiches SRS Révisées',
    targetValue: 20,
    currentValue: 0,
    unit: 'cards',
    unitFr: 'fiches',
    category: 'flashcards',
    completed: false,
    color: 'indigo',
    iconName: 'layers'
  },
  {
    id: 'goal-quiz',
    title: 'Quiz & Exam Questions',
    titleFr: 'Questions de Quiz Résolues',
    targetValue: 10,
    currentValue: 0,
    unit: 'questions',
    unitFr: 'questions',
    category: 'quizzes',
    completed: false,
    color: 'emerald',
    iconName: 'check-square'
  },
  {
    id: 'goal-reading',
    title: 'Course Summaries Read',
    titleFr: 'Synthèses de Cours Lues',
    targetValue: 2,
    currentValue: 0,
    unit: 'notes',
    unitFr: 'cours',
    category: 'reading',
    completed: false,
    color: 'cyan',
    iconName: 'book-open'
  }
];

export const DailyStudyGoals: React.FC<DailyStudyGoalsProps> = ({
  lang,
  activeTheme = 'light',
  onNavigateTab,
  documents = []
}) => {
  const isFr = lang === 'fr';
  const todayStr = new Date().toISOString().split('T')[0];

  const [state, setState] = useState<DailyGoalsState>(() => {
    if (typeof window === 'undefined') {
      return {
        date: todayStr,
        streakDays: 0,
        goals: DEFAULT_GOALS,
        customMilestones: []
      };
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: DailyGoalsState = JSON.parse(saved);
        // If date is different from today, reset daily currentValues but preserve customized targets
        if (parsed.date !== todayStr) {
          const wasCompletedYesterday = parsed.goals.every(g => g.completed);
          
          return {
            date: todayStr,
            streakDays: 0,
            goals: parsed.goals.map(g => ({ ...g, currentValue: 0, completed: false })),
            customMilestones: parsed.customMilestones.filter(m => !m.completed),
            lastCompletedDate: wasCompletedYesterday ? parsed.date : parsed.lastCompletedDate
          };
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load daily goals:', e);
    }

    return {
      date: todayStr,
      streakDays: 0,
      goals: DEFAULT_GOALS,
      customMilestones: []
    };
  });

  const [isEditingTargets, setIsEditingTargets] = useState(false);
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [newMilestoneSubject, setNewMilestoneSubject] = useState('Général');
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Valid non-empty documents count
  const validDocs = useMemo(() => {
    return (documents || []).filter(d => {
      const t = (d.title || '').trim().toLowerCase();
      if (!t || t === 'document sans titre' || t === 'sans titre' || t === 'untitled') {
        if (!d.content || d.content.trim() === '') return false;
      }
      return true;
    });
  }, [documents]);

  // Handler to manually or automatically synchronize goals & milestones with real user documents
  const handleRegenerateAdaptiveMilestones = useCallback(() => {
    const adaptive = generateAdaptiveMilestones(documents, isFr);
    
    // Adapt target goals based on document count
    const validCount = validDocs.length;
    const adaptedReadingTarget = Math.max(1, Math.min(validCount, Math.ceil(validCount / 2)));
    const adaptedQuizTarget = Math.max(5, Math.min(25, validCount * 3 || 5));
    const adaptedCardsTarget = Math.max(10, Math.min(50, validCount * 5 || 10));

    setState(prev => ({
      ...prev,
      customMilestones: adaptive,
      goals: prev.goals.map(g => {
        if (g.category === 'reading') return { ...g, targetValue: adaptedReadingTarget, completed: g.currentValue >= adaptedReadingTarget };
        if (g.category === 'quizzes') return { ...g, targetValue: adaptedQuizTarget, completed: g.currentValue >= adaptedQuizTarget };
        if (g.category === 'flashcards') return { ...g, targetValue: adaptedCardsTarget, completed: g.currentValue >= adaptedCardsTarget };
        return g;
      })
    }));
  }, [documents, validDocs.length, isFr]);

  // Auto-adapt on initial load if customMilestones is empty
  useEffect(() => {
    if (state.customMilestones.length === 0) {
      handleRegenerateAdaptiveMilestones();
    }
  }, [documents, handleRegenerateAdaptiveMilestones, state.customMilestones.length]);

  // Sync to local storage and offline queue
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      // Enqueue to offline storage for background durability
      offlineStorageService.enqueuePendingChange(
        'update',
        state,
        'study_goal',
        `Objectifs Quotidiens - ${state.date} (Streak ${state.streakDays}j)`
      );
    } catch (e) {
      console.warn('Failed to save daily goals:', e);
    }
  }, [state]);

  // Check 100% completion
  const completedGoalsCount = state.goals.filter(g => g.completed).length;
  const completedMilestonesCount = state.customMilestones.filter(m => m.completed).length;
  const totalItemsCount = state.goals.length + state.customMilestones.length;
  const totalCompletedCount = completedGoalsCount + completedMilestonesCount;
  const overallPercentage = totalItemsCount > 0 ? Math.round((totalCompletedCount / totalItemsCount) * 100) : 0;

  useEffect(() => {
    if (overallPercentage === 100 && totalItemsCount > 0) {
      setShowCelebration(true);
    } else {
      setShowCelebration(false);
    }
  }, [overallPercentage, totalItemsCount]);

  const handleIncrementGoal = (goalId: string, amount: number) => {
    setState(prev => {
      const updatedGoals = prev.goals.map(g => {
        if (g.id === goalId) {
          const newVal = Math.max(0, g.currentValue + amount);
          const isDone = newVal >= g.targetValue;
          return {
            ...g,
            currentValue: newVal,
            completed: isDone
          };
        }
        return g;
      });
      return { ...prev, goals: updatedGoals };
    });
  };

  const handleToggleGoalCompleted = (goalId: string) => {
    setState(prev => {
      const updatedGoals = prev.goals.map(g => {
        if (g.id === goalId) {
          const nextCompleted = !g.completed;
          return {
            ...g,
            completed: nextCompleted,
            currentValue: nextCompleted ? g.targetValue : 0
          };
        }
        return g;
      });
      return { ...prev, goals: updatedGoals };
    });
  };

  const handleSaveTarget = (goalId: string, newTarget: number) => {
    setState(prev => {
      const updatedGoals = prev.goals.map(g => {
        if (g.id === goalId) {
          const target = Math.max(1, newTarget);
          return {
            ...g,
            targetValue: target,
            completed: g.currentValue >= target
          };
        }
        return g;
      });
      return { ...prev, goals: updatedGoals };
    });
  };

  const handleToggleMilestone = (milestoneId: string) => {
    setState(prev => {
      const updated = prev.customMilestones.map(m => {
        if (m.id === milestoneId) {
          return { ...m, completed: !m.completed };
        }
        return m;
      });
      return { ...prev, customMilestones: updated };
    });
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneText.trim()) return;

    const newM: CustomMilestone = {
      id: `milestone-${Date.now()}`,
      title: newMilestoneText.trim(),
      completed: false,
      subject: newMilestoneSubject.trim() || 'Général',
      createdAt: todayStr
    };

    setState(prev => ({
      ...prev,
      customMilestones: [newM, ...prev.customMilestones]
    }));

    setNewMilestoneText('');
    setIsAddingMilestone(false);
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    setState(prev => ({
      ...prev,
      customMilestones: prev.customMilestones.filter(m => m.id !== milestoneId)
    }));
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'clock': return Clock;
      case 'layers': return Layers;
      case 'check-square': return CheckSquare;
      case 'book-open': return BookOpen;
      default: return Target;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl transition-all duration-200 p-5 sm:p-7 space-y-6">
      
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Row: Title, Streak Badge, Target Settings Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0 border border-amber-400/40">
            <Target className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {isFr ? 'Objectifs Quotidiens & Milestones' : 'Daily Academic Milestones'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isFr 
                ? 'Validez vos piliers académiques pour ancrer vos révisions au quotidien' 
                : 'Complete your daily milestones to build consistent study momentum'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={handleRegenerateAdaptiveMilestones}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            title={isFr ? 'Synchroniser et adapter les milestones selon vos cours réels' : 'Sync and adapt milestones to your actual course documents'}
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
            <span>{isFr ? '⚡ Adapter à mes cours' : '⚡ Adapt to my courses'}</span>
          </button>

          <button
            onClick={() => setIsEditingTargets(!isEditingTargets)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            title={isFr ? 'Ajuster les valeurs cibles' : 'Adjust target goals'}
          >
            <Settings2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>{isFr ? 'Ajuster Cibles' : 'Adjust Targets'}</span>
          </button>

          <button
            onClick={() => setIsAddingMilestone(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isFr ? 'Ajouter Milestone' : 'Add Milestone'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar & Motivation Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-amber-50/40 dark:from-slate-800/60 dark:via-indigo-950/40 dark:to-amber-950/30 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 relative z-10">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>{isFr ? 'Progression Globale du Jour :' : 'Daily Total Progress:'}</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-black text-sm">
              {totalCompletedCount} / {totalItemsCount} {isFr ? 'validés' : 'completed'} ({overallPercentage}%)
            </span>
          </div>

          {showCelebration ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-extrabold text-[11px] border border-emerald-500/40 animate-pulse">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>{isFr ? 'Tous les objectifs validés ! Bravo 🎉' : 'All milestones unlocked! Great job 🎉'}</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {isFr ? `${totalItemsCount - totalCompletedCount} restants pour valider la journée` : `${totalItemsCount - totalCompletedCount} remaining today`}
            </div>
          )}
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden p-0.5">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-400 transition-all duration-500 shadow-sm"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      {/* 4 Built-In Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
        {state.goals.map((goal) => {
          const Icon = getIcon(goal.iconName);
          const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));

          return (
            <div 
              key={goal.id}
              className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between gap-3 ${
                goal.completed 
                  ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/40 shadow-xs' 
                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:border-indigo-400/50'
              }`}
            >
              {/* Top Row: Icon, Title, and Complete Checkbox */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    goal.completed
                      ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400'
                      : 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                      {isFr ? goal.titleFr : goal.title}
                    </h4>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {goal.currentValue} / {goal.targetValue} {isFr ? goal.unitFr : goal.unit}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleGoalCompleted(goal.id)}
                  className="p-1 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer shrink-0"
                  title={goal.completed ? (isFr ? 'Marquer incomplet' : 'Mark incomplete') : (isFr ? 'Marquer complété' : 'Mark complete')}
                >
                  {goal.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-slate-400" />
                  )}
                </button>
              </div>

              {/* Progress Mini Bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      goal.completed ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{percent}%</span>
                  <span>{goal.completed ? (isFr ? 'Atteint ✅' : 'Reached ✅') : (isFr ? 'En cours' : 'In progress')}</span>
                </div>
              </div>

              {/* Quick Increment or Edit Target row */}
              {isEditingTargets ? (
                <div className="pt-1 flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">{isFr ? 'Cible :' : 'Target:'}</span>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={goal.targetValue}
                    onChange={(e) => handleSaveTarget(goal.id, parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400">{isFr ? goal.unitFr : goal.unit}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => handleIncrementGoal(goal.id, goal.category === 'focus_time' ? 15 : 1)}
                    className="flex-1 py-1 px-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] font-bold transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3 text-indigo-500" />
                    <span>+{goal.category === 'focus_time' ? '15m' : '1'}</span>
                  </button>
                  {goal.category === 'focus_time' && (
                    <button
                      onClick={() => handleIncrementGoal(goal.id, 25)}
                      className="py-1 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
                      title={isFr ? '+25 min (1 Pomodoro)' : '+25 min (1 Pomodoro)'}
                    >
                      +25m
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Academic Milestones Checklist */}
      <div className="space-y-3 pt-2 relative z-10 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isFr ? 'Milestones Adaptatives & Tâches' : 'Adaptive Milestones & Tasks'}</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {completedMilestonesCount}/{state.customMilestones.length}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{isFr ? `Généré selon ${validDocs.length} cours` : `Adapted to ${validDocs.length} courses`}</span>
            </span>
          </div>

          {!isAddingMilestone && (
            <button
              onClick={() => setIsAddingMilestone(true)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isFr ? 'Ajouter une tâche' : 'Add task'}</span>
            </button>
          )}
        </div>

        {/* Add milestone input box */}
        {isAddingMilestone && (
          <form onSubmit={handleAddMilestone} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-indigo-500/40 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                autoFocus
                placeholder={isFr ? "Ex: Rédiger la fiche de synthèse SES, Faire 5 exos d'annales..." : "Ex: Read chapter 4 Chemistry, Solve 5 quiz questions..."}
                value={newMilestoneText}
                onChange={(e) => setNewMilestoneText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              
              <select
                value={newMilestoneSubject}
                onChange={(e) => setNewMilestoneSubject(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="Général">Général</option>
                <option value="Mathématiques">Mathématiques</option>
                <option value="Physique-Chimie">Physique-Chimie</option>
                <option value="SVT / Biologie">SVT / Biologie</option>
                <option value="Histoire & Géo">Histoire & Géo</option>
                <option value="Philosophie">Philosophie</option>
                <option value="SES / Économie">SES / Économie</option>
                <option value="Langues">Langues</option>
              </select>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="submit"
                  disabled={!newMilestoneText.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  {isFr ? 'Ajouter' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingMilestone(false)}
                  className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Milestones List */}
        {state.customMilestones.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-1">
            {isFr ? 'Aucune milestone personnalisée pour le moment. Cliquez sur Ajouter pour en définir une.' : 'No custom milestones set yet. Click Add to define one.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {state.customMilestones.map((m) => (
              <div 
                key={m.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                  m.completed
                    ? 'bg-slate-100/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleMilestone(m.id)}
                    className="p-0.5 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer shrink-0"
                  >
                    {m.completed ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-4.5 h-4.5 text-slate-300 dark:text-slate-600 hover:text-slate-400" />
                    )}
                  </button>
                  <span className={`text-xs font-semibold truncate ${
                    m.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'
                  }`}>
                    {m.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {m.subject && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {m.subject}
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteMilestone(m.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title={isFr ? 'Supprimer' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
