import { jsPDF } from 'jspdf';
import { BlocknoteGuide, SchoolDocument, PaperStyle } from '../types';

export interface NotebookPdfOptions {
  paperStyle?: PaperStyle;
  includeMarginCues?: boolean;
  includePenLegend?: boolean;
  studentName?: string;
}

/**
 * Generates and downloads a student notebook PDF file mimicking classic school paper
 * (French Seyès, Ruled Lined, 5mm Grid, or Legal Pad) with Cornell margin rules.
 */
export function exportNotebookAsPdf(
  document: SchoolDocument,
  guide?: BlocknoteGuide,
  options: NotebookPdfOptions = {}
): string {
  const activeGuide = guide || document.blocknoteReproduction;
  const paper = options.paperStyle || activeGuide?.recommendedPaper || 'ruled';
  const includeCues = options.includeMarginCues !== false;
  const includePenLegend = options.includePenLegend !== false;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210 x 297 mm
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 35; // Left margin red line (classic French/college notebooks)
  const rightMargin = 12;
  const contentWidth = pageWidth - marginX - rightMargin; // ~163mm

  // Colors
  const ruledLineColor = { r: 195, g: 215, b: 240 }; // Pale student blue
  const seyesSubLineColor = { r: 228, g: 236, b: 248 }; // Very light blue for Seyès sub-lines
  const redMarginColor = { r: 235, g: 85, b: 95 }; // Classic notebook red vertical margin
  const gridLineColor = { r: 210, g: 225, b: 245 }; // 5mm grid pale blue

  // Pen ink colors for text simulation
  const penColors = {
    blue: { r: 25, g: 65, b: 165 },
    black: { r: 35, g: 35, b: 40 },
    red: { r: 200, g: 30, b: 45 },
    green: { r: 20, g: 120, b: 65 },
    purple: { r: 115, g: 45, b: 155 },
  };

  /**
   * Draws the background notebook paper texture (lines, grid, margin)
   */
  const drawNotebookBackground = () => {
    // If legal pad, tint paper yellow
    if (paper === 'legal') {
      pdf.setFillColor(254, 252, 232); // Pale legal pad yellow
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    } else {
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    }

    if (paper === 'seyes') {
      // Classic French Seyès: 8mm major lines + 2mm minor lines
      pdf.setDrawColor(seyesSubLineColor.r, seyesSubLineColor.g, seyesSubLineColor.b);
      pdf.setLineWidth(0.15);
      for (let y = 16; y <= pageHeight - 12; y += 2) {
        if ((y - 16) % 8 !== 0) {
          pdf.line(0, y, pageWidth, y);
        }
      }
      // Vertical Seyès lines (every 8mm)
      for (let x = 8; x <= pageWidth - 8; x += 8) {
        if (Math.abs(x - marginX) > 1) {
          pdf.line(x, 16, x, pageHeight - 12);
        }
      }
      // Major Seyès horizontal lines (every 8mm)
      pdf.setDrawColor(ruledLineColor.r, ruledLineColor.g, ruledLineColor.b);
      pdf.setLineWidth(0.3);
      for (let y = 16; y <= pageHeight - 12; y += 8) {
        pdf.line(0, y, pageWidth, y);
      }
    } else if (paper === 'grid') {
      // 5mm Quad / Grid
      pdf.setDrawColor(gridLineColor.r, gridLineColor.g, gridLineColor.b);
      pdf.setLineWidth(0.15);
      for (let y = 15; y <= pageHeight - 12; y += 5) {
        pdf.line(0, y, pageWidth, y);
      }
      for (let x = 5; x <= pageWidth - 5; x += 5) {
        if (Math.abs(x - marginX) > 1) {
          pdf.line(x, 15, x, pageHeight - 12);
        }
      }
    } else {
      // Ruled / Lined (8mm lines)
      pdf.setDrawColor(ruledLineColor.r, ruledLineColor.g, ruledLineColor.b);
      pdf.setLineWidth(0.25);
      for (let y = 18; y <= pageHeight - 12; y += 8) {
        pdf.line(0, y, pageWidth, y);
      }
    }

    // Left vertical margin line (Classic Red line)
    pdf.setDrawColor(redMarginColor.r, redMarginColor.g, redMarginColor.b);
    pdf.setLineWidth(0.45);
    pdf.line(marginX, 0, marginX, pageHeight);

    // Top spiral notebook punch holes decorative rendering
    pdf.setFillColor(220, 225, 230);
    pdf.setDrawColor(180, 190, 200);
    pdf.setLineWidth(0.2);
    for (let hx = 18; hx < pageWidth - 10; hx += 16) {
      pdf.circle(hx, 6, 1.8, 'FD');
    }
  };

  // Helper to add a new page with background
  let currentPage = 1;
  const addNewPage = () => {
    pdf.addPage();
    currentPage++;
    drawNotebookBackground();
    drawPageFooter();
  };

  const drawPageFooter = () => {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8);
    pdf.setTextColor(130, 140, 150);
    pdf.text(
      `ScholarMind • Cahier d'Écolier • ${document.subject} — Page ${currentPage}`,
      marginX + 2,
      pageHeight - 6
    );
  };

  // Draw first page background
  drawNotebookBackground();
  drawPageFooter();

  let cursorY = 16;

  // Student header block
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(penColors.blue.r, penColors.blue.g, penColors.blue.b);
  pdf.text('NOM :', marginX + 2, cursorY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(options.studentName || '____________________', marginX + 16, cursorY);

  pdf.setFont('helvetica', 'bold');
  pdf.text('DATE :', marginX + 70, cursorY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(document.date || new Date().toISOString().split('T')[0], marginX + 83, cursorY);

  pdf.setFont('helvetica', 'bold');
  pdf.text('MATIÈRE :', marginX + 115, cursorY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(document.subject || 'Cours', marginX + 135, cursorY);

  cursorY += 8;

  // Main Note Title (Handwritten student title style with red underline)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(penColors.black.r, penColors.black.g, penColors.black.b);
  const titleLines = pdf.splitTextToSize(document.title.toUpperCase(), contentWidth - 4);
  pdf.text(titleLines, marginX + 2, cursorY);
  cursorY += titleLines.length * 6;

  // Underline title with double or red pen
  pdf.setDrawColor(penColors.red.r, penColors.red.g, penColors.red.b);
  pdf.setLineWidth(0.6);
  pdf.line(marginX + 2, cursorY - 1.5, marginX + Math.min(contentWidth, 120), cursorY - 1.5);
  cursorY += 4;

  // Recommended Pen Bar (if enabled)
  if (includePenLegend && activeGuide?.recommendedPens && activeGuide.recommendedPens.length > 0) {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8);
    pdf.setTextColor(90, 100, 110);
    pdf.text('Code couleur recommandé pour ce cours :', marginX + 2, cursorY);
    cursorY += 4.5;

    let penX = marginX + 2;
    activeGuide.recommendedPens.forEach((pen) => {
      let rgb = penColors.blue;
      if (pen.color.includes('red')) rgb = penColors.red;
      else if (pen.color.includes('green')) rgb = penColors.green;
      else if (pen.color.includes('purple')) rgb = penColors.purple;
      else if (pen.color.includes('black')) rgb = penColors.black;

      // Small color pill
      pdf.setFillColor(rgb.r, rgb.g, rgb.b);
      pdf.circle(penX + 1.5, cursorY - 1.2, 1.4, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(rgb.r, rgb.g, rgb.b);
      const text = `${pen.name} (${pen.purpose})`;
      pdf.text(text, penX + 4.5, cursorY);
      penX += pdf.getTextWidth(text) + 9;
      if (penX > pageWidth - 20) {
        penX = marginX + 2;
        cursorY += 4;
      }
    });
    cursorY += 6;
  }

  // If we have sections from the guide, render them in notebook format
  const sections = activeGuide?.sections || [
    {
      id: 'sec-1',
      heading: 'Notes & Contenu du Cours',
      cueMarginText: 'Idées Clés',
      lines: document.content.split('\n').filter(Boolean).map((line, i) => ({
        id: `l-${i}`,
        text: line,
        type: (line.startsWith('-') || line.startsWith('•') ? 'bullet' : 'definition') as 'bullet' | 'definition',
        penColor: 'blue' as const,
      })),
    },
  ];

  sections.forEach((section, sIdx) => {
    // Check if we need a new page for the section
    if (cursorY > pageHeight - 40) {
      addNewPage();
      cursorY = 24;
    }

    const sectionStartCursorY = cursorY;

    // 1. Left Margin Cue / Question (in Red Pen)
    if (includeCues && (section.cueMarginText || section.heading)) {
      const cue = section.cueMarginText || section.heading;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(penColors.red.r, penColors.red.g, penColors.red.b);
      const cueLines = pdf.splitTextToSize(cue, marginX - 6);
      pdf.text(cueLines, 4, cursorY + 1);
    }

    // 2. Section Heading in Notebook (e.g. Roman numeral or colored title)
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11.5);
    pdf.setTextColor(penColors.purple.r, penColors.purple.g, penColors.purple.b);
    const headingText = `${sIdx + 1}. ${section.heading}`;
    pdf.text(headingText, marginX + 2, cursorY);
    cursorY += 2;
    // Underline
    pdf.setDrawColor(penColors.purple.r, penColors.purple.g, penColors.purple.b);
    pdf.setLineWidth(0.3);
    pdf.line(marginX + 2, cursorY, marginX + pdf.getTextWidth(headingText) + 4, cursorY);
    cursorY += 5;

    // 3. Section Lines
    section.lines?.forEach((line) => {
      if (cursorY > pageHeight - 25) {
        addNewPage();
        cursorY = 24;
      }

      // Determine text color based on pen assignment
      let textRgb = penColors.blue;
      if (line.penColor === 'red') textRgb = penColors.red;
      else if (line.penColor === 'green') textRgb = penColors.green;
      else if (line.penColor === 'purple') textRgb = penColors.purple;
      else if (line.penColor === 'black') textRgb = penColors.black;

      if (line.type === 'formula') {
        // Boxed formula
        pdf.setFont('courier', 'bold');
        pdf.setFontSize(9.5);
        pdf.setTextColor(penColors.red.r, penColors.red.g, penColors.red.b);

        const formulaText = `[FORMULE] ${line.text}`;
        const fWidth = Math.min(contentWidth - 6, pdf.getTextWidth(formulaText) + 8);
        const fLines = pdf.splitTextToSize(formulaText, contentWidth - 10);
        const boxHeight = fLines.length * 4.5 + 4;

        pdf.setDrawColor(penColors.red.r, penColors.red.g, penColors.red.b);
        pdf.setLineWidth(0.35);
        pdf.setFillColor(254, 242, 242); // Soft light red box
        pdf.roundedRect(marginX + 4, cursorY - 3.5, fWidth, boxHeight, 1.5, 1.5, 'FD');

        pdf.text(fLines, marginX + 7, cursorY);
        cursorY += boxHeight + 2;
      } else if (line.type === 'box_note') {
        // Important Definition or Core Law in a double box
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(penColors.black.r, penColors.black.g, penColors.black.b);

        const bLines = pdf.splitTextToSize(`★ ${line.text}`, contentWidth - 12);
        const boxHeight = bLines.length * 4.5 + 5;

        pdf.setDrawColor(40, 40, 50);
        pdf.setLineWidth(0.4);
        pdf.setFillColor(255, 251, 235); // Soft cream note
        pdf.roundedRect(marginX + 2, cursorY - 3.5, contentWidth - 4, boxHeight, 1, 1, 'FD');

        pdf.text(bLines, marginX + 5, cursorY);
        cursorY += boxHeight + 2;
      } else {
        // Bullet or regular text line
        pdf.setFont('helvetica', line.type === 'definition' ? 'bold' : 'normal');
        pdf.setFontSize(9.5);
        pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);

        const prefix = line.type === 'bullet' ? '• ' : line.type === 'subbullet' ? '    - ' : '';
        const wrappedLines = pdf.splitTextToSize(prefix + line.text, contentWidth - 4);
        pdf.text(wrappedLines, marginX + 2, cursorY);
        cursorY += wrappedLines.length * 4.8;
      }
    });

    // 4. ASCII Diagram if present
    if (section.quickSketchAscii) {
      if (cursorY > pageHeight - 35) {
        addNewPage();
        cursorY = 24;
      }
      pdf.setFont('courier', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(penColors.black.r, penColors.black.g, penColors.black.b);

      const asciiLines = section.quickSketchAscii.split('\n');
      const boxHeight = Math.min(45, asciiLines.length * 3.5 + 6);

      pdf.setDrawColor(180, 190, 200);
      pdf.setLineWidth(0.2);
      pdf.setFillColor(248, 250, 252);
      pdf.rect(marginX + 4, cursorY - 2, contentWidth - 8, boxHeight, 'FD');

      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(7);
      pdf.setTextColor(110, 120, 130);
      pdf.text('Schéma à reproduire au stylo :', marginX + 6, cursorY + 1.5);

      pdf.setFont('courier', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(40, 40, 45);
      let asciiY = cursorY + 5.5;
      asciiLines.slice(0, 10).forEach((aline) => {
        pdf.text(aline.substring(0, 75), marginX + 6, asciiY);
        asciiY += 3.4;
      });

      cursorY += boxHeight + 4;
    }

    cursorY += 4; // Space between sections
  });

  // Bottom Cornell Summary Box (Bilan de fin de page)
  if (activeGuide?.bottomSummary) {
    if (cursorY > pageHeight - 45) {
      addNewPage();
      cursorY = 24;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(penColors.red.r, penColors.red.g, penColors.red.b);
    pdf.text('RÉSUMÉ & BILAN DE FIN DE PAGE (Méthode Cornell) :', marginX + 2, cursorY);
    cursorY += 4;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(penColors.black.r, penColors.black.g, penColors.black.b);

    const summaryLines = pdf.splitTextToSize(activeGuide.bottomSummary, contentWidth - 10);
    const boxHeight = summaryLines.length * 4.6 + 5;

    pdf.setDrawColor(penColors.red.r, penColors.red.g, penColors.red.b);
    pdf.setLineWidth(0.4);
    pdf.setFillColor(254, 249, 235);
    pdf.roundedRect(marginX + 2, cursorY - 2.5, contentWidth - 4, boxHeight, 1.5, 1.5, 'FD');

    pdf.text(summaryLines, marginX + 6, cursorY + 1.5);
    cursorY += boxHeight + 4;
  }

  // Clean filename
  const cleanTitle = document.title
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_');
  const fileName = `${cleanTitle || 'Note'}_Cahier_Etudiant.pdf`;

  // Trigger download of the PDF file
  pdf.save(fileName);

  return fileName;
}
