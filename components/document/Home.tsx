import dynamic from "next/dynamic";
import { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import workerSrc from "pdfjs-dist/legacy/build/pdf.worker.entry";
import { usePdfStore } from "./pdfStore";
import { PdfViewerHandle } from "./PdfViewer";

const PdfViewer = dynamic(() => import("./PdfViewer"), {
  ssr: false,
});

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerSrc;

export default function Home() {
  const { setPdfText } = usePdfStore();
  const [gotoPage, setGotoPage] = useState<number | undefined>(undefined);
  const [highlightTerm, setHighlightTerm] = useState<string>("");
  const [shouldBlink, setShouldBlink] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [citations, setCitations] = useState<
    Array<{ page: number; term: string; annotation?: string }>
  >([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversation, setConversation] = useState<
    Array<{
      role: "user" | "assistant";
      content: string;
      commands?: Array<{ type: string; value: string }>;
    }>
  >([]);
  const [waitingForUserResponse, setWaitingForUserResponse] = useState(false);

  const pdfViewerRef = useRef<PdfViewerHandle>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = async function () {
      const typedarray = new Uint8Array(this.result as ArrayBuffer);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      const maxPages = pdf.numPages;
      const allText: string[] = [];

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const linesMap: Record<number, string[]> = {};
        for (const item of textContent.items as any[]) {
          const y = Math.floor(item.transform[5]);
          if (!linesMap[y]) linesMap[y] = [];
          linesMap[y].push(item.str);
        }
        const sortedLines = Object.keys(linesMap)
          .sort((a, b) => +b - +a)
          .map((y) => linesMap[+y].join(" "));
        const pageText = sortedLines.join("\n");

        allText.push(pageText);
      }

      setPdfText(allText);
    };

    fileReader.readAsArrayBuffer(file);
  }

  const getMockAiResponse = (query: string, isFollowUp = false) => {
    // If this is a follow-up response to a user saying "yes"
    if (isFollowUp && query.toLowerCase().includes("yes")) {
      return {
        text: "Great! I'll show you the relevant section now. Look at the highlighted text on page 2 which explains the concept in detail.",
        commands: [
          { type: "gotoPage", value: "1" }, // 0-based index for page 2
          { type: "highlight", value: "agenda" },
        ],
        citations: [],
      };
    }

    // Initial responses that ask if user wants to see the relevant section
    const responses = [
      {
        text: `To answer your question about "${query}":

1. On page[1], the document explains that "${query}" relates to advanced data processing techniques.
2. Page[4] provides examples of how "data" analysis is applied in real-world scenarios.
3. The key findings suggest that these approaches improve efficiency by 30%.

Would you like me to show you the relevant section?`,
        citations: [
          {
            page: 0,
            term: "advanced data processing",
            annotation:
              "Advanced data processing involves using algorithms to transform raw information into actionable insights.",
          },
          {
            page: 3,
            term: "data",
            annotation:
              "The document presents case studies showing how data analysis led to 30% efficiency improvements.",
          },
        ],
        askForConfirmation: true,
      },
      {
        text: `Regarding "${query}":

1. Page[2] describes the "machine learning" framework used in the study.
2. On page[3], the document details how "algorithms" were optimized for performance.
3. The conclusion on page[5] summarizes the key benefits of this approach.

Would you like me to highlight the machine learning section for you?`,
        citations: [
          {
            page: 0,
            term: "agenda",
            annotation:
              "The machine learning framework combines supervised and unsupervised techniques.",
          },
          {
            page: 2,
            term: "Assignment",
            annotation:
              "The document compares three algorithm implementations with different performance characteristics.",
          },
        ],
        askForConfirmation: true,
      },
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleAskQuestion = () => {
    if (!query.trim()) return;

    // Add user message to conversation
    const userMessage = { role: "user" as const, content: query };
    setConversation((prev) => [...prev, userMessage]);

    setIsLoading(true);

    // Check if this is a response to a previous question
    const isFollowUp = waitingForUserResponse;

    // Simulate API call delay
    setTimeout(() => {
      const response = getMockAiResponse(query, isFollowUp);
      setAiResponse(response.text);
      setCitations(response.citations || []);

      // Add AI response to conversation
      const aiMessage = {
        role: "assistant" as const,
        content: response.text,
        commands: response.commands,
      };
      setConversation((prev) => [...prev, aiMessage]);

      // If there are commands, execute them
      if (response.commands) {
        response.commands.forEach((cmd) => {
          if (cmd.type === "gotoPage" && pdfViewerRef.current) {
            const page = parseInt(cmd.value, 10);
            setGotoPage(page);
            pdfViewerRef.current.gotoPage(page, { blink: true });
          } else if (cmd.type === "highlight") {
            setHighlightTerm(cmd.value);
          }
        });
      }

      // Process annotations
      if (response.citations && pdfViewerRef.current) {
        pdfViewerRef.current.processNewAnnotations(response.citations);
      }

      // Set waiting state if the response asks for confirmation
      setWaitingForUserResponse(!!response.askForConfirmation);

      setIsLoading(false);
      setQuery(""); // Clear input for next message
    }, 1000);
  };

  const handleCitationClick = (
    page: number,
    term: string,
    annotation?: string
  ) => {
    if (pdfViewerRef.current) {
      pdfViewerRef.current.scrollToPosition(page, term, annotation);
    }
  };

  const handleUserResponse = (response: string) => {
    setQuery(response);
    handleAskQuestion();
  };

  const formatAiResponse = (text: string) => {
    let result = text;

    // Replace citation terms with clickable spans
    citations.forEach((citation) => {
      const regex = new RegExp(`"(${citation.term})"`, "gi");
      result = result.replace(regex, (match) => {
        return `<span class="citation" data-page="${citation.page}" data-term="${citation.term}">${match}</span>`;
      });
    });

    // Make page references clickable
    const pageRegex = /page\[(\d+)\]/gi;
    result = result.replace(pageRegex, (match, pageNum) => {
      const zeroBasedPage = parseInt(pageNum, 10) - 1;
      return `<span class="page-reference" data-page="${zeroBasedPage}">${match}</span>`;
    });

    // Format numbered lists for better readability
    result = result.replace(/(\d+\.\s.*?)(?=\n\d+\.|$)/gs, (match) => {
      return `<div class="list-item">${match}</div>`;
    });

    return result;
  };

  const handleResponseClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("citation")) {
      const page = parseInt(target.getAttribute("data-page") || "0", 10);
      const term = target.getAttribute("data-term") || "";
      const annotation = citations.find(
        (c) => c.page === page && c.term === term
      )?.annotation;
      handleCitationClick(page, term, annotation);
    } else if (target.classList.contains("page-reference")) {
      const page = parseInt(target.getAttribute("data-page") || "0", 10);
      if (pdfViewerRef.current) {
        pdfViewerRef.current.gotoPage(page, { blink: true });
      }
    }
  };

  const renderConversation = () => {
    if (conversation.length === 0) return null;

    return (
      <div className="mt-4 space-y-4">
        {conversation.map((message, index) => (
          <div key={index} className="mb-4">
            {message.role === "user" ? (
              <div className="flex items-start mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                  <span className="text-white font-bold">U</span>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg max-w-[90%]">
                  {message.content}
                </div>
              </div>
            ) : (
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                  <span className="text-white font-bold">AI</span>
                </div>
                <div className="flex-1">
                  <div
                    className="bg-gray-800 p-4 rounded shadow-lg border border-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: formatAiResponse(message.content),
                    }}
                    onClick={handleResponseClick}
                  />

                  {message.commands && (
                    <div className="mt-2 text-xs text-gray-400">
                      <em>
                        AI performed actions:{" "}
                        {message.commands
                          .map((cmd) => `${cmd.type}="${cmd.value}"`)
                          .join(", ")}
                      </em>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {waitingForUserResponse && (
          <div className="flex justify-center gap-2 mt-2">
            <button
              onClick={() => handleUserResponse("Yes")}
              className="px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              Yes
            </button>
            <button
              onClick={() => handleUserResponse("No")}
              className="px-4 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
            >
              No
            </button>
          </div>
        )}
      </div>
    );
  };

  // Update the CSS styles
  const pageReferenceStyle = `
  .page-reference {
    color: #3b82f6;
    text-decoration: underline;
    cursor: pointer;
    font-weight: 500;
  }
  .page-reference:hover {
    color: #60a5fa;
  }
  .citation {
    background-color: rgba(59, 130, 246, 0.2);
    border-radius: 2px;
    padding: 0 2px;
    cursor: pointer;
    border-bottom: 1px dashed #3b82f6;
  }
  .citation:hover {
    background-color: rgba(59, 130, 246, 0.4);
  }
  .list-item {
    margin-bottom: 0.75rem;
    padding-left: 1rem;
  }
`;

  // Update the chat input area
  return (
    <>
      <style jsx>{pageReferenceStyle}</style>
      <div className="flex h-screen">
        <div className="w-1/3 p-4 bg-gray-900 text-white border-r border-gray-700 space-y-6 overflow-y-auto">
          <h2 className="text-xl font-bold">Upload PDF</h2>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer bg-gray-800 text-gray-200 rounded"
          />

          <div className="space-y-4">
            <div>
              <label className="block mb-1">Highlight term</label>
              <input
                type="text"
                placeholder="Enter text to highlight"
                value={highlightTerm}
                onChange={(e) => setHighlightTerm(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="blinkToggle"
                checked={shouldBlink}
                onChange={(e) => setShouldBlink(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="blinkToggle">Blink highlights</label>
            </div>

            <div>
              <label className="block mb-1">Go to page</label>
              <input
                type="number"
                min="1"
                placeholder="Page number"
                onChange={(e) => setGotoPage(Number(e.target.value) - 1)}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-700">
            <h2 className="text-xl font-bold mb-4">Ask AI</h2>

            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question about the document..."
                className="w-full px-4 py-3 bg-transparent border-none text-white resize-none focus:outline-none focus:ring-0"
                rows={3}
              />

              <div className="flex justify-between items-center px-4 py-2 bg-gray-850 border-t border-gray-700">
                <div className="text-xs text-gray-400">
                  Ask specific questions about the document
                </div>
                <button
                  onClick={handleAskQuestion}
                  disabled={isLoading || !query.trim()}
                  className="px-4 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm font-medium flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Thinking...
                    </>
                  ) : (
                    "Ask"
                  )}
                </button>
              </div>
            </div>

            {renderConversation()}

            <div className="mt-4 text-xs text-gray-400">
              <p>
                Click on citations or page references in the response to
                navigate the document.
              </p>
            </div>
          </div>
        </div>

        <div className="w-2/3">
          <PdfViewer
            ref={pdfViewerRef}
            gotoPage={gotoPage}
            shouldBlink={shouldBlink}
            highlightTerm={highlightTerm}
          />
        </div>
      </div>
    </>
  );
}
