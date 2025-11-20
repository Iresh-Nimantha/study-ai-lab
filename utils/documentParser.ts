// utils/documentParser.ts
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Handle ESM default
const pdfjs: any = (pdfjsLib as any).default || pdfjsLib;

// Keep worker version in sync with installed pdfjs-dist version to avoid UnknownErrorException [web:46][web:56]
const workerVersion = (pdfjs as any).version || "3.11.174";
if (pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${workerVersion}/pdf.worker.min.js`;
}

export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  // Early guards to avoid parse traps [web:46]
  if (!file || file.size === 0) {
    throw new Error("The file is empty or unreadable.");
  }

  try {
    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      return await extractTextFromPDF(file);
    } else if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      return await extractTextFromDOCX(file);
    } else if (fileType === "text/plain" || fileName.endsWith(".txt")) {
      return await file.text();
    } else {
      throw new Error(
        "Unsupported file type. Please upload PDF, DOCX, or TXT."
      );
    }
  } catch (error) {
    console.error("File extraction error:", error);
    throw new Error(
      "Failed to extract text from file. " +
        (error instanceof Error ? error.message : "")
    );
  }
};

class CorruptPdfError extends Error {
  constructor(msg = "This PDF seems corrupted or not standards-compliant.") {
    super(msg);
    this.name = "CorruptPdfError";
  }
}

const extractTextFromPDF = async (file: File): Promise<string> => {
  // Strategy: try ArrayBuffer -> fallback to Blob URL if needed [web:56]
  const arrayBuffer = await file.arrayBuffer();

  // Attempt 1: parse from data buffer
  try {
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = (textContent.items as any[])
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  } catch (err1) {
    console.warn(
      "PDF parse from ArrayBuffer failed; retrying via Blob URL",
      err1
    );
  }

  // Attempt 2: Blob URL load (helps with some xref/trailer quirks) [web:56]
  try {
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    try {
      const loadingTask2 = pdfjs.getDocument(url);
      const pdf2 = await loadingTask2.promise;
      let fullText2 = "";
      for (let i = 1; i <= pdf2.numPages; i++) {
        const page = await pdf2.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = (textContent.items as any[])
          .map((item: any) => item.str)
          .join(" ");
        fullText2 += pageText + "\n";
      }
      return fullText2;
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch (err2) {
    console.error("PDF Parsing Error details:", err2);
    // Likely worker/API mismatch or corrupted xref/trailer; surface a clear cause [web:46][web:56]
    throw new CorruptPdfError(
      "Could not parse PDF. Re-export the document as a standard PDF and try again."
    );
  }
};

const extractTextFromDOCX = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const mammothLib: any = (mammoth as any).default || mammoth;

  if (!mammothLib.extractRawText) {
    throw new Error("Mammoth library not loaded correctly.");
  }

  const result = await mammothLib.extractRawText({ arrayBuffer });
  return result.value || "";
};
