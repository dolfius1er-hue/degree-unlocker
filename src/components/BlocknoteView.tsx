import React, { useState, useEffect, useRef } from 'react';
import { SchoolDocument, BlocknoteGuide, PaperStyle, HandwritingFont, BlocknoteLine, SourceValidationResult } from '../types';
import { getSubjectBadgeClass } from '../utils/colors';
import { exportNotebookAsPdf } from '../utils/notebookPdfExport';
import confetti from 'canvas-confetti';
import { 
  PenTool, 
  Check, 
  Volume2, 
  VolumeX, 
  Printer, 
  Sparkles, 
  RotateCcw, 
  Layers, 
  Type, 
  Clock, 
  HelpCircle, 
  Palette, 
  Play, 
  Pause,
  ArrowRight,
  BookOpen,
  Info,
  Sliders,
  CheckCircle2,
  FileDown,
  X,
  FileText,
  Lightbulb,
  Youtube,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface BlocknoteViewProps {
  document: SchoolDocument | null;
  onUpdateDocumentGuide: (docId: string, guide: BlocknoteGuide) => void;
  onOpenDocSelector: () => void;
  onOpenTutorial?: () => void;
  lang?: 'fr' | 'en';
  onOpenTips?: () => void;
  onOpenVideos?: (subject?: string) => void;
}

export const BlocknoteView: React.FC<BlocknoteViewProps> = ({
  document,
  onUpdateDocumentGuide,
  onOpenDocSelector,
  onOpenTutorial,
  lang = 'fr',
  onOpenTips,
  onOpenVideos,
}) => {
  const [paperStyle, setPaperStyle] = useState<PaperStyle>('ruled');
  const [handFont, setHandFont] = useState<HandwritingFont>('kalam');
  const [completedLines, setCompletedLines] = useState<Record<string, boolean>>({});
  const [isDictating, setIsDictating] = useState(false);
  const [dictatingLineIndex, setDictatingLineIndex] = useState<number | null>(null);
  const [dictationSpeed, setDictationSpeed] = useState<number>(0.85); // Paced for handwriting
  const [isGenerating, setIsGenerating] = useState(false);
  const [celebrated, setCelebrated] = useState(false);

  // Source Validation & Anti-Hallucination
  const [isValidatingSource, setIsValidatingSource] = useState(false);
  const [validationResult, setValidationResult] = useState<SourceValidationResult | null>(document?.sourceValidation || null);

  useEffect(() => {
    setValidationResult(document?.sourceValidation || null);
  }, [document?.id]);

  const handleValidateSource = async () => {
    if (!document) return;
    setIsValidatingSource(true);
    try {
      const res = await fetch('/api/validate-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: document.id,
          title: document.title,
          content: document.content,
          subject: document.subject,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setValidationResult(data);
      }
    } catch (err) {
      console.error('Source validation error:', err);
    } finally {
      setIsValidatingSource(false);
    }
  };

  // PDF Export States
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportedFileName, setExportedFileName] = useState<string | null>(null);
  const [pdfPaperStyle, setPdfPaperStyle] = useState<PaperStyle>('ruled');
  const [pdfStudentName, setPdfStudentName] = useState<string>('');
  const [pdfIncludeCues, setPdfIncludeCues] = useState<boolean>(true);
  const [pdfIncludePenLegend, setPdfIncludePenLegend] = useState<boolean>(true);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const guide = document?.blocknoteReproduction;

  // Initialize paper style from guide if present
  useEffect(() => {
    if (guide?.recommendedPaper) {
      setPaperStyle(guide.recommendedPaper);
      setPdfPaperStyle(guide.recommendedPaper);
    }
  }, [guide?.recommendedPaper]);


  // Flatten all lines to track progress
  const allLines: BlocknoteLine[] = React.useMemo(() => {
    if (!guide?.sections) return [];
    return guide.sections.flatMap(s => s.lines);
  }, [guide]);

  const completedCount = Object.values(completedLines).filter(Boolean).length;
  const progressPercent = allLines.length > 0 ? Math.round((completedCount / allLines.length) * 100) : 0;

  // Trigger confetti when 100% reached
  useEffect(() => {
    if (progressPercent === 100 && allLines.length > 0 && !celebrated) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setCelebrated(true);
    } else if (progressPercent < 100) {
      setCelebrated(false);
    }
  }, [progressPercent, allLines.length, celebrated]);

  // Speech synthesis cleanup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const toggleLineCompleted = (id: string) => {
    setCompletedLines(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleResetProgress = () => {
    setCompletedLines({});
    setCelebrated(false);
  };

  // Generate or regenerate Blocknote Guide with AI
  const handleGenerateBlocknote = async () => {
    if (!document) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-blocknote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: document.title,
          subject: document.subject,
          content: document.content,
          preferredPaper: paperStyle,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate blocknote guide');
      }

      const newGuide: BlocknoteGuide = await res.json();
      onUpdateDocumentGuide(document.id, newGuide);
    } catch (err) {
      console.error('Error generating blocknote:', err);
      alert('Could not generate blocknote guide. Please check your network or try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Dictation / Voice pacing for hands-free notebook copying
  const startDictation = () => {
    if (!synthRef.current || allLines.length === 0) return;
    synthRef.current.cancel();
    setIsDictating(true);

    let currentIndex = 0;

    const speakNext = () => {
      if (currentIndex >= allLines.length) {
        setIsDictating(false);
        setDictatingLineIndex(null);
        return;
      }

      const line = allLines[currentIndex];
      setDictatingLineIndex(currentIndex);

      // Clean line text for speech (remove symbols like ──>)
      const speechText = line.text
        .replace(/──>/g, 'yields')
        .replace(/->/g, 'yields')
        .replace(/Σ/g, 'sum of')
        .replace(/Δ/g, 'delta')
        .replace(/∫/g, 'integral of');

      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = dictationSpeed;
      utteranceRef.current = utterance;

      utterance.onend = () => {
        // Mark as written
        setCompletedLines(prev => ({ ...prev, [line.id]: true }));
        // Add pause between lines so the student has time to write on paper
        setTimeout(() => {
          currentIndex++;
          speakNext();
        }, 3200); // 3.2s writing buffer between lines
      };

      utterance.onerror = () => {
        setIsDictating(false);
        setDictatingLineIndex(null);
      };

      synthRef.current?.speak(utterance);
    };

    speakNext();
  };

  const stopDictation = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsDictating(false);
    setDictatingLineIndex(null);
  };

  // Print notebook sheet
  const handlePrint = () => {
    window.print();
  };

  // Export reproduction guide as a student notebook PDF file
  const handleExportPdf = () => {
    if (!document) return;
    setIsExportingPdf(true);
    try {
      const fileName = exportNotebookAsPdf(document, guide, {
        paperStyle: pdfPaperStyle || paperStyle,
        studentName: pdfStudentName,
        includeMarginCues: pdfIncludeCues,
        includePenLegend: pdfIncludePenLegend,
      });
      setExportedFileName(fileName);
      setShowExportModal(false);
    } catch (err) {
      console.error('Error exporting notebook PDF:', err);
      alert('Une erreur est survenue lors de la création du fichier PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Paper styling classes
  const getPaperClass = () => {
    switch (paperStyle) {
      case 'ruled':
        return 'paper-lined';
      case 'legal':
        return 'paper-legal';
      case 'dots':
        return 'paper-dots';
      case 'grid':
        return 'paper-grid';
      case 'seyes':
        return 'paper-seyes';
      default:
        return 'bg-white';
    }
  };

  // Font styling class
  const getFontClass = () => {
    switch (handFont) {
      case 'kalam':
        return 'font-hand-kalam text-lg leading-8 tracking-wide';
      case 'caveat':
        return 'font-hand-caveat text-xl leading-8';
      case 'patrick':
        return 'font-hand-patrick text-lg leading-8';
      case 'sans':
        return 'font-body text-sm leading-7';
    }
  };

  // Line text color based on pen assignment
  const getLineColorClass = (color?: string) => {
    switch (color) {
      case 'red':
        return 'text-rose-700 font-medium';
      case 'blue':
        return 'text-blue-800';
      case 'green':
        return 'text-emerald-800';
      case 'purple':
        return 'text-purple-800';
      case 'black':
      default:
        return 'text-stone-900';
    }
  };

  if (!document) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-xl p-8 border border-slate-200 text-center shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <PenTool className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">
          {lang === 'fr' ? 'Aucune note sélectionnée pour le mode Cahier Bloc-notes' : 'No Note Selected for Blocknote Mode'}
        </h3>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          {lang === 'fr'
            ? 'Sélectionnez un cours ou un polycopié PDF de votre base locale pour ouvrir son compagnon de recopie manuscrite.'
            : 'Select any note or uploaded PDF from your school database to open its handwritten blocknote reproduction companion.'}
        </p>
        <button
          onClick={onOpenDocSelector}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>{lang === 'fr' ? 'Choisir un cours' : 'Choose a School Note'}</span>
        </button>
      </div>
    );
  }

  const badge = getSubjectBadgeClass(document.subject);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Controls & Customization Toolbar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDocSelector}
            className="text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === 'fr' ? 'Changer de cours' : 'Switch Note'}</span>
          </button>

          <div className="h-4 w-px bg-slate-200"></div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                {document.subject}
              </span>
              <h2 className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                {document.title}
              </h2>
            </div>
            {guide && (
              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  {lang === 'fr' ? `Temps de recopie estimé : ~${guide.estimatedCopyTimeMin} min` : `Est. copy time: ~${guide.estimatedCopyTimeMin} mins`}
                </span>
                <span>•</span>
                <span>{allLines.length} {lang === 'fr' ? 'lignes à recopier' : 'lines to copy'}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Audio Dictation button */}
          <button
            id="btn-toggle-dictate"
            onClick={isDictating ? stopDictation : startDictation}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isDictating
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={lang === 'fr' ? 'Lit les lignes à voix haute avec des pauses pour vous laisser écrire sur papier' : 'Read out lines with pauses so you can write without looking at screen'}
          >
            {isDictating ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Pause Dictée' : 'Pause Dictation'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{lang === 'fr' ? 'Dicter au Stylo' : 'Dictate to Pen'}</span>
              </>
            )}
          </button>

          {/* Regenerate AI Guide */}
          <button
            id="btn-regenerate-guide"
            onClick={handleGenerateBlocknote}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-amber-50 hover:text-amber-800 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-600 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>
              {isGenerating 
                ? (lang === 'fr' ? 'Génération...' : 'Generating...') 
                : (guide ? (lang === 'fr' ? 'Régénérer' : 'Regenerate') : (lang === 'fr' ? 'Générer le Guide' : 'Generate Guide'))}
            </span>
          </button>

          {/* Export as Student Notebook PDF */}
          <button
            id="btn-export-notebook-pdf"
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
            title={lang === 'fr' ? "Exporter le guide de recopie au format cahier d'écolier PDF téléchargeable" : "Export reproduction guide as printable notebook PDF"}
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Exporter Cahier PDF' : 'Export Notebook PDF'}</span>
            <span className="hidden xl:inline text-[9px] bg-emerald-800/80 text-emerald-100 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-mono">
              {lang === 'fr' ? 'A4 Écolier' : 'A4 Student'}
            </span>
          </button>

          {/* Guide & Tutorial Button */}
          {onOpenTutorial && (
            <button
              onClick={onOpenTutorial}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors shadow-2xs"
              title={lang === 'fr' ? "Guide d'utilisation & Tuto de la méthode Blocknote" : "Tutorial & Guide for Notebook method"}
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">{lang === 'fr' ? 'Tuto' : 'Tutorial'}</span>
            </button>
          )}

          {/* Print */}
          <button
            id="btn-print-sheet"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
            title={lang === 'fr' ? 'Imprimer la fiche cahier' : 'Print notebook guide'}
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">{lang === 'fr' ? 'Imprimer' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* PDF Export Success Toast / Notification */}
      {exportedFileName && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 shadow-sm flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2 flex-wrap">
                <span>{lang === 'fr' ? 'Fichier PDF créé et téléchargé avec succès !' : 'PDF Notebook successfully exported and downloaded!'}</span>
                <span className="font-mono text-xs font-semibold bg-emerald-100 border border-emerald-300 text-emerald-900 px-2 py-0.5 rounded-md">
                  {exportedFileName}
                </span>
              </h4>
              <p className="text-xs text-emerald-900/90 mt-1 leading-relaxed">
                {lang === 'fr'
                  ? 'Le document a été généré au format cahier d\'écolier A4 standard (marge rouge d\'écolier, réglure, en-tête étudiant, codes couleurs et colonnes Cornell). Vérifiez votre dossier Téléchargements : le fichier est prêt pour impression directe !'
                  : 'The document was generated in standard A4 student notebook format (red margin, rulings, header, color codes and Cornell columns). Check your Downloads folder: ready to print!'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setExportedFileName(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100 transition-colors shrink-0"
            title={lang === 'fr' ? 'Fermer' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Progress & Pen Allocation Bar */}
      {guide && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Progress Card */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {lang === 'fr' ? 'Progression sur Papier' : 'Paper Progress'}
              </span>
              <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                {progressPercent}%
              </span>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>{lang === 'fr' ? `${completedCount} sur ${allLines.length} lignes recopiées` : `${completedCount} of ${allLines.length} lines transcribed`}</span>
              <button 
                onClick={handleResetProgress}
                className="hover:text-slate-800 underline font-medium"
              >
                {lang === 'fr' ? 'Réinitialiser' : 'Reset'}
              </button>
            </div>
          </div>

          {/* Pen Recommendation Card */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs md:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-600" />
                {lang === 'fr' ? 'Stylos recommandés pour ce cours' : 'Recommended Pen Colors for this Note'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {lang === 'fr' ? 'Améliore la mémorisation de ~35%' : 'Boosts visual retention by ~35%'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
              {guide.recommendedPens?.map((pen, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <span 
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-white"
                    style={{ backgroundColor: pen.color }}
                  ></span>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 leading-tight truncate">{pen.name}</p>
                    <p className="text-[10px] text-slate-500 leading-tight truncate">{pen.purpose}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Source Validation & Grounding Banner */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">
                {lang === 'fr' ? 'Validation de la Source & Rigueur Anti-Invention' : 'Source Verification & Grounding Rigor'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {validationResult ? `${validationResult.overallScore}/100 • ${validationResult.academicLevel}` : (lang === 'fr' ? 'Non audité' : 'Not audited')}
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {validationResult 
                ? validationResult.notesSummary 
                : (lang === 'fr' 
                    ? 'Garantie anti-hallucination : l\'IA s\'appuie uniquement sur ce document pour synthétiser les notes et ne fabrique rien.'
                    : 'Anti-hallucination guarantee: AI strictly grounds all syntheses in this text without fabricating facts.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenTips && (
            <button
              onClick={onOpenTips}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-semibold transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'fr' ? 'Astuces & Guide Notes' : 'Note-Taking Guide'}</span>
            </button>
          )}

          {onOpenVideos && (
            <button
              onClick={() => onOpenVideos(document.subject)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/80 font-semibold transition-colors"
            >
              <Youtube className="w-3.5 h-3.5 text-red-600" />
              <span>{lang === 'fr' ? 'Vidéos YouTube' : 'YouTube Lessons'}</span>
            </button>
          )}

          <button
            onClick={handleValidateSource}
            disabled={isValidatingSource}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold transition-colors disabled:opacity-50"
          >
            <ShieldCheck className={`w-3.5 h-3.5 text-indigo-600 ${isValidatingSource ? 'animate-spin' : ''}`} />
            <span>
              {isValidatingSource 
                ? (lang === 'fr' ? 'Vérification...' : 'Validating...') 
                : (lang === 'fr' ? 'Auditer la Source' : 'Audit Source')}
            </span>
          </button>
        </div>
      </div>

      {/* Dedicated Paper Theme Picker (Quick-Select Buttons) */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              {lang === 'fr' ? 'Sélecteur de Thème de Papier (Format Cahier)' : 'Paper Theme Picker (Notebook Format)'}
            </h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
              {lang === 'fr' ? '5 Styles Disponibles' : '5 Styles Available'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">{lang === 'fr' ? 'Écriture :' : 'Font:'}</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setHandFont('kalam')}
                className={`px-2 py-0.5 rounded font-hand-kalam text-xs transition-all ${
                  handFont === 'kalam' ? 'bg-white shadow-xs font-bold text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kalam
              </button>
              <button
                onClick={() => setHandFont('caveat')}
                className={`px-2 py-0.5 rounded font-hand-caveat text-xs transition-all ${
                  handFont === 'caveat' ? 'bg-white shadow-xs font-bold text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Caveat
              </button>
              <button
                onClick={() => setHandFont('patrick')}
                className={`px-2 py-0.5 rounded font-hand-patrick text-xs transition-all ${
                  handFont === 'patrick' ? 'bg-white shadow-xs font-bold text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Patrick
              </button>
              <button
                onClick={() => setHandFont('sans')}
                className={`px-2 py-0.5 rounded font-body text-[11px] transition-all ${
                  handFont === 'sans' ? 'bg-white shadow-xs font-bold text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sans
              </button>
            </div>
          </div>
        </div>

        {/* 5 Quick-Select Theme Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {/* 1. Ruled */}
          <button
            id="theme-btn-ruled"
            onClick={() => {
              setPaperStyle('ruled');
              setPdfPaperStyle('ruled');
            }}
            className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
              paperStyle === 'ruled'
                ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base">📝</span>
              {paperStyle === 'ruled' && (
                <span className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">
                  ✓
                </span>
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">
                {lang === 'fr' ? 'Ligné 8mm' : 'Ruled Lined'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                {lang === 'fr' ? 'Lignes bleues horizontales' : 'Standard horizontal lines'}
              </p>
            </div>
            {/* Visual preview swatch */}
            <div className="mt-2.5 h-4 w-full bg-white border border-slate-200 rounded flex flex-col justify-around px-1 py-0.5">
              <div className="h-px bg-sky-200 w-full"></div>
              <div className="h-px bg-sky-200 w-full"></div>
            </div>
          </button>

          {/* 2. Legal Pad */}
          <button
            id="theme-btn-legal"
            onClick={() => {
              setPaperStyle('legal');
              setPdfPaperStyle('legal');
            }}
            className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
              paperStyle === 'legal'
                ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base">🟨</span>
              {paperStyle === 'legal' && (
                <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
                  ✓
                </span>
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">
                {lang === 'fr' ? 'Legal Pad' : 'Legal Pad'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                {lang === 'fr' ? 'Bloc jaune & marge rouge' : 'Canary yellow + red margin'}
              </p>
            </div>
            {/* Visual preview swatch */}
            <div className="mt-2.5 h-4 w-full bg-amber-100 border border-amber-300/60 rounded flex items-center px-1">
              <div className="w-0.5 h-full bg-rose-400 mr-1"></div>
              <div className="flex-1 flex flex-col justify-around h-full py-0.5">
                <div className="h-px bg-amber-300/80 w-full"></div>
                <div className="h-px bg-amber-300/80 w-full"></div>
              </div>
            </div>
          </button>

          {/* 3. Dot Grid */}
          <button
            id="theme-btn-dots"
            onClick={() => {
              setPaperStyle('dots');
              setPdfPaperStyle('dots');
            }}
            className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
              paperStyle === 'dots'
                ? 'border-slate-800 bg-slate-100 ring-2 ring-slate-800/20 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base">🔲</span>
              {paperStyle === 'dots' && (
                <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                  ✓
                </span>
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">
                {lang === 'fr' ? 'Pointillés' : 'Dot Grid'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                {lang === 'fr' ? 'Bullet journal 5mm' : '5mm matrix bullet journal'}
              </p>
            </div>
            {/* Visual preview swatch */}
            <div className="mt-2.5 h-4 w-full bg-white border border-slate-200 rounded flex items-center justify-center gap-1">
              <span className="w-1 h-1 rounded-full bg-slate-400"></span>
              <span className="w-1 h-1 rounded-full bg-slate-400"></span>
              <span className="w-1 h-1 rounded-full bg-slate-400"></span>
              <span className="w-1 h-1 rounded-full bg-slate-400"></span>
            </div>
          </button>

          {/* 4. Grid 5mm */}
          <button
            id="theme-btn-grid"
            onClick={() => {
              setPaperStyle('grid');
              setPdfPaperStyle('grid');
            }}
            className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
              paperStyle === 'grid'
                ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base">📐</span>
              {paperStyle === 'grid' && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                  ✓
                </span>
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">
                {lang === 'fr' ? 'Quadrillé 5mm' : '5mm Grid'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                {lang === 'fr' ? 'Petits carreaux sciences' : 'Maths quadrille grid'}
              </p>
            </div>
            {/* Visual preview swatch */}
            <div className="mt-2.5 h-4 w-full bg-white border border-slate-200 rounded grid grid-cols-4 grid-rows-2 p-0.5 gap-0.5">
              <div className="bg-sky-100"></div>
              <div className="bg-sky-100"></div>
              <div className="bg-sky-100"></div>
              <div className="bg-sky-100"></div>
            </div>
          </button>

          {/* 5. Seyès Français */}
          <button
            id="theme-btn-seyes"
            onClick={() => {
              setPaperStyle('seyes');
              setPdfPaperStyle('seyes');
            }}
            className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
              paperStyle === 'seyes'
                ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base">🇫🇷</span>
              {paperStyle === 'seyes' && (
                <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                  ✓
                </span>
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">
                {lang === 'fr' ? 'Seyès Français' : 'French Seyès'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                {lang === 'fr' ? 'Grands carreaux & marge' : 'Classic French school ruling'}
              </p>
            </div>
            {/* Visual preview swatch */}
            <div className="mt-2.5 h-4 w-full bg-white border border-purple-200 rounded flex items-center px-1">
              <div className="w-0.5 h-full bg-rose-400 mr-1"></div>
              <div className="flex-1 flex flex-col justify-around h-full py-0.5">
                <div className="h-px bg-purple-300 w-full"></div>
                <div className="h-px bg-purple-200 w-full"></div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* No Guide generated yet fallback */}
      {!guide && (
        <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center shadow-xs">
          <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-900">
            {lang === 'fr' ? 'Générer le Guide de Recopie Manuscrite' : 'Generate Handwritten Reproduction Guide'}
          </h3>
          <p className="text-xs text-stone-600 mt-1 max-w-lg mx-auto">
            {lang === 'fr'
              ? `Gemini IA structure « ${document.title} » en repères Cornell, encadrés de formules, attributions de stylos de couleur et schémas optimisés pour votre cahier d'écolier.`
              : `Gemini AI will organize “${document.title}” into Cornell cues, formula boxes, clear pen color annotations, and quick sketches specifically optimized for writing by hand into your blocknote.`}
          </p>
          <button
            id="btn-first-generate"
            onClick={handleGenerateBlocknote}
            disabled={isGenerating}
            className="mt-4 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors inline-flex items-center gap-2"
          >
            {isGenerating 
              ? (lang === 'fr' ? 'Analyse du cours...' : 'Analyzing Note...') 
              : (lang === 'fr' ? 'Générer le Guide Bloc-notes' : 'Generate Blocknote Guide')}
          </button>
        </div>
      )}

      {/* Main Blocknote Paper Simulator Sheet */}
      {guide && (
        <div 
          id="blocknote-paper-sheet"
          className={`relative rounded-2xl p-6 sm:p-10 border border-stone-300 shadow-md ${getPaperClass()} min-h-[600px] print:shadow-none print:border-none`}
        >
          {/* Top Spiral / Hole Punch Aesthetic Bar (desktop only) */}
          <div className="hidden sm:flex items-center justify-around pb-6 mb-4 border-b border-stone-200/60 print:hidden">
            {[...Array(12)].map((_, i) => (
              <span 
                key={i} 
                className="w-3.5 h-3.5 rounded-full bg-stone-300/60 border border-stone-400/40 shadow-inner"
              ></span>
            ))}
          </div>

          {/* Notebook Title & Subject */}
          <div className="mb-8 border-b-2 border-stone-400 pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h1 className={`text-2xl sm:text-3xl font-bold text-stone-900 ${getFontClass()}`}>
                {guide.title || document.title}
              </h1>
              <span className="text-xs font-mono text-stone-500">
                {lang === 'fr' ? 'Date :' : 'Date:'} {document.date || new Date().toISOString().split('T')[0]}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium mt-1">
              {lang === 'fr' ? 'Matière :' : 'Subject:'} {document.subject} • {lang === 'fr' ? 'Méthode :' : 'Format:'} {guide.layoutStructure.toUpperCase()}
            </p>
          </div>

          {/* Cornell Two-Column Structure */}
          <div className="space-y-8">
            {guide.sections?.map((section, sIdx) => (
              <div key={section.id || sIdx} className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 pt-2">
                
                {/* Left Margin: Cue Column (Questions, Key terms to write in margin) */}
                <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-rose-300/80 pr-3 pb-2 md:pb-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-1">
                    {lang === 'fr' ? 'Marge : Repère / Question' : 'Margin Cue / Question'}
                  </span>
                  <p className={`font-bold text-stone-800 text-sm sm:text-base ${getFontClass()}`}>
                    {section.cueMarginText || section.heading}
                  </p>
                </div>

                {/* Right Column: Main Note content lines */}
                <div className="md:col-span-3 space-y-2">
                  <h3 className={`text-base sm:text-lg font-bold text-stone-900 mb-2 underline decoration-amber-400/80 ${getFontClass()}`}>
                    {section.heading}
                  </h3>

                  <div className="space-y-2">
                    {section.lines?.map((line, lIdx) => {
                      const isDone = completedLines[line.id];
                      const isCurrentlyDictating = allLines[dictatingLineIndex || -1]?.id === line.id;

                      return (
                        <div 
                          key={line.id || lIdx}
                          className={`group flex items-start gap-2.5 p-1.5 rounded-lg transition-colors ${
                            isCurrentlyDictating 
                              ? 'bg-amber-100/80 ring-2 ring-amber-500' 
                              : isDone 
                              ? 'opacity-50 line-through' 
                              : 'hover:bg-amber-50/40'
                          }`}
                        >
                          {/* Checkbox for physical paper progress */}
                          <button
                            id={`check-line-${line.id}`}
                            onClick={() => toggleLineCompleted(line.id)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-1 transition-all ${
                              isDone 
                                ? 'bg-emerald-600 border-emerald-600 text-white' 
                                : 'border-stone-400 bg-white/80 hover:border-amber-600'
                            }`}
                            title={lang === 'fr' ? 'Marquer comme recopié sur votre cahier' : 'Mark as written on your paper notebook'}
                          >
                            {isDone && <Check className="w-3.5 h-3.5" />}
                          </button>

                          {/* Line Content */}
                          <div className="flex-1 min-w-0">
                            {line.type === 'formula' ? (
                              <div className="p-2 my-1 bg-rose-50/70 border-2 border-dashed border-rose-300 rounded-lg inline-block">
                                <span className="text-[10px] font-mono text-rose-600 font-bold mr-2 uppercase">
                                  {lang === 'fr' ? 'Formule Clé' : 'Formula'}
                                </span>
                                <span className={`text-base font-bold ${getLineColorClass(line.penColor)} ${getFontClass()}`}>
                                  {line.text}
                                </span>
                              </div>
                            ) : line.type === 'box_note' ? (
                              <div className="p-2.5 my-1 bg-amber-50/80 border-2 border-stone-800 rounded-md">
                                <span className="text-[10px] font-mono text-amber-800 font-bold block mb-0.5">
                                  {lang === 'fr' ? 'Loi & Théorème Fondamental :' : 'Boxed Core Law:'}
                                </span>
                                <p className={`text-sm sm:text-base ${getLineColorClass(line.penColor)} ${getFontClass()}`}>
                                  {line.text}
                                </p>
                              </div>
                            ) : (
                              <p className={`text-sm sm:text-base ${getLineColorClass(line.penColor)} ${getFontClass()}`}>
                                {line.type === 'bullet' ? '• ' : line.type === 'subbullet' ? '  - ' : ''}
                                {line.text}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick ASCII / Visual diagram sketch to copy onto paper */}
                  {section.quickSketchAscii && (
                    <div className="mt-3 p-3 bg-stone-50/90 border border-stone-300 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                          {lang === 'fr' ? '✏️ Schéma au stylo à reproduire sur papier :' : '✏️ Pen Sketch to Copy into Notebook:'}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {lang === 'fr' ? 'Guide dessin manuscrit' : 'Hand-drawn diagram guide'}
                        </span>
                      </div>
                      <pre className="font-mono text-xs text-stone-800 overflow-x-auto p-2 bg-white rounded-md border border-stone-200">
                        {section.quickSketchAscii}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Cornell Bottom Summary Section */}
          {guide.bottomSummary && (
            <div className="mt-10 pt-6 border-t-2 border-stone-400">
              <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block mb-1">
                  {lang === 'fr' ? 'Résumé de Bas de Page (Bilan de Révision)' : 'Bottom Page Summary (Review Column)'}
                </span>
                <p className={`text-sm sm:text-base text-stone-900 leading-relaxed ${getFontClass()}`}>
                  {guide.bottomSummary}
                </p>
              </div>
            </div>
          )}

          {/* Handwriting & Pen Tips Footer */}
          {guide.handwritingTips && guide.handwritingTips.length > 0 && (
            <div className="mt-6 pt-4 border-t border-stone-200 text-xs text-stone-500 space-y-1 print:hidden">
              <span className="font-bold text-stone-600 block mb-1">
                {lang === 'fr' ? 'Conseils de mise en page manuscrite :' : 'Handwriting & Layout Advice:'}
              </span>
              {guide.handwritingTips.map((tip, idx) => (
                <p key={idx} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>{tip}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PDF Export Options Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 sm:pt-12">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Exporter en Cahier d'Écolier PDF
                </h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs text-slate-700">
              <p className="text-slate-600 leading-relaxed">
                Générez un véritable fichier <strong>PDF format A4 prêt à être imprimé</strong> qui recrée fidèlement la page de cahier d'écolier avec sa <strong>marge rouge verticale</strong>, ses réglures, son en-tête d'élève et ses annotations manuscrites.
              </p>

              {/* Paper style choice */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  1. Choisir le type de réglure du cahier :
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPdfPaperStyle('seyes')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                      pdfPaperStyle === 'seyes'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-xl">🇫🇷</span>
                    <div>
                      <p className="font-semibold text-xs leading-none">Seyès Français</p>
                      <p className="text-[10px] text-slate-500 font-normal mt-0.5">Grands carreaux d'écolier</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPdfPaperStyle('ruled')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                      pdfPaperStyle === 'ruled'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-xl">📝</span>
                    <div>
                      <p className="font-semibold text-xs leading-none">Ligné Classique</p>
                      <p className="text-[10px] text-slate-500 font-normal mt-0.5">Lignes horizontales 8mm</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPdfPaperStyle('grid')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                      pdfPaperStyle === 'grid'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-xl">📐</span>
                    <div>
                      <p className="font-semibold text-xs leading-none">Petits Carreaux</p>
                      <p className="text-[10px] text-slate-500 font-normal mt-0.5">Quadrillage 5x5mm</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPdfPaperStyle('legal')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                      pdfPaperStyle === 'legal'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-xl">📄</span>
                    <div>
                      <p className="font-semibold text-xs leading-none">Bloc Jaune (Legal)</p>
                      <p className="text-[10px] text-slate-500 font-normal mt-0.5">Papier jaune avec marge</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  2. Nom de l'élève (affiché dans l'en-tête du cahier) :
                </label>
                <input
                  type="text"
                  value={pdfStudentName}
                  onChange={(e) => setPdfStudentName(e.target.value)}
                  placeholder="Ex : Camille Martin (laisser vide pour ligne de signature)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pdfIncludeCues}
                    onChange={(e) => setPdfIncludeCues(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-700">
                    Inscrire les questions & mots-clés dans la <strong>marge rouge Cornell</strong>
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pdfIncludePenLegend}
                    onChange={(e) => setPdfIncludePenLegend(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-700">
                    Inclure la <strong>légende des stylos recommandés</strong> (Bic 4 couleurs)
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={isExportingPdf}
                onClick={handleExportPdf}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
              >
                <FileDown className="w-4 h-4" />
                <span>{isExportingPdf ? 'Création du fichier...' : 'Télécharger le Cahier PDF (.pdf)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
