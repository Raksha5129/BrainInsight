import type { jsPDF as JsPDFDocument } from "jspdf";
import { diseaseInsights, modelClasses, notebookFacts } from "./brainInsightData";

export type ScanReportResult = {
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
};

function addWrappedText(doc: JsPDFDocument, text: string, x: number, y: number, maxWidth: number, lineHeight = 14) {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function probabilityFor(result: ScanReportResult, item: (typeof modelClasses)[number]) {
  const candidates = [
    item.shortName,
    item.name,
    item.id,
    item.id.replace("_", " "),
    item.id.replace("_", "-"),
  ];
  const entries = Object.entries(result.probabilities || {});
  for (const candidate of candidates) {
    const match = entries.find(([key]) => normalize(key) === normalize(candidate));
    if (match) return match[1];
  }
  return 0;
}

async function imageFileToJpeg(file: File, maxDimension = 1200): Promise<string> {
  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read the uploaded MRI image."));
      img.src = sourceUrl;
    });

    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
    const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
    const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare the image for the report.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.9);
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

function safeFilename(name: string) {
  return name.replace(/[^a-z0-9._-]+/gi, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
}

export async function downloadScanReport(file: File, result: ScanReportResult) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 44;
  const contentWidth = pageWidth - margin * 2;
  const imageData = await imageFileToJpeg(file);

  doc.setFillColor(9, 16, 29);
  doc.rect(0, 0, pageWidth, 118, "F");
  doc.setTextColor(34, 211, 238);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("BRAININSIGHT  /  LOCAL SCAN REPORT", margin, 36);
  doc.setTextColor(244, 248, 255);
  doc.setFontSize(24);
  doc.text("Brain MRI analysis report", margin, 70);
  doc.setTextColor(166, 184, 207);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Generated locally · ${new Date().toLocaleString()}`, margin, 94);

  let y = 142;
  doc.setTextColor(18, 34, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Uploaded scan", margin, y);
  y += 12;

  const imageBoxW = 240;
  const imageBoxH = 185;
  doc.setFillColor(242, 246, 250);
  doc.roundedRect(margin, y, imageBoxW, imageBoxH, 8, 8, "F");
  const imageProps = doc.getImageProperties(imageData);
  const imageScale = Math.min((imageBoxW - 16) / imageProps.width, (imageBoxH - 16) / imageProps.height);
  const drawW = imageProps.width * imageScale;
  const drawH = imageProps.height * imageScale;
  doc.addImage(imageData, "JPEG", margin + (imageBoxW - drawW) / 2, y + (imageBoxH - drawH) / 2, drawW, drawH);

  const summaryX = margin + imageBoxW + 22;
  doc.setFillColor(247, 250, 253);
  doc.roundedRect(summaryX, y, contentWidth - imageBoxW - 22, imageBoxH, 8, 8, "F");
  doc.setTextColor(93, 111, 135);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("PREDICTED CLASS", summaryX + 15, y + 22);
  doc.setTextColor(19, 37, 59);
  doc.setFontSize(17);
  doc.text(result.prediction, summaryX + 15, y + 47);
  doc.setTextColor(93, 111, 135);
  doc.setFontSize(8);
  doc.text("MODEL CONFIDENCE", summaryX + 15, y + 70);
  doc.setTextColor(34, 150, 171);
  doc.setFontSize(18);
  doc.text(`${(result.confidence * 100).toFixed(2)}%`, summaryX + 15, y + 96);
  doc.setTextColor(93, 111, 135);
  doc.setFontSize(8);
  doc.text("MODEL", summaryX + 15, y + 120);
  doc.setTextColor(38, 55, 77);
  doc.setFontSize(9);
  doc.text("EfficientNetB0 · BrainInsight v2", summaryX + 15, y + 136);
  doc.setTextColor(93, 111, 135);
  doc.text("INPUT", summaryX + 15, y + 153);
  doc.setTextColor(38, 55, 77);
  doc.text("224 × 224 RGB", summaryX + 15, y + 169);

  y += imageBoxH + 30;
  doc.setTextColor(18, 34, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Disease classification probabilities", margin, y);
  y += 19;

  modelClasses.forEach((item, index) => {
    const value = probabilityFor(result, item);
    if (index % 2 === 0) {
      doc.setFillColor(247, 250, 252);
      doc.rect(margin, y - 13, contentWidth, 28, "F");
    }
    doc.setFillColor(34, 211, 238);
    doc.circle(margin + 7, y - 3, 3, "F");
    doc.setTextColor(44, 61, 82);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(item.shortName, margin + 18, y);

    const trackX = margin + 115;
    const trackW = contentWidth - 165;
    doc.setFillColor(226, 233, 241);
    doc.roundedRect(trackX, y - 8, trackW, 7, 3.5, 3.5, "F");
    doc.setFillColor(34, 170, 193);
    doc.roundedRect(trackX, y - 8, trackW * Math.max(0, Math.min(1, value)), 7, 3.5, 3.5, "F");
    doc.setTextColor(92, 108, 130);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`${(value * 100).toFixed(2)}%`, pageWidth - margin - 40, y, { align: "right" });
    y += 28;
  });

  const insight = diseaseInsights.find((item) => normalize(item.id) === normalize(result.prediction) || normalize(item.title) === normalize(result.prediction));
  y += 9;
  doc.setTextColor(18, 34, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Result context", margin, y);
  y += 17;
  doc.setTextColor(66, 81, 101);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (insight) {
    y = addWrappedText(doc, insight.summary, margin, y, contentWidth, 13);
    y += 4;
    y = addWrappedText(doc, insight.mriContext, margin, y, contentWidth, 13);
  } else {
    y = addWrappedText(doc, "The displayed class is the model's highest-probability label for this uploaded image.", margin, y, contentWidth, 13);
  }

  y += 12;
  doc.setFillColor(255, 247, 232);
  doc.setDrawColor(241, 187, 101);
  const disclaimer = "Research use only. This AI-assisted result is not a medical diagnosis and should not replace assessment by a qualified healthcare professional. The confidence value describes the model output for this image, not clinical certainty.";
  const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth - 28) as string[];
  const disclaimerH = Math.max(58, 30 + disclaimerLines.length * 11);
  doc.roundedRect(margin, y, contentWidth, disclaimerH, 8, 8, "FD");
  doc.setTextColor(104, 68, 27);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Important limitation", margin + 14, y + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(disclaimerLines, margin + 14, y + 33);

  y += disclaimerH + 22;
  doc.setTextColor(105, 121, 141);
  doc.setFontSize(8);
  doc.text(`File: ${file.name}`, margin, y);
  doc.text(`Dataset evaluation reference: ${(notebookFacts.testAccuracy * 100).toFixed(2)}% held-out test accuracy`, margin, y + 13);
  doc.text("The held-out test metric is not a guarantee for this individual scan.", margin, y + 26);

  doc.setDrawColor(218, 226, 235);
  doc.line(margin, pageHeight - 48, pageWidth - margin, pageHeight - 48);
  doc.setTextColor(111, 126, 145);
  doc.setFontSize(7.5);
  doc.text("BrainInsight · Local inference report · Educational research prototype", margin, pageHeight - 31);

  const base = safeFilename(file.name.replace(/\.[^.]+$/, "")) || "scan";
  doc.save(`BrainInsight_Scan_Report_${base}.pdf`);
}

export async function downloadEvaluationReport() {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 44;
  const contentWidth = pageWidth - margin * 2;

  doc.setFillColor(12, 18, 31);
  doc.rect(0, 0, pageWidth, 126, "F");
  doc.setTextColor(34, 211, 238);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("BRAININSIGHT  /  RESEARCH EVALUATION", margin, 38);
  doc.setTextColor(244, 248, 255);
  doc.setFontSize(25);
  doc.text("Model evaluation summary", margin, 73);
  doc.setTextColor(169, 184, 206);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Source: user-supplied Colab notebook · ${new Date().toLocaleDateString()}`, margin, 98);

  let y = 151;
  doc.setFillColor(255, 246, 229);
  doc.setDrawColor(245, 181, 83);
  doc.roundedRect(margin, y, contentWidth, 54, 8, 8, "FD");
  doc.setTextColor(105, 65, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Important limitation", margin + 14, y + 19);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  addWrappedText(doc, "This report summarizes notebook test-set results only. No individual MRI was analyzed and no diagnosis or scan-specific confidence score was generated. These results are not clinical validation.", margin + 14, y + 35, contentWidth - 28, 11);

  y += 80;
  doc.setTextColor(16, 27, 45);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Held-out test set", margin, y);
  y += 15;

  const cards = [
    { label: "TEST ACCURACY", value: `${(notebookFacts.testAccuracy * 100).toFixed(2)}%` },
    { label: "TEST IMAGES", value: notebookFacts.testImages.toLocaleString() },
    { label: "TEST LOSS", value: notebookFacts.testLoss.toFixed(4) },
  ];
  const gap = 10;
  const cardWidth = (contentWidth - gap * 2) / 3;
  cards.forEach((card, index) => {
    const x = margin + index * (cardWidth + gap);
    doc.setFillColor(240, 246, 251);
    doc.roundedRect(x, y, cardWidth, 53, 7, 7, "F");
    doc.setTextColor(97, 115, 139);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(card.label, x + 12, y + 18);
    doc.setTextColor(18, 34, 55);
    doc.setFontSize(17);
    doc.text(card.value, x + 12, y + 41);
  });

  y += 78;
  doc.setTextColor(16, 27, 45);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Per-class test performance", margin, y);
  y += 20;
  const columns = [margin, margin + 182, margin + 265, margin + 348, margin + 431];
  doc.setFillColor(20, 34, 54);
  doc.rect(margin, y - 13, contentWidth, 22, "F");
  doc.setTextColor(245, 248, 252);
  doc.setFontSize(8);
  ["CLASS", "PRECISION", "RECALL", "F1", "SUPPORT"].forEach((label, index) => doc.text(label, columns[index], y));
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(36, 51, 71);
  doc.setFontSize(9);
  modelClasses.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(246, 249, 252);
      doc.rect(margin, y - 12, contentWidth, 21, "F");
    }
    doc.text(item.shortName, columns[0], y);
    doc.text(item.precision.toFixed(4), columns[1], y);
    doc.text(item.recall.toFixed(4), columns[2], y);
    doc.text(item.f1.toFixed(4), columns[3], y);
    doc.text(String(item.count), columns[4], y);
    y += 21;
  });

  y += 10;
  doc.setTextColor(16, 27, 45);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Notebook methodology", margin, y);
  y += 16;
  doc.setTextColor(54, 69, 89);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  y = addWrappedText(doc, `Architecture: ${notebookFacts.architecture}. Input: ${notebookFacts.inputSize}, ${notebookFacts.inputChannels}. Dataset: ${notebookFacts.datasetImages.toLocaleString()} images; ${notebookFacts.split}. Training: ${notebookFacts.epochs} epochs, ${notebookFacts.optimizer}, sparse categorical cross-entropy; augmentation was applied to training data only.`, margin, y, contentWidth, 13);
  y += 7;
  y = addWrappedText(doc, "Class-level figures are reported from the notebook’s classification report. The model checkpoint was not included with the notebook upload, so this report contains no individual prediction.", margin, y, contentWidth, 13);

  y = Math.min(y + 18, pageHeight - 58);
  doc.setDrawColor(217, 226, 236);
  doc.line(margin, y, pageWidth - margin, y);
  doc.setTextColor(98, 114, 135);
  doc.setFontSize(8);
  doc.text("Educational research summary only · Not for diagnosis, treatment decisions, or clinical use", margin, y + 16);
  doc.addPage();
  doc.setFillColor(12, 18, 31);
  doc.rect(0, 0, pageWidth, 106, "F");
  doc.setTextColor(34, 211, 238);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("BRAININSIGHT  /  EDUCATIONAL CONTEXT", margin, 38);
  doc.setTextColor(244, 248, 255);
  doc.setFontSize(22);
  doc.text("Five dataset categories", margin, 72);

  y = 128;
  diseaseInsights.forEach((item, index) => {
    const cardHeight = 111;
    doc.setFillColor(index % 2 === 0 ? 243 : 248, index % 2 === 0 ? 247 : 250, 252);
    doc.roundedRect(margin, y, contentWidth, cardHeight, 7, 7, "F");
    doc.setTextColor(22, 38, 58);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(item.title, margin + 13, y + 19);
    doc.setTextColor(66, 81, 101);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    let cardY = addWrappedText(doc, item.summary, margin + 13, y + 36, contentWidth - 26, 10);
    cardY = addWrappedText(doc, `MRI context: ${item.mriContext}`, margin + 13, cardY + 2, contentWidth - 26, 10);
    doc.setTextColor(42, 130, 145);
    doc.setFontSize(7);
    const sourceLabel = item.sourceTitle.length > 94 ? `${item.sourceTitle.slice(0, 91)}…` : item.sourceTitle;
    if (item.sourceUrl) doc.textWithLink(`Source: ${sourceLabel}`, margin + 13, y + cardHeight - 8, { url: item.sourceUrl });
    else doc.text(`Source: ${sourceLabel}`, margin + 13, y + cardHeight - 8);
    y += cardHeight + 7;
  });
  doc.setTextColor(93, 108, 128);
  doc.setFontSize(8);
  doc.text("Educational context only. A dataset label or image model cannot confirm or rule out a condition.", margin, pageHeight - 25);
  doc.save("BrainInsight-model-evaluation.pdf");
}
