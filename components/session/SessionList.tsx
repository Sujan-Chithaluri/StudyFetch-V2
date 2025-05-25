// components/session/SessionList.tsx
"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type SessionListProps = {
  sessions: any[];
  type: "tutor" | "flashcards" | "summary";
}

export default function SessionList({ sessions, type }: SessionListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sessions.map((session) => (
        <Link 
          key={session.id} 
          href={`/${type}/${session.id}`}
          className="block"
        >
          <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 h-full flex flex-col">
            <h3 className="font-medium text-lg mb-2 line-clamp-2 text-gray-800">
              {session.title || session.document?.title || "Untitled Session"}
            </h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-1 overflow-hidden text-ellipsis">
              {session.document?.fileName || "No document"}
            </p>
            <div className="flex justify-between text-xs text-gray-400 mt-auto">
              <span>
                {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
              </span>
              <span>
                {session._count?.messages || session.messages?.length || 0} messages
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
