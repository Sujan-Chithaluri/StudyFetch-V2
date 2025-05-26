// components/layout/SessionSidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type Session = {
  id: string;
  title?: string;
  updatedAt: Date;
  document?: {
    title?: string;
    fileName?: string;
  };
  _count: {
    messages: number;
  };
};

type SessionSidebarProps = {
  surroundingSessions: Session[];
  sessionType: string;
  currentSessionId: string;
  hasMoreBefore: boolean;
  hasMoreAfter: boolean;
  totalSessions: number;
  currentPosition: number;
};

export default function SessionSidebar({
  surroundingSessions,
  sessionType,
  currentSessionId,
  hasMoreBefore,
  hasMoreAfter,
  totalSessions,
  currentPosition,
}: SessionSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(surroundingSessions);
  const [isLoadingBefore, setIsLoadingBefore] = useState(false);
  const [isLoadingAfter, setIsLoadingAfter] = useState(false);
  const [showMoreBefore, setShowMoreBefore] = useState(hasMoreBefore);
  const [showMoreAfter, setShowMoreAfter] = useState(hasMoreAfter);

  // Function to fetch more sessions before the current set
  const fetchMoreBefore = async () => {
    if (isLoadingBefore || !showMoreBefore) return;

    setIsLoadingBefore(true);
    try {
      const firstSessionInView = sessions[0];
      const response = await fetch(
        `/api/sessions/before?type=${sessionType}&sessionId=${firstSessionInView.id}&limit=5`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch earlier sessions");
      }

      const data = await response.json();

      if (data.sessions.length === 0) {
        setShowMoreBefore(false);
      } else {
        setSessions((prev) => [...data.sessions, ...prev]);
        setShowMoreBefore(data.hasMore);
      }
    } catch (error) {
      console.error("Error fetching earlier sessions:", error);
      setShowMoreBefore(false);
    } finally {
      setIsLoadingBefore(false);
    }
  };

  // Function to fetch more sessions after the current set
  const fetchMoreAfter = async () => {
    if (isLoadingAfter || !showMoreAfter) return;

    setIsLoadingAfter(true);
    try {
      const lastSessionInView = sessions[sessions.length - 1];
      const response = await fetch(
        `/api/sessions/after?type=${sessionType}&sessionId=${lastSessionInView.id}&limit=5`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch later sessions");
      }

      const data = await response.json();

      if (data.sessions.length === 0) {
        setShowMoreAfter(false);
      } else {
        setSessions((prev) => [...prev, ...data.sessions]);
        setShowMoreAfter(data.hasMore);
      }
    } catch (error) {
      console.error("Error fetching later sessions:", error);
      setShowMoreAfter(false);
    } finally {
      setIsLoadingAfter(false);
    }
  };

  return (
    <>
      {/* Sidebar toggle button (visible when sidebar is closed) */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-40 left-0 bg-blue-200 text-white p-2 rounded-r-md shadow-md z-40 ${
          isOpen ? "hidden" : "flex"
        } items-center justify-center hover:bg-blue-700`}
        aria-label="Open sidebar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-20 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-medium text-gray-800">
            Sessions ({currentPosition + 1} of {totalSessions})
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close sidebar"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            <Link
              href={`/${sessionType}`}
              className="block p-2 rounded hover:bg-gray-100 text-blue-600 font-medium flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              All Sessions
            </Link>

            {/* Load More Before button */}
            {showMoreBefore && (
              <div className="py-2 text-center">
                <button
                  onClick={fetchMoreBefore}
                  disabled={isLoadingBefore}
                  className="w-full py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md flex items-center justify-center transition-colors"
                >
                  {isLoadingBefore ? (
                    <>
                      <div className="w-4 h-4 border-t-2 border-blue-500 border-r-2 rounded-full animate-spin mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                      Load Earlier
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Session list */}
            {sessions.map((session) => {
              const isCurrentSession = session.id === currentSessionId;
              return (
                <Link
                  key={session.id}
                  href={`/${sessionType}/${session.id}`}
                  className={`block p-2 rounded ${
                    isCurrentSession
                      ? "bg-blue-100 border border-blue-200"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div
                    className={`text-sm font-medium line-clamp-1 ${
                      isCurrentSession ? "text-blue-700" : "text-gray-800"
                    }`}
                  >
                    {session.title ||
                      session.document?.title ||
                      "Untitled Session"}
                    {isCurrentSession && (
                      <span className="ml-1 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-xs mt-1 flex justify-between ${
                      isCurrentSession ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    <span>
                      {formatDistanceToNow(new Date(session.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                    <span>{session._count.messages} msgs</span>
                  </div>
                </Link>
              );
            })}

            {/* Load More After button */}
            {showMoreAfter && (
              <div className="py-2 text-center">
                <button
                  onClick={fetchMoreAfter}
                  disabled={isLoadingAfter}
                  className="w-full py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md flex items-center justify-center transition-colors"
                >
                  {isLoadingAfter ? (
                    <>
                      <div className="w-4 h-4 border-t-2 border-blue-500 border-r-2 rounded-full animate-spin mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      Load Later
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 border-t border-gray-200">
          <Link
            href={`/${sessionType}/new`}
            className="block w-full py-2 px-3 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            New Session
          </Link>
        </div>
      </div>
    </>
  );
}
