// components/ui/tutor/PdfViewer.tsx
import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  forwardRef,
  useState,
  useCallback,
} from "react";
import { usePdfStore } from "@/hooks/stores/PdfStore";
import PdfControls from "./PdfControls";
// import html2pdf from "html2pdf.js";

export interface ParsedPDFViewerHandle {
  gotoPage: (page: number, blink?: boolean) => void;
  highlight: (term: string, page?: number) => void;
  scrollToPosition: (
    page: number,
    term: string,
    style: "highlight" | "search" | "citation"
  ) => void;
  processNewAnnotations: (
    annotations: Array<{ page: number; term?: string; annotation?: string }>
  ) => void;
}

interface ParsedPDFViewerProps {
  gotoPage?: number;
  shouldBlink?: boolean;
  highlightTerm?: string;
  highlightStyle?: "red-circle" | "underline";
  searchStyle?: "bg-yellow" | "bg-green";
  matchCase?: boolean;
  fullWord?: boolean;
}

interface AnnotationItem {
  page: number;
  text: string;
}

interface TypingState {
  page: number;
  text: string;
  currentText: string;
  isTyping: boolean;
}

interface HighlightState {
  page: number;
  term: string;
}

const ParsedPDFViewer = forwardRef<ParsedPDFViewerHandle, ParsedPDFViewerProps>(
  (
    {
      gotoPage: initialGotoPage,
      shouldBlink = true,
      highlightTerm = "",
      highlightStyle = "red-circle",
      searchStyle = "bg-yellow",
      matchCase = false,
      fullWord = false,
    },
    ref
  ) => {
    // State management
    const { pdfText, pdfAnnotations } = usePdfStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [scale, setScale] = useState(1.0);

    // Search state
    const [searchState, setSearchState] = useState({
      query: "",
      matches: [] as number[],
      currentIndex: 0,
    });

    // Annotation state
    const [pageAnnotations, setPageAnnotations] = useState<
      Record<number, string[]>
    >(pdfAnnotations || {});

    const [activeHighlight, setActiveHighlight] =
      useState<HighlightState | null>(null);
    const [hStyle, setHStyle] = useState<"highlight" | "search" | "citation">(
      "highlight"
    );
    const [typingAnnotation, setTypingAnnotation] =
      useState<TypingState | null>(null);
    const [annotationQueue, setAnnotationQueue] = useState<AnnotationItem[]>(
      []
    );

    // Memoized utility functions
    const zoomIn = useCallback(() => {
      setScale((prevScale) => Math.min(prevScale + 0.2, 3));
    }, []);

    const zoomOut = useCallback(() => {
      setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
    }, []);

    const scrollToPage = useCallback((index: number, blink = false) => {
      const el = document.getElementById(`chunk-${index}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        if (blink) {
          el.classList.add("bg-blue-200");
          setTimeout(() => el.classList.remove("bg-blue-200"), 3000);
        }
        setCurrentPage(index);
      }
    }, []);

    const scrollToAnnotation = useCallback((index: number, blink = false) => {
      const el = document.getElementById(`chunk-${index}-annotations`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        if (blink) {
          el.classList.add("bg-blue-200");
          setTimeout(() => el.classList.remove("bg-blue-200"), 3000);
        }
        setCurrentPage(index);
      }
    }, []);

    const addAnnotation = useCallback((page: number, text: string) => {
      setPageAnnotations((prev) => {
        const pageAnnos = prev[page] || [];
        if (!pageAnnos.includes(text)) {
          return {
            ...prev,
            [page]: [...pageAnnos, text],
          };
        }
        return prev;
      });
    }, []);

    // Core functionality
    const scrollToPosition = useCallback(
      (
        page: number,
        term: string,
        style: "highlight" | "search" | "citation"
      ) => {
        scrollToPage(page, true);
        setActiveHighlight({ page, term });
        setHStyle(style);
      },
      [scrollToPage, activeHighlight, hStyle]
    );

    const processNewAnnotations = useCallback(
      (
        citations: Array<{ page: number; term: string; annotation?: string }>
      ) => {
        const newAnnotations = citations
          .filter((c) => c.annotation)
          .filter((c) => {
            const pageAnno = pageAnnotations[c.page] || [];
            return !pageAnno.includes(c.annotation as string);
          })
          .map((c) => ({ page: c.page, text: c.annotation as string }));

        if (newAnnotations.length > 0) {
          setAnnotationQueue((prev) => [...prev, ...newAnnotations]);
        }
      },
      [pageAnnotations]
    );

    const handleSearch = useCallback((term: string) => {
      if (!term.trim()) {
        setSearchState({ query: "", matches: [], currentIndex: 0 });
        return;
      }

      setSearchState((prev) => ({ ...prev, query: term }));
    }, []);

    const handleExport = useCallback(() => {
      const el = document.getElementById("pdf-content");
      if (el) {
        // html2pdf().set({ filename: "exported.pdf" }).from(el).save();
      }
    }, []);

    const goToNextMatch = useCallback(() => {
      const { matches, currentIndex } = searchState;
      if (matches.length > 0) {
        const next = (currentIndex + 1) % matches.length;
        scrollToPage(matches[next], true);
        setSearchState((prev) => ({ ...prev, currentIndex: next }));
      }
    }, [searchState, scrollToPage]);

    const goToPrevMatch = useCallback(() => {
      const { matches, currentIndex } = searchState;
      if (matches.length > 0) {
        const prev = (currentIndex - 1 + matches.length) % matches.length;
        scrollToPage(matches[prev], true);
        setSearchState((prev) => ({ ...prev, currentIndex: prev }));
      }
    }, [searchState, scrollToPage]);

    // Text highlighting
    const highlightText = useCallback(
      (
        text: string,
        term: string,
        style: "highlight" | "search" | "citation",
        isActive = false
      ) => {
        if (typeof text !== "string" || !term) return text;

        // Case insensitive search
        const regex = new RegExp(`(${term})`, "gi");

        // For both single words and phrases
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
          // Add text before the match
          if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
          }

          // Determine styling based on the style parameter
          let className = "";
          if (style === "highlight") {
            className = "relative inline-block";
          } else if (style === "search") {
            className = "bg-yellow-300 text-black px-1 rounded";
          } else if (style === "citation") {
            className = isActive
              ? "bg-blue-500 text-white px-1 rounded animate-pulse"
              : "bg-blue-300 text-black px-1 rounded animate-pulse";
          }

          // Add the highlighted match with appropriate styling
          parts.push(
            <span key={`match-${match.index}`} className={className}>
              {match[0]}
              {style === "highlight" && highlightStyle === "red-circle" && (
                <span className="absolute -inset-1 border-2 border-red-500 rounded-full pointer-events-none"></span>
              )}
            </span>
          );

          lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < text.length) {
          parts.push(text.substring(lastIndex));
        }

        return parts.length > 1 ? parts : text;
      },
      [highlightStyle]
    );

    const renderPageContent = useCallback(
      (text: string, index: number) => {
        let processedText = text;
        const isActivePage = activeHighlight && activeHighlight.page === index;

        // Create an array to hold all the highlighted elements
        let elements: React.ReactNode = processedText;

        // Apply highlights in order of priority
        if (activeHighlight) {
          elements = highlightText(
            typeof elements === "string" ? elements : text,
            activeHighlight.term,
            hStyle,
            true
          );
        }

        if (highlightTerm) {
          elements = highlightText(
            typeof elements === "string" ? elements : text,
            highlightTerm,
            hStyle
          );
        }

        if (searchState.query) {
          elements = highlightText(
            typeof elements === "string" ? elements : text,
            searchState.query,
            "search"
          );
        }

        return elements;
      },
      [activeHighlight, highlightTerm, searchState.query, highlightText, hStyle]
    );

    // Effects
    // Handle initial page navigation
    useEffect(() => {
      if (initialGotoPage !== undefined)
        scrollToPage(initialGotoPage, shouldBlink);
    }, [initialGotoPage, shouldBlink, scrollToPage]);

    // Process search query
    useEffect(() => {
      if (!searchState.query) return;

      const matches = pdfText.reduce((acc: number[], text, i) => {
        if (text.toLowerCase().includes(searchState.query.toLowerCase())) {
          acc.push(i);
        }
        return acc;
      }, []);

      setSearchState((prev) => ({ ...prev, matches, currentIndex: 0 }));

      if (matches.length > 0) {
        scrollToPage(matches[0], true);
      }
    }, [searchState.query, pdfText, scrollToPage]);

    // Process annotation queue
    useEffect(() => {
      if (annotationQueue.length > 0 && !typingAnnotation) {
        const nextAnnotation = annotationQueue[0];
        setTypingAnnotation({
          page: nextAnnotation.page,
          text: nextAnnotation.text,
          currentText: "",
          isTyping: true,
        });
        setAnnotationQueue((prev) => prev.slice(1));
        scrollToAnnotation(nextAnnotation.page, true);
      }
    }, [annotationQueue, typingAnnotation, scrollToPage]);

    // Handle typing animation
    useEffect(() => {
      if (!typingAnnotation?.isTyping) return;

      const { page, text, currentText } = typingAnnotation;

      if (currentText.length < text.length) {
        const timer = setTimeout(() => {
          setTypingAnnotation((prev) =>
            prev
              ? {
                  ...prev,
                  currentText: text.substring(0, currentText.length + 1),
                }
              : null
          );
        }, 30);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          addAnnotation(page, text);
          setTypingAnnotation(null);
        }, 500);
        return () => clearTimeout(timer);
      }
    }, [typingAnnotation, addAnnotation]);

    useEffect(() => {
      if (pdfAnnotations && Object.keys(pdfAnnotations).length > 0) {
        setPageAnnotations(pdfAnnotations);
      }
    }, [pdfAnnotations]);

    // Setup intersection observer
    useEffect(() => {
      if (!pdfText.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.id;
              if (id.startsWith("chunk-")) {
                const pageIndex = parseInt(id.replace("chunk-", ""), 10);
                setCurrentPage(pageIndex);
              }
            }
          });
        },
        { threshold: 0.1 }
      );

      pdfText.forEach((_, index) => {
        const element = document.getElementById(`chunk-${index}`);
        if (element) observer.observe(element);
      });

      return () => observer.disconnect();
    }, [pdfText.length]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        gotoPage: scrollToPage,
        highlight: handleSearch,
        scrollToPosition,
        processNewAnnotations,
      }),
      [scrollToPage, handleSearch, scrollToPosition, processNewAnnotations]
    );

    // Render
    return (
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="sticky top-0 z-0 bg-white border-b border-gray-200 shadow-sm">
          <PdfControls
            currentPage={currentPage}
            totalPages={pdfText.length}
            onPageChange={(page) => scrollToPage(page, false)}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onSearch={handleSearch}
            onNextMatch={goToNextMatch}
            onPrevMatch={goToPrevMatch}
            onExport={handleExport}
            scale={scale}
            searchMatches={searchState.matches.length}
            currentMatch={searchState.currentIndex}
          />
        </div>

        {/* Viewer */}
        <div
          id="pdf-content"
          ref={containerRef}
          className="p-6 overflow-y-auto flex-1"
        >
          {pdfText.length > 0 ? (
            pdfText.map((text, index) => (
              <div key={index} className="mb-6">
                <pre
                  id={`chunk-${index}`}
                  className="whitespace-pre-line text-gray-800 leading-relaxed rounded p-4"
                  style={{
                    fontSize: `${scale}rem`,
                    transformOrigin: "top left",
                  }}
                >
                  <span className="text-gray-400">[Page {index + 1}]</span>
                  <br />
                  {renderPageContent(text, index)}

                  {/* Annotations */}
                  <div id={`chunk-${index}-annotations`}>
                    {(pageAnnotations[index]?.length > 0 ||
                      (typingAnnotation?.page === index &&
                        typingAnnotation?.isTyping)) && (
                      <div className="mt-4 pt-2 border-t border-gray-700">
                        <span className="text-gray-400">Annotations:</span>
                        <ul className="list-disc pl-5 mt-1">
                          {pageAnnotations[index]?.map((anno, i) => (
                            <li key={i} className="text-red-800">
                              {anno}
                            </li>
                          ))}
                          {typingAnnotation?.page === index &&
                            typingAnnotation?.isTyping && (
                              <li className="text-red-800">
                                {typingAnnotation.currentText}
                                <span className="animate-pulse">|</span>
                              </li>
                            )}
                        </ul>
                      </div>
                    )}
                  </div>
                </pre>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              No PDF loaded. Please upload a PDF file.
            </div>
          )}
        </div>
      </div>
    );
  }
);

ParsedPDFViewer.displayName = "ParsedPDFViewer";

export default ParsedPDFViewer;
