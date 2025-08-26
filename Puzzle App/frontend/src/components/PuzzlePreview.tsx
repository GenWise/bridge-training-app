import React from 'react';
import type { Puzzle } from '../types/Puzzle';
import { DIFFICULTY_LEVELS } from '../types/Puzzle';

interface PuzzlePreviewProps {
  puzzles: Puzzle[];
  onClear?: () => void;
}

export const PuzzlePreview: React.FC<PuzzlePreviewProps> = ({ puzzles, onClear }) => {
  if (puzzles.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm text-gray-700">
          Selected Puzzles ({puzzles.length})
        </h3>
        {onClear && (
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {puzzles.map((puzzle, index) => {
          const difficulty = DIFFICULTY_LEVELS[puzzle.difficulty as keyof typeof DIFFICULTY_LEVELS];
          
          return (
            <div key={puzzle.puzzle_id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-medium text-gray-900">
                  Problem {index + 1}
                </div>
                <div className="text-xs px-2 py-1 bg-gray-100 rounded">
                  {difficulty ? `${difficulty.symbol} ${difficulty.name}` : puzzle.difficulty}
                </div>
              </div>
              
              <div className="text-xs text-gray-600 space-y-1">
                <div><strong>Contract:</strong> {puzzle.final_contract}</div>
                <div><strong>Lead:</strong> {puzzle.opening_lead}</div>
                <div><strong>Technique:</strong> {puzzle.main_technique}</div>
              </div>
              
              <div className="text-xs text-gray-500 mt-2 truncate">
                {puzzle.book_title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};