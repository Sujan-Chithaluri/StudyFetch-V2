// components/chat/ChatInterface.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import MessageInput from "./MessageInput";
import { usePdfViewer } from "@/hooks/contexts/PdfViewerContext";

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
};

export default function ChatInterface({
  sessionId,
  initialMessages,
  className = "",
}: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Replace temp message with actual message from server
      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== tempUserMessage.id)
          .concat(data.userMessage)
      );

      // Add AI response
      setMessages((prev) => [...prev, data.aiMessage]);
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

  const { pdfViewerRef } = usePdfViewer();

  useEffect(() => {
    // Scroll to the first page when component mounts
    pdfViewerRef?.current?.gotoPage(3, { blink: true });
  }, [messages]);

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
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div
                    className={`text-xs mt-1 ${
                      message.isUserMessage ? "text-blue-200" : "text-gray-500"
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
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
