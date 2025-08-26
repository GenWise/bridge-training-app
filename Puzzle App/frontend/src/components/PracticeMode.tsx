import React from 'react';

interface PracticeModeProps {
  mode: 'play' | 'export';
  onChange: (mode: 'play' | 'export') => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({ mode, onChange }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <label className="block text-sm font-medium text-gray-900 mb-3">
        Practice Mode
      </label>
      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => onChange('play')}
          className={`py-3 px-4 text-sm font-medium rounded-md transition-all ${
            mode === 'play'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          Play Here
        </button>
        <button
          onClick={() => onChange('export')}
          className={`py-3 px-4 text-sm font-medium rounded-md transition-all ${
            mode === 'export'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          Export Only
        </button>
      </div>
      <p className="text-sm text-gray-600 text-center mt-3">
        {mode === 'play' 
          ? 'Practice with scoring and interactive feedback'
          : 'Download files for external use - no scoring saved'
        }
      </p>
    </div>
  );
};