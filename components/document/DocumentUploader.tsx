// components/document/DocumentUploader.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parsePDF } from "@/lib/pdf-parser";

type DocumentUploaderProps = {
  sessionType: string;
  onStart?: () => void;
  onSuccess: (sessionId: string) => void;
  onError?: () => void;
  isUploading?: boolean;
  maxSizeMB?: number;
  acceptedFileTypes?: string[];
};

export default function DocumentUploader({
  sessionType,
  onStart,
  onSuccess,
  onError,
  isUploading = false,
  maxSizeMB = 3,
  acceptedFileTypes = ["application/pdf"],
}: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!acceptedFileTypes.includes(selectedFile.type)) {
      setFile(null);
      setError(
        `Please select a valid file type: ${acceptedFileTypes.join(", ")}`
      );
      return;
    }

    if (selectedFile.size > maxSizeBytes) {
      setFile(null);
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    if (onStart) onStart();
    setError(null);

    try {
      const content = await parsePDF(file);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sessionType", sessionType);
      formData.append("content", JSON.stringify(content));

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload document");
      }

      const { sessionId } = await response.json();
      onSuccess(sessionId);
    } catch (parseError) {
      console.error("Error parsing PDF:", parseError);
      setError("Failed to parse PDF. Please try a different file.");
      if (onError) onError();
      return;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-8">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="border-2 border-dashed border-blue-200 rounded-lg px-6 pt-8 pb-10 bg-blue-50">
              <div className="space-y-4 text-center">
                <svg
                  className="mx-auto h-16 w-16 text-blue-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex flex-col items-center text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-4 py-2 shadow-sm"
                  >
                    <span>Select PDF file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept={acceptedFileTypes.join(",")}
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </label>
                  <p className="mt-2">or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF up to {maxSizeMB}MB
                  </p>
                </div>
              </div>
            </div>

            {file && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-700">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              <div className="flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || isUploading}
            className={`w-full py-3 px-4 rounded-lg shadow-sm text-white font-medium ${
              !file || isUploading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 transition-colors"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isUploading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </div>
            ) : (
              "Upload and Continue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
