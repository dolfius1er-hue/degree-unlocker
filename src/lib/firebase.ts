import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut, 
  onAuthStateChanged, 
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
  User 
} from 'firebase/auth';
import { 
  getFirestore,
  initializeFirestore,
  setLogLevel,
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  getDocs, 
  getDoc,
  getDocFromServer,
  onSnapshot,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SchoolDocument, Flashcard, UIPreferences } from '../types';

// Set Firestore log level to error to avoid noisy connection retry warnings
try {
  setLogLevel('error');
} catch (e) {
  // Ignore in environments where setLogLevel cannot be modified
}

// Initialize Firebase App singleton safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Enforce durable browser local persistence so login sessions are remembered across reloads
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.info('[Firebase Auth] Durable local persistence setup note:', err?.message || err);
  });
}
const firestoreDbId = (firebaseConfig as any).firestoreDatabaseId || 'ai-studio-degreeunlocker-aea10e58-ccdf-4e46-808c-8bb2be0078dd';

// Initialize resilient Firestore with auto-detect long-polling to prevent 10s timeout warnings in proxy/container environments
let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true,
  }, firestoreDbId);
} catch {
  dbInstance = getFirestore(app, firestoreDbId);
}
export const db = dbInstance;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  // Do not crash app on transient offline status or unreachable backend warnings
  if (
    errMessage.includes('unavailable') || 
    errMessage.includes('the client is offline') ||
    errMessage.includes('Could not reach Cloud Firestore backend') ||
    errMessage.includes('Backend didn\'t respond within 10 seconds')
  ) {
    console.info(`[Firestore Offline] ${operationType} on ${path}: operating in resilient offline/cache mode.`);
    return;
  }
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Error: ', JSON.stringify(errInfo));
}

// Test initial connection as required by firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error && 
      (error.message.includes('the client is offline') || 
       error.message.includes('unavailable') || 
       error.message.includes('Could not reach Cloud Firestore backend') ||
       error.message.includes('Backend didn\'t respond within 10 seconds'))
    ) {
      console.info('[Firestore] Client operating in resilient offline/cache mode.');
    }
  }
}
testConnection();

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Dedicated provider for extended Google Workspace scopes (Drive / Docs / Tasks)
const googleWorkspaceProvider = new GoogleAuthProvider();
googleWorkspaceProvider.setCustomParameters({ prompt: 'select_account' });
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/drive.readonly');
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/documents.readonly');
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/tasks');
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/tasks.readonly');

// In-memory token cache (never stored in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

export function setCachedAccessToken(token: string | null): void {
  cachedAccessToken = token;
}

/**
 * Sign in with Google (Cross-device sync Phone <-> Computer)
 */
export async function loginWithGoogle(withWorkspaceScopes = false): Promise<{ user: User; accessToken: string | null }> {
  try {
    const provider = withWorkspaceScopes ? googleWorkspaceProvider : googleProvider;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }

    // Record user profile in Firestore
    if (result.user) {
      const userRef = doc(db, 'users', result.user.uid);
      try {
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || 'Étudiant',
          photoURL: result.user.photoURL || '',
          lastLoginAt: serverTimestamp(),
        }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${result.user.uid}`);
      }
      saveAuthSessionLocally(result.user, result.user.email);
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (err: any) {
    console.warn('Google sign-in exception:', err);
    let friendlyMessage = err.message || 'Erreur de connexion Google';
    if (err.code === 'auth/popup-blocked') {
      friendlyMessage = 'Pop-up bloquée par le navigateur. Veuillez autoriser les fenêtres pop-up ou utiliser la connexion par Email.';
    } else if (err.code === 'auth/popup-closed-by-user') {
      friendlyMessage = 'Connexion Google annulée.';
    } else if (err.code === 'auth/unauthorized-domain') {
      friendlyMessage = 'Domaine en aperçu iFrame non autorisé. Connectez-vous avec Email/Mot de passe ou ouvrez l\'app dans un nouvel onglet.';
    } else if (err.message?.includes('access_denied') || err.message?.includes('403') || err.code === 'auth/access-denied') {
      friendlyMessage = 'Google OAuth en mode Test (Accès 403). Utilisez l\'inscription par Email/Mot de passe ou le Mode Invité pour vous connecter instantanément.';
    }
    const customError = new Error(friendlyMessage);
    (customError as any).code = err.code;
    throw customError;
  }
}

/**
 * Format Firebase Auth errors into clear, friendly student messages
 */
export function formatAuthErrorMessage(err: any, isFr: boolean = true): string {
  const code = err?.code || '';
  const message = err?.message || String(err || '');

  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return isFr
      ? 'Identifiant ou mot de passe incorrect. Si vous n\'avez pas encore de compte, activez "Créer un compte".'
      : 'Invalid email or password. If you don\'t have an account yet, switch to "Create account".';
  }
  if (code === 'auth/email-already-in-use') {
    return isFr
      ? 'Cette adresse email est déjà utilisée. Cliquez sur "Déjà un compte ? Se connecter".'
      : 'This email is already in use. Please sign in instead.';
  }
  if (code === 'auth/weak-password') {
    return isFr
      ? 'Mot de passe trop court. Veuillez saisir au moins 6 caractères.'
      : 'Password is too short. Please enter at least 6 characters.';
  }
  if (code === 'auth/invalid-email') {
    return isFr
      ? 'Adresse email invalide. Veuillez vérifier le format (ex: etudiant@gmail.com).'
      : 'Invalid email address format.';
  }
  if (code === 'auth/too-many-requests') {
    return isFr
      ? 'Trop de tentatives infructueuses. Veuillez patienter un instant avant de réessayer.'
      : 'Too many failed attempts. Please wait a moment and try again.';
  }
  if (code === 'auth/network-request-failed' || message.includes('network')) {
    return isFr
      ? 'Erreur réseau. Vérifiez votre connexion internet.'
      : 'Network connection failed. Please check your internet connection.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return isFr
      ? 'Connexion annulée (la fenêtre a été fermée).'
      : 'Sign-in cancelled (popup was closed).';
  }

  return message || (isFr ? 'Erreur d\'authentification' : 'Authentication error');
}

/**
 * Cache user session locally so login is immediately remembered across refreshes and offline starts
 */
export function saveAuthSessionLocally(user: User | null, rememberEmail?: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      const sessionData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'Étudiant',
        photoURL: user.photoURL || null,
        isAnonymous: user.isAnonymous,
        savedAt: Date.now(),
      };
      localStorage.setItem('degreeunlocker_auth_user', JSON.stringify(sessionData));
      if (rememberEmail) {
        localStorage.setItem('degreeunlocker_saved_email', rememberEmail.trim());
        localStorage.setItem('degreeunlocker_remember_me', 'true');
      }
    } else {
      localStorage.removeItem('degreeunlocker_auth_user');
      const rememberMe = localStorage.getItem('degreeunlocker_remember_me') === 'true';
      if (!rememberMe) {
        localStorage.removeItem('degreeunlocker_saved_email');
      }
    }
  } catch (e) {
    console.warn('[Session Cache] LocalStorage error:', e);
  }
}

export function getSavedAuthSession(): any | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('degreeunlocker_auth_user');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return null;
}

export function getSavedEmail(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem('degreeunlocker_saved_email') || '';
  } catch (e) {}
  return '';
}

/**
 * Sign in anonymously for private device sync
 */
export async function loginAnonymously(): Promise<User> {
  const res = await signInAnonymously(auth);
  saveAuthSessionLocally(res.user);
  return res.user;
}

/**
 * Sign in with Email and Password with durable persistence & error translation
 */
export async function loginWithEmail(email: string, pass: string, rememberMe = true): Promise<User> {
  try {
    if (typeof window !== 'undefined') {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : inMemoryPersistence).catch(() => {});
    }
    const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
    saveAuthSessionLocally(res.user, rememberMe ? email : null);
    return res.user;
  } catch (err: any) {
    const friendlyMessage = formatAuthErrorMessage(err, true);
    const customError = new Error(friendlyMessage);
    (customError as any).code = err?.code;
    throw customError;
  }
}

/**
 * Register with Email and Password with durable persistence & error translation
 */
export async function registerWithEmail(email: string, pass: string, rememberMe = true): Promise<User> {
  try {
    if (typeof window !== 'undefined') {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : inMemoryPersistence).catch(() => {});
    }
    const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (res.user) {
      saveAuthSessionLocally(res.user, rememberMe ? email : null);
      const userRef = doc(db, 'users', res.user.uid);
      try {
        await setDoc(userRef, {
          uid: res.user.uid,
          email: res.user.email,
          displayName: email.split('@')[0] || 'Étudiant',
          lastLoginAt: serverTimestamp(),
        }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${res.user.uid}`);
      }
    }
    return res.user;
  } catch (err: any) {
    const friendlyMessage = formatAuthErrorMessage(err, true);
    const customError = new Error(friendlyMessage);
    (customError as any).code = err?.code;
    throw customError;
  }
}

export const signInWithGoogle = loginWithGoogle;
export const isFirebaseConfigured = true;
export const isFirebaseOnline = true;

/**
 * Sign in with Demo Account
 */
export async function loginWithDemoAccount(email = 'dolfius1er@gmail.com', displayName = 'Étudiant Certifié'): Promise<User> {
  try {
    const res = await signInAnonymously(auth);
    saveAuthSessionLocally(res.user);
    return res.user;
  } catch (err) {
    const fallbackUser = {
      uid: 'demo-user-123',
      email,
      displayName,
      isAnonymous: true,
      emailVerified: true,
    } as unknown as User;
    saveAuthSessionLocally(fallbackUser);
    return fallbackUser;
  }
}

/**
 * Sign out and clear local cached session
 */
export async function logoutUser(): Promise<void> {
  cachedAccessToken = null;
  saveAuthSessionLocally(null);
  await fbSignOut(auth);
}

/**
 * Sync local documents to Firestore for cross-device access
 */
export async function syncDocumentsToCloud(userId: string, documents: SchoolDocument[]): Promise<number> {
  if (!userId || !documents.length) return 0;
  let synced = 0;
  for (const document of documents) {
    const path = `users/${userId}/documents/${document.id}`;
    try {
      const docRef = doc(db, 'users', userId, 'documents', document.id);
      await setDoc(docRef, {
        ...document,
        syncedAt: new Date().toISOString(),
      }, { merge: true });
      synced++;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }
  return synced;
}

/**
 * Fetch documents stored in Firestore for this user
 */
export async function loadDocumentsFromCloud(userId: string): Promise<SchoolDocument[]> {
  if (!userId) return [];
  const path = `users/${userId}/documents`;
  try {
    const colRef = collection(db, 'users', userId, 'documents');
    const snapshot = await getDocs(colRef);
    const docs: SchoolDocument[] = [];
    snapshot.forEach((snap) => {
      docs.push(snap.data() as SchoolDocument);
    });
    return docs;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
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
    const path = `users/${userId}/flashcards/${card.id}`;
    try {
      const cardRef = doc(db, 'users', userId, 'flashcards', card.id);
      await setDoc(cardRef, {
        ...card,
        syncedAt: new Date().toISOString(),
      }, { merge: true });
      synced++;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }
  return synced;
}

/**
 * Load cloud flashcards
 */
export async function loadFlashcardsFromCloud(userId: string): Promise<Flashcard[]> {
  if (!userId) return [];
  const path = `users/${userId}/flashcards`;
  try {
    const colRef = collection(db, 'users', userId, 'flashcards');
    const snapshot = await getDocs(colRef);
    const cards: Flashcard[] = [];
    snapshot.forEach((snap) => {
      cards.push(snap.data() as Flashcard);
    });
    return cards;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

/**
 * Save user preferences to cloud
 */
export async function syncPreferencesToCloud(userId: string, preferences: UIPreferences): Promise<void> {
  if (!userId) return;
  const path = `users/${userId}/settings/preferences`;
  try {
    const prefRef = doc(db, 'users', userId, 'settings', 'preferences');
    await setDoc(prefRef, {
      ...preferences,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

/**
 * Load user preferences from cloud
 */
export async function loadPreferencesFromCloud(userId: string): Promise<UIPreferences | null> {
  if (!userId) return null;
  const path = `users/${userId}/settings/preferences`;
  try {
    const prefRef = doc(db, 'users', userId, 'settings', 'preferences');
    const snap = await getDoc(prefRef);
    if (snap.exists()) {
      return snap.data() as UIPreferences;
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, path);
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
  const path = `users/${userId}/documents`;
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
      handleFirestoreError(err, OperationType.LIST, path);
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
  const path = `users/${userId}/documents/${document.id}`;
  const docRef = doc(db, 'users', userId, 'documents', document.id);
  const payload = {
    ...document,
    syncedAt: new Date().toISOString(),
    lastTransferredFrom: sourceDevice,
  };
  try {
    await setDoc(docRef, payload, { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }

  // Post real-time transfer notification
  await notifyDeviceTransfer(userId, {
    docId: document.id,
    docTitle: document.title,
    source: sourceDevice,
  });
}

/**
 * Delete a document from Firestore cloud (cross-device sync deletion)
 */
export async function deleteDocumentFromCloud(userId: string, docId: string): Promise<void> {
  if (!userId || !docId) return;
  const path = `users/${userId}/documents/${docId}`;
  try {
    const docRef = doc(db, 'users', userId, 'documents', docId);
    await deleteDoc(docRef);
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
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
  const path = `users/${userId}/transfers/latest`;
  try {
    const eventRef = doc(db, 'users', userId, 'transfers', 'latest');
    await setDoc(eventRef, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
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
  const path = `users/${userId}/transfers/latest`;
  const eventRef = doc(db, 'users', userId, 'transfers', 'latest');
  return onSnapshot(
    eventRef, 
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
        if (data && data.docTitle && data.source) {
          onTransfer(data);
        }
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

/**
 * Create a quick 6-digit pairing code to link Smartphone to PC without passwords
 */
export async function createPairingCode(userId: string): Promise<string> {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const code = `DG${randomNum}`;
  const path = `pairings/${code}`;
  const now = new Date().toISOString();
  try {
    const pairRef = doc(db, 'pairings', code);
    await setDoc(pairRef, {
      userId,
      createdAt: now,
      updatedAt: now,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
    });
    return code;
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
    return `DG${randomNum}`;
  }
}

/**
 * Resolve a pairing code on Smartphone to get the PC's linked user session
 */
export async function resolvePairingCode(code: string): Promise<string | null> {
  const cleanCode = code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  const path = `pairings/${cleanCode}`;
  try {
    const pairRef = doc(db, 'pairings', cleanCode);
    const snap = await getDoc(pairRef);
    if (snap.exists()) {
      const data = snap.data() as any;
      if (data && data.userId) {
        return data.userId;
      }
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, path);
  }
  return null;
}

/**
 * Convenience aliases for Firestore sync
 */
export const syncDocumentsToFirestore = syncDocumentsToCloud;
export const fetchDocumentsFromFirestore = loadDocumentsFromCloud;
export const onAuthChange = (cb: (user: User | null) => void) => onAuthStateChanged(auth, cb);
