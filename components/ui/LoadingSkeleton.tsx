// app/(chat)/tutor/[sessionId]/loading.tsx
import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-16 px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header skeleton */}
        <div className="mb-10">
          <div className="h-10 w-64 bg-gray-200 rounded-md animate-pulse mb-4"></div>
          <div className="h-6 w-96 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        
        {/* Content skeleton */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Document viewer skeleton */}
          <div className="w-full md:w-1/2 bg-white rounded-xl shadow-md p-6 h-[600px]">
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Loading document...</p>
            </div>
          </div>
          
          {/* Chat skeleton */}
          <div className="w-full md:w-1/2 bg-white rounded-xl shadow-md p-6 h-[600px] flex flex-col">
            <div className="flex-1 overflow-hidden">
              {/* Message skeletons */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} mb-4`}>
                  <div 
                    className={`${i % 2 === 0 ? 'bg-blue-100' : 'bg-gray-100'} rounded-lg p-4 max-w-[80%]`}
                  >
                    <div className="h-4 bg-gray-200 rounded-md animate-pulse w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded-md animate-pulse w-48"></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Input skeleton */}
            <div className="mt-4 flex items-center">
              <div className="flex-1 h-12 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="ml-2 h-12 w-12 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
