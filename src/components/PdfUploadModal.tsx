import React, { useState, useRef } from 'react';
import { SchoolDocument } from '../types';
import { formatFileSize } from '../utils/colors';
import { FamousQuote, FAMOUS_QUOTES } from '../data/famousQuotes';
import { 
  Upload, 
  FileText, 
  X, 
  Sparkles, 
  AlertCircle, 
  Loader2,
  FileCheck,
  BookOpen,
  FileSpreadsheet,
  Link,
  Globe,
  FileType,
  Save,
  PenTool
} from 'lucide-react';

interface PdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPdfProcessed: (doc: SchoolDocument) => void;
  lang?: 'fr' | 'en';
}

export const PdfUploadModal: React.FC<PdfUploadModalProps> = ({
  isOpen,
  onClose,
  onPdfProcessed,
  lang = 'fr',
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'gdoc'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [googleDocUrl, setGoogleDocUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [gdocTitle, setGdocTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [randomQuote, setRandomQuote] = useState<FamousQuote>(FAMOUS_QUOTES[0]);

  React.useEffect(() => {
    if (loading) {
      setRandomQuote(FAMOUS_QUOTES[Math.floor(Math.random() * FAMOUS_QUOTES.length)]);
    }
  }, [loading]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const getFileKind = (fileName: string): 'pdf' | 'word' | 'excel' | 'text' => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf')) return 'pdf';
    if (lower.endsWith('.docx') || lower.endsWith('.doc')) return 'word';
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) return 'excel';
    return 'text';
  };

  const handleFileChange = (selectedFile: File) => {
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.csv', '.txt', '.md'];
    const hasValidExt = allowedExtensions.some((ext) => selectedFile.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setError(
        lang === 'fr'
          ? 'Formats supportés : PDF, Word (.docx), Excel (.xlsx, .csv), Texte (.txt, .md).'
          : 'Supported formats: PDF, Word (.docx), Excel (.xlsx, .csv), Text (.txt, .md).'
      );
      return;
    }

    if (selectedFile.size > 150 * 1024 * 1024) {
      setError(
        lang === 'fr'
          ? 'La taille du fichier dépasse la limite augmentée de 150 Mo.'
          : 'File size exceeds augmented 150MB limit.'
      );
      return;
    }

    setError(null);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = () => {
      setBase64(reader.result as string);
    };
    reader.onerror = () => {
      setError(lang === 'fr' ? 'Erreur de lecture du fichier local' : 'Failed to read local file');
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleProcessDocument = async (generateBlocknote: boolean = false) => {
    if (activeTab === 'file' && !file) {
      setError(lang === 'fr' ? 'Veuillez sélectionner un fichier.' : 'Please select a file first.');
      return;
    }

    if (activeTab === 'gdoc' && !googleDocUrl.trim() && !pastedText.trim()) {
      setError(
        lang === 'fr'
          ? 'Veuillez fournir un lien Google Doc ou coller le contenu.'
          : 'Please enter a Google Doc URL or paste content.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    setProgressMsg(
      generateBlocknote
        ? (lang === 'fr' ? 'Analyse du document et génération du guide bloc-notes...' : 'Analyzing document & generating blocknote guide...')
        : (lang === 'fr' ? 'Extraction et enregistrement dans la base locale...' : 'Extracting and saving to local database...')
    );

    try {
      // If base64 is not yet ready, read it synchronously with Promise
      let effectiveBase64 = base64;
      if (activeTab === 'file' && file && !effectiveBase64) {
        effectiveBase64 = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.onerror = () => reject(new Error('Erreur de lecture du fichier'));
          r.readAsDataURL(file);
        });
        setBase64(effectiveBase64);
      }

      let parsedData: any = null;
      let finalDocType: any = 'pdf';

      if (activeTab === 'file' && file && effectiveBase64) {
        const fileKind = getFileKind(file.name);

        if (fileKind === 'pdf') {
          finalDocType = 'pdf';
          const parseRes = await fetch('/api/parse-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64Data: effectiveBase64,
              fileName: file.name,
            }),
          });
          if (!parseRes.ok) {
            const errData = await parseRes.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to extract text from PDF');
          }
          parsedData = await parseRes.json();
        } else {
          finalDocType = fileKind === 'word' ? 'word_docx' : fileKind === 'excel' ? 'excel_sheet' : 'typed_note';
          const parseRes = await fetch('/api/parse-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64Data: effectiveBase64,
              fileName: file.name,
              fileType: fileKind,
              language: lang,
            }),
          });
          if (!parseRes.ok) {
            const errData = await parseRes.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to process document');
          }
          parsedData = await parseRes.json();
        }
      } else {
        // Google Doc / Google Sheet
        finalDocType = 'google_doc';
        const parseRes = await fetch('/api/parse-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleDocUrl: googleDocUrl.trim() || undefined,
            pastedText: pastedText.trim() || undefined,
            fileName: gdocTitle.trim() ? `${gdocTitle}.gdoc` : 'google_doc_notes.gdoc',
            fileType: 'google_doc',
            language: lang,
          }),
        });

        if (!parseRes.ok) {
          const errData = await parseRes.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to process Google Doc content');
        }
        parsedData = await parseRes.json();
      }

      let blocknoteGuide = null;
      if (generateBlocknote) {
        setProgressMsg(
          lang === 'fr'
            ? 'Création du guide de reproduction bloc-notes Seyès...'
            : 'Building custom blocknote handwriting guide...'
        );

        try {
          const blocknoteRes = await fetch('/api/generate-blocknote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: parsedData.title || (file ? file.name : gdocTitle || 'Document'),
              subject: parsedData.subject || 'Général',
              content: parsedData.content,
              preferredPaper: 'ruled',
            }),
          });

          if (blocknoteRes.ok) {
            blocknoteGuide = await blocknoteRes.json();
          }
        } catch (bnErr) {
          console.warn('Blocknote generation note (document will still be saved):', bnErr);
        }
      }

      const newDoc: SchoolDocument = {
        id: `doc-${Date.now()}`,
        title: parsedData.title || (file ? file.name : gdocTitle || 'Document'),
        subject: parsedData.subject || 'Général',
        date: new Date().toISOString().split('T')[0],
        type: finalDocType,
        tags: parsedData.tags || ['StudyNote'],
        gradeLevel: parsedData.gradeLevel || 'Lycée / Université',
        content: parsedData.content || '',
        summary: parsedData.summary || '',
        keyPoints: parsedData.keyPoints || [],
        fileName: file ? file.name : (gdocTitle ? `${gdocTitle}.gdoc` : 'google_doc.gdoc'),
        fileSize: parsedData.fileSizeBytes || (file ? file.size : pastedText.length),
        pdfDataUrl: effectiveBase64 || undefined,
        localFilePath: parsedData.localFilePath,
        storedFileName: parsedData.storedFileName,
        blocknoteReproduction: blocknoteGuide,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onPdfProcessed(newDoc);
      onClose();
    } catch (err: any) {
      console.error('Document process error:', err);
      setError(err.message || 'Error processing document');
    } finally {
      setLoading(false);
      setProgressMsg('');
    }
  };

  // Sample quick loader for testing
  const handleLoadSamplePdfNote = () => {
    const sampleDoc: SchoolDocument = {
      id: `doc-${Date.now()}`,
      title: 'Organic Chemistry: Functional Groups & IUPAC Nomenclature',
      subject: 'Chemistry',
      date: new Date().toISOString().split('T')[0],
      type: 'pdf',
      tags: ['OrganicChemistry', 'IUPAC', 'FunctionalGroups', 'Reactions'],
      gradeLevel: 'Grade 12 / AP Chem',
      fileName: 'organic_chemistry_summary.pdf',
      fileSize: 142800,
      content: `Organic Chemistry Functional Groups Reference Sheet:

1. Hydrocarbons:
- Alkanes: C_n H_(2n+2). Saturated, single C-C bonds. Low reactivity, combustion & radical substitution.
- Alkenes: C_n H_2n. Unsaturated, double C=C bond (sp2 hybridized). Undergo electrophilic addition (Markovnikov's rule).
- Alkynes: C_n H_(2n-2). Triple C≡C bond (sp hybridized).

2. Oxygen-Containing Functional Groups:
- Alcohols: R-OH. Suffix '-ol'. Hydrogen bonding increases boiling points. Primary, secondary, tertiary classifications.
- Ethers: R-O-R'. Relatively inert, good polar aprotic solvents.
- Aldehydes: R-CHO. Carbonyl at terminal carbon. Readily oxidized to carboxylic acids (Tollens test).
- Ketones: R-CO-R'. Carbonyl at internal carbon. Resistant to mild oxidation.
- Carboxylic Acids: R-COOH. Weak acids (pKa ~ 4-5). Undergo nucleophilic acyl substitution.
- Esters: R-COO-R'. Pleasant fruity odors. Formed by Fischer esterification (acid + alcohol + H+).

3. Nitrogen-Containing Functional Groups:
- Amines: R-NH2 (primary), R2NH (secondary), R3N (tertiary). Basic character due to lone pair on nitrogen.
- Amides: R-CONH2. Found in peptide bonds linking amino acids. Resonance stabilization gives planar geometry.`,
      summary: `Comprehensive overview of organic chemical nomenclature and functional groups: alkanes, alkenes, alkynes, alcohols, aldehydes, ketones, carboxylic acids, esters, amines, and amides with their characteristic reaction profiles and IUPAC rules.`,
      keyPoints: [
        'Alcohols form hydrogen bonds and have higher boiling points than alkanes or ethers.',
        'Aldehydes possess terminal carbonyls; ketones possess internal carbonyls.',
        'Carboxylic acids undergo nucleophilic acyl substitution to form esters, amides, and anhydrides.',
        'Peptide bonds are amides formed between carboxylic acid and amine groups with resonance stabilization.',
      ],
      blocknoteReproduction: {
        title: 'Organic Chemistry - Reaction Sheet',
        estimatedCopyTimeMin: 8,
        recommendedPaper: 'seyes',
        recommendedPens: [
          { color: '#2563eb', name: 'Bleu', purpose: 'Nomenclature et règles IUPAC' },
          { color: '#dc2626', name: 'Rouge', purpose: 'Groupes fonctionnels et formules' },
          { color: '#16a34a', name: 'Vert', purpose: 'Exemples et applications de synthèse' },
        ],
        layoutStructure: 'cornell',
        sections: [
          {
            id: 'sec-1',
            heading: 'Hydrocarbures & Dérivés',
            cueMarginText: 'Familles C-H ?',
            lines: [
              { id: 'l1', text: 'Alcanes (liaisons simples C-C) ──> Formule brute CnH2n+2', type: 'formula', penColor: 'red' },
              { id: 'l2', text: 'Alcènes (liaison double C=C sp2) ──> Formule CnH2n (additions)', type: 'bullet', penColor: 'blue' },
              { id: 'l3', text: 'Alcynes (liaison triple C≡C sp) ──> Formule CnH2n-2', type: 'bullet', penColor: 'green' },
            ],
          },
          {
            id: 'sec-2',
            heading: 'Fonctions Oxygénées & Azotées',
            cueMarginText: 'Alcools & Acides',
            lines: [
              { id: 'l4', text: 'Alcools : R-OH (suffixe -ol, liaisons hydrogène très polaires)', type: 'definition', penColor: 'blue' },
              { id: 'l5', text: 'Acides carboxyliques : R-COOH ──> Réaction d\'estérification avec alcools', type: 'formula', penColor: 'red' },
              { id: 'l6', text: 'Amides : R-CO-NH-R\' ──> Base des liaisons peptidiques des protéines', type: 'box_note', penColor: 'green' },
            ],
          },
        ],
        bottomSummary: 'Mémoriser les priorités IUPAC : Acide carboxylique > Ester > Aldéhyde > Cétone > Alcool > Amine > Alcène > Alcyne > Alcane.',
        handwritingTips: [
          'Encadrez en rouge la formule générale de chaque fonction.',
          'Tracez la liaison peptidique en vert pour la repérer instantanément.',
          'Notez les suffixes en marge gauche (ex: -ol, -oïque, -oate).',
        ],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onPdfProcessed(sampleDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {lang === 'fr' ? 'Importer des Documents de Cours' : 'Import Course Documents & Notes'}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">
                {lang === 'fr'
                  ? 'Compatible PDF, Word (.docx), Excel (.xlsx, .csv), Google Docs & texte brut'
                  : 'Supports PDF, Word (.docx), Excel (.xlsx, .csv), Google Docs & text'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/40 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'file'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileType className="w-3.5 h-3.5" />
            {lang === 'fr' ? 'Fichier (PDF, Word, Excel, CSV, TXT)' : 'File (PDF, Word, Excel, CSV, TXT)'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gdoc')}
            className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'gdoc'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'fr' ? 'Google Docs / Sheets' : 'Google Docs / Sheets'}
          </button>
        </div>

        {/* Body */}
        <div className="p-3.5 sm:p-6 space-y-4 flex-1 overflow-y-auto relative">
          {loading && (
            <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-6" />
              <div className="max-w-md space-y-4">
                <p className="text-sm sm:text-base font-semibold text-slate-800 italic">
                  "{lang === 'fr' ? randomQuote.quoteFr : randomQuote.quote}"
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  — {randomQuote.author}
                </p>
              </div>
              {progressMsg && (
                <p className="mt-8 text-xs font-bold text-indigo-600 animate-pulse">
                  {progressMsg}
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: File Upload */}
          {activeTab === 'file' && (
            <div className="space-y-3">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50'
                    : file
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />

                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatFileSize(file.size)} • {file.name.split('.').pop()?.toUpperCase()}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setBase64(null);
                      }}
                      className="text-xs text-rose-600 hover:underline mt-2"
                    >
                      {lang === 'fr' ? 'Changer de fichier' : 'Choose a different file'}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      {lang === 'fr'
                        ? 'Glissez-déposez votre document ici, ou cliquez pour parcourir'
                        : 'Drag and drop your document here, or click to browse'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === 'fr'
                        ? 'PDF, Word (.docx), Excel (.xlsx, .csv), texte (capacité jusqu’à 150 Mo)'
                        : 'PDF, Word (.docx), Excel (.xlsx, .csv), text (augmented up to 150MB)'}
                    </p>
                    <div className="flex items-center gap-1.5 pt-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        PDF
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        DOCX
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        XLSX
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        CSV / TXT
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Google Docs */}
          {activeTab === 'gdoc' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'fr' ? 'Lien Google Doc ou Google Sheet :' : 'Google Doc or Sheet Share Link:'}
                </label>
                <div className="relative">
                  <Link className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={googleDocUrl}
                    onChange={(e) => setGoogleDocUrl(e.target.value)}
                    placeholder="https://docs.google.com/document/d/..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {lang === 'fr'
                    ? 'Le lien doit être accessible en lecture (« Tous les utilisateurs disposant du lien »).'
                    : 'Link must be viewable by anyone with the link.'}
                </p>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-2 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {lang === 'fr' ? 'Ou coller le contenu' : 'Or paste content directly'}
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'fr' ? 'Titre de la note :' : 'Note Title:'}
                </label>
                <input
                  type="text"
                  value={gdocTitle}
                  onChange={(e) => setGdocTitle(e.target.value)}
                  placeholder={lang === 'fr' ? 'Ex: Cours de Philo - Le Devoir' : 'e.g. History Lecture notes'}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'fr' ? 'Texte copié depuis Google Doc :' : 'Copied text from Google Doc:'}
                </label>
                <textarea
                  rows={4}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={lang === 'fr' ? 'Collez ici le texte...' : 'Paste document text here...'}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Quick Demo Note Link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleLoadSamplePdfNote}
              className="text-xs text-slate-600 hover:text-indigo-600 underline font-medium"
            >
              {lang === 'fr' ? 'Ou charger un exemple complet (Chimie Organique)' : 'Or load sample Chemistry PDF study guide'}
            </button>
          </div>

          {/* Progress Indicator */}
          {loading && (
            <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-3 text-xs text-indigo-950">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
              <span className="font-medium">{progressMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-6 sm:py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors text-center cursor-pointer"
          >
            {lang === 'fr' ? 'Annuler' : 'Cancel'}
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* 1. Sauvegarder simple */}
            <button
              type="button"
              disabled={loading || (activeTab === 'file' ? !file : !googleDocUrl.trim() && !pastedText.trim())}
              onClick={() => handleProcessDocument(false)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              title={lang === 'fr' ? 'Sauvegarder simplement le document dans la base locale' : 'Save document directly to local database'}
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>{lang === 'fr' ? 'Sauvegarder simple' : 'Simple Save'}</span>
            </button>

            {/* 2. Sauvegarder et générer un bloc-notes */}
            <button
              type="button"
              disabled={loading || (activeTab === 'file' ? !file : !googleDocUrl.trim() && !pastedText.trim())}
              onClick={() => handleProcessDocument(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all shadow-sm border border-indigo-400/30 disabled:opacity-50 cursor-pointer"
              title={lang === 'fr' ? 'Sauvegarder le cours et créer le guide de recopie manuscrite Cornell' : 'Save course and build Cornell blocknote guide'}
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <PenTool className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>{lang === 'fr' ? 'Sauvegarder & Générer Bloc-notes' : 'Save & Build Blocknote'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
