import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface PdfControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSearch: (term: string) => void;
  onNextMatch?: () => void;
  onPrevMatch?: () => void;
  onExport: () => void;
  scale: number;
  searchMatches?: number;
  currentMatch?: number;
}

const PdfControls: React.FC<PdfControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onSearch,
  onNextMatch,
  onPrevMatch,
  onExport,
  scale,
  searchMatches = 0,
  currentMatch = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Update page display when currentPage changes
  useEffect(() => {
    // No need to update any input since we removed the page input
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="bg-gray-800 text-white p-3 flex items-center justify-between border-b border-gray-700">
      <div className="flex items-center space-x-3">
        <button
          onClick={handlePrevPage}
          disabled={currentPage <= 0}
          className="p-1 rounded hover:bg-gray-700 disabled:opacity-50"
          aria-label="Previous page"
        >
          <ChevronLeft size={20} />
        </button>

        <span className="text-sm">
          Page {currentPage + 1} of {totalPages || 1}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages - 1}
          className="p-1 rounded hover:bg-gray-700 disabled:opacity-50"
          aria-label="Next page"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex items-center space-x-3">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="bg-gray-700 border border-gray-600 rounded-l px-2 py-1 w-32"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 rounded-r px-2 py-1"
            aria-label="Search"
          >
            <Search size={16} />
          </button>
        </form>

        {searchMatches > 0 && (
          <div className="flex items-center space-x-1">
            <button
              onClick={onPrevMatch}
              className="p-1 rounded hover:bg-gray-700"
              aria-label="Previous match"
            >
              <ArrowUp size={16} />
            </button>
            <span className="text-xs">
              {currentMatch + 1}/{searchMatches}
            </span>
            <button
              onClick={onNextMatch}
              className="p-1 rounded hover:bg-gray-700"
              aria-label="Next match"
            >
              <ArrowDown size={16} />
            </button>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <button
            onClick={onZoomOut}
            className="p-1 rounded hover:bg-gray-700"
            aria-label="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button
            onClick={onZoomIn}
            className="p-1 rounded hover:bg-gray-700"
            aria-label="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        {/* <button
          onClick={onExport}
          className="bg-green-600 hover:bg-green-700 rounded px-3 py-1 flex items-center"
          aria-label="Export PDF"
        >
          <Download size={16} className="mr-1" />
          <span>Export</span>
        </button> */}
      </div>
    </div>
  );
};

export default PdfControls;
