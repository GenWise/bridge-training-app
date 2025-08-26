import React from 'react';
import type { DifficultySymbol } from '../types/Puzzle';
import { DIFFICULTY_LEVELS } from '../types/Puzzle';

interface DifficultySelectorProps {
  value: DifficultySymbol | 'all';
  onChange: (difficulty: DifficultySymbol | 'all') => void;
  counts?: Record<DifficultySymbol, number>;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ 
  value, 
  onChange, 
  counts 
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <label className="block text-sm font-medium text-gray-900 mb-3">
        Difficulty Level
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as DifficultySymbol | 'all')}
        className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
      >
        <option value="all">♣ ♦ ♥ ♠ All Difficulties</option>
        {Object.values(DIFFICULTY_LEVELS).map((level) => (
          <option key={level.symbol} value={level.symbol}>
            {level.symbol} {level.name}
            {counts && counts[level.symbol] ? ` (${counts[level.symbol]} puzzles)` : ''}
          </option>
        ))}
      </select>
      {value !== 'all' && (
        <p className="mt-3 text-sm text-gray-600">
          {DIFFICULTY_LEVELS[value as DifficultySymbol]?.description}
        </p>
      )}
    </div>
  );
};