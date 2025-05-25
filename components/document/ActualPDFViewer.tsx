// components/document/PDFViewer.tsx
"use client";

type ActualPDFViewerProps = {
  document: {
    fileUrl: string;
    fileName: string;
  };
};

export default function ActualPDFViewer({ document }: ActualPDFViewerProps) {

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
