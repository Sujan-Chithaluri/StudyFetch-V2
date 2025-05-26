// components/ui/PageLink.tsx
import { usePdfViewer } from "@/hooks/contexts/PdfViewerContext";

export function PageLink({ pageNumber }: { pageNumber: number }) {
  const { pdfViewerRef } = usePdfViewer();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pdfViewerRef?.current) {
      pdfViewerRef.current.gotoPage(pageNumber - 1, { blink: true });
    }
  };
  
  return (
    <a 
      href={`#page-${pageNumber}`}
      onClick={handleClick}
      className="text-blue-600 hover:underline"
    >
      page {pageNumber}
    </a>
  );
}
