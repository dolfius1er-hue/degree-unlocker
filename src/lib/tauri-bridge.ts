/**
 * DegreeUnlocker Desktop Bridge (Tauri API Integration)
 * 
 * Provides unified native desktop integration with:
 * - '@tauri-apps/api/window': Window management & frameless header dragging
 * - '@tauri-apps/api/dialog': Native file system dialogs (open, save, message, confirm)
 * - '@tauri-apps/api/path': System directories resolution (Documents, Desktop, Downloads, AppData)
 * - '@tauri-apps/api/fs': Local file system reading & writing for multi-format document ingestion
 * - '@tauri-apps/api/notification': Native OS notifications
 * - '@tauri-apps/api/shell': External browser link opening
 * 
 * Falls back gracefully in web preview or browser environment.
 */

import type React from 'react';
import { appWindow, WebviewWindow } from '@tauri-apps/api/window';
export { appWindow, WebviewWindow };
import { 
  open as openDialog, 
  save as saveDialog, 
  message as messageDialog, 
  confirm as confirmDialog, 
  ask as askDialog,
  DialogFilter,
  OpenDialogOptions,
  SaveDialogOptions,
  MessageDialogOptions,
  ConfirmDialogOptions
} from '@tauri-apps/api/dialog';
import { 
  appDir, 
  appDataDir, 
  desktopDir, 
  documentDir, 
  downloadDir, 
  homeDir, 
  join, 
  resolve 
} from '@tauri-apps/api/path';
import { 
  readTextFile, 
  readBinaryFile, 
  writeTextFile, 
  writeBinaryFile, 
  exists 
} from '@tauri-apps/api/fs';
import { 
  isPermissionGranted, 
  requestPermission, 
  sendNotification 
} from '@tauri-apps/api/notification';
import { open as openShell } from '@tauri-apps/api/shell';

// Standard academic document extensions supported by DegreeUnlocker
export const ACADEMIC_DOC_FILTERS: DialogFilter[] = [
  {
    name: 'Documents Universitaires & Notes',
    extensions: ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'txt', 'md', 'json']
  },
  {
    name: 'Fichiers PDF (*.pdf)',
    extensions: ['pdf']
  },
  {
    name: 'Fichiers Word (*.docx, *.doc)',
    extensions: ['docx', 'doc']
  },
  {
    name: 'Tableurs Excel (*.xlsx, *.xls, *.csv)',
    extensions: ['xlsx', 'xls', 'csv']
  },
  {
    name: 'Textes & Markdown (*.txt, *.md)',
    extensions: ['txt', 'md']
  },
  {
    name: 'Tous les fichiers (*.*)',
    extensions: ['*']
  }
];

export interface IngestedDesktopDocument {
  name: string;
  path: string;
  extension: string;
  size?: number;
  textContent?: string;
  binaryBuffer?: Uint8Array;
  mimeType: string;
}

/**
 * Detects if DegreeUnlocker is currently running inside the Tauri native desktop container
 */
export const isTauri = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    '__TAURI__' in window ||
    '__TAURI_IPC__' in window ||
    '__TAURI_METADATA__' in window
  );
};

export const isTauriDesktop = isTauri;

// ============================================================================
// WINDOW APIS (@tauri-apps/api/window)
// ============================================================================

/**
 * Initiates native desktop window dragging.
 * Call this inside onMouseDown of your titlebar or header component.
 * Elements with data-tauri-drag-region also drag automatically in Tauri.
 */
export const startDragging = async (): Promise<boolean> => {
  if (!isTauri()) return false;
  try {
    await appWindow.startDragging();
    return true;
  } catch (err) {
    console.warn('[TauriBridge] startDragging error:', err);
    return false;
  }
};

/**
 * Convenient React mouse event handler for titlebar / header dragging.
 * Ignores clicks originating on interactive elements (buttons, inputs, links).
 */
export const handleHeaderMouseDown = (event: React.MouseEvent<HTMLElement>): void => {
  if (!isTauri()) return;
  // Do not drag if clicking on interactive controls
  const target = event.target as HTMLElement | null;
  if (!target) return;
  const isInteractive = target.closest('button, a, input, select, textarea, [role="button"], [data-no-drag]');
  if (isInteractive) return;

  if (event.button === 0) { // Primary left mouse button
    startDragging();
  }
};

/**
 * Binds header dragging to a DOM element
 */
export const bindHeaderDrag = (element: HTMLElement | null): (() => void) => {
  if (!element || !isTauri()) return () => {};

  const onMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    if (target.closest('button, a, input, select, textarea, [role="button"], [data-no-drag]')) {
      return;
    }
    if (e.button === 0) {
      startDragging();
    }
  };

  element.addEventListener('mousedown', onMouseDown);
  return () => {
    element.removeEventListener('mousedown', onMouseDown);
  };
};

/**
 * Minimize desktop window
 */
export const minimizeWindow = async (): Promise<boolean> => {
  if (!isTauri()) {
    console.info('[TauriBridge] Minimize simulated in web mode');
    return false;
  }
  try {
    await appWindow.minimize();
    return true;
  } catch (err) {
    console.warn('[TauriBridge] minimize error:', err);
    return false;
  }
};

/**
 * Maximize desktop window
 */
export const maximizeWindow = async (): Promise<boolean> => {
  if (!isTauri()) return false;
  try {
    await appWindow.maximize();
    return true;
  } catch (err) {
    console.warn('[TauriBridge] maximize error:', err);
    return false;
  }
};

/**
 * Unmaximize / restore desktop window
 */
export const unmaximizeWindow = async (): Promise<boolean> => {
  if (!isTauri()) return false;
  try {
    await appWindow.unmaximize();
    return true;
  } catch (err) {
    console.warn('[TauriBridge] unmaximize error:', err);
    return false;
  }
};

/**
 * Toggle maximize / restore desktop window
 */
export const toggleMaximizeWindow = async (): Promise<boolean> => {
  if (!isTauri()) return false;
  try {
    await appWindow.toggleMaximize();
    return true;
  } catch (err) {
    console.warn('[TauriBridge] toggleMaximize error:', err);
    return false;
  }
};

/**
 * Check if the window is currently maximized
 */
export const isWindowMaximized = async (): Promise<boolean> => {
  if (!isTauri()) return false;
  try {
    return await appWindow.isMaximized();
  } catch (err) {
    console.warn('[TauriBridge] isMaximized error:', err);
    return false;
  }
};

/**
 * Close desktop window
 */
export const closeWindow = async (): Promise<boolean> => {
  if (!isTauri()) return false;
  try {
    await appWindow.close();
    return true;
  } catch (err) {
    console.warn('[TauriBridge] close error:', err);
    return false;
  }
};

/**
 * Set full screen state
 */
export const setFullscreen = async (fullscreen: boolean): Promise<boolean> => {
  if (!isTauri()) {
    try {
      if (fullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else if (!fullscreen && document.fullscreenElement) {
        await document.exitFullscreen();
      }
      return true;
    } catch {
      return false;
    }
  }
  try {
    await appWindow.setFullscreen(fullscreen);
    return true;
  } catch (err) {
    console.warn('[TauriBridge] setFullscreen error:', err);
    return false;
  }
};

/**
 * Set window title
 */
export const setWindowTitle = async (title: string): Promise<boolean> => {
  if (!isTauri()) {
    document.title = title;
    return true;
  }
  try {
    await appWindow.setTitle(title);
    return true;
  } catch (err) {
    console.warn('[TauriBridge] setTitle error:', err);
    return false;
  }
};

/**
 * Show window
 */
export const showWindow = async (): Promise<boolean> => {
  if (!isTauri()) return false;
  try {
    await appWindow.show();
    await appWindow.setFocus();
    return true;
  } catch (err) {
    console.warn('[TauriBridge] show error:', err);
    return false;
  }
};

/**
 * Listen for native desktop file drop onto the window
 */
export const onFileDrop = async (
  callback: (filePaths: string[]) => void
): Promise<(() => void) | null> => {
  if (!isTauri()) return null;
  try {
    const unlisten = await appWindow.onFileDropEvent((event) => {
      if (event.payload.type === 'drop') {
        callback(event.payload.paths);
      }
    });
    return unlisten;
  } catch (err) {
    console.warn('[TauriBridge] onFileDropEvent error:', err);
    return null;
  }
};

// ============================================================================
// DIALOG APIS (@tauri-apps/api/dialog)
// ============================================================================

export interface NativeFileDialogOptions {
  title?: string;
  defaultPath?: string;
  multiple?: boolean;
  directory?: boolean;
  filters?: DialogFilter[];
}

/**
 * Native file open dialog for multi-format document ingestion
 * Supports PDF, DOCX, Excel XLSX, TXT, Markdown, etc.
 */
export const openNativeFileDialog = async (
  options?: NativeFileDialogOptions
): Promise<string | string[] | null> => {
  if (!isTauri()) {
    // Graceful web fallback using hidden input element
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = options?.multiple ?? false;
      const exts = options?.filters?.flatMap(f => f.extensions).filter(e => e !== '*') || [];
      if (exts.length > 0) {
        input.accept = exts.map(e => `.${e}`).join(',');
      }
      input.onchange = () => {
        if (input.files && input.files.length > 0) {
          const names = Array.from(input.files).map(f => f.name);
          resolve(options?.multiple ? names : names[0]);
        } else {
          resolve(null);
        }
      };
      input.click();
    });
  }

  try {
    const selected = await openDialog({
      title: options?.title || 'Sélectionner un document pour DegreeUnlocker',
      defaultPath: options?.defaultPath,
      multiple: options?.multiple ?? false,
      directory: options?.directory ?? false,
      filters: options?.filters || ACADEMIC_DOC_FILTERS
    });
    return selected;
  } catch (err) {
    console.warn('[TauriBridge] openDialog error:', err);
    return null;
  }
};

/**
 * Native save dialog for exporting PDF slides, backups, or study notes
 */
export const saveNativeFileDialog = async (
  options?: {
    title?: string;
    defaultPath?: string;
    filters?: DialogFilter[];
  }
): Promise<string | null> => {
  if (!isTauri()) return null;
  try {
    return await saveDialog({
      title: options?.title || 'Enregistrer le document',
      defaultPath: options?.defaultPath,
      filters: options?.filters || [
        { name: 'Document PDF (*.pdf)', extensions: ['pdf'] },
        { name: 'Sauvegarde JSON (*.json)', extensions: ['json'] },
        { name: 'Texte Markdown (*.md)', extensions: ['md'] }
      ]
    });
  } catch (err) {
    console.warn('[TauriBridge] saveDialog error:', err);
    return null;
  }
};

/**
 * Native message dialog (alert)
 */
export const showNativeMessage = async (
  message: string,
  options?: { title?: string; type?: 'info' | 'warning' | 'error' }
): Promise<void> => {
  if (!isTauri()) {
    console.log(`[Desktop Dialog] ${options?.title || 'Info'}: ${message}`);
    return;
  }
  try {
    await messageDialog(message, {
      title: options?.title || 'DegreeUnlocker',
      type: options?.type || 'info'
    });
  } catch (err) {
    console.warn('[TauriBridge] messageDialog error:', err);
  }
};

/**
 * Native confirmation dialog (Yes / No or OK / Cancel)
 */
export const showNativeConfirm = async (
  message: string,
  options?: { title?: string; type?: 'info' | 'warning' | 'error' }
): Promise<boolean> => {
  if (!isTauri()) {
    return window.confirm(message);
  }
  try {
    return await confirmDialog(message, {
      title: options?.title || 'DegreeUnlocker Confirmation',
      type: options?.type || 'warning'
    });
  } catch (err) {
    console.warn('[TauriBridge] confirmDialog error:', err);
    return false;
  }
};

// ============================================================================
// PATH APIS (@tauri-apps/api/path)
// ============================================================================

export const getDocumentsDir = async (): Promise<string | null> => {
  if (!isTauri()) return null;
  try {
    return await documentDir();
  } catch (err) {
    console.warn('[TauriBridge] documentDir error:', err);
    return null;
  }
};

export const getDesktopDir = async (): Promise<string | null> => {
  if (!isTauri()) return null;
  try {
    return await desktopDir();
  } catch (err) {
    console.warn('[TauriBridge] desktopDir error:', err);
    return null;
  }
};

export const getDownloadDir = async (): Promise<string | null> => {
  if (!isTauri()) return null;
  try {
    return await downloadDir();
  } catch (err) {
    console.warn('[TauriBridge] downloadDir error:', err);
    return null;
  }
};

export const getAppDataDir = async (): Promise<string | null> => {
  if (!isTauri()) return null;
  try {
    return await appDataDir();
  } catch (err) {
    console.warn('[TauriBridge] appDataDir error:', err);
    return null;
  }
};

export const joinPaths = async (...paths: string[]): Promise<string> => {
  if (!isTauri()) {
    return paths.join('/').replace(/\/+/g, '/');
  }
  try {
    return await join(...paths);
  } catch (err) {
    console.warn('[TauriBridge] join path error:', err);
    return paths.join('/');
  }
};

// ============================================================================
// FILE SYSTEM APIS (@tauri-apps/api/fs)
// ============================================================================

/**
 * Reads local text file content
 */
export const readNativeText = async (filePath: string): Promise<string | null> => {
  if (!isTauri()) return null;
  try {
    return await readTextFile(filePath);
  } catch (err) {
    console.warn('[TauriBridge] readTextFile error:', err);
    return null;
  }
};

/**
 * Reads local binary file buffer (e.g. PDF, Word .docx, Excel .xlsx)
 */
export const readNativeBinary = async (filePath: string): Promise<Uint8Array | null> => {
  if (!isTauri()) return null;
  try {
    const raw = await readBinaryFile(filePath);
    return new Uint8Array(raw);
  } catch (err) {
    console.warn('[TauriBridge] readBinaryFile error:', err);
    return null;
  }
};

/**
 * Writes text content to local file
 */
export const writeNativeText = async (filePath: string, contents: string): Promise<boolean> => {
  if (!isTauri()) return false;
  try {
    await writeTextFile(filePath, contents);
    return true;
  } catch (err) {
    console.warn('[TauriBridge] writeTextFile error:', err);
    return false;
  }
};

/**
 * Check if a file or directory exists
 */
export const checkNativeFileExists = async (filePath: string): Promise<boolean> => {
  if (!isTauri()) return false;
  try {
    return await exists(filePath);
  } catch (err) {
    console.warn('[TauriBridge] exists error:', err);
    return false;
  }
};

// ============================================================================
// HIGH-LEVEL DOCUMENT INGESTION HELPER
// ============================================================================

function extractFileName(filePath: string): { name: string; extension: string } {
  const cleanPath = filePath.replace(/\\/g, '/');
  const fullFileName = cleanPath.split('/').pop() || filePath;
  const dotIndex = fullFileName.lastIndexOf('.');
  if (dotIndex > 0) {
    return {
      name: fullFileName.substring(0, dotIndex),
      extension: fullFileName.substring(dotIndex + 1).toLowerCase()
    };
  }
  return { name: fullFileName, extension: '' };
}

function resolveMimeType(extension: string): string {
  switch (extension) {
    case 'pdf': return 'application/pdf';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'doc': return 'application/msword';
    case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'xls': return 'application/vnd.ms-excel';
    case 'csv': return 'text/csv';
    case 'txt': return 'text/plain';
    case 'md': return 'text/markdown';
    case 'json': return 'application/json';
    default: return 'application/octet-stream';
  }
}

/**
 * Opens native file dialog and reads document contents ready for ingestion into DegreeUnlocker
 */
export const pickAndIngestDesktopDocument = async (
  options?: NativeFileDialogOptions
): Promise<IngestedDesktopDocument[] | null> => {
  const selected = await openNativeFileDialog({
    title: options?.title || 'Importer un document de cours',
    multiple: options?.multiple ?? false,
    filters: options?.filters || ACADEMIC_DOC_FILTERS
  });

  if (!selected) return null;

  const filePaths: string[] = Array.isArray(selected) ? selected : [selected];
  const ingestedList: IngestedDesktopDocument[] = [];

  for (const path of filePaths) {
    const { name, extension } = extractFileName(path);
    const mimeType = resolveMimeType(extension);

    // Read based on type
    if (['txt', 'md', 'json', 'csv'].includes(extension)) {
      const textContent = await readNativeText(path);
      ingestedList.push({
        name,
        path,
        extension,
        textContent: textContent || '',
        mimeType
      });
    } else {
      // Binary files (PDF, DOCX, XLSX, etc.)
      const binaryBuffer = await readNativeBinary(path);
      ingestedList.push({
        name,
        path,
        extension,
        binaryBuffer: binaryBuffer || undefined,
        size: binaryBuffer?.byteLength,
        mimeType
      });
    }
  }

  return ingestedList.length > 0 ? ingestedList : null;
};

// ============================================================================
// NOTIFICATION & SHELL APIS
// ============================================================================

/**
 * Send native OS desktop notification
 */
export const sendDesktopNotification = async (title: string, body: string): Promise<boolean> => {
  if (!isTauri()) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon-192.png' });
      return true;
    }
    return false;
  }
  try {
    let hasPermission = await isPermissionGranted();
    if (!hasPermission) {
      const permission = await requestPermission();
      hasPermission = permission === 'granted';
    }
    if (hasPermission) {
      sendNotification({ title, body, icon: 'icon' });
      return true;
    }
    return false;
  } catch (err) {
    console.warn('[TauriBridge] notification error:', err);
    return false;
  }
};

/**
 * Open external URL in system's default web browser
 */
export const openExternalUrl = async (url: string): Promise<boolean> => {
  if (!isTauri()) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  }
  try {
    await openShell(url);
    return true;
  } catch (err) {
    console.warn('[TauriBridge] openShell error:', err);
    window.open(url, '_blank', 'noopener,noreferrer');
    return false;
  }
};

// ============================================================================
// UNIFIED TAURI BRIDGE SERVICE
// ============================================================================

export const tauriBridge = {
  isTauri,
  isTauriDesktop,
  // Window controls & header drag
  appWindow,
  startDragging,
  handleHeaderMouseDown,
  bindHeaderDrag,
  minimizeWindow,
  maximizeWindow,
  unmaximizeWindow,
  toggleMaximizeWindow,
  isWindowMaximized,
  closeWindow,
  setFullscreen,
  setWindowTitle,
  showWindow,
  onFileDrop,
  // Dialogs
  openNativeFileDialog,
  saveNativeFileDialog,
  showNativeMessage,
  showNativeConfirm,
  // Paths
  getDocumentsDir,
  getDesktopDir,
  getDownloadDir,
  getAppDataDir,
  joinPaths,
  // File System
  readNativeText,
  readNativeBinary,
  writeNativeText,
  checkNativeFileExists,
  // Ingestion
  pickAndIngestDesktopDocument,
  ACADEMIC_DOC_FILTERS,
  // Notifications & Shell
  sendDesktopNotification,
  openExternalUrl
};

export default tauriBridge;
