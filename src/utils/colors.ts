export function getSubjectBadgeClass(subject: string): { bg: string; text: string; border: string; dot: string } {
  const s = (subject || '').toLowerCase();
  if (s.includes('bio')) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };
  }
  if (s.includes('phys')) {
    return { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' };
  }
  if (s.includes('math')) {
    return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' };
  }
  if (s.includes('hist')) {
    return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
  }
  if (s.includes('chem')) {
    return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' };
  }
  if (s.includes('phil') || s.includes('lit')) {
    return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' };
  }
  if (s.includes('cs') || s.includes('comput') || s.includes('tech')) {
    return { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' };
  }
  return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' };
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
