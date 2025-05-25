// components/document/DocumentViewer.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import react-pdf to avoid SSR issues
const PDFViewer = dynamic(
  () => import("./PDFViewer"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }
);

type DocumentViewerProps = {
  document: {
    fileUrl: string;
    fileName: string;
  };
  className?: string;
};

export default function DocumentViewer({ document, className = "" }: DocumentViewerProps) {
  return (
    <div className={`flex flex-col ${className}`}>
        <PDFViewer document={document} />
    </div>
  );
}
