import React, { useState, useEffect } from 'react';
import { 
  AppLanguage, 
  AppTheme, 
  PendingSyncItem, 
  SyncStatusReport,
  SyncItemType,
  SyncOperationAction
} from '../types';
import { offlineStorageService } from '../services/offlineStorageService';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Database, 
  Trash2, 
  Play, 
  X, 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck, 
  Zap, 
  HardDrive, 
  FileText, 
  Layers, 
  CheckSquare, 
  HelpCircle, 
  Activity, 
  Wifi, 
  WifiOff, 
  Info,
  Server
} from 'lucide-react';

interface OfflineSyncManagerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  activeTheme?: AppTheme;
}

export const OfflineSyncManager: React.FC<OfflineSyncManagerProps> = ({
  isOpen,
  onClose,
  lang,
  activeTheme = 'light'
}) => {
  const isFr = lang === 'fr';

  const [syncStatus, setSyncStatus] = useState<SyncStatusReport>({
    isSyncing: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingCount: 0,
    failedCount: 0,
    syncedCount: 0,
    totalCount: 0,
    lastSyncTime: null,
    queue: []
  });

  const [diagnostics, setDiagnostics] = useState<{
    docCount: number;
    flashcardCount: number;
    vocabularyCount: number;
    quizCount: number;
    queueCount: number;
    estimatedSizeKb: number;
  }>({
    docCount: 0,
    flashcardCount: 0,
    vocabularyCount: 0,
    quizCount: 0,
    queueCount: 0,
    estimatedSizeKb: 0
  });

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'failed' | 'synced'>('all');
  const [isRetryingAll, setIsRetryingAll] = useState(false);
  const [retryingItemId, setRetryingItemId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Subscribe to real-time sync status from offlineStorageService
  useEffect(() => {
    const unsubscribe = offlineStorageService.subscribeSyncStatus((status) => {
      setSyncStatus(status);
    });

    // Fetch initial diagnostics
    offlineStorageService.getStorageDiagnostics().then(setDiagnostics);

    return () => {
      unsubscribe();
    };
  }, []);

  if (!isOpen) return null;

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const handleManualRetryAll = async () => {
    setIsRetryingAll(true);
    try {
      const synced = await offlineStorageService.processSyncQueue();
      const updated = await offlineStorageService.getSyncStatus();
      setSyncStatus(updated);
      
      if (synced > 0) {
        showToast(
          isFr 
            ? `${synced} opération(s) synchronisée(s) avec succès vers le Cloud !` 
            : `${synced} operations successfully synced to the cloud!`,
          'success'
        );
      } else if (updated.failedCount > 0) {
        showToast(
          isFr 
            ? `Synchronisation terminée. ${updated.failedCount} opération(s) ont échoué (réseau indisponible).` 
            : `Sync completed. ${updated.failedCount} operations failed (network unreachable).`,
          'error'
        );
      } else {
        showToast(
          isFr ? 'Aucune opération en attente. Tout est à jour !' : 'No pending operations. Everything is in sync!',
          'info'
        );
      }
    } catch (e) {
      showToast(isFr ? 'Erreur lors de la synchronisation' : 'Error during sync', 'error');
    } finally {
      setIsRetryingAll(false);
      offlineStorageService.getStorageDiagnostics().then(setDiagnostics);
    }
  };

  const handleRetrySingleItem = async (id: string) => {
    setRetryingItemId(id);
    try {
      const success = await offlineStorageService.retryItem(id);
      if (success) {
        showToast(isFr ? 'Élément synchronisé avec succès !' : 'Item synced successfully!', 'success');
      } else {
        showToast(isFr ? 'Échec de la synchronisation de cet élément' : 'Failed to sync this item', 'error');
      }
    } finally {
      setRetryingItemId(null);
      offlineStorageService.getStorageDiagnostics().then(setDiagnostics);
    }
  };

  const handleRemoveItem = async (id: string) => {
    await offlineStorageService.removePendingChange(id);
    showToast(isFr ? 'Opération retirée de la file' : 'Operation removed from queue', 'info');
    offlineStorageService.getStorageDiagnostics().then(setDiagnostics);
  };

  const handleClearSynced = async () => {
    await offlineStorageService.clearSyncedItems();
    showToast(isFr ? 'Historique des synchronisations nettoyé' : 'Synced history cleared', 'info');
    offlineStorageService.getStorageDiagnostics().then(setDiagnostics);
  };

  const handleSimulateChange = async (type: SyncItemType) => {
    const item = await offlineStorageService.simulateOfflineChange(type);
    showToast(
      isFr 
        ? `Modification hors-ligne simulée ajoutée à la file : « ${item.title} »` 
        : `Simulated offline edit queued: "${item.title}"`,
      'info'
    );
    offlineStorageService.getStorageDiagnostics().then(setDiagnostics);
  };

  const filteredQueue = syncStatus.queue.filter(item => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'pending') return item.status === 'pending' || item.status === 'syncing';
    if (selectedFilter === 'failed') return item.status === 'failed';
    if (selectedFilter === 'synced') return item.status === 'synced';
    return true;
  });

  const getItemTypeBadge = (type: SyncItemType) => {
    switch (type) {
      case 'document':
        return { label: isFr ? 'DOCUMENT' : 'DOC', bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' };
      case 'flashcard':
        return { label: 'FLASHCARD', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      case 'quiz_score':
        return { label: 'QUIZ', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'study_goal':
        return { label: isFr ? 'OBJECTIF' : 'GOAL', bg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };
      case 'note':
        return { label: 'MÉMO', bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
      default:
        return { label: 'DATA', bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30' };
    }
  };

  const getActionBadge = (action: SyncOperationAction) => {
    switch (action) {
      case 'create':
        return { label: 'CREATE', color: 'text-emerald-400' };
      case 'update':
        return { label: 'UPDATE', color: 'text-cyan-400' };
      case 'delete':
        return { label: 'DELETE', color: 'text-rose-400' };
      default:
        return { label: 'SYNC', color: 'text-indigo-400' };
    }
  };

  const formatTimestamp = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return isFr ? 'À l\'instant' : 'Just now';
    if (mins < 60) return isFr ? `Il y a ${mins} min` : `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return isFr ? `Il y a ${hours}h` : `${hours}h ago`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 flex min-h-full items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 text-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/40 text-white shrink-0">
              <Server className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {isFr ? 'Gestionnaire de Synchronisation Hors-Ligne' : 'Offline Sync & Cloud Queue Manager'}
                </h3>
                {/* Live Online / Offline Ping Status */}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase flex items-center gap-1.5 border ${
                  syncStatus.isOnline 
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}>
                  {syncStatus.isOnline ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>{isFr ? 'En Ligne (Connecté)' : 'Online (Connected)'}</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-amber-400" />
                      <span>{isFr ? 'Hors-Ligne' : 'Offline Mode'}</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFr 
                  ? 'Surveillez les opérations IndexedDB en attente et forcez la synchronisation vers le Cloud' 
                  : 'Monitor pending IndexedDB database operations and manually force cloud sync'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
            title={isFr ? "Fermer" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Toast message if any */}
        {feedbackMessage && (
          <div className={`mx-4 sm:mx-6 mt-4 p-3 rounded-xl border text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in duration-200 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : feedbackMessage.type === 'error'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
          }`}>
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {feedbackMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {feedbackMessage.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
              <span>{feedbackMessage.text}</span>
            </div>
            <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 scrollbar-thin max-h-[75vh]">

          {/* KPI Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* KPI 1: En Attente */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>{isFr ? 'En Attente' : 'Pending'}</span>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {syncStatus.pendingCount}
              </div>
              <div className="text-[10px] text-slate-400">
                {isFr ? 'Modifications locales' : 'Local edits queued'}
              </div>
            </div>

            {/* KPI 2: Échecs / Erreurs */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>{isFr ? 'Échecs' : 'Failed'}</span>
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-400 font-mono">
                {syncStatus.failedCount}
              </div>
              <div className="text-[10px] text-slate-400">
                {isFr ? 'Nécessitent un retry' : 'Need cloud retry'}
              </div>
            </div>

            {/* KPI 3: Synchronisés */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>{isFr ? 'Synchronisés' : 'Synced'}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {syncStatus.syncedCount}
              </div>
              <div className="text-[10px] text-slate-400">
                {isFr ? 'Validés sur le Cloud' : 'Confirmed on Cloud'}
              </div>
            </div>

            {/* KPI 4: Base IndexedDB */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>{isFr ? 'IndexedDB' : 'IndexedDB'}</span>
                <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {diagnostics.estimatedSizeKb} <span className="text-xs font-normal text-slate-400">KB</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {diagnostics.docCount} docs • {diagnostics.flashcardCount} cards
              </div>
            </div>

          </div>

          {/* Action Toolbar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 text-indigo-400 ${syncStatus.isSyncing || isRetryingAll ? 'animate-spin' : ''}`} />
                <span>{isFr ? 'Actions de Synchronisation Cloud' : 'Cloud Synchronization Actions'}</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                {syncStatus.lastSyncTime 
                  ? `${isFr ? 'Dernière sync réussie :' : 'Last successful sync:'} ${new Date(syncStatus.lastSyncTime).toLocaleTimeString()}`
                  : (isFr ? 'Prêt à synchroniser les modifications locales' : 'Ready to push local changes to cloud')}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Force Cloud Sync Button (Manual Retry of all) */}
              <button
                onClick={handleManualRetryAll}
                disabled={isRetryingAll || syncStatus.isSyncing}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${isRetryingAll || syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                <span>
                  {isRetryingAll || syncStatus.isSyncing
                    ? (isFr ? 'SYNCHRONISATION EN COURS...' : 'SYNCING...')
                    : (isFr ? 'FORCER LA SYNCHRONISATION' : 'FORCE CLOUD SYNC')}
                </span>
              </button>

              {/* Clear completed button */}
              {syncStatus.syncedCount > 0 && (
                <button
                  onClick={handleClearSynced}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  title={isFr ? "Vider les éléments déjà synchronisés" : "Clear synced items"}
                >
                  {isFr ? 'Nettoyer' : 'Clear Synced'}
                </button>
              )}
            </div>
          </div>

          {/* Test Offline Queue Simulation Box */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-xs text-slate-300">
                <span className="font-bold text-white">{isFr ? 'Tester le moteur hors-ligne :' : 'Test Offline Engine :'}</span>{" "}
                {isFr ? 'Simuler une action locale pour observer la file de synchronisation.' : 'Simulate an offline edit to see the sync queue in action.'}
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap shrink-0">
              <button
                onClick={() => handleSimulateChange('document')}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition-all cursor-pointer"
              >
                + Doc
              </button>
              <button
                onClick={() => handleSimulateChange('flashcard')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-all cursor-pointer"
              >
                + Flashcard
              </button>
              <button
                onClick={() => handleSimulateChange('quiz_score')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition-all cursor-pointer"
              >
                + Quiz
              </button>
              <button
                onClick={() => handleSimulateChange('study_goal')}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold transition-all cursor-pointer"
              >
                + Objectif
              </button>
            </div>
          </div>

          {/* Queue Filter Tabs */}
          <div className="flex items-center justify-between gap-2 pt-1 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {isFr ? 'Tous' : 'All'} ({syncStatus.totalCount})
              </button>
              <button
                onClick={() => setSelectedFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === 'pending'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {isFr ? 'En attente' : 'Pending'} ({syncStatus.pendingCount})
              </button>
              <button
                onClick={() => setSelectedFilter('failed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === 'failed'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {isFr ? 'Échecs' : 'Failed'} ({syncStatus.failedCount})
              </button>
              <button
                onClick={() => setSelectedFilter('synced')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === 'synced'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {isFr ? 'Synchronisés' : 'Synced'} ({syncStatus.syncedCount})
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
              {filteredQueue.length} {isFr ? 'élément(s)' : 'item(s)'}
            </div>
          </div>

          {/* Queue Items List */}
          {filteredQueue.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">
                {isFr ? 'File de synchronisation vide' : 'Sync Queue is Empty'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isFr 
                  ? 'Toutes vos créations, fiches et notes sont parfaitement synchronisées avec le Cloud et sauvegardées dans votre base locale.' 
                  : 'All your documents, cards and notes are in sync with the cloud and preserved in local cache.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredQueue.map((item) => {
                const typeBadge = getItemTypeBadge(item.itemType);
                const actionBadge = getActionBadge(item.action);
                const isRetryingThis = retryingItemId === item.id;

                return (
                  <div 
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      item.status === 'failed'
                        ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60'
                        : item.status === 'synced'
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-indigo-500/40'
                    }`}
                  >
                    {/* Left Details */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Type Badge */}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-black border uppercase ${typeBadge.bg}`}>
                          {typeBadge.label}
                        </span>
                        
                        {/* Action Badge */}
                        <span className={`text-[10px] font-mono font-bold ${actionBadge.color}`}>
                          [{actionBadge.label}]
                        </span>

                        {/* Status Icon & Label */}
                        <div className="flex items-center gap-1 text-[11px] font-bold">
                          {item.status === 'pending' && (
                            <span className="text-amber-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {isFr ? 'En attente' : 'Pending'}
                            </span>
                          )}
                          {item.status === 'syncing' && (
                            <span className="text-indigo-400 flex items-center gap-1 animate-pulse">
                              <RefreshCw className="w-3 h-3 animate-spin" /> {isFr ? 'Synchronisation...' : 'Syncing...'}
                            </span>
                          )}
                          {item.status === 'failed' && (
                            <span className="text-rose-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> {isFr ? 'Échec' : 'Failed'}
                            </span>
                          )}
                          {item.status === 'synced' && (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {isFr ? 'Synchronisé' : 'Synced'}
                            </span>
                          )}
                        </div>

                        {/* Timestamp */}
                        <span className="text-[10px] text-slate-500">
                          • {formatTimestamp(item.timestamp)}
                        </span>

                        {/* Attempts count if any */}
                        {item.attempts > 0 && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {item.attempts} {isFr ? 'tentative(s)' : 'attempt(s)'}
                          </span>
                        )}
                      </div>

                      {/* Item Title */}
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        {item.title}
                      </h4>

                      {/* Error details if failed */}
                      {item.lastError && (
                        <p className="text-[11px] text-rose-300/90 font-mono bg-rose-950/40 px-2 py-1 rounded-lg border border-rose-800/40">
                          {isFr ? 'Détail erreur :' : 'Error:'} {item.lastError}
                        </p>
                      )}
                    </div>

                    {/* Right Item Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {item.status !== 'synced' && (
                        <button
                          onClick={() => handleRetrySingleItem(item.id)}
                          disabled={isRetryingThis}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          title={isFr ? "Réessayer la synchronisation" : "Retry sync"}
                        >
                          <RefreshCw className={`w-3 h-3 ${isRetryingThis ? 'animate-spin' : ''}`} />
                          <span>{isFr ? 'Réessayer' : 'Retry'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title={isFr ? "Supprimer de la file" : "Delete from queue"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isFr ? 'Garantie Zero-Perte • IndexedDB + Cloud Sync' : 'Zero Data Loss Guarantee • IndexedDB + Cloud'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            {isFr ? 'Fermer' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
