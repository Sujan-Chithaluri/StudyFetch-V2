// components/document/DocumentViewer.tsx
"use client";

import { useState, lazy, Suspense } from "react";
import ParsedPDFViewer from "./ParsedPDFViewer";
import { usePdfViewer } from "@/hooks/contexts/PdfViewerContext";

const ActualPDFViewer = lazy(() => import("./ActualPDFViewer"));

type DocumentViewerProps = {
  document: {
    fileUrl: string;
    fileName: string;
    content: any;
  };
  className?: string;
  showParsed?: boolean;
};

export default function DocumentViewer({
  document,
  className = "",
  showParsed = true,
}: DocumentViewerProps) {
  const { pdfViewerRef } = usePdfViewer();
  
  return (
    <div className={`flex flex-col ${className}`}>
      {showParsed ? (
        <ParsedPDFViewer ref={pdfViewerRef} />
      ) : (
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          }
        >
          <ActualPDFViewer document={document} />
        </Suspense>
      )}
    </div>
  );
}
