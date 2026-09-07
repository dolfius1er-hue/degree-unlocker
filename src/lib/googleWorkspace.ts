import { getCachedAccessToken, loginWithGoogle } from './firebase';
import { SchoolDocument } from '../types';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
}

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  updated?: string;
}

export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
}

/**
 * Ensures an OAuth access token is available, or requests sign-in.
 */
async function ensureToken(): Promise<string> {
  let token = getCachedAccessToken();
  if (!token) {
    const res = await loginWithGoogle();
    token = res.accessToken;
  }
  if (!token) {
    throw new Error('No access token available. Please sign in with Google.');
  }
  return token;
}

// -------------------------------------------------------------
// GOOGLE DRIVE API
// -------------------------------------------------------------

export type DriveSupportedFilter = 'all' | 'docs' | 'pdfs';

/**
 * List files from user's Google Drive (focusing on documents, PDFs and school materials)
 */
export async function listDriveFiles(
  query?: string,
  filterType: DriveSupportedFilter = 'all'
): Promise<GoogleDriveFile[]> {
  const token = await ensureToken();
  const qParts = ['trashed = false'];

  if (query && query.trim()) {
    qParts.push(`name contains '${query.replace(/'/g, "\\'")}'`);
  }

  // Filter for supported document mimeTypes
  if (filterType === 'docs') {
    qParts.push(`mimeType = 'application/vnd.google-apps.document'`);
  } else if (filterType === 'pdfs') {
    qParts.push(`mimeType = 'application/pdf'`);
  } else {
    // all supported types
    qParts.push(
      `(mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/pdf' or mimeType = 'text/plain' or mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')`
    );
  }

  const q = encodeURIComponent(qParts.join(' and '));
  
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&pageSize=40&fields=files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink)&orderBy=modifiedTime desc`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Google Drive error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Export a course note or flashcard summary into a new Google Doc
 */
export async function createGoogleDocFromCourse(
  title: string,
  content: string
): Promise<{ documentId: string; title: string }> {
  const token = await ensureToken();

  // 1. Create blank document
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: title || 'Nouveau Cours Degree Unlocker' }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to create Google Doc: ${createRes.statusText}`);
  }

  const docData = await createRes.json();
  const documentId = docData.documentId;

  // 2. Insert content into the created document
  if (content && content.trim()) {
    const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: `${title}\n\n${content}\n\n---\nExporté automatiquement depuis Degree Unlocker\n`,
            },
          },
        ],
      }),
    });

    if (!updateRes.ok) {
      console.warn('Failed to populate doc content, blank document created.');
    }
  }

  return { documentId, title: docData.title };
}

/**
 * Read text content from a Google Doc with structural traversal and export fallback
 */
export async function readGoogleDoc(documentId: string): Promise<string> {
  const token = await ensureToken();
  try {
    const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const doc = await res.json();
      let fullText = '';

      if (doc.body?.content) {
        for (const elem of doc.body.content) {
          if (elem.paragraph?.elements) {
            for (const pElem of elem.paragraph.elements) {
              if (pElem.textRun?.content) {
                fullText += pElem.textRun.content;
              }
            }
          } else if (elem.table?.tableRows) {
            for (const row of elem.table.tableRows) {
              for (const cell of row.tableCells || []) {
                for (const cellContent of cell.content || []) {
                  if (cellContent.paragraph?.elements) {
                    for (const pElem of cellContent.paragraph.elements) {
                      if (pElem.textRun?.content) {
                        fullText += pElem.textRun.content;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (fullText && fullText.trim()) {
        return fullText.trim();
      }
    }
  } catch (err) {
    console.warn('Google Docs API read attempt failed, falling back to Drive export:', err);
  }

  // Fallback: Use Drive v3 export to plain text
  const exportRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${documentId}/export?mimeType=text/plain`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!exportRes.ok) {
    const err = await exportRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Impossible d'extraire le contenu du Google Doc (${exportRes.statusText})`);
  }

  return await exportRes.text();
}

/**
 * Download a PDF from Google Drive as a Base64 data URL
 */
export async function downloadDrivePdfDataUrl(fileId: string): Promise<string> {
  const token = await ensureToken();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Échec du téléchargement du PDF Drive (${res.statusText})`);
  }

  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert PDF blob to data URL'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Download text or plain document content from Drive
 */
export async function downloadDriveTextContent(fileId: string, mimeType: string): Promise<string> {
  const token = await ensureToken();
  
  if (mimeType === 'application/vnd.google-apps.document') {
    return await readGoogleDoc(fileId);
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Échec du téléchargement du fichier (${res.statusText})`);
  }

  return await res.text();
}

/**
 * Ingest a Google Drive file into a fully-populated SchoolDocument
 */
export async function ingestDriveFile(file: GoogleDriveFile): Promise<Partial<SchoolDocument>> {
  const isDoc = file.mimeType === 'application/vnd.google-apps.document';
  const isPdf = file.mimeType === 'application/pdf';

  let content = '';
  let pdfDataUrl: string | undefined;

  if (isDoc) {
    content = await readGoogleDoc(file.id);
  } else if (isPdf) {
    pdfDataUrl = await downloadDrivePdfDataUrl(file.id);
    content = `[Document PDF Importé depuis Google Drive: ${file.name}]\nPrêt pour la révision, l'annotation et la génération de fiches de révision.`;
  } else {
    content = await downloadDriveTextContent(file.id, file.mimeType);
  }

  // Generate a clean summary preview from first lines or content
  const previewLines = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'))
    .slice(0, 3)
    .join(' ');
  const summary = previewLines.length > 0 ? previewLines.slice(0, 280) + '...' : `Document ${file.name} importé depuis Google Drive.`;

  // Determine subject guess from title or default to Drive
  const lowerName = file.name.toLowerCase();
  let subject = 'Général';
  if (lowerName.includes('math') || lowerName.includes('algebr') || lowerName.includes('geometr')) subject = 'Mathématiques';
  else if (lowerName.includes('phys') || lowerName.includes('chim') || lowerName.includes('sci')) subject = 'Physique-Chimie';
  else if (lowerName.includes('hist') || lowerName.includes('geo')) subject = 'Histoire-Géo';
  else if (lowerName.includes('bio') || lowerName.includes('svt')) subject = 'SVT / Biologie';
  else if (lowerName.includes('philo')) subject = 'Philosophie';
  else if (lowerName.includes('anglais') || lowerName.includes('eng')) subject = 'Anglais';
  else if (lowerName.includes('franc') || lowerName.includes('litt')) subject = 'Français';
  else if (isDoc) subject = 'Google Docs';
  else if (isPdf) subject = 'Google Drive PDF';

  const cleanTitle = file.name.replace(/\.[^/.]+$/, '');

  return {
    id: `doc-${Date.now()}`,
    title: cleanTitle,
    subject,
    date: new Date().toISOString().split('T')[0],
    type: isDoc ? 'google_doc' : isPdf ? 'pdf' : 'typed_note',
    tags: ['Google Drive', isDoc ? 'Google Docs' : isPdf ? 'PDF' : 'Note', 'Workspace'],
    content,
    summary,
    fileName: file.name,
    fileSize: file.size ? parseInt(file.size, 10) : undefined,
    pdfDataUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// GOOGLE TASKS API
// -------------------------------------------------------------

/**
 * Get user's Google Task Lists
 */
export async function getGoogleTaskLists(): Promise<GoogleTaskList[]> {
  const token = await ensureToken();
  const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to fetch Task lists: ${res.statusText}`);
  }

  const data = await res.json();
  return data.items || [];
}

/**
 * List tasks from a specific list
 */
export async function getGoogleTasks(taskListId = '@default'): Promise<GoogleTask[]> {
  const token = await ensureToken();
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?showCompleted=true&maxResults=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to fetch Tasks: ${res.statusText}`);
  }

  const data = await res.json();
  return data.items || [];
}

/**
 * Create a revision task in Google Tasks
 */
export async function createGoogleTask(
  title: string,
  notes?: string,
  dueDate?: string,
  taskListId = '@default'
): Promise<GoogleTask> {
  const token = await ensureToken();
  const payload: any = {
    title,
    notes: notes || 'Tâche d\'étude créée depuis Degree Unlocker',
  };

  if (dueDate) {
    // RFC 3339 timestamp
    payload.due = new Date(dueDate).toISOString();
  }

  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to create Task: ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Mark a task as completed / update task
 */
export async function toggleGoogleTaskStatus(
  taskId: string,
  isCompleted: boolean,
  taskListId = '@default'
): Promise<GoogleTask> {
  const token = await ensureToken();
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: isCompleted ? 'completed' : 'needsAction',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to update Task: ${res.statusText}`);
  }

  return await res.json();
}
