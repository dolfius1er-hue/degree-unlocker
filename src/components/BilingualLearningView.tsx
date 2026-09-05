import React, { useState, useRef } from 'react';
import { SchoolDocument, AppLanguage, BilingualLearningExercise, BilingualLanguageCode } from '../types';
import { 
  Languages, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Volume2, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  BookOpen, 
  Trophy, 
  ArrowRightLeft, 
  Sparkle, 
  GraduationCap, 
  FileText, 
  Check, 
  Mic, 
  MicOff, 
  Info,
  ChevronRight,
  ArrowRight,
  Lightbulb,
  Loader2,
  BookMarked,
  ShieldCheck,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BilingualLearningViewProps {
  documents: SchoolDocument[];
  lang?: AppLanguage;
  onOpenDocInBlocknote?: (doc: SchoolDocument) => void;
  onCompleteExercise?: () => void;
}

const AVAILABLE_LANGUAGES: { code: BilingualLanguageCode; label: string; flag: string; native: string }[] = [
  { code: 'en', label: 'Anglais', flag: '🇬🇧', native: 'English' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', native: 'Français' },
  { code: 'it', label: 'Italien', flag: '🇮🇹', native: 'Italiano' },
  { code: 'es', label: 'Espagnol', flag: '🇪🇸', native: 'Español' },
  { code: 'pt', label: 'Portugais', flag: '🇵🇹', native: 'Português' },
  { code: 'de', label: 'Allemand', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'la', label: 'Latin', flag: '🏛️', native: 'Latina' },
  { code: 'zh', label: 'Chinois', flag: '🇨🇳', native: '中文 (Mandarin)' },
];

export const BilingualLearningView: React.FC<BilingualLearningViewProps> = ({
  documents,
  lang = 'fr',
  onCompleteExercise,
}) => {
  // Source selection: clean slate by default (no pre-selected fake text)
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [sourceMode, setSourceMode] = useState<'document' | 'custom'>(documents.length > 0 ? 'document' : 'custom');
  const [customText, setCustomText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [targetLanguage, setTargetLanguage] = useState<BilingualLanguageCode>('en');

  // Exercise State
  const [exercise, setExercise] = useState<BilingualLearningExercise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Placed slots map: slotId -> placed target word ID
  const [placedSlots, setPlacedSlots] = useState<Record<string, string>>({});
  // Individual word language display toggle: slotId -> 'fr' | 'target'
  const [wordDisplayLang, setWordDisplayLang] = useState<Record<string, 'fr' | 'target'>>({});

  // Active word selected from the bank (for click-to-place)
  const [selectedBankWordId, setSelectedBankWordId] = useState<string | null>(null);

  // Exercise validation & definition reveal state
  // STRICT USER RULE: Definitions are NOT shown at the bottom by default during active solving!
  // They are only revealed once the student completes or validates the exercise.
  const [isExerciseValidated, setIsExerciseValidated] = useState(false);

  // FULL TEXT TRANSLATION MODE
  const [showFullTargetTranslation, setShowFullTargetTranslation] = useState(false);

  // Audio Voice practice (gemini-3.5-transcribe)
  const [isRecording, setIsRecording] = useState(false);
  const [transcribingAudio, setTranscribingAudio] = useState(false);
  const [voiceEvaluationResult, setVoiceEvaluationResult] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const activeTargetLangInfo = AVAILABLE_LANGUAGES.find(l => l.code === targetLanguage) || AVAILABLE_LANGUAGES[0];

  // Generate Bilingual Exercise
  const handleGenerateExercise = async () => {
    setIsLoading(true);
    setError(null);
    setPlacedSlots({});
    setWordDisplayLang({});
    setSelectedBankWordId(null);
    setIsExerciseValidated(false);
    setShowFullTargetTranslation(false);
    setVoiceEvaluationResult(null);

    try {
      let payload: any = {
        targetLanguage,
      };

      if (sourceMode === 'document') {
        const doc = documents.find(d => d.id === selectedDocId) || documents[0];
        if (!doc) {
          throw new Error(lang === 'fr' ? 'Veuillez sélectionner un document importé ou coller un extrait de texte.' : 'Please select an imported document or paste a text.');
        }
        payload.documentId = doc.id;
        payload.content = doc.content;
        payload.title = doc.title;
        payload.subject = doc.subject;
      } else {
        if (customText.trim().length < 30) {
          throw new Error(
            lang === 'fr'
              ? 'Veuillez saisir ou coller un extrait de texte littéraire/scolaire d\'au moins 30 caractères.'
              : 'Please enter or paste a literary/academic excerpt of at least 30 characters.'
          );
        }
        payload.content = customText.trim();
        payload.title = customTitle.trim() || (lang === 'fr' ? 'Extrait Littéraire / Cours' : 'Literary Excerpt');
        payload.subject = lang === 'fr' ? 'Littérature & Langues' : 'Literature & Languages';
      }

      const res = await fetch('/api/bilingual/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || (lang === 'fr' ? 'Échec de la génération de l’atelier' : 'Failed to generate exercise'));
      }

      const data = await res.json();
      if (data.exercise) {
        setExercise(data.exercise);
      } else {
        throw new Error(lang === 'fr' ? 'Exercice bilingue introuvable.' : 'Bilingual exercise not found.');
      }
    } catch (err: any) {
      console.error('Bilingual error:', err);
      setError(err.message || (lang === 'fr' ? 'Erreur lors de la préparation de l’exercice' : 'Error generating exercise'));
    } finally {
      setIsLoading(false);
    }
  };

  // Place a word into a slot
  const handlePlaceWord = (slotId: string, wordId: string) => {
    if (showFullTargetTranslation) {
      alert(
        lang === 'fr'
          ? `🔒 Mode Traduction Activé : Vous ne pouvez pas placer de mots lorsque le texte entier est en traduction. Veuillez repasser en mode source pour placer les mots !`
          : `🔒 Full Translation View Active: Switch back to source view to place words!`
      );
      return;
    }

    if (!exercise) return;

    if (slotId === wordId) {
      const newPlaced = { ...placedSlots, [slotId]: wordId };
      setPlacedSlots(newPlaced);
      setSelectedBankWordId(null);

      // Check if all placed
      const totalWords = exercise.targetWords.length;
      const placedCount = Object.keys(newPlaced).length;

      if (placedCount === totalWords) {
        setIsExerciseValidated(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        if (onCompleteExercise) {
          onCompleteExercise();
        }
      }
    } else {
      // Wrong placement feedback
      const targetWord = exercise.targetWords.find(w => w.id === wordId);
      const wordName = targetWord?.englishWord || targetWord?.targetWord || '';
      alert(
        lang === 'fr'
          ? `❌ Ce n'est pas le bon emplacement pour "${wordName}". Lisez attentivement le sens de la phrase !`
          : `❌ Not the correct slot for "${wordName}". Check sentence context!`
      );
    }
  };

  // Toggle display language of a placed word in the text
  const toggleWordLanguage = (slotId: string) => {
    setWordDisplayLang(prev => ({
      ...prev,
      [slotId]: prev[slotId] === 'target' ? 'fr' : 'target',
    }));
  };

  // Reset exercise
  const handleReset = () => {
    setPlacedSlots({});
    setWordDisplayLang({});
    setSelectedBankWordId(null);
    setIsExerciseValidated(false);
    setShowFullTargetTranslation(false);
    setVoiceEvaluationResult(null);
  };

  // Validate exercise manually to reveal answers and definitions
  const handleValidateExercise = () => {
    setIsExerciseValidated(true);
    if (onCompleteExercise) {
      onCompleteExercise();
    }
  };

  // Web Speech API Pronunciation
  const speakText = (text: string, langCode: string = 'en') => {
    if (!('speechSynthesis' in window)) {
      alert(lang === 'fr' ? 'Synthèse vocale non supportée sur ce navigateur.' : 'Text-to-speech not supported.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const speechCodeMap: Record<string, string> = {
      en: 'en-US',
      fr: 'fr-FR',
      it: 'it-IT',
      es: 'es-ES',
      pt: 'pt-PT',
      de: 'de-DE',
      la: 'it-IT',
      zh: 'zh-CN',
    };

    utterance.lang = speechCodeMap[langCode] || 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Voice Practice Recording with Gemini-3.5-transcribe
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleTranscribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setVoiceEvaluationResult(null);
    } catch (err) {
      console.error('Mic access error:', err);
      alert(lang === 'fr' ? 'Impossible d’accéder au microphone.' : 'Microphone access denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribeAudio = async (blob: Blob) => {
    setTranscribingAudio(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Audio, mimeType: 'audio/webm' }),
        });

        if (!res.ok) throw new Error('Transcription failed');
        const data = await res.json();
        setVoiceEvaluationResult(data.text || '');
      };
    } catch (err: any) {
      console.error('Voice practice error:', err);
      setVoiceEvaluationResult(lang === 'fr' ? 'Erreur lors de la vérification vocale.' : 'Voice transcription error.');
    } finally {
      setTranscribingAudio(false);
    }
  };

  const placedCount = exercise ? Object.keys(placedSlots).length : 0;
  const totalCount = exercise ? exercise.targetWords.length : 0;
  const isAllPlaced = totalCount > 0 && placedCount === totalCount;
  const unplacedWords = exercise ? exercise.targetWords.filter(w => !placedSlots[w.id]) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 mb-2">
          <Languages className="w-5 h-5 text-teal-600" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {lang === 'fr' ? 'Atelier Littéraire & Pratique des Langues' : 'Literary Studio & Dual-Language Learning'}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {lang === 'fr' ? 'Étudier un Texte & Maîtriser une Langue' : 'Study Text & Master Foreign Vocabulary'}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
          {lang === 'fr'
            ? 'Importez vos propres textes de littérature ou cours scolaires, choisissez la langue cible (Anglais, Italien, Espagnol, Allemand, Portugais, Latin, Chinois), puis complétez le texte à trous actif.'
            : 'Import your literature or study texts, choose your target language (English, Italian, Spanish, German, Portuguese, Latin, Chinese), and practice active vocabulary cloze deletion.'}
        </p>

        {/* Source Configuration Controls */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Target Language Selection */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                <span>{lang === 'fr' ? 'Langue cible d\'apprentissage :' : 'Target learning language:'}</span>
              </label>
              <select
                id="select-bilingual-target-lang"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value as BilingualLanguageCode)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                {AVAILABLE_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.label} ({l.native})
                  </option>
                ))}
              </select>
            </div>

            {/* Source Mode Toggle */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                <span>{lang === 'fr' ? 'Source du texte à étudier :' : 'Source text to study:'}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSourceMode('document')}
                  className={`p-2 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    sourceMode === 'document'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Depuis mes documents' : 'From my documents'} ({documents.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceMode('custom')}
                  className={`p-2 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    sourceMode === 'custom'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Coller un extrait de texte' : 'Paste literary text'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Conditional inputs */}
          {sourceMode === 'document' ? (
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {lang === 'fr' ? 'Sélectionner un document de la base :' : 'Select an imported note / document:'}
              </label>
              {documents.length > 0 ? (
                <select
                  id="select-bilingual-doc"
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      [{d.subject}] {d.title} ({d.content.slice(0, 40)}...)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg text-amber-900 dark:text-amber-300">
                  {lang === 'fr'
                    ? 'Aucun document importé pour l’instant. Vous pouvez coller directement un extrait de texte ci-dessous !'
                    : 'No documents imported yet. Switch to custom text to paste an excerpt!'}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {lang === 'fr' ? 'Titre de l\'œuvre / du chapitre (optionnel) :' : 'Title / Chapter name (optional):'}
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={lang === 'fr' ? 'Ex: Candide - Chapitre 30, Madame Bovary...' : 'e.g. Candide Chapter 30...'}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {lang === 'fr' ? 'Extrait de texte à étudier :' : 'Text excerpt to study:'}
                </label>
                <textarea
                  rows={4}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={
                    lang === 'fr'
                      ? "Collez ici le texte littéraire ou le passage du cours à transformer en atelier d'apprentissage bilingue..."
                      : "Paste the literary text or course excerpt here to generate the bilingual learning workshop..."
                  }
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Launch Button */}
          <div className="flex justify-end pt-1">
            <button
              id="btn-generate-bilingual"
              onClick={handleGenerateExercise}
              disabled={isLoading || (sourceMode === 'document' && documents.length === 0)}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-xs disabled:opacity-50 cursor-pointer text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'fr' ? 'Génération de l\'atelier...' : 'Preparing exercise...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {lang === 'fr'
                      ? `Générer l'Atelier en ${activeTargetLangInfo.label}`
                      : `Generate Workshop in ${activeTargetLangInfo.native}`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Exercise Workspace */}
      {!exercise && !isLoading && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-teal-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {lang === 'fr' ? 'Aucun atelier en cours' : 'No active workshop'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {lang === 'fr'
              ? 'Sélectionnez un texte importé ou collez un extrait littéraire ci-dessus pour lancer votre atelier de pratique.'
              : 'Select an imported document or paste a literary excerpt above to start practicing.'}
          </p>
        </div>
      )}

      {exercise && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          
          {/* Top Bar: Progress & Mode Switch */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 flex-wrap gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {exercise.targetLangLabel || activeTargetLangInfo.label}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {exercise.docTitle}
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {exercise.theme}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Reset button */}
              <button
                onClick={handleReset}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={lang === 'fr' ? 'Réinitialiser les mots' : 'Reset words'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Translation Mode Toggle */}
              <button
                onClick={() => setShowFullTargetTranslation(prev => !prev)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  showFullTargetTranslation
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>
                  {showFullTargetTranslation
                    ? (lang === 'fr' ? 'Voir en Français' : 'View Source Text')
                    : (lang === 'fr' ? `Voir Traduction (${activeTargetLangInfo.label})` : `View Translation`)}
                </span>
              </button>

              {/* Validate / Reveal button */}
              {!isExerciseValidated && (
                <button
                  onClick={handleValidateExercise}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Valider et Révéler' : 'Validate & Reveal'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>{lang === 'fr' ? 'Mots placés :' : 'Words placed:'} {placedCount} / {totalCount}</span>
              <span>{Math.round((placedCount / (totalCount || 1)) * 100)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 transition-all duration-300 rounded-full"
                style={{ width: `${(placedCount / (totalCount || 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* Text Area (with interactive slots) */}
          <div className="p-6 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/80 leading-loose text-sm sm:text-base text-slate-800 dark:text-slate-200 font-serif">
            {showFullTargetTranslation ? (
              <div className="space-y-3 font-sans text-sm sm:text-base text-indigo-950 dark:text-indigo-200 italic leading-relaxed">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider not-italic">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? `Traduction Intégrale en ${activeTargetLangInfo.label}` : `Complete Translation in ${activeTargetLangInfo.native}`}</span>
                </div>
                <p className="whitespace-pre-line">
                  {exercise.fullTargetTranslation || exercise.fullEnglishTranslation}
                </p>
              </div>
            ) : (
              <div>
                {exercise.segmentedTokens.map((token, index) => {
                  if (token.type === 'text') {
                    return <span key={index}>{token.content}</span>;
                  }

                  // Slot token
                  const slotId = token.slotId || token.content;
                  const placedWordId = placedSlots[slotId];
                  const targetWord = exercise.targetWords.find(w => w.id === slotId);

                  if (placedWordId && targetWord) {
                    const isTargetView = wordDisplayLang[slotId] === 'target';
                    const displayText = isTargetView 
                      ? (targetWord.targetWord || targetWord.englishWord) 
                      : targetWord.frenchWord;

                    return (
                      <span
                        key={index}
                        onClick={() => toggleWordLanguage(slotId)}
                        className="inline-flex items-center gap-1 mx-1 px-2.5 py-0.5 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-900 dark:text-teal-200 font-sans font-bold text-xs sm:text-sm border border-teal-300 dark:border-teal-700 shadow-2xs cursor-pointer hover:bg-teal-200 transition-colors"
                        title={lang === 'fr' ? 'Cliquez pour basculer la langue du mot' : 'Click to toggle language'}
                      >
                        <span>{displayText}</span>
                        <span className="text-[10px] text-teal-600 dark:text-teal-400">
                          {isTargetView ? activeTargetLangInfo.flag : '🇫🇷'}
                        </span>
                      </span>
                    );
                  }

                  // Empty Slot: ready for drag-and-drop or click
                  return (
                    <span
                      key={index}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const draggedWordId = e.dataTransfer.getData('text/plain');
                        if (draggedWordId) handlePlaceWord(slotId, draggedWordId);
                      }}
                      onClick={() => {
                        if (selectedBankWordId) {
                          handlePlaceWord(slotId, selectedBankWordId);
                        }
                      }}
                      className={`inline-block mx-1 px-3 py-1 rounded-lg border-2 border-dashed font-sans text-xs font-semibold cursor-pointer transition-all ${
                        selectedBankWordId
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 animate-pulse'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      {selectedBankWordId ? (lang === 'fr' ? 'Déposer ici' : 'Drop here') : `[ ${targetWord?.partOfSpeech || 'mot'} ]`}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* WORD BANK (Words to place) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {lang === 'fr'
                    ? `Banque de Mots (${activeTargetLangInfo.label}) — Cliquez ou glissez dans le texte :`
                    : `Word Bank (${activeTargetLangInfo.native}) — Click or drag to slot:`}
                </span>
              </h4>

              {selectedBankWordId && (
                <span className="text-[11px] text-teal-600 font-semibold animate-pulse">
                  {lang === 'fr' ? 'Mot sélectionné ! Cliquez sur l\'emplacement souhaité' : 'Word selected! Click on a slot in the text'}
                </span>
              )}
            </div>

            {unplacedWords.length === 0 ? (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {lang === 'fr'
                      ? 'Félicitations ! Tous les termes ont été correctement placés.'
                      : 'Congratulations! All terms have been correctly slotted.'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {unplacedWords.map((word) => {
                  const isSelected = selectedBankWordId === word.id;
                  const targetTerm = word.targetWord || word.englishWord;

                  return (
                    <div
                      key={word.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', word.id);
                        setSelectedBankWordId(word.id);
                      }}
                      onClick={() => setSelectedBankWordId(prev => prev === word.id ? null : word.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 shadow-2xs ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 ring-2 ring-teal-600/30'
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs">{targetTerm}</span>
                          <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                            isSelected ? 'bg-teal-700 text-teal-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            {word.partOfSpeech}
                          </span>
                        </div>
                        {word.hintFr && (
                          <p className={`text-[10px] max-w-[170px] truncate ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                            💡 {word.hintFr}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(targetTerm, targetLanguage);
                        }}
                        className={`p-1 rounded-md transition-colors ${
                          isSelected ? 'hover:bg-teal-700 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400'
                        }`}
                        title={lang === 'fr' ? 'Écouter la prononciation' : 'Listen to pronunciation'}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* DEFINITIONS & TRANSLATION REVEAL SECTION */}
          {/* Strictly locked during active solving; unlocked after validation */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Sparkle className="w-3.5 h-3.5 text-teal-600" />
                <span>
                  {lang === 'fr'
                    ? `Lexique & Définitions Complètes (${activeTargetLangInfo.label})`
                    : `Comprehensive Vocabulary & Definitions (${activeTargetLangInfo.native})`}
                </span>
              </h4>

              <div className="flex items-center gap-2">
                {isExerciseValidated && (
                  <button
                    onClick={async () => {
                      try {
                        const items = exercise.targetWords.map(tw => ({
                          id: `voc-${tw.id}-${Date.now()}`,
                          sourceWord: tw.frenchWord,
                          targetWord: tw.targetWord || tw.englishWord,
                          sourceLanguage: 'fr',
                          targetLanguage: targetLanguage,
                          definition: tw.definitionEn || '',
                          partOfSpeech: tw.partOfSpeech || 'nom',
                          docTitle: exercise.docTitle,
                          addedAt: new Date().toISOString(),
                        }));
                        await fetch('/api/vocabulary', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ vocabulary: items }),
                        });
                        confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
                      } catch (e) {
                        console.warn('Vocab bulk save error:', e);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <BookMarked className="w-3 h-3" />
                    <span>{lang === 'fr' ? 'Sauvegarder tout le lexique' : 'Save all to Vocabulary'}</span>
                  </button>
                )}

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isExerciseValidated 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {isExerciseValidated ? <Unlock className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-slate-500" />}
                  <span>{isExerciseValidated ? (lang === 'fr' ? 'Débloqué' : 'Unlocked') : (lang === 'fr' ? 'Verrouillé pendant l\'exercice' : 'Locked during exercise')}</span>
                </span>
              </div>
            </div>

            {isExerciseValidated ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs animate-in fade-in duration-300">
                {exercise.targetWords.map((tw) => {
                  const targetTerm = tw.targetWord || tw.englishWord;

                  return (
                    <div
                      key={tw.id}
                      className="p-3 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>🇫🇷 {tw.frenchWord}</span>
                          <span className="text-slate-400">↔</span>
                          <span className="text-teal-700 dark:text-teal-300">{activeTargetLangInfo.flag} {targetTerm}</span>
                        </div>
                        <button
                          onClick={() => speakText(`${targetTerm}`, targetLanguage)}
                          className="p-1 text-slate-400 hover:text-teal-700 transition-colors"
                          title="Prononcer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                        {tw.definitionEn}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
                <Lock className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {lang === 'fr'
                    ? '🔒 Les définitions complètes et la traduction détaillée sont masquées pour stimuler votre réflexion.'
                    : '🔒 Detailed definitions and translations are hidden to encourage active recall.'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {lang === 'fr'
                    ? 'Placez tous les mots ou cliquez sur "Valider et Révéler" pour afficher le corrigé complet.'
                    : 'Place all words or click "Validate & Reveal" to display the full glossary.'}
                </p>
              </div>
            )}
          </div>

          {/* VOICE PRONUNCIATION PRACTICE */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={transcribingAudio}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-teal-600" />}
                <span>
                  {isRecording
                    ? (lang === 'fr' ? 'Arrêter et Vérifier...' : 'Stop & Evaluate...')
                    : (lang === 'fr' ? 'S’entraîner à l\'oral (Micro)' : 'Practice Speaking')}
                </span>
              </button>

              {transcribingAudio && (
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                  <span>{lang === 'fr' ? 'Transcription Gemini...' : 'Transcribing audio...'}</span>
                </span>
              )}
            </div>

            {voiceEvaluationResult && (
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-xs text-teal-900 dark:text-teal-200 max-w-md truncate">
                🗣️ <span className="font-semibold">{lang === 'fr' ? 'Entendu :' : 'Transcribed:'}</span> "{voiceEvaluationResult}"
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
