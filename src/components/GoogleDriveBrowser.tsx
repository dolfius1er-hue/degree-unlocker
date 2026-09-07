import React, { useState, useEffect, useId, useMemo } from 'react';
import {
  Folder,
  FileText,
  FileCode,
  Search,
  RefreshCw,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  LogIn,
  Filter,
  ArrowRight,
  Clock,
  HardDrive
} from 'lucide-react';
import {
  listDriveFiles,
  ingestDriveFile,
  GoogleDriveFile,
  DriveSupportedFilter
} from '../lib/googleWorkspace';
import { SchoolDocument, AppLanguage } from '../types';

interface GoogleDriveBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onOpenAuthModal: () => void;
  onIngestDocument: (doc: Partial<SchoolDocument>) => void | Promise<void>;
  lang?: AppLanguage;
}

export const GoogleDriveBrowser: React.FC<GoogleDriveBrowserProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuthModal,
  onIngestDocument,
  lang = 'fr',
}) => {
  const baseId = useId();
  const [filterType, setFilterType] = useState<DriveSupportedFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ingestion state
  const [ingestingFileId, setIngestingFileId] = useState<string | null>(null);
  const [ingestionSuccess, setIngestionSuccess] = useState<string | null>(null);

  // Real-time filtering by file name or document type (PDF, Google Doc)
  const filteredFiles = useMemo(() => {
    let result = files;

    // Filter by type pill if not 'all'
    if (filterType === 'docs') {
      result = result.filter((f) => f.mimeType === 'application/vnd.google-apps.document');
    } else if (filterType === 'pdfs') {
      result = result.filter((f) => f.mimeType === 'application/pdf');
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return result;

    return result.filter((file) => {
      const name = (file.name || '').toLowerCase();
      const isGoogleDoc = file.mimeType === 'application/vnd.google-apps.document';
      const isPdf = file.mimeType === 'application/pdf';

      // 1. Direct file name match
      if (name.includes(q)) return true;

      // 2. Document type matches:
      // If user types "pdf", matches PDF documents
      if (q === 'pdf' || q.includes('pdf')) {
        if (isPdf || name.endsWith('.pdf')) return true;
      }

      // If user types "doc", "docs", "google doc", "gdoc", "word", "texte", matches Google Docs
      if (
        q === 'doc' ||
        q === 'docs' ||
        q === 'gdoc' ||
        q.includes('google doc') ||
        q.includes('document') ||
        q.includes('texte') ||
        q.includes('word')
      ) {
        if (isGoogleDoc) return true;
      }

      return false;
    });
  }, [files, filterType, searchQuery]);

  // Counts for document types
  const typeCounts = useMemo(() => {
    const docs = files.filter((f) => f.mimeType === 'application/vnd.google-apps.document').length;
    const pdfs = files.filter((f) => f.mimeType === 'application/pdf').length;
    return { all: files.length, docs, pdfs };
  }, [files]);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadFiles();
    }
  }, [isOpen, currentUser, filterType]);

  const loadFiles = async (query = searchQuery) => {
    setIsLoading(true);
    setError(null);
    try {
      const driveFiles = await listDriveFiles(query, filterType);
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Failed to load Google Drive files:', err);
      setError(err.message || (lang === 'fr' ? 'Erreur lors du chargement de Google Drive' : 'Error loading Google Drive files'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadFiles(searchQuery);
  };

  const handleIngest = async (file: GoogleDriveFile) => {
    setIngestingFileId(file.id);
    setError(null);
    setIngestionSuccess(null);

    try {
      const ingestedDoc = await ingestDriveFile(file);
      await onIngestDocument(ingestedDoc);

      const isDoc = file.mimeType === 'application/vnd.google-apps.document';
      const charCount = ingestedDoc.content ? ingestedDoc.content.length : 0;
      
      setIngestionSuccess(
        lang === 'fr'
          ? `"${file.name}" importé avec succès dans vos cours (${isDoc ? `${charCount} caractères extraits` : 'PDF prêt pour révision'}) !`
          : `"${file.name}" ingested successfully into your courses (${isDoc ? `${charCount} characters` : 'PDF ready'})!`
      );

      // Auto-clear success toast after 4 seconds
      setTimeout(() => {
        setIngestionSuccess(null);
      }, 4500);
    } catch (err: any) {
      console.error('Ingestion error:', err);
      setError(
        err.message ||
          (lang === 'fr'
            ? "Impossible d'extraire le contenu du fichier sélectionné."
            : 'Could not retrieve content for the selected file.')
      );
    } finally {
      setIngestingFileId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id={`${baseId}-modal-overlay`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id={`${baseId}-modal-container`}
        className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Folder className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>Google Drive Browser</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {lang === 'fr' ? 'Ingestion Directe' : 'Direct Ingestion'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'fr'
                  ? 'Parcourez vos Google Docs et PDFs pour les ingérer instantanément dans votre espace d\'étude'
                  : 'Browse your Google Docs and PDFs for instant ingestion into your study library'}
              </p>
            </div>
          </div>

          <button
            id={`${baseId}-close-btn`}
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not Signed In Banner */}
        {!currentUser && (
          <div className="m-6 p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
              <p className="text-xs text-blue-200">
                {lang === 'fr'
                  ? 'Connectez-vous avec votre compte Google pour autoriser la lecture sécurisée de vos documents Drive et Google Docs.'
                  : 'Sign in with your Google account to authorize reading of your Drive documents and Google Docs.'}
              </p>
            </div>
            <button
              id={`${baseId}-signin-btn`}
              onClick={() => {
                onClose();
                onOpenAuthModal();
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Se connecter' : 'Sign In'}</span>
            </button>
          </div>
        )}

        {/* Toolbar: Filter pills & Search input */}
        <div className="p-4 sm:px-6 bg-slate-950/50 border-b border-slate-800/80 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              id={`${baseId}-filter-all`}
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>{lang === 'fr' ? 'Tous' : 'All'}</span>
              <span className="text-[10px] px-1 rounded bg-black/30 font-mono opacity-80">{typeCounts.all}</span>
            </button>

            <button
              id={`${baseId}-filter-docs`}
              onClick={() => setFilterType('docs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                filterType === 'docs'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3 h-3 text-blue-300" />
              <span>Docs</span>
              <span className="text-[10px] px-1 rounded bg-black/30 font-mono opacity-80">{typeCounts.docs}</span>
            </button>

            <button
              id={`${baseId}-filter-pdfs`}
              onClick={() => setFilterType('pdfs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                filterType === 'pdfs'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3 h-3 text-rose-300" />
              <span>PDFs</span>
              <span className="text-[10px] px-1 rounded bg-black/30 font-mono opacity-80">{typeCounts.pdfs}</span>
            </button>
          </div>

          {/* Real-time Search Input Field */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 sm:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id={`${baseId}-search-input`}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === 'fr'
                    ? 'Filtrer par nom ou type ("Maths", "PDF", "Google Doc")...'
                    : 'Filter by name or type ("Math", "PDF", "Google Doc")...'
                }
                className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
                  title={lang === 'fr' ? 'Effacer le filtre' : 'Clear filter'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              id={`${baseId}-refresh-btn`}
              type="button"
              onClick={() => loadFiles(searchQuery)}
              disabled={isLoading || !currentUser}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shrink-0"
              title={lang === 'fr' ? 'Actualiser / Rechercher sur Google Drive' : 'Refresh / Search on Google Drive'}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </form>
        </div>

        {/* Notification Toasts */}
        {ingestionSuccess && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="flex-1 font-medium">{ingestionSuccess}</span>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="flex-1 font-medium">{error}</span>
          </div>
        )}

        {/* File List Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-2.5">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
              <span className="text-xs font-medium">
                {lang === 'fr' ? 'Analyse de votre Google Drive...' : 'Querying your Google Drive...'}
              </span>
            </div>
          ) : files.length === 0 ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Folder className="w-10 h-10 text-slate-600 mb-1" />
              <p className="text-xs font-semibold text-slate-300">
                {currentUser
                  ? (lang === 'fr' ? 'Aucun document compatible trouvé.' : 'No supported documents found.')
                  : (lang === 'fr' ? 'Connectez-vous pour afficher vos fichiers Drive.' : 'Sign in to access your Drive files.')}
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm">
                {lang === 'fr'
                  ? 'Assurez-vous d\'avoir des fichiers Google Docs (.gdoc) ou PDFs dans votre Drive.'
                  : 'Ensure you have Google Docs or PDF files stored in your Drive account.'}
              </p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <Search className="w-10 h-10 text-slate-600 mb-1" />
              <p className="text-xs font-semibold text-slate-300">
                {lang === 'fr'
                  ? `Aucun document ne correspond au filtre "${searchQuery}".`
                  : `No documents match the filter "${searchQuery}".`}
              </p>
              <p className="text-[11px] text-slate-500 max-w-md">
                {lang === 'fr'
                  ? 'Vous pouvez filtrer par nom de fichier ou taper "PDF" ou "Google Doc" pour cibler un format.'
                  : 'You can filter by file name or type "PDF" or "Google Doc" to target a format.'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {lang === 'fr' ? 'Effacer le filtre' : 'Clear filter'}
                </button>
                <button
                  type="button"
                  onClick={() => loadFiles(searchQuery)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {lang === 'fr' ? 'Rechercher sur tout le Drive' : 'Search across all Drive'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] text-slate-400 font-semibold px-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>
                    {filteredFiles.length} {lang === 'fr' ? 'documents affichés' : 'documents shown'}
                    {filteredFiles.length !== files.length && (
                      <span className="text-slate-500 font-normal"> ({lang === 'fr' ? 'sur' : 'of'} {files.length})</span>
                    )}
                  </span>
                  {searchQuery && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px]">
                      {lang === 'fr' ? 'Filtre :' : 'Filter:'} "{searchQuery}"
                    </span>
                  )}
                </div>
                <span className="text-slate-500 font-mono text-[10px]">Google Drive v3 API</span>
              </div>

              {filteredFiles.map((file) => {
                const isDoc = file.mimeType === 'application/vnd.google-apps.document';
                const isPdf = file.mimeType === 'application/pdf';
                const isIngesting = ingestingFileId === file.id;

                return (
                  <div
                    key={file.id}
                    id={`${baseId}-file-${file.id}`}
                    className="p-3 sm:p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* Left: Icon and file info */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isDoc
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                            : isPdf
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        }`}
                      >
                        {isDoc ? (
                          <FileText className="w-5 h-5" />
                        ) : isPdf ? (
                          <FileCode className="w-5 h-5" />
                        ) : (
                          <HardDrive className="w-5 h-5" />
                        )}
                      </div>

                      <div className="truncate flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                            {file.name}
                          </h4>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md shrink-0 ${
                              isDoc
                                ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                                : isPdf
                                ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {isDoc ? 'Google Doc' : isPdf ? 'PDF' : 'Fichier'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                          {file.modifiedTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {new Date(file.modifiedTime).toLocaleDateString(undefined, {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                          {file.size && (
                            <span>
                              {(parseInt(file.size, 10) / 1024 > 1024
                                ? (parseInt(file.size, 10) / (1024 * 1024)).toFixed(1) + ' MB'
                                : (parseInt(file.size, 10) / 1024).toFixed(0) + ' KB')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Ouvrir dans Google Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        id={`${baseId}-ingest-btn-${file.id}`}
                        onClick={() => handleIngest(file)}
                        disabled={isIngesting || !!ingestingFileId}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                          isIngesting
                            ? 'bg-blue-600/80 text-white cursor-wait'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white active:scale-98'
                        }`}
                      >
                        {isIngesting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{lang === 'fr' ? 'Ingestion...' : 'Ingesting...'}</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>{lang === 'fr' ? 'Ingérer dans mes cours' : 'Ingest to Courses'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {lang === 'fr'
                ? 'L\'ingestion extrait le texte, génère les résumés et prépare les flashcards.'
                : 'Ingestion extracts text, builds summaries, and prepares flashcard decks.'}
            </span>
          </span>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            {lang === 'fr' ? 'Fermer' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
