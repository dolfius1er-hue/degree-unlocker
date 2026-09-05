import React, { useState } from 'react';
import { AppLanguage, CustomTag, SchoolDocument } from '../types';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Sparkles, 
  Search,
  CheckCircle2,
  Sliders,
  FolderOpen
} from 'lucide-react';

export const TAG_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-300 dark:border-indigo-800', dot: 'bg-indigo-500' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-800', dot: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-800', dot: 'bg-amber-500' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-800', dot: 'bg-rose-500' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-800', dot: 'bg-purple-500' },
  sky: { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-300 dark:border-sky-800', dot: 'bg-sky-500' },
  teal: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-300 dark:border-teal-800', dot: 'bg-teal-500' },
  slate: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700', dot: 'bg-slate-500' },
};

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customTags: CustomTag[];
  documents: SchoolDocument[];
  onCreateTag: (newTag: CustomTag) => void;
  onDeleteTag: (tagName: string) => void;
  onSelectTagFilter: (tagName: string) => void;
  lang: AppLanguage;
}

export const TagManagerModal: React.FC<TagManagerModalProps> = ({
  isOpen,
  onClose,
  customTags,
  documents,
  onCreateTag,
  onDeleteTag,
  onSelectTagFilter,
  lang = 'fr',
}) => {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<string>('indigo');
  const [newTagDesc, setNewTagDesc] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  // Extract union of custom tags and all existing document tags
  const docTagCounts = documents.reduce((acc, doc) => {
    (doc.tags || []).forEach((t) => {
      const lower = t.toLowerCase().trim();
      if (lower) {
        acc[lower] = (acc[lower] || 0) + 1;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  const allTagNames = Array.from(
    new Set([
      ...customTags.map((ct) => ct.name),
      ...documents.flatMap((d) => d.tags || []),
    ].filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const filteredTagNames = allTagNames.filter((t) =>
    t.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newTagName.trim().replace(/^#+/, '');
    if (!cleanName) return;

    onCreateTag({
      id: `tag-${Date.now()}`,
      name: cleanName,
      color: newTagColor as any,
      description: newTagDesc.trim() || undefined,
    });

    setNewTagName('');
    setNewTagDesc('');
  };

  const PRESET_SUGGESTIONS = [
    { name: 'Examen', color: 'rose' },
    { name: 'Formules', color: 'indigo' },
    { name: 'À-Réviser', color: 'amber' },
    { name: 'Important', color: 'rose' },
    { name: 'Définitions', color: 'emerald' },
    { name: 'Contrôle', color: 'purple' },
    { name: 'TP', color: 'sky' },
    { name: 'Fiche-Mémo', color: 'teal' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Tag className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
                {lang === 'fr' ? 'Gestionnaire de Labels & Tags' : 'Labels & Tags Manager'}
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold">
                  {allTagNames.length} {lang === 'fr' ? 'labels' : 'tags'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'fr'
                  ? 'Créez des étiquettes personnalisées pour classer, filtrer et retrouver vos cours en un clic.'
                  : 'Create custom tags to organize, filter, and instantly locate your study documents.'}
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Section 1: Create New Label Form */}
          <form onSubmit={handleCreate} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-500" />
              {lang === 'fr' ? 'Créer un nouveau label personnalisé' : 'Create a new custom label'}
            </h3>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">#</span>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder={lang === 'fr' ? 'Nom du label (ex: Examen-Juin, Formules-Clés...)' : 'Label name (e.g. Final-Exam, Formulas...)'}
                  className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Color selector */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-300 dark:border-slate-700">
                {Object.keys(TAG_COLORS).map((colorKey) => {
                  const c = TAG_COLORS[colorKey];
                  const isSelected = newTagColor === colorKey;
                  return (
                    <button
                      key={colorKey}
                      type="button"
                      onClick={() => setNewTagColor(colorKey)}
                      className={`w-6 h-6 rounded-full ${c.dot} transition-transform flex items-center justify-center cursor-pointer ${
                        isSelected ? 'scale-110 ring-2 ring-indigo-500 ring-offset-1' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={colorKey}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={!newTagName.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'fr' ? 'Ajouter' : 'Add'}</span>
              </button>
            </div>

            {/* Quick preset suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400 font-medium">
                {lang === 'fr' ? 'Suggestions rapides :' : 'Quick presets:'}
              </span>
              {PRESET_SUGGESTIONS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setNewTagName(preset.name);
                    setNewTagColor(preset.color);
                  }}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 cursor-pointer transition-colors"
                >
                  +{preset.name}
                </button>
              ))}
            </div>
          </form>

          {/* Section 2: Search and List of Existing Tags */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder={lang === 'fr' ? 'Rechercher parmi les labels existants...' : 'Search existing tags...'}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredTagNames.length > 0 ? (
                filteredTagNames.map((tagName) => {
                  const matchedCustom = customTags.find((ct) => ct.name.toLowerCase() === tagName.toLowerCase());
                  const colorKey = matchedCustom?.color || 'indigo';
                  const style = TAG_COLORS[colorKey] || TAG_COLORS.indigo;
                  const count = docTagCounts[tagName.toLowerCase()] || 0;

                  return (
                    <div
                      key={tagName}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${style.bg} ${style.border}`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${style.dot} shrink-0`} />
                        <span className={`font-bold text-xs truncate ${style.text}`}>
                          #{tagName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                          {count} {lang === 'fr' ? (count > 1 ? 'cours' : 'cours') : (count > 1 ? 'notes' : 'note')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Filter by this tag */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTagFilter(tagName);
                            onClose();
                          }}
                          className="px-2 py-1 rounded-md text-[11px] font-bold bg-white/80 dark:bg-slate-900/80 hover:bg-indigo-600 hover:text-white border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                          title={lang === 'fr' ? 'Filtrer les cours avec ce tag' : 'Filter notes with this tag'}
                        >
                          {lang === 'fr' ? 'Filtrer' : 'Filter'}
                        </button>

                        {/* Delete tag */}
                        <button
                          type="button"
                          onClick={() => {
                            const conf = confirm(
                              lang === 'fr'
                                ? `Supprimer le tag "#${tagName}" de la liste et de tous les cours associés ?`
                                : `Delete tag "#${tagName}" from list and all notes?`
                            );
                            if (conf) {
                              onDeleteTag(tagName);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
                          title={lang === 'fr' ? 'Supprimer ce label' : 'Delete label'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                  {lang === 'fr' ? 'Aucun label trouvé.' : 'No labels found.'}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {lang === 'fr' ? 'Astuce : Vous pouvez aussi taper #tag directement dans la barre de recherche !' : 'Tip: You can also type #tag directly in the search bar!'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold cursor-pointer transition-colors"
          >
            {lang === 'fr' ? 'Fermer' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
