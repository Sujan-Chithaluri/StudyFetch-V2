// app/xyz/page.tsx
"use client";

import { useState, useEffect } from "react";

export default function AITestPage() {
  const [recipe, setRecipe] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipe = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "Write a vegetarian lasagna recipe for 4 people.",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate recipe");
      }

      const data = await response.json();
      setRecipe(data.text);
    } catch (err) {
      console.error("Error generating recipe:", err);
      setError("Failed to generate recipe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateRecipe();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">AI Recipe Generator</h1>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3">Generating recipe...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
          {error}
          <button
            onClick={generateRecipe}
            className="ml-4 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <pre className="whitespace-pre-wrap">{recipe}</pre>

          <button
            onClick={generateRecipe}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate New Recipe
          </button>
        </div>
      )}
    </div>
  );
}
