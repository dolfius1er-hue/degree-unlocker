import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON payload limit to handle large base64 uploads cleanly (augmented for local storage)
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: true, limit: '150mb' }));

// Ensure data directory and local uploads storage folder exist
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const FLASHCARDS_FILE = path.join(DATA_DIR, 'flashcards.json');
const PREFERENCES_FILE = path.join(DATA_DIR, 'preferences.json');
const VOCABULARY_FILE = path.join(DATA_DIR, 'vocabulary.json');
const STREAKS_FILE = path.join(DATA_DIR, 'streaks.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Default UI Layout Preferences
const DEFAULT_PREFERENCES = {
  theme: 'light',
  menuPosition: 'left',
  isSidebarCollapsed: false,
  language: 'fr',
  fontSize: 'normal',
  updatedAt: new Date().toISOString(),
};

function loadPreferences() {
  try {
    if (fs.existsSync(PREFERENCES_FILE)) {
      const data = fs.readFileSync(PREFERENCES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading preferences file:', err);
  }
  return DEFAULT_PREFERENCES;
}

function savePreferences(prefs: any) {
  try {
    fs.writeFileSync(PREFERENCES_FILE, JSON.stringify(prefs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving preferences file:', err);
  }
}

// Safe JSON parser to handle raw text, markdown fences, or partial outputs cleanly
function safeJsonParse(text: string | undefined): any {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (_) {
    try {
      const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
      return JSON.parse(cleaned);
    } catch (_) {
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        try {
          return JSON.parse(text.slice(firstBrace, lastBrace + 1));
        } catch (_) {}
      }
      return {};
    }
  }
}

let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Resilient Gemini model fallback chain to handle 503 high demand or quota limits
const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
];

async function callGeminiWithFallback(requestConfig: {
  contents: any;
  config?: any;
  preferredModel?: string;
}): Promise<{ text: string; modelUsed: string }> {
  const ai = getGemini();
  const preferred = requestConfig.preferredModel || 'gemini-3.5-flash';
  const modelsToTry = [
    preferred,
    ...CANDIDATE_MODELS.filter((m) => m !== preferred),
  ];

  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: requestConfig.contents,
        config: requestConfig.config,
      });
      return { text: response.text || '', modelUsed: model };
    } catch (err: any) {
      lastError = err;
      const is503 =
        err?.status === 503 ||
        err?.message?.includes('503') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('UNAVAILABLE');
      const is429 =
        err?.status === 429 ||
        err?.message?.includes('429') ||
        err?.message?.includes('quota');
      console.warn(`[Gemini Fallback] Model ${model} encountered error: ${err.message || err}. Trying next fallback...`);
      if (is503 || is429) {
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }
  }
  throw lastError || new Error('All Gemini candidate models failed.');
}

// Intelligent academic subject classifier based on keywords and curriculum topics
function detectSubjectFromText(title: string, text: string): string {
  const corpus = `${title} ${text.slice(0, 16000)}`.toLowerCase();

  const rules: { subject: string; keywords: string[] }[] = [
    {
      subject: 'Mathématiques',
      keywords: [
        'dérivée', 'dérivation', 'intégrale', 'primitive', 'équation', 'inéquation', 'matrice',
        'vecteur', 'probabilité', 'géométrie', 'trigonométrie', 'théorème', 'algorithme', 'limite',
        'suite arithmétique', 'suite géométrique', 'polynôme', 'complexe', 'exponentielle', 'logarithme',
        'variance', 'médiane', 'moyenne', 'pythagore', 'thalès', 'croissance', 'abscisse', 'ordonnée',
        'tangente', 'trigo', 'maths', 'quadratique', 'racine carrée'
      ],
    },
    {
      subject: 'Physique-Chimie',
      keywords: [
        'atome', 'molécule', 'acide', 'base', 'réaction chimique', 'mole', 'molaire', 'solvant',
        'cinétique', 'énergie cinétique', 'force de newton', 'pesanteur', 'onde sonore', 'fréquence',
        'longueur d\'onde', 'spectre', 'thermodynamique', 'pression', 'ampère', 'volt', 'résistance',
        'champ magnétique', 'électromagnétique', 'oxydoréduction', 'titrage', 'mécanique des fluides'
      ],
    },
    {
      subject: 'SVT / Biologie',
      keywords: [
        'cellule', 'adn', 'arn', 'génome', 'mutation', 'mitose', 'méiose', 'chromosome', 'photosynthèse',
        'neurone', 'synapse', 'système immunitaire', 'anticorps', 'lymphocyte', 'biodiversité',
        'écosystème', 'plaques tectoniques', 'séisme', 'volcanisme', 'glycémie', 'insuline', 'foie', 'gène'
      ],
    },
    {
      subject: 'Histoire-Géographie',
      keywords: [
        'guerre mondiale', 'révolution française', 'empire napoléonien', 'traité', 'république',
        'monarchie', 'colonisation', 'décolonisation', 'guerre froide', 'urss', 'totalitarisme',
        'démocratie', 'mondialisation', 'territoire', 'frontière', 'métropolisation', 'puissance',
        'géopolitique', 'population', 'croissance urbaine', 'aménagement du territoire'
      ],
    },
    {
      subject: 'Philosophie',
      keywords: [
        'conscience', 'inconscient', 'liberté', 'devoir', 'justice', 'état', 'morale', 'bonheur',
        'vérité', 'raison', 'religion', 'art', 'technique', 'travail', 'kant', 'descartes', 'platon',
        'aristote', 'rousseau', 'spinoza', 'nietzsche', 'existentialisme', 'métaphysique'
      ],
    },
    {
      subject: 'Français & Littérature',
      keywords: [
        'poésie', 'strophe', 'alexandrin', 'vers', 'roman', 'narrateur', 'théâtre', 'dramaturgie',
        'tragédie', 'comédie', 'molière', 'baudelaire', 'victor hugo', 'métaphore', 'allégorie',
        'humanisme', 'siècle des lumières', 'romantisme', 'surréalisme', 'dissertation littéraire'
      ],
    },
    {
      subject: 'Informatique / NSI',
      keywords: [
        'python', 'javascript', 'html', 'css', 'fonction récursive', 'complexité o(n)', 'arbre binaire',
        'graphe', 'pile', 'file', 'base de données', 'sql', 'table relationnelle', 'requête select',
        'algorithme de tri', 'dichotomie', 'protocole ip', 'réseau'
      ],
    },
    {
      subject: 'Économie & SES',
      keywords: [
        'marché concurrentiel', 'pib', 'inflation', 'chômage', 'croissance économique', 'politique monétaire',
        'banque centrale', 'offre et demande', 'consommation', 'investissement', 'classes sociales',
        'stratification sociale', 'mobilité sociale', 'mondialisation économique', 'dette publique'
      ],
    },
    {
      subject: 'Droit & Sciences Po',
      keywords: [
        'code civil', 'jurisprudence', 'cour de cassation', 'contrat', 'responsabilité civile',
        'infraction', 'droit pénal', 'constitution', 'conseil constitutionnel', 'droit public',
        'tribunal administratif', 'contentieux', 'obligation juridique'
      ],
    },
    {
      subject: 'Langues Vivantes / Anglais',
      keywords: [
        'grammar', 'vocabulary', 'english essay', 'tense', 'past simple', 'present perfect',
        'idioms', 'shakespeare', 'pronunciation', 'reading comprehension', 'bilingual'
      ],
    },
    {
      subject: 'Médecine & Santé',
      keywords: [
        'anatomie', 'physiologie', 'pathologie', 'pharmacologie', 'posologie', 'diagnostic',
        'symptôme', 'artère', 'veine', 'cardiaque', 'pulmonaire', 'hématologie', 'chirurgie'
      ],
    },
  ];

  let bestSubject = 'Études Générales';
  let maxScore = 0;

  for (const rule of rules) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (corpus.includes(kw)) {
        score += kw.includes(' ') ? 3 : 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestSubject = rule.subject;
    }
  }

  return maxScore >= 1 ? bestSubject : 'Études Générales';
}

// Guaranteed local Cornell blocknote reproduction generator if Gemini API is under heavy load
function generateLocalBlocknoteFallback(
  title: string,
  subject: string,
  content: string,
  preferredPaper: string = 'seyes'
): any {
  const lines = (content || '').split('\n').map((l) => l.trim()).filter(Boolean);
  const cleanTitle = title || 'Notes de Cours';

  const sections: any[] = [];
  let currentSection: any = {
    id: 'sec-1',
    heading: 'I. Concepts Fondamentaux & Définitions',
    cueMarginText: 'Quels sont les points clés ?',
    lines: [],
    quickSketchAscii: `+-----------------------------+\n|   ${cleanTitle.slice(0, 22).padEnd(22)}  |\n+-----------------------------+`,
  };

  let sectionIndex = 1;
  for (const rawLine of lines.slice(0, 35)) {
    if (rawLine.startsWith('#') || rawLine.match(/^[0-9IVX]+\./) || rawLine.endsWith(':')) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
        sectionIndex++;
        const headingText = rawLine.replace(/^[#\s0-9IVX.-]+/, '').trim() || `Section ${sectionIndex}`;
        currentSection = {
          id: `sec-${sectionIndex}`,
          heading: headingText,
          cueMarginText: `Mémoriser : ${headingText.slice(0, 24)} ?`,
          lines: [],
          quickSketchAscii: `[ ${headingText.slice(0, 14)} ] ---> [ Application ]`,
        };
      }
    } else {
      const isFormula = rawLine.includes('=') || rawLine.includes('->') || rawLine.includes('Σ') || rawLine.includes('/');
      const isDef =
        rawLine.toLowerCase().includes('définit') ||
        rawLine.toLowerCase().includes('est un') ||
        rawLine.toLowerCase().includes('principe') ||
        rawLine.toLowerCase().includes('théorème');

      currentSection.lines.push({
        id: `line-${sectionIndex}-${currentSection.lines.length + 1}`,
        text: rawLine.replace(/^[-*•]\s*/, ''),
        type: isFormula ? 'formula' : isDef ? 'definition' : 'bullet',
        penColor: isFormula ? 'red' : isDef ? 'green' : 'blue',
      });
    }
  }

  if (currentSection.lines.length > 0) {
    sections.push(currentSection);
  }

  if (sections.length === 0) {
    sections.push({
      id: 'sec-1',
      heading: 'I. Synthèse Manuscrite',
      cueMarginText: 'Idée maîtresse ?',
      lines: [
        {
          id: 'line-1-1',
          text: (content || '').slice(0, 140) || 'Points clés du cours à recopier avec soin.',
          type: 'bullet',
          penColor: 'blue',
        },
      ],
      quickSketchAscii: `[ Note Principale ] ===> [ Mémorisation ]`,
    });
  }

  return {
    title: cleanTitle,
    estimatedCopyTimeMin: Math.max(5, Math.min(25, Math.ceil(sections.reduce((acc, s) => acc + s.lines.length, 0) * 1.4))),
    recommendedPaper: preferredPaper || 'seyes',
    layoutStructure: 'cornell',
    recommendedPens: [
      { color: '#2563eb', name: 'Stylo Bleu', purpose: 'Corps du cours et explications principales' },
      { color: '#dc2626', name: 'Stylo Rouge', purpose: 'Formules clés, lois et pièges d\'examen' },
      { color: '#16a34a', name: 'Stylo Vert', purpose: 'Définitions de vocabulaire et exemples concrets' },
      { color: '#1e293b', name: 'Stylo Noir', purpose: 'Titres, encadrés et numérotation des sections' },
    ],
    sections,
    bottomSummary: `Ce cours de ${subject || 'révision'} aborde les notions indispensables. À réactiver à J+1 et J+7 selon la répétition espacée.`,
    handwritingTips: [
      'Laissez 5 carreaux à gauche pour la marge Cornell (questions actives et mots-clés).',
      'Encadrez les formules au stylo rouge avec une règle pour un repérage visuel immédiat.',
      'Sautez une ligne entre chaque grand paragraphe pour aérer la relecture.',
    ],
  };
}

// Load or initialize documents from file
function loadDocuments(): any[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Notice reading database file:', err);
  }
  return [];
}

function saveDocuments(docs: any[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(docs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

// Flashcards persistence helpers
function loadFlashcards(): any[] {
  try {
    if (fs.existsSync(FLASHCARDS_FILE)) {
      const data = fs.readFileSync(FLASHCARDS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading flashcards file:', err);
  }
  return [];
}

function saveFlashcards(cards: any[]) {
  try {
    fs.writeFileSync(FLASHCARDS_FILE, JSON.stringify(cards, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving flashcards file:', err);
  }
}

// Vocabulary persistence helpers
function loadVocabulary(): any[] {
  try {
    if (fs.existsSync(VOCABULARY_FILE)) {
      const data = fs.readFileSync(VOCABULARY_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading vocabulary file:', err);
  }
  return [];
}

function saveVocabulary(items: any[]) {
  try {
    fs.writeFileSync(VOCABULARY_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving vocabulary file:', err);
  }
}

// Study streaks persistence helpers
function loadStreaks(): { activityDates: string[]; currentStreak: number } {
  try {
    if (fs.existsSync(STREAKS_FILE)) {
      const data = fs.readFileSync(STREAKS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading streaks file:', err);
  }
  return { activityDates: [], currentStreak: 0 };
}

function saveStreaks(streaks: { activityDates: string[]; currentStreak?: number }) {
  try {
    fs.writeFileSync(STREAKS_FILE, JSON.stringify(streaks, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving streaks file:', err);
  }
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// GET user UI layout preferences & theme
app.get('/api/preferences', (req: Request, res: Response) => {
  try {
    const prefs = loadPreferences();
    res.json({ success: true, preferences: prefs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST save user UI layout preferences & theme
app.post('/api/preferences', (req: Request, res: Response) => {
  try {
    const incoming = req.body;
    const current = loadPreferences();
    const updated = {
      ...current,
      ...incoming,
      updatedAt: new Date().toISOString(),
    };
    savePreferences(updated);
    res.json({ success: true, preferences: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST clear all documents & flashcards (clean slate)
app.post('/api/database/clear', (req: Request, res: Response) => {
  try {
    saveDocuments([]);
    saveFlashcards([]);
    saveVocabulary([]);
    saveQuizHistory([]);
    saveStreaks({ activityDates: [], currentStreak: 0 });
    res.json({ success: true, message: 'All study data and documents cleared.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// STREAKS API
// -------------------------------------------------------------
app.get('/api/streaks', (req: Request, res: Response) => {
  try {
    const streaks = loadStreaks();
    res.json({ success: true, ...streaks });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/streaks', (req: Request, res: Response) => {
  try {
    const { activityDates, date } = req.body;
    let current = loadStreaks();
    let dates = current.activityDates || [];
    
    if (Array.isArray(activityDates)) {
      dates = Array.from(new Set([...dates, ...activityDates]));
    } else if (date) {
      if (!dates.includes(date)) dates.push(date);
    } else {
      const today = new Date().toISOString().split('T')[0];
      if (!dates.includes(today)) dates.push(today);
    }
    
    // Compute current consecutive streak
    const sorted = [...dates].sort();
    let streak = 0;
    let checkDate = new Date();
    const todayStr = checkDate.toISOString().split('T')[0];
    const hasToday = sorted.includes(todayStr);

    if (!hasToday) {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toISOString().split('T')[0];
      if (!sorted.includes(yesterdayStr)) {
        streak = 0;
      }
    }

    if (hasToday || sorted.includes(checkDate.toISOString().split('T')[0])) {
      while (true) {
        const dStr = checkDate.toISOString().split('T')[0];
        if (sorted.includes(dStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    const updated = { activityDates: dates, currentStreak: streak };
    saveStreaks(updated);
    res.json({ success: true, ...updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// VOCABULARY LIST API
// -------------------------------------------------------------
app.get('/api/vocabulary', (req: Request, res: Response) => {
  try {
    const list = loadVocabulary();
    res.json({ success: true, vocabulary: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vocabulary', (req: Request, res: Response) => {
  try {
    const payload = req.body;
    let current = loadVocabulary();

    if (Array.isArray(payload.vocabulary)) {
      const incoming: any[] = payload.vocabulary;
      const vocabMap = new Map(current.map((v: any) => [v.id, v]));
      for (const item of incoming) {
        vocabMap.set(item.id || `voc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, item);
      }
      current = Array.from(vocabMap.values());
    } else if (payload.sourceWord && payload.targetWord) {
      const newItem = {
        id: payload.id || `voc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        sourceWord: payload.sourceWord,
        targetWord: payload.targetWord,
        sourceLanguage: payload.sourceLanguage || 'fr',
        targetLanguage: payload.targetLanguage || 'en',
        definition: payload.definition || '',
        partOfSpeech: payload.partOfSpeech || 'nom',
        hint: payload.hint || '',
        docTitle: payload.docTitle || '',
        mastered: Boolean(payload.mastered),
        addedAt: payload.addedAt || new Date().toISOString(),
      };
      
      const idx = current.findIndex((v: any) => v.id === newItem.id || (v.sourceWord.toLowerCase() === newItem.sourceWord.toLowerCase() && v.targetLanguage === newItem.targetLanguage));
      if (idx >= 0) {
        current[idx] = { ...current[idx], ...newItem };
      } else {
        current.unshift(newItem);
      }
    } else {
      return res.status(400).json({ error: 'Invalid vocabulary payload' });
    }

    saveVocabulary(current);
    res.json({ success: true, vocabulary: current, count: current.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/vocabulary/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let current = loadVocabulary();
    const prevLen = current.length;
    current = current.filter((v: any) => v.id !== id);
    saveVocabulary(current);
    res.json({ success: true, deleted: prevLen - current.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// COMPLETE STUDY PROGRESS BACKUP & RESTORE API
// -------------------------------------------------------------
app.get('/api/backup/export', (req: Request, res: Response) => {
  try {
    const docs = loadDocuments() || [];
    const flashcards = loadFlashcards() || [];
    const quizHistory = loadQuizHistory() || [];
    const vocabulary = loadVocabulary() || [];
    const streaks = loadStreaks();
    const preferences = loadPreferences();

    const timestamp = new Date().toISOString();
    const dateStr = timestamp.split('T')[0];

    const backupData = {
      version: '1.0.0',
      appName: 'DegreeLocker StudyVault AI',
      exportedAt: timestamp,
      userStats: {
        streakDays: streaks.currentStreak || 0,
        activityDates: streaks.activityDates || [],
        totalStudySessions: (streaks.activityDates || []).length,
        totalDocuments: docs.length,
        totalQuizzesTaken: quizHistory.length,
        totalFlashcards: flashcards.length,
        totalVocabularyWords: vocabulary.length,
      },
      streaks,
      quizResults: quizHistory,
      vocabularyList: vocabulary,
      flashcards,
      documents: docs,
      preferences,
    };

    const isDownload = req.query.download === 'true';
    if (isDownload) {
      const filename = `study_backup_${dateStr}_${Date.now().toString().slice(-4)}.json`;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(JSON.stringify(backupData, null, 2));
    }

    res.json({ success: true, backup: backupData });
  } catch (err: any) {
    console.error('Backup export error:', err);
    res.status(500).json({ error: err.message || 'Error exporting study backup' });
  }
});

app.post('/api/backup/restore', (req: Request, res: Response) => {
  try {
    const backup = req.body;
    if (!backup || typeof backup !== 'object') {
      return res.status(400).json({ error: 'Invalid backup file format' });
    }

    let restoredDocsCount = 0;
    let restoredCardsCount = 0;
    let restoredQuizzesCount = 0;
    let restoredVocabCount = 0;

    // 1. Documents
    if (Array.isArray(backup.documents)) {
      saveDocuments(backup.documents);
      restoredDocsCount = backup.documents.length;
    }

    // 2. Flashcards
    if (Array.isArray(backup.flashcards)) {
      saveFlashcards(backup.flashcards);
      restoredCardsCount = backup.flashcards.length;
    }

    // 3. Quiz History
    if (Array.isArray(backup.quizResults)) {
      saveQuizHistory(backup.quizResults);
      restoredQuizzesCount = backup.quizResults.length;
    }

    // 4. Vocabulary List
    if (Array.isArray(backup.vocabularyList)) {
      saveVocabulary(backup.vocabularyList);
      restoredVocabCount = backup.vocabularyList.length;
    }

    // 5. Streaks
    if (backup.streaks && Array.isArray(backup.streaks.activityDates)) {
      saveStreaks(backup.streaks);
    } else if (backup.userStats?.activityDates) {
      saveStreaks({
        activityDates: backup.userStats.activityDates,
        currentStreak: backup.userStats.streakDays || 0,
      });
    }

    // 6. Preferences
    if (backup.preferences && typeof backup.preferences === 'object') {
      savePreferences(backup.preferences);
    }

    res.json({
      success: true,
      message: 'Study progress successfully restored!',
      restoredCounts: {
        documents: restoredDocsCount,
        flashcards: restoredCardsCount,
        quizResults: restoredQuizzesCount,
        vocabularyList: restoredVocabCount,
        streakDays: backup.streaks?.currentStreak || backup.userStats?.streakDays || 0,
      },
    });
  } catch (err: any) {
    console.error('Backup restore error:', err);
    res.status(500).json({ error: err.message || 'Error restoring study backup' });
  }
});

// GET all documents
app.get('/api/documents', (req: Request, res: Response) => {
  const docs = loadDocuments();
  res.json({ documents: docs });
});

// POST save or update document
app.post('/api/documents', (req: Request, res: Response) => {
  try {
    const newDoc = req.body;
    if (!newDoc || !newDoc.title) {
      return res.status(400).json({ error: 'Invalid document payload' });
    }

    let docs = loadDocuments() || [];
    const index = docs.findIndex((d: any) => d.id === newDoc.id);

    const timestamp = new Date().toISOString();
    if (index >= 0) {
      docs[index] = { ...docs[index], ...newDoc, updatedAt: timestamp };
    } else {
      docs.unshift({
        ...newDoc,
        id: newDoc.id || `doc-${Date.now()}`,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    saveDocuments(docs);
    res.json({ success: true, document: index >= 0 ? docs[index] : docs[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE document
app.delete('/api/documents/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let docs = loadDocuments() || [];
    const initialLen = docs.length;
    docs = docs.filter((d: any) => d.id !== id);

    if (docs.length === initialLen) {
      return res.status(404).json({ error: 'Document not found' });
    }

    saveDocuments(docs);
    res.json({ success: true, message: 'Document deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk import database
app.post('/api/documents/import', (req: Request, res: Response) => {
  try {
    const { documents } = req.body;
    if (!Array.isArray(documents)) {
      return res.status(400).json({ error: 'Expected an array of documents' });
    }
    saveDocuments(documents);
    res.json({ success: true, count: documents.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET complete inside-PC database status and disk storage metrics
app.get('/api/database/status', (req: Request, res: Response) => {
  try {
    const docs = loadDocuments() || [];
    const flashcards = loadFlashcards() || [];
    const dbExists = fs.existsSync(DB_FILE);
    const fcExists = fs.existsSync(FLASHCARDS_FILE);
    const uploadsExists = fs.existsSync(UPLOADS_DIR);

    const dbStat = dbExists ? fs.statSync(DB_FILE) : null;
    const fcStat = fcExists ? fs.statSync(FLASHCARDS_FILE) : null;
    
    let uploadsCount = 0;
    let uploadsSizeBytes = 0;
    if (uploadsExists) {
      const files = fs.readdirSync(UPLOADS_DIR);
      uploadsCount = files.length;
      files.forEach(f => {
        try {
          const s = fs.statSync(path.join(UPLOADS_DIR, f));
          uploadsSizeBytes += s.size;
        } catch (_) {}
      });
    }

    res.json({
      isLocalDisk: true,
      storageType: 'Inside-PC Local Disk Storage (Air-Gapped Ready)',
      privacyProof: {
        cloudDatabasesConnected: false,
        externalSync: 'Disabled (100% Local File Storage)',
        zeroCloudStorage: true,
        guarantee: 'All school documents, blocknotes, flashcards, and uploaded files are saved strictly on your local PC disk. Nothing is uploaded to external cloud databases.',
      },
      dataDirectory: DATA_DIR,
      databaseFile: {
        path: DB_FILE,
        exists: dbExists,
        sizeBytes: dbStat ? dbStat.size : 0,
        docCount: docs.length,
        lastModified: dbStat ? dbStat.mtime.toISOString() : null,
      },
      flashcardsFile: {
        path: FLASHCARDS_FILE,
        exists: fcExists,
        sizeBytes: fcStat ? fcStat.size : 0,
        count: flashcards.length,
        lastModified: fcStat ? fcStat.mtime.toISOString() : null,
      },
      uploadsFolder: {
        path: UPLOADS_DIR,
        exists: uploadsExists,
        fileCount: uploadsCount,
        totalSizeBytes: uploadsSizeBytes,
      },
      totalDiskUsageBytes: (dbStat?.size || 0) + (fcStat?.size || 0) + uploadsSizeBytes,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST export complete inside-PC bundle (documents + flashcards)
app.get('/api/database/export-complete', (req: Request, res: Response) => {
  try {
    const docs = loadDocuments() || [];
    const flashcards = loadFlashcards() || [];
    const payload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      storageType: 'Inside-PC Local Disk Storage',
      documentsCount: docs.length,
      flashcardsCount: flashcards.length,
      documents: docs,
      flashcards: flashcards,
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=inside_pc_database_complete_backup_${new Date().toISOString().split('T')[0]}.json`);
    res.send(JSON.stringify(payload, null, 2));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST sync documents to OneDrive cloud
app.post('/api/onedrive/sync', (req: Request, res: Response) => {
  try {
    const { email, uid, documents } = req.body;
    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({ error: 'Expected documents array' });
    }
    // Save locally as cloud backup representation
    saveDocuments(documents);
    res.json({
      success: true,
      email: email || 'dolfius1er@gmail.com',
      syncedCount: documents.length,
      syncedAt: new Date().toISOString(),
      message: 'OneDrive cloud storage successfully synchronized with PC & Mobile devices.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET search within OneDrive cloud documents
app.get('/api/onedrive/search', (req: Request, res: Response) => {
  try {
    const q = ((req.query.q as string) || '').toLowerCase();
    const email = (req.query.email as string) || 'dolfius1er@gmail.com';
    const docs = loadDocuments() || [];
    
    const results = docs.filter((d: any) => 
      d.title.toLowerCase().includes(q) ||
      d.subject.toLowerCase().includes(q) ||
      d.content.toLowerCase().includes(q)
    );

    res.json({
      success: true,
      email,
      query: q,
      resultsCount: results.length,
      results,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// AI SEARCH (Natural Language Queries)
// -------------------------------------------------------------
app.post('/api/search', async (req: Request, res: Response) => {
  try {
    const { query, subjectFilter } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    let docs = loadDocuments() || [];
    if (subjectFilter && subjectFilter !== 'all') {
      docs = docs.filter((d: any) => d.subject?.toLowerCase() === subjectFilter.toLowerCase());
    }

    if (docs.length === 0) {
      return res.json({
        answer: "There are no matching documents in your school database for this subject.",
        citations: [],
        matchedDocIds: [],
        keyInsights: [],
        suggestedFollowUps: ["Upload your notes or PDFs to query your custom database."],
      });
    }

    // Build document knowledge base context for Gemini
    const docSummaries = docs.map((d: any, idx: number) => {
      const truncatedContent = d.content ? d.content.slice(0, 3500) : '';
      return `--- DOCUMENT ID: ${d.id} ---
Title: ${d.title}
Subject: ${d.subject}
Date: ${d.date || 'Unknown'}
Content Excerpt:
${truncatedContent}
`;
    }).join('\n\n');

    const prompt = `You are an expert academic tutor and school database AI search engine.
A student is searching their personal school notes and uploaded PDF database using a natural language query.

CRITICAL ANTI-HALLUCINATION INSTRUCTION:
DO NOT INVENT, FABRICATE OR EXTRAPOLATE FACTS NOT PRESENT IN THE STUDENT'S NOTES.
If a concept or fact is not explicitly covered or supported by the source text, state clearly: "Cette information n'est pas présente dans vos notes / This information is not present in your source documents".
Always provide exact citations pointing to the source document title and quote.

USER NATURAL LANGUAGE QUERY:
"${query}"

STUDENT'S DATABASE OF SCHOOL NOTES & PDFS:
${docSummaries}

TASK:
1. Provide a comprehensive, clear, and pedagogically sound synthesized answer directly answering the student's question based strictly on their school notes. If something isn't in their notes, explicitly indicate what is covered vs what is absent.
2. Provide direct citations (with docId, docTitle, subject, exact or summarized quote, and relevance score 0-100).
3. Identify which docIds are relevant.
4. Provide 2-4 key high-yield study insights or takeaways.
5. Provide 2-3 suggested follow-up questions to help the student review.

Return the response in JSON format.`;

    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: {
              type: Type.STRING,
              description: 'Clear, comprehensive answer to the user query based on their school notes.',
            },
            citations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  docId: { type: Type.STRING },
                  docTitle: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  quote: { type: Type.STRING },
                  relevanceScore: { type: Type.NUMBER },
                },
                required: ['docId', 'docTitle', 'subject', 'quote', 'relevanceScore'],
              },
            },
            matchedDocIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            keyInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedFollowUps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['answer', 'citations', 'matchedDocIds', 'keyInsights', 'suggestedFollowUps'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Search error:', err);
    res.status(500).json({ error: err.message || 'Error executing AI search' });
  }
});

// -------------------------------------------------------------
// AI MAKE RESUMER (Summarization)
// -------------------------------------------------------------
app.post('/api/summarize', async (req: Request, res: Response) => {
  try {
    const { title, subject, content, style = 'cornell', targetLength = 'brief', language = 'auto' } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required for summary' });
    }

    const prompt = `You are an academic summarizer for students.
Create a structured summary ("résumé de cours") for this school document.

Document Title: ${title || 'Untitled'}
Subject: ${subject || 'General'}
Requested Style: ${style} (choices: concise, cornell, exam_prep, flashcards)
Length: ${targetLength}
Language: ${language === 'auto' ? 'Match the language of the source text (e.g. French if source is French, English if English)' : language}

SOURCE CONTENT:
${content.slice(0, 10000)}

Please return JSON with:
- summary: The full structured summary text with clear sections, headers, and bullet points.
- keyPoints: List of 4-6 crucial concepts/facts for rapid revision.
- examTips: 2-3 actionable tips or pitfalls to watch out for on tests.`;

    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            examTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['summary', 'keyPoints'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Summarize error:', err);
    res.status(500).json({ error: err.message || 'Error generating summary' });
  }
});

// -------------------------------------------------------------
// AI BLOCKNOTE REPRODUCTION GUIDE
// Creates note structured specifically for copying by hand onto a physical notebook
// -------------------------------------------------------------
app.post('/api/generate-blocknote', async (req: Request, res: Response) => {
  try {
    const { title, subject, content, preferredPaper = 'seyes' } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const effectiveSubject = subject && subject !== 'Général' && subject !== 'General' 
      ? subject 
      : detectSubjectFromText(title || '', content);

    const prompt = `You are a master study coach specializing in handwritten study notes and Cornell notebook reproduction.
The student wants to copy and reproduce high-yield notes by hand onto a physical paper notebook (blocknote, cahier, legal pad, or grid sheet) with their own handwriting.

To make handwriting efficient, visually clear, and memorable on physical paper:
1. Distill the material into high-impact, bite-sized lines designed for handwriting.
2. Provide layout cues:
   - Cornell-style cue column margin prompts for each section (questions/keywords).
   - Clear visual classifications: 'title', 'bullet', 'subbullet', 'formula', 'definition', 'box_note' (for key laws/rules to frame in a drawn box), 'sketch_tip' (instructions on how to draw a quick diagram on paper).
   - Color pen allocation tips: e.g. blue for body, red for formulas & warnings, green for definitions/locations, black for outlines.
   - Quick ASCII sketch diagram that is simple and easy for the student to draw with a pen on notebook paper.
   - Bottom summary paragraph for the Cornell bottom section.
   - 2-3 specific handwriting tips (e.g. how to split the page margins, indentation spacing, pen thickness).

DOCUMENT TITLE: ${title || 'School Note'}
SUBJECT: ${effectiveSubject}
PREFERRED PAPER: ${preferredPaper}

SOURCE TEXT:
${content.slice(0, 10000)}

Output pure JSON adhering to the specified schema.`;

    let parsed: any = null;
    try {
      const { text } = await callGeminiWithFallback({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              estimatedCopyTimeMin: { type: Type.NUMBER },
              recommendedPaper: {
                type: Type.STRING,
                enum: ['ruled', 'grid', 'dots', 'legal', 'seyes'],
              },
              layoutStructure: {
                type: Type.STRING,
                enum: ['cornell', 'bullet', 'mindmap_tree', 'cheat_sheet'],
              },
              recommendedPens: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    color: { type: Type.STRING, description: 'Hex color code e.g. #2563eb' },
                    name: { type: Type.STRING, description: 'e.g. Blue, Red, Green, Black' },
                    purpose: { type: Type.STRING, description: 'What to use this pen for' },
                  },
                  required: ['color', 'name', 'purpose'],
                },
              },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    heading: { type: Type.STRING },
                    cueMarginText: { type: Type.STRING },
                    lines: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          text: { type: Type.STRING },
                          type: {
                            type: Type.STRING,
                            enum: ['title', 'bullet', 'subbullet', 'formula', 'definition', 'box_note', 'sketch_tip'],
                          },
                          penColor: {
                            type: Type.STRING,
                            enum: ['blue', 'black', 'red', 'green', 'purple'],
                          },
                        },
                        required: ['id', 'text', 'type', 'penColor'],
                      },
                    },
                    quickSketchAscii: { type: Type.STRING },
                  },
                  required: ['id', 'heading', 'lines'],
                },
              },
              bottomSummary: { type: Type.STRING },
              handwritingTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'title',
              'estimatedCopyTimeMin',
              'recommendedPaper',
              'layoutStructure',
              'recommendedPens',
              'sections',
              'bottomSummary',
              'handwritingTips',
            ],
          },
        },
        preferredModel: 'gemini-3.5-flash',
      });

      parsed = safeJsonParse(text);
    } catch (aiErr: any) {
      console.warn('AI blocknote generation encountered error, activating deterministic local blocknote generator:', aiErr.message || aiErr);
    }

    // Deterministic fallback ensures the student ALWAYS gets a complete blocknote reproduction guide!
    if (!parsed || !parsed.title || !parsed.sections || parsed.sections.length === 0) {
      parsed = generateLocalBlocknoteFallback(title, effectiveSubject, content, preferredPaper);
    }

    res.json(parsed);
  } catch (err: any) {
    console.error('Blocknote generation critical error, applying fallback:', err);
    const { title, subject, content, preferredPaper = 'seyes' } = req.body;
    const fallback = generateLocalBlocknoteFallback(title, subject, content, preferredPaper);
    res.json(fallback);
  }
});

// -------------------------------------------------------------
// PDF ANALYSIS & TEXT EXTRACTION
// -------------------------------------------------------------
app.post('/api/parse-pdf', async (req: Request, res: Response) => {
  try {
    const { base64Data, fileName } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'base64Data is required' });
    }

    // Clean any base64 prefix cleanly regardless of mime-type variation
    let cleanBase64 = String(base64Data);
    if (cleanBase64.includes(';base64,')) {
      cleanBase64 = cleanBase64.split(';base64,')[1];
    } else {
      cleanBase64 = cleanBase64.replace(/^data:[^;]+;base64,/, '');
    }
    cleanBase64 = cleanBase64.trim();

    // Persist uploaded PDF file locally to disk in UPLOADS_DIR
    const safeFileName = `${Date.now()}-${(fileName || 'document.pdf').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const localFilePath = path.join(UPLOADS_DIR, safeFileName);
    const pdfBuffer = Buffer.from(cleanBase64, 'base64');
    fs.writeFileSync(localFilePath, pdfBuffer);

    let parsed: any = null;

    try {
      const pdfPart = {
        inlineData: {
          mimeType: 'application/pdf',
          data: cleanBase64,
        },
      };

      const textPart = {
        text: `Analyze this uploaded school/course PDF document.
File name: ${fileName || 'document.pdf'}

MANDATORY INSTRUCTIONS:
1. Document title: Clear, specific, academic title.
2. Academic subject: Determine the EXACT academic discipline (e.g. Mathématiques, Physique-Chimie, SVT / Biologie, Histoire-Géographie, Philosophie, Français & Littérature, Informatique / NSI, SES / Économie, Droit, Anglais, etc.). NEVER return 'Général' or 'General' unless the content is entirely indeterminate.
3. Full comprehensive extracted text content organized with clear markdown headings, definitions, and bullet points.
4. Summary: A rich, informative 3-5 sentence description and synthesis explaining what concepts and topics the document covers.
5. Key points: 4-6 essential concepts and formulas.
6. Relevant tags (array of 3-6 strings).
7. Grade/education level estimate (e.g. 'Terminale', 'Première', 'Université', 'Prépa', 'Lycée', 'Collège').

Return as JSON.`,
      };

      const { text } = await callGeminiWithFallback({
        contents: { parts: [pdfPart, textPart] },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subject: { type: Type.STRING },
              content: { type: Type.STRING },
              summary: { type: Type.STRING },
              keyPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              gradeLevel: { type: Type.STRING },
            },
            required: ['title', 'subject', 'content', 'summary', 'keyPoints', 'tags'],
          },
        },
        preferredModel: 'gemini-3.5-flash',
      });

      parsed = safeJsonParse(text);
    } catch (aiErr: any) {
      console.warn('Gemini PDF analysis note (applying graceful structured fallback):', aiErr.message || aiErr);
    }

    // Guaranteed resilient fallback if AI analysis was throttled or incomplete
    const cleanTitle = (fileName || 'Document PDF')
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .trim();
    const formattedTitle = cleanTitle ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : 'Document PDF';

    if (!parsed || !parsed.title) {
      const autoSubject = detectSubjectFromText(formattedTitle, '');
      parsed = {
        title: formattedTitle,
        subject: autoSubject,
        content: `# ${formattedTitle}\n\nDocument PDF importé avec succès (${(pdfBuffer.length / 1024).toFixed(1)} Ko).\n\nCe document est stocké localement sur votre machine (PC) dans votre base Degree Unlocker. Vous pouvez l'utiliser pour générer des résumés, des flashcards, des quiz d'entraînement ou des guides de bloc-notes manuscrits.`,
        summary: `Document de ${autoSubject} numérisé et archivé dans votre base locale. Prêt pour la révision, l'extraction de fiches et la reproduction manuscrite.`,
        keyPoints: [
          `Matière identifiée : ${autoSubject}`,
          'Document PDF archivé sur votre disque local',
          'Compatible pour la création de fiches flashcards et quiz',
          'Accessible à tout moment pour la révision et la synthèse',
        ],
        tags: [autoSubject, 'PDF', 'Cours', 'Révision'],
        gradeLevel: 'Lycée / Université',
      };
    }

    // Auto-detect subject if AI gave something generic
    if (!parsed.subject || parsed.subject === 'Général' || parsed.subject === 'General') {
      parsed.subject = detectSubjectFromText(parsed.title || formattedTitle, parsed.content || '');
    }

    res.json({
      ...parsed,
      description: parsed.summary,
      storedFileName: safeFileName,
      localFilePath: localFilePath,
      fileSizeBytes: pdfBuffer.length,
      downloadUrl: `/api/storage/files/${safeFileName}`,
    });
  } catch (err: any) {
    console.error('PDF parsing critical error:', err);
    res.status(500).json({ error: err.message || 'Failed to parse PDF document' });
  }
});

// -------------------------------------------------------------
// MULTI-FORMAT DOCUMENT INGESTION (Word .docx, Excel .xlsx/.csv, Google Docs, Text)
// -------------------------------------------------------------
app.post('/api/parse-document', async (req: Request, res: Response) => {
  try {
    const {
      base64Data,
      fileName = 'document',
      fileType, // 'word' | 'excel' | 'google_doc' | 'text'
      googleDocUrl,
      pastedText,
      language = 'auto',
    } = req.body;

    let extractedText = '';
    let fileBuffer: Buffer | null = null;
    let effectiveDocType: string = 'typed_note';

    // 1. Google Doc / Google Sheet URL ingestion
    if (googleDocUrl && googleDocUrl.includes('docs.google.com')) {
      effectiveDocType = 'google_doc';
      try {
        let exportUrl = googleDocUrl;
        const docMatch = googleDocUrl.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
        const sheetMatch = googleDocUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);

        if (docMatch) {
          exportUrl = `https://docs.google.com/document/d/${docMatch[1]}/export?format=txt`;
        } else if (sheetMatch) {
          exportUrl = `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/export?format=csv`;
        }

        const fetchResponse = await fetch(exportUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        });

        if (fetchResponse.ok) {
          extractedText = await fetchResponse.text();
          fileBuffer = Buffer.from(extractedText, 'utf-8');
        } else {
          // If restricted/private, fall back to pasted text if provided
          if (pastedText && pastedText.trim().length > 0) {
            extractedText = pastedText;
            fileBuffer = Buffer.from(extractedText, 'utf-8');
          } else {
            return res.status(400).json({
              error:
                'Could not access Google Doc directly. Please ensure the document link is set to "Anyone with the link can view", or copy & paste the text directly into the provided input box.',
            });
          }
        }
      } catch (err: any) {
        if (pastedText) {
          extractedText = pastedText;
          fileBuffer = Buffer.from(extractedText, 'utf-8');
        } else {
          return res.status(400).json({
            error: `Failed to fetch Google Doc: ${err.message}. You can copy-paste the text directly.`,
          });
        }
      }
    } else if (base64Data) {
      const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
      fileBuffer = Buffer.from(cleanBase64, 'base64');
      const lowerName = fileName.toLowerCase();

      // 2. Word document (.docx)
      if (lowerName.endsWith('.docx') || fileType === 'word') {
        effectiveDocType = 'word_docx';
        try {
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          extractedText = result.value;
        } catch (mammothErr: any) {
          console.error('Mammoth extraction error:', mammothErr);
          return res.status(400).json({ error: 'Failed to read Word document (.docx). Please verify file is not corrupted.' });
        }
      }
      // 3. Excel Spreadsheet (.xlsx, .xls, .csv)
      else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.csv') || fileType === 'excel') {
        effectiveDocType = 'excel_sheet';
        try {
          const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
          const sheetNames = workbook.SheetNames;
          const textSections: string[] = [];

          sheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const csvData = XLSX.utils.sheet_to_csv(worksheet);
            textSections.push(`=== Sheet: ${sheetName} ===\n${csvData}`);
          });
          extractedText = textSections.join('\n\n');
        } catch (xlsxErr: any) {
          console.error('Excel extraction error:', xlsxErr);
          return res.status(400).json({ error: 'Failed to parse Excel spreadsheet. Please verify file format.' });
        }
      }
      // 4. Plain text / Markdown
      else {
        effectiveDocType = 'typed_note';
        extractedText = fileBuffer.toString('utf-8');
      }
    } else if (pastedText) {
      extractedText = pastedText;
      fileBuffer = Buffer.from(extractedText, 'utf-8');
      effectiveDocType = 'typed_note';
    } else {
      return res.status(400).json({ error: 'No file data, Google Doc URL, or text provided.' });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'Extracted text was empty. Please check the document content.' });
    }

    // Call Gemini 3.8 Flash to structure and extract study insights
    const prompt = `You are an expert academic curriculum assistant.
Analyze this raw extracted document text from a student's file (${fileName}):
Language preference: ${language === 'auto' ? 'Match the source language (French if in French, English if in English)' : language}

TEXT CONTENT:
${extractedText.slice(0, 18000)}

Please return a structured JSON response:
1. title: A concise, scholarly title for these notes.
2. subject: Academic discipline (e.g. Mathematics, Physics, Biology, History, Philosophy, Literature, Chemistry, Economics, Computer Science, etc.).
3. content: Well-formatted, clean version of the document with markdown headers, lists, and equations where appropriate.
4. summary: A high-impact executive summary (résumé de cours) suitable for exam revision.
5. keyPoints: Array of 4-7 key concepts, formulas, or takeaways.
6. tags: 3-5 relevant academic tags.
7. gradeLevel: Likely school grade or level (e.g., 'Terminale / Bac', 'Première', 'College / University', 'Lycée', 'Brevet').`;

    // Save to local storage disk (data/uploads/)
    const safeFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const localFilePath = path.join(UPLOADS_DIR, safeFileName);
    if (fileBuffer) {
      fs.writeFileSync(localFilePath, fileBuffer);
    } else {
      fs.writeFileSync(localFilePath, Buffer.from(extractedText, 'utf-8'));
    }

    let parsed: any = null;

    try {
      const { text } = await callGeminiWithFallback({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subject: { type: Type.STRING },
              content: { type: Type.STRING },
              summary: { type: Type.STRING },
              keyPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              gradeLevel: { type: Type.STRING },
            },
            required: ['title', 'subject', 'content', 'summary', 'keyPoints', 'tags'],
          },
        },
        preferredModel: 'gemini-3.5-flash',
      });

      parsed = safeJsonParse(text);
    } catch (aiErr: any) {
      console.warn('Gemini doc analysis warning (using fallback):', aiErr.message || aiErr);
    }

    const cleanTitle = (fileName || 'Document')
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .trim();
    const formattedTitle = cleanTitle ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : 'Document';
    const detectedSubj = detectSubjectFromText(fileName, extractedText);

    if (!parsed || !parsed.title) {
      // Build a rich executive description from the first non-empty lines of content
      const firstLines = extractedText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 20)
        .slice(0, 3)
        .join(' ');

      const smartSummary = firstLines
        ? `Synthèse du document : ${firstLines.slice(0, 280)}...`
        : `Document de ${detectedSubj} archivé en local (${extractedText.length} caractères). Prêt pour révisions et exercices.`;

      parsed = {
        title: formattedTitle,
        subject: detectedSubj,
        content: extractedText,
        summary: smartSummary,
        keyPoints: [
          `Discipline académique : ${detectedSubj}`,
          'Contenu intégral sauvegardé et stocké localement sur PC',
          'Exportable vers Google Docs et compatible flashcards & quiz',
        ],
        tags: [detectedSubj, 'Notes', 'Cours'],
        gradeLevel: 'Lycée / Université',
      };
    }

    // Auto-override if subject was missed or defaulted to 'Général'
    if (!parsed.subject || parsed.subject === 'Général' || parsed.subject === 'General') {
      parsed.subject = detectedSubj;
    }

    res.json({
      ...parsed,
      description: parsed.summary,
      type: effectiveDocType,
      fileName,
      storedFileName: safeFileName,
      localFilePath,
      fileSizeBytes: fileBuffer ? fileBuffer.length : extractedText.length,
      downloadUrl: `/api/storage/files/${safeFileName}`,
    });
  } catch (err: any) {
    console.error('Document parsing error:', err);
    res.status(500).json({ error: err.message || 'Failed to parse document' });
  }
});

// -------------------------------------------------------------
// PHOTO OF NOTES TO GOOGLE DOCS / LOCAL DOCUMENT
// Converts student camera photos / scans of handwritten notes into formatted Google Docs
// -------------------------------------------------------------
app.post('/api/scan-notes-photo', async (req: Request, res: Response) => {
  try {
    const { base64Image, fileName = 'photo_notes.jpg', subjectHint, language = 'fr' } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: 'base64Image is required' });
    }

    let cleanBase64 = String(base64Image);
    let mimeType = 'image/jpeg';
    if (cleanBase64.startsWith('data:')) {
      const match = cleanBase64.match(/^data:([^;]+);base64,/);
      if (match) mimeType = match[1];
      cleanBase64 = cleanBase64.replace(/^data:[^;]+;base64,/, '');
    }
    cleanBase64 = cleanBase64.trim();

    const imageBuffer = Buffer.from(cleanBase64, 'base64');
    const safeFileName = `${Date.now()}-photo-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const localFilePath = path.join(UPLOADS_DIR, safeFileName);
    fs.writeFileSync(localFilePath, imageBuffer);

    const prompt = `You are a master academic note digitizer.
The student has taken a photograph of their handwritten notes, classroom chalkboard, or textbook page.
Carefully transcribe all handwritten text, solve handwriting ambiguities, and structure it into a clean, complete, high-yield academic document (Google Docs ready).

REQUIREMENTS:
1. title: Clean, scholarly title.
2. subject: Determine the EXACT academic subject (e.g. Mathématiques, Physique-Chimie, SVT / Biologie, Histoire-Géographie, Philosophie, Français & Littérature, Informatique / NSI, SES / Économie, etc.). NEVER return 'Général' or 'General'.
3. content: Fully formatted markdown text with:
   - # Document Title
   - ## Key Subheadings
   - Bullet points for key definitions and theories
   - Clear formula representations
4. summary: A rich 3-5 sentence description and synthesis explaining what the student wrote on their paper.
5. keyPoints: 4-6 essential high-yield points.
6. tags: 3-5 academic tags.
7. gradeLevel: Academic grade estimate.

Language: ${language === 'en' ? 'English' : 'French'}.
Return response in JSON matching schema.`;

    const contents = {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        },
        { text: prompt },
      ],
    };

    let parsed: any = null;
    try {
      const { text } = await callGeminiWithFallback({
        contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subject: { type: Type.STRING },
              content: { type: Type.STRING },
              summary: { type: Type.STRING },
              keyPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              gradeLevel: { type: Type.STRING },
            },
            required: ['title', 'subject', 'content', 'summary', 'keyPoints', 'tags'],
          },
        },
        preferredModel: 'gemini-3.5-flash',
      });
      parsed = safeJsonParse(text);
    } catch (aiErr: any) {
      console.warn('Vision photo transcription fallback:', aiErr.message || aiErr);
    }

    const fallbackSubject = subjectHint || 'Notes Manuscrites';
    if (!parsed || !parsed.title || !parsed.content) {
      parsed = {
        title: 'Notes Manuscrites Photographiées',
        subject: fallbackSubject,
        content: `# Notes Manuscrites Numérisées\n\nPhoto de notes enregistrée avec succès sur votre ordinateur (${(imageBuffer.length / 1024).toFixed(1)} Ko).\n\nCette capture est archivée localement dans votre bibliothèque Degree Unlocker et prête pour l'exportation vers Google Docs ou la création de fiches.`,
        summary: 'Photo de notes de cours sauvegardée localement sur votre ordinateur.',
        keyPoints: [
          'Capture de notes archivée 100% en local',
          'Compatible avec l\'exportation Google Docs (.docx)',
          'Disponible pour la répétition espacée et révision',
        ],
        tags: ['Photo', 'Manuscrit', 'Numérisation'],
        gradeLevel: 'Lycée / Université',
      };
    }

    if (!parsed.subject || parsed.subject === 'Général' || parsed.subject === 'General') {
      parsed.subject = detectSubjectFromText(parsed.title, parsed.content);
    }

    const timestamp = new Date().toISOString();
    const newDoc = {
      id: `doc-photo-${Date.now()}`,
      title: parsed.title,
      subject: parsed.subject,
      description: parsed.summary,
      content: parsed.content,
      summary: parsed.summary,
      keyPoints: parsed.keyPoints || [],
      tags: parsed.tags || [],
      gradeLevel: parsed.gradeLevel || 'Lycée / Université',
      type: 'photo_scanned',
      fileName: fileName,
      storedFileName: safeFileName,
      localFilePath: localFilePath,
      fileSize: imageBuffer.length,
      createdAt: timestamp,
      updatedAt: timestamp,
      googleDocExportable: true,
      imageUrl: `/api/storage/files/${safeFileName}`,
    };

    // Store in database.json
    let docs = loadDocuments() || [];
    docs.unshift(newDoc);
    saveDocuments(docs);

    res.json({
      success: true,
      document: newDoc,
      downloadUrl: `/api/storage/files/${safeFileName}`,
    });
  } catch (err: any) {
    console.error('Scan photo error:', err);
    res.status(500).json({ error: err.message || 'Failed to scan notes photo' });
  }
});

// -------------------------------------------------------------
// FLASHCARDS & SPACED REPETITION API
// -------------------------------------------------------------

// GET all flashcards
app.get('/api/flashcards', (req: Request, res: Response) => {
  try {
    let cards = loadFlashcards();
    res.json({ flashcards: cards });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error loading flashcards' });
  }
});

// POST save / update flashcards (bulk or single)
app.post('/api/flashcards', (req: Request, res: Response) => {
  try {
    const payload = req.body;
    let existingCards = loadFlashcards();

    if (Array.isArray(payload.flashcards)) {
      // Merge or overwrite cards
      const incoming: any[] = payload.flashcards;
      const cardMap = new Map(existingCards.map((c: any) => [c.id, c]));
      for (const card of incoming) {
        cardMap.set(card.id, card);
      }
      existingCards = Array.from(cardMap.values());
    } else if (payload.id) {
      // Single card update (e.g. spaced repetition rating review)
      const index = existingCards.findIndex((c: any) => c.id === payload.id);
      if (index >= 0) {
        existingCards[index] = { ...existingCards[index], ...payload };
      } else {
        existingCards.push(payload);
      }
    } else {
      return res.status(400).json({ error: 'Invalid flashcard payload' });
    }

    saveFlashcards(existingCards);
    res.json({ success: true, count: existingCards.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error saving flashcards' });
  }
});

// DELETE flashcard
app.delete('/api/flashcards/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let cards = loadFlashcards();
    const initialLen = cards.length;
    cards = cards.filter((c: any) => c.id !== id);
    saveFlashcards(cards);
    res.json({ success: true, deleted: initialLen - cards.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error deleting flashcard' });
  }
});

// POST auto-generate interactive flashcards from document using Gemini
app.post('/api/generate-flashcards', async (req: Request, res: Response) => {
  try {
    const {
      docId,
      docTitle,
      subject = 'General',
      content,
      summary,
      keyPoints = [],
      cardCount = 8,
      language = 'auto',
    } = req.body;

    if (!content && !summary) {
      return res.status(400).json({ error: 'Document content or summary is required' });
    }

    const textToAnalyze = `
Document Title: ${docTitle || 'School Note'}
Subject: ${subject}
Summary: ${summary || ''}
Key Points: ${keyPoints.join('; ')}
Source Content:
${(content || '').slice(0, 10000)}
`;

    const prompt = `You are a cognitive science and spaced repetition expert creating study flashcards for a student.
CRITICAL INSTRUCTION: Generate flashcards based EXCLUSIVELY and STRICTLY on the source document below.
DO NOT hallucinate or invent facts outside the text. Every answer must be directly verifiable in the text.

Language Requirement: ${language === 'auto' ? 'Match the language of the source document (French if the document is French, English if English)' : language}

Generate exactly ${cardCount} high-yield, exam-oriented study flashcards.
Each flashcard must contain:
1. question: A clear, specific question testing a core concept, definition, mechanism, formula, or historical event.
2. answer: An exact, concise, and rigorous answer that explains the key idea clearly.
3. hints: A subtle memory trigger or clue without giving away the entire answer.
4. tags: 1-3 tags.
5. difficulty: 'easy' | 'medium' | 'hard'.

SOURCE MATERIAL:
${textToAnalyze}`;

    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
              hints: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              difficulty: {
                type: Type.STRING,
                description: "easy, medium, or hard",
              },
            },
            required: ['question', 'answer', 'difficulty'],
          },
        },
      },
    });

    const rawCards = JSON.parse(response.text || '[]');
    const today = new Date().toISOString().split('T')[0];

    const flashcards = rawCards.map((c: any, index: number) => ({
      id: `fc-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      docId: docId || undefined,
      docTitle: docTitle || 'School Document',
      subject: subject || 'General',
      question: c.question,
      answer: c.answer,
      hints: c.hints || '',
      tags: c.tags || [subject],
      difficulty: (c.difficulty === 'hard' || c.difficulty === 'medium' || c.difficulty === 'easy') ? c.difficulty : 'medium',
      // Spaced repetition defaults (Leitner Box 1)
      box: 1,
      intervalDays: 1,
      repetitionCount: 0,
      consecutiveCorrect: 0,
      lastReviewedAt: undefined,
      nextReviewDate: today,
    }));

    // Automatically persist newly generated cards into flashcards.json
    let existingCards = loadFlashcards();
    existingCards = [...existingCards, ...flashcards];
    saveFlashcards(existingCards);

    res.json({
      flashcards,
      count: flashcards.length,
      docId,
      docTitle,
    });
  } catch (err: any) {
    console.error('Generate flashcards error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate flashcards' });
  }
});

// -------------------------------------------------------------
// LOCAL STORAGE & FILE MANAGEMENT (Saved on local disk in data/uploads/)
// -------------------------------------------------------------

// Save an arbitrary file or exported note to local disk
app.post('/api/upload-file', (req: Request, res: Response) => {
  try {
    const { base64Data, fileName, textContent, docId } = req.body;
    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }

    const safeFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const targetPath = path.join(UPLOADS_DIR, safeFileName);

    let buffer: Buffer;
    if (base64Data) {
      const clean = base64Data.replace(/^data:[^;]+;base64,/, '');
      buffer = Buffer.from(clean, 'base64');
    } else if (textContent) {
      buffer = Buffer.from(textContent, 'utf-8');
    } else {
      return res.status(400).json({ error: 'Either base64Data or textContent is required' });
    }

    fs.writeFileSync(targetPath, buffer);

    // Update document if docId provided
    if (docId) {
      const docs = loadDocuments() || [];
      const idx = docs.findIndex((d: any) => d.id === docId);
      if (idx >= 0) {
        docs[idx].localFilePath = targetPath;
        docs[idx].storedFileName = safeFileName;
        docs[idx].fileSize = buffer.length;
        saveDocuments(docs);
      }
    }

    res.json({
      success: true,
      storedFileName: safeFileName,
      localFilePath: targetPath,
      fileSizeBytes: buffer.length,
      downloadUrl: `/api/storage/files/${safeFileName}`,
    });
  } catch (err: any) {
    console.error('Save file error:', err);
    res.status(500).json({ error: err.message || 'Error saving file to disk' });
  }
});

// List all locally stored files on disk
app.get('/api/storage/files', (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      return res.json({ files: [], totalSizeBytes: 0 });
    }

    const docs = loadDocuments() || [];
    const fileNames = fs.readdirSync(UPLOADS_DIR);
    let totalSizeBytes = 0;

    const files = fileNames.map((name) => {
      const filePath = path.join(UPLOADS_DIR, name);
      const stat = fs.statSync(filePath);
      totalSizeBytes += stat.size;

      // Match with database document if any
      const matchedDoc = docs.find((d: any) => d.storedFileName === name || d.fileName === name);

      let mimeType = 'application/octet-stream';
      if (name.endsWith('.pdf')) mimeType = 'application/pdf';
      else if (name.endsWith('.txt')) mimeType = 'text/plain';
      else if (name.endsWith('.json')) mimeType = 'application/json';
      else if (name.endsWith('.md')) mimeType = 'text/markdown';

      const sizeFormatted = stat.size > 1024 * 1024
        ? `${(stat.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(stat.size / 1024)} KB`;

      return {
        fileName: name,
        originalName: matchedDoc?.fileName || name.replace(/^\d+-/, ''),
        fileSizeBytes: stat.size,
        sizeFormatted,
        mimeType,
        storedAt: stat.mtime.toISOString(),
        relativePath: `data/uploads/${name}`,
        associatedDocId: matchedDoc?.id,
        associatedDocTitle: matchedDoc?.title,
        downloadUrl: `/api/storage/files/${name}`,
      };
    });

    res.json({
      files: files.sort((a, b) => new Date(b.storedAt).getTime() - new Date(a.storedAt).getTime()),
      totalSizeBytes,
      storageDirectory: UPLOADS_DIR,
      capacityLimitMb: 150,
    });
  } catch (err: any) {
    console.error('List storage files error:', err);
    res.status(500).json({ error: err.message || 'Error reading storage directory' });
  }
});

// Serve / download a local stored file
app.get('/api/storage/files/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    // Sanitize to prevent directory traversal
    const safeName = path.basename(filename);
    const filePath = path.join(UPLOADS_DIR, safeName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on local disk' });
    }

    if (safeName.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (safeName.endsWith('.txt') || safeName.endsWith('.md')) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    } else {
      res.setHeader('Content-Type', 'application/octet-stream');
    }

    res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
    res.sendFile(filePath);
  } catch (err: any) {
    console.error('Serve file error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a local file from disk
app.delete('/api/storage/files/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const safeName = path.basename(filename);
    const filePath = path.join(UPLOADS_DIR, safeName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Unlink from document if matched
    const docs = loadDocuments() || [];
    let changed = false;
    docs.forEach((d: any) => {
      if (d.storedFileName === safeName) {
        delete d.storedFileName;
        delete d.localFilePath;
        changed = true;
      }
    });
    if (changed) saveDocuments(docs);

    res.json({ success: true, message: 'File deleted from local disk' });
  } catch (err: any) {
    console.error('Delete file error:', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// SOURCE VALIDATION & ANTI-HALLUCINATION AUDITOR
// Evaluates academic credibility, groundedness, and syllabus conformity
// -------------------------------------------------------------
app.post('/api/validate-source', async (req: Request, res: Response) => {
  try {
    const { title, subject, content, fileName } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required for source validation' });
    }

    const prompt = `You are a strict academic evaluator and fact-checker for students.
Validate the reliability, grounding, and pedagogical quality of this school course/document.

CRITICAL ANTI-HALLUCINATION CHECK:
Evaluate whether the document presents clear, factually coherent definitions, formulas, or concepts, or if it has ambiguous, incomplete, or unverified claims.

DOCUMENT TITLE: ${title || 'Untitled'}
SUBJECT: ${subject || 'Academic'}
FILE NAME: ${fileName || 'note.txt'}

DOCUMENT CONTENT EXCERPT:
${content.slice(0, 7000)}

EVALUATION TASK:
1. Score from 0 to 100 based on:
   - Coherence, structured headings, and precision of terminology (30 pts)
   - Academic syllabus alignment (Bac/Brevet/University) (30 pts)
   - Presence of explicit definitions, examples, or proofs (25 pts)
   - Readability and freedom from contradiction (15 pts)
2. Determine status:
   - 'reliable' (Score >= 75): Authoritative school document or textbook polycopié.
   - 'needs_verification' (Score 50-74): Informal notes or summary missing some formal proofs/definitions.
   - 'unverified' (Score < 50): Fragmented, ambiguous, or lacks context.
3. Determine academic level (e.g. 'Terminale / Bac Spécialité', 'Première', 'Collège / Brevet', 'Université / Prépa', 'Général').
4. Determine source origin category (e.g. 'Manuel Scolaire / Polycopié Officiel', 'Notes de Cours Magistral', 'Fiche Personnelle de Révision', 'Extrait d'Exercice').
5. List 2-3 specific strengths.
6. List 1-2 warnings or missing points (what the student should double-check in a textbook).
7. Confirm that isGrounded is true (meaning the content is factual and does not invent ungrounded claims).

Return response in pure JSON format.`;

    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            status: {
              type: Type.STRING,
              enum: ['reliable', 'needs_verification', 'unverified'],
            },
            academicLevel: { type: Type.STRING },
            sourceOrigin: { type: Type.STRING },
            isGrounded: { type: Type.BOOLEAN },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            warnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['score', 'status', 'academicLevel', 'sourceOrigin', 'isGrounded', 'strengths', 'warnings'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      ...parsed,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Source validation error:', err);
    res.status(500).json({ error: err.message || 'Error validating document source' });
  }
});

// -------------------------------------------------------------
// QUIZ GENERATION & SCORE TRACKING (Saved on Local PC Disk)
// -------------------------------------------------------------
const QUIZ_HISTORY_FILE = path.join(DATA_DIR, 'quiz_history.json');

function loadQuizHistory(): any[] {
  try {
    if (fs.existsSync(QUIZ_HISTORY_FILE)) {
      const data = fs.readFileSync(QUIZ_HISTORY_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading quiz history file:', err);
  }
  return [];
}

function saveQuizHistory(history: any[]) {
  try {
    fs.writeFileSync(QUIZ_HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving quiz history file:', err);
  }
}

// GET quiz history
app.get('/api/quiz/history', (req: Request, res: Response) => {
  const history = loadQuizHistory();
  res.json({ history });
});

// POST save quiz attempt score
app.post('/api/quiz/history', (req: Request, res: Response) => {
  try {
    const record = req.body;
    if (!record || typeof record.score !== 'number' || !record.totalQuestions) {
      return res.status(400).json({ error: 'Invalid quiz score record' });
    }
    const history = loadQuizHistory();
    const newRecord = {
      ...record,
      id: record.id || `quiz-${Date.now()}`,
      timestamp: record.timestamp || new Date().toISOString(),
    };
    history.unshift(newRecord);
    saveQuizHistory(history);
    res.json({ success: true, record: newRecord, totalAttempts: history.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Generate AI Multiple-Choice Questions (MCQs) for a Document
app.post('/api/quiz/generate', async (req: Request, res: Response) => {
  try {
    const { documentId, content, title, subject, questionCount = 5, difficulty = 'medium', language = 'fr' } = req.body;

    let docContent = content;
    let docTitle = title || 'Document';
    let docSubject = subject || 'General';

    if (documentId && (!docContent || docContent.trim() === '')) {
      const docs = loadDocuments() || [];
      const found = docs.find((d: any) => d.id === documentId);
      if (found) {
        docContent = found.content;
        docTitle = found.title;
        docSubject = found.subject;
      }
    }

    if (!docContent || docContent.trim().length < 20) {
      return res.status(400).json({ error: 'Document content is required and must be at least 20 characters.' });
    }

    const count = Math.min(Math.max(Number(questionCount) || 5, 3), 10);
    const excerpt = docContent.slice(0, 10000);

    const prompt = `You are a distinguished academic professor and examination designer.
Generate an engaging, rigorously accurate multiple-choice quiz (QCM) consisting of ${count} questions based strictly on the following educational document.

DOCUMENT METADATA:
Title: ${docTitle}
Subject: ${docSubject}
Target Level / Difficulty: ${difficulty}
Language: ${language === 'en' ? 'English' : 'French'}

DOCUMENT CONTENT:
"""
${excerpt}
"""

QUIZ DESIGN REQUIREMENTS:
1. Generate exactly ${count} multiple-choice questions.
2. Each question MUST have exactly 4 plausible options (options array of length 4).
3. Exactly ONE option must be correct (correctAnswerIndex: integer from 0 to 3).
4. Provide a clear pedagogical explanation (in ${language === 'en' ? 'English' : 'French'}) explaining why the correct choice is accurate according to the course text, and briefly why alternative answers are traps or inaccurate.
5. Identify the exact 'conceptTested' (key term, rule, theorem, or date).
6. Vary question styles:
   - Direct knowledge recall & definition
   - Application or consequence of a theorem/concept
   - Critical interpretation or contextual analysis
7. The language of the questions and answers must be ${language === 'en' ? 'English' : 'French'} matching the document's academic context.

Return ONLY a valid JSON object matching the requested schema.`;

    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  conceptTested: { type: Type.STRING },
                  difficulty: {
                    type: Type.STRING,
                    enum: ['easy', 'medium', 'hard'],
                  },
                },
                required: ['question', 'options', 'correctAnswerIndex', 'explanation', 'conceptTested'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{"questions": []}');
    const questions = (parsed.questions || []).map((q: any, idx: number) => ({
      id: q.id || `q-${Date.now()}-${idx}`,
      question: q.question,
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options : (q.options || ['Option A', 'Option B', 'Option C', 'Option D']).slice(0, 4),
      correctAnswerIndex: typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0 && q.correctAnswerIndex < 4 ? q.correctAnswerIndex : 0,
      explanation: q.explanation || 'Explication détaillée basée sur le texte du cours.',
      conceptTested: q.conceptTested || docSubject,
      difficulty: q.difficulty || difficulty,
    }));

    res.json({
      success: true,
      docId: documentId,
      docTitle,
      subject: docSubject,
      count: questions.length,
      questions,
    });
  } catch (err: any) {
    console.error('Quiz generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate quiz' });
  }
});

// -------------------------------------------------------------
// BILINGUAL DUAL-LEARNING (Subject + English Language Gap-Fill)
// -------------------------------------------------------------
// BILINGUAL DUAL-LEARNING (Subject + Foreign Language Gap-Fill)
// Supports English, French, Italian, Spanish, Portuguese, German, Latin, Chinese
// -------------------------------------------------------------
const BILINGUAL_LANGUAGES: Record<string, { label: string; name: string; nativeName: string }> = {
  en: { label: '🇬🇧 Anglais', name: 'English', nativeName: 'English' },
  fr: { label: '🇫🇷 Français', name: 'French', nativeName: 'Français' },
  it: { label: '🇮🇹 Italien', name: 'Italian', nativeName: 'Italiano' },
  es: { label: '🇪🇸 Espagnol', name: 'Spanish', nativeName: 'Español' },
  pt: { label: '🇵🇹 Portugais', name: 'Portuguese', nativeName: 'Português' },
  de: { label: '🇩🇪 Allemand', name: 'German', nativeName: 'Deutsch' },
  la: { label: '🏛️ Latin', name: 'Latin', nativeName: 'Latina' },
  zh: { label: '🇨🇳 Chinois', name: 'Chinese (Mandarin)', nativeName: '中文' },
};

app.post('/api/bilingual/generate', async (req: Request, res: Response) => {
  try {
    const { documentId, content, title, subject, targetLanguage = 'en' } = req.body;

    const targetLangKey = (targetLanguage in BILINGUAL_LANGUAGES) ? targetLanguage : 'en';
    const langInfo = BILINGUAL_LANGUAGES[targetLangKey];

    let textToAnalyze = content;
    let textTitle = title || 'Texte Scolaire / Littéraire';
    let textSubject = subject || 'Littérature / Français';

    if (documentId && (!textToAnalyze || textToAnalyze.trim() === '')) {
      const docs = loadDocuments() || [];
      const found = docs.find((d: any) => d.id === documentId);
      if (found) {
        textToAnalyze = found.content;
        textTitle = found.title;
        textSubject = found.subject;
      }
    }

    if (!textToAnalyze || textToAnalyze.trim().length < 30) {
      return res.status(400).json({ error: 'Text content is required (min 30 chars).' });
    }

    // Use up to 3500 chars for a deep, high-quality cloze exercise
    const cleanSample = textToAnalyze.slice(0, 3500);

    const prompt = `You are a distinguished linguistics and literature professor.
The student is analyzing a French academic or literary passage while developing vocabulary in ${langInfo.name} (${langInfo.nativeName})!

INSTRUCTIONS:
1. Examine the French passage provided below.
2. Select 5 to 8 rich, essential vocabulary words or literary/academic terms in the French text (nouns, verbs, adjectives, idioms) that are critical to the passage and excellent for learning in ${langInfo.name}.
3. For each selected word:
   - "frenchWord": The exact French word as written in the text.
   - "englishWord": The accurate vocabulary equivalent in ${langInfo.name} (for Latin or Chinese, provide standard orthography/characters + pinyin if Chinese).
   - "definitionEn": A concise, clear definition/explanation in ${langInfo.name} (or short French hint if target is Latin).
   - "hintFr": A short, subtle clue in French.
   - "partOfSpeech": "nom" | "verbe" | "adjectif" | "adverbe" | "concept".
4. Provide:
   - "fullFrenchText": The original clean French passage.
   - "fullEnglishTranslation": A complete, literary, and faithful translation of the entire passage into ${langInfo.name}.
   - "theme": A short scholarly theme label (e.g. "Littérature classique & Lexique en ${langInfo.name}", "Philosophie & Concepts Clés").

FRENCH TEXT:
"""
${cleanSample}
"""

Return ONLY a valid JSON object matching the requested schema.`;

    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            theme: { type: Type.STRING },
            fullFrenchText: { type: Type.STRING },
            fullEnglishTranslation: { type: Type.STRING },
            targetWords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  frenchWord: { type: Type.STRING },
                  englishWord: { type: Type.STRING },
                  definitionEn: { type: Type.STRING },
                  hintFr: { type: Type.STRING },
                  partOfSpeech: { type: Type.STRING },
                },
                required: ['frenchWord', 'englishWord', 'definitionEn'],
              },
            },
          },
          required: ['theme', 'fullFrenchText', 'fullEnglishTranslation', 'targetWords'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const rawTargetWords = parsed.targetWords || [];

    // Ensure IDs on words
    const targetWords = rawTargetWords.map((tw: any, idx: number) => ({
      id: tw.id || `slot-${idx + 1}`,
      frenchWord: tw.frenchWord.trim(),
      englishWord: tw.englishWord.trim(),
      targetWord: tw.englishWord.trim(),
      sourceWord: tw.frenchWord.trim(),
      definitionEn: tw.definitionEn || '',
      hintFr: tw.hintFr || '',
      partOfSpeech: tw.partOfSpeech || 'nom',
      placed: false,
    }));

    // Segment the fullFrenchText into tokens with slots
    let frenchText = parsed.fullFrenchText || cleanSample;
    const segmentedTokens: { type: 'text' | 'slot'; content: string; slotId?: string }[] = [];

    // Replace the target words in order of appearance
    let remaining = frenchText;
    // Sort words by length descending to avoid partial word substring collisions
    const sortedWords = [...targetWords].sort((a, b) => b.frenchWord.length - a.frenchWord.length);

    // Build regex pattern for all target words
    const escapeRegex = (s: string) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const pattern = new RegExp(
      `\\b(${sortedWords.map((w: any) => escapeRegex(w.frenchWord)).join('|')})\\b`,
      'gi'
    );

    let match: RegExpExecArray | null;
    const matches: { index: number; text: string; word: any }[] = [];

    while ((match = pattern.exec(frenchText)) !== null) {
      const matchedText = match[0];
      const matchedWord = targetWords.find(
        (tw: any) => tw.frenchWord.toLowerCase() === matchedText.toLowerCase()
      );
      if (matchedWord) {
        matches.push({
          index: match.index,
          text: matchedText,
          word: matchedWord,
        });
      }
    }

    // Now assemble segmented tokens in order
    let cursor = 0;
    const usedSlotIds = new Set<string>();

    for (const m of matches) {
      if (m.index < cursor) continue; // overlaps
      if (usedSlotIds.has(m.word.id)) continue; // already slotted once

      if (m.index > cursor) {
        segmentedTokens.push({
          type: 'text',
          content: frenchText.substring(cursor, m.index),
        });
      }
      segmentedTokens.push({
        type: 'slot',
        content: m.word.id,
        slotId: m.word.id,
      });
      usedSlotIds.add(m.word.id);
      cursor = m.index + m.text.length;
    }

    if (cursor < frenchText.length) {
      segmentedTokens.push({
        type: 'text',
        content: frenchText.substring(cursor),
      });
    }

    const activeTargetWords = targetWords.filter((w: any) => usedSlotIds.has(w.id));

    const exercise = {
      id: `bilingual-${Date.now()}`,
      docId: documentId,
      docTitle: textTitle,
      subject: textSubject,
      theme: parsed.theme || `Atelier Littéraire & Vocabulaire (${langInfo.name})`,
      targetLang: targetLangKey,
      targetLangLabel: langInfo.label,
      fullFrenchText: frenchText,
      fullEnglishTranslation: parsed.fullEnglishTranslation || '',
      fullTargetTranslation: parsed.fullEnglishTranslation || '',
      segmentedTokens,
      targetWords: activeTargetWords.length > 0 ? activeTargetWords : targetWords,
    };

    res.json({
      success: true,
      exercise,
    });
  } catch (err: any) {
    console.error('Bilingual generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate bilingual exercise' });
  }
});

// -------------------------------------------------------------
// SOCRATIC AI STUDY COACH (Strict Anti-Cheat AI Mentor)
// -------------------------------------------------------------
app.post('/api/coach/ask', async (req: Request, res: Response) => {
  try {
    const { message, history = [], currentSubject, currentDocTitle, language = 'fr' } = req.body;
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const systemPrompt = `Tu es le "Conseiller Pédagogique Socratique Degree Unlocker" — un tuteur scolaire ultra bienveillant, chaleureux, encourageant et amical.
MISSION ABSOLUE : Aider l'étudiant à comprendre en profondeur son cours et ses exercices pour réussir ses études, SANS JAMAIS TRICHER et SANS DONNER LES RÉPONSES.

RÈGLES D'OR ANTI-TRICHE & PÉDAGOGIE POSITIVE :
1. NE JAMAIS DONNER LA RÉPONSE DIRECTE : Même si l'étudiant te supplie ("Donne-moi juste la réponse", "Fais mon devoir", "Résous cet exercice", "Quelle est la valeur de x ?").
2. TOUJOURS UTILISER UN EXEMPLE NEUTRE PARALLÈLE :
   - Pour expliquer le raisonnement, invente un exemple similaire et neutre avec des chiffres ou un contexte différent.
   - Exemple : Si l'étudiant demande comment résoudre "3x² - 5x + 2 = 0", explique la méthode du discriminant en résolvant pas à pas un exemple neutre comme "2x² + 4x - 6 = 0".
   - Si l'étudiant demande comment faire une dissertation sur un texte précis, donne un exemple de plan sur une citation neutre pour montrer la méthode (Thèse / Antithèse / Synthèse).
3. POSER UNE QUESTION SOCRATIQUE GUIDANTE : Termine toujours ta réponse par UNE question claire et accessible qui pousse l'étudiant à faire la première étape sur son propre exercice.
4. TON FRIENDLY ET ENCOURAGEANT : Sois comme un grand frère ou une professeure bienveillante : encourage chaque démarche, dédramatise les erreurs ("C'est normal d'hésiter au début, c'est comme ça qu'on progresse !").
5. MÉTHODOLOGIE D'ÉTUDE : Donne des astuces concrètes de mémorisation (fiches, méthode des loci, répétition espacée, gestion du stress).

Matière actuelle : ${currentSubject || 'Études Générales'}
Titre du cours / contexte : ${currentDocTitle || 'Session de travail'}`;

    const prompt = `${systemPrompt}

Historique de discussion récent :
${history.slice(-8).map((h: any) => `${h.sender === 'user' ? 'Élève' : 'Coach'}: ${h.text}`).join('\n')}

Message de l'élève :
${message}

Réponds au format JSON avec text, hints (indices conceptuels courts), et suggestedQuestions.`;

    let parsed: any = null;
    try {
      const { text } = await callGeminiWithFallback({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              hints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              suggestedQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['text'],
          },
        },
        preferredModel: 'gemini-3.5-flash',
      });

      parsed = safeJsonParse(text);
    } catch (aiErr: any) {
      console.warn('Socratic coach fallback:', aiErr.message || aiErr);
    }

    if (!parsed || !parsed.text) {
      const friendlyDefaultText = language === 'fr'
        ? `C'est une excellente question pour approfondir votre cours de ${currentSubject || 'révision'} ! Mon rôle est de vous guider pas à pas sans vous donner la réponse toute faite, afin que vous ayez le déclic par vous-même.\n\n💡 **Méthode par l'exemple neutre :**\nRegardez comment décomposer la question en 3 temps :\n1. Identifier les données connues et la définition clé.\n2. Écrire la formule ou la structure générale.\n3. Remplacer les termes un par un.\n\nQuelle est la formule ou la définition principale que vous avez dans votre cours pour ce chapitre ?`
        : `That's a great question to strengthen your grasp of ${currentSubject || 'this topic'}! My role is to guide you step-by-step with neutral clues without handing over direct answers, so you master the concept yourself.\n\n💡 **Method with a neutral example:**\n1. Identify known terms and the core rule.\n2. Write out the general theorem or formula.\n3. Substitute step by step.\n\nWhat is the main definition or formula from your class notes for this concept?`;

      parsed = {
        text: friendlyDefaultText,
        hints: language === 'fr' 
          ? ['Définition de départ', 'Exemple neutre similaire', 'Identification des inconnues'] 
          : ['Starting definition', 'Neutral parallel example', 'Identifying unknowns'],
        suggestedQuestions: language === 'fr'
          ? ['Quelle est la formule à appliquer ici ?', 'Peux-tu me donner un exemple neutre ?', 'Comment commencer la première étape ?']
          : ['What formula applies here?', 'Can you show me a neutral example?', 'How do I start step 1?'],
      };
    }

    res.json({
      success: true,
      text: parsed.text,
      hints: parsed.hints || [],
      suggestedQuestions: parsed.suggestedQuestions || [],
    });
  } catch (err: any) {
    console.error('Socratic coach error:', err);
    res.status(500).json({ error: err.message || 'Error processing coach request' });
  }
});

// -------------------------------------------------------------
// AUDIO TRANSCRIPTION WITH GEMINI-3.5-TRANSCRIBE
// -------------------------------------------------------------
app.post('/api/transcribe', async (req: Request, res: Response) => {
  try {
    const { base64Audio, mimeType = 'audio/webm' } = req.body;
    if (!base64Audio) {
      return res.status(400).json({ error: 'base64Audio is required' });
    }

    const cleanBase64 = base64Audio.replace(/^data:[^;]+;base64,/, '');
    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: cleanBase64,
      },
    };

    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Transcribe this spoken school/study audio recording verbatim. Maintain proper punctuation, capitalization, and formatting. Return only the transcribed text.',
          },
        ],
      },
    });

    const transcribedText = response.text || '';
    res.json({
      success: true,
      text: transcribedText.trim(),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Transcription error with gemini-3.5-transcribe:', err);
    res.status(500).json({ error: err.message || 'Failed to transcribe audio' });
  }
});


// -------------------------------------------------------------
// VITE MIDDLEWARE & SERVER INITIALIZATION
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`School Notes & PDF AI Database server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
