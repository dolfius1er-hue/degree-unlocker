import React, { useState, useRef, useEffect } from 'react';
import { AppLanguage, CustomTag } from '../types';
import { TAG_COLORS } from './TagManagerModal';
import { Tag, Plus, Check, X, Search } from 'lucide-react';

interface TagAssignPopoverProps {
  documentId: string;
  documentTitle: string;
  assignedTags: string[];
  allTags: string[];
  customTags: CustomTag[];
  onUpdateTags: (documentId: string, tags: string[]) => void;
  onCreateTag?: (newTag: CustomTag) => void;
  onClose: () => void;
  lang?: AppLanguage;
}

export const TagAssignPopover: React.FC<TagAssignPopoverProps> = ({
  documentId,
  documentTitle,
  assignedTags,
  allTags,
  customTags,
  onUpdateTags,
  onCreateTag,
  onClose,
  lang = 'fr',
}) => {
  const [search, setSearch] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const toggleTag = (tagName: string) => {
    const lower = tagName.toLowerCase();
    const isAssigned = assignedTags.some((t) => t.toLowerCase() === lower);
    let updated: string[];
    if (isAssigned) {
      updated = assignedTags.filter((t) => t.toLowerCase() !== lower);
    } else {
      updated = [...assignedTags, tagName];
    }
    onUpdateTags(documentId, updated);
  };

  const handleCreateAndAssign = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagName.trim().replace(/^#+/, '');
    if (!clean) return;

    if (onCreateTag) {
      onCreateTag({
        id: `tag-${Date.now()}`,
        name: clean,
        color: 'indigo',
      });
    }

    if (!assignedTags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      onUpdateTags(documentId, [...assignedTags, clean]);
    }

    setNewTagName('');
  };

  const filteredAllTags = Array.from(
    new Set([...allTags, ...assignedTags])
  ).filter((t) => t.toLowerCase().includes(search.toLowerCase().trim()));

  return (
    <div
      ref={popoverRef}
      className="absolute right-2 top-12 z-30 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 text-xs animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-indigo-500" />
          {lang === 'fr' ? 'Attribuer des labels' : 'Assign labels'}
        </span>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick search */}
      <div className="relative mb-2">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === 'fr' ? 'Rechercher un tag...' : 'Search tags...'}
          className="w-full pl-8 pr-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Tag checklist */}
      <div className="max-h-40 overflow-y-auto space-y-1 pr-1 mb-2.5">
        {filteredAllTags.length > 0 ? (
          filteredAllTags.map((tag) => {
            const isAssigned = assignedTags.some((t) => t.toLowerCase() === tag.toLowerCase());
            const matchedCustom = customTags.find((ct) => ct.name.toLowerCase() === tag.toLowerCase());
            const colorKey = matchedCustom?.color || 'indigo';
            const style = TAG_COLORS[colorKey] || TAG_COLORS.indigo;

            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isAssigned
                    ? `${style.bg} ${style.border} border font-bold ${style.text}`
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                  #{tag}
                </span>
                {isAssigned && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })
        ) : (
          <p className="text-[11px] text-slate-400 py-1 text-center">
            {lang === 'fr' ? 'Aucun label correspondant.' : 'No matching labels.'}
          </p>
        )}
      </div>

      {/* Inline create tag form */}
      <form onSubmit={handleCreateAndAssign} className="flex gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder={lang === 'fr' ? '+ Nouveau label...' : '+ New tag...'}
          className="flex-1 px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!newTagName.trim()}
          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-bold text-xs disabled:opacity-50 cursor-pointer"
        >
          {lang === 'fr' ? 'Ajouter' : 'Add'}
        </button>
      </form>
    </div>
  );
};
