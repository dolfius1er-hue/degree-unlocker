import React, { useState, useEffect, useMemo, startTransition, lazy, Suspense } from 'react';
import { SchoolDocument, BlocknoteGuide, AppLanguage, UIPreferences, AppTheme, MenuPosition, CustomTag, StudyProgressBackup } from './types';
import { INITIAL_SCHOOL_DOCUMENTS } from './data/seedDocuments';
import { Sidebar, NavTabType } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { fetchWithRetry } from './lib/api-utils';

// Lazy loaded views
const DashboardOverview = lazy(() => import('./components/DashboardOverview').then(m => ({ default: m.DashboardOverview || m.default })));
const DocumentListView = lazy(() => import('./components/DocumentListView').then(m => ({ default: m.DocumentListView })));
const AiSearchView = lazy(() => import('./components/AiSearchView').then(m => ({ default: m.AiSearchView })));
const ResumerView = lazy(() => import('./components/ResumerView').then(m => ({ default: m.ResumerView })));
const BlocknoteView = lazy(() => import('./components/BlocknoteView').then(m => ({ default: m.BlocknoteView })));
const FamousQuotesView = lazy(() => import('./components/FamousQuotesView').then(m => ({ default: m.FamousQuotesView })));
const DatabaseManagerView = lazy(() => import('./components/DatabaseManagerView').then(m => ({ default: m.DatabaseManagerView })));
const FlashcardsView = lazy(() => import('./components/FlashcardsView').then(m => ({ default: m.FlashcardsView })));
const QuizView = lazy(() => import('./components/QuizView').then(m => ({ default: m.QuizView })));
const BilingualLearningView = lazy(() => import('./components/BilingualLearningView').then(m => ({ default: m.BilingualLearningView })));
const SchoolBooksLibraryView = lazy(() => import('./components/SchoolBooksLibraryView').then(m => ({ default: m.SchoolBooksLibraryView })));
const EnglishCourseView = lazy(() => import('./components/EnglishCourseView').then(m => ({ default: m.EnglishCourseView })));
const SpanishCourseView = lazy(() => import('./components/SpanishCourseView').then(m => ({ default: m.SpanishCourseView })));
const GermanCourseView = lazy(() => import('./components/GermanCourseView').then(m => ({ default: m.GermanCourseView })));
const ClassicalLanguagesView = lazy(() => import('./components/ClassicalLanguagesView').then(m => ({ default: m.ClassicalLanguagesView })));
const TutorialPageView = lazy(() => import('./components/TutorialPageView').then(m => ({ default: m.TutorialPageView })));
const NoteTakingTipsPageView = lazy(() => import('./components/NoteTakingTipsPageView').then(m => ({ default: m.NoteTakingTipsPageView })));
const PrivacyPolicyPageView = lazy(() => import('./components/PrivacyPolicyPageView').then(m => ({ default: m.PrivacyPolicyPageView })));
const FullScreenCommandDeckModal = lazy(() => import('./components/FullScreenCommandDeckModal').then(m => ({ default: m.FullScreenCommandDeckModal })));

// Lazy loaded modals
const NoteEditorModal = lazy(() => import('./components/NoteEditorModal').then(m => ({ default: m.NoteEditorModal })));
const PdfUploadModal = lazy(() => import('./components/PdfUploadModal').then(m => ({ default: m.PdfUploadModal })));
const TutorialModal = lazy(() => import('./components/TutorialModal').then(m => ({ default: m.TutorialModal })));
const LocalStorageBrowserModal = lazy(() => import('./components/LocalStorageBrowserModal').then(m => ({ default: m.LocalStorageBrowserModal })));
const EducationalVideosModal = lazy(() => import('./components/EducationalVideosModal').then(m => ({ default: m.EducationalVideosModal })));
const NoteTakingTipsModal = lazy(() => import('./components/NoteTakingTipsModal').then(m => ({ default: m.NoteTakingTipsModal })));
const StudyPlaylistsModal = lazy(() => import('./components/StudyPlaylistsModal').then(m => ({ default: m.StudyPlaylistsModal })));
const QuoteLoadingModal = lazy(() => import('./components/QuoteLoadingModal').then(m => ({ default: m.QuoteLoadingModal })));
const ThemePreferencesModal = lazy(() => import('./components/ThemePreferencesModal').then(m => ({ default: m.ThemePreferencesModal })));
const SocraticCoachModal = lazy(() => import('./components/SocraticCoachModal').then(m => ({ default: m.SocraticCoachModal })));
const BackupProgressModal = lazy(() => import('./components/BackupProgressModal').then(m => ({ default: m.BackupProgressModal })));
const PhotoNotesScannerModal = lazy(() => import('./components/PhotoNotesScannerModal').then(m => ({ default: m.PhotoNotesScannerModal })));
const AuthSyncModal = lazy(() => import('./components/AuthSyncModal').then(m => ({ default: m.AuthSyncModal })));
const KeyboardShortcutsModal = lazy(() => import('./components/KeyboardShortcutsModal').then(m => ({ default: m.KeyboardShortcutsModal })));
const PdfAnnotationModal = lazy(() => import('./components/PdfAnnotationModal').then(m => ({ default: m.PdfAnnotationModal })));
const PresentationModeModal = lazy(() => import('./components/PresentationModeModal').then(m => ({ default: m.PresentationModeModal })));
const WelcomeOnboardingModal = lazy(() => import('./components/WelcomeOnboardingModal').then(m => ({ default: m.WelcomeOnboardingModal })));
const OneDriveSyncModal = lazy(() => import('./components/OneDriveSyncModal').then(m => ({ default: m.OneDriveSyncModal })));
const GoogleWorkspaceModal = lazy(() => import('./components/GoogleWorkspaceModal').then(m => ({ default: m.GoogleWorkspaceModal })));
const GoogleDriveBrowser = lazy(() => import('./components/GoogleDriveBrowser').then(m => ({ default: m.GoogleDriveBrowser })));
const PrivacyPolicyModal = lazy(() => import('./components/PrivacyPolicyModal').then(m => ({ default: m.PrivacyPolicyModal })));
const InstallGuideModal = lazy(() => import('./components/InstallGuideModal').then(m => ({ default: m.InstallGuideModal })));
const NotionSubjectWorkspaceModal = lazy(() => import('./components/NotionSubjectWorkspaceModal').then(m => ({ default: m.NotionSubjectWorkspaceModal })));
const CreditsModal = lazy(() => import('./components/CreditsModal').then(m => ({ default: m.CreditsModal || m.default })));
const OfflineSyncManager = lazy(() => import('./components/OfflineSyncManager').then(m => ({ default: m.OfflineSyncManager })));
const LiteOptimizationModal = lazy(() => import('./components/LiteOptimizationModal').then(m => ({ default: m.LiteOptimizationModal })));
const MobileExportGuideModal = lazy(() => import('./components/MobileExportGuideModal').then(m => ({ default: m.MobileExportGuideModal })));
import { NotionSubjectKey } from './components/NotionSubjectWorkspaceModal';

const InstallAppBanner = lazy(() => import('./components/InstallAppBanner').then(m => ({ default: m.InstallAppBanner })));
const AppUpdateManager = lazy(() => import('./components/AppUpdateManager').then(m => ({ default: m.AppUpdateManager })));
const OfflineIndicator = lazy(() => import('./components/OfflineIndicator').then(m => ({ default: m.OfflineIndicator })));
const CyberSoundscapeHUD = lazy(() => import('./components/CyberSoundscapeHUD').then(m => ({ default: m.CyberSoundscapeHUD })));

import { MobileBottomNav } from './components/MobileBottomNav';
import { DesktopLayoutWrapper } from './components/DesktopLayoutWrapper';
import { PcWorkstationPillBanner } from './components/PcWorkstationPillBanner';
import { LockInWorkstationHub } from './components/LockInWorkstationHub';
import { offlineStorageService } from './services/offlineStorageService';
import { isTauri, showWindow } from './lib/tauri-bridge';
import { useTauriDesktopWorkstation } from './hooks/useTauriDesktopWorkstation';
import { soundFx } from './utils/soundEffects';
import { motion, AnimatePresence } from 'motion/react';
import { 
  onAuthChange, 
  syncDocumentsToFirestore, 
  subscribeToCloudDocuments, 
  subscribeToDeviceTransfers, 
  sendSingleDocumentToCloud, 
  deleteDocumentFromCloud,
  DeviceTransferRecord 
} from './lib/firebase';

export default function App() {
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [isUsingOfflineDB, setIsUsingOfflineDB] = useState<boolean>(false);

  // Automatic Tauri Desktop environment detector & Hardcore Onyx Workstation Mode hook
  const { isTauriEnvironment, isWorkstationMode, toggleWorkstationMode } = useTauriDesktopWorkstation({
    autoEnableOnTauri: true,
  });

  // Deterministic initial state for zero-warning React hydration
  const [activeTab, setActiveTab] = useState<NavTabType>('dashboard');
  
  // Cyber Focus & Ambient Sound Studio State
  const [isSoundHUDOpen, setIsSoundHUDOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('degreelocker_sound_hud_open');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const toggleSoundHUD = () => {
    soundFx.playClick(900);
    setIsSoundHUDOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('degreelocker_sound_hud_open', String(next));
      } catch {}
      return next;
    });
  };
  
  // Persist activeTab whenever it changes
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
  const [customTags, setCustomTags] = useState<CustomTag[]>([
    { id: 'tag-bac', name: 'Bac2025', color: 'indigo' },
    { id: 'tag-exam', name: 'Examen', color: 'rose' },
    { id: 'tag-formules', name: 'Formules', color: 'emerald' },
    { id: 'tag-cours', name: 'CoursImportant', color: 'amber' },
  ]);

  // Study activity tracking for genuine streak calculation
  const [activityDates, setActivityDates] = useState<string[]>([]);

  // Cross-device live transfer notifications & In-App Notification Toast Fallback
  const [deviceToast, setDeviceToast] = useState<{ message: string; docId?: string } | null>(null);
  const [apiErrorToast, setApiErrorToast] = useState<string | null>(null);

  useEffect(() => {
    const handleInAppNotification = (e: any) => {
      const { title, body } = e.detail || {};
      if (title || body) {
        setDeviceToast({
          message: `${title ? title + ' : ' : ''}${body || ''}`,
        });
      }
    };
    window.addEventListener('inAppNotificationToast', handleInAppNotification);
    return () => window.removeEventListener('inAppNotificationToast', handleInAppNotification);
  }, []);

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
  
  // UI Preferences state (Theme, Menu position, Collapse, Language) - hydrated in Stage 2
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
  const [isGoogleWorkspaceOpen, setIsGoogleWorkspaceOpen] = useState(false);
  const [quotesInitialCategory, setQuotesInitialCategory] = useState<string>('all');
  const [quotesInitialSubcategory, setQuotesInitialSubcategory] = useState<'all' | 'dolfius_4_maximes' | 'image_maximes'>('all');
  const [isGoogleDriveBrowserOpen, setIsGoogleDriveBrowserOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [presentationDoc, setPresentationDoc] = useState<SchoolDocument | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(false);
  const [isQuoteLoadingOpen, setIsQuoteLoadingOpen] = useState(false);
  const [quoteLoadingTitle, setQuoteLoadingTitle] = useState<string | undefined>(undefined);
  const [quoteLoadingSubtitle, setQuoteLoadingSubtitle] = useState<string | undefined>(undefined);
  const [lang, setLang] = useState<AppLanguage>('fr');
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullScreenMenuOpen, setIsFullScreenMenuOpen] = useState(false);
  const [appKeyboardLayout, setAppKeyboardLayout] = useState<'azerty' | 'qwerty'>('azerty');
  const [isNotionWorkspaceOpen, setIsNotionWorkspaceOpen] = useState(false);
  const [selectedNotionSubject, setSelectedNotionSubject] = useState<NotionSubjectKey>('espagnol');
  const [isSplashDismissed, setIsSplashDismissed] = useState<boolean>(false);

  // PWA Service Worker & Install Prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState<boolean>(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState<boolean>(false);
  const [isSyncManagerOpen, setIsSyncManagerOpen] = useState<boolean>(false);
  const [isLiteModalOpen, setIsLiteModalOpen] = useState<boolean>(false);
  const [isExportGuideOpen, setIsExportGuideOpen] = useState<boolean>(false);

  // Memoized splash screen dismissal trigger synchronized with Tauri webview
  const dismissSplash = useMemo(() => {
    let dismissed = false;
    return () => {
      if (dismissed) return;
      dismissed = true;
      requestAnimationFrame(() => {
        setTimeout(async () => {
          if (typeof (window as any).setSplashProgress === 'function') {
            (window as any).setSplashProgress(100, true);
          } else if (typeof (window as any).dismissSplashLoader === 'function') {
            (window as any).dismissSplashLoader();
          }

          // Tauri Native PC Launcher Synchronization: Smoothly reveal window without micro-stutter
          if (isTauri()) {
            try {
              await showWindow();
            } catch (err) {
              // Ignore native window reveal errors
            }
          }

          // Set splash as officially dismissed after DOM fade/removal
          setTimeout(() => {
            setIsSplashDismissed(true);
          }, 150);
        }, 0);
      });
    };
  }, []);

  // Orchestrated Staged Loading Engine for extreme startup speed on PC & Mobile
  const [loadingStage, setLoadingStage] = useState<number>(1);

  // STAGE 1: Instant Layout Mount (0ms) - Handled on initial mount
  useEffect(() => {
    // Set splash loader progress to 30% on initial shell paint
    if (typeof (window as any).setSplashProgress === 'function') {
      (window as any).setSplashProgress(30);
    }

    // Tauri Native PC Launcher: ensure window is revealed safely if not already shown
    if (isTauri()) {
      showWindow().catch(() => {});
    }
    
    // Schedule Stage 2 transition immediately after initial layout commit
    const scheduleStage2 = () => {
      requestAnimationFrame(() => {
        setLoadingStage(2);
      });
    };

    scheduleStage2();
  }, []);

  // STAGE 2: Hydrate Essential Data & Restore Local Workspace (Instant / 0ms)
  // This consolidates local state parsing and IndexedDB reading so we can dismiss the splash screen instantly
  useEffect(() => {
    if (loadingStage !== 2) return;

    if (typeof (window as any).setSplashProgress === 'function') {
      (window as any).setSplashProgress(60);
    }

    let isMounted = true;

    const runStage2Hydration = async () => {
      // 1. Instantly parse lightweight synchronous items from localStorage
      try {
        const savedTab = localStorage.getItem('degreelocker_active_tab') as NavTabType | null;
        const validTabs: NavTabType[] = [
          'dashboard', 'library', 'search', 'resumer', 'blocknote', 
          'quotes', 'flashcards', 'quiz', 'bilingual', 'database'
        ];
        if (savedTab && validTabs.includes(savedTab)) {
          setActiveTab(savedTab);
        }
      } catch (e) {}

      try {
        const rawPrefs = localStorage.getItem('degreelocker_preferences');
        if (rawPrefs) {
          const parsed = JSON.parse(rawPrefs);
          setPreferences((prev) => ({ ...prev, ...parsed }));
          if (parsed.language) setLang(parsed.language);
        }
      } catch (e) {}

      try {
        const rawTags = localStorage.getItem('degreelocker_custom_tags');
        if (rawTags) {
          setCustomTags(JSON.parse(rawTags));
        }
      } catch (e) {
        console.warn('[Stage 2] Failed loading custom tags:', e);
      }

      try {
        const rawDates = localStorage.getItem('degreelocker_activity_dates');
        if (rawDates) {
          setActivityDates(JSON.parse(rawDates));
        }
      } catch (e) {
        console.warn('[Stage 2] Failed loading activity dates:', e);
      }

      try {
        const welcomed = localStorage.getItem('degreelocker_welcomed');
        if (!welcomed) {
          setIsWelcomeModalOpen(true);
        }
      } catch (e) {
        setIsWelcomeModalOpen(true);
      }

      // 2. Fetch local documents from IndexedDB
      try {
        const cachedDocs = await offlineStorageService.getAllDocuments();
        if (!isMounted) return;

        if (cachedDocs && cachedDocs.length > 0) {
          const savedDocId = localStorage.getItem('degreelocker_selected_doc_id');
          const matchedDoc = savedDocId ? cachedDocs.find((d: SchoolDocument) => d.id === savedDocId) : null;
          const targetDoc = matchedDoc || cachedDocs[0];

          startTransition(() => {
            setDocuments(cachedDocs);
            setIsUsingOfflineDB(true);
            setSelectedDocForBlocknote(targetDoc);
            setSelectedDocForSummary(targetDoc);
          });
        } else {
          startTransition(() => {
            setDocuments(INITIAL_SCHOOL_DOCUMENTS);
            setSelectedDocForBlocknote(INITIAL_SCHOOL_DOCUMENTS[0]);
            setSelectedDocForSummary(INITIAL_SCHOOL_DOCUMENTS[0]);
          });
          await offlineStorageService.saveAllDocuments(INITIAL_SCHOOL_DOCUMENTS);
        }
      } catch (err) {
        if (isMounted) {
          startTransition(() => {
            setDocuments(INITIAL_SCHOOL_DOCUMENTS);
          });
        }
      } finally {
        if (isMounted) {
          // Immediately hide initial loading and dismiss splash screen!
          // Essential local data is available, making the app fully interactive.
          setIsLoadingInitial(false);
          dismissSplash();

          // Advance to Stage 3 for non-critical network background activities
          const idleCallback = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 150));
          idleCallback(() => {
            setLoadingStage(3);
          });
        }
      }
    };

    runStage2Hydration();

    return () => {
      isMounted = false;
    };
  }, [loadingStage, dismissSplash]);

  // STAGE 3: Non-critical Background Network Sync and Service Worker (Idle)
  useEffect(() => {
    if (loadingStage !== 3) return;

    let isMounted = true;

    const runStage3 = async () => {
      // 1. Background-refresh UI preferences from server
      try {
        const res = await fetchWithRetry('/api/preferences', {
          retries: 1,
          initialDelayMs: 200,
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          const prefs = data?.preferences || (data?.theme ? data : null);
          if (prefs) {
            setPreferences(prev => {
              const merged = { ...prev, ...prefs };
              try {
                localStorage.setItem('degreelocker_preferences', JSON.stringify(merged));
              } catch (e) {}
              return merged;
            });
            if (prefs.language) setLang(prefs.language);
          }
        }
      } catch (err: any) {
        console.info('[Stage 3] Operating with cached UI preferences.');
      }

      // 2. Register PWA Service Worker
      if ('serviceWorker' in navigator && !('__TAURI__' in window)) {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
          console.log('[Stage 3] ServiceWorker registered:', registration.scope);
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('New application update available.');
                  }
                }
              };
            }
          };
        }).catch((err) => {
          console.log('[Stage 3] ServiceWorker registration failed:', err);
        });
      }

      // 3. Silent Background API sync for latest documents
      try {
        const res = await fetchWithRetry('/api/documents', {
          retries: 1,
          initialDelayMs: 300,
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data && Array.isArray(data.documents) && data.documents.length > 0) {
            startTransition(() => {
              setDocuments(data.documents);
              setIsUsingOfflineDB(false);
            });
            await offlineStorageService.saveAllDocuments(data.documents);
          }
        }
      } catch (err) {
        console.warn('[Stage 3] Silent background sync skipped, operating offline.');
      }

      // Schedule Stage 4 for non-critical observers and listeners
      if (isMounted) {
        const idleCallback = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 250));
        idleCallback(() => {
          setLoadingStage(4);
        });
      }
    };

    runStage3();

    return () => {
      isMounted = false;
    };
  }, [loadingStage]);

  // STAGE 4: Non-critical Auth Observer Setup (Idle / Latency Isolation)
  // Runs STRICTLY after the splash screen is fully dismissed to prevent main thread blocking
  useEffect(() => {
    if (loadingStage < 4 || !isSplashDismissed) return;

    let isMounted = true;
    let unsubAuth: (() => void) | null = null;

    const idleCallback = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 250));

    const handle = idleCallback(() => {
      if (!isMounted) return;
      console.log('[Stage 4] Registering deferred Firebase Auth state observer in idle callback...');
      unsubAuth = onAuthChange((user) => {
        if (isMounted) {
          setCurrentUser(user);
        }
      });
    }, { timeout: 2500 });

    return () => {
      isMounted = false;
      if ((window as any).cancelIdleCallback) {
        (window as any).cancelIdleCallback(handle);
      } else {
        clearTimeout(handle);
      }
      if (unsubAuth) unsubAuth();
    };
  }, [loadingStage, isSplashDismissed]);

  // PWA & Installation Prompt Event Listeners
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsPwaInstalled(true);
    }

    window.addEventListener('appinstalled', () => {
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsPwaInstalled(true);
          setDeferredPrompt(null);
        } else {
          setIsInstallGuideOpen(true);
        }
      } catch (err) {
        console.error('PWA install prompt error:', err);
        setIsInstallGuideOpen(true);
      }
    } else {
      setIsInstallGuideOpen(true);
    }
  };



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
    const body = document.body;
    root.classList.remove('dark', 'theme-midnight', 'theme-paper', 'pc-hardcore-onyx');
    if (body) body.classList.remove('pc-hardcore-onyx');

    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else if (preferences.theme === 'midnight') {
      root.classList.add('theme-midnight');
      root.classList.add('dark');
    } else if (preferences.theme === 'paper') {
      root.classList.add('theme-paper');
    } else if (preferences.theme === 'hardcore') {
      root.classList.add('pc-hardcore-onyx');
      root.classList.add('dark');
      if (body) body.classList.add('pc-hardcore-onyx');
    }
  }, [preferences.theme]);

  const savePreferencesToServer = async (newPrefs: UIPreferences) => {
    try {
      await fetchWithRetry('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrefs),
        retries: 3,
      });
    } catch (err: any) {
      console.warn('Failed to save preferences to server after retries:', err);
      setApiErrorToast(lang === 'fr'
        ? 'Échec de la sauvegarde des préférences sur le serveur.'
        : 'Failed to save preferences to server.');
    }
  };

  const handleUpdatePreferences = (updated: Partial<UIPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updated, updatedAt: new Date().toISOString() };
      try {
        localStorage.setItem('degreelocker_preferences', JSON.stringify(next));
      } catch (e) {
        console.warn('Could not cache preferences locally', e);
      }
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
      try {
        localStorage.setItem('degreelocker_preferences', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not cache preferences locally', e);
      }
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
        setIsGoogleWorkspaceOpen(false);
        setIsGoogleDriveBrowserOpen(false);
        setIsFullScreenMenuOpen(false);
        setIsSidebarOpen(false);
        setIsPrivacyModalOpen(false);
        setIsNotionWorkspaceOpen(false);
        setIsInstallGuideOpen(false);
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

        // Ctrl+B -> Toggle Sidebar
        if (e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          setIsSidebarOpen((prev) => !prev);
          return;
        }

        // Ctrl+Shift+O -> Toggle Degree Unlocker Lite Optimizer
        if ((e.key === 'o' || e.key === 'O') && e.shiftKey) {
          e.preventDefault();
          setIsLiteModalOpen((prev) => !prev);
          return;
        }

        // Ctrl+/ -> Toggle Keyboard Shortcuts Sheet
        if (e.key === '/' || e.key === '?') {
          e.preventDefault();
          setIsKeyboardShortcutsOpen((prev) => !prev);
          return;
        }
      }

      // Escape -> close sidebar if open
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
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



  // Auto-persist documents state to IndexedDB on every local mutation
  useEffect(() => {
    if (documents && documents.length > 0) {
      offlineStorageService.saveAllDocuments(documents).catch((err) => {
        console.warn('[IndexedDB] Failed auto-persisting documents state:', err);
      });
    }
  }, [documents]);

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
  // Defers Firestore listeners until AFTER splash is fully dismissed to guarantee zero main-thread contention
  useEffect(() => {
    if (!currentUser?.uid || loadingStage < 4 || !isSplashDismissed) return;

    let isMounted = true;
    let unsubCloud: (() => void) | null = null;
    let unsubTransfers: (() => void) | null = null;

    const idleCallback = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 350));

    const handle = idleCallback(() => {
      if (!isMounted) return;

      console.log('[Firestore] Registering deferred cloud and device transfer observers in idle callback...');

      // 1. Listen for new documents or updates from other devices (e.g. mobile photo scan)
      unsubCloud = subscribeToCloudDocuments(currentUser.uid, (cloudDocs) => {
        if (cloudDocs && cloudDocs.length > 0) {
          setDocuments((prev) => {
            const prevMap = new Map(prev.map((d) => [d.id, d]));
            let hasChanges = false;
            for (const cd of cloudDocs) {
              const existing = prevMap.get(cd.id);
              if (!existing) {
                prevMap.set(cd.id, cd);
                hasChanges = true;
              } else {
                const cloudTime = new Date(cd.updatedAt || (cd as any).syncedAt || cd.createdAt || 0).getTime();
                const localTime = new Date(existing.updatedAt || (existing as any).syncedAt || existing.createdAt || 0).getTime();
                if (cloudTime > localTime || (!existing.updatedAt && cd.updatedAt)) {
                  prevMap.set(cd.id, { ...existing, ...cd });
                  hasChanges = true;
                }
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
      unsubTransfers = subscribeToDeviceTransfers(currentUser.uid, (transfer: DeviceTransferRecord) => {
        if (transfer.source === 'mobile') {
          setDeviceToast({
            message: lang === 'fr' 
              ? `📱 Document reçu en direct depuis votre smartphone : "${transfer.docTitle}"`
              : `📱 Document received live from mobile: "${transfer.docTitle}"`,
            docId: transfer.docId,
          });
        }
      });
    });

    return () => {
      isMounted = false;
      if ((window as any).cancelIdleCallback) {
        (window as any).cancelIdleCallback(handle);
      } else {
        clearTimeout(handle);
      }
      if (unsubCloud) unsubCloud();
      if (unsubTransfers) unsubTransfers();
    };
  }, [currentUser?.uid, lang, loadingStage, isSplashDismissed]);

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

      // 1. Instantly save to local IndexedDB and queue for background sync
      const fullDoc = payload as SchoolDocument;
      await offlineStorageService.saveDocument(fullDoc);
      await offlineStorageService.enqueuePendingChange('create', fullDoc);

      // 2. Optimistic local state update
      setDocuments((prev) => {
        const idx = prev.findIndex((d) => d.id === fullDoc.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = fullDoc;
          return updated;
        }
        return [fullDoc, ...prev];
      });

      if (generateBlocknote) {
        setSelectedDocForBlocknote(fullDoc);
        setActiveTab('blocknote');
      }

      // 3. Attempt server sync in background if online
      try {
        const res = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const savedData = await res.json();
          const savedDoc = savedData.document || fullDoc;
          await offlineStorageService.removePendingChange(savedDoc.id);
          await offlineStorageService.saveDocument(savedDoc);
          setDocuments((prev) => prev.map((d) => (d.id === savedDoc.id ? savedDoc : d)));

          // Real-time Firestore sync across Phone & PC
          if (currentUser?.uid) {
            sendSingleDocumentToCloud(
              currentUser.uid, 
              savedDoc, 
              typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'pc'
            ).catch((cloudErr) => {
              console.warn('[Cloud Sync] Background firestore sync error:', cloudErr);
            });
          }
        }
      } catch (srvErr) {
        console.warn('[Offline Engine] Server update queued for background sync:', srvErr);
      }
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      // Immediate local deletion & offline queueing
      await offlineStorageService.deleteDocument(id);
      await offlineStorageService.enqueuePendingChange('delete', { id });

      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selectedDocForBlocknote?.id === id) {
        setSelectedDocForBlocknote(documents.find((d) => d.id !== id) || null);
      }
      if (selectedDocForSummary?.id === id) {
        setSelectedDocForSummary(documents.find((d) => d.id !== id) || null);
      }

      // Real-time Firestore deletion across Phone & PC
      if (currentUser?.uid) {
        deleteDocumentFromCloud(currentUser.uid, id).catch((cloudErr) => {
          console.warn('[Cloud Sync] Background firestore deletion error:', cloudErr);
        });
      }

      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await offlineStorageService.removePendingChange(id);
      }
    } catch (err) {
      console.warn('[Offline Engine] Deletion queued for background sync:', err);
    }
  };

  const handleUpdateDocumentGuide = async (docId: string, guide: BlocknoteGuide) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;

    const updated = { ...doc, blocknoteReproduction: guide, updatedAt: new Date().toISOString() };
    
    // Save locally & queue for sync
    await offlineStorageService.saveDocument(updated);
    await offlineStorageService.enqueuePendingChange('update', updated);

    setDocuments((prev) => prev.map((d) => (d.id === docId ? updated : d)));
    setSelectedDocForBlocknote(updated);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        await offlineStorageService.removePendingChange(docId);
      }
    } catch (err) {
      console.warn('[Offline Engine] Guide update queued for background sync:', err);
    }
  };

  const handleTogglePinDocument = async (id: string) => {
    let targetDoc: SchoolDocument | undefined;
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          targetDoc = { ...d, isPinned: !d.isPinned, updatedAt: new Date().toISOString() };
          return targetDoc;
        }
        return d;
      })
    );
    if (targetDoc) {
      try {
        await offlineStorageService.saveDocument(targetDoc);
        await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetDoc),
        });
      } catch (err) {
        console.warn('[Offline Engine] Pin update queued:', err);
      }
    }
  };

  const handleQuickCreatePinnedNote = async (newNoteData: Partial<SchoolDocument>) => {
    const newDoc: SchoolDocument = {
      id: `pinned-${Date.now()}`,
      title: newNoteData.title || (lang === 'fr' ? 'Note Rapide Épinglée' : 'Pinned Quick Note'),
      subject: newNoteData.subject || (lang === 'fr' ? 'Général' : 'General'),
      date: new Date().toISOString().split('T')[0],
      type: 'typed_note',
      tags: newNoteData.tags || ['Bac 2025', 'Épinglé'],
      content: newNoteData.content || '',
      summary: newNoteData.summary || newNoteData.content?.slice(0, 160) || '',
      isPinned: true,
      pinColor: newNoteData.pinColor || 'amber',
      pinPriority: newNoteData.pinPriority || 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDocuments((prev) => [newDoc, ...prev]);
    try {
      await offlineStorageService.saveDocument(newDoc);
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc),
      });
    } catch (e) {
      console.warn('Quick pinned note saved locally', e);
    }
    return newDoc;
  };

  const handleUpdateDocumentSummary = async (docId: string, summary: string, keyPoints: string[]) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;

    const updated = { ...doc, summary, keyPoints, updatedAt: new Date().toISOString() };

    // Save locally & queue for sync
    await offlineStorageService.saveDocument(updated);
    await offlineStorageService.enqueuePendingChange('update', updated);

    setDocuments((prev) => prev.map((d) => (d.id === docId ? updated : d)));
    setSelectedDocForSummary(updated);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        await offlineStorageService.removePendingChange(docId);
      }
    } catch (err) {
      console.warn('[Offline Engine] Summary update queued for background sync:', err);
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
    <DesktopLayoutWrapper lang={lang} activeTheme={preferences.theme}>
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
          onOpenCredits={() => setIsCreditsOpen(true)}
          onOpenBackup={() => setIsBackupOpen(true)}
          onOpenExportGuide={() => setIsExportGuideOpen(true)}
          onOpenCoach={() => setIsCoachOpen(true)}
          onOpenKeyboardShortcuts={() => setIsKeyboardShortcutsOpen(true)}
          onOpenOneDrive={() => setIsOneDriveOpen(true)}
          onOpenGoogleWorkspace={() => setIsGoogleWorkspaceOpen(true)}
          onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
          onOpenNotionExercises={(subj) => {
            if (subj) setSelectedNotionSubject(subj as any);
            setIsNotionWorkspaceOpen(true);
          }}
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
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onInstallPwa={handleInstallPwa}
          isPwaInstalled={isPwaInstalled}
          onSelectQuotesCategory={(cat, subcat = 'all') => {
            setQuotesInitialCategory(cat);
            setQuotesInitialSubcategory(subcat);
            setActiveTab('quotes');
          }}
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
          onOpenGoogleWorkspace={() => setIsGoogleWorkspaceOpen(true)}
          onOpenOneDrive={() => setIsOneDriveOpen(true)}
          onOpenKeyboardShortcuts={() => setIsKeyboardShortcutsOpen(true)}
          onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
          onOpenSyncManager={() => setIsSyncManagerOpen(true)}
          onOpenSoundHUD={toggleSoundHUD}
          onOpenLiteOptimizer={() => setIsLiteModalOpen(true)}
          isPwaInstalled={isPwaInstalled}
          currentUser={currentUser}
          lang={lang}
          onToggleLang={handleToggleLang}
          onToggleTheme={handleToggleQuickTheme}
          streakDays={realStreakDays}
          currentWorkspace={lang === 'fr' ? 'Espace Personnel' : 'Default Workspace'}
          menuPosition={preferences.menuPosition}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen || isFullScreenMenuOpen}
          onToggleSidebar={() => setIsFullScreenMenuOpen(true)}
          activeTheme={preferences.theme}
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

          {/* API / 503 error notification banner with retry feedback */}
          {apiErrorToast && (
            <div className="mb-5 p-3.5 bg-gradient-to-r from-amber-900 to-amber-950 border border-amber-700/60 text-white rounded-xl shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
                <span className="text-base">⚠️</span>
                <span>{apiErrorToast}</span>
              </div>
              <button
                onClick={() => setApiErrorToast(null)}
                className="p-1 hover:bg-amber-800/80 text-amber-300 hover:text-white rounded-md transition-colors cursor-pointer"
                title="Fermer"
              >
                ✕
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, scale: 0.998, filter: 'blur(2px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, scale: 0.998, filter: 'blur(2px)' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <Suspense fallback={
                <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
                  <div className="h-10 bg-slate-200 dark:bg-slate-800/60 rounded-2xl w-1/3"></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-32 bg-slate-200 dark:bg-slate-800/50 rounded-2xl"></div>
                    <div className="h-32 bg-slate-200 dark:bg-slate-800/50 rounded-2xl"></div>
                    <div className="h-32 bg-slate-200 dark:bg-slate-800/50 rounded-2xl"></div>
                  </div>
                  <div className="h-64 bg-slate-200 dark:bg-slate-800/40 rounded-3xl"></div>
                </div>
              }>
                {/* DegreeUnlocker PC Workstation Segmented Pill Hero (Exclusive for PC Desktop mode) */}
                {(isWorkstationMode || isTauriEnvironment || preferences.theme === 'hardcore') && (
                  <>
                    <LockInWorkstationHub
                      lang={lang}
                      activeSubject={activeSubjectFilter || (documents[0]?.subject)}
                      onLaunchRevision={() => {
                        if (activeTab !== 'flashcards') {
                          setActiveTab('flashcards');
                        }
                      }}
                      onNewNote={() => {
                        setDocumentToEdit(null);
                        setIsNoteEditorOpen(true);
                      }}
                    />
                    <PcWorkstationPillBanner
                      activeTab={activeTab}
                      selectedSubject={activeSubjectFilter || (documents[0]?.subject)}
                      lang={lang}
                      onLaunchRevision={() => {
                        if (activeTab !== 'flashcards') {
                          setActiveTab('flashcards');
                        }
                      }}
                      onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
                      onOpenSoundHUD={toggleSoundHUD}
                    />
                  </>
                )}

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
                  onOpenCredits={() => setIsCreditsOpen(true)}
                  onFilterSubject={(subj) => {
                    setActiveSubjectFilter(subj);
                  }}
                  onTogglePinDoc={handleTogglePinDocument}
                  onQuickCreatePinnedNote={handleQuickCreatePinnedNote}
                  onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
                  onOpenSyncManager={() => setIsSyncManagerOpen(true)}
                  onOpenSoundHUD={toggleSoundHUD}
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

              {/* Tab: School Textbooks & Exercises Library */}
              {activeTab === 'school_books' && (
                <SchoolBooksLibraryView
                  lang={lang}
                  activeTheme={preferences.theme}
                  onOpenDocInBlocknote={(title, subject, content) => {
                    const tempDoc: SchoolDocument = {
                      id: 'book_' + Date.now(),
                      title: title,
                      subject: subject,
                      type: 'typed_note',
                      content: content,
                      summary: `Extrait du manuel scolaire: ${title}`,
                      date: new Date().toLocaleDateString('fr-FR'),
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      tags: ['Manuel Scolaire', subject]
                    };
                    setSelectedDocForBlocknote(tempDoc);
                    setActiveTab('blocknote');
                  }}
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
                  initialCategory={quotesInitialCategory}
                  initialSubcategory={quotesInitialSubcategory}
                  onOpenCoach={() => setIsCoachOpen(true)}
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
                  activeTheme={preferences.theme}
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
                  onResetSeed={handleResetSeed}
                  onOpenGoogleWorkspace={() => setIsGoogleWorkspaceOpen(true)}
                  lang={lang}
                />
              )}

              {/* Tab 10.5: English Course (Priority Words & Notes) */}
              {activeTab === 'english' && (
                <EnglishCourseView
                  lang={lang}
                  activeTheme={preferences.theme}
                  onOpenInBlocknote={(title, subject, content) => {
                    const tempDoc: SchoolDocument = {
                      id: 'anglais_' + Date.now(),
                      title: title,
                      subject: subject,
                      type: 'typed_note',
                      content: content,
                      summary: `Fiche de cours Anglais: ${title}`,
                      date: new Date().toLocaleDateString('fr-FR'),
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      tags: ['Anglais', 'Vocabulaire', subject]
                    };
                    setSelectedDocForBlocknote(tempDoc);
                    setActiveTab('blocknote');
                  }}
                  onCreateFlashcard={(question, answer, subject) => {
                    setActiveTab('flashcards');
                  }}
                />
              )}

              {/* Tab 11: Comprehensive Spanish Course */}
              {activeTab === 'spanish' && (
                <SpanishCourseView
                  lang={lang}
                  activeTheme={preferences.theme}
                  onOpenInBlocknote={(title, subject, content) => {
                    const tempDoc: SchoolDocument = {
                      id: 'espagnol_' + Date.now(),
                      title: title,
                      subject: subject,
                      type: 'typed_note',
                      content: content,
                      summary: `Fiche de cours Espagnol: ${title}`,
                      date: new Date().toLocaleDateString('fr-FR'),
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      tags: ['Espagnol', subject]
                    };
                    setSelectedDocForBlocknote(tempDoc);
                    setActiveTab('blocknote');
                  }}
                />
              )}

              {/* Tab 12: Comprehensive German Course */}
              {activeTab === 'german' && (
                <GermanCourseView
                  lang={lang}
                  activeTheme={preferences.theme}
                  onOpenInBlocknote={(title, subject, content) => {
                    const tempDoc: SchoolDocument = {
                      id: 'allemand_' + Date.now(),
                      title: title,
                      subject: subject,
                      type: 'typed_note',
                      content: content,
                      summary: `Fiche de cours Allemand: ${title}`,
                      date: new Date().toLocaleDateString('fr-FR'),
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      tags: ['Allemand', subject]
                    };
                    setSelectedDocForBlocknote(tempDoc);
                    setActiveTab('blocknote');
                  }}
                />
              )}

              {/* Tab 13: Classical Languages (Latin & Greek) */}
              {activeTab === 'latin' && (
                <ClassicalLanguagesView
                  lang={lang}
                  activeTheme={preferences.theme}
                  onOpenInBlocknote={(title, subject, content) => {
                    const tempDoc: SchoolDocument = {
                      id: 'latin_' + Date.now(),
                      title: title,
                      subject: subject,
                      type: 'typed_note',
                      content: content,
                      summary: `Fiche de cours Humanités Anciennes: ${title}`,
                      date: new Date().toLocaleDateString('fr-FR'),
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      tags: ['Latin', 'Grec', 'Humanités', subject]
                    };
                    setSelectedDocForBlocknote(tempDoc);
                    setActiveTab('blocknote');
                  }}
                />
              )}

              {/* Tab 14: Interactive Tutorial & Quickstart Guide */}
              {activeTab === 'tutorial' && (
                <TutorialPageView
                  lang={lang}
                  activeTheme={preferences.theme}
                  onBack={() => setActiveTab('dashboard')}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {/* Tab 15: Methodology & Note-Taking Best Practices Guide */}
              {activeTab === 'tips' && (
                <NoteTakingTipsPageView
                  lang={lang}
                  activeTheme={preferences.theme}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onOpenDocInBlocknote={(title, subject, content) => {
                    const tempDoc: SchoolDocument = {
                      id: 'methodo_' + Date.now(),
                      title: title,
                      subject: subject,
                      type: 'typed_note',
                      content: content,
                      summary: `Guide Méthodologique de Prise de Notes: ${title}`,
                      date: new Date().toLocaleDateString('fr-FR'),
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      tags: ['Méthodologie', 'Prise de Notes', subject]
                    };
                    setSelectedDocForBlocknote(tempDoc);
                    setActiveTab('blocknote');
                  }}
                />
              )}

              {/* Tab 16: Privacy Policy & Data Sovereignty Page */}
              {activeTab === 'privacy' && (
                <PrivacyPolicyPageView
                  lang={lang}
                  activeTheme={preferences.theme}
                  onBack={() => setActiveTab('dashboard')}
                />
              )}
            </Suspense>
          </motion.div>
        </AnimatePresence>
        </main>

        {/* Mobile Persistent Bottom Navigation Bar */}
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenUpload={() => setIsPdfUploadOpen(true)}
          onOpenOneDrive={() => setIsOneDriveOpen(true)}
          onOpenMenu={() => setIsFullScreenMenuOpen(true)}
          onOpenExportGuide={() => setIsExportGuideOpen(true)}
          lang={lang}
          activeTheme={preferences.theme}
        />
      </div>

      <Suspense fallback={null}>
        {/* Socratic AI Study Coach Modal (Anti-Triche & Method) */}
        {isCoachOpen && (
          <SocraticCoachModal
            isOpen={isCoachOpen}
            onClose={() => setIsCoachOpen(false)}
            documents={documents}
            currentDocument={selectedDocForBlocknote || selectedDocForSummary}
            lang={lang}
          />
        )}

        {/* Photo Notes Scanner Modal (Camera / Phone Snap to Google Docs) */}
        {isPhotoScannerOpen && (
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
        )}

        {/* Account & Cross-Device Cloud Sync Modal (Phone ↔ Computer via Firebase) */}
        {isAuthModalOpen && (
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
            onOpenExportGuide={() => setIsExportGuideOpen(true)}
            lang={lang}
          />
        )}

        {/* Mobile Export Guide Modal (Phone Export & PC Transfer Hub) */}
        {isExportGuideOpen && (
          <MobileExportGuideModal
            isOpen={isExportGuideOpen}
            onClose={() => setIsExportGuideOpen(false)}
            documents={documents}
            onOpenBackup={() => setIsBackupOpen(true)}
            onOpenAuthSync={() => setIsAuthModalOpen(true)}
            lang={lang}
          />
        )}

        {/* Theme & Layout Preferences Manager Modal */}
        {isPreferencesOpen && (
          <ThemePreferencesModal
            isOpen={isPreferencesOpen}
            onClose={() => setIsPreferencesOpen(false)}
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onOpenBackup={() => setIsBackupOpen(true)}
            lang={lang}
          />
        )}

        {/* Study Progress Backup & Restore Modal (.JSON) */}
        {isBackupOpen && (
          <BackupProgressModal
            isOpen={isBackupOpen}
            onClose={() => setIsBackupOpen(false)}
            documents={documents}
            currentStreak={realStreakDays}
            activityDates={activityDates}
            preferences={preferences}
            onRestoreData={handleRestoreBackup}
            lang={lang}
          />
        )}

        {/* Quote Loading Modal (used during heavy loading/processing) */}
        {isQuoteLoadingOpen && (
          <QuoteLoadingModal
            isOpen={isQuoteLoadingOpen}
            title={quoteLoadingTitle}
            subtitle={quoteLoadingSubtitle}
            lang={lang}
          />
        )}

        {/* Study Playlists & Offline Ambient Sound Synthesizer Modal */}
        {isPlaylistsOpen && (
          <StudyPlaylistsModal
            isOpen={isPlaylistsOpen}
            onClose={() => setIsPlaylistsOpen(false)}
            lang={lang}
          />
        )}

        {/* Note Editor Modal */}
        {isNoteEditorOpen && (
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
        )}

        {/* PDF / Word / Excel / Google Doc Upload Modal */}
        {isPdfUploadOpen && (
          <PdfUploadModal
            isOpen={isPdfUploadOpen}
            onClose={() => setIsPdfUploadOpen(false)}
            onPdfProcessed={handlePdfProcessed}
            lang={lang}
          />
        )}

        {/* Tutorial & Walkthrough Modal */}
        {isTutorialOpen && (
          <TutorialModal
            isOpen={isTutorialOpen}
            onClose={() => setIsTutorialOpen(false)}
            onOpenSampleBlocknote={() => {
              setIsTutorialOpen(false);
              setActiveTab('blocknote');
            }}
            lang={lang}
          />
        )}

        {/* Local Storage File Browser Modal */}
        {isLocalStorageOpen && (
          <LocalStorageBrowserModal
            isOpen={isLocalStorageOpen}
            onClose={() => setIsLocalStorageOpen(false)}
            onSelectDoc={(docId) => {
              const found = documents.find((d) => d.id === docId);
              if (found) setSelectedDocForBlocknote(found);
              setActiveTab('blocknote');
              setIsLocalStorageOpen(false);
            }}
            lang={lang}
          />
        )}

        {/* Educational Videos Modal */}
        {isVideosOpen && (
          <EducationalVideosModal
            isOpen={isVideosOpen}
            onClose={() => setIsVideosOpen(false)}
            initialSubject={selectedSubjectForVideos}
            lang={lang}
          />
        )}

        {/* Note Taking Tips Modal */}
        {isTipsOpen && (
          <NoteTakingTipsModal
            isOpen={isTipsOpen}
            onClose={() => setIsTipsOpen(false)}
            lang={lang}
          />
        )}

        {/* Global Keyboard Shortcuts Manager Modal */}
        {isKeyboardShortcutsOpen && (
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
        )}

        {/* PDF Drawing & Highlighting Annotation Modal */}
        {isAnnotationOpen && (
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
        )}

        {/* Full-Screen Presentation Mode Modal */}
        {isPresentationOpen && (
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
        )}

        {/* Welcome Onboarding Modal for First Visit / Google Account Sync */}
        {isWelcomeModalOpen && (
          <WelcomeOnboardingModal
            isOpen={isWelcomeModalOpen}
            onClose={() => setIsWelcomeModalOpen(false)}
            onUserConnected={(user) => setCurrentUser(user)}
            lang={lang}
          />
        )}

        {/* Google Workspace Hub (Drive, Docs, Tasks) */}
        {isGoogleWorkspaceOpen && (
          <GoogleWorkspaceModal
            isOpen={isGoogleWorkspaceOpen}
            onClose={() => setIsGoogleWorkspaceOpen(false)}
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            documents={documents}
            onOpenDriveBrowser={() => setIsGoogleDriveBrowserOpen(true)}
            onImportDoc={async (newDoc) => {
              const created: SchoolDocument = {
                id: newDoc.id || `doc-${Date.now()}`,
                title: newDoc.title || 'Fichier Google Drive',
                subject: newDoc.subject || 'Google Drive',
                summary: newDoc.summary || '',
                content: newDoc.content || '',
                type: newDoc.type || 'google_doc',
                tags: newDoc.tags || ['Google Drive', 'Workspace'],
                date: newDoc.date || new Date().toISOString().split('T')[0],
                pdfDataUrl: newDoc.pdfDataUrl,
                fileName: newDoc.fileName,
                fileSize: newDoc.fileSize,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              setDocuments((prev) => [created, ...prev]);
              setSelectedDocForBlocknote(created);
              setSelectedDocForSummary(created);

              try {
                await fetch('/api/documents', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(created),
                });
              } catch (e) {
                console.warn('Could not persist imported Drive document to server API:', e);
              }
            }}
            lang={lang}
          />
        )}

        {/* Dedicated Google Drive Browser & Ingestion Modal */}
        {isGoogleDriveBrowserOpen && (
          <GoogleDriveBrowser
            isOpen={isGoogleDriveBrowserOpen}
            onClose={() => setIsGoogleDriveBrowserOpen(false)}
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onIngestDocument={async (newDoc) => {
              const created: SchoolDocument = {
                id: newDoc.id || `doc-${Date.now()}`,
                title: newDoc.title || 'Fichier Google Drive',
                subject: newDoc.subject || 'Google Drive',
                summary: newDoc.summary || '',
                content: newDoc.content || '',
                type: newDoc.type || 'google_doc',
                tags: newDoc.tags || ['Google Drive', 'Workspace'],
                date: newDoc.date || new Date().toISOString().split('T')[0],
                pdfDataUrl: newDoc.pdfDataUrl,
                fileName: newDoc.fileName,
                fileSize: newDoc.fileSize,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              setDocuments((prev) => [created, ...prev]);
              setSelectedDocForBlocknote(created);
              setSelectedDocForSummary(created);

              try {
                await fetch('/api/documents', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(created),
                });
              } catch (e) {
                console.warn('Could not persist ingested Drive document to server API:', e);
              }
            }}
            lang={lang}
          />
        )}

        {/* OneDrive & Cloud Sync Modal */}
        {isOneDriveOpen && (
          <OneDriveSyncModal
            isOpen={isOneDriveOpen}
            onClose={() => setIsOneDriveOpen(false)}
            currentUser={currentUser}
            documents={documents}
            onSyncComplete={(synced) => setDocuments(synced)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            lang={lang}
          />
        )}

        {/* Global PWA Auto-Update Manager Toast */}
        <AppUpdateManager lang={lang} />

        {/* Public Privacy Policy & Google Compliance Modal */}
        {isPrivacyModalOpen && (
          <PrivacyPolicyModal
            isOpen={isPrivacyModalOpen}
            onClose={() => setIsPrivacyModalOpen(false)}
            lang={lang}
          />
        )}

        {/* Cyber Focus & Ambient Sound Studio HUD */}
        {isSoundHUDOpen && (
          <Suspense fallback={null}>
            <CyberSoundscapeHUD
              lang={lang}
              onClose={() => setIsSoundHUDOpen(false)}
              isFloating={true}
            />
          </Suspense>
        )}

        {/* Credits & Show Creators Modal */}
        {isCreditsOpen && (
          <CreditsModal
            isOpen={isCreditsOpen}
            onClose={() => setIsCreditsOpen(false)}
            lang={lang}
          />
        )}

        {/* PWA Installation & Launch Guide Modal */}
        {isInstallGuideOpen && (
          <InstallGuideModal
            isOpen={isInstallGuideOpen}
            onClose={() => setIsInstallGuideOpen(false)}
            lang={lang}
            deferredPrompt={deferredPrompt}
            onInstallSuccess={() => setIsPwaInstalled(true)}
            isPwaInstalled={isPwaInstalled}
          />
        )}

        {/* Offline Sync Manager & Cloud Queue Panel */}
        {isSyncManagerOpen && (
          <OfflineSyncManager
            isOpen={isSyncManagerOpen}
            onClose={() => setIsSyncManagerOpen(false)}
            lang={lang}
            activeTheme={preferences.theme}
          />
        )}

        {/* Degree Unlocker Lite - Performance Optimization & Functional Systems Hub */}
        {isLiteModalOpen && (
          <LiteOptimizationModal
            isOpen={isLiteModalOpen}
            onClose={() => setIsLiteModalOpen(false)}
            lang={lang}
          />
        )}

        {/* Independent Notion Subject Workspace Modal */}
        {isNotionWorkspaceOpen && (
          <NotionSubjectWorkspaceModal
            isOpen={isNotionWorkspaceOpen}
            onClose={() => setIsNotionWorkspaceOpen(false)}
            initialSubject={selectedNotionSubject}
            lang={lang}
            activeTheme={preferences.theme}
            onOpenInBlocknote={(title, subject, content) => {
              const newDoc: SchoolDocument = {
                id: `doc-${Date.now()}`,
                title,
                subject,
                summary: '',
                content,
                type: 'blocknote',
                tags: [subject, 'Notion', 'Exercices'],
                date: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              setDocuments((prev) => [newDoc, ...prev]);
              setSelectedDocForBlocknote(newDoc);
              setSelectedDocForSummary(newDoc);
              setActiveTab('blocknote');
              setIsNotionWorkspaceOpen(false);
            }}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setIsNotionWorkspaceOpen(false);
            }}
          />
        )}

        {/* Grand Full-Screen Command Deck Overlay (Triggered by Hamburger / Menu Button) */}
        {isFullScreenMenuOpen && (
          <FullScreenCommandDeckModal
            isOpen={isFullScreenMenuOpen}
            onClose={() => setIsFullScreenMenuOpen(false)}
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              setIsFullScreenMenuOpen(false);
            }}
            onOpenNotionWorkspace={(subjKey) => {
              if (subjKey) setSelectedNotionSubject(subjKey as any);
              setIsNotionWorkspaceOpen(true);
              setIsFullScreenMenuOpen(false);
            }}
            onOpenNewNote={() => {
              setDocumentToEdit(null);
              setIsNoteEditorOpen(true);
              setIsFullScreenMenuOpen(false);
            }}
            onOpenUpload={() => {
              setIsPdfUploadOpen(true);
              setIsFullScreenMenuOpen(false);
            }}
            onOpenSync={() => {
              setIsAuthModalOpen(true);
              setIsFullScreenMenuOpen(false);
            }}
            lang={lang}
            activeTheme={preferences.theme}
            onSelectTheme={(theme) => handleUpdatePreferences({ theme })}
            keyboardLayout={appKeyboardLayout}
            onToggleKeyboardLayout={() => setAppKeyboardLayout((prev) => prev === 'azerty' ? 'qwerty' : 'azerty')}
          />
        )}
      </Suspense>

      {/* Floating PWA Installation Banner */}
      {deferredPrompt && (
        <Suspense fallback={null}>
          <InstallAppBanner
            deferredPrompt={deferredPrompt}
            lang={lang}
            onInstallSuccess={() => {
              setIsPwaInstalled(true);
              setDeferredPrompt(null);
            }}
            onDismiss={() => setDeferredPrompt(null)}
          />
        </Suspense>
      )}

      {/* Offline & IndexedDB Status Indicator */}
      <Suspense fallback={null}>
        <OfflineIndicator 
          lang={lang} 
          isUsingOfflineDB={isUsingOfflineDB} 
          onOpenSyncManager={() => setIsSyncManagerOpen(true)}
        />
      </Suspense>
      </div>
    </DesktopLayoutWrapper>
  );
}

