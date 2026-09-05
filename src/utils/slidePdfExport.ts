import jsPDF from 'jspdf';
import { SchoolDocument, AppLanguage } from '../types';

export interface SlideData {
  id: string;
  type: 'title' | 'roadmap' | 'keypoint' | 'summary' | 'exam_tips' | 'quiz_review';
  title: string;
  subtitle?: string;
  badge?: string;
  bullets?: string[];
  content?: string;
  notes?: string;
  highlightText?: string;
}

export function extractSlidesFromDocument(doc: SchoolDocument, lang: AppLanguage = 'fr'): SlideData[] {
  const slides: SlideData[] = [];

  // Slide 1: Title & Introduction
  slides.push({
    id: 'slide-intro',
    type: 'title',
    title: doc.title || (lang === 'fr' ? 'Sans Titre' : 'Untitled Document'),
    subtitle: `${doc.subject}  •  Degree Unlocker`,
    badge: doc.subject,
    content: doc.summary 
      ? (doc.summary.slice(0, 220) + (doc.summary.length > 220 ? '...' : '')) 
      : (lang === 'fr' ? 'Présentation de synthèse et révision structurée.' : 'Structured study summary and revision deck.'),
    notes: lang === 'fr' 
      ? `Document: ${doc.title} (${doc.subject}). Présentation générale des notions fondamentales.` 
      : `Document: ${doc.title} (${doc.subject}). Overview of fundamental concepts.`,
  });

  // Slide 2: Roadmap if key points exist
  if (doc.keyPoints && doc.keyPoints.length > 0) {
    slides.push({
      id: 'slide-roadmap',
      type: 'roadmap',
      title: lang === 'fr' ? 'Plan & Notions Clés à Retenir' : 'Roadmap & Key Study Concepts',
      subtitle: lang === 'fr' ? 'Vue d\'ensemble des points d\'ancrage mémoriels' : 'Overview of memorization anchors',
      badge: lang === 'fr' ? 'SOMMAIRE' : 'ROADMAP',
      bullets: doc.keyPoints.slice(0, 6),
      notes: lang === 'fr' ? 'Ce sommaire regroupe les points majeurs à mémoriser pour l\'examen.' : 'This roadmap lists the main points to master for testing.',
    });

    // Individual Key Point Slides (grouping 1-2 points per slide for clarity)
    for (let i = 0; i < doc.keyPoints.length; i += 2) {
      const chunk = doc.keyPoints.slice(i, i + 2);
      const slideNum = Math.floor(i / 2) + 1;
      slides.push({
        id: `slide-kp-${slideNum}`,
        type: 'keypoint',
        title: lang === 'fr' ? `Concept Clé #${i + 1}${doc.keyPoints[i + 1] ? ` & #${i + 2}` : ''}` : `Key Concept #${i + 1}${doc.keyPoints[i + 1] ? ` & #${i + 2}` : ''}`,
        subtitle: doc.subject,
        badge: lang === 'fr' ? 'MÉMORISATION' : 'KEY TAKEAWAY',
        bullets: chunk,
        highlightText: chunk[0],
        notes: lang === 'fr' ? `Insister sur les définitions exactes et les applications pratiques.` : `Emphasize exact terminology and practical examples.`,
      });
    }
  }

  // Slide: Course Summary Synthesis
  if (doc.summary) {
    const summaryParagraphs = doc.summary
      .split('\n\n')
      .map(p => p.trim())
      .filter(Boolean);

    if (summaryParagraphs.length > 0) {
      // Split summary into 1 or 2 slides if lengthy
      const part1 = summaryParagraphs.slice(0, 2).join('\n\n');
      slides.push({
        id: 'slide-summary-1',
        type: 'summary',
        title: lang === 'fr' ? 'Synthèse Essentielle du Cours' : 'Core Summary & Principles',
        subtitle: doc.title,
        badge: lang === 'fr' ? 'SYNTHÈSE' : 'CORE SUMMARY',
        content: part1,
        notes: lang === 'fr' ? 'Résumé des mécanismes et logiques principales.' : 'Summary of main mechanics and rules.',
      });

      if (summaryParagraphs.length > 2) {
        const part2 = summaryParagraphs.slice(2, 4).join('\n\n');
        slides.push({
          id: 'slide-summary-2',
          type: 'summary',
          title: lang === 'fr' ? 'Développements & Approfondissements' : 'Deep Dive & Nuances',
          subtitle: doc.title,
          badge: lang === 'fr' ? 'APPROFONDISSEMENT' : 'DEEP DIVE',
          content: part2,
          notes: lang === 'fr' ? 'Détails complémentaires pour viser l\'excellence à l\'évaluation.' : 'Additional details for high exam performance.',
        });
      }
    }
  }

  // Final Slide: Revision & Review Prompt
  slides.push({
    id: 'slide-conclusion',
    type: 'quiz_review',
    title: lang === 'fr' ? 'Conclusion & Auto-Évaluation' : 'Conclusion & Self-Check',
    subtitle: lang === 'fr' ? 'Passez en revue pour valider vos acquis' : 'Test your recall to validate mastery',
    badge: lang === 'fr' ? 'CONTRÔLE' : 'RECALL TEST',
    bullets: [
      lang === 'fr' ? 'Pouvez-vous expliquer le concept central sans regarder vos notes ?' : 'Can you explain the main idea without looking at notes?',
      lang === 'fr' ? 'Quels sont les 3 mots-clés indispensables associés à ce sujet ?' : 'What are the 3 essential keywords for this topic?',
      lang === 'fr' ? 'Testez-vous maintenant via le mode Flashcards ou le Quiz interactif.' : 'Test yourself right now in the Flashcards or Quiz mode.',
    ],
    notes: lang === 'fr' ? 'Recommander une session Flashcards SRS pour ancrer la mémoire à long terme.' : 'Recommend SRS flashcard practice for long-term retention.',
  });

  return slides;
}

export function exportSlidesDeckPdf(docData: SchoolDocument, lang: AppLanguage = 'fr') {
  const slides = extractSlidesFromDocument(docData, lang);

  // Landscape 16:9 PDF slide deck (297mm x 167mm or standard A4 Landscape: 297mm x 210mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [297, 167], // 16:9 Widescreen aspect ratio
  });

  const pageWidth = 297;
  const pageHeight = 167;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  slides.forEach((slide, index) => {
    if (index > 0) {
      doc.addPage([297, 167], 'landscape');
    }

    // 1. Dark Modern Background matching the UI mockup
    doc.setFillColor(11, 15, 25); // Deep luxury dark #0B0F19
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Subtle ambient card background
    doc.setFillColor(17, 24, 39); // #111827
    doc.roundedRect(12, 12, pageWidth - 24, pageHeight - 24, 4, 4, 'F');
    doc.setDrawColor(31, 41, 61); // #1F293D
    doc.roundedRect(12, 12, pageWidth - 24, pageHeight - 24, 4, 4, 'S');

    // Header Accent Bar
    doc.setFillColor(99, 102, 241); // Indigo #6366F1
    doc.rect(12, 12, pageWidth - 24, 2.5, 'F');

    // Header Badge & Slide Number
    const badgeText = slide.badge || docData.subject.toUpperCase();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(165, 180, 252); // Indigo-300
    doc.text(badgeText, margin, 24);

    // Slide Counter
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(`${index + 1} / ${slides.length}`, pageWidth - margin, 24, { align: 'right' });

    // Slide Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(248, 250, 252); // Slate-50
    const titleLines = doc.splitTextToSize(slide.title, contentWidth);
    doc.text(titleLines, margin, 35);

    let currentY = 35 + titleLines.length * 8;

    // Subtitle if present
    if (slide.subtitle) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(slide.subtitle, margin, currentY);
      currentY += 8;
    }

    // Divider Line
    doc.setDrawColor(31, 41, 61);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;

    // Slide Content / Bullets
    if (slide.bullets && slide.bullets.length > 0) {
      slide.bullets.forEach((bullet) => {
        // Bullet box
        doc.setFillColor(22, 31, 48); // Slate-800/60
        doc.setDrawColor(45, 55, 75);
        
        const bulletTextLines = doc.splitTextToSize(bullet, contentWidth - 16);
        const cardH = Math.max(12, bulletTextLines.length * 5.5 + 6);

        if (currentY + cardH > pageHeight - 20) return;

        doc.roundedRect(margin, currentY, contentWidth, cardH, 2, 2, 'FD');

        // Bullet marker dot
        doc.setFillColor(99, 102, 241);
        doc.circle(margin + 5, currentY + 6, 1.5, 'F');

        // Bullet text
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(226, 232, 240); // Slate-200
        doc.text(bulletTextLines, margin + 10, currentY + 6);

        currentY += cardH + 4;
      });
    } else if (slide.content) {
      // Content Box
      doc.setFillColor(22, 31, 48);
      doc.setDrawColor(45, 55, 75);
      const contentLines = doc.splitTextToSize(slide.content, contentWidth - 12);
      const boxHeight = Math.min(80, contentLines.length * 5.5 + 10);

      doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, 'FD');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(226, 232, 240);
      doc.text(contentLines, margin + 6, currentY + 7);
    }

    // Footer
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Degree Unlocker  •  ${docData.title}  •  ${lang === 'fr' ? 'Support de Présentation & Révision' : 'Presentation & Study Slides'}`, margin, pageHeight - 16);
  });

  const safeFileName = (docData.title || 'diaporama').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Diaporama_${safeFileName}.pdf`);
}
