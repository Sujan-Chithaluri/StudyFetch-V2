// lib/pdf-parser.ts
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import workerSrc from "pdfjs-dist/legacy/build/pdf.worker.entry";

// Set worker source
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerSrc;

export async function parsePDF(file: File) {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const typedarray = new Uint8Array(arrayBuffer);
    const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
    const numPages = pdf.numPages;
    
    // Parse structure
    const pages = [];
    const allText: string[] = [];
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Get page dimensions
      const viewport = page.getViewport({ scale: 1.0 });
      
      // Group text by lines for better readability
      const linesMap: Record<number, string[]> = {};
      for (const item of textContent.items as any[]) {
        const y = Math.floor(item.transform[5]);
        if (!linesMap[y]) linesMap[y] = [];
        linesMap[y].push(item.str);
      }
      
      // Sort lines from top to bottom
      const sortedLines = Object.keys(linesMap)
        .sort((a, b) => +b - +a)
        .map((y) => linesMap[+y].join(" "));
      
      const pageText = sortedLines.join("\n");
      allText.push(pageText);
      
      pages.push({
        pageNumber: pageNum,
        width: viewport.width,
        height: viewport.height,
        text: pageText
      });
    }
    
    return {
      pages,
      totalPages: numPages,
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}
