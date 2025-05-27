// app/(chat)/xyz/page.tsx
"use client";

import { useState } from "react";
import { Markdown } from "@/components/ui/Markdown";
import PageHeader from "@/components/ui/PageHeader";

export default function AITestPage() {
  const [prompt, setPrompt] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt || "Write a vegetarian lasagna recipe for 4 people." }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setResult(data.text);
    } catch (err) {
      console.error("Error fetching AI response:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-16 px-8">
      <div className="container mx-auto max-w-6xl">
        <PageHeader
          title="AI Generator"
          description="Generate content using AI. Enter a prompt and get an AI-generated response."
          className="text-gray-800 mb-12"
        />
        
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="mb-6">
              <label htmlFor="prompt" className="block text-base font-medium text-gray-700 mb-2">
                Enter your prompt:
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Write a vegetarian lasagna recipe for 4 people."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                rows={4}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg shadow-sm text-white font-medium bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </div>
              ) : (
                "Generate Content"
              )}
            </button>
          </form>
          
          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          {result && (
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Generated Content</h2>
              <div className="prose max-w-none text-gray-500">
                <Markdown content={result} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
