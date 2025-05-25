// components/document/DocumentViewer.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import ParsedPDFViewer from "./ParsedPDFViewer";

// Dynamically import react-pdf to avoid SSR issues
const ActualPDFViewer = dynamic(() => import("./ActualPDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  ),
});

type DocumentViewerProps = {
  document: {
    fileUrl: string;
    fileName: string;
    content: JSON;
  };
  className?: string;
  showParsed?: boolean;
};

export default function DocumentViewer({
  document,
  className = "",
  showParsed = true,
}: DocumentViewerProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      {showParsed ? (
        <ParsedPDFViewer />
      ) : (
        <ActualPDFViewer document={document} />
      )}{" "}
    </div>
  );
}
