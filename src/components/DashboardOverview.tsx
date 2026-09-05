import React, { useState, useEffect } from 'react';
import { SchoolDocument, AppLanguage, AppTheme } from '../types';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  PenTool, 
  Brain, 
  Zap, 
  Languages, 
  Database, 
  FileText, 
  Upload, 
  Plus, 
  Quote, 
  Clock, 
  FolderCheck, 
  Star, 
  GraduationCap, 
  HardDrive, 
  ChevronRight,
  Atom,
  Flame,
  Globe2,
  FileSpreadsheet,
  FileCode,
  Layers,
  ArrowUpRight,
  Inbox,
  HelpCircle,
  CheckCircle2,
  Lightbulb,
  Repeat,
  Calendar,
  BarChart3,
  TrendingUp,
  Award,
  Check,
  Palette as PaletteIcon
} from 'lucide-react';

interface DashboardOverviewProps {
  documents: SchoolDocument[];
  onNavigateTab: (tab: any) => void;
  onSelectDoc: (doc: SchoolDocument) => void;
  onOpenNewNote: () => void;
  onOpenUpload: () => void;
  onOpenBackup?: () => void;
  onOpenTutorial?: () => void;
  onOpenTips?: () => void;
  onFilterSubject?: (subject: string) => void;
  lang: AppLanguage;
  activeTheme?: AppTheme;
}

// Subject icons & theme mappings
const SUBJECT_METADATA: Record<string, { icon: any; color: string; bg: string; defaultMastery: number }> = {
  'Biologie': { icon: Globe2, color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800/60', defaultMastery: 85 },
  'Physique-Chimie': { icon: Atom, color: 'text-cyan-400', bg: 'bg-cyan-950/60 border-cyan-800/60', defaultMastery: 80 },
  'Histoire & Géo': { icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800/60', defaultMastery: 40 },
  'Histoire': { icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800/60', defaultMastery: 65 },
  'Mathématiques': { icon: FileCode, color: 'text-indigo-400', bg: 'bg-indigo-950/60 border-indigo-800/60', defaultMastery: 92 },
  'Philosophie': { icon: Lightbulb, color: 'text-purple-400', bg: 'bg-purple-950/60 border-purple-800/60', defaultMastery: 70 },
  'Anglais': { icon: Languages, color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-800/60', defaultMastery: 88 },
};

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  documents,
  onNavigateTab,
  onSelectDoc,
  onOpenNewNote,
  onOpenUpload,
  onOpenBackup,
  onOpenTutorial,
  onOpenTips,
  onFilterSubject,
  lang = 'fr',
  activeTheme = 'light',
}) => {
  const [selectedFilterPill, setSelectedFilterPill] = useState<string>('all');
  const [streakData, setStreakData] = useState<{ activityDates: string[]; currentStreak: number }>({
    activityDates: [],
    currentStreak: 4,
  });

  // Fetch real study streaks from server
  useEffect(() => {
    fetch('/api/streaks')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStreakData({
            activityDates: data.activityDates || [],
            currentStreak: data.currentStreak || (data.activityDates?.length > 0 ? data.activityDates.length : 3),
          });
        }
      })
      .catch(() => {});
  }, []);

  // Live stats calculation hook using documents state
  const liveStats = React.useMemo(() => {
    const subjectMap: Record<string, { count: number; docs: SchoolDocument[]; totalWords: number }> = {};
    documents.forEach((d) => {
      const subj = d.subject || (lang === 'fr' ? 'Général' : 'General');
      if (!subjectMap[subj]) {
        subjectMap[subj] = { count: 0, docs: [], totalWords: 0 };
      }
      subjectMap[subj].count += 1;
      subjectMap[subj].docs.push(d);
      subjectMap[subj].totalWords += d.wordCount || 150;
    });

    const subjectsList = Object.keys(subjectMap).map((subj) => {
      const data = subjectMap[subj];
      const mastery = Math.min(98, Math.max(45, 60 + data.count * 8 + Math.round(data.totalWords / 250)));
      return {
        subject: subj,
        count: data.count,
        docs: data.docs,
        mastery,
        frequencyScore: data.count * 20 + data.totalWords,
      };
    }).sort((a, b) => b.frequencyScore - a.frequencyScore);

    return {
      subjectMap,
      subjectsList,
      totalDocs: documents.length,
      totalSubjects: subjectsList.length,
      srsRetention: documents.length > 0 ? Math.min(98, 78 + documents.length * 2) : 0,
    };
  }, [documents, lang]);

  // Real subjects breakdown from actual documents
  const subjectsMap: Record<string, number> = {};
  liveStats.subjectsList.forEach(item => {
    subjectsMap[item.subject] = item.count;
  });

  const distinctSubjects = liveStats.subjectsList.map(item => item.subject);

  // Filtered documents based on active pill
  const filteredDocuments = selectedFilterPill === 'all'
    ? documents
    : documents.filter((d) => d.subject?.toLowerCase() === selectedFilterPill.toLowerCase());

  // Last 7 days for study activity visualizer
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short' });
    const isToday = i === 6;
    const isStudied = streakData.activityDates.includes(iso);
    return {
      date: iso,
      dayName,
      isToday,
      isStudied,
    };
  });

  const totalDocsCount = liveStats.totalDocs;
  const totalSubjectsCount = liveStats.totalSubjects;
  const srsRetentionPercent = liveStats.srsRetention;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. HERO WELCOME BANNER (Exact Match with Redesign Mockup)                 */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#111827] to-[#1e1b4b] p-6 sm:p-8 text-white shadow-2xl border border-slate-800">
        
        {/* Subtle decorative mesh gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start justify-between">
          
          {/* Left Hero Content */}
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {lang === 'fr' ? 'Réussissez vos Évaluations & Examens' : 'Master Your Courses & Exams'}
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              {lang === 'fr'
                ? 'Importez vos supports de cours (PDF, Docx) ou créez des fiches adaptées pour mémoriser durablement.'
                : 'Import your course files (PDF, Docx) or craft custom revision cards to build lasting memory.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenUpload}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2.5 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{lang === 'fr' ? 'Importer un Document' : 'Import Document'}</span>
              </button>

              <button
                onClick={() => onNavigateTab('flashcards')}
                className="px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-all border border-slate-700 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>{lang === 'fr' ? 'Créer une Fiche' : 'Create Card'}</span>
              </button>
            </div>
          </div>

          {/* Right Hero Stats Card (Base Locale Active) */}
          <div className="w-full lg:w-80 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/60 shadow-xl space-y-4 shrink-0">
            
            {/* Status Header */}
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{lang === 'fr' ? 'Base Locale Active' : 'Active Local Database'}</span>
            </div>

            {/* 3 Metrics Row */}
            <div className="grid grid-cols-3 gap-3 pt-1 text-center">
              
              {/* Metric 1: Documents */}
              <div className="space-y-1.5">
                <div className="text-2xl font-black text-white font-mono">
                  {totalDocsCount}
                </div>
                <div className="text-[11px] font-medium text-slate-400">
                  {lang === 'fr' ? 'Documents' : 'Documents'}
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: totalDocsCount > 0 ? '75%' : '0%' }} />
                </div>
              </div>

              {/* Metric 2: Matières */}
              <div className="space-y-1.5">
                <div className="text-2xl font-black text-white font-mono">
                  {totalSubjectsCount}
                </div>
                <div className="text-[11px] font-medium text-slate-400">
                  {lang === 'fr' ? 'Matières' : 'Subjects'}
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: totalSubjectsCount > 0 ? '60%' : '0%' }} />
                </div>
              </div>

              {/* Metric 3: Rétention SRS */}
              <div className="space-y-1.5">
                <div className="text-2xl font-black text-white font-mono">
                  {srsRetentionPercent}%
                </div>
                <div className="text-[11px] font-medium text-slate-400">
                  {lang === 'fr' ? 'Rétention SRS' : 'SRS Retention'}
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '88%' }} />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUBJECTS & ACTIVE REVISIONS SECTION (Matching Mockup)                 */}
      {/* ========================================================================= */}
      <div className="space-y-5">
        
        {/* Section Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>{lang === 'fr' ? 'Vos Matières & Révisions en cours' : 'Your Subjects & Active Revisions'}</span>
          </h2>
          <button
            onClick={() => onNavigateTab('library')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{lang === 'fr' ? 'Voir tous les cours' : 'View all'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedFilterPill('all')}
            className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
              selectedFilterPill === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {lang === 'fr' ? 'Toutes' : 'All'}
          </button>

          {['Biologie', 'Physique-Chimie', 'Histoire & Géo', 'Mathématiques', ...distinctSubjects.filter(s => !['Biologie', 'Physique-Chimie', 'Histoire & Géo', 'Mathématiques'].includes(s))].map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedFilterPill(subj)}
              className={`px-4 py-1.5 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                selectedFilterPill.toLowerCase() === subj.toLowerCase()
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* Course Cards Grid (Matching mockup card layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Biologie cellulaire */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between gap-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-500 flex items-center justify-center shrink-0">
                  <Globe2 className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                  Biologie cellulaire: Structure et Fonction
                </h4>
              </div>

              {/* Mastery progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>85% Maîtrisé</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-indigo-500" />
                  <span>54 Flashcards</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                  PDF + Notes
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('flashcards')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              {lang === 'fr' ? 'Réviser' : 'Review'}
            </button>
          </div>

          {/* Card 2: Physique Quantique */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between gap-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 flex items-center justify-center shrink-0">
                  <Atom className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                  Physique Quantique: Les Bases
                </h4>
              </div>

              {/* Mastery progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>80% Maîtrisé</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full" style={{ width: '80%' }} />
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  <span>32 Flashcards</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                  Quiz Recall
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('quiz')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              {lang === 'fr' ? 'Réviser' : 'Review'}
            </button>
          </div>

          {/* Card 3: Histoire Contemporaine */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between gap-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                  Histoire Contemporaine: XXème siècle
                </h4>
              </div>

              {/* Mastery progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>40% Maîtrisé</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full" style={{ width: '40%' }} />
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-amber-400" />
                  <span>70 Flashcards</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                  Synthèse
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('flashcards')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              {lang === 'fr' ? 'Réviser' : 'Review'}
            </button>
          </div>

          {/* Card 4: Mathématiques Avancées */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between gap-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-400 flex items-center justify-center shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                  Mathématiques Avancées: Algèbre
                </h4>
              </div>

              {/* Mastery progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>92% Maîtrisé</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-indigo-400" />
                  <span>45 Flashcards</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                  Problèmes
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('blocknote')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              {lang === 'fr' ? 'Réviser' : 'Review'}
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. VISUALIZATION: SUBJECTS BREAKDOWN & 7-DAY STUDY ACTIVITY WIDGET        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Widget A: Documents per Subject Breakdown Visualizer */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {lang === 'fr' ? 'Répartition des Documents par Matière' : 'Documents per Subject Distribution'}
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {totalDocsCount} {lang === 'fr' ? 'fichiers' : 'files'}
            </span>
          </div>

          {/* Progress Distribution Bars */}
          <div className="space-y-3 pt-2">
            {(distinctSubjects.length > 0 ? distinctSubjects : ['Biologie', 'Physique-Chimie', 'Histoire & Géo', 'Mathématiques']).map((subj, idx) => {
              const count = subjectsMap[subj] || (idx === 0 ? 5 : idx === 1 ? 4 : idx === 2 ? 3 : 2);
              const percent = Math.min(100, Math.round((count / (totalDocsCount || 14)) * 100));
              const colors = ['bg-emerald-500', 'bg-cyan-500', 'bg-amber-500', 'bg-indigo-500', 'bg-purple-500', 'bg-rose-500'];
              const color = colors[idx % colors.length];

              return (
                <div key={subj} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{subj}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                      {count} {lang === 'fr' ? 'doc(s)' : 'doc(s)'} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Widget B: 7-Day Recent Study Activity & Streak Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {lang === 'fr' ? 'Activité & Assiduité Récente (7 Jours)' : 'Recent Study Activity & Streaks'}
              </h3>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{streakData.currentStreak} {lang === 'fr' ? 'Jours d\'affilée' : 'Day Streak'}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'fr'
              ? 'Consultez vos sessions quotidiennes d\'active recall, consultations de fiches et rédactions de notes.'
              : 'Track your daily active recall completions, flashcard reviews, and study notebook sessions.'}
          </p>

          {/* 7 Days Timeline Heatmap Bar */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-2 text-center overflow-x-auto pb-2 min-w-[300px]">
            {last7Days.map((d, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center justify-between gap-2 ${
                  d.isStudied
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 text-slate-400'
                } ${d.isToday ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
              >
                <span className="text-[10px] font-bold uppercase">{d.dayName}</span>
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                    d.isStudied
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {d.isStudied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '—'}
                </div>
                <span className="text-[9px] font-mono text-slate-400">
                  {d.isToday ? (lang === 'fr' ? 'Auj.' : 'Today') : d.date.slice(8)}
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. ACADEMIC AI TOOLS GRID                                                */}
      {/* ========================================================================= */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>{lang === 'fr' ? 'Outils d’Étude & Révision' : 'Study & Revision Tools'}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div 
            onClick={() => onNavigateTab('flashcards')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:shadow-md cursor-pointer transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === 'fr' ? 'Fiches Flashcards Personnalisées' : 'Custom Flashcards'}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === 'fr' ? 'Créez vos fiches à partir de vos notes de chapitre avec répétition espacée Leitner.' : 'Build flashcards from chapter notes with Leitner spaced repetition.'}
            </p>
          </div>

          <div 
            onClick={() => onNavigateTab('resumer')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === 'fr' ? 'Synthèse & Résumé IA' : 'AI Summarizer'}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === 'fr' ? 'Condensé automatique en points clés, définitions et formules prêtes pour l’évaluation.' : 'Extract core key points, essential formulas, and testable concepts.'}
            </p>
          </div>

          <div 
            onClick={() => onNavigateTab('blocknote')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:shadow-md cursor-pointer transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <PenTool className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === 'fr' ? 'Cahier Blocknote & Manuscrit' : 'Blocknote Companion'}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === 'fr' ? 'Génération de gabarits structurés avec code couleur de stylos pour l’écriture.' : 'Structured handwriting reproduction layout with pen color codes.'}
            </p>
          </div>

          <div 
            onClick={() => onNavigateTab('quiz')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === 'fr' ? 'Quiz Recall & QCM' : 'Active Recall Quiz'}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === 'fr' ? 'Évaluations générées automatiquement avec corrigés détaillés et chronomètre.' : 'Timed exam simulations with automatic grading.'}
            </p>
          </div>

        </div>
      </div>

      {/* Guide & Study Methods Tutorial Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {lang === 'fr' ? 'Guide & Tutoriels d\'Étude' : 'Study Guide & Tutorials'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'fr'
                ? 'Tutoriel complet de l\'application, prise de notes, code couleur rationalisé et répétition espacée.'
                : 'Interactive application tour, note-taking craft, 4-color rationale, and spaced repetition strategy.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenTutorial && (
              <button
                id="btn-overview-open-tutorial"
                onClick={onOpenTutorial}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{lang === 'fr' ? 'Tutoriel App' : 'App Tutorial'}</span>
              </button>
            )}
            {onOpenTips && (
              <button
                id="btn-overview-open-tips"
                onClick={onOpenTips}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{lang === 'fr' ? 'Guide Méthodes' : 'Methods Guide'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Highlight Method Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-indigo-600 dark:text-indigo-400">
              <PaletteIcon className="w-4 h-4" />
              <span>{lang === 'fr' ? 'Code Couleur Rationnel 4 Couleurs' : '4-Color Pen System'}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {lang === 'fr'
                ? '🔵 Bleu : Cours • ⚫ Noir : Titres & définitions • 🔴 Rouge : Formules & pièges • 🟢 Vert : Vocabulaire & exemples.'
                : '🔵 Blue: Body text • ⚫ Black: Headings • 🔴 Red: Formulas • 🟢 Green: Examples.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-600 dark:text-emerald-400">
              <Repeat className="w-4 h-4" />
              <span>{lang === 'fr' ? 'Répétition Espacée & Méthode Cornell' : 'Spaced Repetition & Cornell'}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {lang === 'fr'
                ? 'Révisions à J+0, J+1, J+3, J+7, J+30 pour contrer la courbe de l\'oubli d\'Ebbinghaus.'
                : 'Review intervals at D+0, D+1, D+3, D+7, D+30 to optimize memory consolidation.'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
