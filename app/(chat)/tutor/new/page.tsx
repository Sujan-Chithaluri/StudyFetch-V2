// app/(chat)/tutor/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DocumentUploader from "@/components/document/DocumentUploader";
import PageHeader from "@/components/ui/PageHeader";

export default function NewTutorSession() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadStart = () => {
    setIsUploading(true);
  };

  const handleUploadSuccess = (sessionId: string) => {
    router.push(`/tutor/${sessionId}`);
  };

  const handleUploadError = () => {
    setIsUploading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-16 px-8">
      <div className="container mx-auto max-w-6xl">
        <PageHeader
          title="Start a New Tutor Session"
          description="Upload a PDF document to start chatting with your AI tutor about its contents."
          action={
            <Link 
              href="/tutor" 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Sessions
            </Link>
          }
          className="text-gray-800 mb-12"
        />
        
        <div className="max-w-3xl mx-auto">
          <DocumentUploader 
            sessionType="TUTOR" 
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
