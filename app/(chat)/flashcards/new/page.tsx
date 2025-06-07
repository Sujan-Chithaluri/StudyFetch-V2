// app/(chat)/flashcards/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DocumentUploader from "@/components/document/DocumentUploader";
import PageHeader from "@/components/ui/PageHeader";

export default function NewFlashcardsSession() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadStart = () => {
    setIsUploading(true);
  };

  const handleUploadSuccess = (sessionId: string) => {
    router.push(`/flashcards/${sessionId}`); // Changed from /ai/flashcards to /flashcards/
  };

  const handleUploadError = () => {
    setIsUploading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-16 px-8">
      <div className="container mx-auto max-w-6xl">
        <PageHeader
          title="Create Flashcards"
          description="Upload a PDF document to generate flashcards and test your knowledge."
          action={
            <Link 
              href="/flashcards" 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Flashcards
            </Link>
          }
          className="text-gray-800 mb-12"
        />
        
        <div className="max-w-3xl mx-auto">
          <DocumentUploader 
            sessionType="FLASHCARDS" 
            onStart={handleUploadStart}
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
            isUploading={isUploading}
            maxSizeMB={10}
            acceptedFileTypes={["application/pdf"]}
          />
        </div>
      </div>
    </div>
  );
}
