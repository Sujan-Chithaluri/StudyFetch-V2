// components/tutor/TutorSessionLayout.tsx
"use client";

import { useState } from "react";
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
  const [showParsedPDF, setShowParsedPDF] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteSession = async () => {
    try {
      const response = await fetch(`/api/chat/${currentSession.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Redirect to sessions list
        window.location.href = '/tutor';
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  return (
    <div className="h-[calc(99.5vh-3.5rem)] overflow-hidden flex flex-col">
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
        <div className="px-16 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800 truncate max-w-lg">
            {currentSession.title ||
              currentSession.document?.title ||
              "Untitled Session"}
          </h1>
          
          <div className="flex items-center space-x-4">
            {/* PDF Toggle Switch */}

            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">
                {showParsedPDF ? "Parsed PDF" : "Actual PDF"}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  checked={showParsedPDF}
                  onChange={() => setShowParsedPDF(!showParsedPDF)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>            
            
            {/* Delete Button */}
            <div className="relative">
              <button
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                aria-label="Delete session"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              
              {/* Delete Confirmation Dropdown */}
              {showDeleteConfirm && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                  <p className="px-4 py-2 text-sm text-gray-700">Delete this session?</p>
                  <div className="border-t border-gray-100 px-4 py-2 flex justify-between">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteSession}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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
              showParsed={showParsedPDF}
              className="h-full"
            />
          ) : (
            <div className="h-full flex items-center justify-center p-6 text-gray-500">
              No document attached to this session
            </div>
          )}
        </div>
      </div>
    </div>);
}
