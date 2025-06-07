// components/flashcards/FlashcardSetList.tsx
import { FC } from 'react';
import { formatDistanceToNow } from "date-fns";

interface FlashcardSetListProps {
  sets: any[];
  activeSetId: string;
  viewerRef: any;
  onSetSelect: (setId: string) => void;
}

const FlashcardSetList: FC<FlashcardSetListProps> = ({ 
  sets, 
  activeSetId, 
  viewerRef,
  onSetSelect 
}) => {
  const handleSelectSet = (setId: string) => {
    const selectedSet = sets.find(set => set.id === setId);
    if (selectedSet && viewerRef.current) {
      viewerRef.current.loadFlashcardSet(selectedSet);
      onSetSelect(setId);
    }
  };

  return (
    <div className="border-r border-gray-200 h-full overflow-y-auto p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Flashcard Sets</h2>
      <div className="space-y-2">
        {sets && sets.map((set) => (
          <div
            key={set.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              activeSetId === set.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
            }`}
            onClick={() => handleSelectSet(set.id)}
          >
            <h3 className="font-medium text-gray-800">{set.title}</h3>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{set.flashcards ? `${set.flashcards.length} cards` : "Loading..."}</span>
              <span>{set.createdAt ? formatDistanceToNow(new Date(set.createdAt), { addSuffix: true }) : ""}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashcardSetList;
