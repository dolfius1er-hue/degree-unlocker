import React, { useState } from 'react';
import { EDUCATIONAL_VIDEOS } from '../data/educationalVideos';
import { EducationalVideo, AppLanguage } from '../types';
import { 
  Tv, 
  X, 
  Search, 
  ExternalLink, 
  Youtube, 
  Clock, 
  GraduationCap, 
  BookOpen,
  Filter,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface EducationalVideosModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  initialSubject?: string;
}

export const EducationalVideosModal: React.FC<EducationalVideosModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialSubject,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || 'all');
  const [selectedLang, setSelectedLang] = useState<'all' | 'fr' | 'en'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeVideo, setActiveVideo] = useState<EducationalVideo | null>(null);

  if (!isOpen) return null;

  const subjects = [
    { key: 'all', labelFr: 'Toutes les matières', labelEn: 'All Subjects' },
    { key: 'Mathematics', labelFr: '📐 Mathématiques', labelEn: '📐 Mathematics' },
    { key: 'Biology', labelFr: '🧬 SVT & Biologie', labelEn: '🧬 Biology & Life Sciences' },
    { key: 'Physics', labelFr: '⚡ Physique', labelEn: '⚡ Physics' },
    { key: 'Chemistry', labelFr: '🧪 Chimie', labelEn: '🧪 Chemistry' },
    { key: 'History', labelFr: '📜 Histoire-Géographie', labelEn: '📜 History & Geography' },
    { key: 'Philosophy', labelFr: '🏛️ Philosophie', labelEn: '🏛️ Philosophy' },
    { key: 'Literature', labelFr: '📚 Français & Littérature', labelEn: '📚 Literature & English' },
  ];

  const filteredVideos = EDUCATIONAL_VIDEOS.filter(video => {
    if (selectedSubject !== 'all' && video.subject !== selectedSubject) return false;
    if (selectedLang !== 'all' && video.language !== selectedLang) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = video.title.toLowerCase().includes(q) || video.titleFr.toLowerCase().includes(q);
      const matchChannel = video.channel.toLowerCase().includes(q);
      const matchConcepts = video.keyConcepts.some(c => c.toLowerCase().includes(q));
      const matchExam = video.examFocus.toLowerCase().includes(q);
      if (!matchTitle && !matchChannel && !matchConcepts && !matchExam) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-start justify-center p-4 sm:pt-12">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600 text-white shadow-xs">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>
                  {lang === 'fr' 
                    ? 'Vidéos Pédagogiques de Révision (Bac, Brevet, SAT, AP)' 
                    : 'Curated Educational Revision Videos (Bac, SAT, AP, GCSE)'}
                </span>
                <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full border border-red-200">
                  YouTube FR & EN
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'fr'
                  ? 'Chaînes académiques certifiées sélectionnées pour leurs explications claires et fiches d\'examen.'
                  : 'Certified educational channels selected for high-yield exam preparation.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'fr' ? 'Chercher un thème, chaîne, notion...' : 'Search concept, channel, formula...'}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Language filter toggle */}
            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg text-xs self-start sm:self-auto">
              <button
                onClick={() => setSelectedLang('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  selectedLang === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'fr' ? 'Toutes langues' : 'All Languages'}
              </button>
              <button
                onClick={() => setSelectedLang('fr')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  selectedLang === 'fr' ? 'bg-white shadow-xs text-indigo-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇫🇷 Français (Bac / Brevet)
              </button>
              <button
                onClick={() => setSelectedLang('en')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  selectedLang === 'en' ? 'bg-white shadow-xs text-indigo-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇬🇧 English (AP / SAT / GCSE)
              </button>
            </div>
          </div>

          {/* Subjects pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
            {subjects.map(s => (
              <button
                key={s.key}
                onClick={() => setSelectedSubject(s.key)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all text-xs font-medium shrink-0 ${
                  selectedSubject === s.key
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lang === 'fr' ? s.labelFr : s.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Video Grid */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl">
              <Tv className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-semibold">
                {lang === 'fr' ? 'Aucune vidéo trouvée pour ces critères.' : 'No videos match your search criteria.'}
              </p>
              <button
                onClick={() => { setSelectedSubject('all'); setSelectedLang('all'); setSearchQuery(''); }}
                className="mt-2 text-indigo-600 font-semibold hover:underline"
              >
                {lang === 'fr' ? 'Réinitialiser les filtres' : 'Reset filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVideos.map((video) => (
                <div 
                  key={video.id} 
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Channel & Lang & Exam */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {video.channel}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/70 font-semibold">
                          {video.examFocus}
                        </span>
                        <span className="text-xs">
                          {video.language === 'fr' ? '🇫🇷' : '🇬🇧'}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-slate-900 text-xs leading-snug mb-1.5">
                      {lang === 'fr' ? video.titleFr : video.title}
                    </h4>

                    {/* Description */}
                    <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2 mb-3">
                      {lang === 'fr' ? video.descriptionFr : video.description}
                    </p>

                    {/* Key Concepts Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {video.keyConcepts.map((concept, idx) => (
                        <span 
                          key={idx} 
                          className="text-[10px] bg-slate-50 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md"
                        >
                          #{concept}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom: Duration and Link */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {video.duration}
                    </span>

                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors border border-red-200/80 shadow-2xs"
                    >
                      <Youtube className="w-3.5 h-3.5 text-red-600" />
                      <span>{lang === 'fr' ? 'Regarder sur YouTube' : 'Watch on YouTube'}</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            {lang === 'fr'
              ? `${filteredVideos.length} vidéos pédagogiques recommandées`
              : `${filteredVideos.length} curated educational videos available`}
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
