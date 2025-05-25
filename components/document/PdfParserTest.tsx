// components/document/PdfParserTest.tsx
"use client";

import { useState } from "react";
import { parsePDF } from "@/lib/pdf-parser";

export default function PdfParserTest() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const parsedPdf = await parsePDF(file);
      setResult(parsedPdf);
      console.log("PDF parsed successfully:", parsedPdf);
    } catch (err) {
      console.error("Error parsing PDF:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">PDF Parser Test</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select a PDF file to test parsing
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={isProcessing}
        />
      </div>

      {isProcessing && (
        <div className="mb-4 p-4 bg-blue-50 rounded-md">
          <p className="text-blue-700 flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing PDF...
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-md">
          <p className="text-red-700 font-medium">Error parsing PDF:</p>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {result && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Parsing Results:</h2>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <p className="mb-2"><span className="font-medium">Total Pages:</span> {result.totalPages}</p>
            <p className="mb-2"><span className="font-medium">Content Length:</span> {result.content.length} pages</p>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">First Page Preview:</h3>
              <div className="bg-white p-3 rounded border border-gray-300 max-h-60 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap">{result.content[0]?.substring(0, 500)}...</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
