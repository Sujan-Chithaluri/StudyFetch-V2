// components/flashcards/FlashcardSetList.tsx
import { FC } from "react";
import { formatDistanceToNow } from "date-fns";

interface FlashcardSetListProps {
  sets: any[];
  activeSetId: string;
  viewerRef: any;
  onSetSelect: (setId: string) => void;
  onGenerateNew: () => void;
  generating: boolean;
}

const FlashcardSetList: FC<FlashcardSetListProps> = ({
  sets,
  activeSetId,
  viewerRef,
  onSetSelect,
  onGenerateNew,
  generating,
}) => {
  const handleSelectSet = (setId: string) => {
    const selectedSet = sets.find((set) => set.id === setId);
    if (selectedSet && viewerRef.current) {
      viewerRef.current.loadFlashcardSet(selectedSet);
      onSetSelect(setId);
    }
  };

  return (
    <div className="border-r border-gray-200 h-full overflow-y-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Flashcard Sets</h2>
        <button
          onClick={onGenerateNew}
          disabled={generating}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {generating ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
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
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>New Set</span>
            </>
          )}
        </button>
      </div>
      <div className="space-y-2">
        {sets &&
          sets.map((set) => (
            <div
              key={set.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                activeSetId === set.id
                  ? "border-blue-500 bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => handleSelectSet(set.id)}
            >
              <h3 className="font-medium text-gray-800">{set.title}</h3>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>
                  {set.flashcards
                    ? `${set.flashcards.length} cards`
                    : "Loading..."}
                </span>
                <span>
                  {set.createdAt
                    ? `${formatDistanceToNow(new Date(set.createdAt))} ago`
                    : ""}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default FlashcardSetList;
