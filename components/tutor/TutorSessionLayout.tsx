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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-4 px-4">
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
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-lg shadow-sm p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800 truncate">
            {currentSession.title ||
              currentSession.document?.title ||
              "Untitled Session"}
          </h1>
        </div>
        
        {/* Content area */}
        <div className="bg-white rounded-b-lg shadow-sm flex flex-col md:flex-row">
          {/* Chat interface */}
          <div className="w-full md:w-1/2">
            <ChatInterface
              sessionId={currentSession.id}
              initialMessages={currentSession.messages}
              className="h-[calc(100vh-180px)]"
            />
          </div>
          
          {/* PDF viewer */}
          <div className="w-full md:w-1/2 border-r border-gray-200">
            {currentSession.document ? (
              <DocumentViewer
                document={currentSession.document}
                className="h-[calc(100vh-180px)]"
              />
            ) : (
              <div className="h-[calc(100vh-180px)] flex items-center justify-center p-6 text-gray-500">
                No document attached to this session
              </div>
            )}
          </div>
          
          
        </div>
      </div>
    </div>
  );
}
