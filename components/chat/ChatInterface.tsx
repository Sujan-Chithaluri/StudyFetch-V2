// components/chat/ChatInterface.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import MessageInput from "./MessageInput";
import { usePdfViewer } from "@/hooks/contexts/PdfViewerContext";
import { Markdown } from "@/components/ui/Markdown";

type Message = {
  id: string;
  content: string;
  isUserMessage: boolean;
  createdAt: Date;
  userId: string;
};

type ChatInterfaceProps = {
  sessionId: string;
  initialMessages: Message[];
  className?: string;
  documentContent?: string;
};

export default function ChatInterface({
  sessionId,
  initialMessages,
  className = "",
  documentContent,
}: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { pdfViewerRef } = usePdfViewer();

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Process AI responses for page references and highlights
  const processAIResponse = (response: string) => {
    if (!pdfViewerRef?.current) return;

    // Look for page references like "On page 5..." or "[Page 5]"
    const pageRefs = response.match(/(?:on page|page|p\.)\s*(\d+)/gi);

    if (pageRefs && pageRefs.length > 0) {
      // Extract the page number from the first reference
      const pageMatch = pageRefs[0].match(/\d+/);
      if (pageMatch) {
        const pageNum = parseInt(pageMatch[0]) - 1; // Convert to 0-based index
        // Navigate to that page with a slight delay to ensure PDF is loaded
        setTimeout(() => {
          pdfViewerRef.current?.gotoPage(pageNum, true);
        }, 500);
      }
    }

    // Look for quoted text to highlight
    const quotes = response.match(/"([^"]+)"|'([^']+)'/g);
    if (quotes && quotes.length > 0) {
      // Extract the text to highlight from the first quote
      const textToHighlight = quotes[0].replace(/['"]/g, "");
      // Highlight the text with a slight delay
      setTimeout(() => {
        pdfViewerRef.current?.highlight(textToHighlight);
      }, 3000);
    }
  };

  const addNewAnnotationsToDb = async (
    annotations: { page: number; annotation: string }[]
  ) => {
    try {
      // Fetch the current session document
      const response = await fetch(`/api/sessions/${sessionId}`);
      const data = await response.json();
      const document = data.document;

      if (!document || !document.content) return;

      // Clone the document content
      const updatedContent = JSON.parse(JSON.stringify(document.content));

      annotations.forEach(({ page, annotation }) => {
        const pageIndex = updatedContent.pages.findIndex(
          (p: any) => p.pageNumber === page + 1
        );

        if (pageIndex !== -1) {
          if (!updatedContent.pages[pageIndex].annotations) {
            updatedContent.pages[pageIndex].annotations = [];
          }

          updatedContent.pages[pageIndex].annotations.push(annotation);
        }
      });

      await fetch(`/api/documents/${document.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: updatedContent }),
      });

      annotations.forEach(({ page, annotation }) => {
        if (pdfViewerRef.current?.processNewAnnotations) {
          pdfViewerRef.current.processNewAnnotations(annotations);
        }
      });
    } catch (error) {
      console.error("Error saving annotations:", error);
    }
  };

  const processCommands = (response: string) => {
    if (!pdfViewerRef?.current) return;

    // Extract commands section
    const commandsMatch = response.match(/commands:\s*([\s\S]+)$/);
    if (!commandsMatch || !commandsMatch[1]) return;

    const commandsText = commandsMatch[1].trim();
    let currentDelay = 0;

    // Process page command
    const pageMatch = commandsText.match(/\/page\/(\d+)/);
    if (pageMatch && pageMatch[1]) {
      const pageNum = parseInt(pageMatch[1]) - 1; // Convert to 0-based index
      setTimeout(() => {
        pdfViewerRef.current?.gotoPage(pageNum, true);
      }, 500);
      currentDelay = 1000;
    }

    const highlightMatches = Array.from(
      commandsText.matchAll(/\/highlight\/(\d+)\/([^\n"]+)/g)
    );
    if (highlightMatches.length > 0) {
      highlightMatches.forEach((match, index) => {
        const pageNum = parseInt(match[1]) - 1;
        const textToHighlight = match[2].trim();

        // Process each highlight with 5 seconds between them
        setTimeout(() => {
          console.log(
            `Highlighting: Page ${pageNum + 1}, Text: "${textToHighlight}"`
          );
          pdfViewerRef.current?.scrollToPosition(
            pageNum,
            textToHighlight,
            "highlight"
          );
        }, currentDelay + index * 5000); // 5 second delay between each highlight
      });

      // Update current delay for next command type
      currentDelay += highlightMatches.length * 5000;
    }

    // Process annotate commands
    const annotateMatches = Array.from(
      commandsText.matchAll(/\/annotate\/(\d+)\/([^\n]+)/g)
    );
    if (annotateMatches.length > 0) {
      const annotations = annotateMatches.map((match) => ({
        page: parseInt(match[1]) - 1,
        annotation: match[2].trim(),
      }));

      setTimeout(() => {
        addNewAnnotationsToDb(annotations);
      }, currentDelay + 1000);
    }
  };

  // Add this function to clean the response before displaying it
  const cleanAIResponse = (response: string): string => {
    // Remove commands section from the displayed message
    return response.replace(/\ncommands:[\s\S]+$/, "").trim();
  };

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!content.trim() || isLoading || !session) return;

    setIsLoading(true);

    // Optimistically add user message to UI
    const tempUserMessage = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      isUserMessage: true,
      createdAt: new Date(),
      userId: session.user.id,
    };

    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      // Send message to API
      const response = await fetch(`/api/chat/${sessionId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          files: files ? files.map((f) => f.name) : undefined,
          documentContent: documentContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(
          `Failed to send message: ${response.status} ${errorText}`
        );
      }

      const data = await response.json();

      // Replace temp message with actual message from server
      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== tempUserMessage.id)
          .concat(data.userMessage)
      );

      // Add AI response with cleaned content
      setMessages((prev) => [
        ...prev,
        {
          ...data.aiMessage,
          content: data.aiMessage.content,
        },
      ]);

      // Process the AI response for commands
      processCommands(data.aiMessage.content);
    } catch (error) {
      console.error("Error sending message:", error);
      // Show error in UI
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempUserMessage.id
            ? { ...msg, content: "Error sending message. Please try again." }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of the component...
  return (
    <div className={`flex flex-col ${className}`}>
      {messages.length === 0 ? (
        // Empty state with centered input
        <div className="flex flex-col flex-1 justify-center items-center p-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            Start a Conversation
          </h3>
          <p className="text-gray-500 text-center mb-8 max-w-md">
            Ask questions about the document to get personalized explanations
            from the AI tutor.
          </p>
          <div className="w-full max-w-md">
            <MessageInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder="Ask a question about the document..."
              showAttachments={false}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isUserMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.isUserMessage
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.isUserMessage ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <Markdown content={cleanAIResponse(message.content)} />
                  )}
                  <div
                    className={`text-xs mt-1 ${
                      message.isUserMessage ? "text-blue-200" : "text-gray-500"
                    } flex items-center`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}

                    {!message.isUserMessage &&
                      message.content.includes("commands:") && (
                        <button
                          onClick={() => {
                            const commandsEl = document.getElementById(
                              `commands-${message.id}`
                            );
                            if (commandsEl) {
                              commandsEl.style.display =
                                commandsEl.style.display === "none"
                                  ? "block"
                                  : "none";
                            }
                          }}
                          className="ml-2 text-gray-100 hover:text-blue-700 text-xs underline"
                        >
                          Commands
                        </button>
                      )}
                  </div>

                  {!message.isUserMessage &&
                    message.content.includes("commands:") && (
                      <div
                        id={`commands-${message.id}`}
                        className="mt-2 text-blue-500 italic"
                        style={{ display: "none" }}
                      >
                        {message.content
                          .match(/commands:\s*([\s\S]+)$/)?.[1]
                          ?.trim()
                          .split("\n")
                          .map((cmd, i) => (
                            <div key={i}>{cmd}</div>
                          ))}
                      </div>
                    )}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          <MessageInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Ask a question about the document..."
            showAttachments={false}
            className="pb-3"
          />
        </>
      )}
    </div>
  );
}
