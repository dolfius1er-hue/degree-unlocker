import { 
  SchoolDocument, 
  Flashcard, 
  SavedVocabularyItem, 
  QuizScoreRecord, 
  PendingSyncItem,
  SyncStatusReport,
  SyncOperationAction,
  SyncItemType,
  SyncItemStatus
} from '../types';

const DB_NAME = 'DegreeUnlocker_OfflineDB';
const DB_VERSION = 2;

export const STORES = {
  DOCUMENTS: 'documents',
  FLASHCARDS: 'flashcards',
  VOCABULARY: 'vocabulary',
  QUIZ_RESULTS: 'quiz_results',
  METADATA: 'metadata',
  SYNC_QUEUE: 'sync_queue',
} as const;

type SyncListener = (status: SyncStatusReport) => void;

class OfflineStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isSyncing = false;
  private lastSyncTime: number | null = null;
  private listeners: Set<SyncListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.dbPromise = this.initDB();
      
      // Auto-sync pending offline changes whenever internet reconnects
      window.addEventListener('online', () => {
        console.log('[Offline Engine] Network reconnected! Flushing pending sync queue...');
        this.notifyListeners();
        this.processSyncQueue();
      });

      window.addEventListener('offline', () => {
        console.log('[Offline Engine] Network disconnected! Switched to offline mode.');
        this.notifyListeners();
      });

      // Periodic queue check every 30 seconds
      setInterval(() => {
        if (navigator.onLine) {
          this.processSyncQueue();
        }
      }, 30000);
    }
  }

  public subscribeSyncStatus(listener: SyncListener): () => void {
    this.listeners.add(listener);
    // Initial emit
    this.getSyncStatus().then(status => listener(status));
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async notifyListeners(): Promise<void> {
    if (this.listeners.size === 0) return;
    try {
      const status = await this.getSyncStatus();
      this.listeners.forEach(fn => fn(status));
    } catch (err) {
      console.warn('[Offline Engine] Error notifying sync listeners:', err);
    }
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[IndexedDB] Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Documents store
        if (!db.objectStoreNames.contains(STORES.DOCUMENTS)) {
          const docStore = db.createObjectStore(STORES.DOCUMENTS, { keyPath: 'id' });
          docStore.createIndex('subject', 'subject', { unique: false });
          docStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Flashcards store
        if (!db.objectStoreNames.contains(STORES.FLASHCARDS)) {
          db.createObjectStore(STORES.FLASHCARDS, { keyPath: 'id' });
        }

        // Vocabulary store
        if (!db.objectStoreNames.contains(STORES.VOCABULARY)) {
          db.createObjectStore(STORES.VOCABULARY, { keyPath: 'id' });
        }

        // Quiz results store
        if (!db.objectStoreNames.contains(STORES.QUIZ_RESULTS)) {
          db.createObjectStore(STORES.QUIZ_RESULTS, { keyPath: 'id' });
        }

        // Metadata store
        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
        }

        // Sync Queue store for offline document edits & background queueing
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
        }
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        throw new Error('IndexedDB is not supported in this environment');
      }
      this.dbPromise = this.initDB();
    }
    return this.dbPromise;
  }

  // -------------------------------------------------------------
  // DOCUMENT OPERATIONS
  // -------------------------------------------------------------

  public async saveDocument(doc: SchoolDocument): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.DOCUMENTS, 'readwrite');
        const store = tx.objectStore(STORES.DOCUMENTS);
        const req = store.put(doc);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Error saving document:', err);
    }
  }

  public async saveAllDocuments(docs: SchoolDocument[]): Promise<void> {
    if (!docs || docs.length === 0) return;
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([STORES.DOCUMENTS, STORES.METADATA], 'readwrite');
        const docStore = tx.objectStore(STORES.DOCUMENTS);
        const metaStore = tx.objectStore(STORES.METADATA);

        for (const doc of docs) {
          docStore.put(doc);
        }

        metaStore.put({ key: 'last_docs_sync', timestamp: Date.now(), count: docs.length });

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Error saving all documents:', err);
    }
  }

  public async getAllDocuments(): Promise<SchoolDocument[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.DOCUMENTS, 'readonly');
        const store = tx.objectStore(STORES.DOCUMENTS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Error getting all documents:', err);
      return [];
    }
  }

  public async getDocumentById(id: string): Promise<SchoolDocument | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.DOCUMENTS, 'readonly');
        const store = tx.objectStore(STORES.DOCUMENTS);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Error getting document:', err);
      return null;
    }
  }

  public async deleteDocument(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.DOCUMENTS, 'readwrite');
        const store = tx.objectStore(STORES.DOCUMENTS);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Error deleting document:', err);
    }
  }

  // -------------------------------------------------------------
  // FLASHCARDS & VOCABULARY OPERATIONS
  // -------------------------------------------------------------

  public async saveAllFlashcards(flashcards: Flashcard[]): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.FLASHCARDS, 'readwrite');
        const store = tx.objectStore(STORES.FLASHCARDS);
        for (const fc of flashcards) {
          store.put(fc);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Error saving flashcards:', err);
    }
  }

  public async getAllFlashcards(): Promise<Flashcard[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.FLASHCARDS, 'readonly');
        const store = tx.objectStore(STORES.FLASHCARDS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Error fetching flashcards:', err);
      return [];
    }
  }

  public async saveAllVocabulary(items: SavedVocabularyItem[]): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.VOCABULARY, 'readwrite');
        const store = tx.objectStore(STORES.VOCABULARY);
        for (const item of items) {
          store.put(item);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Error saving vocabulary:', err);
    }
  }

  public async getAllVocabulary(): Promise<SavedVocabularyItem[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.VOCABULARY, 'readonly');
        const store = tx.objectStore(STORES.VOCABULARY);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Error fetching vocabulary:', err);
      return [];
    }
  }

  // -------------------------------------------------------------
  // QUIZ RESULTS PERSISTENCE
  // -------------------------------------------------------------

  public async saveQuizResult(record: QuizScoreRecord): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.QUIZ_RESULTS, 'readwrite');
        const store = tx.objectStore(STORES.QUIZ_RESULTS);
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Error saving quiz result:', err);
    }
  }

  public async getAllQuizResults(): Promise<QuizScoreRecord[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.QUIZ_RESULTS, 'readonly');
        const store = tx.objectStore(STORES.QUIZ_RESULTS);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result || []) as QuizScoreRecord[];
          // sort descending by timestamp
          list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Error fetching quiz results:', err);
      return [];
    }
  }

  // -------------------------------------------------------------
  // METADATA & OFFLINE SYNC TIMESTAMPS
  // -------------------------------------------------------------

  public async setMetaData(key: string, value: any): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.METADATA, 'readwrite');
        const store = tx.objectStore(STORES.METADATA);
        const req = store.put({ key, value, updatedAt: Date.now() });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Error setting metadata:', err);
    }
  }

  public async getMetaData(key: string): Promise<any> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.METADATA, 'readonly');
        const store = tx.objectStore(STORES.METADATA);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result?.value ?? null);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Error getting metadata:', err);
      return null;
    }
  }

  // -------------------------------------------------------------
  // BACKGROUND OFFLINE QUEUE & SYNC ENGINE
  // -------------------------------------------------------------

  public async enqueuePendingChange(
    action: SyncOperationAction, 
    data: any,
    itemType: SyncItemType = 'document',
    title?: string
  ): Promise<PendingSyncItem> {
    const id = data?.id || `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const displayTitle = title || data?.title || data?.subject || `${itemType.toUpperCase()} #${id.substring(0, 6)}`;

    const item: PendingSyncItem = {
      id,
      action,
      itemType,
      title: displayTitle,
      data,
      timestamp: Date.now(),
      attempts: 0,
      status: 'pending'
    };

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
        const store = tx.objectStore(STORES.SYNC_QUEUE);
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      this.notifyListeners();
    } catch (err) {
      console.warn('[Offline Engine] Could not queue pending change:', err);
    }
    return item;
  }

  public async getPendingQueue(): Promise<PendingSyncItem[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly');
        const store = tx.objectStore(STORES.SYNC_QUEUE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[Offline Engine] Error getting pending sync queue:', err);
      return [];
    }
  }

  public async getSyncStatus(): Promise<SyncStatusReport> {
    const queue = await this.getPendingQueue();
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    let pendingCount = 0;
    let failedCount = 0;
    let syncedCount = 0;

    for (const item of queue) {
      if (item.status === 'failed') failedCount++;
      else if (item.status === 'synced') syncedCount++;
      else pendingCount++;
    }

    return {
      isSyncing: this.isSyncing,
      isOnline,
      pendingCount,
      failedCount,
      syncedCount,
      totalCount: queue.length,
      lastSyncTime: this.lastSyncTime,
      queue: queue.sort((a, b) => b.timestamp - a.timestamp)
    };
  }

  public async removePendingChange(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
        const store = tx.objectStore(STORES.SYNC_QUEUE);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      this.notifyListeners();
    } catch (err) {
      console.warn('[Offline Engine] Error removing pending change:', err);
    }
  }

  public async clearSyncedItems(): Promise<void> {
    try {
      const queue = await this.getPendingQueue();
      const db = await this.getDB();
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_QUEUE);

      for (const item of queue) {
        if (item.status === 'synced') {
          store.delete(item.id);
        }
      }
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      this.notifyListeners();
    } catch (err) {
      console.warn('[Offline Engine] Error clearing synced items:', err);
    }
  }

  public async updateItemStatus(id: string, updates: Partial<PendingSyncItem>): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      const req = store.get(id);
      
      req.onsuccess = () => {
        if (req.result) {
          const updated = { ...req.result, ...updates };
          store.put(updated);
        }
      };
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      this.notifyListeners();
    } catch (err) {
      console.warn('[Offline Engine] Error updating item status:', err);
    }
  }

  private async executeSyncOperation(item: PendingSyncItem): Promise<{ success: boolean; error?: string }> {
    try {
      const { itemType, action, data, id } = item;
      const targetId = data?.id || id;

      if (itemType === 'document' || itemType === 'note') {
        if (action === 'delete') {
          const res = await fetch(`/api/documents/${targetId}`, { method: 'DELETE' });
          if (!res.ok && res.status !== 404) {
            return { success: false, error: `HTTP ${res.status}` };
          }
        } else {
          const res = await fetch('/api/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data || { id: targetId, title: item.title }),
          });
          if (!res.ok && res.status !== 201) {
            return { success: false, error: `HTTP ${res.status}` };
          }
        }
      } else if (itemType === 'flashcard') {
        if (action === 'delete') {
          const res = await fetch(`/api/flashcards/${targetId}`, { method: 'DELETE' });
          if (!res.ok && res.status !== 404) {
            return { success: false, error: `HTTP ${res.status}` };
          }
        } else {
          const res = await fetch('/api/flashcards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          if (!res.ok && res.status !== 201) {
            return { success: false, error: `HTTP ${res.status}` };
          }
        }
      } else if (itemType === 'vocabulary') {
        if (action === 'delete') {
          const res = await fetch(`/api/vocabulary/${targetId}`, { method: 'DELETE' });
          if (!res.ok && res.status !== 404) {
            return { success: false, error: `HTTP ${res.status}` };
          }
        } else {
          const res = await fetch('/api/vocabulary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          if (!res.ok && res.status !== 201) {
            return { success: false, error: `HTTP ${res.status}` };
          }
        }
      } else if (itemType === 'quiz_score') {
        const res = await fetch('/api/quiz/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          return { success: false, error: `HTTP ${res.status}` };
        }
      } else if (itemType === 'study_goal') {
        const res = await fetch('/api/streaks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          return { success: false, error: `HTTP ${res.status}` };
        }
      } else if (itemType === 'preferences') {
        const res = await fetch('/api/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          return { success: false, error: `HTTP ${res.status}` };
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network unreachable' };
    }
  }

  public async retryItem(id: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      const item: PendingSyncItem | null = await new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly');
        const store = tx.objectStore(STORES.SYNC_QUEUE);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });

      if (!item) return false;

      await this.updateItemStatus(id, { status: 'syncing', attempts: (item.attempts || 0) + 1 });
      const result = await this.executeSyncOperation(item);

      if (result.success) {
        await this.updateItemStatus(id, { status: 'synced', lastError: undefined });
        this.lastSyncTime = Date.now();
        return true;
      } else {
        await this.updateItemStatus(id, { status: 'failed', lastError: result.error });
        return false;
      }
    } catch (err) {
      console.warn('[Offline Engine] Single item retry error:', err);
      return false;
    } finally {
      this.notifyListeners();
    }
  }

  public async processSyncQueue(): Promise<number> {
    if (this.isSyncing) return 0;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.notifyListeners();
      return 0;
    }

    this.isSyncing = true;
    this.notifyListeners();
    let syncedCount = 0;

    try {
      const queue = await this.getPendingQueue();
      const toProcess = queue.filter(q => q.status !== 'synced');

      if (toProcess.length === 0) {
        this.isSyncing = false;
        this.notifyListeners();
        return 0;
      }

      console.log(`[Offline Engine] Processing ${toProcess.length} pending offline operations...`);

      for (const item of toProcess) {
        await this.updateItemStatus(item.id, { status: 'syncing', attempts: (item.attempts || 0) + 1 });
        const result = await this.executeSyncOperation(item);

        if (result.success) {
          await this.updateItemStatus(item.id, { status: 'synced', lastError: undefined });
          syncedCount++;
        } else {
          await this.updateItemStatus(item.id, { status: 'failed', lastError: result.error });
        }
      }

      if (syncedCount > 0) {
        this.lastSyncTime = Date.now();
        console.log(`[Offline Engine] Successfully synced ${syncedCount} queued operations.`);
      }
    } catch (err) {
      console.warn('[Offline Engine] Sync queue processing error:', err);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
    return syncedCount;
  }

  public async simulateOfflineChange(type: SyncItemType = 'document'): Promise<PendingSyncItem> {
    const titles: Record<SyncItemType, string> = {
      document: 'Fiche de Révision - Équations Différentielles (Terminale)',
      flashcard: 'Flashcard SRS - Vocabulaire Espagnol C1',
      quiz_score: 'Score Quiz - Physique Quantique (18/20)',
      study_goal: 'Objectif Quotidien - 60 min de Concentration Validé',
      note: 'Mémo Prioritaire - Schéma de Synthèse SVT',
      preferences: 'Mise à jour Préférences Interface & Thème Midnight',
      vocabulary: 'Terme Bilingue - Epistemology / Épistémologie'
    };

    return await this.enqueuePendingChange(
      'update',
      { id: `demo-${Date.now()}`, title: titles[type], updatedAt: new Date().toISOString() },
      type,
      titles[type]
    );
  }

  public async getStorageDiagnostics(): Promise<{
    docCount: number;
    flashcardCount: number;
    vocabularyCount: number;
    quizCount: number;
    queueCount: number;
    estimatedSizeKb: number;
  }> {
    try {
      const docs = await this.getAllDocuments();
      const flashcards = await this.getAllFlashcards();
      const vocab = await this.getAllVocabulary();
      const quizzes = await this.getAllQuizResults();
      const queue = await this.getPendingQueue();

      const totalChars = 
        JSON.stringify(docs).length + 
        JSON.stringify(flashcards).length + 
        JSON.stringify(vocab).length + 
        JSON.stringify(quizzes).length +
        JSON.stringify(queue).length;

      return {
        docCount: docs.length,
        flashcardCount: flashcards.length,
        vocabularyCount: vocab.length,
        quizCount: quizzes.length,
        queueCount: queue.length,
        estimatedSizeKb: Math.round((totalChars * 2) / 1024)
      };
    } catch (err) {
      console.warn('[Offline Engine] Diagnostics error:', err);
      return {
        docCount: 0,
        flashcardCount: 0,
        vocabularyCount: 0,
        quizCount: 0,
        queueCount: 0,
        estimatedSizeKb: 0
      };
    }
  }
}

export const offlineStorageService = new OfflineStorageService();

