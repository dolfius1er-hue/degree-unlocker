import React, { useState, useEffect } from 'react';
import { StoredLocalFile, AppLanguage } from '../types';
import { 
  HardDrive, 
  X, 
  FileText, 
  Download, 
  ExternalLink, 
  Trash2, 
  RefreshCw, 
  FolderCheck,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

interface LocalStorageBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  onSelectDoc?: (docId: string) => void;
}

export const LocalStorageBrowserModal: React.FC<LocalStorageBrowserModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectDoc,
}) => {
  const [files, setFiles] = useState<StoredLocalFile[]>([]);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [storageDir, setStorageDir] = useState<string>('data/uploads');
  const [capacityMb, setCapacityMb] = useState<number>(150);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/storage/files');
      if (!res.ok) throw new Error('Failed to fetch storage files');
      const data = await res.json();
      setFiles(data.files || []);
      setTotalSize(data.totalSizeBytes || 0);
      if (data.storageDirectory) setStorageDir(data.storageDirectory);
      if (data.capacityLimitMb) setCapacityMb(data.capacityLimitMb);
    } catch (err: any) {
      console.error('Storage fetch error:', err);
      setError(err.message || 'Error loading local storage files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalMb = (totalSize / (1024 * 1024)).toFixed(2);
  const usagePercent = Math.min(100, Math.round((Number(totalMb) / capacityMb) * 100));

  const handleDelete = async (filename: string) => {
    const confirmMsg = lang === 'fr' 
      ? `Supprimer définitivement "${filename}" du disque local ?`
      : `Permanently delete "${filename}" from local disk?`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingFile(filename);
    try {
      const res = await fetch(`/api/storage/files/${filename}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete file');
      setFiles(prev => prev.filter(f => f.fileName !== filename));
    } catch (err: any) {
      alert(err.message || 'Error deleting file');
    } finally {
      setDeletingFile(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 sm:pt-12">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-xs">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'fr' ? 'Stockage Local des Fichiers & PDF' : 'Local File Storage & PDF Directory'}
              </h3>
              <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                <FolderOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-sm">{storageDir}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchFiles}
              disabled={loading}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
              title={lang === 'fr' ? 'Rafraîchir' : 'Refresh'}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="px-6 py-3 bg-emerald-50/50 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span className="font-semibold text-emerald-950">
              {lang === 'fr' ? 'Capacité de stockage locale augmentée :' : 'Augmented Local Storage Capacity:'}
            </span>{' '}
            <span className="font-bold text-emerald-700 font-mono">{totalMb} MB</span>{' '}
            <span className="text-slate-500">/ {capacityMb} MB limit</span>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 w-full sm:w-48">
            <div className="w-full bg-emerald-200/70 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(4, usagePercent)}%` }}
              ></div>
            </div>
            <span className="font-mono text-[10px] font-bold text-emerald-800 shrink-0">{usagePercent}%</span>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-slate-600 font-medium">
            <span>
              {lang === 'fr' ? 'Fichiers enregistrés sur disque :' : 'Files stored on disk:'} ({files.length})
            </span>
            <span className="text-[11px] text-slate-500">
              {lang === 'fr' ? 'Stockage 100% hors-ligne local' : '100% Local offline storage'}
            </span>
          </div>

          {files.length === 0 && !loading && (
            <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-xl">
              <FolderCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-semibold text-sm">
                {lang === 'fr' ? 'Aucun fichier stocké pour le moment' : 'No local files stored yet'}
              </p>
              <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                {lang === 'fr'
                  ? 'Téléversez un PDF dans la bibliothèque pour le stocker automatiquement dans le dossier data/uploads/.'
                  : 'Upload a PDF or note in the library to automatically persist it in the data/uploads/ folder.'}
              </p>
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {files.map((file) => (
              <div key={file.fileName} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0 mt-0.5 border border-indigo-100">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-xs truncate max-w-xs sm:max-w-md" title={file.originalName}>
                      {file.originalName}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-700">
                        {file.sizeFormatted}
                      </span>
                      <span>•</span>
                      <span>{new Date(file.storedAt).toLocaleDateString()}</span>
                      {file.associatedDocTitle && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 font-medium truncate max-w-[150px]">
                            {file.associatedDocTitle}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={file.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title={lang === 'fr' ? 'Ouvrir / Prévisualiser' : 'Open / Preview'}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href={file.downloadUrl}
                    download={file.originalName}
                    className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title={lang === 'fr' ? 'Télécharger' : 'Download'}
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(file.fileName)}
                    disabled={deletingFile === file.fileName}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title={lang === 'fr' ? 'Supprimer' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            {lang === 'fr' ? 'Capacité locale : jusqu\'à 150 MB par requête' : 'Local capacity: up to 150 MB per upload'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            {lang === 'fr' ? 'Fermer' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
