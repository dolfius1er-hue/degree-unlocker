import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously,
  signOut as fbSignOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  onSnapshot,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SchoolDocument, Flashcard, UIPreferences } from '../types';

// Initialize Firebase App singleton safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId) 
  : getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in with Google (Cross-device sync Phone <-> Computer)
 */
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Record user profile in Firestore
    if (result.user) {
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || 'Étudiant',
        photoURL: result.user.photoURL || '',
        lastLoginAt: serverTimestamp(),
      }, { merge: true });
    }
    return result.user;
  } catch (err: any) {
    console.warn('Google popup sign-in note, trying anonymous or fallback:', err);
    // If popup was blocked or iframe restriction occurred, offer anonymous session
    const anonResult = await signInAnonymously(auth);
    return anonResult.user;
  }
}

/**
 * Sign in anonymously for private device sync
 */
export async function loginAnonymously(): Promise<User> {
  const res = await signInAnonymously(auth);
  return res.user;
}

/**
 * Sign out
 */
export async function logoutUser(): Promise<void> {
  await fbSignOut(auth);
}

/**
 * Sync local documents to Firestore for cross-device access
 */
export async function syncDocumentsToCloud(userId: string, documents: SchoolDocument[]): Promise<number> {
  if (!userId || !documents.length) return 0;
  let synced = 0;
  for (const document of documents) {
    try {
      const docRef = doc(db, 'users', userId, 'documents', document.id);
      await setDoc(docRef, {
        ...document,
        syncedAt: new Date().toISOString(),
      }, { merge: true });
      synced++;
    } catch (e) {
      console.error(`Failed to sync doc ${document.id} to cloud:`, e);
    }
  }
  return synced;
}

/**
 * Fetch documents stored in Firestore for this user
 */
export async function loadDocumentsFromCloud(userId: string): Promise<SchoolDocument[]> {
  if (!userId) return [];
  try {
    const colRef = collection(db, 'users', userId, 'documents');
    const snapshot = await getDocs(colRef);
    const docs: SchoolDocument[] = [];
    snapshot.forEach((snap) => {
      docs.push(snap.data() as SchoolDocument);
    });
    return docs;
  } catch (err) {
    console.error('Failed to load cloud documents:', err);
    return [];
  }
}

/**
 * Sync flashcards to Firestore
 */
export async function syncFlashcardsToCloud(userId: string, flashcards: Flashcard[]): Promise<number> {
  if (!userId || !flashcards.length) return 0;
  let synced = 0;
  for (const card of flashcards) {
    try {
      const cardRef = doc(db, 'users', userId, 'flashcards', card.id);
      await setDoc(cardRef, {
        ...card,
        syncedAt: new Date().toISOString(),
      }, { merge: true });
      synced++;
    } catch (e) {
      console.error(`Failed to sync card ${card.id} to cloud:`, e);
    }
  }
  return synced;
}

/**
 * Load cloud flashcards
 */
export async function loadFlashcardsFromCloud(userId: string): Promise<Flashcard[]> {
  if (!userId) return [];
  try {
    const colRef = collection(db, 'users', userId, 'flashcards');
    const snapshot = await getDocs(colRef);
    const cards: Flashcard[] = [];
    snapshot.forEach((snap) => {
      cards.push(snap.data() as Flashcard);
    });
    return cards;
  } catch (err) {
    console.error('Failed to load cloud flashcards:', err);
    return [];
  }
}

/**
 * Save user preferences to cloud
 */
export async function syncPreferencesToCloud(userId: string, preferences: UIPreferences): Promise<void> {
  if (!userId) return;
  try {
    const prefRef = doc(db, 'users', userId, 'settings', 'preferences');
    await setDoc(prefRef, {
      ...preferences,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (e) {
    console.error('Failed to sync preferences:', e);
  }
}

/**
 * Load user preferences from cloud
 */
export async function loadPreferencesFromCloud(userId: string): Promise<UIPreferences | null> {
  if (!userId) return null;
  try {
    const prefRef = doc(db, 'users', userId, 'settings', 'preferences');
    const snap = await getDoc(prefRef);
    if (snap.exists()) {
      return snap.data() as UIPreferences;
    }
  } catch (e) {
    console.error('Failed to load cloud preferences:', e);
  }
  return null;
}

/**
 * Real-time listener for cloud documents across Phone & PC.
 * Whenever a photo note is taken on phone or a doc edited on PC,
 * both devices update automatically in under 1 second.
 */
export function subscribeToCloudDocuments(
  userId: string,
  onDocsUpdated: (docs: SchoolDocument[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  if (!userId) {
    return () => {};
  }
  const colRef = collection(db, 'users', userId, 'documents');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const docs: SchoolDocument[] = [];
      snapshot.forEach((snap) => {
        docs.push(snap.data() as SchoolDocument);
      });
      // Sort with latest first
      docs.sort((a, b) => {
        const dateA = a.updatedAt || a.createdAt || a.date || '';
        const dateB = b.updatedAt || b.createdAt || b.date || '';
        return dateB.localeCompare(dateA);
      });
      onDocsUpdated(docs);
    },
    (err) => {
      console.warn('Real-time snapshot error on documents:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save / Push a single document to Firestore cloud (instant transfer)
 */
export async function sendSingleDocumentToCloud(
  userId: string,
  document: SchoolDocument,
  sourceDevice: 'mobile' | 'pc' = 'pc'
): Promise<void> {
  if (!userId || !document?.id) return;
  const docRef = doc(db, 'users', userId, 'documents', document.id);
  const payload = {
    ...document,
    syncedAt: new Date().toISOString(),
    lastTransferredFrom: sourceDevice,
  };
  await setDoc(docRef, payload, { merge: true });

  // Post real-time transfer notification
  await notifyDeviceTransfer(userId, {
    docId: document.id,
    docTitle: document.title,
    source: sourceDevice,
  });
}

export interface DeviceTransferRecord {
  docId: string;
  docTitle: string;
  source: 'mobile' | 'pc';
  timestamp?: string;
}

/**
 * Notify cross-device transfer event
 */
export async function notifyDeviceTransfer(
  userId: string,
  data: DeviceTransferRecord
): Promise<void> {
  if (!userId) return;
  try {
    const eventRef = doc(db, 'users', userId, 'transfers', 'latest');
    await setDoc(eventRef, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to post transfer event:', err);
  }
}

/**
 * Listen to cross-device transfer events (e.g. PC receives alert when phone takes a photo)
 */
export function subscribeToDeviceTransfers(
  userId: string,
  onTransfer: (data: DeviceTransferRecord) => void
): Unsubscribe {
  if (!userId) return () => {};
  const eventRef = doc(db, 'users', userId, 'transfers', 'latest');
  return onSnapshot(eventRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data() as any;
      if (data && data.docTitle && data.source) {
        onTransfer(data);
      }
    }
  });
}

/**
 * Create a quick 6-digit pairing code to link Smartphone to PC without passwords
 */
export async function createPairingCode(userId: string): Promise<string> {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const code = `DG-${randomNum}`;
  try {
    const pairRef = doc(db, 'pairings', code);
    await setDoc(pairRef, {
      userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
    });
    return code;
  } catch (e) {
    console.error('Error creating pairing code:', e);
    return `DG-${randomNum}`;
  }
}

/**
 * Resolve a pairing code on Smartphone to get the PC's linked user session
 */
export async function resolvePairingCode(code: string): Promise<string | null> {
  try {
    const cleanCode = code.trim().toUpperCase();
    const pairRef = doc(db, 'pairings', cleanCode);
    const snap = await getDoc(pairRef);
    if (snap.exists()) {
      const data = snap.data() as any;
      if (data && data.userId) {
        return data.userId;
      }
    }
  } catch (e) {
    console.error('Error resolving pairing code:', e);
  }
  return null;
}

/**
 * Convenience aliases for Firestore sync
 */
export const syncDocumentsToFirestore = syncDocumentsToCloud;
export const fetchDocumentsFromFirestore = loadDocumentsFromCloud;
export const onAuthChange = (cb: (user: User | null) => void) => onAuthStateChanged(auth, cb);
