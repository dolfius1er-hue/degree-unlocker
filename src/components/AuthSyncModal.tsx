import React, { useState } from 'react';
import { AppLanguage } from '../types';
import { 
  loginWithGoogle, 
  loginAnonymously, 
  logoutUser, 
  syncDocumentsToFirestore, 
  fetchDocumentsFromFirestore,
  auth
} from '../lib/firebase';
import { 
  Smartphone, 
  Monitor, 
  ArrowLeftRight, 
  CheckCircle2, 
  X, 
  LogOut, 
  LogIn, 
  Loader2, 
  Cloud, 
  CloudCheck, 
  AlertCircle,
  Sparkles,
  Shield,
  User,
  HardDrive
} from 'lucide-react';

interface AuthSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onUserChanged: (user: any) => void;
  localDocs: any[];
  onMergeCloudDocs: (mergedDocs: any[]) => void;
  lang: AppLanguage;
}

export const AuthSyncModal: React.FC<AuthSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
  localDocs,
  onMergeCloudDocs,
  lang = 'fr',
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  // Handle Google Sign-In
  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    setSyncMessage(null);
    try {
      const user = await loginWithGoogle();
      onUserChanged(user);
      setSyncStatus('success');
      setSyncMessage(
        lang === 'fr'
          ? `Connecté en tant que ${user.displayName || user.email} ! Vos appareils sont désormais reliés.`
          : `Connected as ${user.displayName || user.email}! Your devices are now linked.`
      );
      // Auto-sync initial local documents
      if (localDocs.length > 0) {
        await syncDocumentsToFirestore(user.uid, localDocs);
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      setSyncStatus('error');
      setSyncMessage(
        lang === 'fr'
          ? `Connexion annulée ou impossible (${err.message || 'erreur réseau'}).`
          : `Sign-in canceled or failed (${err.message || 'network error'}).`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Quick Guest Access (Anonymous Firebase Auth)
  const handleAnonymousLogin = async () => {
    setIsProcessing(true);
    setSyncMessage(null);
    try {
      const user = await loginAnonymously();
      onUserChanged(user);
      setSyncStatus('success');
      setSyncMessage(
        lang === 'fr'
          ? 'Compte invité sécurisé créé avec succès. Vos données sont synchronisées sur le cloud.'
          : 'Secure guest account created successfully. Cloud sync enabled.'
      );
    } catch (err: any) {
      console.error('Anonymous login error:', err);
      setSyncStatus('error');
      setSyncMessage(err.message || 'Error creating guest account');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    setIsProcessing(true);
    try {
      await logoutUser();
      onUserChanged(null);
      setSyncMessage(lang === 'fr' ? 'Déconnexion réussie.' : 'Logged out successfully.');
      setSyncStatus('idle');
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual trigger: Sync PC to Cloud Firestore
  const handlePushToCloud = async () => {
    if (!currentUser) return;
    setIsProcessing(true);
    try {
      await syncDocumentsToFirestore(currentUser.uid, localDocs);
      setSyncStatus('success');
      setSyncMessage(
        lang === 'fr'
          ? `${localDocs.length} cours & fiches synchronisés vers Firestore Cloud !`
          : `${localDocs.length} courses & cards synced to Firestore Cloud!`
      );
    } catch (err: any) {
      console.error('Sync push error:', err);
      setSyncStatus('error');
      setSyncMessage(lang === 'fr' ? 'Erreur de synchronisation cloud.' : 'Cloud sync error.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual trigger: Fetch from Cloud Firestore to PC/Mobile
  const handlePullFromCloud = async () => {
    if (!currentUser) return;
    setIsProcessing(true);
    try {
      const cloudDocs = await fetchDocumentsFromFirestore(currentUser.uid);
      if (cloudDocs && cloudDocs.length > 0) {
        onMergeCloudDocs(cloudDocs);
        setSyncStatus('success');
        setSyncMessage(
          lang === 'fr'
            ? `${cloudDocs.length} cours récupérés depuis votre compte cloud Firestore !`
            : `${cloudDocs.length} courses retrieved from your cloud Firestore!`
        );
      } else {
        setSyncStatus('idle');
        setSyncMessage(
          lang === 'fr'
            ? 'Aucun document cloud trouvé pour l\'instant. Sauvegardez vos cours locaux d\'abord.'
            : 'No cloud documents found yet. Sync your local files first.'
        );
      }
    } catch (err: any) {
      console.error('Sync pull error:', err);
      setSyncStatus('error');
      setSyncMessage(err.message || 'Error pulling documents');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Smartphone className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                {lang === 'fr' ? 'Compte & Synchronisation Multi-Appareils' : 'Account & Cross-Device Sync'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'fr'
                  ? 'Transmettez et retrouvez vos cours entre votre téléphone et votre ordinateur.'
                  : 'Seamlessly sync study materials between your phone and your computer.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Device Bridge Infographic */}
        <div className="p-5 bg-gradient-to-b from-indigo-50/60 to-transparent dark:from-indigo-950/30 dark:to-transparent border-b border-slate-100 dark:border-slate-800 flex items-center justify-around py-4">
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
              <Smartphone className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {lang === 'fr' ? 'Téléphone / Mobile' : 'Phone / Mobile'}
            </span>
            <span className="text-[9px] text-slate-400">
              {lang === 'fr' ? 'Photos & Révision' : 'Photos & Review'}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-indigo-500 animate-pulse">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
              Firestore Sync
            </span>
          </div>

          <div className="flex flex-col items-center gap-1 text-center">
            <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
              <Monitor className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {lang === 'fr' ? 'Ordinateur (PC/Mac)' : 'Computer (PC/Mac)'}
            </span>
            <span className="text-[9px] text-slate-400">
              {lang === 'fr' ? 'Bibliothèque locale' : 'Local library'}
            </span>
          </div>
        </div>

        {/* Status Message */}
        {syncMessage && (
          <div className={`mx-5 mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
            syncStatus === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/50 text-emerald-800 dark:text-emerald-200'
              : syncStatus === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300/50 text-rose-800 dark:text-rose-200'
              : 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300/50 text-indigo-800 dark:text-indigo-200'
          }`}>
            {syncStatus === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : syncStatus === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            ) : (
              <Cloud className="w-4 h-4 text-indigo-500 shrink-0" />
            )}
            <span className="flex-1">{syncMessage}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 space-y-4">
          
          {currentUser ? (
            /* Logged in state */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-10 h-10 rounded-full border border-indigo-300"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                      {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {currentUser.displayName || (currentUser.isAnonymous ? 'Utilisateur Invité' : 'Compte Connecté')}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {currentUser.email || `ID: ${currentUser.uid.slice(0, 10)}...`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Déconnexion' : 'Sign out'}</span>
                </button>
              </div>

              {/* Cloud Sync Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handlePushToCloud}
                  disabled={isProcessing}
                  className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Cloud className="w-5 h-5 text-amber-300" />
                  <span>{lang === 'fr' ? 'Envoyer PC ➔ Cloud' : 'Push PC ➔ Cloud'}</span>
                  <span className="text-[10px] font-normal text-indigo-200">
                    {lang === 'fr' ? `${localDocs.length} documents locaux` : `${localDocs.length} local files`}
                  </span>
                </button>

                <button
                  onClick={handlePullFromCloud}
                  disabled={isProcessing}
                  className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Smartphone className="w-5 h-5 text-indigo-500" />
                  <span>{lang === 'fr' ? 'Recevoir Cloud ➔ PC' : 'Pull Cloud ➔ PC'}</span>
                  <span className="text-[10px] font-normal text-slate-500">
                    {lang === 'fr' ? 'Récupérer depuis mobile' : 'Import from mobile'}
                  </span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30 text-xs text-indigo-900 dark:text-indigo-200">
                <p className="font-semibold mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  {lang === 'fr' ? 'Règles de sécurité Firestore actives :' : 'Firestore Security Rules active:'}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {lang === 'fr'
                    ? 'Chaque utilisateur ne peut lire et modifier que ses propres cours. Aucune donnée d\'autrui n\'est accessible.'
                    : 'Each user strictly reads and writes their own documents. Cross-user isolation enforced by security rules.'}
                </p>
              </div>
            </div>
          ) : (
            /* Not logged in: Sign-in choices */
            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>
                  {lang === 'fr' ? 'Se connecter avec Google (Compte Principal)' : 'Sign in with Google (Primary Account)'}
                </span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-4 text-[11px] text-slate-400 font-medium">
                  {lang === 'fr' ? 'ou mode invité' : 'or guest mode'}
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <button
                onClick={handleAnonymousLogin}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>
                  {lang === 'fr' ? 'Activer la synchro invité (sans identifiant)' : 'Enable guest sync (no credentials)'}
                </span>
              </button>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {lang === 'fr' ? 'Comment fonctionne la liaison téléphone ↔ ordinateur ?' : 'How does phone ↔ computer linking work?'}
                </p>
                <p className="text-[11px] leading-relaxed">
                  {lang === 'fr'
                    ? '1. Prenez vos notes en photo sur votre téléphone avec l\'outil Photo de Notes.\n2. Cliquez sur "Envoyer vers le Cloud".\n3. Ouvrez Degree Unlocker sur votre ordinateur pour retrouver instantanément toutes vos fiches et résumés.'
                    : '1. Take note photos on your phone.\n2. Push them to Firestore cloud.\n3. Open Degree Unlocker on your computer to immediately review transcripts and flashcards.'}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Degree Unlocker Cloud v2.0
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold cursor-pointer"
          >
            {lang === 'fr' ? 'Fermer' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
