import React, { useState } from 'react';
import { SCHOOL_TEXTBOOKS_LIBRARY, SchoolTextbook, TextbookChapter, TextbookExercise } from '../data/schoolBooksLibrary';
import { AppLanguage, AppTheme } from '../types';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  GraduationCap, 
  BookMarked, 
  Layers, 
  Lightbulb, 
  FileText, 
  ArrowLeft,
  Eye,
  EyeOff,
  Filter,
  Check,
  Zap,
  Tag
} from 'lucide-react';

interface SchoolBooksLibraryViewProps {
  lang?: AppLanguage;
  activeTheme?: AppTheme;
  onOpenDocInBlocknote?: (title: string, subject: string, content: string) => void;
}

export const SchoolBooksLibraryView: React.FC<SchoolBooksLibraryViewProps> = ({
  lang = 'fr',
  activeTheme = 'light',
  onOpenDocInBlocknote,
}) => {
  const isFr = lang === 'fr';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedBook, setSelectedBook] = useState<SchoolTextbook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<TextbookChapter | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<TextbookExercise | null>(null);
  
  // Interactive exercise state
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('degreelocker_completed_exercises');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {};
  });

  const toggleSolution = (exId: string) => {
    setRevealedSolutions(prev => ({ ...prev, [exId]: !prev[exId] }));
  };

  const toggleHint = (exId: string) => {
    setRevealedHints(prev => ({ ...prev, [exId]: !prev[exId] }));
  };

  const toggleExerciseComplete = (exId: string) => {
    setCompletedExercises(prev => {
      const next = { ...prev, [exId]: !prev[exId] };
      try {
        localStorage.setItem('degreelocker_completed_exercises', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Filter books
  const filteredBooks = SCHOOL_TEXTBOOKS_LIBRARY.filter(book => {
    if (selectedSubject !== 'all' && book.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = book.title.toLowerCase().includes(q) || book.subtitle.toLowerCase().includes(q);
      const matchChapter = book.chapters.some(c => 
        c.title.toLowerCase().includes(q) || 
        c.exercises.some(e => e.question.toLowerCase().includes(q) || e.title.toLowerCase().includes(q))
      );
      if (!matchTitle && !matchChapter) return false;
    }
    return true;
  });

  const handleExportToBlocknote = (exercise: TextbookExercise, chapter: TextbookChapter, book: SchoolTextbook) => {
    if (onOpenDocInBlocknote) {
      const formattedContent = `# ${book.title} - ${chapter.title}\n## Exercice ${exercise.number} : ${exercise.title}\n\n**Énoncé :**\n${exercise.question}\n\n**Formules Clés :**\n${(exercise.keyFormulas || []).map(f => `- ${f}`).join('\n')}\n\n**Solution Détaillée :**\n${exercise.solution.map(s => `Étape ${s.stepNumber} : ${s.explanation}\n${s.formulaOrCalculation ? `> ${s.formulaOrCalculation}\n` : ''}Résultat : ${s.result}`).join('\n\n')}`;
      onOpenDocInBlocknote(`${book.title} - Ex ${exercise.number}`, book.subject, formattedContent);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 border border-indigo-700/50 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black shrink-0">
            <BookOpen className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight text-white">
                {isFr ? 'Bibliothèque de Manuels Scolaires & Exercices' : 'School Textbooks & Exercises Library'}
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                100% PC Direct
              </span>
            </div>
            <p className="text-xs text-indigo-200/90 mt-0.5">
              {isFr
                ? 'Manuels officiels, cours structurés et annales d\'exercices corrigés pas à pas sans distraction multimédia.'
                : 'Official curriculum textbooks, structured lessons, and step-by-step solved exercises.'}
            </p>
          </div>
        </div>

        {/* Global stats */}
        <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/10 self-stretch md:self-auto justify-between md:justify-start">
          <div className="text-left">
            <div className="text-[10px] text-slate-400 uppercase font-bold">{isFr ? 'Manuels' : 'Books'}</div>
            <div className="text-sm font-black text-amber-300">{SCHOOL_TEXTBOOKS_LIBRARY.length}</div>
          </div>
          <div className="h-6 w-[1px] bg-white/10 mx-1" />
          <div className="text-left">
            <div className="text-[10px] text-slate-400 uppercase font-bold">{isFr ? 'Exercices' : 'Exercises'}</div>
            <div className="text-sm font-black text-emerald-400">
              {SCHOOL_TEXTBOOKS_LIBRARY.reduce((acc, b) => acc + b.exercisesCount, 0)}
            </div>
          </div>
          <div className="h-6 w-[1px] bg-white/10 mx-1" />
          <div className="text-left">
            <div className="text-[10px] text-slate-400 uppercase font-bold">{isFr ? 'Complétés' : 'Solved'}</div>
            <div className="text-sm font-black text-indigo-300">
              {Object.values(completedExercises).filter(Boolean).length}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Breadcrumb if in book view */}
      {selectedBook && (
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <button
            onClick={() => {
              setSelectedBook(null);
              setSelectedChapter(null);
              setSelectedExercise(null);
            }}
            className="hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isFr ? 'Tous les manuels' : 'All Textbooks'}</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-200 font-bold truncate">{selectedBook.title}</span>
          {selectedChapter && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-indigo-300 truncate">{selectedChapter.title}</span>
            </>
          )}
        </div>
      )}

      {/* VIEW 1: BOOK SELECTION GRID */}
      {!selectedBook && (
        <div className="space-y-4">
          {/* Filters and search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-2xl border border-white/5">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isFr ? 'Rechercher un chapitre, exercice, formule...' : 'Search chapter, exercise, formula...'}
                className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-thin">
              {[
                { id: 'all', label: isFr ? 'Toutes les matières' : 'All Subjects' },
                { id: 'Mathematics', label: '📐 Mathématiques' },
                { id: 'Physics', label: '⚡ Physique-Chimie' },
                { id: 'Biology', label: '🧬 SVT & Biologie' },
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSubject === sub.id
                      ? 'bg-indigo-600 text-white shadow-md border border-indigo-400/40'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => {
                  setSelectedBook(book);
                  setSelectedChapter(book.chapters[0] || null);
                }}
                className="group p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 transition-all flex flex-col justify-between shadow-lg hover:shadow-2xl hover:scale-[1.01] cursor-pointer"
              >
                <div>
                  {/* Book Banner */}
                  <div className={`w-full h-28 rounded-2xl bg-gradient-to-r ${book.coverColor} p-4 flex flex-col justify-between text-white shadow-inner relative overflow-hidden mb-4`}>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-15 rotate-12">
                      <BookOpen className="w-24 h-24 text-white" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-black/40 border border-white/20">
                        {book.gradeLevel}
                      </span>
                      <span className="text-[10px] font-bold text-amber-300">
                        {book.edition}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base leading-tight drop-shadow-md">
                        {book.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                    {book.subtitle}
                  </p>

                  {/* Chapters Preview */}
                  <div className="space-y-1.5 mb-4">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {isFr ? 'Sommaire des chapitres :' : 'Chapters :'}
                    </div>
                    {book.chapters.map((chap) => (
                      <div key={chap.id} className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/40 p-2 rounded-xl border border-white/5">
                        <span className="truncate flex-1">
                          <span className="font-bold text-indigo-400 mr-1.5">Ch {chap.chapterNumber}.</span>
                          {chap.title}
                        </span>
                        <span className="text-[10px] font-mono text-amber-300 shrink-0 ml-2">
                          {chap.exercises.length} ex
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {book.chaptersCount} {isFr ? 'Chapitres' : 'Chapters'} • {book.exercisesCount} {isFr ? 'Exercices' : 'Exercises'}
                  </span>
                  <button className="px-3.5 py-1.5 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-md">
                    <span>{isFr ? 'Ouvrir le Manuel' : 'Open Textbook'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: INSIDE SELECTED BOOK (CHAPTERS & EXERCISES WORKSPACE) */}
      {selectedBook && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Chapters Navigation (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>{isFr ? 'Chapitres du Manuel' : 'Textbook Chapters'}</span>
              </h3>

              <div className="space-y-2">
                {selectedBook.chapters.map((chap) => (
                  <button
                    key={chap.id}
                    onClick={() => {
                      setSelectedChapter(chap);
                      setSelectedExercise(chap.exercises[0] || null);
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition-all border cursor-pointer ${
                      selectedChapter?.id === chap.id
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold">
                        Chapitre {chap.chapterNumber}
                      </span>
                      <span className="text-[10px] text-amber-300 font-bold">
                        {chap.exercises.length} {isFr ? 'exercices' : 'exercises'}
                      </span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm leading-snug">
                      {chap.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chapter Summary Card */}
            {selectedChapter && (
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" />
                  <span>{isFr ? 'Notions Clés du Chapitre' : 'Key Chapter Concepts'}</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedChapter.summary}
                </p>
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  {selectedChapter.keyConcepts.map((kc, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{kc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Exercises & Step-by-Step Solutions (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {selectedChapter ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white">
                      {selectedChapter.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isFr
                        ? `${selectedChapter.exercises.length} exercices d'application directe et de type épreuve`
                        : `${selectedChapter.exercises.length} practical exercises & exam-style problems`}
                    </p>
                  </div>
                </div>

                {/* Exercises List */}
                <div className="space-y-5">
                  {selectedChapter.exercises.map((ex) => {
                    const isSolved = !!completedExercises[ex.id];
                    const isSolRevealed = !!revealedSolutions[ex.id];
                    const isHintRevealed = !!revealedHints[ex.id];

                    return (
                      <div
                        key={ex.id}
                        className={`p-5 rounded-3xl border transition-all ${
                          isSolved
                            ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg'
                            : 'bg-slate-900 border-slate-800 shadow-md'
                        }`}
                      >
                        {/* Header of Exercise */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                              #{ex.number}
                            </span>
                            <h4 className="font-bold text-sm text-white">
                              {ex.title}
                            </h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              ex.difficulty === 'easy'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : ex.difficulty === 'medium'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            }`}>
                              {ex.difficulty.toUpperCase()}
                            </span>
                          </div>

                          <button
                            onClick={() => toggleExerciseComplete(ex.id)}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              isSolved
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                                : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                            }`}
                            title={isSolved ? (isFr ? 'Marqué comme réussi' : 'Marked as solved') : (isFr ? 'Marquer comme réussi' : 'Mark as solved')}
                          >
                            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>

                        {/* Question Text */}
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans mb-4">
                          {ex.question}
                        </div>

                        {/* Key Formulas */}
                        {ex.keyFormulas && ex.keyFormulas.length > 0 && (
                          <div className="mb-4 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                              {isFr ? 'Formules Clés / Propriétés :' : 'Key Formulas :'}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {ex.keyFormulas.map((f, idx) => (
                                <span key={idx} className="font-mono text-xs px-2 py-0.5 rounded-md bg-indigo-900/50 text-indigo-200 border border-indigo-400/20">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons: Hint, Solution, Blocknote */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                          {/* Hint Toggle */}
                          {ex.hints.length > 0 && (
                            <button
                              onClick={() => toggleHint(ex.id)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isHintRevealed ? (isFr ? 'Masquer Indice' : 'Hide Hint') : (isFr ? 'Indice de Résolution' : 'Show Hint')}</span>
                            </button>
                          )}

                          {/* Solution Reveal Toggle */}
                          <button
                            onClick={() => toggleSolution(ex.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                          >
                            {isSolRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{isSolRevealed ? (isFr ? 'Masquer Corrigé' : 'Hide Solution') : (isFr ? 'Voir Corrigé Détaillé' : 'View Full Solution')}</span>
                          </button>

                          {/* Export to Blocknote */}
                          {onOpenDocInBlocknote && (
                            <button
                              onClick={() => handleExportToBlocknote(ex, selectedChapter, selectedBook)}
                              className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all border border-amber-400/30 cursor-pointer ml-auto"
                              title={isFr ? 'Copier cet exercice vers le Bloc-Notes Cahier' : 'Copy exercise to Blocknote'}
                            >
                              <FileText className="w-3.5 h-3.5 text-amber-300" />
                              <span>{isFr ? 'Exporter en Fiche Cahier' : 'Export to Blocknote'}</span>
                            </button>
                          )}
                        </div>

                        {/* Hints Box */}
                        {isHintRevealed && (
                          <div className="mt-3 p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2 animate-in fade-in duration-150">
                            <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{isFr ? 'Indication Méthodique :' : 'Hint:'}</span>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                              {ex.hints.map((h, i) => (
                                <li key={i}>{h}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Step-by-Step Solved Solution Box */}
                        {isSolRevealed && (
                          <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                              <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>{isFr ? 'Corrigé Pas-à-Pas Officiel' : 'Step-by-Step Solution'}</span>
                              </h5>
                              <span className="text-[10px] font-mono text-slate-400">
                                {ex.solution.length} {isFr ? 'étapes' : 'steps'}
                              </span>
                            </div>

                            <div className="space-y-3">
                              {ex.solution.map((sol) => (
                                <div key={sol.stepNumber} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                                  <div className="text-xs font-bold text-amber-300">
                                    Étape {sol.stepNumber} :
                                  </div>
                                  <p className="text-xs text-slate-200 leading-relaxed">
                                    {sol.explanation}
                                  </p>
                                  {sol.formulaOrCalculation && (
                                    <div className="p-2 rounded-lg bg-black/60 font-mono text-xs text-indigo-300 border border-indigo-400/20">
                                      {sol.formulaOrCalculation}
                                    </div>
                                  )}
                                  <div className="text-xs font-semibold text-emerald-400">
                                    ✓ {sol.result}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/40 text-slate-400">
                <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p>{isFr ? 'Sélectionnez un chapitre dans la liste à gauche.' : 'Select a chapter on the left to view exercises.'}</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
