// components/tutor/TutorSessionLayout.tsx
"use client";

import DocumentViewer from "@/components/document/DocumentViewer";
import ChatInterface from "@/components/chat/ChatInterface";
import SessionSidebar from "@/components/layout/SessionSidebar";

type TutorSessionLayoutProps = {
  currentSession: any;
  surroundingSessions: any[];
  hasMoreBefore: boolean;
  hasMoreAfter: boolean;
  totalSessions: number;
  currentPosition: number;
};

export default function TutorSessionLayout({
  currentSession,
  surroundingSessions,
  hasMoreBefore,
  hasMoreAfter,
  totalSessions,
  currentPosition,
}: TutorSessionLayoutProps) {
  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col">
      {/* Sidebar */}
      <SessionSidebar
        surroundingSessions={surroundingSessions}
        sessionType="tutor"
        currentSessionId={currentSession.id}
        hasMoreBefore={hasMoreBefore}
        hasMoreAfter={hasMoreAfter}
        totalSessions={totalSessions}
        currentPosition={currentPosition}
      />
      
      {/* Header - Sticky below main header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
        <div className="px-16 py-3">
          <h1 className="text-xl font-semibold text-gray-800 truncate">
            {currentSession.title ||
              currentSession.document?.title ||
              "Untitled Session"}
          </h1>
        </div>
      </div>
      
      {/* Content area - Takes remaining height */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat interface */}
        <div className="w-1/2 overflow-hidden">
          <ChatInterface
            sessionId={currentSession.id}
            initialMessages={currentSession.messages}
            className="h-full"
          />
        </div>
        
        {/* PDF viewer */}
        <div className="w-1/2 border-l border-gray-200 overflow-hidden">
          {currentSession.document ? (
            <DocumentViewer
              document={currentSession.document}
              className="h-full"
            />
          ) : (
            <div className="h-full flex items-center justify-center p-6 text-gray-500">
              No document attached to this session
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
