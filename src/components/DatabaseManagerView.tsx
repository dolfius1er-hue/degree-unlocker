import React, { useState, useEffect } from 'react';
import { SchoolDocument, AppLanguage } from '../types';
import { 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  FileText, 
  Code, 
  Layers, 
  HardDrive,
  Check,
  AlertTriangle,
  Server,
  ShieldCheck,
  Lock,
  WifiOff,
  Cpu,
  HelpCircle,
  Coins,
  Globe,
  DollarSign,
  Folder,
  Sparkles,
  RefreshCw,
  FolderOpen,
  FileSpreadsheet
} from 'lucide-react';

interface DatabaseManagerViewProps {
  documents: SchoolDocument[];
  onImportDatabase: (docs: SchoolDocument[]) => void;
  onResetSeed: () => void;
  lang?: AppLanguage;
}

interface ServerDatabaseStatus {
  isLocalDisk: boolean;
  storageType: string;
  privacyProof: {
    cloudDatabasesConnected: boolean;
    externalSync: string;
    zeroCloudStorage: boolean;
    guarantee: string;
  };
  dataDirectory: string;
  databaseFile: {
    path: string;
    exists: boolean;
    sizeBytes: number;
    docCount: number;
    lastModified: string | null;
  };
  flashcardsFile: {
    path: string;
    exists: boolean;
    sizeBytes: number;
    count: number;
    lastModified: string | null;
  };
  uploadsFolder: {
    path: string;
    exists: boolean;
    fileCount: number;
    totalSizeBytes: number;
  };
  totalDiskUsageBytes: number;
}

export const DatabaseManagerView: React.FC<DatabaseManagerViewProps> = ({
  documents,
  onImportDatabase,
  onResetSeed,
  lang = 'fr',
}) => {
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [diskStatus, setDiskStatus] = useState<ServerDatabaseStatus | null>(null);
  const [loadingDiskStatus, setLoadingDiskStatus] = useState(false);
  const [exportingBundle, setExportingBundle] = useState(false);
  const [activeFaqTab, setActiveFaqTab] = useState<'privacy' | 'gemini' | 'exporting'>('privacy');

  // Fetch live disk status from backend
  const fetchDiskStatus = async () => {
    setLoadingDiskStatus(true);
    try {
      const res = await fetch('/api/database/status');
      if (res.ok) {
        const data = await res.json();
        setDiskStatus(data);
      }
    } catch (err) {
      console.error('Failed to load disk status:', err);
    } finally {
      setLoadingDiskStatus(false);
    }
  };

  useEffect(() => {
    fetchDiskStatus();
  }, [documents.length]);

  // Compute stats
  const totalDocs = documents.length;
  const pdfCount = documents.filter(d => d.type === 'pdf').length;
  const wordCount = documents.filter(d => d.type === 'word_docx').length;
  const excelCount = documents.filter(d => d.type === 'excel_sheet').length;
  const noteCount = documents.filter(d => d.type === 'typed_note' || d.type === 'handwritten_scan' || !d.type).length;
  const totalWords = documents.reduce((acc, d) => acc + (d.content ? d.content.split(/\s+/).length : 0), 0);

  // Subject breakdown
  const initialSubjectMap: Record<string, number> = {};
  const subjectMap = documents.reduce((acc, d) => {
    const s = d.subject || 'General';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, initialSubjectMap);

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 KB';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  // Export JSON (Documents Only)
  const handleExportDatabase = () => {
    const jsonStr = JSON.stringify(documents, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inside_pc_school_notes_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export Complete Bundle (Documents + Flashcards)
  const handleExportCompleteBundle = async () => {
    setExportingBundle(true);
    try {
      window.location.href = '/api/database/export-complete';
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setTimeout(() => setExportingBundle(false), 1500);
    }
  };

  // Export Database Metadata to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Titre',
      'Matière',
      'Type Document',
      'Date Création',
      'Tags',
      'Nombre de Mots',
      'Nombre de Points Clés',
      'Nom de Fichier Source',
      'Aperçu / Résumé'
    ];

    const escapeCsvField = (val: string | number | undefined | null): string => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = documents.map((doc) => {
      const wordCount = doc.content ? doc.content.trim().split(/\s+/).filter(Boolean).length : 0;
      const keyPointsCount = doc.keyPoints ? doc.keyPoints.length : 0;
      const tagsStr = (doc.tags || []).join('; ');
      const cleanSummary = doc.summary ? doc.summary.replace(/(\r\n|\n|\r)/gm, ' ').slice(0, 300) : '';

      return [
        escapeCsvField(doc.id),
        escapeCsvField(doc.title),
        escapeCsvField(doc.subject || 'Général'),
        escapeCsvField(doc.type || 'typed_note'),
        escapeCsvField(doc.date),
        escapeCsvField(tagsStr),
        escapeCsvField(wordCount),
        escapeCsvField(keyPointsCount),
        escapeCsvField(doc.originalFileName || doc.localFilePath || 'Non spécifié'),
        escapeCsvField(cleanSummary)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inside_pc_school_notes_metadata_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        
        // Check if full bundle or standard documents array
        if (parsed.version === '2.0' && Array.isArray(parsed.documents)) {
          // Unified bundle
          const res = await fetch('/api/database/import-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed),
          });
          if (res.ok) {
            onImportDatabase(parsed.documents);
            setImportStatus(
              lang === 'fr'
                ? `Sauvegarde complète restaurée avec succès (${parsed.documents.length} cours, ${parsed.flashcards?.length || 0} fiches flash) !`
                : `Complete backup restored successfully (${parsed.documents.length} notes, ${parsed.flashcards?.length || 0} flashcards)!`
            );
            fetchDiskStatus();
          }
        } else if (Array.isArray(parsed)) {
          onImportDatabase(parsed);
          setImportStatus(
            lang === 'fr'
              ? `Importation réussie de ${parsed.length} cours !`
              : `Successfully imported ${parsed.length} school documents!`
          );
          fetchDiskStatus();
        } else {
          alert(lang === 'fr' ? 'Format de base de données JSON non valide.' : 'Invalid database format. Expected JSON array or backup bundle.');
        }
        setTimeout(() => setImportStatus(null), 4000);
      } catch (err) {
        alert(lang === 'fr' ? 'Impossible de lire ce fichier JSON.' : 'Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const schemaDefinition = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "InsidePcSchoolDatabase",
  "description": "100% Local PC JSON Database Storage Schema",
  "storagePath": "./data/database.json & ./data/flashcards.json",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "title": { "type": "string" },
    "subject": { "type": "string" },
    "date": { "type": "string", "format": "date" },
    "type": { "type": "string", "enum": ["pdf", "typed_note", "word_docx", "excel_sheet", "google_doc", "handwritten_scan"] },
    "tags": { "type": "array", "items": { "type": "string" } },
    "content": { "type": "string" },
    "summary": { "type": "string" },
    "keyPoints": { "type": "array", "items": { "type": "string" } },
    "fileName": { "type": "string" },
    "localFilePath": { "type": "string" },
    "blocknoteReproduction": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "layoutStructure": { "type": "string", "enum": ["cornell", "bullet", "mindmap_tree", "cheat_sheet"] },
        "sections": { "type": "array" }
      }
    }
  }
}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* LOCAL PC PRIVACY & AIR-GAPPED STATUS BANNER */}
      <div className="bg-linear-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-emerald-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'fr' ? 'Stockage 100% Local sur votre PC (Sans Cloud Externe)' : '100% Inside-PC Local Storage (Air-Gapped Ready)'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {lang === 'fr' ? 'Base de Données Interne à Votre PC' : 'Your Inside-PC Local Database'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {lang === 'fr' 
                ? "Garantie de confidentialité absolue : Vos cours, vos fiches de révision, vos PDF, Word, Excel et vos notes manuscrites sont stockés exclusivement sur le disque dur de votre ordinateur (dossier ./data/). Aucune base de données cloud (Firebase, AWS, Supabase) n'est utilisée."
                : "Absolute privacy guarantee: All notes, flashcards, PDFs, Word, Excel files, and handwritten scans are saved strictly onto your local PC hard drive in the ./data/ directory. Zero third-party cloud databases are connected."}
            </p>
          </div>

          <button
            onClick={fetchDiskStatus}
            disabled={loadingDiskStatus}
            className="self-start md:self-center px-4 py-2 bg-emerald-700/60 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 border border-emerald-500/40 transition-all shadow-xs"
            title="Refresh local disk metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingDiskStatus ? 'animate-spin' : ''}`} />
            <span>{lang === 'fr' ? 'Vérifier l’état du disque' : 'Check Disk Status'}</span>
          </button>
        </div>

        {/* Live Inside-PC Storage Files Inspector */}
        <div className="mt-6 pt-5 border-t border-emerald-800/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-emerald-800/40">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-mono text-[11px] text-emerald-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> data/database.json
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                {diskStatus?.databaseFile ? formatBytes(diskStatus.databaseFile.sizeBytes) : 'Local'}
              </span>
            </div>
            <p className="text-slate-200 font-bold text-sm">
              {totalDocs} {lang === 'fr' ? 'documents & cours' : 'documents stored'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              {lang === 'fr' ? 'Fichier JSON physique sur votre disque dur' : 'Physical JSON file on PC hard drive'}
            </p>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-emerald-800/40">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-mono text-[11px] text-purple-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> data/flashcards.json
              </span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">
                {diskStatus?.flashcardsFile ? formatBytes(diskStatus.flashcardsFile.sizeBytes) : 'Local'}
              </span>
            </div>
            <p className="text-slate-200 font-bold text-sm">
              {diskStatus?.flashcardsFile?.count ?? '—'} {lang === 'fr' ? 'fiches de révision' : 'flashcards stored'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              {lang === 'fr' ? 'Répétition espacée persistée en local' : 'Spaced repetition Leitner state on disk'}
            </p>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-emerald-800/40">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-mono text-[11px] text-blue-300 flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5" /> data/uploads/
              </span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">
                {diskStatus?.uploadsFolder ? formatBytes(diskStatus.uploadsFolder.totalSizeBytes) : 'Local'}
              </span>
            </div>
            <p className="text-slate-200 font-bold text-sm">
              {diskStatus?.uploadsFolder?.fileCount ?? pdfCount} {lang === 'fr' ? 'fichiers sauvegardés' : 'files on disk'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              {lang === 'fr' ? 'PDF, Word (.docx), Excel (.xlsx)' : 'PDFs, Word (.docx), Excel (.xlsx)'}
            </p>
          </div>
        </div>
      </div>

      {/* BACKUP, EXPORT & PORTABILITY ACTIONS */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-indigo-600" />
          <span>{lang === 'fr' ? 'Sauvegarde et Portabilité sur votre PC' : 'Local PC Backup & Complete Export'}</span>
        </h3>
        <p className="text-xs text-slate-600 mb-5">
          {lang === 'fr' 
            ? "Vous pouvez télécharger l'intégralité de vos cours et fiches sous forme de fichier JSON unique pour le copier sur une clé USB ou un autre ordinateur, ou restaurer une sauvegarde précédente."
            : "Export the full inside-PC database (notes + spaced repetition flashcards) as a standalone JSON bundle to transfer via USB or keep safe offline."}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {/* Export Complete Bundle */}
          <button
            id="btn-export-complete-database"
            onClick={handleExportCompleteBundle}
            disabled={exportingBundle}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>
              {lang === 'fr' 
                ? (exportingBundle ? 'Téléchargement...' : 'Exporter le Pack Complet PC (Cours + Fiches)') 
                : (exportingBundle ? 'Downloading...' : 'Export Complete PC Bundle (Notes + Flashcards)')}
            </span>
          </button>

          {/* Export Notes Only */}
          <button
            id="btn-export-notes-only"
            onClick={handleExportDatabase}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>{lang === 'fr' ? 'Exporter Cours JSON' : 'Export Notes JSON'}</span>
          </button>

          {/* Export Metadata CSV */}
          <button
            id="btn-export-metadata-csv"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
            title={lang === 'fr' ? 'Exporter la liste et les métadonnées de tous les cours en fichier CSV (Excel, LibreOffice, Google Sheets)' : 'Export document metadata inventory to CSV (Excel / Sheets)'}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{lang === 'fr' ? '📊 Exporter Métadonnées (CSV / Excel)' : '📊 Export Metadata (CSV / Excel)'}</span>
          </button>

          {/* Import JSON */}
          <label className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer shadow-2xs">
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>{lang === 'fr' ? 'Restaurer une Sauvegarde JSON' : 'Restore JSON Backup'}</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Reset Seed */}
          <button
            id="btn-reset-database"
            onClick={() => {
              if (confirm(lang === 'fr' ? 'Réinitialiser la base avec les exemples de cours par défaut ?' : 'Reset your database to original course seed notes?')) {
                onResetSeed();
              }
            }}
            className="px-3.5 py-2.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 transition-colors ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Restaurer les cours exemples' : 'Restore Default Samples'}</span>
          </button>
        </div>

        {importStatus && (
          <p className="mt-3 text-xs text-emerald-700 font-semibold flex items-center gap-1.5 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
            <Check className="w-4 h-4" />
            {importStatus}
          </p>
        )}
      </div>

      {/* METRICS & ACADEMIC CORPUS OVERVIEW */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600" />
          <span>{lang === 'fr' ? 'Inventaire du Contenu Local' : 'Local Content Inventory'}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[11px] font-bold uppercase text-slate-500">{lang === 'fr' ? 'Total Documents' : 'Total Documents'}</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalDocs}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{lang === 'fr' ? 'Sur disque PC' : 'On PC disk'}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[11px] font-bold uppercase text-slate-500">PDFs</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">{pdfCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{lang === 'fr' ? 'Extraits & indexés' : 'Parsed & indexed'}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[11px] font-bold uppercase text-slate-500">Word (.docx)</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">{wordCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{lang === 'fr' ? 'Traités en texte' : 'Mammoth parser'}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[11px] font-bold uppercase text-slate-500">Excel (.xlsx)</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{excelCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{lang === 'fr' ? 'Matrices de calcul' : 'Sheet matrix'}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[11px] font-bold uppercase text-slate-500">{lang === 'fr' ? 'Mots Indexés' : 'Indexed Words'}</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">~{totalWords.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{lang === 'fr' ? 'Recherche instantanée' : 'Fast search'}</p>
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
            {lang === 'fr' ? 'Matières & Disciplines Enregistrées' : 'Recorded Subjects & Topics'}
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(subjectMap).map(([subj, count]) => (
              <span 
                key={subj}
                className="text-xs bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-lg font-medium flex items-center gap-1.5"
              >
                <span>{subj}</span>
                <span className="font-mono text-slate-400">({count})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* GEMINI 3.8 & EXPORTING TO THE WORLD EXPLAINER */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900">
            {lang === 'fr' 
              ? 'Guide Complet : Fonctionnement de Gemini 3.8 & Tarification' 
              : 'Complete Guide: How Gemini 3.8 Works & Pricing Breakdown'}
          </h3>
        </div>
        <p className="text-xs text-slate-600 mb-5">
          {lang === 'fr'
            ? "Toutes les réponses à vos questions sur le modèle Gemini 3.8, la formule gratuite vs payante, la confidentialité, et comment exporter cette application pour vous et votre ami."
            : "Clear answers to your questions regarding Gemini 3.8 Flash, Free vs Paid tiers, data confidentiality, and how to export this app to the world with your friend."}
        </p>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
          <button
            onClick={() => setActiveFaqTab('privacy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeFaqTab === 'privacy' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? '1. Local vs En Ligne' : '1. Local vs Online'}</span>
          </button>

          <button
            onClick={() => setActiveFaqTab('gemini')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeFaqTab === 'gemini' 
                ? 'bg-indigo-100 text-indigo-800' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? '2. Tarification & Grade Payant' : '2. Pricing & Paid Grade'}</span>
          </button>

          <button
            onClick={() => setActiveFaqTab('exporting')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeFaqTab === 'exporting' 
                ? 'bg-purple-100 text-purple-800' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? '3. Exporter dans le Monde' : '3. Exporting to the World'}</span>
          </button>
        </div>

        {/* Tab Content 1: Local vs Online */}
        {activeFaqTab === 'privacy' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-700">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <h4 className="font-bold text-emerald-900 text-sm mb-1 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                {lang === 'fr' ? 'Ce qui reste 100% sur votre PC :' : 'What stays 100% on your PC:'}
              </h4>
              <ul className="list-disc list-inside space-y-1 text-emerald-800 mt-2">
                <li><strong>{lang === 'fr' ? 'Tous vos cours et textes :' : 'All course notes & text:'}</strong> {lang === 'fr' ? 'Écrits dans data/database.json sur votre disque dur.' : 'Saved to data/database.json on your hard drive.'}</li>
                <li><strong>{lang === 'fr' ? 'Toutes vos fiches de révision :' : 'All revision flashcards:'}</strong> {lang === 'fr' ? 'Écrites dans data/flashcards.json avec vos scores Leitner.' : 'Saved to data/flashcards.json with your Leitner scores.'}</li>
                <li><strong>{lang === 'fr' ? 'Tous vos fichiers sources :' : 'All source files:'}</strong> {lang === 'fr' ? 'PDF, Word, Excel stockés dans data/uploads/.' : 'PDFs, Word, Excel stored in data/uploads/.'}</li>
                <li><strong>{lang === 'fr' ? 'La recherche par mots-clés :' : 'Keyword search:'}</strong> {lang === 'fr' ? 'Exécutée localement sur votre processeur, sans envoyer le moindre octet sur internet.' : 'Runs locally on your CPU with zero internet traffic.'}</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                <WifiOff className="w-4 h-4 text-slate-600" />
                {lang === 'fr' ? 'Quand internet est-il utilisé ?' : 'When is the internet used?'}
              </h4>
              <p className="text-slate-600">
                {lang === 'fr'
                  ? "Uniquement lorsque vous cliquez explicitement sur un bouton d'intelligence artificielle : « Résumer », « Générer la page Blocknote manuscrite », ou « Générer des Fiches Flash ». Le serveur envoie alors temporairement le texte du cours sélectionné à l'API Gemini pour obtenir la synthèse, puis enregistre le résultat immédiatement sur votre PC."
                  : "Only when you explicitly click an AI button: 'Summarize', 'Generate Blocknote', or 'Generate Flashcards'. The local backend temporarily sends that document's text to the Gemini API to format the synthesis, then immediately saves it locally to your PC disk."}
              </p>
            </div>
          </div>
        )}

        {/* Tab Content 2: Gemini Pricing & Paid Grade */}
        {activeFaqTab === 'gemini' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-blue-900 text-sm">{lang === 'fr' ? 'Formule Gratuite (Free Tier)' : 'Free Tier'}</span>
                  <span className="px-2 py-0.5 bg-blue-200 text-blue-800 rounded text-[11px] font-bold">0 € / mois</span>
                </div>
                <ul className="space-y-1.5 text-blue-800 text-[11px]">
                  <li>• <strong>{lang === 'fr' ? 'Coût :' : 'Cost:'}</strong> 100% Gratuit sans carte bancaire sur Google AI Studio.</li>
                  <li>• <strong>{lang === 'fr' ? 'Limites :' : 'Limits:'}</strong> Jusqu'à 15 requêtes par minute et 1 500 requêtes par jour.</li>
                  <li>• <strong>{lang === 'fr' ? 'Pour qui :' : 'Ideal for:'}</strong> Vous et votre ami pour réviser tous les jours sans jamais payer un centime !</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-purple-900 text-sm">{lang === 'fr' ? 'Grade Payant (Pay-as-you-go)' : 'Paid Grade (Pay-as-you-go)'}</span>
                  <span className="px-2 py-0.5 bg-purple-200 text-purple-800 rounded text-[11px] font-bold">~0.10 $ / million</span>
                </div>
                <ul className="space-y-1.5 text-purple-800 text-[11px]">
                  <li>• <strong>{lang === 'fr' ? 'Tarif ultra-bas :' : 'Extremely cheap:'}</strong> Gemini 3.8 Flash coûte environ 0,10 $ pour 1 000 000 de tokens (~750 000 mots).</li>
                  <li>• <strong>{lang === 'fr' ? 'Confidentialité totale :' : 'Strict Privacy:'}</strong> Google s'engage formellement à ne jamais entraîner ses modèles sur vos données sur le grade payant.</li>
                  <li>• <strong>{lang === 'fr' ? 'Aucun abonnement fixe :' : 'No fixed fee:'}</strong> Vous ne payez que les quelques centimes que vous consommez.</li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
              <p className="font-semibold flex items-center gap-1.5 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  {lang === 'fr'
                    ? "Astuce budget : Même avec des centaines de fiches créées par mois, le coût sur le grade payant ne dépasserait pas 0,50 € à 1,00 € par mois !"
                    : "Budget Tip: Even generating hundreds of study cards per month on the paid tier costs less than $0.50 to $1.00 per month."}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Tab Content 3: Exporting to the World */}
        {activeFaqTab === 'exporting' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-700">
            <p className="text-slate-600">
              {lang === 'fr'
                ? "Si vous et votre ami souhaitez exporter ou partager cette application, voici les 3 méthodes recommandées :"
                : "If you and your friend want to export or release this application to the world, here are the 3 best paths:"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">
                  {lang === 'fr' ? 'Option A : Application PC Locale (Desktop)' : 'Option A: Inside-PC Desktop App'}
                </p>
                <p className="text-[11px] text-slate-600">
                  {lang === 'fr'
                    ? "Emballez le projet avec Electron ou Tauri. L'application tourne 100% sur le PC de l'utilisateur avec ses fichiers JSON locaux. Zéro frais d'hébergement pour vous !"
                    : "Package with Electron or Tauri. Runs 100% on the user's PC with local JSON files. Zero server hosting costs for you!"}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">
                  {lang === 'fr' ? 'Option B : Site Web avec Plafond de Budget' : 'Option B: Web App with Budget Alert'}
                </p>
                <p className="text-[11px] text-slate-600">
                  {lang === 'fr'
                    ? "Déployez sur Cloud Run / Vercel en configurant un plafond d'alerte (ex: 5 €/mois) dans Google Cloud pour être certain de ne jamais avoir de mauvaise surprise."
                    : "Deploy to Cloud Run with a hard budget limit (e.g. $5/month) in Google Cloud Console so you never risk unexpected charges."}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">
                  {lang === 'fr' ? 'Option C : Clé API par Utilisateur (BYOK)' : 'Option C: User Brings Key (BYOK)'}
                </p>
                <p className="text-[11px] text-slate-600">
                  {lang === 'fr'
                    ? "Chaque utilisateur peut entrer sa propre clé gratuite Google AI Studio, ou utiliser uniquement la recherche locale sans clé."
                    : "Each user uses their own free Google AI Studio key, or uses the app in pure local offline search mode."}
                </p>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 text-indigo-950">
              <p className="font-semibold text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  {lang === 'fr'
                    ? "Évolution future : L'ajout de données économiques, gestion de budget ou quiz interactifs sera directement compatible avec cette même base locale sur votre PC."
                    : "Future additions: Economic tracking, money management, and interactive quizzes will directly leverage this same inside-PC local database structure."}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SCHEMA SPECIFICATION & TECHNICAL BLUEPRINT */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Code className="w-4 h-4 text-indigo-600" />
            <span>{lang === 'fr' ? 'Schéma Technique du Fichier Local (JSON)' : 'Local File Technical Schema Specification'}</span>
          </h3>
          <button
            onClick={() => {
              navigator.clipboard.writeText(schemaDefinition);
              setCopiedSchema(true);
              setTimeout(() => setCopiedSchema(false), 2000);
            }}
            className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5"
          >
            {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Code className="w-3.5 h-3.5" />}
            <span>{copiedSchema ? (lang === 'fr' ? 'Copié' : 'Copied') : (lang === 'fr' ? 'Copier le schéma' : 'Copy Schema')}</span>
          </button>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          {lang === 'fr'
            ? 'Format standardisé ouvert garantissant que vous restez toujours maître de vos données scolaires.'
            : 'Open standard schema ensuring you always maintain complete ownership of your academic records.'}
        </p>
        <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
          {schemaDefinition}
        </pre>
      </div>
    </div>
  );
};
