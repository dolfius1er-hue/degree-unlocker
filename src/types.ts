export type DocumentType = 'pdf' | 'typed_note' | 'handwritten_scan' | 'study_guide' | 'word_docx' | 'excel_sheet' | 'google_doc';

export type PaperStyle = 'ruled' | 'grid' | 'dots' | 'legal' | 'seyes';

export type HandwritingFont = 'kalam' | 'caveat' | 'patrick' | 'sans';

export type FlashcardRating = 'again' | 'hard' | 'good' | 'easy';

export interface Flashcard {
  id: string;
  docId?: string;
  docTitle?: string;
  subject: string;
  question: string;
  answer: string;
  hints?: string;
  tags?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  // Spaced Repetition metadata (Leitner system)
  box: 1 | 2 | 3 | 4; // 1 = Daily, 2 = 3 Days, 3 = 1 Week, 4 = Mastered (2 Weeks)
  intervalDays: number;
  repetitionCount: number;
  consecutiveCorrect: number;
  lastReviewedAt?: string;
  nextReviewDate: string; // ISO date YYYY-MM-DD
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  description?: string;
  cards: Flashcard[];
  createdAt: string;
  updatedAt: string;
}

export interface PenColorTip {
  color: string;
  name: string;
  purpose: string;
}

export interface BlocknoteLine {
  id: string;
  text: string;
  type: 'title' | 'bullet' | 'subbullet' | 'formula' | 'definition' | 'box_note' | 'sketch_tip';
  isCompleted?: boolean;
  penColor?: 'blue' | 'black' | 'red' | 'green' | 'purple';
}

export interface BlocknoteSection {
  id: string;
  heading: string;
  cueMarginText?: string;
  lines: BlocknoteLine[];
  quickSketchAscii?: string;
}

export interface BlocknoteGuide {
  title: string;
  estimatedCopyTimeMin: number;
  recommendedPaper: PaperStyle;
  recommendedPens: PenColorTip[];
  layoutStructure: 'cornell' | 'bullet' | 'mindmap_tree' | 'cheat_sheet';
  sections: BlocknoteSection[];
  bottomSummary: string;
  handwritingTips: string[];
}

export interface SourceValidationResult {
  score: number; // 0 - 100
  status: 'reliable' | 'needs_verification' | 'unverified';
  academicLevel: string;
  isGrounded: boolean; // Anti-hallucination verification
  strengths: string[];
  warnings: string[];
  sourceOrigin: string; // e.g., 'Official Syllabus / Manuel Scolaire', 'Cours Professeur', 'Notes Personnelles'
  verifiedAt: string;
}

export interface CustomTag {
  id: string;
  name: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'sky' | 'teal' | 'slate';
  description?: string;
}

export interface PdfDrawingPoint {
  x: number;
  y: number;
}

export interface PdfDrawingStroke {
  id: string;
  tool: 'pen' | 'highlighter' | 'eraser';
  color: string;
  width: number;
  opacity: number;
  points: PdfDrawingPoint[];
}

export interface PdfTextAnnotation {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  bgColor?: string;
  fontSize: number;
}

export interface PdfPageAnnotation {
  pageNumber: number;
  strokes: PdfDrawingStroke[];
  textNotes: PdfTextAnnotation[];
}

export interface DocumentIndexedParagraph {
  id: string;
  docId: string;
  docTitle: string;
  subject: string;
  paragraphIndex: number;
  pageNumber?: number;
  text: string;
  keywords: string[];
  charCount: number;
  wordCount: number;
}

export interface FullTextSearchResult {
  docId: string;
  docTitle: string;
  subject: string;
  type: DocumentType;
  paragraphIndex: number;
  pageNumber?: number;
  paragraphText: string;
  matchedKeywords: string[];
  snippet: {
    before: string;
    match: string;
    after: string;
  };
  relevanceScore: number;
}

export interface SchoolDocument {
  id: string;
  title: string;
  subject: string;
  date: string;
  type: DocumentType;
  tags: string[];
  gradeLevel?: string;
  content: string;
  summary?: string;
  keyPoints?: string[];
  fileName?: string;
  fileSize?: number;
  pdfDataUrl?: string; // base64 encoded pdf
  localFilePath?: string; // Stored path on server disk
  storedFileName?: string;
  sourceValidation?: SourceValidationResult;
  blocknoteReproduction?: BlocknoteGuide;
  annotations?: PdfPageAnnotation[];
  createdAt: string;
  updatedAt: string;
}

export interface StoredLocalFile {
  fileName: string;
  originalName: string;
  fileSizeBytes: number;
  sizeFormatted: string;
  mimeType: string;
  storedAt: string;
  relativePath: string;
  associatedDocId?: string;
  associatedDocTitle?: string;
  downloadUrl: string;
}

export interface EducationalVideo {
  id: string;
  title: string;
  titleFr: string;
  channel: string;
  subject: string;
  language: 'fr' | 'en';
  examFocus: string; // e.g. 'Bac Spécialité', 'Brevet', 'SAT / AP', 'Université'
  duration: string;
  youtubeId: string;
  youtubeUrl: string;
  description: string;
  descriptionFr: string;
  keyConcepts: string[];
}

export interface WordSearchResult {
  docId: string;
  docTitle: string;
  subject: string;
  date: string;
  matchCount: number;
  snippets: {
    lineIndex: number;
    text: string;
    matchedWord: string;
  }[];
  sourceValidation?: SourceValidationResult;
  hasLocalFile: boolean;
  fileName?: string;
}

export type AppLanguage = 'fr' | 'en';

export type AppTheme = 'light' | 'dark' | 'midnight' | 'paper';
export type MenuPosition = 'left' | 'top';

export interface UIPreferences {
  theme: AppTheme;
  menuPosition: MenuPosition;
  isSidebarCollapsed: boolean;
  language: AppLanguage;
  accentColor?: string;
  fontSize?: 'compact' | 'normal' | 'spacious';
  updatedAt?: string;
}

export interface SearchCitation {
  docId: string;
  docTitle: string;
  subject: string;
  quote: string;
  relevanceScore: number;
}

export interface SearchResponse {
  answer: string;
  citations: SearchCitation[];
  matchedDocIds: string[];
  keyInsights: string[];
  suggestedFollowUps: string[];
}

export interface SummaryOptions {
  style: 'concise' | 'cornell' | 'exam_prep' | 'flashcards';
  targetLength: 'brief' | 'detailed';
  language?: 'en' | 'fr' | 'es' | 'auto';
}

export interface DatabaseStats {
  totalDocs: number;
  pdfCount: number;
  noteCount: number;
  subjects: { subject: string; count: number }[];
  totalWords: number;
  lastUpdated: string;
}

// -------------------------------------------------------------
// QUIZ TYPES
// -------------------------------------------------------------
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // 4 options (A, B, C, D)
  correctAnswerIndex: number; // 0 - 3
  explanation: string;
  conceptTested: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizScoreRecord {
  id: string;
  docId: string;
  docTitle: string;
  subject: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timestamp: string;
  userAnswers: {
    questionId: string;
    selectedIndex: number;
    isCorrect: boolean;
  }[];
}

// -------------------------------------------------------------
// BILINGUAL LANGUAGE & SUBJECT LEARNING TYPES
// -------------------------------------------------------------
export type BilingualLanguageCode = 'en' | 'fr' | 'it' | 'es' | 'pt' | 'de' | 'la' | 'zh';

export interface BilingualTargetWord {
  id: string;
  frenchWord: string; // The original word in the source/French text
  englishWord: string; // The translated target word (English, Italian, Spanish, etc.)
  targetWord?: string;
  sourceWord?: string;
  definitionEn: string; // Target definition / explanation
  definitionShortHint?: string;
  partOfSpeech?: string; // noun, verb, adjective, etc.
  hintFr?: string;
  placed?: boolean;
}

export interface BilingualLearningExercise {
  id: string;
  docId?: string;
  docTitle: string;
  subject: string;
  theme: string;
  targetLang: BilingualLanguageCode;
  targetLangLabel: string;
  fullFrenchText: string;
  fullEnglishTranslation: string;
  fullTargetTranslation?: string;
  segmentedTokens: {
    type: 'text' | 'slot';
    content: string; // text chunk or slotId
    slotId?: string;
  }[];
  targetWords: BilingualTargetWord[];
}

export interface SavedVocabularyItem {
  id: string;
  sourceWord: string;
  targetWord: string;
  sourceLanguage?: string;
  targetLanguage: BilingualLanguageCode;
  definition: string;
  partOfSpeech?: string;
  hint?: string;
  docTitle?: string;
  mastered?: boolean;
  addedAt: string;
}

// -------------------------------------------------------------
// STUDY PROGRESS BACKUP & DATA SAFETY TYPES
// -------------------------------------------------------------
export interface StudyProgressBackup {
  version: string;
  exportedAt: string;
  appName: string;
  userStats: {
    streakDays: number;
    activityDates: string[];
    totalStudySessions: number;
    totalDocuments: number;
    totalQuizzesTaken: number;
    totalFlashcards: number;
    totalVocabularyWords: number;
  };
  streaks: {
    activityDates: string[];
    currentStreak: number;
  };
  quizResults: QuizScoreRecord[];
  vocabularyList: SavedVocabularyItem[];
  flashcards: Flashcard[];
  documents: SchoolDocument[];
  preferences?: UIPreferences;
}

// -------------------------------------------------------------
// SOCRATIC STUDY COACH (Anti-Cheat AI Mentor)
// -------------------------------------------------------------
export interface SocraticMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  hints?: string[];
  suggestedQuestions?: string[];
}

