// components/flashcards/FlashcardViewer.tsx
import { useState, forwardRef, useImperativeHandle } from "react";
import { formatDistanceToNow } from "date-fns";

export interface FlashcardViewerRef {
  loadFlashcardSet: (set: any) => void;
}

interface FlashcardViewerProps {
  initialSet: any;
}

const FlashcardViewer = forwardRef<FlashcardViewerRef, FlashcardViewerProps>(
  (props, ref) => {
    const [currentSet, setCurrentSet] = useState(props.initialSet);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    // Expose methods to parent through ref
    useImperativeHandle(ref, () => ({
      loadFlashcardSet: (set) => {
        setCurrentSet(set);
        setCurrentCardIndex(0);
        setShowAnswer(false);
        setSelectedOption(null);
      },
    }));

    if (!currentSet)
      return <div className="p-6">No flashcard set selected</div>;

    // Check if flashcards exist and have items
    if (!currentSet.flashcards || currentSet.flashcards.length === 0) {
      return (
        <div className="p-6">This flashcard set is empty or still loading.</div>
      );
    }

    const card = currentSet.flashcards[currentCardIndex];
    const isCorrect = selectedOption === card.correctAnswer;

    const handleOptionSelect = (option: string) => {
      setSelectedOption(option);
      setShowAnswer(true);
    };

    const nextCard = () => {
      if (currentCardIndex < currentSet.flashcards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setShowAnswer(false);
        setSelectedOption(null);
      }
    };

    const prevCard = () => {
      if (currentCardIndex > 0) {
        setCurrentCardIndex(currentCardIndex - 1);
        setShowAnswer(false);
        setSelectedOption(null);
      }
    };

    return (
      <div className="p-6 h-full overflow-y-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex justify-between items-center">
          <span>{currentSet.title}</span>
          <span className="text-sm text-gray-500">
            {currentSet.createdAt
              ? `${formatDistanceToNow(new Date(currentSet.createdAt))} ago`
              : ""}
          </span>
        </h2>
        {/* Progress indicator */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Card {currentCardIndex + 1} of {currentSet.flashcards.length}
          </div>
          <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{
                width: `${
                  ((currentCardIndex + 1) / currentSet.flashcards.length) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>
        {/* Flashcard */}
        <div className="border rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gray-50 p-6 border-b">
            <h3 className="text-xl font-medium text-gray-800">
              {card.question}
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {card.options.map((option: string, i: number) => (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(option)}
                  disabled={showAnswer}
                  className={`w-full text-left p-4 border rounded-md transition-colors ${
                    selectedOption === option
                      ? option === card.correctAnswer
                        ? "bg-green-100 border-green-500 text-green-800"
                        : "bg-red-100 border-red-500 text-red-800"
                      : "hover:bg-gray-50 text-gray-800"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Answer explanation */}
            {showAnswer && (
              <div
                className={`mt-6 p-4 rounded-md ${
                  isCorrect ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <p className="font-bold text-lg mb-2 text-gray-800">
                  {isCorrect ? "✓ Correct!" : "✗ Incorrect!"}
                </p>
                <p className="mb-2 text-gray-800">
                  <span className="font-medium">Correct answer:</span>{" "}
                  {card.correctAnswer}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Explanation:</span>{" "}
                  {card.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevCard}
            disabled={currentCardIndex === 0}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 text-gray-700 font-medium"
          >
            Previous
          </button>

          {showAnswer ? (
            currentCardIndex === currentSet.flashcards.length - 1 ? (
              <button
                onClick={() => {
                  setCurrentCardIndex(0);
                  setShowAnswer(false);
                  setSelectedOption(null);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                Retry Set
              </button>
            ) : (
              <button
                onClick={nextCard}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Next
              </button>
            )
          ) : (
            <button
              onClick={() => setShowAnswer(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Show Answer
            </button>
          )}
        </div>
      </div>
    );
  }
);

FlashcardViewer.displayName = "FlashcardViewer";

export default FlashcardViewer;
