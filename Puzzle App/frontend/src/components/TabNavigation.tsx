import React from 'react';

interface TabNavigationProps {
  activeTab: 'declarer' | 'defense';
  onTabChange: (tab: 'declarer' | 'defense') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-1 grid grid-cols-2 gap-1">
      <button
        onClick={() => onTabChange('declarer')}
        className={`py-3 px-4 text-sm font-medium rounded-lg transition-all ${
          activeTab === 'declarer'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
        }`}
      >
        Declarer Play
      </button>
      <button
        onClick={() => onTabChange('defense')}
        disabled
        className="py-3 px-4 text-sm font-medium rounded-lg text-gray-400 cursor-not-allowed"
      >
        Defense
      </button>
    </div>
  );
};