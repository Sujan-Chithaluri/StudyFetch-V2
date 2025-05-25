// components/document/PDFViewer.tsx
"use client";

type PDFViewerProps = {
  document: {
    fileUrl: string;
    fileName: string;
  };
};

export default function PDFViewer({ document }: PDFViewerProps) {

  return (
    <div className="w-full h-screen bg-gray-100">
      <iframe
        src={document.fileUrl}
        className="w-full h-full border"
        title={`PDF Viewer - ${document.fileName}`}
      ></iframe>
    </div>
  );
}
