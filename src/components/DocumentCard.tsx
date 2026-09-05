import React, { useState } from 'react';
import { SchoolDocument, AppLanguage, CustomTag } from '../types';
import { getSubjectBadgeClass, formatFileSize } from '../utils/colors';
import { TAG_COLORS } from './TagManagerModal';
import { TagAssignPopover } from './TagAssignPopover';
import { 
  FileText, 
  FileCheck, 
  PenTool, 
  Sparkles, 
  Trash2, 
  Edit3, 
  Tag, 
  Calendar,
  Layers, 
  ArrowRight,
  Brain,
  Zap,
  Languages,
  Plus,
  Smartphone,
  Highlighter
} from 'lucide-react';

interface DocumentCardProps {
  document: SchoolDocument;
  onOpenBlocknote: (doc: SchoolDocument) => void;
  onSummarize: (doc: SchoolDocument) => void;
  onEdit: (doc: SchoolDocument) => void;
  onDelete: (id: string) => void;
  onOpenFlashcards?: (doc: SchoolDocument) => void;
  onOpenQuiz?: (doc: SchoolDocument) => void;
  onOpenBilingual?: (doc: SchoolDocument) => void;
  onOpenAnnotate?: (doc: SchoolDocument) => void;
  isSelectedForBlocknote?: boolean;
  lang?: AppLanguage;
  allTags?: string[];
  customTags?: CustomTag[];
  onUpdateTags?: (docId: string, tags: string[]) => void;
  onCreateTag?: (newTag: CustomTag) => void;
  onFilterByTag?: (tag: string) => void;
  onSendToPhone?: (doc: SchoolDocument) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onOpenBlocknote,
  onSummarize,
  onEdit,
  onDelete,
  onOpenFlashcards,
  onOpenQuiz,
  onOpenBilingual,
  onOpenAnnotate,
  isSelectedForBlocknote,
  lang = 'fr',
  allTags = [],
  customTags = [],
  onUpdateTags,
  onCreateTag,
  onFilterByTag,
  onSendToPhone,
}) => {
  const [isAssignPopoverOpen, setIsAssignPopoverOpen] = useState(false);
  const badge = getSubjectBadgeClass(document.subject);
  const isPdf = document.type === 'pdf';
  const hasBlocknote = Boolean(document.blocknoteReproduction);

  return (
    <div 
      id={`doc-card-${document.id}`}
      className={`group relative flex flex-col justify-between rounded-xl bg-white border transition-all duration-200 hover:shadow-md ${
        isSelectedForBlocknote 
          ? 'border-indigo-500 ring-2 ring-indigo-400/30' 
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="p-5">
        {/* Header: Subject & Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
              {document.subject || (lang === 'fr' ? 'Général' : 'General')}
            </span>

            {isPdf ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md">
                <FileText className="w-3 h-3 text-rose-500" />
                PDF {document.fileSize ? `(${formatFileSize(document.fileSize)})` : ''}
              </span>
            ) : document.type === 'word_docx' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                <FileText className="w-3 h-3 text-blue-500" />
                Word (.docx)
              </span>
            ) : document.type === 'excel_sheet' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                <FileText className="w-3 h-3 text-emerald-500" />
                Tableur Excel
              </span>
            ) : document.type === 'google_doc' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md">
                <FileText className="w-3 h-3 text-indigo-500" />
                Google Doc
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">
                <Edit3 className="w-3 h-3 text-slate-400" />
                {lang === 'fr' ? 'Fiche Note' : 'Note'}
              </span>
            )}

            {document.gradeLevel && (
              <span className="text-[11px] text-slate-400 font-medium">
                {document.gradeLevel}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-400 text-xs shrink-0">
            <Calendar className="w-3 h-3" />
            <span>{document.date || (lang === 'fr' ? 'Récent' : 'Recent')}</span>
          </div>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onEdit(document)}
          className="text-base font-bold text-slate-900 leading-snug hover:text-indigo-700 cursor-pointer transition-colors line-clamp-2"
        >
          {document.title}
        </h3>

        {/* Content Preview / Summary */}
        <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
          {document.summary || document.content}
        </p>

        {/* Interactive Tags Section with Quick Assign */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 relative">
          {(document.tags || []).map((tag, idx) => {
            const matchedCustom = customTags.find((ct) => ct.name.toLowerCase() === tag.toLowerCase());
            const colorKey = matchedCustom?.color || 'indigo';
            const style = TAG_COLORS[colorKey] || TAG_COLORS.indigo;

            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onFilterByTag) onFilterByTag(tag);
                }}
                className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-semibold border transition-all cursor-pointer ${style.bg} ${style.border} ${style.text} hover:opacity-80`}
                title={lang === 'fr' ? `Filtrer par #${tag}` : `Filter by #${tag}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                #{tag}
              </button>
            );
          })}

          {/* Quick Tag Assign Trigger */}
          <div className="relative inline-block">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAssignPopoverOpen(!isAssignPopoverOpen);
              }}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
              title={lang === 'fr' ? 'Attribuer des labels à ce cours' : 'Assign labels to this note'}
            >
              <Plus className="w-2.5 h-2.5" />
              <span>Tag</span>
            </button>

            {isAssignPopoverOpen && (
              <TagAssignPopover
                documentId={document.id}
                documentTitle={document.title}
                assignedTags={document.tags || []}
                allTags={allTags}
                customTags={customTags}
                onUpdateTags={(id, tags) => {
                  if (onUpdateTags) onUpdateTags(id, tags);
                }}
                onCreateTag={onCreateTag}
                onClose={() => setIsAssignPopoverOpen(false)}
                lang={lang}
              />
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 rounded-b-xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Blocknote Action */}
          <button
            id={`btn-blocknote-${document.id}`}
            onClick={() => onOpenBlocknote(document)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              hasBlocknote
                ? 'bg-amber-100/80 text-amber-900 hover:bg-amber-200 border border-amber-300/60 shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 shadow-2xs'
            }`}
            title={lang === 'fr' ? 'Ouvrir en mode reproduction bloc-notes manuscrit' : 'Open in handwritten blocknote mode'}
          >
            <PenTool className="w-3.5 h-3.5 text-amber-600" />
            <span>Blocknote</span>
            {hasBlocknote && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </button>

          {/* Flashcards Action */}
          {onOpenFlashcards && (
            <button
              onClick={() => onOpenFlashcards(document)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors shadow-2xs"
              title={lang === 'fr' ? 'Réviser les fiches de mémorisation' : 'Study flashcards for this note'}
            >
              <Brain className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">{lang === 'fr' ? 'Fiches' : 'Cards'}</span>
            </button>
          )}

          {/* Quiz Action */}
          {onOpenQuiz && (
            <button
              onClick={() => onOpenQuiz(document)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs"
              title={lang === 'fr' ? 'Tester ses connaissances avec un Quiz QCM' : 'Test knowledge with AI Quiz'}
            >
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Quiz</span>
            </button>
          )}

          {/* Résumer Action */}
          <button
            id={`btn-summarize-${document.id}`}
            onClick={() => onSummarize(document)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 transition-colors shadow-2xs"
            title={lang === 'fr' ? 'Générer une synthèse personnalisée' : 'Generate custom summary'}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">{lang === 'fr' ? 'Synthèse' : 'Summary'}</span>
          </button>

          {/* Annotate / Highlight Layer Action */}
          {onOpenAnnotate && (
            <button
              onClick={() => onOpenAnnotate(document)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors shadow-2xs cursor-pointer"
              title={lang === 'fr' ? 'Surligner et annoter directement le document' : 'Highlight & annotate PDF layer'}
            >
              <Highlighter className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">{lang === 'fr' ? 'Annoter' : 'Annotate'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Send to Phone Action */}
          {onSendToPhone && (
            <button
              onClick={() => onSendToPhone(document)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors cursor-pointer"
              title={lang === 'fr' ? '📱 Envoyer instantanément sur mon smartphone' : '📱 Send to mobile phone'}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Edit */}
          <button
            id={`btn-edit-${document.id}`}
            onClick={() => onEdit(document)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/50 transition-colors"
            title={lang === 'fr' ? 'Consulter ou modifier le cours' : 'View / Edit Note'}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            id={`btn-delete-${document.id}`}
            onClick={() => {
              const confirmMsg = lang === 'fr' 
                ? `Supprimer définitivement "${document.title}" de votre base locale ?`
                : `Delete "${document.title}" from your school database?`;
              if (confirm(confirmMsg)) {
                onDelete(document.id);
              }
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
            title={lang === 'fr' ? 'Supprimer le document' : 'Delete document'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
