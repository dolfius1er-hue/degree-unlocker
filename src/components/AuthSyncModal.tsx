import React, { useState } from 'react';
import { AppLanguage } from '../types';
import { 
  loginWithGoogle, 
  loginAnonymously, 
  loginWithEmail,
  registerWithEmail,
  logoutUser, 
  syncDocumentsToFirestore, 
  fetchDocumentsFromFirestore,
  createPairingCode,
  resolvePairingCode,
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
  AlertCircle,
  Sparkles,
  Shield,
  User,
  HardDrive,
  Key,
  Mail,
  Copy,
  Check,
  Share2,
  Download
} from 'lucide-react';

interface AuthSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onUserChanged: (user: any) => void;
  localDocs: any[];
  onMergeCloudDocs: (mergedDocs: any[]) => void;
  onOpenExportGuide?: () => void;
  lang?: AppLanguage;
}

export const AuthSyncModal: React.FC<AuthSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
  localDocs,
  onMergeCloudDocs,
  onOpenExportGuide,
  lang = 'fr',
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'pairing' | 'export'>('account');
  const [isProcessing, setIsProcessing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Email auth states
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Pairing code states
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  if (!isOpen) return null;

  // Handle Google Sign-In
  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    setSyncMessage(null);
    try {
      const loginResult = await loginWithGoogle();
      const user = loginResult.user;
      onUserChanged(user);
      setSyncStatus('success');
      setSyncMessage(
        lang === 'fr'
          ? `Connecté en tant que ${user.displayName || user.email || 'Étudiant'} ! Synchronisation active.`
          : `Connected as ${user.displayName || user.email || 'Student'}! Sync active.`
      );
      if (localDocs.length > 0) {
        await syncDocumentsToFirestore(user.uid, localDocs);
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      setSyncStatus('error');
      setSyncMessage(
        lang === 'fr'
          ? `Connexion Google : ${err.message || 'erreur'}. Essayez la connexion Email ou le Code Téléphone.`
          : `Google Sign-in: ${err.message || 'error'}. Try Email or Phone Pairing code.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Email Sign-In / Sign-Up
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setIsProcessing(true);
    setSyncMessage(null);
    try {
      let user: any;
      if (isSignUp) {
        user = await registerWithEmail(email.trim(), password);
        setSyncMessage(lang === 'fr' ? 'Compte créé avec succès ! Vos données sont synchronisées.' : 'Account created successfully!');
      } else {
        user = await loginWithEmail(email.trim(), password);
        setSyncMessage(lang === 'fr' ? 'Connexion réussie ! Vos cours se synchronisent.' : 'Signed in successfully!');
      }
      onUserChanged(user);
      setSyncStatus('success');
      if (localDocs.length > 0) {
        await syncDocumentsToFirestore(user.uid, localDocs);
      }
      setShowEmailForm(false);
    } catch (err: any) {
      console.error('Email auth error:', err);
      setSyncStatus('error');
      setSyncMessage(err.message || (lang === 'fr' ? 'Erreur d\'identifiants' : 'Authentication error'));
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

  // Generate pairing code on PC or Phone
  const handleGenerateCode = async () => {
    if (!currentUser) return;
    setIsProcessing(true);
    try {
      const code = await createPairingCode(currentUser.uid);
      setGeneratedCode(code);
      setSyncStatus('success');
      setSyncMessage(
        lang === 'fr'
          ? `Code d'association généré : ${code}. Tapez ce code sur votre téléphone pour synchroniser vos cours !`
          : `Pairing code generated: ${code}. Enter this code on your mobile device.`
      );
    } catch (err: any) {
      setSyncStatus('error');
      setSyncMessage(err.message || 'Error creating pairing code');
    } finally {
      setIsProcessing(false);
    }
  };

  // Resolve pairing code on mobile
  const handleConnectWithCode = async () => {
    if (!inputCode.trim()) return;
    setIsProcessing(true);
    setSyncMessage(null);
    try {
      const linkedUserId = await resolvePairingCode(inputCode.trim());
      if (linkedUserId) {
        // Log in anonymously or associate with the linked session
        let user = auth.currentUser;
        if (!user) {
          user = await loginAnonymously();
        }
        // Fetch docs from the paired user
        const cloudDocs = await fetchDocumentsFromFirestore(linkedUserId);
        if (cloudDocs && cloudDocs.length > 0) {
          onMergeCloudDocs(cloudDocs);
        }
        setSyncStatus('success');
        setSyncMessage(
          lang === 'fr'
            ? `Liaison réussie ! ${cloudDocs?.length || 0} cours synchronisés depuis votre autre appareil.`
            : `Pairing successful! ${cloudDocs?.length || 0} notes synced from your other device.`
        );
      } else {
        setSyncStatus('error');
        setSyncMessage(
          lang === 'fr'
            ? 'Code invalide ou expiré. Générez un nouveau code sur votre ordinateur.'
            : 'Invalid or expired code. Generate a new code on your computer.'
        );
      }
    } catch (err: any) {
      setSyncStatus('error');
      setSyncMessage(err.message || 'Error resolving pairing code');
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Smartphone className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                {lang === 'fr' ? 'Liaison & Synchronisation Multi-Appareils' : 'Multi-Device Sync & Linking'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'fr'
                  ? 'Retrouvez vos cours entre votre téléphone et votre ordinateur en direct.'
                  : 'Sync your study materials live between your phone and computer.'}
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

        {/* Tab Navigation */}
        <div className="px-5 pt-3 pb-0 flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'account'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            {lang === 'fr' ? 'Compte Cloud' : 'Cloud Account'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pairing')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pairing'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === 'fr' ? 'Code 6 chiffres (Rapide)' : '6-Digit Code'}</span>
          </button>

          {onOpenExportGuide && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenExportGuide();
              }}
              className="pb-2.5 px-3 text-xs font-bold border-b-2 border-transparent text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-all cursor-pointer flex items-center gap-1 ml-auto"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Export Mobile' : 'Mobile Export'}</span>
            </button>
          )}
        </div>

        {/* Status / Notifications Banner */}
        {syncMessage && (
          <div
            className={`mx-5 mt-3 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              syncStatus === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : syncStatus === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300'
            }`}
          >
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
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {activeTab === 'account' && (
            <>
              {currentUser ? (
                /* Logged in state */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt={currentUser.displayName || 'User'}
                          className="w-10 h-10 rounded-full border border-indigo-300"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                          {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {currentUser.displayName || (currentUser.isAnonymous ? 'Compte Invité' : 'Compte Connecté')}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {currentUser.email || `ID: ${currentUser.uid.slice(0, 10)}...`}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      disabled={isProcessing}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
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
                      className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Cloud className="w-5 h-5 text-amber-300" />
                      <span>{lang === 'fr' ? 'Envoyer vers le Cloud' : 'Push to Cloud'}</span>
                      <span className="text-[10px] font-normal text-indigo-200">
                        {lang === 'fr' ? `${localDocs.length} cours locaux` : `${localDocs.length} local files`}
                      </span>
                    </button>

                    <button
                      onClick={handlePullFromCloud}
                      disabled={isProcessing}
                      className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Smartphone className="w-5 h-5 text-indigo-500" />
                      <span>{lang === 'fr' ? 'Recevoir du Cloud' : 'Pull from Cloud'}</span>
                      <span className="text-[10px] font-normal text-slate-500">
                        {lang === 'fr' ? 'Récupérer les cours mobile' : 'Import mobile notes'}
                      </span>
                    </button>
                  </div>

                  {/* Pair with code quick button */}
                  <button
                    onClick={() => {
                      setActiveTab('pairing');
                      handleGenerateCode();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Key className="w-4 h-4 text-amber-600" />
                    <span>{lang === 'fr' ? 'Générer un code 6 chiffres pour lier un autre appareil' : 'Generate 6-digit pairing code'}</span>
                  </button>
                </div>
              ) : (
                /* Not logged in: Choice of sign-in */
                <div className="space-y-3">
                  
                  {/* Google Auth Button */}
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
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
                      {lang === 'fr' ? 'Se connecter avec Google' : 'Sign in with Google'}
                    </span>
                  </button>

                  {/* Toggle Email/Password form with Real-time Validation */}
                  {!showEmailForm ? (
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(true)}
                      className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Mail className="w-4 h-4 text-indigo-500" />
                      <span>{lang === 'fr' ? 'Se connecter avec Email / Mot de passe' : 'Sign in with Email / Password'}</span>
                    </button>
                  ) : (
                    <form onSubmit={handleEmailAuth} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {isSignUp 
                            ? (lang === 'fr' ? 'Créer un compte étudiant' : 'Create Student Account')
                            : (lang === 'fr' ? 'Connexion Email' : 'Email Sign In')}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsSignUp(!isSignUp)}
                          className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          {isSignUp 
                            ? (lang === 'fr' ? 'Déjà un compte ? Se connecter' : 'Already have account? Sign in')
                            : (lang === 'fr' ? 'Pas de compte ? Créer' : 'Create new account')}
                        </button>
                      </div>

                      {/* Email input with real-time feedback */}
                      <div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="etudiant@universite.fr"
                          className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl text-xs text-slate-900 dark:text-white transition-all ${
                            email && email.includes('@') && email.includes('.')
                              ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                              : email
                              ? 'border-amber-400 focus:ring-1 focus:ring-amber-400'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        />
                      </div>

                      {/* Password input with length indicator */}
                      <div>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={lang === 'fr' ? 'Mot de passe (min 6 caractères)' : 'Password (min 6 chars)'}
                          className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl text-xs text-slate-900 dark:text-white transition-all ${
                            password.length >= 6
                              ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                              : password.length > 0
                              ? 'border-rose-400 focus:ring-1 focus:ring-rose-400'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        />
                        {password.length > 0 && password.length < 6 && (
                          <p className="text-[10px] text-rose-500 mt-1">
                            {lang === 'fr' ? 'Le mot de passe doit comporter au moins 6 caractères.' : 'Password must be at least 6 characters.'}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          disabled={isProcessing || !email.includes('@') || password.length < 6}
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer disabled:cursor-not-allowed"
                        >
                          {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : (isSignUp ? (lang === 'fr' ? 'Créer mon compte' : 'Register') : (lang === 'fr' ? 'Se connecter' : 'Sign In'))}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEmailForm(false)}
                          className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          {lang === 'fr' ? 'Annuler' : 'Cancel'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Guest login */}
                  <button
                    onClick={handleAnonymousLogin}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>
                      {lang === 'fr' ? 'Mode invité anonyme (sans identifiants)' : 'Anonymous guest mode'}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'pairing' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-2">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  {lang === 'fr' ? 'Lier Téléphone & Ordinateur sans mot de passe' : 'Link Phone & PC without passwords'}
                </h4>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                  {lang === 'fr'
                    ? 'Générez un code temporaire à 6 chiffres sur votre ordinateur, puis tapez-le sur votre téléphone pour synchroniser vos cours en 1 seconde.'
                    : 'Generate a 6-digit code on your PC, then type it on your phone to link both devices in 1 second.'}
                </p>
              </div>

              {/* Step A: Generate code */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-indigo-500" />
                  {lang === 'fr' ? '1. Si vous êtes sur votre Ordinateur :' : '1. If you are on your Computer:'}
                </span>

                {generatedCode ? (
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-xl">
                    <div className="font-mono text-xl font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
                      {generatedCode}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCode);
                        setCodeCopied(true);
                        setTimeout(() => setCodeCopied(false), 2000);
                      }}
                      className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {codeCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{codeCopied ? (lang === 'fr' ? 'Copié !' : 'Copied!') : (lang === 'fr' ? 'Copier' : 'Copy')}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    disabled={isProcessing || !currentUser}
                    className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (lang === 'fr' ? 'Générer un code d\'association' : 'Generate Pairing Code')}
                  </button>
                )}
              </div>

              {/* Step B: Enter code on mobile */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  {lang === 'fr' ? '2. Si vous êtes sur votre Téléphone :' : '2. If you are on your Phone:'}
                </span>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="DG-1234"
                    maxLength={10}
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm uppercase tracking-wider text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleConnectWithCode}
                    disabled={isProcessing || !inputCode.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (lang === 'fr' ? 'Lier' : 'Link')}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Degree Unlocker Lite Sync
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white font-bold cursor-pointer text-xs transition-colors"
          >
            {lang === 'fr' ? 'Fermer' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
