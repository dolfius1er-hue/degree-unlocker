import React, { useState, useEffect } from 'react';
import { SchoolDocument, AppLanguage } from '../types';
import { X, Save, Sparkles, PenTool, BookOpen, Tag } from 'lucide-react';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentToEdit: SchoolDocument | null;
  onSave: (doc: Partial<SchoolDocument>, generateBlocknote: boolean) => Promise<void>;
  lang?: AppLanguage;
}

const COMMON_SUBJECTS_EN = [
  'Biology',
  'Physics',
  'Mathematics',
  'History',
  'Chemistry',
  'Philosophy',
  'Literature',
  'Computer Science',
  'Geography',
  'Economics',
];

const COMMON_SUBJECTS_FR = [
  'SVT & Biologie',
  'Physique-Chimie',
  'Mathématiques',
  'Histoire-Géographie',
  'Philosophie',
  'Français & Littérature',
  'Informatique & NSI',
  'SES & Économie',
  'Anglais & LV1',
  'Espagnol & LV2',
];

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  onClose,
  documentToEdit,
  onSave,
  lang = 'fr',
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(lang === 'fr' ? 'SVT & Biologie' : 'Biology');
  const [customSubject, setCustomSubject] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [gradeLevel, setGradeLevel] = useState(lang === 'fr' ? 'Terminale' : 'Grade 12');
  const [saving, setSaving] = useState(false);

  const subjectsList = lang === 'fr' ? COMMON_SUBJECTS_FR : COMMON_SUBJECTS_EN;

  useEffect(() => {
    if (documentToEdit) {
      setTitle(documentToEdit.title);
      if (subjectsList.includes(documentToEdit.subject)) {
        setSubject(documentToEdit.subject);
        setCustomSubject('');
      } else {
        setSubject('Other');
        setCustomSubject(documentToEdit.subject || '');
      }
      setContent(documentToEdit.content || '');
      setTagsInput(documentToEdit.tags ? documentToEdit.tags.join(', ') : '');
      setGradeLevel(documentToEdit.gradeLevel || (lang === 'fr' ? 'Terminale' : 'Grade 12'));
    } else {
      setTitle('');
      setSubject(subjectsList[0]);
      setCustomSubject('');
      setContent('');
      setTagsInput('');
      setGradeLevel(lang === 'fr' ? 'Terminale' : 'Grade 12');
    }
  }, [documentToEdit, isOpen, lang]);

  if (!isOpen) return null;

  const handleSaveNote = async (generateBlocknote: boolean) => {
    if (!title.trim()) {
      alert(lang === 'fr' ? 'Veuillez saisir un titre pour votre note de cours.' : 'Please enter a note title.');
      return;
    }
    if (!content.trim()) {
      alert(lang === 'fr' ? 'Veuillez saisir le contenu du cours.' : 'Please enter note content.');
      return;
    }

    const finalSubject = subject === 'Other' ? (customSubject.trim() || (lang === 'fr' ? 'Général' : 'General')) : subject;
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      await onSave(
        {
          id: documentToEdit?.id,
          title: title.trim(),
          subject: finalSubject,
          content: content.trim(),
          tags,
          gradeLevel,
          type: documentToEdit?.type || 'typed_note',
          date: documentToEdit?.date || new Date().toISOString().split('T')[0],
        },
        generateBlocknote
      );
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || (lang === 'fr' ? 'Erreur lors de l\'enregistrement de la note' : 'Error saving document'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-start justify-center p-4 sm:pt-12">
      <div className="bg-white rounded-xl max-w-3xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              {documentToEdit 
                ? (lang === 'fr' ? 'Modifier la fiche de cours' : 'Edit School Note') 
                : (lang === 'fr' ? 'Créer une nouvelle fiche de cours' : 'Create New School Note')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {lang === 'fr' ? 'Titre du cours / Chapitre *' : 'Note Title *'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={lang === 'fr' ? 'Ex: Mitose cellulaire & Cycles de division' : 'e.g. Mitosis Phases & Cell Division Cycles'}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Subject & Grade Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {lang === 'fr' ? 'Matière / Discipline *' : 'Subject Course *'}
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {subjectsList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value="Other">{lang === 'fr' ? 'Autre matière (personnalisée)' : 'Other (Custom)'}</option>
              </select>
              {subject === 'Other' && (
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder={lang === 'fr' ? 'Nom de la matière...' : 'Enter subject name...'}
                  className="mt-2 w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {lang === 'fr' ? 'Niveau / Classe' : 'Level / Class'}
              </label>
              <input
                type="text"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                placeholder={lang === 'fr' ? 'Ex: Terminale / Première / Prépa / Licence' : 'e.g. Grade 12 / College Intro / AP'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              {lang === 'fr' ? 'Mots-clés / Étiquettes (séparés par des virgules)' : 'Tags (comma-separated)'}
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={lang === 'fr' ? 'Ex: Bac2025, Formules, Chapitre 3, Définition' : 'e.g. ExamPrep, Formulas, Chapter 3, Homework'}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {lang === 'fr' ? 'Contenu du cours & Formules *' : 'Note Content & Formulas *'}
              </label>
              <span className="text-[11px] text-slate-400">
                {lang === 'fr' ? 'Supporte texte, listes à puces & équations' : 'Supports text, lists & formulas'}
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={11}
              placeholder={lang === 'fr' ? 'Tapez ou collez ici votre cours, vos définitions de théorèmes, vos formules clés ou le résumé de votre professeur...' : 'Type or paste your lecture notes, equations, chapter definitions, or key concepts here...'}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm font-mono leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            {lang === 'fr' ? 'Annuler' : 'Cancel'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveNote(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Sauvegarder' : 'Save Note'}</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveNote(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Sauvegarder & Générer Guide Blocknote' : 'Save & Build Blocknote Guide'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
