import React, { useId, useState } from 'react';
import { ShieldCheck, X, ExternalLink, Copy, Check, Lock, FileText } from 'lucide-react';
import { AppLanguage } from '../types';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: AppLanguage;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  lang = 'fr',
}) => {
  const baseId = useId();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const publicPrivacyUrl = `${window.location.origin}/privacy`;
  const publicTermsUrl = `${window.location.origin}/terms`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeTab === 'privacy' ? publicPrivacyUrl : publicTermsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id={`${baseId}-overlay`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id={`${baseId}-container`}
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-400 p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>{lang === 'fr' ? 'Confidentialité & Mentions Légales' : 'Privacy & Terms'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Google API Compliant
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'fr'
                  ? 'Protection de vos données académiques et règles d\'accès Google Workspace'
                  : 'Academic data protection & Google Workspace User Data compliance'}
              </p>
            </div>
          </div>

          <button
            id={`${baseId}-close-btn`}
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-bar: Tabs & Copy Link */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-800/50'
              }`}
            >
              <Lock className="w-3 h-3 inline mr-1.5" />
              {lang === 'fr' ? 'Politique de Confidentialité' : 'Privacy Policy'}
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-800/50'
              }`}
            >
              <FileText className="w-3 h-3 inline mr-1.5" />
              {lang === 'fr' ? 'Conditions d\'Utilisation' : 'Terms of Service'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copier l'URL publique pour Google Cloud Console"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (lang === 'fr' ? 'Lien copié !' : 'Link copied!') : (lang === 'fr' ? 'Copier le lien public' : 'Copy public URL')}</span>
            </button>
            <a
              href={activeTab === 'privacy' ? '/privacy' : '/terms'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Ouvrir la page publique dans un nouvel onglet"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-300 text-xs sm:text-sm space-y-4 leading-relaxed">
          {activeTab === 'privacy' ? (
            <>
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200">
                <p className="font-bold text-sm mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Conformité Google API Services User Data Policy</span>
                </p>
                <p className="text-xs text-emerald-300/90">
                  L'utilisation et le transfert par Degree Unlocker des informations reçues des API Google (Drive, Docs) vers toute autre application sont strictement conformes aux Règles d'utilisation des données utilisateur des services d'API Google, y compris les exigences d'utilisation limitée (Limited Use requirements).
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">1. Finalité de l'accès aux données Google Drive & Docs</h4>
                <p className="text-slate-400">
                  L'application sollicite l'accès à Google Drive et Google Docs exclusivement sur action délibérée de l'utilisateur pour :
                </p>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-300 pl-2">
                  <li>Lister les documents de cours (PDFs et Google Docs) stockés sur votre compte Drive.</li>
                  <li>Extraire le contenu textuel d'un document sélectionné afin de générer vos synthèses Cornell, fiches mémo et flashcards.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">2. Confidentialité & Absence de revente</h4>
                <p className="text-slate-400">
                  <strong>Aucune donnée personnelle ou académique n'est vendue, louée ou cédée à des tiers.</strong> Les contenus de vos cours ne sont jamais utilisés pour entraîner des modèles publics d'intelligence artificielle.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">3. Stockage et Sécurité</h4>
                <p className="text-slate-400">
                  Vos documents restent sous votre contrôle : stockés localement sur votre appareil et synchronisés de manière chiffrée sur votre base de données privée Cloud Firestore.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">4. Révocation des accès</h4>
                <p className="text-slate-400">
                  Vous pouvez révoquer les accès à tout moment depuis les paramètres de votre compte Google sur <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">myaccount.google.com/permissions</a>.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 text-slate-500 text-xs">
                Contact DPO / Support : <span className="text-slate-400 font-mono">dolfius1er@gmail.com</span>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="font-bold text-white text-sm mb-1">1. Objet du Service</h4>
                <p className="text-slate-400">
                  Degree Unlocker est une plateforme d'assistance aux études supérieures et révisions scolaires, fournissant des outils d'ingestion de cours, d'organisation Cornell, et de répétition espacée.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">2. Propriété Intellectuelle</h4>
                <p className="text-slate-400">
                  L'utilisateur conserve l'entière propriété intellectuelle de ses notes de cours et documents. L'utilisateur s'engage à n'importer que des documents dont il détient les droits d'usage pédagogique.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">3. Responsabilité</h4>
                <p className="text-slate-400">
                  Degree Unlocker s'efforce de garantir la haute disponibilité du service hébergé sur Google Cloud Run. Les synthèses générées par IA sont des aides à la mémorisation et doivent être vérifiées par l'étudiant avec ses cours officiels.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Degree Unlocker &bull; Hébergé sur Google Cloud</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
          >
            {lang === 'fr' ? 'Fermer' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
