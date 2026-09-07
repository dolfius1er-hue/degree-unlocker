import { SchoolDocument, Flashcard, SavedVocabularyItem, QuizScoreRecord } from '../types';

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

export interface PendingSyncItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

class OfflineStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isSyncing = false;

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.dbPromise = this.initDB();
      
      // Auto-sync pending offline changes whenever internet reconnects or periodically
      window.addEventListener('online', () => {
        console.log('[Offline Engine] Network reconnected! Flushing pending sync queue...');
        this.processSyncQueue();
      });

      // Periodic queue check every 30 seconds
      setInterval(() => {
        if (navigator.onLine) {
          this.processSyncQueue();
        }
      }, 30000);
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

  public async enqueuePendingChange(action: 'create' | 'update' | 'delete', doc: Partial<SchoolDocument> & { id: string }): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
        const store = tx.objectStore(STORES.SYNC_QUEUE);
        const item: PendingSyncItem = {
          id: doc.id,
          action,
          data: doc,
          timestamp: Date.now(),
        };
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[Offline Engine] Could not queue pending change:', err);
    }
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

  public async removePendingChange(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
        const store = tx.objectStore(STORES.SYNC_QUEUE);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[Offline Engine] Error removing pending change:', err);
    }
  }

  public async processSyncQueue(): Promise<number> {
    if (this.isSyncing || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      return 0;
    }
    this.isSyncing = true;
    let syncedCount = 0;

    try {
      const queue = await this.getPendingQueue();
      if (queue.length === 0) {
        this.isSyncing = false;
        return 0;
      }

      console.log(`[Offline Engine] Processing ${queue.length} pending offline edits...`);

      for (const item of queue) {
        try {
          if (item.action === 'delete') {
            await fetch(`/api/documents/${item.id}`, { method: 'DELETE' });
          } else if (item.action === 'create' || item.action === 'update') {
            await fetch('/api/documents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.data),
            });
          }
          await this.removePendingChange(item.id);
          syncedCount++;
        } catch (itemErr) {
          console.warn(`[Offline Engine] Failed to sync item ${item.id}, will retry later:`, itemErr);
        }
      }

      if (syncedCount > 0) {
        console.log(`[Offline Engine] Successfully synced ${syncedCount} queued documents.`);
      }
    } catch (err) {
      console.warn('[Offline Engine] Sync queue processing error:', err);
    } finally {
      this.isSyncing = false;
    }
    return syncedCount;
  }
}

export const offlineStorageService = new OfflineStorageService();
