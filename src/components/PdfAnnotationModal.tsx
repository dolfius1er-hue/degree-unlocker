import React, { useState, useRef, useEffect } from 'react';
import { SchoolDocument, PdfPageAnnotation, PdfDrawingStroke, PdfTextAnnotation, AppLanguage } from '../types';
import { 
  Pen, 
  Highlighter, 
  Eraser, 
  Type, 
  Undo, 
  Trash2, 
  Download, 
  Save, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  FileText,
  Palette,
  Check
} from 'lucide-react';

interface PdfAnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: SchoolDocument | null;
  onSaveAnnotations: (docId: string, annotations: PdfPageAnnotation[]) => void;
  lang?: AppLanguage;
}

const PEN_COLORS = [
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Rouge / Correction', value: '#ef4444' },
  { name: 'Émeraude / Valide', value: '#10b981' },
  { name: 'Ambre / Note', value: '#f59e0b' },
  { name: 'Noir / Encre', value: '#0f172a' },
  { name: 'Cyan / Clé', value: '#06b6d4' },
];

const HIGHLIGHTER_COLORS = [
  { name: 'Jaune Fluo', value: '#facc15' },
  { name: 'Vert Fluo', value: '#4ade80' },
  { name: 'Rose Fluo', value: '#f472b6' },
  { name: 'Bleu Fluo', value: '#38bdf8' },
  { name: 'Orange Fluo', value: '#fb923c' },
];

export const PdfAnnotationModal: React.FC<PdfAnnotationModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  onSaveAnnotations,
  lang = 'fr',
}) => {
  if (!isOpen || !doc) return null;

  // Active Tool
  const [activeTool, setActiveTool] = useState<'pen' | 'highlighter' | 'eraser' | 'text'>('highlighter');
  const [penColor, setPenColor] = useState('#4f46e5');
  const [highlighterColor, setHighlighterColor] = useState('#facc15');
  const [strokeWidth, setStrokeWidth] = useState(16); // default for highlighter
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSaved, setIsSaved] = useState(false);

  // Text annotation inline input state
  const [pendingTextPos, setPendingTextPos] = useState<{ x: number; y: number } | null>(null);
  const [inlineTextValue, setInlineTextValue] = useState('');

  // Local Page Annotations State initialized from document
  const [annotations, setAnnotations] = useState<PdfPageAnnotation[]>(() => {
    if (doc.annotations && Array.isArray(doc.annotations)) {
      return JSON.parse(JSON.stringify(doc.annotations));
    }
    return [
      { pageNumber: 1, strokes: [], textNotes: [] },
      { pageNumber: 2, strokes: [], textNotes: [] },
      { pageNumber: 3, strokes: [], textNotes: [] },
    ];
  });

  // History for Undo
  const [history, setHistory] = useState<PdfPageAnnotation[][]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const currentStroke = useRef<PdfDrawingStroke | null>(null);

  // Get current page annotation data
  const currentPageData = annotations.find((a) => a.pageNumber === currentPage) || {
    pageNumber: currentPage,
    strokes: [],
    textNotes: [],
  };

  // Adjust tool stroke width defaults
  const handleSelectTool = (tool: 'pen' | 'highlighter' | 'eraser' | 'text') => {
    setActiveTool(tool);
    if (tool === 'pen') {
      setStrokeWidth(3);
    } else if (tool === 'highlighter') {
      setStrokeWidth(18);
    } else if (tool === 'eraser') {
      setStrokeWidth(24);
    }
  };

  // Push to undo stack
  const saveStateToHistory = () => {
    setHistory((prev) => [...prev.slice(-20), JSON.parse(JSON.stringify(annotations))]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setAnnotations(previous);
  };

  const handleClearPage = () => {
    if (window.confirm(lang === 'fr' ? 'Effacer toutes les annotations de cette page ?' : 'Clear all annotations on this page?')) {
      saveStateToHistory();
      setAnnotations((prev) =>
        prev.map((a) => (a.pageNumber === currentPage ? { ...a, strokes: [], textNotes: [] } : a))
      );
    }
  };

  // Redraw canvas whenever annotations, currentPage or zoom changes
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw strokes
    currentPageData.strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.save();
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = stroke.width;

      if (stroke.tool === 'highlighter') {
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = stroke.opacity || 0.45;
        ctx.globalCompositeOperation = 'multiply';
      } else {
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    });
  };

  useEffect(() => {
    redrawCanvas();
  }, [annotations, currentPage, zoomLevel]);

  // Handle Canvas Drawing Mouse / Touch events
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (activeTool === 'text') {
      const coords = getCanvasCoords(e);
      setPendingTextPos(coords);
      setInlineTextValue('');
      return;
    }

    const coords = getCanvasCoords(e);
    isDrawing.current = true;
    saveStateToHistory();

    const isHighlighter = activeTool === 'highlighter';
    const isEraser = activeTool === 'eraser';

    currentStroke.current = {
      id: `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tool: activeTool === 'eraser' ? 'eraser' : activeTool,
      color: isEraser ? '#ffffff' : (isHighlighter ? highlighterColor : penColor),
      width: strokeWidth,
      opacity: isHighlighter ? 0.45 : 1,
      points: [coords],
    };

    if (isEraser) {
      // Erase strokes intersecting
      eraseNearby(coords.x, coords.y);
    }
  };

  const handleMoveDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentStroke.current) return;
    const coords = getCanvasCoords(e);
    currentStroke.current.points.push(coords);

    if (activeTool === 'eraser') {
      eraseNearby(coords.x, coords.y);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stroke = currentStroke.current;
    const pts = stroke.points;
    if (pts.length < 2) return;

    ctx.save();
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = stroke.width;

    if (stroke.tool === 'highlighter') {
      ctx.strokeStyle = stroke.color;
      ctx.globalAlpha = stroke.opacity;
      ctx.globalCompositeOperation = 'multiply';
    } else {
      ctx.strokeStyle = stroke.color;
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
    }

    const p1 = pts[pts.length - 2];
    const p2 = pts[pts.length - 1];
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  };

  const handleEndDraw = () => {
    if (!isDrawing.current || !currentStroke.current) return;
    isDrawing.current = false;

    if (activeTool !== 'eraser' && currentStroke.current.points.length > 1) {
      const strokeToAdd = { ...currentStroke.current };
      setAnnotations((prev) => {
        const found = prev.find((a) => a.pageNumber === currentPage);
        if (found) {
          return prev.map((a) =>
            a.pageNumber === currentPage ? { ...a, strokes: [...a.strokes, strokeToAdd] } : a
          );
        } else {
          return [...prev, { pageNumber: currentPage, strokes: [strokeToAdd], textNotes: [] }];
        }
      });
    }

    currentStroke.current = null;
    redrawCanvas();
  };

  const eraseNearby = (x: number, y: number) => {
    const radius = 20;
    setAnnotations((prev) =>
      prev.map((a) => {
        if (a.pageNumber !== currentPage) return a;
        const remainingStrokes = a.strokes.filter((s) => {
          return !s.points.some((p) => Math.hypot(p.x - x, p.y - y) < radius);
        });
        const remainingTextNotes = a.textNotes.filter((t) => {
          return Math.hypot(t.x - x, t.y - y) > radius * 2;
        });
        return { ...a, strokes: remainingStrokes, textNotes: remainingTextNotes };
      })
    );
  };

  const handleAddTextNote = () => {
    if (!pendingTextPos || !inlineTextValue.trim()) {
      setPendingTextPos(null);
      return;
    }

    saveStateToHistory();
    const newNote: PdfTextAnnotation = {
      id: `note-${Date.now()}`,
      x: pendingTextPos.x,
      y: pendingTextPos.y,
      text: inlineTextValue.trim(),
      color: penColor,
      bgColor: '#fef08a',
      fontSize: 14,
    };

    setAnnotations((prev) => {
      const found = prev.find((a) => a.pageNumber === currentPage);
      if (found) {
        return prev.map((a) =>
          a.pageNumber === currentPage ? { ...a, textNotes: [...a.textNotes, newNote] } : a
        );
      } else {
        return [...prev, { pageNumber: currentPage, strokes: [], textNotes: [newNote] }];
      }
    });

    setPendingTextPos(null);
    setInlineTextValue('');
  };

  const handleSave = () => {
    onSaveAnnotations(doc.id, annotations);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleDownloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${doc.title.replace(/\s+/g, '_')}_annotated_page_${currentPage}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Get sample document lines to display underneath the annotation canvas
  const docParagraphs = doc.content.split(/\n{2,}|\r\n\r\n/).filter(Boolean);
  const totalPages = Math.max(3, Math.ceil(docParagraphs.length / 2) || 1);
  const pageText = docParagraphs.slice((currentPage - 1) * 2, currentPage * 2).join('\n\n') || doc.content;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md text-white animate-in fade-in duration-200">
      
      {/* Top Annotation Toolbar */}
      <div className="h-16 px-4 sm:px-6 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        
        {/* Document Title & Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
            <Highlighter className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold text-white truncate max-w-xs sm:max-w-md">
              {doc.title}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="text-amber-400 font-semibold">{doc.subject}</span>
              <span>•</span>
              <span>{lang === 'fr' ? 'Calque d’Annotation Manuscrit' : 'Document Annotation Layer'}</span>
            </div>
          </div>
        </div>

        {/* Annotation Tools Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-800/90 rounded-xl border border-slate-700/80">
          
          {/* Highlighter Tool */}
          <button
            onClick={() => handleSelectTool('highlighter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTool === 'highlighter'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
            title={lang === 'fr' ? 'Surligneur Fluo (Texte visible dessous)' : 'Highlighter'}
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'fr' ? 'Surligneur' : 'Highlight'}</span>
          </button>

          {/* Pen Tool */}
          <button
            onClick={() => handleSelectTool('pen')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTool === 'pen'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
            title={lang === 'fr' ? 'Stylo Crayon' : 'Pen'}
          >
            <Pen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'fr' ? 'Stylo' : 'Pen'}</span>
          </button>

          {/* Text Sticky Note Tool */}
          <button
            onClick={() => handleSelectTool('text')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTool === 'text'
                ? 'bg-yellow-400 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
            title={lang === 'fr' ? 'Note Post-it / Texte' : 'Text Note'}
          >
            <Type className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'fr' ? 'Post-it' : 'Note'}</span>
          </button>

          {/* Eraser Tool */}
          <button
            onClick={() => handleSelectTool('eraser')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTool === 'eraser'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
            title={lang === 'fr' ? 'Gomme' : 'Eraser'}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'fr' ? 'Gomme' : 'Eraser'}</span>
          </button>
        </div>

        {/* Color Palette Switcher */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-slate-800/60 rounded-xl border border-slate-700/60">
          {(activeTool === 'highlighter' ? HIGHLIGHTER_COLORS : PEN_COLORS).map((c) => {
            const isSelected = activeTool === 'highlighter' ? highlighterColor === c.value : penColor === c.value;
            return (
              <button
                key={c.value}
                onClick={() => {
                  if (activeTool === 'highlighter') {
                    setHighlighterColor(c.value);
                  } else {
                    setPenColor(c.value);
                  }
                }}
                className={`w-6 h-6 rounded-full transition-transform cursor-pointer relative flex items-center justify-center ${
                  isSelected ? 'scale-115 ring-2 ring-white shadow-md' : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 stroke-[3]" />}
              </button>
            );
          })}
        </div>

        {/* Actions (Undo, Clear, Save, Close) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors cursor-pointer"
            title="Annuler (Undo)"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearPage}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
            title="Effacer la page"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadSnapshot}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Exporter image annotée (.PNG)"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleSave}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? (lang === 'fr' ? 'Enregistré !' : 'Saved!') : (lang === 'fr' ? 'Enregistrer' : 'Save')}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Document Viewer Stage with Annotation Overlay */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-slate-950">
        <div 
          className="relative bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-transform duration-200"
          style={{
            width: '820px',
            minHeight: '1060px',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Document Header Page Badge */}
          <div className="px-10 pt-8 pb-4 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>{doc.title}</span>
            <span>PAGE {currentPage} / {totalPages}</span>
          </div>

          {/* Underlying Document Text / Content */}
          <div className="px-10 py-8 select-text pointer-events-none space-y-6">
            <h1 className="text-xl font-bold text-slate-900 border-b pb-2">
              {doc.title} - {lang === 'fr' ? 'Section' : 'Section'} {currentPage}
            </h1>
            
            <div className="text-sm text-slate-800 leading-relaxed font-serif whitespace-pre-wrap">
              {pageText}
            </div>

            {/* Simulated academic margin annotations cue if available */}
            {doc.keyPoints && doc.keyPoints.length > 0 && (
              <div className="mt-8 p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-2">
                <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800">
                  {lang === 'fr' ? 'Points Clés du Cours' : 'Key Lecture Concepts'}
                </span>
                <ul className="list-disc pl-4 space-y-1">
                  {doc.keyPoints.slice(0, 4).map((kp, idx) => (
                    <li key={idx}>{kp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sticky Text Notes Placed on Document */}
          {currentPageData.textNotes.map((note) => (
            <div
              key={note.id}
              className="absolute z-20 p-2.5 rounded-xl shadow-lg border border-amber-300/80 text-slate-900 text-xs font-sans max-w-xs animate-in zoom-in-95 duration-150 group"
              style={{
                left: `${note.x}px`,
                top: `${note.y}px`,
                backgroundColor: note.bgColor || '#fef08a',
              }}
            >
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-amber-400/40 text-[10px] font-bold text-amber-900">
                <span>📝 Note</span>
                <button
                  onClick={() => {
                    saveStateToHistory();
                    setAnnotations((prev) =>
                      prev.map((a) =>
                        a.pageNumber === currentPage
                          ? { ...a, textNotes: a.textNotes.filter((n) => n.id !== note.id) }
                          : a
                      )
                    );
                  }}
                  className="text-rose-600 hover:text-rose-800 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="pt-1 leading-snug">{note.text}</p>
            </div>
          ))}

          {/* Text Input Prompt when clicking with Text Tool */}
          {pendingTextPos && (
            <div
              className="absolute z-30 p-3 bg-white border-2 border-indigo-500 rounded-xl shadow-2xl"
              style={{ left: `${pendingTextPos.x}px`, top: `${pendingTextPos.y}px` }}
            >
              <div className="text-[11px] font-bold text-indigo-900 mb-1">
                {lang === 'fr' ? 'Ajouter une note post-it' : 'Add Sticky Note'}
              </div>
              <textarea
                autoFocus
                value={inlineTextValue}
                onChange={(e) => setInlineTextValue(e.target.value)}
                placeholder={lang === 'fr' ? 'Écrivez votre remarque...' : 'Write note...'}
                className="w-48 h-16 p-1.5 text-xs text-slate-900 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddTextNote();
                  }
                }}
              />
              <div className="flex items-center justify-end gap-1.5 mt-2">
                <button
                  onClick={() => setPendingTextPos(null)}
                  className="px-2 py-1 text-[10px] text-slate-600 hover:bg-slate-100 rounded"
                >
                  {lang === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  onClick={handleAddTextNote}
                  className="px-2.5 py-1 text-[10px] bg-indigo-600 text-white font-bold rounded"
                >
                  {lang === 'fr' ? 'Ajouter' : 'Add'}
                </button>
              </div>
            </div>
          )}

          {/* Transparent Canvas Overlay for Mouse & Touch Drawing */}
          <canvas
            ref={canvasRef}
            width={820}
            height={1060}
            onMouseDown={handleStartDraw}
            onMouseMove={handleMoveDraw}
            onMouseUp={handleEndDraw}
            onMouseLeave={handleEndDraw}
            onTouchStart={handleStartDraw}
            onTouchMove={handleMoveDraw}
            onTouchEnd={handleEndDraw}
            className="absolute inset-0 z-10 cursor-crosshair touch-none"
          />
        </div>
      </div>

      {/* Bottom Floating Navigation & Zoom Control Bar */}
      <div className="h-14 px-6 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
        
        {/* Page Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-slate-300">
            {lang === 'fr' ? 'Page' : 'Page'} <strong className="text-white">{currentPage}</strong> / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tip / Guidance */}
        <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {lang === 'fr'
              ? 'Surlignez directement sur le texte ou dessinez vos annotations avec la souris ou au doigt.'
              : 'Highlight directly on text or sketch handwritten notes with mouse or touch.'}
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, +(z - 0.1).toFixed(1)))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-slate-300 text-[11px] w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.5, +(z + 0.1).toFixed(1)))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
