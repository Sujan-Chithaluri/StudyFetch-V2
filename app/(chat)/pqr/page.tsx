// app/(chat)/pqr/page.tsx
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import FlashcardSetList from "@/components/flashcards/FlashcardSetList";
import FlashcardViewer, { FlashcardViewerRef } from "@/components/flashcards/FlashcardViewer";

// data/flashcardData.ts
export const flashcardData = [
  {
    id: "set1",
    title: "JavaScript Basics",
    cards: [
      {
        question: "What is JavaScript?",
        options: [
          "A markup language",
          "A programming language",
          "A database system",
          "A styling language"
        ],
        correctAnswer: "A programming language",
        explanation: "JavaScript is a programming language used to create interactive effects within web browsers."
      },
      {
        question: "Which keyword is used to declare a variable in JavaScript?",
        options: ["var", "int", "string", "declare"],
        correctAnswer: "var",
        explanation: "In JavaScript, 'var' is one of the keywords used to declare variables, along with 'let' and 'const'."
      },
      {
        question: "What does DOM stand for?",
        options: [
          "Document Object Model",
          "Data Object Model",
          "Document Oriented Model",
          "Digital Object Model"
        ],
        correctAnswer: "Document Object Model",
        explanation: "The DOM is a programming interface for web documents that represents the page as nodes and objects."
      },
      {
        question: "Which method adds a new element at the end of an array?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correctAnswer: "push()",
        explanation: "The push() method adds one or more elements to the end of an array and returns the new length."
      },
      {
        question: "What is a closure in JavaScript?",
        options: [
          "A way to close browser windows",
          "A function with access to its outer function's scope",
          "A method to end JavaScript execution",
          "A way to close HTML tags"
        ],
        correctAnswer: "A function with access to its outer function's scope",
        explanation: "A closure is a function that has access to variables from its outer (enclosing) function's scope, even after the outer function has returned."
      }
    ]
  },
  {
    id: "set2",
    title: "React Fundamentals",
    cards: [
      {
        question: "What is React?",
        options: [
          "A JavaScript library for building user interfaces",
          "A programming language",
          "A database system",
          "A styling framework"
        ],
        correctAnswer: "A JavaScript library for building user interfaces",
        explanation: "React is a JavaScript library developed by Facebook for building user interfaces, particularly single-page applications."
      },
      {
        question: "What is JSX?",
        options: [
          "JavaScript XML - a syntax extension for JavaScript",
          "JavaScript Extra - a new version of JavaScript",
          "Java Syntax Extension",
          "JavaScript Execute - a runtime environment"
        ],
        correctAnswer: "JavaScript XML - a syntax extension for JavaScript",
        explanation: "JSX is a syntax extension for JavaScript that looks similar to HTML and allows you to write HTML elements in JavaScript."
      },
      {
        question: "What is a React component?",
        options: [
          "A reusable piece of UI",
          "A JavaScript function",
          "A styling element",
          "A database model"
        ],
        correctAnswer: "A reusable piece of UI",
        explanation: "React components are reusable pieces of code that return React elements describing what should appear on the screen."
      },
      {
        question: "What is the purpose of state in React?",
        options: [
          "To store and manage component data that changes over time",
          "To define the structure of the component",
          "To connect to external APIs",
          "To style React components"
        ],
        correctAnswer: "To store and manage component data that changes over time",
        explanation: "State is used to store component data that can change over time and trigger re-renders when updated."
      },
      {
        question: "What are props in React?",
        options: [
          "Properties passed to components",
          "Property styles for CSS",
          "Proper scripts for JavaScript",
          "Prototype objects"
        ],
        correctAnswer: "Properties passed to components",
        explanation: "Props (short for properties) are read-only inputs passed to components, similar to function parameters."
      }
    ]
  }
];

export default function FlashcardsPage() {
  const [activeSetId, setActiveSetId] = useState(flashcardData[0].id);
  const flashcardViewerRef = useRef<FlashcardViewerRef>(null);

  // Handler to update the active set ID
  const handleSetSelect = (setId: string) => {
    setActiveSetId(setId);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Your header code... */}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-[calc(100vh)] flex">
          {/* Left pane - Flashcard sets */}
          <div className="w-1/3">
            <FlashcardSetList 
              sets={flashcardData} 
              activeSetId={activeSetId} 
              viewerRef={flashcardViewerRef}
              onSetSelect={handleSetSelect} // Add this prop
            />
          </div>
          
          {/* Right pane - Flashcard viewer */}
          <div className="w-2/3">
            <FlashcardViewer 
              ref={flashcardViewerRef} 
              initialSet={flashcardData.find(set => set.id === activeSetId)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
