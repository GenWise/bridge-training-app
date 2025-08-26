import React from 'react';

interface ProblemCountSliderProps {
  value: number;
  onChange: (count: number) => void;
  max?: number;
}

export const ProblemCountSlider: React.FC<ProblemCountSliderProps> = ({ 
  value, 
  onChange, 
  max = 20 
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-medium text-gray-900">Problems</label>
        <span className="bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
          {value}
        </span>
      </div>
      <input
        type="range"
        min="1"
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>1</span>
        <span>{max}</span>
      </div>
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: all 0.15s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};