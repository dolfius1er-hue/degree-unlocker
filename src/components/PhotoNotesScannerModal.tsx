import React, { useState, useRef, useEffect } from 'react';
import { AppLanguage, SchoolDocument } from '../types';
import { sendSingleDocumentToCloud } from '../lib/firebase';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  X, 
  Loader2, 
  CheckCircle2, 
  FileText, 
  Copy, 
  Download, 
  RefreshCw, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Monitor,
  Send,
  LogIn
} from 'lucide-react';

interface PhotoNotesScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentCreated: (newDoc: SchoolDocument) => void;
  currentUser?: any;
  onOpenAuthModal?: () => void;
  lang: AppLanguage;
}

export const PhotoNotesScannerModal: React.FC<PhotoNotesScannerModalProps> = ({
  isOpen,
  onClose,
  onDocumentCreated,
  currentUser,
  onOpenAuthModal,
  lang = 'fr',
}) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [subjectHint, setSubjectHint] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedDocument, setScannedDocument] = useState<SchoolDocument | null>(null);
  const [copied, setCopied] = useState(false);
  const [transferringToPC, setTransferringToPC] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      // Prefer rear camera (environment) on phone, or standard on desktop
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        lang === 'fr'
          ? "Accès caméra indisponible ou refusé. Vous pouvez téléverser directement une photo prise avec votre téléphone !"
          : "Camera permission denied or unavailable. You can upload an image taken with your phone instead!"
      );
      setMode('upload');
      setIsCameraActive(false);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isOpen && mode === 'camera' && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, mode, capturedImage]);

  // Capture frame from video
  const handleTakeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  // Handle file picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCapturedImage(result);
    };
    reader.readAsDataURL(file);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setScannedDocument(null);
    if (mode === 'camera') {
      startCamera();
    }
  };

  // Send photo to backend for AI transcription & structuring
  const handleProcessScan = async () => {
    if (!capturedImage || isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/scan-notes-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Image: capturedImage,
          fileName: `scan_notes_${Date.now()}.jpg`,
          subjectHint: subjectHint.trim() || undefined,
          language: lang,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la numérisation');
      }

      const data = await res.json();
      if (data.document) {
        setScannedDocument(data.document);
        onDocumentCreated(data.document);
      }
    } catch (err: any) {
      console.error('Scan processing error:', err);
      alert(lang === 'fr' ? 'Échec de la numérisation. Veuillez réessayer.' : 'Scan failed. Please retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Send Document directly to computer via live cloud notification
  const handleSendToPC = async () => {
    if (!scannedDocument) return;
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    setTransferringToPC(true);
    try {
      await sendSingleDocumentToCloud(currentUser.uid, scannedDocument, 'mobile');
      setTransferSuccess(true);
      setTimeout(() => setTransferSuccess(false), 3500);
    } catch (e) {
      console.error('Failed to notify PC device transfer:', e);
    } finally {
      setTransferringToPC(false);
    }
  };

  // Copy formatted Google Docs markdown
  const handleCopyFormatted = () => {
    if (!scannedDocument) return;
    navigator.clipboard.writeText(scannedDocument.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download as markdown / text
  const handleDownloadDoc = () => {
    if (!scannedDocument) return;
    const blob = new Blob([scannedDocument.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scannedDocument.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_GoogleDocs.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Camera className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
                {lang === 'fr' ? 'Photo de Notes ➔ Document Numérique' : 'Photo Notes ➔ Google Docs Ready'}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                  {lang === 'fr' ? 'Stocké sur PC' : 'Stored on PC'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'fr'
                  ? 'Photographiez vos notes manuscrites : l\'IA transcrit et structure votre cours automatiquement.'
                  : 'Snap your handwritten notes: AI transcribes and formats a complete Google Docs study document.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* If Result Already Transcribed */}
          {scannedDocument ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300/50 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    {lang === 'fr' ? 'Notes numérisées et archivées avec succès !' : 'Notes transcribed and stored successfully!'}
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300/90 mt-0.5">
                    {lang === 'fr'
                      ? 'Ce document est enregistré dans votre bibliothèque locale PC. Vous pouvez le copier ou le télécharger.'
                      : 'This document is safely stored in your local PC vault. Ready for Google Docs or flashcards.'}
                  </p>
                </div>
              </div>

              {/* Document Preview Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50">
                    {scannedDocument.subject}
                  </span>
                  <span className="text-xs text-slate-500">
                    {scannedDocument.gradeLevel}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {scannedDocument.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic border-l-2 border-indigo-500 pl-3">
                  {scannedDocument.summary}
                </p>

                {/* Formatted Content Preview */}
                <div className="mt-3 p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-h-56 overflow-y-auto font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {scannedDocument.content}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap pt-2">
                {/* Send to PC Button */}
                <button
                  id="btn-send-photo-to-pc"
                  onClick={handleSendToPC}
                  disabled={transferringToPC}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
                    transferSuccess
                      ? 'bg-emerald-600 text-white'
                      : currentUser
                      ? 'bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                  }`}
                  title={lang === 'fr' ? 'Transférer ce cours photographié directement à votre ordinateur de bureau' : 'Transfer this photographed study note straight to your desktop PC'}
                >
                  {transferringToPC ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{lang === 'fr' ? 'Envoi au PC...' : 'Sending to PC...'}</span>
                    </>
                  ) : transferSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{lang === 'fr' ? '✓ Reçu par l’ordinateur !' : '✓ Received on PC!'}</span>
                    </>
                  ) : currentUser ? (
                    <>
                      <Monitor className="w-4 h-4" />
                      <span>{lang === 'fr' ? '📱 Transférer au PC' : '📱 Transfer to PC'}</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>{lang === 'fr' ? '📱 Transférer au PC (Connexion Google)' : '📱 Transfer to PC (Google Sign-In)'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyFormatted}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? (lang === 'fr' ? 'Copié !' : 'Copied!') : (lang === 'fr' ? 'Copier format Google Docs' : 'Copy formatted Docs')}</span>
                </button>

                <button
                  onClick={handleDownloadDoc}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Télécharger (.md / Doc)' : 'Download (.md / Doc)'}</span>
                </button>

                <button
                  onClick={handleRetake}
                  className="px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer ml-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Prendre une autre photo' : 'Take another photo'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Mode Toggle (Camera vs File Upload) */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-sm mx-auto">
                <button
                  onClick={() => {
                    setMode('camera');
                    setCapturedImage(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    mode === 'camera'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Caméra / Webcam' : 'Camera'}</span>
                </button>
                <button
                  onClick={() => {
                    setMode('upload');
                    stopCamera();
                    setCapturedImage(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    mode === 'upload'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Importer Fichier Photo' : 'Upload Image'}</span>
                </button>
              </div>

              {/* Camera Error Banner */}
              {cameraError && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Viewport Area */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 min-h-[320px] sm:min-h-[380px] flex items-center justify-center">
                
                {/* Captured Image Preview */}
                {capturedImage ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <img
                      src={capturedImage}
                      alt="Notes preview"
                      className="max-h-[360px] w-auto object-contain rounded-lg shadow-md"
                    />
                    <div className="absolute bottom-3 inset-x-0 flex justify-center gap-3 px-4">
                      <button
                        onClick={handleRetake}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur-xs border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{lang === 'fr' ? 'Reprendre la photo' : 'Retake'}</span>
                      </button>
                    </div>
                  </div>
                ) : mode === 'camera' ? (
                  // Live Camera Stream
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full max-h-[380px] object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Camera Guidance Overlay Box */}
                    <div className="absolute inset-6 border-2 border-dashed border-white/40 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                      <span className="text-[10px] font-bold text-white/80 bg-black/40 px-2 py-0.5 rounded-md self-start">
                        {lang === 'fr' ? 'Cadrez vos notes bien à plat' : 'Frame notes flat'}
                      </span>
                    </div>

                    {/* Snapshot Button */}
                    <div className="absolute bottom-4 inset-x-0 flex justify-center">
                      <button
                        onClick={handleTakeSnapshot}
                        className="w-16 h-16 rounded-full bg-white text-indigo-700 shadow-xl border-4 border-indigo-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                        title={lang === 'fr' ? 'Prendre la photo' : 'Take snapshot'}
                      >
                        <div className="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                          <Camera className="w-5 h-5" />
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  // File Upload Area
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-16 px-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 mb-3">
                      <Upload className="w-7 h-7" />
                    </div>
                    <p className="font-bold text-sm text-white">
                      {lang === 'fr' ? 'Cliquez pour choisir une photo de notes' : 'Click to select note photo'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      {lang === 'fr'
                        ? 'Prenez en photo votre cahier, classeur ou tableau avec votre smartphone et importez-la ici.'
                        : 'Upload notebook photos, chalkboard snapshots, or paper course handouts.'}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Optional Subject Hint */}
              {capturedImage && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {lang === 'fr' ? 'Matière (optionnel - détection automatique sinon) :' : 'Subject (optional - auto-detected otherwise):'}
                    </label>
                    <input
                      type="text"
                      placeholder={lang === 'fr' ? 'Ex: Mathématiques, Histoire, SVT, Philosophie...' : 'Ex: Math, History, Biology...'}
                      value={subjectHint}
                      onChange={(e) => setSubjectHint(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    onClick={handleProcessScan}
                    disabled={isProcessing}
                    className="self-end px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'fr' ? 'Transcription IA...' : 'AI Transcribing...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>{lang === 'fr' ? 'Numériser vers Doc' : 'Transcribe to Doc'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Notes */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            {lang === 'fr' ? 'Stockage local sécurisé PC & compatible synchronisation cloud' : 'Local PC safe vault & cloud sync ready'}
          </span>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold cursor-pointer"
          >
            {lang === 'fr' ? 'Fermer' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
