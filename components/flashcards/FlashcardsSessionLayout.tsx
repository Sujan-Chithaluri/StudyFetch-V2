// components/flashcards/FlashcardSessionLayout.tsx
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import SessionSidebar from "@/components/layout/SessionSidebar";
import FlashcardSetList from "@/components/flashcards/FlashcardSetList";
import FlashcardViewer, {
  FlashcardViewerRef,
} from "@/components/flashcards/FlashcardViewer";

type FlashcardSessionLayoutProps = {
  currentSession: any;
  surroundingSessions: any[];
  hasMoreBefore: boolean;
  hasMoreAfter: boolean;
  totalSessions: number;
  currentPosition: number;
  flashcardSets: any[];
};

export default function FlashcardSessionLayout({
  currentSession,
  surroundingSessions,
  hasMoreBefore,
  hasMoreAfter,
  totalSessions,
  currentPosition,
  flashcardSets,
}: FlashcardSessionLayoutProps) {
  const [activeSetId, setActiveSetId] = useState(
    flashcardSets?.length > 0 ? flashcardSets[0].id : ""
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const flashcardViewerRef = useRef<FlashcardViewerRef>(null);

  // Update active set ID when flashcard sets change
  useEffect(() => {
    if (
      flashcardSets?.length > 0 &&
      !flashcardSets.find((set) => set.id === activeSetId)
    ) {
      setActiveSetId(flashcardSets[0]?.id);
    }
  }, [flashcardSets, activeSetId]);

  const handleSetSelect = (setId: string) => {
    setActiveSetId(setId);
  };

  const handleDeleteSession = async () => {
    try {
      const response = await fetch(`/api/chat/${currentSession.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Redirect to sessions list
        window.location.href = "/flashcards";
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const generateNewFlashcards = async () => {
    try {
      setGenerating(true);
      const response = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId: currentSession.id }),
      });

      console.log("Response from generate flashcards:", response);

      if (response.ok) {
        // Refresh the page to get the new flashcards
        window.location.reload();
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="h-[calc(99.5vh-3.5rem)] overflow-hidden flex flex-col">
      {/* Sidebar */}
      <SessionSidebar
        surroundingSessions={surroundingSessions}
        sessionType="flashcards"
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
              "Untitled Flashcards"}
          </h1>

          <div className="flex items-center space-x-4">
            {/* Delete Button */}
            <div className="relative z-[100]">
              <button
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                aria-label="Delete session"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>

              {/* Delete Confirmation Dropdown */}
              {showDeleteConfirm && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-[110] border border-gray-200">
                  <p className="px-4 py-2 text-sm text-gray-700">
                    Delete this session?
                  </p>
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
        {/* Flashcard sets list */}
        <div className="w-1/3 overflow-hidden">
          {flashcardSets?.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6">
              <p className="text-gray-500 mb-4">No flashcard sets yet</p>
              <button
                onClick={generateNewFlashcards}
                disabled={generating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate Flashcards"}
              </button>
            </div>
          ) : (
            <FlashcardSetList
              sets={flashcardSets}
              activeSetId={activeSetId}
              viewerRef={flashcardViewerRef}
              onSetSelect={handleSetSelect}
              onGenerateNew={generateNewFlashcards}
              generating={generating}
            />
          )}
        </div>

        {/* Flashcard viewer */}
        <div className="w-2/3 border-l border-gray-200 overflow-hidden">
          {flashcardSets?.length > 0 ? (
            <FlashcardViewer
              ref={flashcardViewerRef}
              initialSet={
                flashcardSets.find((set) => set.id === activeSetId) ||
                flashcardSets[0]
              }
            />
          ) : (
            <div className="h-full flex items-center justify-center p-6 text-gray-500">
              Generate your first flashcard set to get started
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
