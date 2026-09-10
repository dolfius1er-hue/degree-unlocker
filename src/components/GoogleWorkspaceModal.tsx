import React, { useState, useEffect, useId } from 'react';
import { 
  Folder, 
  FileText, 
  CheckSquare, 
  Plus, 
  ExternalLink, 
  RefreshCw, 
  Download, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  FileCheck,
  Calendar,
  LogIn,
  FileCode,
  ArrowRight,
  MessageSquare,
  StickyNote,
  Trash2,
  Send,
  Sparkles
} from 'lucide-react';
import { 
  listDriveFiles, 
  createGoogleDocFromCourse, 
  readGoogleDoc,
  ingestDriveFile,
  getGoogleTasks, 
  createGoogleTask, 
  toggleGoogleTaskStatus,
  listKeepNotes,
  createKeepNote,
  deleteKeepNote,
  listChatSpaces,
  listChatMessages,
  createChatMessage,
  GoogleDriveFile,
  GoogleTask,
  GoogleKeepNote,
  GoogleChatSpace,
  GoogleChatMessage
} from '../lib/googleWorkspace';
import { getCachedAccessToken } from '../lib/firebase';
import { SchoolDocument, AppLanguage } from '../types';

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onOpenAuthModal: () => void;
  documents: SchoolDocument[];
  onImportDoc: (doc: Partial<SchoolDocument>) => void;
  onOpenDriveBrowser?: () => void;
  lang?: AppLanguage;
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuthModal,
  documents,
  onImportDoc,
  onOpenDriveBrowser,
  lang = 'fr',
}) => {
  const baseId = useId();
  const [activeTab, setActiveTab] = useState<'drive' | 'docs' | 'tasks' | 'keep' | 'chat'>('drive');
  
  // Drive State
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [driveSearch, setDriveSearch] = useState('');
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [importingDocId, setImportingDocId] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Docs Export State
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [isExportingDoc, setIsExportingDoc] = useState(false);
  const [exportSuccessUrl, setExportSuccessUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // Tasks State
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  // Keep Notes State
  const [keepNotes, setKeepNotes] = useState<GoogleKeepNote[]>([]);
  const [isLoadingKeep, setIsLoadingKeep] = useState(false);
  const [keepError, setKeepError] = useState<string | null>(null);
  const [newKeepTitle, setNewKeepTitle] = useState('');
  const [newKeepText, setNewKeepText] = useState('');
  const [isCreatingKeep, setIsCreatingKeep] = useState(false);

  // Chat Spaces & Messages State
  const [chatSpaces, setChatSpaces] = useState<GoogleChatSpace[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const [spacesError, setSpacesError] = useState<string | null>(null);
  const [selectedSpaceName, setSelectedSpaceName] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<GoogleChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Load appropriate data based on activeTab
  useEffect(() => {
    if (isOpen && currentUser) {
      if (activeTab === 'drive') {
        loadDriveFiles();
      } else if (activeTab === 'tasks') {
        loadTasks();
      } else if (activeTab === 'keep') {
        loadKeepNotesData();
      } else if (activeTab === 'chat') {
        loadChatSpacesData();
      }
    }
  }, [isOpen, activeTab, currentUser]);

  // Load chat messages when a space is selected
  useEffect(() => {
    if (isOpen && currentUser && selectedSpaceName) {
      loadChatMessagesData(selectedSpaceName);
    }
  }, [isOpen, selectedSpaceName, currentUser]);

  const loadDriveFiles = async (query?: string) => {
    setIsLoadingDrive(true);
    setDriveError(null);
    try {
      const files = await listDriveFiles(query);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Error loading drive files:', err);
      setDriveError(err.message || (lang === 'fr' ? 'Impossible de charger Google Drive. Vérifiez vos permissions.' : 'Failed to load Google Drive.'));
    } finally {
      setIsLoadingDrive(false);
    }
  };

  /**
   * Import Google Doc: Retrieves the text content of the selected file from Drive
   * and creates a new SchoolDocument in the app state with that content.
   */
  const handleImportGoogleDoc = async (file: GoogleDriveFile) => {
    setImportingDocId(file.id);
    setDriveError(null);
    setImportSuccessMsg(null);

    try {
      const isGoogleDoc = file.mimeType === 'application/vnd.google-apps.document';
      let docPayload: Partial<SchoolDocument>;

      if (isGoogleDoc) {
        // Retrieve real text content from the user's Google Doc
        const textContent = await readGoogleDoc(file.id);
        if (!textContent || !textContent.trim()) {
          throw new Error(
            lang === 'fr'
              ? 'Le document Google Docs sélectionné ne contient aucun texte exploitable.'
              : 'The selected Google Doc contains no readable text.'
          );
        }

        const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
        const preview = textContent.slice(0, 260) + (textContent.length > 260 ? '...' : '');

        docPayload = {
          id: `doc-${Date.now()}`,
          title: cleanTitle,
          subject: 'Google Docs',
          date: new Date().toISOString().split('T')[0],
          type: 'google_doc',
          tags: ['Google Docs', 'Drive', 'Workspace'],
          content: textContent,
          summary: preview,
          fileName: file.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        // For PDFs or other Drive files, ingest with dataUrl / text
        docPayload = await ingestDriveFile(file);
      }

      onImportDoc(docPayload);

      const count = docPayload.content?.length || 0;
      setImportSuccessMsg(
        lang === 'fr'
          ? `Document "${file.name}" importé avec succès (${count} caractères extraits) !`
          : `Document "${file.name}" imported successfully (${count} characters extracted)!`
      );

      setTimeout(() => setImportSuccessMsg(null), 4500);
    } catch (err: any) {
      console.error('Import Google Doc error:', err);
      setDriveError(
        err.message ||
          (lang === 'fr'
            ? 'Erreur lors de la récupération du contenu du Google Doc.'
            : 'Error retrieving Google Doc content.')
      );
    } finally {
      setImportingDocId(null);
    }
  };

  const loadTasks = async () => {
    setIsLoadingTasks(true);
    setTasksError(null);
    try {
      const items = await getGoogleTasks();
      setTasks(items);
    } catch (err: any) {
      console.error('Error loading tasks:', err);
      setTasksError(err.message || 'Impossible de charger Google Tasks.');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleExportToGoogleDoc = async () => {
    const docToExport = documents.find((d) => d.id === selectedDocId);
    if (!docToExport) return;

    setIsExportingDoc(true);
    setExportError(null);
    setExportSuccessUrl(null);

    try {
      const content = `${docToExport.summary || ''}\n\n${docToExport.fullContent || ''}`;
      const result = await createGoogleDocFromCourse(docToExport.title, content);
      setExportSuccessUrl(`https://docs.google.com/document/d/${result.documentId}/edit`);
    } catch (err: any) {
      console.error('Export Google Doc error:', err);
      setExportError(err.message || 'Erreur lors de la création du Google Doc.');
    } finally {
      setIsExportingDoc(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsCreatingTask(true);
    try {
      await createGoogleTask(newTaskTitle, 'Créé depuis Degree Unlocker', newTaskDue || undefined);
      setNewTaskTitle('');
      setNewTaskDue('');
      await loadTasks();
    } catch (err: any) {
      console.error('Create task error:', err);
      setTasksError(err.message || 'Impossible de créer la tâche Google Tasks.');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const isNowCompleted = currentStatus !== 'completed';
    try {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: isNowCompleted ? 'completed' : 'needsAction' } : t))
      );
      await toggleGoogleTaskStatus(taskId, isNowCompleted);
    } catch (err: any) {
      console.error('Toggle task error:', err);
      await loadTasks();
    }
  };

  // Google Keep API Handlers
  const loadKeepNotesData = async () => {
    setIsLoadingKeep(true);
    setKeepError(null);
    try {
      const notes = await listKeepNotes();
      setKeepNotes(notes);
    } catch (err: any) {
      console.error('Error loading Keep notes:', err);
      setKeepError(err.message || (lang === 'fr' ? 'Impossible de charger vos notes Google Keep.' : 'Failed to load Google Keep notes.'));
    } finally {
      setIsLoadingKeep(false);
    }
  };

  const handleCreateKeepNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeepTitle.trim() && !newKeepText.trim()) return;

    setIsCreatingKeep(true);
    setKeepError(null);
    try {
      await createKeepNote(newKeepTitle, newKeepText);
      setNewKeepTitle('');
      setNewKeepText('');
      await loadKeepNotesData();
    } catch (err: any) {
      console.error('Error creating Keep note:', err);
      setKeepError(err.message || (lang === 'fr' ? 'Impossible de créer la note.' : 'Failed to create Note.'));
    } finally {
      setIsCreatingKeep(false);
    }
  };

  const handleDeleteKeepNote = async (noteName: string) => {
    if (!window.confirm(lang === 'fr' ? 'Voulez-vous vraiment supprimer cette note ?' : 'Are you sure you want to delete this note?')) {
      return;
    }
    setKeepError(null);
    try {
      await deleteKeepNote(noteName);
      setKeepNotes((prev) => prev.filter((n) => n.name !== noteName));
    } catch (err: any) {
      console.error('Error deleting Keep note:', err);
      setKeepError(err.message || (lang === 'fr' ? 'Impossible de supprimer la note.' : 'Failed to delete Note.'));
    }
  };

  // Google Chat API Handlers
  const loadChatSpacesData = async () => {
    setIsLoadingSpaces(true);
    setSpacesError(null);
    try {
      const spaces = await listChatSpaces();
      setChatSpaces(spaces);
      if (spaces.length > 0 && !selectedSpaceName) {
        setSelectedSpaceName(spaces[0].name);
      }
    } catch (err: any) {
      console.error('Error loading Chat spaces:', err);
      setSpacesError(err.message || (lang === 'fr' ? 'Impossible de charger les espaces Chat.' : 'Failed to load Chat spaces.'));
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  const loadChatMessagesData = async (spaceName: string) => {
    setIsLoadingMessages(true);
    setMessagesError(null);
    try {
      const messages = await listChatMessages(spaceName);
      setChatMessages(messages);
    } catch (err: any) {
      console.error('Error loading Chat messages:', err);
      setMessagesError(err.message || (lang === 'fr' ? 'Impossible de charger les messages de cet espace.' : 'Failed to load messages.'));
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedSpaceName) return;

    setIsSendingMessage(true);
    setMessagesError(null);
    try {
      await createChatMessage(selectedSpaceName, newMessageText);
      setNewMessageText('');
      await loadChatMessagesData(selectedSpaceName);
    } catch (err: any) {
      console.error('Error sending Chat message:', err);
      setMessagesError(err.message || (lang === 'fr' ? 'Impossible d\'envoyer le message.' : 'Failed to send message.'));
    } finally {
      setIsSendingMessage(false);
    }
  };

  const [isPickerLoading, setIsPickerLoading] = useState(false);

  const handleOpenPicker = async () => {
    setIsPickerLoading(true);
    try {
      const accessToken = getCachedAccessToken();
      if (!accessToken) {
        alert(lang === 'fr' ? 'Veuillez vous connecter d\'abord !' : 'Please sign in first!');
        setIsPickerLoading(false);
        return;
      }

      // Check if gapi is loaded
      if (typeof (window as any).gapi === 'undefined') {
        // Load GAPI script dynamically
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load GAPI script'));
          document.body.appendChild(script);
        });
      }

      // Load Picker client
      await new Promise<void>((resolve) => {
        (window as any).gapi.load('picker', {
          callback: () => resolve()
        });
      });

      // Construct Picker
      const pickerOrigin =
        window.location.ancestorOrigins &&
        window.location.ancestorOrigins.length > 0
          ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
          : window.location.origin;

      const pickerCallback = async (data: any) => {
        if (data.action === 'picked') {
          const file = data.docs[0];
          console.log('You picked file from Google Picker:', file);
          
          // Try to import the selected document
          setIsPickerLoading(true);
          try {
            const isGoogleDoc = file.mimeType === 'application/vnd.google-apps.document';
            let docPayload: Partial<SchoolDocument>;

            if (isGoogleDoc) {
              const textContent = await readGoogleDoc(file.id);
              const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
              const preview = textContent.slice(0, 260) + (textContent.length > 260 ? '...' : '');

              docPayload = {
                id: `doc-${Date.now()}`,
                title: cleanTitle,
                subject: 'Google Docs',
                date: new Date().toISOString().split('T')[0],
                type: 'google_doc',
                tags: ['Google Docs', 'Drive', 'Picker'],
                content: textContent,
                summary: preview,
                fileName: file.name,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
            } else {
              // Standard drive file ingestion using metadata
              docPayload = {
                id: `doc-${Date.now()}`,
                title: file.name,
                subject: 'Google Drive',
                date: new Date().toISOString().split('T')[0],
                type: 'google_doc',
                tags: ['Google Drive', 'Picker'],
                content: `Fichier importé via Google Picker: ${file.name}\nLien: ${file.url || ''}`,
                summary: `Fichier sélectionné : ${file.name}`,
                fileName: file.name,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
            }

            onImportDoc(docPayload);
            alert(
              lang === 'fr'
                ? `Document "${file.name}" importé avec succès depuis Google Picker !`
                : `Document "${file.name}" successfully imported via Google Picker!`
            );
          } catch (err: any) {
            console.error('Picker import error:', err);
            alert(lang === 'fr' ? 'Erreur lors de l\'importation du fichier sélectionné.' : 'Error importing selected file.');
          } finally {
            setIsPickerLoading(false);
          }
        }
      };

      // Since we don't have developer key required by standard build if not using domain restricted picker,
      // we can use standard ViewId.DOCS
      const picker = new (window as any).google.picker.PickerBuilder()
        .addView((window as any).google.picker.ViewId.DOCS)
        .setOAuthToken(accessToken)
        .setCallback(pickerCallback)
        .setOrigin(pickerOrigin)
        .build();

      picker.setVisible(true);
    } catch (err: any) {
      console.error('Google Picker load error:', err);
      alert(lang === 'fr' ? 'Impossible d\'ouvrir l\'explorateur Google Picker officiel.' : 'Failed to open the official Google Picker.');
    } finally {
      setIsPickerLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-blue-500 to-emerald-500 p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Folder className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>Google Workspace Hub</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  v6.4.3 • Connected
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'fr' 
                  ? 'Connectez vos devoirs, cours, Keep, Chat et fichiers Google officiels' 
                  : 'Manage your official Google Drive, Docs, Tasks, Keep & Chat'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-slate-950/50 border-b border-slate-800/80 flex gap-1.5 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab('drive')}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
              activeTab === 'drive'
                ? 'border-blue-500 text-blue-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-amber-400" />
            <span>Google Drive</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
              activeTab === 'docs'
                ? 'border-blue-500 text-blue-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Docs Export</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab('keep')}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
              activeTab === 'keep'
                ? 'border-blue-500 text-blue-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5 text-amber-300" />
            <span>Keep Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
              activeTab === 'chat'
                ? 'border-blue-500 text-blue-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Google Chat</span>
          </button>
        </div>

        {/* Not Signed In Warning */}
        {!currentUser && (
          <div className="m-6 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0" />
              <p className="text-xs text-indigo-200">
                {lang === 'fr'
                  ? 'Connectez-vous avec votre compte Google pour accéder à vos fichiers Drive, documents Docs et listes de tâches.'
                  : 'Sign in with your Google account to access your Drive files, Docs and Tasks.'}
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenAuthModal();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Se connecter' : 'Sign In'}</span>
            </button>
          </div>
        )}

        {/* Tab 1: Google Drive */}
        {activeTab === 'drive' && (
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* Quick Access to full GoogleDriveBrowser if available */}
            {onOpenDriveBrowser && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Folder className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {lang === 'fr' ? 'Explorateur Google Drive Dédié' : 'Dedicated Google Drive Browser'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {lang === 'fr' ? 'Filtrez par Docs ou PDFs et ingérez directement vos cours' : 'Filter by Docs or PDFs with direct library ingestion'}
                    </span>
                  </div>
                </div>
                <button
                  id={`${baseId}-open-full-browser-btn`}
                  onClick={() => {
                    onClose();
                    onOpenDriveBrowser();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                >
                  <span>{lang === 'fr' ? 'Ouvrir' : 'Open'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Google Picker Launcher Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">
                    {lang === 'fr' ? 'Sélecteur Google Picker Officiel' : 'Official Google Picker Browser'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {lang === 'fr' ? 'Ouvrez la fenêtre contextuelle officielle de Google pour choisir vos fichiers' : 'Open the official Google popup widget to pick your files'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleOpenPicker}
                disabled={isPickerLoading || !currentUser}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isPickerLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Folder className="w-3.5 h-3.5" />
                )}
                <span>{lang === 'fr' ? 'Parcourir' : 'Browse'}</span>
              </button>
            </div>

            {/* Search & Refresh */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id={`${baseId}-drive-search`}
                  type="text"
                  value={driveSearch}
                  onChange={(e) => setDriveSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadDriveFiles(driveSearch)}
                  placeholder={lang === 'fr' ? 'Rechercher un fichier sur Drive...' : 'Search Google Drive files...'}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                id={`${baseId}-drive-refresh`}
                onClick={() => loadDriveFiles(driveSearch)}
                disabled={isLoadingDrive || !currentUser}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                <span>{lang === 'fr' ? 'Actualiser' : 'Refresh'}</span>
              </button>
            </div>

            {/* Ingestion success notification */}
            {importSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium flex-1">{importSuccessMsg}</span>
              </div>
            )}

            {driveError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
                {driveError}
              </div>
            )}

            {isLoadingDrive ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                <span className="text-xs">Chargement de Google Drive...</span>
              </div>
            ) : driveFiles.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                {currentUser 
                  ? (lang === 'fr' ? 'Aucun fichier trouvé sur votre Drive.' : 'No files found on Drive.')
                  : (lang === 'fr' ? 'Connectez-vous pour afficher vos fichiers Drive.' : 'Sign in to see your Drive files.')}
              </div>
            ) : (
              <div className="divide-y divide-slate-800 max-h-[420px] overflow-y-auto pr-1">
                {driveFiles.map((file) => {
                  const isGoogleDoc = file.mimeType === 'application/vnd.google-apps.document';
                  const isPdf = file.mimeType === 'application/pdf';
                  const isImporting = importingDocId === file.id;

                  return (
                    <div key={file.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-800/40 px-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-2.5 truncate">
                        {isGoogleDoc ? (
                          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                        ) : isPdf ? (
                          <FileCode className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white truncate">{file.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                              isGoogleDoc ? 'bg-blue-900/60 text-blue-300' : isPdf ? 'bg-rose-900/60 text-rose-300' : 'bg-slate-700 text-slate-300'
                            }`}>
                              {isGoogleDoc ? 'Doc' : isPdf ? 'PDF' : 'Fichier'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'Drive'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Ouvrir sur Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Import Google Doc / File button retrieving real content */}
                        <button
                          id={`${baseId}-import-doc-${file.id}`}
                          onClick={() => handleImportGoogleDoc(file)}
                          disabled={isImporting || !!importingDocId}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isImporting
                              ? 'bg-blue-700 text-white cursor-wait'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                          }`}
                          title={isGoogleDoc ? "Extraire le texte du Google Doc et créer un cours" : "Ingérer le fichier dans vos cours"}
                        >
                          {isImporting ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>{lang === 'fr' ? 'Extraction...' : 'Extracting...'}</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3" />
                              <span>
                                {isGoogleDoc 
                                  ? (lang === 'fr' ? 'Importer Google Doc' : 'Import Google Doc')
                                  : (lang === 'fr' ? 'Ingérer fichier' : 'Ingest File')}
                              </span>
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
        )}

        {/* Tab 2: Export to Google Docs */}
        {activeTab === 'docs' && (
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                {lang === 'fr' ? 'Sélectionnez un cours ou résumé à exporter vers Google Docs :' : 'Select a course or summary to export to Google Docs:'}
              </label>

              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title} ({doc.subject || 'Général'})
                  </option>
                ))}
              </select>

              <button
                onClick={handleExportToGoogleDoc}
                disabled={isExportingDoc || !currentUser || !selectedDocId}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>
                  {isExportingDoc
                    ? (lang === 'fr' ? 'Création du Google Doc...' : 'Creating Google Doc...')
                    : (lang === 'fr' ? 'Exporter en Google Doc Officiel' : 'Export to Official Google Doc')}
                </span>
              </button>
            </div>

            {exportSuccessUrl && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{lang === 'fr' ? 'Google Doc créé avec succès !' : 'Google Doc created successfully!'}</span>
                </div>
                <a
                  href={exportSuccessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <span>{lang === 'fr' ? 'Ouvrir le Doc' : 'Open Doc'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {exportError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                {exportError}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Google Tasks */}
        {activeTab === 'tasks' && (
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <form onSubmit={handleCreateTask} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 block">
                {lang === 'fr' ? 'Ajouter une tâche de révision à Google Tasks :' : 'Add a revision task to Google Tasks:'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder={lang === 'fr' ? 'Ex: Réviser Quiz Mathématiques...' : 'e.g. Review Math Quiz...'}
                  className="sm:col-span-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />

                <input
                  type="date"
                  value={newTaskDue}
                  onChange={(e) => setNewTaskDue(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingTask || !newTaskTitle.trim() || !currentUser}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isCreatingTask ? 'Création...' : (lang === 'fr' ? 'Créer la tâche Google' : 'Create Google Task')}</span>
              </button>
            </form>

            {tasksError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                {tasksError}
              </div>
            )}

            {isLoadingTasks ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                <span className="text-xs">Chargement des tâches...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                {currentUser 
                  ? (lang === 'fr' ? 'Aucune tâche dans votre Google Tasks.' : 'No tasks in Google Tasks.')
                  : (lang === 'fr' ? 'Connectez-vous pour afficher vos tâches Google.' : 'Sign in to see your Google Tasks.')}
              </div>
            ) : (
              <div className="divide-y divide-slate-800 max-h-[350px] overflow-y-auto pr-1">
                {tasks.map((task) => (
                  <div key={task.id} className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-slate-800/40 rounded-xl transition-colors">
                    <button
                      onClick={() => handleToggleTask(task.id, task.status)}
                      className="flex items-center gap-2.5 text-left truncate group cursor-pointer"
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                        task.status === 'completed'
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-600 group-hover:border-emerald-400'
                      }`}>
                        {task.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span className={`text-xs font-medium truncate ${
                        task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}>
                        {task.title}
                      </span>
                    </button>

                    {task.due && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono shrink-0">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(task.due).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Google Keep Notes */}
        {activeTab === 'keep' && (
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <form onSubmit={handleCreateKeepNote} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 block">
                {lang === 'fr' ? 'Créer une note rapide Google Keep :' : 'Create a Google Keep note:'}
              </span>

              <div className="space-y-2">
                <input
                  type="text"
                  value={newKeepTitle}
                  onChange={(e) => setNewKeepTitle(e.target.value)}
                  placeholder={lang === 'fr' ? 'Titre de la note...' : 'Note title...'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />

                <textarea
                  value={newKeepText}
                  onChange={(e) => setNewKeepText(e.target.value)}
                  placeholder={lang === 'fr' ? 'Contenu de la note...' : 'Note body content...'}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingKeep || (!newKeepTitle.trim() && !newKeepText.trim()) || !currentUser}
                className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isCreatingKeep ? 'Création...' : (lang === 'fr' ? 'Ajouter à Google Keep' : 'Add to Google Keep')}</span>
              </button>
            </form>

            {keepError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                {keepError}
              </div>
            )}

            {isLoadingKeep ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                <span className="text-xs">Chargement de Google Keep...</span>
              </div>
            ) : keepNotes.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                {currentUser 
                  ? (lang === 'fr' ? 'Aucune note trouvée dans votre Google Keep.' : 'No notes found in Google Keep.')
                  : (lang === 'fr' ? 'Connectez-vous pour afficher vos notes Google Keep.' : 'Sign in to see your Google Keep notes.')}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                {keepNotes.map((note) => {
                  const bodyText = note.body?.text?.text || '';
                  return (
                    <div key={note.name} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{note.title || (lang === 'fr' ? 'Sans titre' : 'Untitled')}</h4>
                          <button
                            onClick={() => handleDeleteKeepNote(note.name)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title={lang === 'fr' ? 'Supprimer' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-400 whitespace-pre-wrap line-clamp-4">{bodyText}</p>
                      </div>

                      {bodyText && (
                        <button
                          onClick={() => {
                            const newDoc: Partial<SchoolDocument> = {
                              id: `keep-${Date.now()}`,
                              title: note.title || `Keep Note - ${new Date().toLocaleDateString()}`,
                              subject: 'Google Keep',
                              date: new Date().toISOString().split('T')[0],
                              type: 'google_doc',
                              tags: ['Google Keep', 'Workspace'],
                              content: bodyText,
                              summary: bodyText.slice(0, 200),
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                            };
                            onImportDoc(newDoc);
                            alert(lang === 'fr' ? 'Note Keep importée avec succès !' : 'Keep Note imported successfully!');
                          }}
                          className="mt-3 w-full py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-400/20 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>{lang === 'fr' ? 'Importer dans mes notes' : 'Import to my notes'}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Google Chat */}
        {activeTab === 'chat' && (
          <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 min-h-[350px]">
            {spacesError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                {spacesError}
              </div>
            )}

            {isLoadingSpaces ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2 flex-1">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                <span className="text-xs">Chargement des espaces Google Chat...</span>
              </div>
            ) : chatSpaces.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs flex-1 flex items-center justify-center">
                {currentUser 
                  ? (lang === 'fr' ? 'Aucun espace ou DM trouvé dans votre Google Chat.' : 'No spaces or DMs found in Google Chat.')
                  : (lang === 'fr' ? 'Connectez-vous pour afficher vos espaces Google Chat.' : 'Sign in to see your Google Chat spaces.')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 items-stretch">
                {/* Spaces List Left Panel */}
                <div className="md:col-span-1 border-r border-slate-800/80 pr-3 space-y-2 max-h-[320px] overflow-y-auto">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider block px-1">
                    {lang === 'fr' ? 'Espaces Chat' : 'Chat Spaces'}
                  </span>
                  {chatSpaces.map((space) => (
                    <button
                      key={space.name}
                      onClick={() => setSelectedSpaceName(space.name)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        selectedSpaceName === space.name
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 shrink-0 text-indigo-400" />
                      <span className="truncate">{space.displayName || space.name.split('/')[1]}</span>
                    </button>
                  ))}
                </div>

                {/* Messages Right Panel */}
                <div className="md:col-span-2 flex flex-col max-h-[320px] justify-between">
                  {selectedSpaceName ? (
                    <>
                      {/* Message History */}
                      <div className="flex-1 overflow-y-auto mb-3 space-y-2 pr-1 min-h-[220px] max-h-[220px]">
                        {isLoadingMessages ? (
                          <div className="h-full flex items-center justify-center text-slate-400">
                            <RefreshCw className="w-5 h-5 animate-spin text-indigo-400 mr-2" />
                            <span className="text-xs">Chargement des messages...</span>
                          </div>
                        ) : chatMessages.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                            <span>Aucun message dans ce salon.</span>
                            <span className="text-[10px] mt-1">Commencez la discussion ci-dessous !</span>
                          </div>
                        ) : (
                          chatMessages.map((msg) => (
                            <div key={msg.name} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/60 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-300">
                                  {msg.sender?.displayName || 'Inconnu'}
                                </span>
                                {msg.createTime && (
                                  <span className="text-[9px] text-slate-500 font-mono">
                                    {new Date(msg.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Chat Input Box */}
                      <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0">
                        <input
                          type="text"
                          value={newMessageText}
                          onChange={(e) => setNewMessageText(e.target.value)}
                          placeholder={lang === 'fr' ? 'Saisissez votre message...' : 'Type your message...'}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          disabled={isSendingMessage || !newMessageText.trim()}
                          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                      {lang === 'fr' ? 'Sélectionnez un espace pour démarrer la discussion' : 'Select a space to start chatting'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
