import React, { useState, useEffect, useMemo } from 'react';
import { SchoolDocument, BlocknoteGuide, AppLanguage, UIPreferences, AppTheme, MenuPosition, CustomTag, StudyProgressBackup } from './types';
import { INITIAL_SCHOOL_DOCUMENTS } from './data/seedDocuments';
import { Sidebar, NavTabType } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardOverview } from './components/DashboardOverview';
import { DocumentListView } from './components/DocumentListView';
import { AiSearchView } from './components/AiSearchView';
import { ResumerView } from './components/ResumerView';
import { BlocknoteView } from './components/BlocknoteView';
import { FamousQuotesView } from './components/FamousQuotesView';
import { DatabaseManagerView } from './components/DatabaseManagerView';
import { NoteEditorModal } from './components/NoteEditorModal';
import { PdfUploadModal } from './components/PdfUploadModal';
import { TutorialModal } from './components/TutorialModal';
import { LocalStorageBrowserModal } from './components/LocalStorageBrowserModal';
import { EducationalVideosModal } from './components/EducationalVideosModal';
import { NoteTakingTipsModal } from './components/NoteTakingTipsModal';
import { StudyPlaylistsModal } from './components/StudyPlaylistsModal';
import { FlashcardsView } from './components/FlashcardsView';
import { QuizView } from './components/QuizView';
import { BilingualLearningView } from './components/BilingualLearningView';
import { QuoteLoadingModal } from './components/QuoteLoadingModal';
import { ThemePreferencesModal } from './components/ThemePreferencesModal';
import { SocraticCoachModal } from './components/SocraticCoachModal';
import { BackupProgressModal } from './components/BackupProgressModal';
import { PhotoNotesScannerModal } from './components/PhotoNotesScannerModal';
import { AuthSyncModal } from './components/AuthSyncModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { PdfAnnotationModal } from './components/PdfAnnotationModal';
import { PresentationModeModal } from './components/PresentationModeModal';
import { WelcomeOnboardingModal } from './components/WelcomeOnboardingModal';
import { OneDriveSyncModal } from './components/OneDriveSyncModal';
import { motion, AnimatePresence } from 'motion/react';
import { 
  onAuthChange, 
  syncDocumentsToFirestore, 
  subscribeToCloudDocuments, 
  subscribeToDeviceTransfers, 
  sendSingleDocumentToCloud, 
  DeviceTransferRecord 
} from './lib/firebase';

export default function App() {
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);

  // Restore activeTab from localStorage so users return exactly where they left off
  const [activeTab, setActiveTab] = useState<NavTabType>(() => {
    try {
      const savedTab = localStorage.getItem('degreelocker_active_tab') as NavTabType | null;
      const validTabs: NavTabType[] = [
        'dashboard', 
        'library', 
        'search', 
        'resumer', 
        'blocknote', 
        'quotes', 
        'flashcards', 
        'quiz', 
        'bilingual', 
        'database'
      ];
      if (savedTab && validTabs.includes(savedTab)) {
        return savedTab;
      }
    } catch (e) {
      console.warn('Error reading saved activeTab from localStorage', e);
    }
    return 'dashboard';
  });

  // Automatically persist activeTab whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('degreelocker_active_tab', activeTab);
    } catch (e) {
      console.warn('Error saving activeTab to localStorage', e);
    }
  }, [activeTab]);

  const [selectedDocForBlocknote, setSelectedDocForBlocknote] = useState<SchoolDocument | null>(null);
  const [selectedDocForSummary, setSelectedDocForSummary] = useState<SchoolDocument | null>(null);
  const [selectedDocForQuiz, setSelectedDocForQuiz] = useState<string | undefined>(undefined);
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>('all');

  // Custom Tags for document organization
  const [customTags, setCustomTags] = useState<CustomTag[]>(() => {
    try {
      const raw = localStorage.getItem('degreelocker_custom_tags');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Error loading custom tags from localStorage', e);
    }
    return [
      { id: 'tag-bac', name: 'Bac2025', color: 'indigo' },
      { id: 'tag-exam', name: 'Examen', color: 'rose' },
      { id: 'tag-formules', name: 'Formules', color: 'emerald' },
      { id: 'tag-cours', name: 'CoursImportant', color: 'amber' },
    ];
  });

  // Cross-device live transfer notifications
  const [deviceToast, setDeviceToast] = useState<{ message: string; docId?: string } | null>(null);

  // Whenever selected document changes, persist its ID to localStorage
  useEffect(() => {
    const docToPersist = selectedDocForBlocknote || selectedDocForSummary;
    if (docToPersist?.id) {
      try {
        localStorage.setItem('degreelocker_selected_doc_id', docToPersist.id);
      } catch (e) {
        console.warn('Error saving selected document ID to localStorage', e);
      }
    }
  }, [selectedDocForBlocknote, selectedDocForSummary]);
  
  // UI Preferences state (Theme, Menu position, Collapse, Language)
  const [preferences, setPreferences] = useState<UIPreferences>({
    theme: 'light',
    menuPosition: 'left',
    isSidebarCollapsed: false,
    language: 'fr',
    fontSize: 'normal',
  });
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Modals
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<SchoolDocument | null>(null);
  const [isPdfUploadOpen, setIsPdfUploadOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isLocalStorageOpen, setIsLocalStorageOpen] = useState(false);
  const [isVideosOpen, setIsVideosOpen] = useState(false);
  const [selectedSubjectForVideos, setSelectedSubjectForVideos] = useState<string | undefined>(undefined);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [isPlaylistsOpen, setIsPlaylistsOpen] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isPhotoScannerOpen, setIsPhotoScannerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false);
  const [isAnnotationOpen, setIsAnnotationOpen] = useState(false);
  const [annotatingDoc, setAnnotatingDoc] = useState<SchoolDocument | null>(null);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isOneDriveOpen, setIsOneDriveOpen] = useState(false);
  const [presentationDoc, setPresentationDoc] = useState<SchoolDocument | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('degreelocker_welcomed');
    } catch {
      return true;
    }
  });
  const [isQuoteLoadingOpen, setIsQuoteLoadingOpen] = useState(false);
  const [quoteLoadingTitle, setQuoteLoadingTitle] = useState<string | undefined>(undefined);
  const [quoteLoadingSubtitle, setQuoteLoadingSubtitle] = useState<string | undefined>(undefined);
  const [lang, setLang] = useState<AppLanguage>('fr');
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Firebase auth state observer
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Study activity tracking for genuine streak calculation
  const [activityDates, setActivityDates] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('degreelocker_activity_dates');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const recordStudyActivity = () => {
    const today = new Date().toISOString().split('T')[0];
    setActivityDates((prev) => {
      if (!prev.includes(today)) {
        const updated = [...prev, today];
        try {
          localStorage.setItem('degreelocker_activity_dates', JSON.stringify(updated));
        } catch (e) {
          console.warn('Could not save activity date:', e);
        }
        return updated;
      }
      return prev;
    });
  };

  // Restore backup callback
  const handleRestoreBackup = (backup: StudyProgressBackup) => {
    if (backup.documents && Array.isArray(backup.documents)) {
      setDocuments(backup.documents);
    }
    if (backup.streaks?.activityDates) {
      setActivityDates(backup.streaks.activityDates);
      localStorage.setItem('degreelocker_activity_dates', JSON.stringify(backup.streaks.activityDates));
    } else if (backup.userStats?.activityDates) {
      setActivityDates(backup.userStats.activityDates);
      localStorage.setItem('degreelocker_activity_dates', JSON.stringify(backup.userStats.activityDates));
    }
    if (backup.preferences) {
      setPreferences(prev => ({ ...prev, ...backup.preferences }));
      if (backup.preferences.language) setLang(backup.preferences.language);
    }
  };

  // Calculate real consecutive streak days reactively
  const realStreakDays = useMemo(() => {
    if (activityDates.length === 0) return 0;
    const sorted = [...activityDates].sort();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    let streak = 0;
    let checkDate = new Date();
    const hasToday = sorted.includes(todayStr);

    if (!hasToday) {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toISOString().split('T')[0];
      if (!sorted.includes(yesterdayStr)) {
        return 0;
      }
    }

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sorted.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [activityDates]);

  // Sync theme changes to html element for global CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-midnight', 'theme-paper');
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else if (preferences.theme === 'midnight') {
      root.classList.add('theme-midnight');
      root.classList.add('dark');
    } else if (preferences.theme === 'paper') {
      root.classList.add('theme-paper');
    }
  }, [preferences.theme]);

  // Load preferences from server/local on mount
  useEffect(() => {
    async function fetchPreferences() {
      try {
        const res = await fetch('/api/preferences');
        if (res.ok) {
          const data = await res.json();
          if (data && data.theme) {
            setPreferences(data);
            if (data.language) setLang(data.language);
          }
        }
      } catch (err) {
        console.warn('Could not load preferences from server, using local defaults');
      }
    }
    fetchPreferences();
  }, []);

  const savePreferencesToServer = async (newPrefs: UIPreferences) => {
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrefs),
      });
    } catch (err) {
      console.warn('Failed to save preferences to server:', err);
    }
  };

  const handleUpdatePreferences = (updated: Partial<UIPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updated, updatedAt: new Date().toISOString() };
      savePreferencesToServer(next);
      if (updated.language) {
        setLang(updated.language);
      }
      return next;
    });
  };

  const handleToggleLang = () => {
    const nextLang: AppLanguage = lang === 'fr' ? 'en' : 'fr';
    setLang(nextLang);
    handleUpdatePreferences({ language: nextLang });
  };

  // 1-Click Global Theme Toggle between Light and Dark
  const handleToggleQuickTheme = () => {
    setPreferences((prev) => {
      const nextTheme: AppTheme = prev.theme === 'light' || prev.theme === 'paper' ? 'dark' : 'light';
      const updated = { ...prev, theme: nextTheme, updatedAt: new Date().toISOString() };
      savePreferencesToServer(updated);
      return updated;
    });
  };

  // Global Keyboard Shortcuts Manager (Ctrl+K, Ctrl+N, Ctrl+U, Ctrl+B, etc.)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true');

      const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Handle '?' for Shortcuts Guide when not focused in input
      if (!isInput && e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsKeyboardShortcutsOpen((prev) => !prev);
        return;
      }

      // Handle 'Escape' to close modals / overlays
      if (e.key === 'Escape') {
        setIsKeyboardShortcutsOpen(false);
        setIsNoteEditorOpen(false);
        setIsPdfUploadOpen(false);
        setIsTutorialOpen(false);
        setIsLocalStorageOpen(false);
        setIsVideosOpen(false);
        setIsTipsOpen(false);
        setIsPlaylistsOpen(false);
        setIsPreferencesOpen(false);
        setIsCoachOpen(false);
        setIsBackupOpen(false);
        setIsPhotoScannerOpen(false);
        setIsAuthModalOpen(false);
        return;
      }

      // Cmd / Ctrl combinations
      if (isCmdOrCtrl) {
        // Ctrl+K -> AI Semantic Search
        if (e.key === 'k' || e.key === 'K') {
          e.preventDefault();
          setActiveTab('search');
          return;
        }

        // Ctrl+N -> Create New Note
        if ((e.key === 'n' || e.key === 'N') && !e.shiftKey) {
          e.preventDefault();
          setDocumentToEdit(null);
          setIsNoteEditorOpen(true);
          return;
        }

        // Ctrl+U -> Upload Document / PDF
        if (e.key === 'u' || e.key === 'U') {
          e.preventDefault();
          setIsPdfUploadOpen(true);
          return;
        }

        // Ctrl+B -> Cornell Blocknote
        if (e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          setActiveTab('blocknote');
          return;
        }

        // Ctrl+1 -> Dashboard
        if (e.key === '1') {
          e.preventDefault();
          setActiveTab('dashboard');
          return;
        }

        // Ctrl+2 -> Library
        if (e.key === '2') {
          e.preventDefault();
          setActiveTab('library');
          return;
        }

        // Ctrl+Shift+F -> Flashcards
        if ((e.key === 'f' || e.key === 'F') && e.shiftKey) {
          e.preventDefault();
          setActiveTab('flashcards');
          return;
        }

        // Ctrl+Shift+Q -> Recall Quiz
        if ((e.key === 'q' || e.key === 'Q') && e.shiftKey) {
          e.preventDefault();
          setActiveTab('quiz');
          return;
        }

        // Ctrl+Shift+C -> Socratic AI Coach
        if ((e.key === 'c' || e.key === 'C') && e.shiftKey) {
          e.preventDefault();
          setIsCoachOpen(true);
          return;
        }

        // Ctrl+Shift+P -> Photo Notes Scanner
        if ((e.key === 'p' || e.key === 'P') && e.shiftKey) {
          e.preventDefault();
          setIsPhotoScannerOpen(true);
          return;
        }

        // Ctrl+Shift+D -> Theme toggle
        if ((e.key === 'd' || e.key === 'D') && e.shiftKey) {
          e.preventDefault();
          handleToggleQuickTheme();
          return;
        }

        // Ctrl+/ -> Toggle Keyboard Shortcuts Sheet
        if (e.key === '/' || e.key === '?') {
          e.preventDefault();
          setIsKeyboardShortcutsOpen((prev) => !prev);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleOpenVideos = (subject?: string) => {
    setSelectedSubjectForVideos(subject || selectedDocForBlocknote?.subject);
    setIsVideosOpen(true);
  };

  // Subject counts for sidebar
  const subjectCounts = useMemo(() => {
    const map: Record<string, number> = {};
    documents.forEach((d) => {
      const s = d.subject || 'Général';
      map[s] = (map[s] || 0) + 1;
    });
    return map;
  }, [documents]);

  // Load documents from server on initial mount with resilient fallback
  useEffect(() => {
    let isMounted = true;
    async function fetchDocs() {
      try {
        const res = await fetch('/api/documents');
        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;
          if (data && data.documents && Array.isArray(data.documents) && data.documents.length > 0) {
            setDocuments(data.documents);
            
            // Restore previously selected document if saved in localStorage
            const savedDocId = localStorage.getItem('degreelocker_selected_doc_id');
            const matchedDoc = savedDocId 
              ? data.documents.find((d: SchoolDocument) => d.id === savedDocId)
              : null;
            const targetDoc = matchedDoc || data.documents[0];
            setSelectedDocForBlocknote(targetDoc);
            setSelectedDocForSummary(targetDoc);
          } else if (data && Array.isArray(data.documents)) {
            // Valid empty array from server
            setDocuments(data.documents);
          }
        }
      } catch (err) {
        // Fallback gracefully without breaking UI
        console.warn('Notice loading documents from server (using local state):', err);
      } finally {
        if (isMounted) {
          setIsLoadingInitial(false);
        }
      }
    }
    fetchDocs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Tag Management Handlers
  const handleCreateCustomTag = (newTag: CustomTag) => {
    setCustomTags((prev) => {
      if (prev.some((t) => t.name.toLowerCase() === newTag.name.toLowerCase())) {
        return prev;
      }
      const updated = [...prev, newTag];
      try {
        localStorage.setItem('degreelocker_custom_tags', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving custom tags:', e);
      }
      return updated;
    });
  };

  const handleDeleteCustomTag = (tagName: string) => {
    setCustomTags((prev) => {
      const updated = prev.filter((t) => t.name.toLowerCase() !== tagName.toLowerCase());
      try {
        localStorage.setItem('degreelocker_custom_tags', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving custom tags:', e);
      }
      return updated;
    });

    // Remove the deleted tag from all documents
    setDocuments((prev) => {
      const updatedDocs = prev.map((doc) => ({
        ...doc,
        tags: (doc.tags || []).filter((t) => t.toLowerCase() !== tagName.toLowerCase()),
      }));
      // Persist to server
      fetch('/api/documents/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: updatedDocs }),
      }).catch(console.warn);
      return updatedDocs;
    });
  };

  const handleUpdateDocumentTags = (docId: string, tags: string[]) => {
    setDocuments((prev) => {
      const updated = prev.map((doc) => {
        if (doc.id === docId) {
          return { ...doc, tags };
        }
        return doc;
      });

      // Update selected docs if active
      if (selectedDocForBlocknote?.id === docId) {
        setSelectedDocForBlocknote((prev) => (prev ? { ...prev, tags } : null));
      }
      if (selectedDocForSummary?.id === docId) {
        setSelectedDocForSummary((prev) => (prev ? { ...prev, tags } : null));
      }

      // Persist to server
      fetch(`/api/documents/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags }),
      }).catch(console.warn);

      // If user logged in, sync with cloud
      if (currentUser?.uid) {
        syncDocumentsToFirestore(currentUser.uid, updated).catch(console.warn);
      }

      return updated;
    });
  };

  // Real-time synchronization when user is logged in & direct push transfer listener
  useEffect(() => {
    if (!currentUser?.uid) return;

    // 1. Listen for new documents or updates from other devices (e.g. mobile photo scan)
    const unsubCloud = subscribeToCloudDocuments(currentUser.uid, (cloudDocs) => {
      if (cloudDocs && cloudDocs.length > 0) {
        setDocuments((prev) => {
          const prevMap = new Map(prev.map((d) => [d.id, d]));
          let hasChanges = false;
          for (const cd of cloudDocs) {
            if (!prevMap.has(cd.id)) {
              prevMap.set(cd.id, cd);
              hasChanges = true;
            }
          }
          if (hasChanges) {
            const merged = Array.from(prevMap.values());
            fetch('/api/documents/import', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ documents: merged }),
            }).catch(console.warn);
            return merged;
          }
          return prev;
        });
      }
    });

    // 2. Listen for direct transfers pushed from smartphone
    const unsubTransfers = subscribeToDeviceTransfers(currentUser.uid, (transfer: DeviceTransferRecord) => {
      if (transfer.source === 'mobile') {
        setDeviceToast({
          message: lang === 'fr' 
            ? `📱 Document reçu en direct depuis votre smartphone : "${transfer.docTitle}"`
            : `📱 Document received live from mobile: "${transfer.docTitle}"`,
          docId: transfer.docId,
        });
      }
    });

    return () => {
      unsubCloud();
      unsubTransfers();
    };
  }, [currentUser?.uid, lang]);

  // Send single document to smartphone via cloud
  const handleSendToPhone = async (doc: SchoolDocument) => {
    if (!currentUser?.uid) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      await sendSingleDocumentToCloud(currentUser.uid, doc, 'pc');
      setDeviceToast({
        message: lang === 'fr'
          ? `📱 "${doc.title}" envoyé avec succès sur votre smartphone !`
          : `📱 "${doc.title}" sent successfully to your mobile phone!`,
      });
      setTimeout(() => setDeviceToast(null), 5000);
    } catch (e) {
      console.warn('Failed to send doc to phone:', e);
    }
  };

  // Save or update document
  const handleSaveDocument = async (docData: Partial<SchoolDocument>, generateBlocknote: boolean) => {
    try {
      const payload: SchoolDocument = {
        id: docData.id || `doc-${Date.now()}`,
        title: docData.title || 'Untitled Note',
        subject: docData.subject || 'General',
        date: docData.date || new Date().toISOString().split('T')[0],
        type: docData.type || 'typed_note',
        tags: docData.tags || [],
        gradeLevel: docData.gradeLevel,
        content: docData.content || '',
        summary: docData.summary,
        keyPoints: docData.keyPoints,
        fileName: docData.fileName,
        fileSize: docData.fileSize,
        pdfDataUrl: docData.pdfDataUrl,
        blocknoteReproduction: docData.blocknoteReproduction,
        createdAt: docData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (generateBlocknote && !payload.blocknoteReproduction) {
        try {
          const bnRes = await fetch('/api/generate-blocknote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: payload.title,
              subject: payload.subject,
              content: payload.content,
              preferredPaper: 'ruled',
            }),
          });
          if (bnRes.ok) {
            payload.blocknoteReproduction = await bnRes.json();
          }
        } catch (e) {
          console.warn('Could not auto-generate blocknote:', e);
        }
      }

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to save to database');
      }

      const savedData = await res.json();
      const savedDoc = savedData.document || payload;

      setDocuments((prev) => {
        const idx = prev.findIndex((d) => d.id === savedDoc.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = savedDoc;
          return updated;
        }
        return [savedDoc, ...prev];
      });

      if (generateBlocknote) {
        setSelectedDocForBlocknote(savedDoc);
        setActiveTab('blocknote');
      }
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selectedDocForBlocknote?.id === id) {
        setSelectedDocForBlocknote(documents.find((d) => d.id !== id) || null);
      }
      if (selectedDocForSummary?.id === id) {
        setSelectedDocForSummary(documents.find((d) => d.id !== id) || null);
      }
    } catch (err) {
      console.error('Failed to delete doc:', err);
    }
  };

  const handleUpdateDocumentGuide = async (docId: string, guide: BlocknoteGuide) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;

    const updated = { ...doc, blocknoteReproduction: guide, updatedAt: new Date().toISOString() };
    setDocuments((prev) => prev.map((d) => (d.id === docId ? updated : d)));
    setSelectedDocForBlocknote(updated);

    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Failed to sync updated guide to server:', err);
    }
  };

  const handleUpdateDocumentSummary = async (docId: string, summary: string, keyPoints: string[]) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;

    const updated = { ...doc, summary, keyPoints, updatedAt: new Date().toISOString() };
    setDocuments((prev) => prev.map((d) => (d.id === docId ? updated : d)));
    setSelectedDocForSummary(updated);

    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Failed to sync summary to server:', err);
    }
  };

  const handlePdfProcessed = async (newDoc: SchoolDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setSelectedDocForBlocknote(newDoc);
    setSelectedDocForSummary(newDoc);

    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc),
      });
    } catch (err) {
      console.error('Failed to persist uploaded doc:', err);
    }

    setActiveTab('blocknote');
  };

  const handleResetSeed = async () => {
    try {
      await fetch('/api/documents/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: INITIAL_SCHOOL_DOCUMENTS }),
      });
      setDocuments(INITIAL_SCHOOL_DOCUMENTS);
      setSelectedDocForBlocknote(INITIAL_SCHOOL_DOCUMENTS[0]);
      setSelectedDocForSummary(INITIAL_SCHOOL_DOCUMENTS[0]);
    } catch (err) {
      console.error('Failed to reset seed:', err);
    }
  };

  const handleImportDatabase = async (importedDocs: SchoolDocument[]) => {
    try {
      await fetch('/api/documents/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: importedDocs }),
      });
      setDocuments(importedDocs);
      if (importedDocs.length > 0) {
        setSelectedDocForBlocknote(importedDocs[0]);
        setSelectedDocForSummary(importedDocs[0]);
      }
    } catch (err) {
      console.error('Failed to import database:', err);
    }
  };

  // Background style class matching theme
  const appBgClass = 
    preferences.theme === 'paper'
      ? 'bg-[#f4ede0] text-[#292524]'
      : preferences.theme === 'midnight'
      ? 'bg-[#030712] text-slate-100'
      : preferences.theme === 'dark'
      ? 'bg-slate-950 text-slate-100'
      : 'bg-slate-50 text-slate-900';

  return (
    <div className={`min-h-[100dvh] w-full max-w-[100vw] overflow-hidden ${appBgClass} flex font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-200`}>
      
      {/* Side Menu Navigation (Visible if menuPosition is 'left') */}
      {preferences.menuPosition === 'left' && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onNewNote={() => {
            setDocumentToEdit(null);
            setIsNoteEditorOpen(true);
          }}
          onUploadPdf={() => setIsPdfUploadOpen(true)}
          onOpenTutorial={() => setIsTutorialOpen(true)}
          onOpenPlaylists={() => setIsPlaylistsOpen(true)}
          onOpenLocalStorage={() => setIsLocalStorageOpen(true)}
          onOpenVideos={() => handleOpenVideos()}
          onOpenTips={() => setIsTipsOpen(true)}
          onOpenPreferences={() => setIsPreferencesOpen(true)}
          onOpenBackup={() => setIsBackupOpen(true)}
          onOpenCoach={() => setIsCoachOpen(true)}
          onOpenKeyboardShortcuts={() => setIsKeyboardShortcutsOpen(true)}
          onOpenOneDrive={() => setIsOneDriveOpen(true)}
          onFilterSubject={(subj) => {
            setActiveSubjectFilter(subj);
            setActiveTab('library');
          }}
          totalDocs={documents.length}
          lang={lang}
          onToggleLang={handleToggleLang}
          streakDays={realStreakDays}
          subjectCounts={subjectCounts}
          collapsed={preferences.isSidebarCollapsed}
          onToggleCollapsed={() => handleUpdatePreferences({ isSidebarCollapsed: !preferences.isSidebarCollapsed })}
          activeTheme={preferences.theme}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto">
        
        {/* Top Header Bar with 1-Click Theme Toggle & High Visibility Controls */}
        <TopHeader
          onSearchClick={() => setActiveTab('search')}
          onNewNote={() => {
            setDocumentToEdit(null);
            setIsNoteEditorOpen(true);
          }}
          onUploadPdf={() => setIsPdfUploadOpen(true)}
          onSummarizeClick={() => setActiveTab('resumer')}
          onOpenPlaylists={() => setIsPlaylistsOpen(true)}
          onOpenPreferences={() => setIsPreferencesOpen(true)}
          onOpenBackup={() => setIsBackupOpen(true)}
          onOpenCoach={() => setIsCoachOpen(true)}
          onOpenPhotoScanner={() => setIsPhotoScannerOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenKeyboardShortcuts={() => setIsKeyboardShortcutsOpen(true)}
          currentUser={currentUser}
          lang={lang}
          onToggleLang={handleToggleLang}
          onToggleTheme={handleToggleQuickTheme}
          streakDays={realStreakDays}
          currentWorkspace={lang === 'fr' ? 'Espace Personnel' : 'Default Workspace'}
          menuPosition={preferences.menuPosition}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarCollapsed={preferences.isSidebarCollapsed}
          onToggleSidebar={() => handleUpdatePreferences({ isSidebarCollapsed: !preferences.isSidebarCollapsed })}
          activeTheme={preferences.theme}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Workspace Body - Spacious and responsive */}
        <main className="flex-1 max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
          
          {/* Live Mobile-to-PC sync notification banner */}
          {deviceToast && (
            <div className="mb-5 p-3.5 bg-gradient-to-r from-indigo-900 to-indigo-950 border border-indigo-700/60 text-white rounded-xl shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
                <span className="text-base">📱</span>
                <span>{deviceToast.message}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {deviceToast.docId && (
                  <button
                    onClick={() => {
                      const found = documents.find((d) => d.id === deviceToast.docId);
                      if (found) {
                        setSelectedDocForBlocknote(found);
                        setSelectedDocForSummary(found);
                        setActiveTab('blocknote');
                      }
                      setDeviceToast(null);
                    }}
                    className="px-3 py-1 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    {lang === 'fr' ? 'Ouvrir la note' : 'Open note'}
                  </button>
                )}
                <button
                  onClick={() => setDeviceToast(null)}
                  className="p-1 hover:bg-indigo-800/80 text-indigo-300 hover:text-white rounded-md transition-colors cursor-pointer"
                  title="Fermer"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
            {/* Tab 1: Dashboard Overview */}
            {activeTab === 'dashboard' && (
              <DashboardOverview
                documents={documents}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onSelectDoc={(doc) => {
                  setSelectedDocForBlocknote(doc);
                  setSelectedDocForSummary(doc);
                  setActiveTab('blocknote');
                }}
                onOpenNewNote={() => {
                  setDocumentToEdit(null);
                  setIsNoteEditorOpen(true);
                }}
                onOpenUpload={() => setIsPdfUploadOpen(true)}
                onOpenBackup={() => setIsBackupOpen(true)}
                onOpenTutorial={() => setIsTutorialOpen(true)}
                onOpenTips={() => setIsTipsOpen(true)}
                onFilterSubject={(subj) => {
                  setActiveSubjectFilter(subj);
                }}
                lang={lang}
                activeTheme={preferences.theme}
              />
            )}

            {/* Tab 2: Document Library */}
            {activeTab === 'library' && (
              <DocumentListView
                documents={documents}
                onOpenBlocknote={(doc) => {
                  setSelectedDocForBlocknote(doc);
                  setSelectedDocForSummary(doc);
                  setActiveTab('blocknote');
                }}
                onSummarize={(doc) => {
                  setSelectedDocForSummary(doc);
                  setSelectedDocForBlocknote(doc);
                  setActiveTab('resumer');
                }}
                onEdit={(doc) => {
                  setDocumentToEdit(doc);
                  setIsNoteEditorOpen(true);
                }}
                onDelete={handleDeleteDocument}
                onNewNote={() => {
                  setDocumentToEdit(null);
                  setIsNoteEditorOpen(true);
                }}
                onUploadPdf={() => setIsPdfUploadOpen(true)}
                onSwitchToSearch={() => setActiveTab('search')}
                onOpenFlashcards={(doc) => {
                  if (doc) {
                    setSelectedDocForBlocknote(doc);
                    setSelectedDocForSummary(doc);
                  }
                  setActiveTab('flashcards');
                }}
                onOpenQuiz={(doc) => {
                  setSelectedDocForQuiz(doc.id);
                  setSelectedDocForBlocknote(doc);
                  setSelectedDocForSummary(doc);
                  setActiveTab('quiz');
                }}
                onOpenBilingual={(doc) => {
                  if (doc) {
                    setSelectedDocForBlocknote(doc);
                    setSelectedDocForSummary(doc);
                  }
                  setActiveTab('bilingual');
                }}
                onOpenAnnotate={(doc) => {
                  setAnnotatingDoc(doc);
                  setIsAnnotationOpen(true);
                }}
                onOpenTutorial={() => setIsTutorialOpen(true)}
                selectedDocForBlocknoteId={selectedDocForBlocknote?.id}
                lang={lang}
                customTags={customTags}
                onCreateTag={handleCreateCustomTag}
                onDeleteTag={handleDeleteCustomTag}
                onUpdateDocumentTags={handleUpdateDocumentTags}
                onSendToPhone={handleSendToPhone}
              />
            )}

            {/* Tab 3: AI Semantic Search */}
            {activeTab === 'search' && (
              <AiSearchView
                documents={documents}
                onOpenDocInBlocknote={(doc) => {
                  setSelectedDocForBlocknote(doc);
                  setActiveTab('blocknote');
                }}
                onSelectDoc={(doc) => {
                  setDocumentToEdit(doc);
                  setIsNoteEditorOpen(true);
                }}
                lang={lang}
              />
            )}

            {/* Tab 4: AI Summaries & Sources Synthesis */}
            {activeTab === 'resumer' && (
              <ResumerView
                documents={documents}
                selectedDocument={selectedDocForSummary}
                onSelectDocument={(doc) => setSelectedDocForSummary(doc)}
                onUpdateDocumentSummary={handleUpdateDocumentSummary}
                onOpenInBlocknote={(doc) => {
                  setSelectedDocForBlocknote(doc);
                  setActiveTab('blocknote');
                }}
                onOpenPresentation={(doc) => {
                  setPresentationDoc(doc);
                  setIsPresentationOpen(true);
                }}
                lang={lang}
              />
            )}

            {/* Tab 5: Blocknote Sheet Companion */}
            {activeTab === 'blocknote' && (
              <BlocknoteView
                document={selectedDocForBlocknote}
                onUpdateDocumentGuide={handleUpdateDocumentGuide}
                onOpenDocSelector={() => setActiveTab('library')}
                onOpenTutorial={() => setIsTutorialOpen(true)}
                lang={lang}
                onOpenTips={() => setIsTipsOpen(true)}
                onOpenVideos={(subject) => handleOpenVideos(subject)}
              />
            )}

            {/* Tab 6: 100+ Famous Quotes & Speeches Explorer */}
            {activeTab === 'quotes' && (
              <FamousQuotesView
                lang={lang}
                onOpenDocWithTopic={(topic) => {
                  setActiveTab('search');
                }}
              />
            )}

            {/* Tab 7: Flashcards & Leitner Spaced Repetition */}
            {activeTab === 'flashcards' && (
              <FlashcardsView
                documents={documents}
                lang={lang}
                onOpenDocInBlocknote={(doc) => {
                  setSelectedDocForBlocknote(doc);
                  setActiveTab('blocknote');
                }}
                onOpenPlaylists={() => setIsPlaylistsOpen(true)}
                activeTheme={preferences.theme}
              />
            )}

            {/* Tab 8: Quiz Arena */}
            {activeTab === 'quiz' && (
              <QuizView
                documents={documents}
                selectedDocumentId={selectedDocForQuiz || selectedDocForBlocknote?.id}
                lang={lang}
                onOpenDocInBlocknote={(doc) => {
                  setSelectedDocForBlocknote(doc);
                  setActiveTab('blocknote');
                }}
              />
            )}

            {/* Tab 9: Bilingual Lab */}
            {activeTab === 'bilingual' && (
              <BilingualLearningView
                documents={documents}
                lang={lang}
                onOpenDocInBlocknote={(doc) => {
                  setSelectedDocForBlocknote(doc);
                  setActiveTab('blocknote');
                }}
                onCompleteExercise={recordStudyActivity}
              />
            )}

            {/* Tab 10: Local Database Manager */}
            {activeTab === 'database' && (
              <DatabaseManagerView
                documents={documents}
                onImportDatabase={handleImportDatabase}
                onResetSeed={handleResetSeed}
                lang={lang}
              />
            )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Socratic AI Study Coach Modal (Anti-Triche & Method) */}
      <SocraticCoachModal
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        documents={documents}
        currentDocument={selectedDocForBlocknote || selectedDocForSummary}
        lang={lang}
      />

      {/* Photo Notes Scanner Modal (Camera / Phone Snap to Google Docs) */}
      <PhotoNotesScannerModal
        isOpen={isPhotoScannerOpen}
        onClose={() => setIsPhotoScannerOpen(false)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onDocumentCreated={(newDoc) => {
          setDocuments((prev) => [newDoc, ...prev]);
          setSelectedDocForBlocknote(newDoc);
          setSelectedDocForSummary(newDoc);
          recordStudyActivity();
          if (currentUser) {
            syncDocumentsToFirestore(currentUser.uid, [newDoc, ...documents]);
          }
        }}
        lang={lang}
      />

      {/* Account & Cross-Device Cloud Sync Modal (Phone ↔ Computer via Firebase) */}
      <AuthSyncModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChanged={(user) => setCurrentUser(user)}
        localDocs={documents}
        onMergeCloudDocs={(mergedDocs) => {
          setDocuments(mergedDocs);
          if (mergedDocs.length > 0) {
            setSelectedDocForBlocknote(mergedDocs[0]);
            setSelectedDocForSummary(mergedDocs[0]);
          }
        }}
        lang={lang}
      />

      {/* Theme & Layout Preferences Manager Modal */}
      <ThemePreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        onOpenBackup={() => setIsBackupOpen(true)}
        lang={lang}
      />

      {/* Study Progress Backup & Restore Modal (.JSON) */}
      <BackupProgressModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        documents={documents}
        streakDays={realStreakDays}
        preferences={preferences}
        onRestoreSuccess={handleRestoreBackup}
        lang={lang}
      />

      {/* Quote Loading Modal (used during heavy loading/processing) */}
      <QuoteLoadingModal
        isOpen={isQuoteLoadingOpen}
        title={quoteLoadingTitle}
        subtitle={quoteLoadingSubtitle}
        lang={lang}
      />

      {/* Study Playlists & Offline Ambient Sound Synthesizer Modal */}
      <StudyPlaylistsModal
        isOpen={isPlaylistsOpen}
        onClose={() => setIsPlaylistsOpen(false)}
        lang={lang}
      />

      {/* Note Editor Modal */}
      <NoteEditorModal
        isOpen={isNoteEditorOpen}
        onClose={() => {
          setIsNoteEditorOpen(false);
          setDocumentToEdit(null);
        }}
        documentToEdit={documentToEdit}
        onSave={handleSaveDocument}
        lang={lang}
      />

      {/* PDF / Word / Excel / Google Doc Upload Modal */}
      <PdfUploadModal
        isOpen={isPdfUploadOpen}
        onClose={() => setIsPdfUploadOpen(false)}
        onPdfProcessed={handlePdfProcessed}
        lang={lang}
      />

      {/* Tutorial & Walkthrough Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onOpenSampleBlocknote={() => {
          setIsTutorialOpen(false);
          setActiveTab('blocknote');
        }}
        lang={lang}
      />

      {/* Local Storage File Browser Modal */}
      <LocalStorageBrowserModal
        isOpen={isLocalStorageOpen}
        onClose={() => setIsLocalStorageOpen(false)}
        onSelectDocument={(doc) => {
          setSelectedDocForBlocknote(doc);
          setActiveTab('blocknote');
          setIsLocalStorageOpen(false);
        }}
        lang={lang}
      />

      {/* Educational Videos Modal */}
      <EducationalVideosModal
        isOpen={isVideosOpen}
        onClose={() => setIsVideosOpen(false)}
        initialSubject={selectedSubjectForVideos}
        lang={lang}
      />

      {/* Note Taking Tips Modal */}
      <NoteTakingTipsModal
        isOpen={isTipsOpen}
        onClose={() => setIsTipsOpen(false)}
        lang={lang}
        onOpenBlocknoteSample={() => {
          setIsTipsOpen(false);
          setActiveTab('blocknote');
        }}
      />

      {/* Global Keyboard Shortcuts Manager Modal */}
      <KeyboardShortcutsModal
        isOpen={isKeyboardShortcutsOpen}
        onClose={() => setIsKeyboardShortcutsOpen(false)}
        lang={lang}
        onTriggerSearch={() => setActiveTab('search')}
        onTriggerNewNote={() => {
          setDocumentToEdit(null);
          setIsNoteEditorOpen(true);
        }}
        onTriggerUploadPdf={() => setIsPdfUploadOpen(true)}
        onTriggerBlocknote={() => setActiveTab('blocknote')}
        onTriggerFlashcards={() => setActiveTab('flashcards')}
        onTriggerQuiz={() => setActiveTab('quiz')}
        onTriggerLibrary={() => setActiveTab('library')}
        onTriggerDashboard={() => setActiveTab('dashboard')}
        onTriggerThemeToggle={handleToggleQuickTheme}
        onTriggerCoach={() => setIsCoachOpen(true)}
        onTriggerPhotoScanner={() => setIsPhotoScannerOpen(true)}
      />

      {/* PDF Drawing & Highlighting Annotation Modal */}
      <PdfAnnotationModal
        isOpen={isAnnotationOpen}
        onClose={() => {
          setIsAnnotationOpen(false);
          setAnnotatingDoc(null);
        }}
        document={annotatingDoc}
        onSaveAnnotations={(docId, annotations) => {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === docId ? { ...doc, annotations } : doc
            )
          );
          if (annotatingDoc && annotatingDoc.id === docId) {
            setAnnotatingDoc((prev) => (prev ? { ...prev, annotations } : null));
          }
        }}
        lang={lang}
      />

      {/* Full-Screen Presentation Mode Modal */}
      <PresentationModeModal
        isOpen={isPresentationOpen}
        onClose={() => {
          setIsPresentationOpen(false);
          setPresentationDoc(null);
        }}
        documents={documents}
        initialDocument={presentationDoc || selectedDocForSummary || documents[0]}
        lang={lang}
      />

      {/* Welcome Onboarding Modal for First Visit / Google Account Sync */}
      <WelcomeOnboardingModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        onUserConnected={(user) => setCurrentUser(user)}
        lang={lang}
      />

      {/* OneDrive & Cloud Sync Modal */}
      <OneDriveSyncModal
        isOpen={isOneDriveOpen}
        onClose={() => setIsOneDriveOpen(false)}
        currentUser={currentUser}
        documents={documents}
        onSyncComplete={(synced) => setDocuments(synced)}
        lang={lang}
      />
    </div>
  );
}

