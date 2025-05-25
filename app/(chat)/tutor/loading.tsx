import React from "react";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-16 px-8">
      <div className="container mx-auto max-w-6xl">
        <LoadingSkeleton />
      </div>
    </div>
  );
}