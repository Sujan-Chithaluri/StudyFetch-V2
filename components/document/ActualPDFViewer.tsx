// components/document/ActualPDFViewer.tsx
"use client";

import { memo, useRef, useEffect } from "react";

type ActualPDFViewerProps = {
  document: {
    fileUrl: string;
    fileName: string;
  };
  className?: string;
};

const ActualPDFViewer = memo(function ActualPDFViewer({ 
  document,
  className = ""
}: ActualPDFViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadedUrlRef = useRef<string | null>(null);
  
  // Only reload the iframe if the URL changes
  useEffect(() => {
    if (iframeRef.current && loadedUrlRef.current !== document.fileUrl) {
      iframeRef.current.src = document.fileUrl;
      loadedUrlRef.current = document.fileUrl;
    }
  }, [document.fileUrl]);

  return (
    <div className={`w-full h-full bg-gray-100 ${className}`}>
      <iframe
        ref={iframeRef}
        className="w-full h-full border"
        title={`PDF Viewer - ${document.fileName}`}
        loading="lazy"
      ></iframe>
    </div>
  );
});

export default ActualPDFViewer;
