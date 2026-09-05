import React, { useState, useEffect, useRef } from 'react';
import { SchoolDocument, AppLanguage, QuizQuestion, QuizScoreRecord } from '../types';
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
  AlertCircle,
  Brain,
  Zap,
  ArrowRight,
  ListOrdered
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizViewProps {
  documents: SchoolDocument[];
  selectedDocumentId?: string;
  lang?: AppLanguage;
  onOpenDocInBlocknote?: (doc: SchoolDocument) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  documents,
  selectedDocumentId,
  lang = 'fr',
  onOpenDocInBlocknote,
}) => {
  // Document selection
  const [selectedDocId, setSelectedDocId] = useState<string>(
    selectedDocumentId || (documents.length > 0 ? documents[0].id : '')
  );
  const [customText, setCustomText] = useState('');
  const [useCustomText, setUseCustomText] = useState(false);

  // Quiz configuration
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Load past quiz history from local PC disk
  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/quiz/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load quiz history:', err);
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

  // Generate Quiz from document or custom text
  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setIsSubmitted(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setTimeSpentSeconds(0);

    try {
      const payload: any = {
        questionCount,
        difficulty,
        language: lang,
      };

      if (useCustomText && customText.trim().length > 20) {
        payload.content = customText;
        payload.title = lang === 'fr' ? 'Texte Personnalisé' : 'Custom Text';
        payload.subject = 'General';
      } else if (activeDoc) {
        payload.documentId = activeDoc.id;
        payload.content = activeDoc.content;
        payload.title = activeDoc.title;
        payload.subject = activeDoc.subject;
      } else {
        throw new Error(lang === 'fr' ? 'Veuillez sélectionner un cours ou saisir un texte.' : 'Please select a document or enter text.');
      }

      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate quiz');
      }

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setIsTimerActive(true);
      } else {
        throw new Error(lang === 'fr' ? 'Aucune question générée.' : 'No questions generated.');
      }
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      setError(err.message || 'Erreur lors de la génération du quiz');
    } finally {
      setIsLoading(false);
    }
  };

  // Answer selection
  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
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

    // Confetti on good score
    if (percentage >= 70) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Save score to local disk
    try {
      const record: QuizScoreRecord = {
        id: `quiz-${Date.now()}`,
        docId: activeDoc ? activeDoc.id : 'custom',
        docTitle: activeDoc ? activeDoc.title : 'Texte libre',
        subject: activeDoc ? activeDoc.subject : 'General',
        score,
        totalQuestions: total,
        percentage,
        timestamp: new Date().toISOString(),
        userAnswers,
      };

      const res = await fetch('/api/quiz/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });

      if (res.ok) {
        loadHistory();
      }
    } catch (err) {
      console.error('Failed to save quiz score:', err);
    }
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
        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setTranscribingAudio(true);
          try {
            const res = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ base64Audio, mimeType: 'audio/webm' }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.text) {
                setTranscribedNote(data.text);
                if (useCustomText) {
                  setCustomText(prev => (prev ? `${prev}\n${data.text}` : data.text));
                }
              }
            }
          } catch (err) {
            console.error('Transcription failed:', err);
          } finally {
            setTranscribingAudio(false);
          }
        };

        // Stop all tracks
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error('Audio permission error:', err);
      alert(lang === 'fr' ? 'Accès au microphone requis.' : 'Microphone access required.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Format timer
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Calculate score summary
  const answeredCount = Object.keys(selectedAnswers).length;
  const currentQ = questions[currentQuestionIndex];
  const totalQ = questions.length;
  let correctCount = 0;
  if (isSubmitted) {
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) correctCount += 1;
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-indigo-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-semibold">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>{lang === 'fr' ? 'Quiz & Auto-Évaluation IA (QCM)' : 'AI Quiz & Knowledge Assessment'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {lang === 'fr' ? 'Testez vos Connaissances' : 'Test Your Knowledge'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {lang === 'fr'
                ? "Générez des QCM intelligents et rigoureux à partir de vos cours et fiches. Évaluez votre compréhension, analysez les explications détaillées et suivez votre progression enregistrée sur votre PC."
                : "Generate rigorous multiple-choice assessments from any school note. Evaluate your mastery with in-depth feedback and track your score history on disk."}
            </p>
          </div>

          {/* Quick Audio Note Transcription button */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={transcribingAudio}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-xs border ${
                isRecording 
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse' 
                  : 'bg-indigo-800/80 hover:bg-indigo-700 text-white border-indigo-500/40'
              }`}
              title="Transcribe spoken questions or oral notes using gemini-3.5-transcribe"
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-300" />}
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
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              <span>{lang === 'fr' ? 'Générer un Nouveau Quiz' : 'Generate a New Quiz'}</span>
            </h3>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setUseCustomText(false)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  !useCustomText ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'fr' ? 'Depuis un cours' : 'From a note'}
              </button>
              <button
                onClick={() => setUseCustomText(true)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  useCustomText ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'fr' ? 'Texte libre / dicté' : 'Custom / Voice text'}
              </button>
            </div>
          </div>

          {/* Select Source */}
          {!useCustomText ? (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-600 block">
                {lang === 'fr' ? 'Choisir le cours à évaluer' : 'Select course note to test'}
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    [{doc.subject}] {doc.title} ({doc.date})
                  </option>
                ))}
              </select>
              {activeDoc && (
                <p className="text-xs text-slate-500 line-clamp-2 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {activeDoc.content.slice(0, 200)}...
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase text-slate-600">
                  {lang === 'fr' ? 'Texte du cours ou extrait à tester' : 'Course text or excerpt to test'}
                </label>
                {transcribedNote && (
                  <span className="text-[11px] text-emerald-600 font-medium">
                    ✓ {lang === 'fr' ? 'Dictée audio transcrite' : 'Voice transcription added'}
                  </span>
                )}
              </div>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder={lang === 'fr' ? 'Collez un extrait de cours, un chapitre d’histoire, un théorème ou utilisez le micro ci-dessus...' : 'Paste any chapter text, math theorem, or record via microphone...'}
                className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none font-sans"
              />
            </div>
          )}

          {/* Options: Count & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1.5">
                {lang === 'fr' ? 'Nombre de questions' : 'Number of questions'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      questionCount === num
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1.5">
                {lang === 'fr' ? 'Niveau de difficulté' : 'Difficulty level'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 text-xs font-bold rounded-lg border capitalize transition-all ${
                      difficulty === diff
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {diff === 'easy' ? (lang === 'fr' ? 'Facile' : 'Easy') : diff === 'medium' ? (lang === 'fr' ? 'Moyen' : 'Medium') : (lang === 'fr' ? 'Avancé' : 'Hard')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-between">
            <button
              id="btn-generate-quiz"
              onClick={handleGenerateQuiz}
              disabled={isLoading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold inline-flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>
                {isLoading 
                  ? (lang === 'fr' ? 'Génération du QCM par l’IA...' : 'Generating Quiz...') 
                  : (lang === 'fr' ? 'Lancer le Quiz' : 'Start Quiz')}
              </span>
            </button>

            {error && (
              <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* ACTIVE QUIZ INTERFACE */}
      {questions.length > 0 && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {/* Top Bar: Progress, Timer, and Question Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                {lang === 'fr' ? 'Question' : 'Question'} {currentQuestionIndex + 1} / {totalQ}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {answeredCount} / {totalQ} {lang === 'fr' ? 'répondu(es)' : 'answered'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-semibold">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatTime(timeSpentSeconds)}</span>
              </div>

              <button
                onClick={() => {
                  if (confirm(lang === 'fr' ? 'Voulez-vous abandonner ce quiz et en choisir un autre ?' : 'Quit this quiz?')) {
                    setQuestions([]);
                    setIsTimerActive(false);
                  }
                }}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                {lang === 'fr' ? 'Changer de cours' : 'Change Note'}
              </button>
            </div>
          </div>

          {/* Question Index Pills Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {questions.map((q, idx) => {
              const isAnswered = selectedAnswers[idx] !== undefined;
              const isCurrent = idx === currentQuestionIndex;
              const isCorrect = isSubmitted && selectedAnswers[idx] === q.correctAnswerIndex;
              const isWrong = isSubmitted && isAnswered && !isCorrect;

              let btnClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
              if (isCurrent) btnClass = 'ring-2 ring-indigo-600 bg-indigo-50 text-indigo-700 font-bold';
              else if (isSubmitted) {
                if (isCorrect) btnClass = 'bg-emerald-100 text-emerald-800 font-bold';
                else if (isWrong) btnClass = 'bg-rose-100 text-rose-800 font-bold';
              } else if (isAnswered) {
                btnClass = 'bg-indigo-600 text-white font-bold';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs transition-all shrink-0 flex items-center justify-center font-mono ${btnClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Current Question Box */}
          {currentQ && (
            <div className="space-y-4 pt-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase text-indigo-600">
                    {lang === 'fr' ? 'Concept évalué :' : 'Concept tested:'} {currentQ.conceptTested}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {currentQ.question}
                  </h3>
                </div>

                <button
                  onClick={() => speakText(currentQ.question)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
                  title="Écouter la question"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Options A, B, C, D */}
              <div className="grid grid-cols-1 gap-2.5 pt-2">
                {currentQ.options.map((option, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                  const isCorrectAnswer = optIdx === currentQ.correctAnswerIndex;
                  
                  let optionStyles = 'bg-slate-50 border-slate-200 hover:bg-indigo-50/50 hover:border-indigo-300 text-slate-800';
                  if (isSelected) {
                    optionStyles = 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-600/30 font-semibold';
                  }

                  if (isSubmitted) {
                    if (isCorrectAnswer) {
                      optionStyles = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/40';
                    } else if (isSelected && !isCorrectAnswer) {
                      optionStyles = 'bg-rose-50 border-rose-500 text-rose-950 font-semibold line-through';
                    } else {
                      optionStyles = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(currentQuestionIndex, optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 text-sm ${optionStyles}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {letter}
                        </span>
                        <span className="leading-relaxed">{option}</span>
                      </div>

                      {isSubmitted && (
                        <div>
                          {isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                          {isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation (Shown when submitted or immediate) */}
              {isSubmitted && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    {selectedAnswers[currentQuestionIndex] === currentQ.correctAnswerIndex ? (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {lang === 'fr' ? 'Excellente réponse !' : 'Correct answer!'}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        {lang === 'fr' ? 'Réponse incorrecte' : 'Incorrect answer'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong>{lang === 'fr' ? 'Explication :' : 'Explanation:'}</strong> {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg hover:bg-slate-100"
                >
                  ← {lang === 'fr' ? 'Précédent' : 'Previous'}
                </button>

                <div className="flex items-center gap-2">
                  {currentQuestionIndex < totalQ - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQ - 1, prev + 1))}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <span>{lang === 'fr' ? 'Suivant' : 'Next'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : !isSubmitted ? (
                    <button
                      id="btn-submit-quiz"
                      onClick={handleSubmitQuiz}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{lang === 'fr' ? 'Valider et Voir mes Résultats' : 'Submit & See Score'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setQuestions([]);
                        setIsSubmitted(false);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{lang === 'fr' ? 'Nouveau Quiz' : 'New Quiz'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FINAL RESULTS SCORE CARD (Displayed upon submission) */}
          {isSubmitted && (
            <div className="mt-6 p-6 bg-linear-to-br from-indigo-900 to-slate-900 text-white rounded-2xl border border-indigo-700/60 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0">
                    <Trophy className="w-8 h-8 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                      {lang === 'fr' ? 'Résultat de l’Évaluation' : 'Assessment Summary'}
                    </span>
                    <h3 className="text-2xl font-extrabold text-white">
                      {correctCount} / {totalQ} ({Math.round((correctCount / totalQ) * 100)}%)
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-2 bg-indigo-800/80 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium inline-flex items-center gap-1.5 border border-indigo-500/40"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{lang === 'fr' ? 'Imprimer / PDF' : 'Print / PDF'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setQuestions([]);
                      handleGenerateQuiz();
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{lang === 'fr' ? 'Rejouer ce cours' : 'Retake Quiz'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-indigo-800/60 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
                <span>
                  <strong>{lang === 'fr' ? 'Temps total :' : 'Total time:'}</strong> {formatTime(timeSpentSeconds)}
                </span>
                <span>
                  <strong>{lang === 'fr' ? 'Sauvegardé en local :' : 'Saved to PC disk:'}</strong> data/quiz_history.json
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUIZ SCORE HISTORY & PROGRESSION (Saved on Local PC Disk) */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            <span>{lang === 'fr' ? 'Historique des Évaluations (Disque PC)' : 'Quiz History & Score Tracking (Local Disk)'}</span>
          </h3>
          <span className="text-xs text-slate-500">
            {history.length} {lang === 'fr' ? 'tentatives enregistrées' : 'recorded attempts'}
          </span>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl text-center">
            {lang === 'fr' 
              ? 'Aucun quiz enregistré pour le moment. Réalisez votre premier test ci-dessus !' 
              : 'No recorded quiz attempts yet. Take your first quiz above!'}
          </p>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {history.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 text-sm">{rec.docTitle}</p>
                  <p className="text-slate-500 text-[11px] flex items-center gap-2">
                    <span className="font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60">
                      {rec.subject}
                    </span>
                    <span>{new Date(rec.timestamp).toLocaleDateString()} à {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                    rec.percentage >= 80 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : rec.percentage >= 50 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-rose-100 text-rose-800'
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
