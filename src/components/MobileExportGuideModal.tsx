import React, { useState } from 'react';
import { SchoolDocument, AppLanguage } from '../types';
import { 
  Smartphone, 
  Share2, 
  Download, 
  Cloud, 
  FileText, 
  Check, 
  X, 
  Copy, 
  Laptop, 
  ExternalLink,
  Sparkles,
  ArrowRight,
  Send,
  HelpCircle
} from 'lucide-react';

interface MobileExportGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: SchoolDocument[];
  onOpenBackup: () => void;
  onOpenAuthSync: () => void;
  lang?: AppLanguage;
}

export const MobileExportGuideModal: React.FC<MobileExportGuideModalProps> = ({
  isOpen,
  onClose,
  documents,
  onOpenBackup,
  onOpenAuthSync,
  lang = 'fr',
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Share complete courses summary via Web Share API
  const handleShareMobile = async () => {
    const docCount = documents.length;
    const title = 'Degree Unlocker Lite - Export Cours & Notes';
    const sampleTitles = documents.slice(0, 5).map(d => `• ${d.title} (${d.subject})`).join('\n');
    const text = lang === 'fr'
      ? `📚 Mes Notes Degree Unlocker Lite (${docCount} documents) :\n\n${sampleTitles}\n\n${docCount > 5 ? `... et ${docCount - 5} autres cours.\n` : ''}Accédez à vos révisions : ${window.location.origin}`
      : `📚 My Degree Unlocker Lite Notes (${docCount} documents):\n\n${sampleTitles}\n\nAccess your revisions: ${window.location.origin}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: window.location.origin,
        });
        setShareSuccess(lang === 'fr' ? 'Partagé avec succès !' : 'Shared successfully!');
        setTimeout(() => setShareSuccess(null), 3000);
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Share error:', err);
        }
      }
    }

    // Fallback: Copy to clipboard
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // 2. Download a lightweight text summary of all notes
  const handleDownloadAllText = () => {
    try {
      const header = `====================================================\nDEGREE UNLOCKER LITE - EXPORT DE MES COURS\nDate: ${new Date().toLocaleDateString()}\nTotal Documents: ${documents.length}\n====================================================\n\n`;
      const body = documents.map((doc, i) => {
        return `----------------------------------------------------\n[#${i + 1}] ${doc.title.toUpperCase()}\nMatière: ${doc.subject} | Date: ${doc.date}\n----------------------------------------------------\n${doc.summary ? `RÉSUMÉ :\n${doc.summary}\n\n` : ''}CONTENU :\n${doc.content}\n\n`;
      }).join('\n');

      const blob = new Blob([header + body], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DegreeUnlocker_Mes_Cours_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShareSuccess(lang === 'fr' ? 'Fichier texte téléchargé !' : 'Text summary downloaded!');
      setTimeout(() => setShareSuccess(null), 3000);
    } catch (err) {
      console.warn('Download error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent dark:from-amber-500/5 dark:via-indigo-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
                {lang === 'fr' ? 'Exporter depuis votre Téléphone' : 'Export from Your Phone'}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                  Mobile Hub
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'fr' 
                  ? 'Comment transférer et sauvegarder vos cours et fiches en 1 clic.' 
                  : 'How to transfer and save your courses and revision notes in 1 tap.'}
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

        {/* Notifications Toast */}
        {shareSuccess && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>{shareSuccess}</span>
          </div>
        )}

        {copiedLink && (
          <div className="mx-5 mt-4 p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-300 dark:border-indigo-800 rounded-xl text-indigo-800 dark:text-indigo-200 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-indigo-500" />
            <span>{lang === 'fr' ? 'Texte et résumé copiés dans le presse-papier !' : 'Summary copied to clipboard!'}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">

          {/* Quick Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Option 1: Native Mobile Share */}
            <button
              type="button"
              onClick={handleShareMobile}
              className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-slate-800/80 border border-indigo-200 dark:border-indigo-800/60 flex flex-col justify-between text-left hover:shadow-md transition-all group cursor-pointer"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                  <Share2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  {lang === 'fr' ? '1. Partage Mobile Direct' : '1. Direct Mobile Share'}
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {lang === 'fr'
                    ? 'Envoyez vos cours sur WhatsApp, Google Drive, Gmail ou enregistrez dans vos Fichiers (iOS / Android).'
                    : 'Send notes to WhatsApp, Google Drive, Gmail, or save to your mobile Files app.'}
                </p>
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>{lang === 'fr' ? 'Partager maintenant' : 'Share now'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Option 2: Cloud Sync to PC */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuthSync();
              }}
              className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-slate-800/80 border border-emerald-200 dark:border-emerald-800/60 flex flex-col justify-between text-left hover:shadow-md transition-all group cursor-pointer"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                  <Laptop className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  {lang === 'fr' ? '2. Synchroniser vers mon PC' : '2. Sync to my PC'}
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {lang === 'fr'
                    ? 'Liez votre téléphone à votre ordinateur avec un code 6 chiffres (sans mot de passe) ou votre compte.'
                    : 'Link phone to PC via a simple 6-digit code (no password needed) or account.'}
                </p>
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>{lang === 'fr' ? 'Ouvrir la Liaison PC' : 'Open PC Link'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Option 3: Full JSON Backup */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBackup();
              }}
              className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-slate-800/80 border border-amber-200 dark:border-amber-800/60 flex flex-col justify-between text-left hover:shadow-md transition-all group cursor-pointer"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                  <Download className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  {lang === 'fr' ? '3. Fichier Sauvegarde .JSON' : '3. Full .JSON Backup'}
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {lang === 'fr'
                    ? 'Téléchargez une archive intégrale de tous vos cours, flashcards, vocabulaire et scores de quiz.'
                    : 'Download a complete offline file of all your notes, flashcards, vocabulary and quiz stats.'}
                </p>
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                <span>{lang === 'fr' ? 'Télécharger la sauvegarde' : 'Download backup'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Option 4: Text Document (.txt) */}
            <button
              type="button"
              onClick={handleDownloadAllText}
              className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/40 dark:to-slate-800/80 border border-sky-200 dark:border-sky-800/60 flex flex-col justify-between text-left hover:shadow-md transition-all group cursor-pointer"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  {lang === 'fr' ? '4. Exporter en Document Texte' : '4. Export as Text Notes'}
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {lang === 'fr'
                    ? 'Générez un document texte clair contenant l\'intégralité de vos cours, lisible sur n\'importe quel smartphone.'
                    : 'Generate a clean text file containing all your notes, readable on any phone.'}
                </p>
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400">
                <span>{lang === 'fr' ? 'Télécharger (.txt)' : 'Download (.txt)'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

          </div>

          {/* Step-by-Step Mobile Instructions */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              {lang === 'fr' ? 'Guide : Comment exporter sur votre smartphone' : 'Guide: How to export on your phone'}
            </h4>
            
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  <strong>{lang === 'fr' ? 'Sur chaque cours :' : 'On any individual note:'}</strong>{' '}
                  {lang === 'fr' 
                    ? 'Cliquez sur l\'icône de partage ou de téléchargement pour exporter uniquement ce cours vers WhatsApp ou vos Fichiers.' 
                    : 'Tap the share or download icon on the note card to send that specific course.'}
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  <strong>{lang === 'fr' ? 'Pour tout transférer sur PC sans fil :' : 'Wireless transfer to PC:'}</strong>{' '}
                  {lang === 'fr'
                    ? 'Ouvrez "Liaison Téléphone ↔ PC" ci-dessus. Tout cours photographié ou modifié sur votre téléphone apparaît en temps réel sur votre écran d\'ordinateur.'
                    : 'Open "Phone ↔ PC Link" above. Any note snapped or edited on mobile updates live on your PC.'}
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  <strong>{lang === 'fr' ? 'Sauvegarde Google Drive / Fichiers :' : 'Google Drive / iCloud Backup:'}</strong>{' '}
                  {lang === 'fr'
                    ? 'Le bouton "Fichier Sauvegarde .JSON" crée une copie que vous pouvez enregistrer dans iCloud, Google Drive ou envoyer par mail pour ne jamais rien perdre.'
                    : 'The .JSON backup button creates a file you can save to iCloud, Google Drive or email to keep your data forever.'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {documents.length} {lang === 'fr' ? 'documents prêts pour l\'export' : 'notes ready to export'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            {lang === 'fr' ? 'Fermer' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
