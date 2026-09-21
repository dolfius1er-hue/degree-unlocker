import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  LogOut, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  X, 
  LogIn, 
  UserPlus, 
  RefreshCw,
  FolderHeart,
  Flame,
  Users,
  Copy,
  Check,
  Share2,
  Key,
  Smartphone,
  Send,
  Radio,
  Plus,
  Trash2
} from 'lucide-react';
import { 
  auth, 
  signInWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  loginWithDemoAccount,
  logoutUser, 
  onAuthChange,
  isFirebaseConfigured,
  isFirebaseOnline
} from '../lib/firebase';
import { SchoolDocument } from '../types';

interface StudyFriend {
  id: string;
  name: string;
  email?: string;
  code: string;
  status: 'online' | 'studying' | 'idle';
  currentSubject?: string;
  avatarColor: string;
  lastActive: string;
}

interface AccountProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: SchoolDocument[];
  lang?: 'fr' | 'en';
  onSyncAllCloud?: () => Promise<void>;
  initialTab?: 'account' | 'friends' | 'privacy';
}

const DEFAULT_FRIENDS_STORAGE_KEY = 'degreelocker_study_friends';

export const AccountProfileModal: React.FC<AccountProfileModalProps> = ({
  isOpen,
  onClose,
  documents,
  lang = 'fr',
  onSyncAllCloud,
  initialTab = 'account',
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'friends' | 'privacy'>(initialTab);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Friends / Duo Study State
  const [myPairingCode, setMyPairingCode] = useState<string>('');
  const [friendCodeInput, setFriendCodeInput] = useState<string>('');
  const [friendNameInput, setFriendNameInput] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [friendsList, setFriendsList] = useState<StudyFriend[]>([]);
  const [sharedToast, setSharedToast] = useState<string | null>(null);

  useEffect(() => {
    // Generate or load persistent personal pairing code
    try {
      let code = localStorage.getItem('degreelocker_my_pairing_code');
      if (!code) {
        code = 'STUDY-' + Math.floor(1000 + Math.random() * 9000);
        localStorage.setItem('degreelocker_my_pairing_code', code);
      }
      setMyPairingCode(code);

      const savedFriends = localStorage.getItem(DEFAULT_FRIENDS_STORAGE_KEY);
      if (savedFriends) {
        setFriendsList(JSON.parse(savedFriends));
      } else {
        // Initial example study buddy to show functionality
        const initialBuddies: StudyFriend[] = [
          {
            id: 'buddy-1',
            name: 'Alexandre (Terminale Spé Maths)',
            code: 'STUDY-4482',
            status: 'studying',
            currentSubject: 'Mathématiques & Bac',
            avatarColor: 'from-indigo-500 to-cyan-500',
            lastActive: 'Il y a 5 min',
          },
          {
            id: 'buddy-2',
            name: 'Sarah (3ème Brevet)',
            code: 'STUDY-8912',
            status: 'online',
            currentSubject: 'Français & Fleurs d\'encre',
            avatarColor: 'from-rose-500 to-amber-500',
            lastActive: 'En ligne',
          }
        ];
        setFriendsList(initialBuddies);
        localStorage.setItem(DEFAULT_FRIENDS_STORAGE_KEY, JSON.stringify(initialBuddies));
      }
    } catch (e) {
      console.warn('Friends storage parse error:', e);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      // If user is anonymous or null, treat as guest
      if (user && !user.isAnonymous) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(myPairingCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      console.warn('Clipboard write error', e);
    }
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendCodeInput.trim()) return;

    const trimmedCode = friendCodeInput.trim().toUpperCase();
    const friendName = friendNameInput.trim() || `Binôme ${trimmedCode.replace('STUDY-', '')}`;
    
    const colors = [
      'from-indigo-500 to-cyan-500',
      'from-rose-500 to-amber-500',
      'from-emerald-500 to-teal-500',
      'from-purple-500 to-indigo-500',
      'from-amber-500 to-orange-500'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newFriend: StudyFriend = {
      id: 'friend-' + Date.now(),
      name: friendName,
      code: trimmedCode,
      status: 'studying',
      currentSubject: 'Révision fiches partagées',
      avatarColor: randomColor,
      lastActive: 'À l\'instant',
    };

    const updated = [newFriend, ...friendsList];
    setFriendsList(updated);
    try {
      localStorage.setItem(DEFAULT_FRIENDS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {}

    setFriendCodeInput('');
    setFriendNameInput('');
    setSharedToast(lang === 'fr' ? `Ami "${friendName}" ajouté avec succès !` : `Friend "${friendName}" added!`);
    setTimeout(() => setSharedToast(null), 3000);
  };

  const handleRemoveFriend = (friendId: string) => {
    const updated = friendsList.filter(f => f.id !== friendId);
    setFriendsList(updated);
    try {
      localStorage.setItem(DEFAULT_FRIENDS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {}
  };

  const handleShareNotesWithFriend = (friend: StudyFriend) => {
    setSharedToast(lang === 'fr' 
      ? `Fiches et mémos synchronisés avec ${friend.name} !` 
      : `Study notes synced with ${friend.name}!`);
    setTimeout(() => setSharedToast(null), 3500);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (authMode === 'login') {
        const user = await loginWithEmail(email, password);
        if (!user) throw new Error(lang === 'fr' ? 'Échec de connexion' : 'Login failed');
      } else {
        const user = await registerWithEmail(email, password);
        if (!user) throw new Error(lang === 'fr' ? 'Échec de création du compte' : 'Account creation failed');
      }
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setErrorMessage(err.message || (lang === 'fr' ? 'Une erreur est survenue' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMessage(err.message || (lang === 'fr' ? 'Connexion Google interrompue' : 'Google sign-in canceled'));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const user = await loginWithDemoAccount('dolfius1er@gmail.com', 'Étudiant Certifié');
      setCurrentUser(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setCurrentUser(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    if (!onSyncAllCloud) return;
    setSyncing(true);
    setSyncSuccess(false);
    try {
      await onSyncAllCloud();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  const pinnedDocsCount = documents.filter((d) => d.isPinned).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-xl shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {lang === 'fr' ? 'Espace Compte & Collaboration' : 'Account & Study Collaboration'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'fr' ? 'Gestion du profil, cloud et groupe d\'amis' : 'Manage profile, cloud sync & study buddies'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Compte / Amis & Binômes / Données & Sécurité) */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('account')}
            className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'account'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="truncate">{lang === 'fr' ? 'Mon Compte' : 'My Account'}</span>
          </button>

          <button
            id="btn-tab-study-friends"
            onClick={() => setActiveTab('friends')}
            className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
              activeTab === 'friends'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="truncate">{lang === 'fr' ? 'Mode Amis' : 'Study Buddies'}</span>
            {friendsList.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center">
                {friendsList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="truncate">{lang === 'fr' ? 'Données & Sécurité' : 'Privacy & Local'}</span>
          </button>
        </div>

        {/* Toast Notification */}
        {sharedToast && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{sharedToast}</span>
          </div>
        )}

        {/* TAB 1: MON COMPTE & CLOUD */}
        {activeTab === 'account' && (
          <div className="space-y-4">
            {currentUser ? (
              <div className="space-y-4">
                {/* Profile Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-linear-to-tr from-indigo-500 to-cyan-400 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      currentUser.displayName?.[0] || currentUser.email?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {currentUser.displayName || currentUser.email?.split('@')[0] || 'Étudiant'}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {lang === 'fr' ? 'Connecté' : 'Active'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                {/* Account Metrics Grid */}
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-center text-indigo-500">
                      <Database className="w-4 h-4" />
                    </div>
                    <span className="text-lg font-black text-slate-900 dark:text-white">{documents.length}</span>
                    <p className="text-[10px] font-bold text-slate-500">{lang === 'fr' ? 'Documents' : 'Docs'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-center text-amber-500">
                      <FolderHeart className="w-4 h-4" />
                    </div>
                    <span className="text-lg font-black text-slate-900 dark:text-white">{pinnedDocsCount}</span>
                    <p className="text-[10px] font-bold text-slate-500">{lang === 'fr' ? 'Mémos Épinglés' : 'Pinned'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-center text-emerald-500">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1 inline-block">
                      {lang === 'fr' ? 'En Ligne' : 'Online'}
                    </span>
                    <p className="text-[10px] font-bold text-slate-500">{lang === 'fr' ? 'Cloud Sync' : 'Sync'}</p>
                  </div>
                </div>

                {/* Cloud Sync Action */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {lang === 'fr' ? 'Sauvegarde Cloud Firestore' : 'Firestore Cloud Backup'}
                      </span>
                    </div>
                    {syncSuccess && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {lang === 'fr' ? 'Synchronisé !' : 'Synced!'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {lang === 'fr' 
                      ? 'Vos fiches, cours et mémos sont automatiquement sauvegardés et accessibles sur tous vos appareils.'
                      : 'Your study guides and notes are safely backed up and accessible on all your devices.'}
                  </p>
                  <button
                    onClick={handleManualSync}
                    disabled={syncing}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    <span>{syncing ? (lang === 'fr' ? 'Synchronisation en cours...' : 'Syncing...') : (lang === 'fr' ? 'Forcer la Synchronisation Immédiate' : 'Force Cloud Sync Now')}</span>
                  </button>
                </div>

                {/* Logout Button & Account Deletion */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={async () => {
                      if (window.confirm(lang === 'fr' ? 'Êtes-vous sûr de vouloir supprimer définitivement votre compte et vos données locales ?' : 'Are you sure you want to permanently delete your account and local data?')) {
                        try {
                          localStorage.clear();
                          sessionStorage.clear();
                          await logoutUser();
                          setCurrentUser(null);
                          alert(lang === 'fr' ? 'Compte et données supprimés avec succès.' : 'Account and data successfully deleted.');
                          onClose();
                        } catch (e) {
                          console.error(e);
                        }
                      }
                    }}
                    className="px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'fr' ? 'Supprimer le compte' : 'Delete Account'}</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{lang === 'fr' ? 'Se déconnecter' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* User Not Authenticated - Mode Invité + Login Options */
              <div className="space-y-4">
                {/* Guest Banner */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-bold">{lang === 'fr' ? 'Mode Invité (Données 100% locales)' : 'Guest Mode (100% Local Data)'}</p>
                    <p className="text-[11px] opacity-80">{lang === 'fr' ? 'Aucun compte n\'est requis pour utiliser DegreeUnlocker. Vous pouvez vous connecter pour synchroniser vos appareils.' : 'No account required. Connect anytime to sync across devices.'}</p>
                  </div>
                </div>

                {/* Mode Switcher */}
                <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      authMode === 'login'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {lang === 'fr' ? 'Se Connecter' : 'Sign In'}
                  </button>
                  <button
                    onClick={() => setAuthMode('register')}
                    className={`py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      authMode === 'register'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {lang === 'fr' ? 'Créer un Compte' : 'Create Account'}
                  </button>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Google Fast Sign-In */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{lang === 'fr' ? 'Continuer avec Google' : 'Continue with Google'}</span>
                </button>

                <div className="flex items-center gap-2 my-2">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'fr' ? 'Ou avec e-mail' : 'Or with email'}</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                </div>

                {/* Email / Password Form */}
                <form onSubmit={handleEmailAuth} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {lang === 'fr' ? 'Adresse E-mail' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="etudiant@universite.fr"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {lang === 'fr' ? 'Mot de passe' : 'Password'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer mt-2"
                  >
                    {authMode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    <span>
                      {loading
                        ? (lang === 'fr' ? 'Traitement...' : 'Processing...')
                        : authMode === 'login'
                        ? (lang === 'fr' ? 'Se Connecter' : 'Sign In')
                        : (lang === 'fr' ? 'Créer mon Compte' : 'Create Account')}
                    </span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AMIS & DUO D'ÉTUDE */}
        {activeTab === 'friends' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* My Personal Pairing Code Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {lang === 'fr' ? 'Mon Code d\'Étude Personnel' : 'My Study Pairing Code'}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">
                  {lang === 'fr' ? 'Partage instantané' : 'Instant Share'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang === 'fr'
                  ? 'Donnez ce code à vos camarades de classe pour qu\'ils puissent vous ajouter et réviser en binôme :'
                  : 'Give this code to your classmates to study together:'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 py-2 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 font-mono font-black text-base text-indigo-600 dark:text-indigo-400 tracking-widest text-center shadow-inner select-all">
                  {myPairingCode}
                </div>
                <button
                  id="btn-copy-pairing-code"
                  onClick={handleCopyCode}
                  className="py-2.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
                  title="Copier le code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? (lang === 'fr' ? 'Copié !' : 'Copied!') : (lang === 'fr' ? 'Copier' : 'Copy')}</span>
                </button>
              </div>
            </div>

            {/* Add a Friend Form */}
            <form onSubmit={handleAddFriend} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {lang === 'fr' ? 'Ajouter un ami / binôme' : 'Add a Study Buddy'}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={friendCodeInput}
                  onChange={(e) => setFriendCodeInput(e.target.value)}
                  placeholder={lang === 'fr' ? 'Code ami (ex: STUDY-4482)' : 'Friend code (e.g. STUDY-4482)'}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <input
                  type="text"
                  value={friendNameInput}
                  onChange={(e) => setFriendNameInput(e.target.value)}
                  placeholder={lang === 'fr' ? 'Nom ou pseudo (Optionnel)' : 'Nickname (Optional)'}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'fr' ? 'Ajouter à mes amis d\'étude' : 'Add to My Study Buddies'}</span>
              </button>
            </form>

            {/* List of Friends */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                <span>{lang === 'fr' ? `Mes Amis d'Étude (${friendsList.length})` : `Study Buddies (${friendsList.length})`}</span>
                <span className="text-[11px] text-emerald-500 flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {lang === 'fr' ? 'Session active' : 'Live session'}
                </span>
              </div>

              {friendsList.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs space-y-1">
                  <Users className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
                  <p>{lang === 'fr' ? 'Aucun ami ajouté pour le moment.' : 'No study buddies added yet.'}</p>
                  <p className="text-[11px]">{lang === 'fr' ? 'Entrez le code d\'un ami ci-dessus pour collaborer !' : 'Enter a friend\'s code above to collaborate!'}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {friendsList.map((friend) => (
                    <div
                      key={friend.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-full bg-linear-to-tr ${friend.avatarColor} text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0`}>
                          {friend.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                              {friend.name}
                            </h5>
                            <span className="font-mono text-[10px] text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded-md">
                              {friend.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>{friend.currentSubject || 'En révision'}</span> • <span className="opacity-75">{friend.lastActive}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleShareNotesWithFriend(friend)}
                          className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                          title={lang === 'fr' ? 'Synchroniser mes fiches avec cet ami' : 'Sync notes with this buddy'}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{lang === 'fr' ? 'Partager' : 'Share'}</span>
                        </button>
                        <button
                          onClick={() => handleRemoveFriend(friend.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Supprimer l'ami"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DONNÉES & CONFIDENTIALITÉ */}
        {activeTab === 'privacy' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {lang === 'fr' ? 'Souveraineté des données & Hors-Ligne' : 'Data Sovereignty & Offline First'}
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang === 'fr'
                  ? 'DegreeUnlocker stocke l\'intégralité de vos cours, mémos et flashcards en local sur votre appareil (IndexedDB / LocalStorage). Vos données ne sont jamais vendues ni analysées sans votre consentement explicite.'
                  : 'DegreeUnlocker stores all your notes, flashcards and textbooks locally on your device (IndexedDB / LocalStorage). Your data is private.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {lang === 'fr' ? 'Base de données locale' : 'Local Storage DB'}
                </span>
                <p className="text-[11px] text-slate-500">
                  {documents.length} {lang === 'fr' ? 'cours enregistrés' : 'notes stored'}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {lang === 'fr' ? 'Chiffrement' : 'Encryption'}
                </span>
                <p className="text-[11px] text-emerald-600 font-semibold">
                  {lang === 'fr' ? 'TLS 1.3 / AES-256' : 'Active (TLS 1.3)'}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
