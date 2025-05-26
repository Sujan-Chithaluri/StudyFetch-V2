// contexts/PdfViewerContext.tsx
"use client";

import { createContext, useContext, useRef, RefObject } from "react";
import { ParsedPDFViewerHandle } from "@/components/document/ParsedPDFViewer";

type PdfViewerContextType = {
  pdfViewerRef: RefObject<ParsedPDFViewerHandle | null>;
};

const PdfViewerContext = createContext<PdfViewerContextType | undefined>(undefined);

export function PdfViewerProvider({ children }: { children: React.ReactNode }) {
  const pdfViewerRef = useRef<ParsedPDFViewerHandle>(null);
  
  return (
    <PdfViewerContext.Provider value={{ pdfViewerRef }}>
      {children}
    </PdfViewerContext.Provider>
  );
}

export function usePdfViewer() {
  const context = useContext(PdfViewerContext);
  if (!context) {
    throw new Error("usePdfViewer must be used within a PdfViewerProvider");
  }
  return context;
}
