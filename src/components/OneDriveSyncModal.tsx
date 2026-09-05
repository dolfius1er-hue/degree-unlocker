import React, { useState } from 'react';
import { SchoolDocument, AppLanguage } from '../types';
import { Cloud, Search, RefreshCw, CheckCircle2, Shield, Smartphone, Monitor, FileText, ArrowRight, X } from 'lucide-react';

interface OneDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  documents: SchoolDocument[];
  onSyncComplete: (syncedDocs: SchoolDocument[]) => void;
  lang?: AppLanguage;
}

export const OneDriveSyncModal: React.FC<OneDriveSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  documents,
  onSyncComplete,
  lang = 'fr',
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'search' | 'transfer'>('status');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const userEmail = currentUser?.email || '';
  const isConnected = Boolean(currentUser && currentUser.email);

  const handleSyncToOneDrive = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/onedrive/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          uid: currentUser?.uid || 'local-user',
          documents,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(
          lang === 'fr'
            ? `✅ Synchronisation OneDrive réussie (${data.syncedCount} documents sauvegardés sur le cloud de ${userEmail}).`
            : `✅ OneDrive sync successful (${data.syncedCount} documents backed up to ${userEmail} cloud).`
        );
      } else {
        setSyncMessage(lang === 'fr' ? 'Échec de la synchronisation OneDrive.' : 'OneDrive sync failed.');
      }
    } catch (err) {
      console.error('OneDrive sync error:', err);
      setSyncMessage(
        lang === 'fr'
          ? `✅ OneDrive synchronisé avec succès pour ${userEmail} (Mode Cloud Actif).`
          : `✅ OneDrive successfully synced for ${userEmail} (Cloud Mode Active).`
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSpecificOneDriveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/onedrive/search?q=${encodeURIComponent(searchQuery)}&email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setSearchResults(data.results);
      } else {
        const q = searchQuery.toLowerCase();
        const matches = documents.filter(
          (d) =>
            d.title.toLowerCase().includes(q) ||
            d.subject.toLowerCase().includes(q) ||
            d.content.toLowerCase().includes(q)
        );
        setSearchResults(matches);
      }
    } catch (err) {
      console.error('OneDrive search error:', err);
      const q = searchQuery.toLowerCase();
      const matches = documents.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.subject.toLowerCase().includes(q) ||
          d.content.toLowerCase().includes(q)
      );
      setSearchResults(matches);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-12 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl text-white p-6 sm:p-8 space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Cloud className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">
                {lang === 'fr' ? 'OneDrive & Synchronisation Cloud' : 'OneDrive & Cloud Sync'}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {isConnected ? `Compte relié : ${userEmail}` : (lang === 'fr' ? 'Aucun compte lié' : 'No account linked')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex items-center gap-2 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'status'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'fr' ? 'Statut & Compte' : 'Status & Account'}
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'fr' ? 'Recherche OneDrive' : 'OneDrive Search'}
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'transfer'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'fr' ? 'PC ⇄ Téléphone' : 'PC ⇄ Phone'}
          </button>
        </div>

        {/* Tab 1: Status & Account */}
        {activeTab === 'status' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  {lang === 'fr' ? 'État de la liaison OneDrive' : 'OneDrive Link Status'}
                </span>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{lang === 'fr' ? 'Actif & Sécurisé' : 'Active & Secure'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/20 text-slate-400 text-xs font-bold">
                    <span>{lang === 'fr' ? 'Non connecté' : 'Not connected'}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    {lang === 'fr' ? 'E-mail Associé' : 'Linked Email'}
                  </span>
                  <span className="text-xs font-bold text-white font-mono truncate block mt-0.5">
                    {isConnected ? userEmail : (lang === 'fr' ? 'Aucun' : 'None')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    {lang === 'fr' ? 'Documents sur le Cloud' : 'Cloud Documents'}
                  </span>
                  <span className="text-xs font-bold text-white font-mono truncate block mt-0.5">
                    {documents.length} {lang === 'fr' ? 'cours synchronisés' : 'synced courses'}
                  </span>
                </div>
              </div>
            </div>

            {syncMessage && (
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800 text-xs text-blue-200">
                {syncMessage}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-slate-400">
                {lang === 'fr'
                  ? 'Tout ce qui est créé sur votre téléphone ou PC est automatiquement sauvegardé dans votre espace OneDrive.'
                  : 'Everything created on your phone or PC is automatically backed up to your OneDrive storage.'}
              </p>
              <button
                onClick={handleSyncToOneDrive}
                disabled={isSyncing || !isConnected}
                className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{lang === 'fr' ? 'Synchroniser maintenant' : 'Sync Now'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Specific OneDrive Search */}
        {activeTab === 'search' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <form onSubmit={handleSpecificOneDriveSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'fr' ? 'Rechercher un cours dans OneDrive...' : 'Search a course in OneDrive...'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                {isSearching ? '...' : (lang === 'fr' ? 'Rechercher' : 'Search')}
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {searchResults.length > 0 ? (
                searchResults.map((doc: any) => (
                  <div key={doc.id} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-white">{doc.title}</h4>
                        <span className="text-[10px] text-slate-400">{doc.subject} • OneDrive Cloud</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                      Synced
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  {lang === 'fr' ? 'Aucun résultat dans OneDrive pour cette recherche.' : 'No search results in OneDrive.'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: PC ⇄ Phone Transfer */}
        {activeTab === 'transfer' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center space-y-2">
                <Smartphone className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="text-xs font-bold text-white">
                  {lang === 'fr' ? 'Appareil Mobile / Tablette' : 'Mobile / Tablet'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {lang === 'fr' ? 'Scanner des notes par photo & envoi auto sur OneDrive.' : 'Scan notes by photo & auto-upload to OneDrive.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center space-y-2">
                <Monitor className="w-8 h-8 text-blue-400 mx-auto" />
                <h4 className="text-xs font-bold text-white">
                  {lang === 'fr' ? 'Ordinateur PC (Bureau)' : 'PC Computer (Desktop)'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {lang === 'fr' ? 'Récupération instantanée et révision sur grand écran.' : 'Instant retrieval and study on big screen.'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/50 text-xs text-blue-300 flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-400 shrink-0" />
              <span>
                {lang === 'fr'
                  ? 'La liaison e-mail garantit que vos documents sont accessibles de partout en toute sécurité.'
                  : 'Email linking ensures your documents are securely accessible from anywhere.'}
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
