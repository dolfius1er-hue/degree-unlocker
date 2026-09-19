import React, { useState, useEffect, useRef } from 'react';
import { SchoolDocument, AppLanguage, QuizQuestion, QuizScoreRecord, AppTheme, Flashcard } from '../types';
import { fetchJsonWithRetry } from '../lib/api-utils';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Trophy, 
  Timer, 
  Award, 
  BookOpen, 
  Volume2, 
  Mic, 
  MicOff, 
  FileText, 
  BarChart2, 
  Clock, 
  Share2, 
  Printer, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle,
  Brain,
  Zap,
  ArrowRight,
  ListOrdered,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Filter,
  Layers,
  Flame,
  Keyboard,
  Compass,
  CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { soundFx } from '../utils/soundEffects';
import { offlineStorageService } from '../services/offlineStorageService';

interface QuizViewProps {
  documents: SchoolDocument[];
  selectedDocumentId?: string;
  lang?: AppLanguage;
  onOpenDocInBlocknote?: (doc: SchoolDocument) => void;
  activeTheme?: AppTheme;
}

export const QuizView: React.FC<QuizViewProps> = ({
  documents,
  selectedDocumentId,
  lang = 'fr',
  onOpenDocInBlocknote,
  activeTheme = 'light',
}) => {
  // Document selection & source mode
  const [sourceMode, setSourceMode] = useState<'doc' | 'topic' | 'custom'>('topic');
  const [selectedDocId, setSelectedDocId] = useState<string>(
    selectedDocumentId || (documents.length > 0 ? documents[0].id : '')
  );
  const [topicInput, setTopicInput] = useState('Histoire - Guerres mondiales et relations internationales');
  const [customText, setCustomText] = useState('');
  const [useCustomText, setUseCustomText] = useState(false);

  // Quiz configuration
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  // Learning Mode: 'exam' (hide solutions until end) vs 'practice' (instant pedagogical feedback)
  const [practiceMode, setPracticeMode] = useState<boolean>(true);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Review Filter after submission: 'all' | 'errors' | 'correct' | 'flagged'
  const [reviewFilter, setReviewFilter] = useState<'all' | 'errors' | 'correct' | 'flagged'>('all');
  const [isCopied, setIsCopied] = useState(false);
  const [isFlashcardsCreated, setIsFlashcardsCreated] = useState(false);

  // Timer
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // History & Score tracking
  const [history, setHistory] = useState<QuizScoreRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Audio transcription feature with gemini-3.5-transcribe
  const [isRecording, setIsRecording] = useState(false);
  const [transcribingAudio, setTranscribingAudio] = useState(false);
  const [transcribedNote, setTranscribedNote] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Current active document
  const activeDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  // Load past quiz history from API and IndexedDB
  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      // 1. Fetch from server
      const data = await fetchJsonWithRetry<{ history: QuizScoreRecord[] }>('/api/quiz/history');
      if (data && data.history && Array.isArray(data.history)) {
        setHistory(data.history);
        // Sync into IndexedDB
        for (const rec of data.history) {
          await offlineStorageService.saveQuizResult(rec);
        }
      } else {
        // Fallback to local storage
        const localResults = await offlineStorageService.getAllQuizResults();
        if (localResults.length > 0) setHistory(localResults);
      }
    } catch (err) {
      console.warn('Network fetch for quiz history failed, reading IndexedDB:', err);
      try {
        const localResults = await offlineStorageService.getAllQuizResults();
        if (localResults.length > 0) setHistory(localResults);
      } catch (e) {
        console.error('Failed to read local quiz results:', e);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Update selected doc if prop changes
  useEffect(() => {
    if (selectedDocumentId) {
      setSelectedDocId(selectedDocumentId);
      setSourceMode('doc');
    }
  }, [selectedDocumentId]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && !isSubmitted) {
      interval = setInterval(() => {
        setTimeSpentSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, isSubmitted]);

  // Keyboard navigation for lightning-fast, smooth study sessions
  useEffect(() => {
    if (questions.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const key = e.key.toLowerCase();

      // Quick Answer Options: 1, 2, 3, 4 or A, B, C, D (or AZERTY top row &, é, ", ')
      if (['1', 'a', '&'].includes(key)) {
        e.preventDefault();
        handleSelectOption(currentQuestionIndex, 0);
      } else if (['2', 'b', 'é'].includes(key)) {
        e.preventDefault();
        handleSelectOption(currentQuestionIndex, 1);
      } else if (['3', 'c', '"'].includes(key)) {
        e.preventDefault();
        handleSelectOption(currentQuestionIndex, 2);
      } else if (['4', 'd', "'"].includes(key)) {
        e.preventDefault();
        handleSelectOption(currentQuestionIndex, 3);
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        if (currentQuestionIndex < questions.length - 1) {
          soundFx.playClick(750);
          setCurrentQuestionIndex(prev => prev + 1);
        } else if (!isSubmitted && !practiceMode) {
          handleSubmitQuiz();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentQuestionIndex > 0) {
          soundFx.playClick(650);
          setCurrentQuestionIndex(prev => prev - 1);
        }
      } else if (key === 'f') {
        e.preventDefault();
        toggleFlagQuestion(currentQuestionIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [questions, currentQuestionIndex, isSubmitted, practiceMode]);

  // Flag or bookmark question
  const toggleFlagQuestion = (idx: number) => {
    soundFx.playClick(880);
    setFlaggedQuestions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Generate Quiz from document, topic or custom text
  const handleGenerateQuiz = async (overrideTopic?: string) => {
    soundFx.playClick(950);
    setIsLoading(true);
    setError(null);
    setIsSubmitted(false);
    setSelectedAnswers({});
    setFlaggedQuestions({});
    setCurrentQuestionIndex(0);
    setTimeSpentSeconds(0);
    setReviewFilter('all');
    setIsCopied(false);
    setIsFlashcardsCreated(false);

    const activeTopic = (typeof overrideTopic === 'string' ? overrideTopic : topicInput).trim();

    try {
      const payload: any = {
        questionCount,
        difficulty,
        language: lang,
      };

      if (sourceMode === 'topic' || overrideTopic) {
        if (!activeTopic) {
          throw new Error(lang === 'fr' ? 'Veuillez saisir un sujet ou une notion à tester.' : 'Please enter a topic or concept to test.');
        }
        payload.content = activeTopic;
        payload.title = `Quiz: ${activeTopic}`;
        payload.subject = 'Général';
      } else if (sourceMode === 'custom' && customText.trim().length >= 2) {
        payload.content = customText;
        payload.title = lang === 'fr' ? 'Texte Personnalisé' : 'Custom Text';
        payload.subject = 'General';
      } else if (sourceMode === 'doc' && activeDoc) {
        payload.documentId = activeDoc.id;
        payload.content = activeDoc.content;
        payload.title = activeDoc.title;
        payload.subject = activeDoc.subject;
      } else if (activeDoc) {
        payload.documentId = activeDoc.id;
        payload.content = activeDoc.content;
        payload.title = activeDoc.title;
        payload.subject = activeDoc.subject;
      } else {
        throw new Error(lang === 'fr' ? 'Veuillez sélectionner un cours ou saisir un sujet.' : 'Please select a document or enter a topic.');
      }

      const data = await fetchJsonWithRetry<{ questions: QuizQuestion[]; error?: string }>('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }, { retries: 3, initialDelayMs: 600 });

      if (data && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setIsTimerActive(true);
        soundFx.playSuccess();
      } else {
        throw new Error(data?.error || (lang === 'fr' ? 'Aucune question générée.' : 'No questions generated.'));
      }
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      soundFx.playError();
      const isUnavailable = err.message?.includes('503') || err.message?.includes('high demand') || err.status === 503;
      if (isUnavailable) {
        setError(lang === 'fr' 
          ? 'Le service d’IA est temporairement surchargé (503). Veuillez réessayer dans quelques secondes.'
          : 'AI service is temporarily experiencing high load (503). Retrying momentarily...');
      } else {
        setError(err.message || (lang === 'fr' ? 'Erreur lors de la génération du quiz.' : 'Failed to generate quiz.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Option selection with smooth sound and immediate feedback
  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (isSubmitted) return;

    // If in practice mode and already answered, don't re-select unless changing
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));

    const q = questions[questionIdx];
    if (practiceMode && q) {
      if (optionIdx === q.correctAnswerIndex) {
        soundFx.playSuccess();
      } else {
        soundFx.playError();
      }
    } else {
      soundFx.playClick(800 + optionIdx * 50);
    }
  };

  // Submit quiz & save score
  const handleSubmitQuiz = async () => {
    setIsSubmitted(true);
    setIsTimerActive(false);

    // Calculate score
    let score = 0;
    const userAnswers = questions.map((q, idx) => {
      const selected = selectedAnswers[idx] ?? -1;
      const isCorrect = selected === q.correctAnswerIndex;
      if (isCorrect) score += 1;
      return {
        questionId: q.id,
        selectedIndex: selected,
        isCorrect,
      };
    });

    const total = questions.length;
    const percentage = Math.round((score / total) * 100);

    // Sound and celebration
    if (percentage === 100) {
      soundFx.playLockIn();
    } else if (percentage >= 70) {
      soundFx.playChime();
    } else {
      soundFx.playSuccess();
    }

    if (percentage >= 70) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
      });
    }

    // Save score to local disk and IndexedDB
    const record: QuizScoreRecord = {
      id: `quiz-${Date.now()}`,
      docId: activeDoc ? activeDoc.id : 'custom',
      docTitle: activeDoc ? activeDoc.title : (topicInput || 'Quiz Rapide'),
      subject: activeDoc ? activeDoc.subject : 'General',
      score,
      totalQuestions: total,
      percentage,
      timestamp: new Date().toISOString(),
      userAnswers,
    };

    try {
      // 1. Save directly to IndexedDB
      await offlineStorageService.saveQuizResult(record);

      // 2. Sync to local backend file
      await fetchJsonWithRetry('/api/quiz/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });

      loadHistory();
    } catch (err) {
      console.warn('Local save succeeded, backend note:', err);
    }
  };

  // Restart quiz with only failed questions (Targeted Remediation)
  const handleRetakeMistakes = () => {
    const failedQuestions = questions.filter((q, idx) => selectedAnswers[idx] !== q.correctAnswerIndex);
    if (failedQuestions.length === 0) return;

    soundFx.playLockIn();
    setQuestions(failedQuestions);
    setSelectedAnswers({});
    setFlaggedQuestions({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setTimeSpentSeconds(0);
    setIsTimerActive(true);
    setReviewFilter('all');
  };

  // Export as Flashcards directly to offline store
  const handleExportToFlashcards = async () => {
    soundFx.playSuccess();
    const newCards: Flashcard[] = questions.map((q, i) => ({
      id: `fc-quiz-${Date.now()}-${i}`,
      question: q.question,
      answer: `**Réponse exacte :** ${q.options[q.correctAnswerIndex]}\n\n*Explication :* ${q.explanation}`,
      tags: [activeDoc ? activeDoc.subject : 'Quiz', q.conceptTested || 'Revision'],
      difficulty: q.difficulty || 'medium',
      box: 1,
      intervalDays: 1,
      repetitionCount: 0,
      consecutiveCorrect: 0,
      nextReviewDate: new Date().toISOString().split('T')[0],
      subject: activeDoc ? activeDoc.subject : 'Général',
      docId: activeDoc ? activeDoc.id : undefined,
      docTitle: activeDoc ? activeDoc.title : undefined,
    }));

    try {
      const existing = await offlineStorageService.getAllFlashcards();
      await offlineStorageService.saveAllFlashcards([...existing, ...newCards]);
      setIsFlashcardsCreated(true);
      setTimeout(() => setIsFlashcardsCreated(false), 3000);
    } catch (e) {
      console.error('Failed to create flashcards:', e);
    }
  };

  // Copy questions as Markdown
  const handleCopyMarkdown = () => {
    soundFx.playClick(900);
    const text = questions.map((q, idx) => {
      const opts = q.options.map((opt, oIdx) => `   ${String.fromCharCode(65 + oIdx)}) ${opt}`).join('\n');
      return `### Question ${idx + 1} (${q.conceptTested || 'Notion'})\n${q.question}\n\n${opts}\n\n> **Corrigé :** Option ${String.fromCharCode(65 + q.correctAnswerIndex)} - ${q.options[q.correctAnswerIndex]}\n> **Explication :** ${q.explanation}\n`;
    }).join('\n---\n\n');

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Speech synthesis
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Microphone Audio Transcription (gemini-3.5-transcribe)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setTranscribingAudio(true);
          try {
            const data = await fetchJsonWithRetry<{ text?: string }>('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ base64Audio, mimeType: 'audio/webm' }),
            }, { retries: 2 });
            if (data && data.text) {
              setTranscribedNote(data.text);
              if (useCustomText || sourceMode === 'custom') {
                setCustomText(prev => (prev ? `${prev}\n${data.text}` : data.text));
              } else {
                setTopicInput(data.text);
              }
            }
          } catch (err) {
            console.error('Transcription failed:', err);
          } finally {
            setTranscribingAudio(false);
          }
        };

        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      soundFx.playClick(800);
    } catch (err) {
      console.error('Audio permission error:', err);
      soundFx.playError();
      alert(lang === 'fr' ? 'Accès au microphone requis.' : 'Microphone access required.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      soundFx.playClick(600);
    }
  };

  // Format timer
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Question calculations
  const answeredCount = Object.keys(selectedAnswers).length;
  const currentQ = questions[currentQuestionIndex];
  const totalQ = questions.length;
  let correctCount = 0;
  if (isSubmitted) {
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) correctCount += 1;
    });
  }

  const missedCount = totalQ - correctCount;

  // Filter questions for final review list
  const filteredIndices = questions.map((_, i) => i).filter(idx => {
    if (reviewFilter === 'errors') return selectedAnswers[idx] !== questions[idx].correctAnswerIndex;
    if (reviewFilter === 'correct') return selectedAnswers[idx] === questions[idx].correctAnswerIndex;
    if (reviewFilter === 'flagged') return flaggedQuestions[idx] === true;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* HEADER BANNER WITH CYBER ACADEMIC DESIGN */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{lang === 'fr' ? 'Studio de Questions & QCM Haut Niveau' : 'Authentic Exam Questions & Active Recall'}</span>
              <span className="hidden sm:inline text-slate-400">|</span>
              <span className="hidden sm:inline text-amber-300 font-mono text-[10px]">Zero Dummy Data</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {lang === 'fr' ? 'Questions Optimisées & Auto-Évaluation' : 'Optimized Questions & Self-Assessment'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {lang === 'fr'
                ? "Générez des questions authentiques et rigoureuses issues directement de vos cours. Raccourcis clavier instantanés (A/B/C/D), mode entraînement avec feedback immédiat ou mode examen chronométré."
                : "Generate authentic, high-caliber exam questions directly from your syllabus. Rapid keyboard navigation (A/B/C/D), immediate training feedback, or timed exam simulations."}
            </p>
          </div>

          {/* Controls: Audio Dictation + Practice / Exam Mode toggle */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
            {/* Mode Toggle Button */}
            <div className="flex items-center bg-black/40 border border-slate-700/60 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick(850);
                  setPracticeMode(true);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  practiceMode 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title={lang === 'fr' ? 'Feedback immédiat et explications à chaque clic' : 'Immediate feedback on each answer'}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Entraînement' : 'Practice'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick(900);
                  setPracticeMode(false);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  !practiceMode 
                    ? 'bg-amber-500 text-black shadow-md font-extrabold' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title={lang === 'fr' ? 'Conditions d’examen réelles avec corrigé final' : 'Timed exam conditions with final scorecard'}
              >
                <Timer className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Mode Examen' : 'Exam Mode'}</span>
              </button>
            </div>

            {/* Quick Audio Note Transcription */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={transcribingAudio}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all shadow-md border cursor-pointer ${
                isRecording 
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse' 
                  : 'bg-slate-800/90 hover:bg-slate-700 text-white border-slate-700'
              }`}
              title="Dicter une notion au microphone"
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-amber-400" />}
              <span>
                {transcribingAudio 
                  ? (lang === 'fr' ? 'Transcription IA...' : 'Transcribing...') 
                  : isRecording 
                    ? (lang === 'fr' ? 'Arrêter' : 'Stop') 
                    : (lang === 'fr' ? 'Dicter un cours' : 'Voice Dictation')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* QUIZ CONFIGURATION / GENERATOR PANEL */}
      {questions.length === 0 && (
        <div 
          data-no-drag
          onMouseDown={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>{lang === 'fr' ? 'Configurer vos Questions' : 'Configure Exam Questions'}</span>
            </h3>

            {/* 3 Source Modes */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <button
                type="button"
                data-no-drag
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick(800);
                  setSourceMode('topic');
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  sourceMode === 'topic' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-amber-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lang === 'fr' ? 'Sujet / Notion' : 'Topic / Concept'}
              </button>
              <button
                type="button"
                data-no-drag
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick(850);
                  setSourceMode('doc');
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  sourceMode === 'doc' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-amber-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lang === 'fr' ? 'Depuis un cours' : 'From a note'}
              </button>
              <button
                type="button"
                data-no-drag
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick(900);
                  setSourceMode('custom');
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  sourceMode === 'custom' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-amber-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lang === 'fr' ? 'Texte libre / dicté' : 'Custom / Voice text'}
              </button>
            </div>
          </div>

          {/* Mode 1: Free Topic Input with quick academic chips */}
          {sourceMode === 'topic' && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                {lang === 'fr' ? 'Sujet, concept ou chapitre à tester' : 'Topic, concept or chapter to test'}
              </label>
              <div className="relative">
                <input
                  id="quiz-topic-input"
                  type="text"
                  data-no-drag
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleGenerateQuiz();
                    }
                  }}
                  placeholder={lang === 'fr' ? 'Ex: La Guerre Froide 1947-1991, Suites géométriques, ATP synthase, Mécanique quantique...' : 'e.g. World War II, Quadratic equations, Mitosis & Meiosis, Cell respiration...'}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                />
                {topicInput && (
                  <button
                    type="button"
                    data-no-drag
                    onClick={() => {
                      soundFx.playClick(600);
                      setTopicInput('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white px-2 py-1 rounded-md"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Fast Academic Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500" />
                  {lang === 'fr' ? 'Suggestions de pointe :' : 'Curriculum presets:'}
                </span>
                {[
                  { label: 'Histoire : Guerres mondiales', query: 'Histoire de France - Les deux Guerres Mondiales et la reconstruction' },
                  { label: 'Maths : Analyse & Dérivées', query: 'Mathématiques - Dérivation, limites et suites numériques' },
                  { label: 'SVT : Génétique & Méiose', query: 'SVT - Génétique, mitose, méiose et diversité des allèles' },
                  { label: 'Physique : Ondes & Optique', query: 'Physique-Chimie - Ondes mécaniques, électromagnétiques et optique' },
                  { label: 'Philo : Conscience & Liberté', query: 'Philosophie - La conscience, l’inconscient et la liberté morale' },
                  { label: 'Anglais : Vocabulaire B2/C1', query: 'Anglais - Vocabulaire académique et idiomes B2/C1' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    data-no-drag
                    onClick={(e) => {
                      e.stopPropagation();
                      setTopicInput(chip.query);
                      handleGenerateQuiz(chip.query);
                    }}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-700 dark:hover:text-amber-400 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                  >
                    ⚡ {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mode 2: Select Course Document */}
          {sourceMode === 'doc' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                {lang === 'fr' ? 'Choisir le cours à évaluer' : 'Select course note to test'}
              </label>
              <select
                data-no-drag
                value={selectedDocId}
                onChange={(e) => {
                  soundFx.playClick(750);
                  setSelectedDocId(e.target.value);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-3 text-sm text-slate-800 dark:text-white font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    [{doc.subject}] {doc.title} ({doc.date})
                  </option>
                ))}
              </select>
              {activeDoc && (
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  {activeDoc.content.slice(0, 220)}...
                </p>
              )}
            </div>
          )}

          {/* Mode 3: Custom Text / Voice transcription */}
          {sourceMode === 'custom' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {lang === 'fr' ? 'Texte du cours ou extrait à tester' : 'Course text or excerpt to test'}
                </label>
                {transcribedNote && (
                  <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCheck className="w-3.5 h-3.5" />
                    {lang === 'fr' ? 'Dictée audio transcrite' : 'Voice transcription added'}
                  </span>
                )}
              </div>
              <textarea
                data-no-drag
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder={lang === 'fr' ? 'Collez un extrait de cours, un chapitre d’histoire, un théorème ou utilisez le micro ci-dessus...' : 'Paste any chapter text, math theorem, or record via microphone...'}
                className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none font-sans"
              />
            </div>
          )}

          {/* Options: Count & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">
                {lang === 'fr' ? 'Nombre de questions' : 'Number of questions'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    data-no-drag
                    onClick={() => {
                      soundFx.playClick(800 + num * 20);
                      setQuestionCount(num);
                    }}
                    className={`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                      questionCount === num
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-102'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">
                {lang === 'fr' ? 'Niveau d’exigence académique' : 'Academic difficulty level'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    data-no-drag
                    onClick={() => {
                      soundFx.playClick(900);
                      setDifficulty(diff);
                    }}
                    className={`py-2 text-xs font-black rounded-xl border capitalize transition-all cursor-pointer ${
                      difficulty === diff
                        ? 'bg-amber-500 text-black border-amber-500 shadow-md scale-102 font-black'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {diff === 'easy' ? (lang === 'fr' ? 'Fondations' : 'Basic') : diff === 'medium' ? (lang === 'fr' ? 'Standard' : 'Medium') : (lang === 'fr' ? 'Concours / Élite' : 'Advanced')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              id="btn-generate-quiz"
              onClick={() => handleGenerateQuiz()}
              disabled={isLoading}
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-sm font-black inline-flex items-center gap-2.5 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : 'text-amber-400'}`} />
              <span>
                {isLoading 
                  ? (lang === 'fr' ? 'Génération haute précision des questions...' : 'Synthesizing Examination Questions...') 
                  : (lang === 'fr' ? 'Lancer les Questions 🚀' : 'Launch Assessment 🚀')}
              </span>
            </button>

            {error && (
              <p className="text-xs text-rose-500 font-bold flex items-center gap-1.5 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/30">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* ACTIVE QUIZ INTERFACE WITH ULTRA-SMOOTH CONTROLS */}
      {questions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {/* Top Control Bar: Progress, Timer, Keyboard navigation indicator & Modes */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-amber-400 bg-indigo-50 dark:bg-slate-800 px-3 py-1 rounded-xl border border-indigo-200 dark:border-slate-700">
                {lang === 'fr' ? 'Question' : 'Question'} {currentQuestionIndex + 1} / {totalQ}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {answeredCount} / {totalQ} {lang === 'fr' ? 'répondu(es)' : 'completed'}
              </span>
              {practiceMode ? (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {lang === 'fr' ? 'Mode Entraînement' : 'Practice Mode'}
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {lang === 'fr' ? 'Mode Examen' : 'Exam Mode'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {/* Keyboard quick hint */}
              <div className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <Keyboard className="w-3.5 h-3.5 text-indigo-500" />
                <span>Touches 1-4 ou A-D</span>
              </div>

              {/* Timer badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-mono font-bold border border-slate-200 dark:border-slate-700">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>{formatTime(timeSpentSeconds)}</span>
              </div>

              {/* Flag / Bookmark button */}
              <button
                type="button"
                onClick={() => toggleFlagQuestion(currentQuestionIndex)}
                className={`p-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  flaggedQuestions[currentQuestionIndex]
                    ? 'bg-amber-500/20 text-amber-400 border-amber-400/50 shadow-sm'
                    : 'text-slate-400 hover:text-amber-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={lang === 'fr' ? 'Marquer pour revoir plus tard (Touche F)' : 'Flag for review (F key)'}
              >
                <Bookmark className={`w-4 h-4 ${flaggedQuestions[currentQuestionIndex] ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>

              {/* Abandon button */}
              <button
                onClick={() => {
                  soundFx.playClick(600);
                  if (confirm(lang === 'fr' ? 'Voulez-vous réinitialiser et choisir un autre sujet ?' : 'Abandon and select another topic?')) {
                    setQuestions([]);
                    setIsTimerActive(false);
                  }
                }}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer"
              >
                ✕ {lang === 'fr' ? 'Changer' : 'Exit'}
              </button>
            </div>
          </div>

          {/* Smooth Question Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / totalQ) * 100}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>

          {/* Question Index Pills Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {questions.map((q, idx) => {
              const isAnswered = selectedAnswers[idx] !== undefined;
              const isCurrent = idx === currentQuestionIndex;
              const isFlagged = flaggedQuestions[idx] === true;
              const isCorrect = (isSubmitted || practiceMode) && isAnswered && selectedAnswers[idx] === q.correctAnswerIndex;
              const isWrong = (isSubmitted || practiceMode) && isAnswered && !isCorrect;

              let btnClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700';
              if (isCurrent) {
                btnClass = 'ring-2 ring-indigo-500 dark:ring-amber-400 bg-indigo-50 dark:bg-slate-700 text-indigo-700 dark:text-amber-400 font-black shadow-sm';
              } else if (isSubmitted || (practiceMode && isAnswered)) {
                if (isCorrect) btnClass = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-400/40';
                else if (isWrong) btnClass = 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold border border-rose-400/40';
              } else if (isAnswered) {
                btnClass = 'bg-indigo-600 text-white font-bold';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    soundFx.playClick(800 + idx * 25);
                    setCurrentQuestionIndex(idx);
                  }}
                  className={`w-9 h-9 rounded-xl text-xs transition-all shrink-0 flex items-center justify-center font-mono relative cursor-pointer ${btnClass}`}
                >
                  <span>{idx + 1}</span>
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Current Question Box with Smooth Motion Animation */}
          <AnimatePresence mode="wait">
            {currentQ && (
              <motion.div 
                key={currentQ.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="space-y-4 pt-1"
              >
                <div className="flex items-start justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-amber-400 bg-indigo-500/10 dark:bg-amber-400/10 px-2.5 py-0.5 rounded-md">
                        {lang === 'fr' ? 'Notion testée :' : 'Concept tested:'} {currentQ.conceptTested}
                      </span>
                      {flaggedQuestions[currentQuestionIndex] && (
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Bookmark className="w-3 h-3 fill-amber-500" />
                          {lang === 'fr' ? 'Marquée' : 'Flagged'}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed">
                      {currentQ.question}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playClick(900);
                      speakText(currentQ.question);
                    }}
                    className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shrink-0 cursor-pointer shadow-xs"
                    title={lang === 'fr' ? 'Écouter la question (synthèse vocale)' : 'Read question aloud'}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Options A, B, C, D with tactile feedback */}
                <div className="grid grid-cols-1 gap-3 pt-2">
                  {currentQ.options.map((option, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                    const isCorrectAnswer = optIdx === currentQ.correctAnswerIndex;
                    const showFeedback = isSubmitted || (practiceMode && selectedAnswers[currentQuestionIndex] !== undefined);
                    
                    let optionStyles = 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-indigo-50/60 dark:hover:bg-slate-700/60 hover:border-indigo-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200';
                    if (isSelected) {
                      optionStyles = 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-600 dark:border-amber-400 text-indigo-950 dark:text-white ring-2 ring-indigo-600/30 dark:ring-amber-400/30 font-bold shadow-sm';
                    }

                    if (showFeedback) {
                      if (isCorrectAnswer) {
                        optionStyles = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-black ring-2 ring-emerald-500/40 shadow-sm';
                      } else if (isSelected && !isCorrectAnswer) {
                        optionStyles = 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-950 dark:text-rose-200 font-bold line-through opacity-85';
                      } else {
                        optionStyles = 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isSubmitted}
                        onClick={() => handleSelectOption(currentQuestionIndex, optIdx)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 text-sm cursor-pointer active:scale-[0.99] ${optionStyles}`}
                      >
                        <div className="flex items-center gap-3.5">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 transition-all ${
                            isSelected 
                              ? 'bg-indigo-600 dark:bg-amber-400 text-white dark:text-black shadow-sm scale-105' 
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {letter}
                          </span>
                          <span className="leading-relaxed font-medium">{option}</span>
                        </div>

                        {showFeedback && (
                          <div className="shrink-0">
                            {isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                            {isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-rose-500" />}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box (Revealed in Practice mode on answer or on full submit) */}
                {(isSubmitted || (practiceMode && selectedAnswers[currentQuestionIndex] !== undefined)) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/70 border border-indigo-200/70 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      {selectedAnswers[currentQuestionIndex] === currentQ.correctAnswerIndex ? (
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          {lang === 'fr' ? 'Excellente réponse (Validée) !' : 'Correct answer!'}
                        </span>
                      ) : (
                        <span className="text-xs font-black text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-rose-500" />
                          {lang === 'fr' ? 'Piège ou erreur conceptuelle' : 'Incorrect answer'}
                        </span>
                      )}

                      <button
                        onClick={() => speakText(currentQ.explanation)}
                        className="text-[11px] font-bold text-indigo-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <Volume2 className="w-3 h-3" />
                        {lang === 'fr' ? 'Écouter' : 'Listen'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                      <strong className="text-slate-900 dark:text-white font-bold">{lang === 'fr' ? 'Analyse pédagogique :' : 'Pedagogical explanation:'}</strong> {currentQ.explanation}
                    </p>
                  </motion.div>
                )}

                {/* Bottom Navigation & Validation Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      soundFx.playClick(700);
                      setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
                    }}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer inline-flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{lang === 'fr' ? 'Précédent' : 'Previous'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {currentQuestionIndex < totalQ - 1 ? (
                      <button
                        onClick={() => {
                          soundFx.playClick(800);
                          setCurrentQuestionIndex(prev => Math.min(totalQ - 1, prev + 1));
                        }}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl inline-flex items-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
                      >
                        <span>{lang === 'fr' ? 'Suivant' : 'Next'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : !isSubmitted ? (
                      <button
                        id="btn-submit-quiz"
                        onClick={handleSubmitQuiz}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl inline-flex items-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{lang === 'fr' ? 'Valider et Clôturer l’Évaluation' : 'Submit & Review Score'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          soundFx.playClick(900);
                          setQuestions([]);
                          setIsSubmitted(false);
                        }}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{lang === 'fr' ? 'Nouveau Thème' : 'New Topic'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FINAL RESULTS SCORE CARD WITH SMART MISTAKE FILTER & ANKI BRIDGE */}
          {isSubmitted && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-500/40 shadow-2xl space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/60 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg flex items-center justify-center shrink-0">
                    <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-amber-400" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                      {lang === 'fr' ? 'Bilan de l’Évaluation' : 'Assessment Summary'}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white">
                      {correctCount} / {totalQ} ({Math.round((correctCount / totalQ) * 100)}%)
                    </h3>
                    <p className="text-xs text-slate-300">
                      {correctCount === totalQ
                        ? (lang === 'fr' ? 'Parfait ! Maîtrise intégrale du sujet validée.' : 'Flawless score! Full mastery achieved.')
                        : (lang === 'fr' ? `${missedCount} question(s) à consolider.` : `${missedCount} question(s) to review.`)}
                    </p>
                  </div>
                </div>

                {/* Remediation & Export Action Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  {missedCount > 0 && (
                    <button
                      onClick={handleRetakeMistakes}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-black inline-flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-black" />
                      <span>{lang === 'fr' ? `Réviser les erreurs (${missedCount})` : `Retake mistakes (${missedCount})`}</span>
                    </button>
                  )}

                  <button
                    onClick={handleExportToFlashcards}
                    className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border border-indigo-400/40 transition-all cursor-pointer"
                    title="Sauvegarder ces questions comme flashcards SRS"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{isFlashcardsCreated ? (lang === 'fr' ? 'Flashcards créées !' : 'Flashcards Saved!') : (lang === 'fr' ? 'Créer Flashcards' : 'To Flashcards')}</span>
                  </button>

                  <button
                    onClick={handleCopyMarkdown}
                    className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                    title="Copier le quiz au format Markdown"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? (lang === 'fr' ? 'Copié !' : 'Copied!') : (lang === 'fr' ? 'Copier Markdown' : 'Copy')}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{lang === 'fr' ? 'Imprimer / PDF' : 'Print'}</span>
                  </button>
                </div>
              </div>

              {/* Review Filter Tabs */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-bold mr-1 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-indigo-400" />
                    {lang === 'fr' ? 'Afficher :' : 'Filter:'}
                  </span>
                  {[
                    { key: 'all', label: `${lang === 'fr' ? 'Toutes' : 'All'} (${totalQ})` },
                    { key: 'errors', label: `${lang === 'fr' ? 'Erreurs' : 'Mistakes'} (${missedCount})` },
                    { key: 'correct', label: `${lang === 'fr' ? 'Réussies' : 'Correct'} (${correctCount})` },
                    { key: 'flagged', label: `${lang === 'fr' ? 'Marquées' : 'Flagged'} (${Object.values(flaggedQuestions).filter(Boolean).length})` },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        soundFx.playClick(800);
                        setReviewFilter(tab.key as any);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        reviewFilter === tab.key
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-800/80 text-slate-300 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Filtered Question Review Cards */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {filteredIndices.map(qIdx => {
                    const q = questions[qIdx];
                    const selected = selectedAnswers[qIdx];
                    const isRight = selected === q.correctAnswerIndex;

                    return (
                      <div 
                        key={q.id}
                        className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
                          isRight 
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100' 
                            : 'bg-rose-950/30 border-rose-500/40 text-rose-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-sm text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-mono text-xs">
                              {qIdx + 1}
                            </span>
                            <span>{q.question}</span>
                          </p>
                          {isRight ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                          <p>
                            <span className="text-slate-400">{lang === 'fr' ? 'Votre réponse : ' : 'Your answer: '}</span>
                            <span className={`font-bold ${isRight ? 'text-emerald-300' : 'text-rose-300'}`}>
                              {selected !== undefined ? `${String.fromCharCode(65 + selected)}) ${q.options[selected]}` : (lang === 'fr' ? 'Non répondu' : 'Skipped')}
                            </span>
                          </p>
                          {!isRight && (
                            <p>
                              <span className="text-slate-400">{lang === 'fr' ? 'Réponse attendue : ' : 'Correct: '}</span>
                              <span className="font-bold text-emerald-300">
                                {String.fromCharCode(65 + q.correctAnswerIndex)}) {q.options[q.correctAnswerIndex]}
                              </span>
                            </p>
                          )}
                        </div>

                        <p className="text-slate-300 pt-1 border-t border-white/10 italic text-[11px]">
                          <strong>Explication :</strong> {q.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-indigo-800/60 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
                <span>
                  <strong>{lang === 'fr' ? 'Temps total :' : 'Total time:'}</strong> {formatTime(timeSpentSeconds)}
                </span>
                <span className="text-emerald-400 font-mono text-[11px]">
                  ✓ {lang === 'fr' ? 'Enregistré dans IndexedDB & Disque local' : 'Stored in IndexedDB & Local disk'}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* QUIZ SCORE HISTORY & PROGRESSION (Saved in IndexedDB + Local PC Disk) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-amber-400" />
            <span>{lang === 'fr' ? 'Historique Authentique des Évaluations' : 'Recorded Assessment History'}</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            {history.length} {lang === 'fr' ? 'sessions enregistrées' : 'recorded sessions'}
          </span>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center border border-slate-200/50 dark:border-slate-800">
            {lang === 'fr' 
              ? 'Aucun quiz enregistré pour le moment. Lancez votre première évaluation ci-dessus !' 
              : 'No recorded assessments yet. Launch your first assessment above!'}
          </p>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {history.map((rec) => (
              <div
                key={rec.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{rec.docTitle}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-2">
                    <span className="font-bold text-indigo-700 dark:text-amber-400 bg-indigo-50 dark:bg-slate-700 px-2 py-0.5 rounded border border-indigo-200/60 dark:border-slate-600">
                      {rec.subject}
                    </span>
                    <span>{new Date(rec.timestamp).toLocaleDateString()} à {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1.5 rounded-xl font-black text-xs ${
                    rec.percentage >= 80 
                      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-400/30' 
                      : rec.percentage >= 50 
                        ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-400/30' 
                        : 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-400/30'
                  }`}>
                    {rec.score} / {rec.totalQuestions} ({rec.percentage}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
