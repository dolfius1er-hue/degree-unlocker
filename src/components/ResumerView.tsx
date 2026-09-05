import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { SchoolDocument, SummaryOptions, AppLanguage } from '../types';
import { getSubjectBadgeClass } from '../utils/colors';
import { exportSlidesDeckPdf } from '../utils/slidePdfExport';
import { 
  Sparkles, 
  BookOpen, 
  FileText, 
  PenTool, 
  Copy, 
  Check, 
  ArrowRight, 
  Layers, 
  Bookmark, 
  AlertTriangle,
  Loader2,
  RefreshCw,
  Download,
  Tv
} from 'lucide-react';

interface ResumerViewProps {
  documents: SchoolDocument[];
  selectedDocument: SchoolDocument | null;
  onSelectDocument: (doc: SchoolDocument) => void;
  onUpdateDocumentSummary: (docId: string, summary: string, keyPoints: string[]) => void;
  onOpenInBlocknote: (doc: SchoolDocument) => void;
  onOpenPresentation?: (doc: SchoolDocument) => void;
  lang?: AppLanguage;
}

export const ResumerView: React.FC<ResumerViewProps> = ({
  documents,
  selectedDocument,
  onSelectDocument,
  onUpdateDocumentSummary,
  onOpenInBlocknote,
  onOpenPresentation,
  lang = 'fr',
}) => {
  const [style, setStyle] = useState<'cornell' | 'concise' | 'exam_prep' | 'flashcards'>('cornell');
  const [targetLength, setTargetLength] = useState<'brief' | 'detailed'>('brief');
  const [language, setLanguage] = useState<'auto' | 'en' | 'fr'>('auto');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [examTips, setExamTips] = useState<string[]>([]);

  const activeDoc = selectedDocument || (documents.length > 0 ? documents[0] : null);

  const handleGenerateSummary = async () => {
    if (!activeDoc) return;

    setLoading(true);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeDoc.title,
          subject: activeDoc.subject,
          content: activeDoc.content,
          style,
          targetLength,
          language: lang === 'fr' ? 'fr' : 'en',
        }),
      });

      if (!res.ok) {
        throw new Error(lang === 'fr' ? 'Échec de la génération du résumé' : 'Failed to generate summary');
      }

      const data = await res.json();
      onUpdateDocumentSummary(activeDoc.id, data.summary, data.keyPoints || []);
      if (data.examTips) {
        setExamTips(data.examTips);
      }
    } catch (err: any) {
      console.error('Summary error:', err);
      alert(err.message || (lang === 'fr' ? 'Erreur lors de la génération du résumé' : 'Error generating summary'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!activeDoc?.summary) return;
    navigator.clipboard.writeText(activeDoc.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    if (!activeDoc || !activeDoc.summary) return;

    setExportingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let cursorY = 16;

      // Header Box
      doc.setFillColor(30, 41, 59); // slate-800
      doc.roundedRect(margin, cursorY, contentWidth, 20, 2, 2, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const headerTitle = lang === 'fr' ? 'FICHE DE RÉVISION & SYNTHÈSE DE COURS' : 'STUDY SUMMARY & REVISION GUIDE';
      doc.text(headerTitle, margin + 5, cursorY + 7);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225);
      doc.text(`[${activeDoc.subject}] ${activeDoc.title}`, margin + 5, cursorY + 14);
      cursorY += 26;

      // Metadata text
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      const dateStr = new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      doc.text(
        `${lang === 'fr' ? 'Généré le :' : 'Generated:'} ${dateStr}  |  ${lang === 'fr' ? 'Format :' : 'Format:'} ${style.toUpperCase()}  |  Degreelocker`,
        margin,
        cursorY
      );
      cursorY += 8;

      // Key Points
      if (activeDoc.keyPoints && activeDoc.keyPoints.length > 0) {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        
        const kpLines: string[] = [];
        activeDoc.keyPoints.forEach((kp) => {
          const lines = doc.splitTextToSize(`• ${kp}`, contentWidth - 10);
          kpLines.push(...lines);
        });

        const boxHeight = 10 + kpLines.length * 5;
        doc.roundedRect(margin, cursorY, contentWidth, boxHeight, 2, 2, 'FD');

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.text(lang === 'fr' ? 'POINTS CLÉS DE MÉMORISATION' : 'KEY MEMORIZATION POINTS', margin + 4, cursorY + 6);

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        let kpY = cursorY + 11;
        kpLines.forEach((line) => {
          doc.text(line, margin + 5, kpY);
          kpY += 5;
        });

        cursorY += boxHeight + 8;
      }

      // Summary
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.text(lang === 'fr' ? 'SYNTHÈSE DU COURS' : 'COURSE SUMMARY', margin, cursorY);
      cursorY += 5;

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      const splitSummary = doc.splitTextToSize(activeDoc.summary, contentWidth);

      for (let i = 0; i < splitSummary.length; i++) {
        if (cursorY > 275) {
          doc.addPage();
          cursorY = 20;
        }
        doc.text(splitSummary[i], margin, cursorY);
        cursorY += 4.5;
      }

      // Exam Tips
      if (examTips && examTips.length > 0) {
        cursorY += 6;
        if (cursorY > 260) {
          doc.addPage();
          cursorY = 20;
        }

        doc.setFillColor(254, 243, 199);
        doc.setDrawColor(245, 158, 11);
        const tipLines: string[] = [];
        examTips.forEach((tip) => {
          const lines = doc.splitTextToSize(`⚠️ ${tip}`, contentWidth - 10);
          tipLines.push(...lines);
        });

        const tipsBoxHeight = 10 + tipLines.length * 5;
        doc.roundedRect(margin, cursorY, contentWidth, tipsBoxHeight, 2, 2, 'FD');

        doc.setTextColor(146, 64, 14);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.text(lang === 'fr' ? 'PIÈGES D\'EXAMEN & CONSEILS' : 'EXAM TIPS & PITFALLS', margin + 4, cursorY + 6);

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        let tipY = cursorY + 11;
        tipLines.forEach((line) => {
          doc.text(line, margin + 5, tipY);
          tipY += 5;
        });
      }

      const safeName = (activeDoc.title || 'study_summary').replace(/[^a-zA-Z0-9_-]/g, '_');
      doc.save(`Fiche_${safeName}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setExportingPdf(false);
    }
  };

  if (!activeDoc) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-xl p-8 border border-slate-200 text-center shadow-sm">
        <Sparkles className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">
          {lang === 'fr' ? 'Aucune note de cours trouvée' : 'No School Note Found'}
        </h3>
        <p className="text-xs text-slate-600 mt-1">
          {lang === 'fr'
            ? 'Ajoutez ou importez des cours dans votre base locale pour générer des synthèses structurées.'
            : 'Add or upload notes to your database first to generate structured summaries.'}
        </p>
      </div>
    );
  }

  const badge = getSubjectBadgeClass(activeDoc.subject);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-700 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {lang === 'fr' ? 'Synthèse IA & Fiches de Révision Rapide' : 'AI Academic Summarizer (Study Sheets)'}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {lang === 'fr' ? 'Synthétiser & Créer des Fiches de Révision' : 'Synthesize & Create Study Sheets'}
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          {lang === 'fr'
            ? 'Transformez des chapitres denses et des polycopiés PDF en synthèses à fort impact prêtes pour la révision d\'examen ou la recopie au propre.'
            : 'Transform lengthy class notes and PDFs into high-yield summaries structured for rapid revision or physical blocknote copying.'}
        </p>

        {/* Configuration Bar */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          
          {/* Document Picker */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              {lang === 'fr' ? 'Document cible :' : 'Target Document:'}
            </label>
            <select
              id="resumer-doc-select"
              value={activeDoc.id}
              onChange={(e) => {
                const found = documents.find(d => d.id === e.target.value);
                if (found) onSelectDocument(found);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  [{d.subject}] {d.title}
                </option>
              ))}
            </select>
          </div>

          {/* Style */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              {lang === 'fr' ? 'Style de fiche :' : 'Summary Style:'}
            </label>
            <select
              id="resumer-style-select"
              value={style}
              onChange={(e) => setStyle(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="cornell">{lang === 'fr' ? 'Fiche Méthode Cornell' : 'Cornell Study Sheet'}</option>
              <option value="concise">{lang === 'fr' ? 'Synthèse Concis & Définitions' : 'Concise Executive Recap'}</option>
              <option value="exam_prep">{lang === 'fr' ? 'Fiche Spécial Examen / Bac' : 'Exam Prep High-Yield'}</option>
              <option value="flashcards">{lang === 'fr' ? 'Format Questions / Réponses' : 'Q&A Flashcard Format'}</option>
            </select>
          </div>

          {/* Length */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              {lang === 'fr' ? 'Longueur :' : 'Length:'}
            </label>
            <select
              id="resumer-length-select"
              value={targetLength}
              onChange={(e) => setTargetLength(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="brief">{lang === 'fr' ? 'Condensé & Essentiel' : 'Brief & Punchy'}</option>
              <option value="detailed">{lang === 'fr' ? 'Complet & Approfondi' : 'In-Depth Comprehensive'}</option>
            </select>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              id="btn-run-resumer"
              onClick={handleGenerateSummary}
              disabled={loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'fr' ? 'Génération...' : 'Summarizing...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Générer la Synthèse' : 'Generate Summary'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Summary View Card */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
              {activeDoc.subject}
            </span>
            <h3 className="text-lg font-bold text-slate-900 truncate max-w-md">
              {activeDoc.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeDoc.summary && (
              <>
                <button
                  id="btn-export-summary-pdf"
                  onClick={handleExportPDF}
                  disabled={exportingPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors shadow-2xs"
                  title={lang === 'fr' ? 'Exporter la fiche en PDF propre' : 'Export clean study sheet PDF'}
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{exportingPdf ? (lang === 'fr' ? 'Exportation...' : 'Exporting...') : (lang === 'fr' ? 'Exporter en PDF' : 'Export Study PDF')}</span>
                </button>

                <button
                  onClick={() => exportSlidesDeckPdf(activeDoc, (lang || 'fr') as AppLanguage)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors shadow-2xs"
                  title={lang === 'fr' ? 'Télécharger un diaporama PDF 16:9 basé sur le résumé et points clés' : 'Download 16:9 PDF slide deck'}
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === 'fr' ? 'Télécharger en Diapos' : 'Download as Slides'}</span>
                </button>

                {onOpenPresentation && (
                  <button
                    onClick={() => onOpenPresentation(activeDoc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors shadow-2xs"
                    title={lang === 'fr' ? 'Lancer le mode présentation plein écran' : 'Launch full-screen presentation mode'}
                  >
                    <Tv className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{lang === 'fr' ? 'Mode Présentation' : 'Presentation Mode'}</span>
                  </button>
                )}

                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (lang === 'fr' ? 'Copié !' : 'Copied') : (lang === 'fr' ? 'Copier' : 'Copy')}</span>
                </button>

                <button
                  onClick={() => onOpenInBlocknote(activeDoc)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300/60 rounded-lg transition-colors shadow-2xs"
                >
                  <PenTool className="w-3.5 h-3.5 text-amber-700" />
                  <span>{lang === 'fr' ? 'Ouvrir en Blocknote' : 'Reproduce in Blocknote'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content of Summary */}
        {activeDoc.summary ? (
          <div className="space-y-6">
            <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed whitespace-pre-line bg-slate-50/60 p-5 rounded-xl border border-slate-200">
              {activeDoc.summary}
            </div>

            {/* Key revision points */}
            {activeDoc.keyPoints && activeDoc.keyPoints.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                  {lang === 'fr' ? 'Points Clés de Mémorisation :' : 'Key Memorization Bullet Points:'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeDoc.keyPoints.map((point, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 shadow-2xs flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5"></span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exam Tips if returned */}
            {examTips.length > 0 && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  {lang === 'fr' ? 'Pièges d\'examen & Conseils Méthodo :' : 'Exam Traps & Test Tips:'}
                </h4>
                <ul className="space-y-1 text-xs text-amber-900">
                  {examTips.map((tip, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-medium">
              {lang === 'fr' ? 'Aucune synthèse générée pour cette note pour le moment.' : 'No summary generated yet for this note.'}
            </p>
            <button
              onClick={handleGenerateSummary}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Générer la Synthèse Maintenant' : 'Generate Summary Now'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
