import React, { useState, useEffect } from 'react';
import { TabNavigation } from './TabNavigation';
import { DifficultySelector } from './DifficultySelector';
import { ProblemCountSlider } from './ProblemCountSlider';
import { PracticeMode } from './PracticeMode';
import { PuzzlePreview } from './PuzzlePreview';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { puzzleService } from '../services/PuzzleService';
import type { Puzzle, DifficultySymbol, LoadingState } from '../types/Puzzle';
import { DEFAULT_SESSION_CONFIG } from '../types/Session';

export const SessionBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'declarer' | 'defense'>('declarer');
  const [problemCount, setProblemCount] = useState(DEFAULT_SESSION_CONFIG.problemCount);
  const [difficulty, setDifficulty] = useState<DifficultySymbol | 'all'>('all');
  const [mode, setMode] = useState<'play' | 'export'>('play');
  const [selectedPuzzles, setSelectedPuzzles] = useState<Puzzle[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false, error: null });
  const [difficultyStats, setDifficultyStats] = useState<Record<DifficultySymbol, number>>({} as Record<DifficultySymbol, number>);

  // Load difficulty statistics on component mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const availableDifficulties = await puzzleService.getAvailableDifficulties();
        const stats = availableDifficulties.reduce((acc, { difficulty, count }) => {
          acc[difficulty] = count;
          return acc;
        }, {} as Record<DifficultySymbol, number>);
        setDifficultyStats(stats);
      } catch (error) {
        console.warn('Could not load difficulty statistics:', error);
      }
    };
    loadStats();
  }, []);

  const handleGenerateSession = async () => {
    setLoadingState({ isLoading: true, error: null });
    
    try {
      let puzzles: Puzzle[];
      
      if (difficulty === 'all') {
        // If "all" selected, get random puzzles from all difficulties
        puzzles = await puzzleService.getRandomPuzzles({
          count: problemCount
        });
      } else {
        // Get puzzles for specific difficulty
        puzzles = await puzzleService.getPuzzlesByDifficulty(difficulty, problemCount);
      }

      setSelectedPuzzles(puzzles);
      setLoadingState({ isLoading: false, error: null });
      
      // TODO: Handle different modes
      if (mode === 'play') {
        // Navigate to quiz mode (future implementation)
        console.log('Starting quiz mode with', puzzles.length, 'puzzles');
      } else {
        // Export mode (future implementation)
        console.log('Exporting', puzzles.length, 'puzzles');
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to generate session'
      });
    }
  };

  const getActionButtonText = () => {
    if (mode === 'play') {
      return 'Generate Session';
    } else {
      return '📦 Export Problems';
    }
  };

  const getActionButtonStyle = () => {
    return mode === 'play' 
      ? 'bg-blue-500 hover:bg-blue-600' 
      : 'bg-green-500 hover:bg-green-600';
  };

  const getActionDescription = () => {
    return mode === 'play'
      ? 'Creates interactive practice session with scoring'
      : 'Saves both PDF and LIN files to your device';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-6xl">
        <div className="bg-white md:mt-6 md:rounded-xl md:shadow-sm">
          <div className="space-y-6 p-4 md:p-6 lg:grid lg:grid-cols-[320px_1fr] lg:gap-8 lg:space-y-0">
            <div className="space-y-4">
            <TabNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />
            
            <ProblemCountSlider
              value={problemCount}
              onChange={setProblemCount}
            />
            
            <DifficultySelector
              value={difficulty}
              onChange={setDifficulty}
              counts={difficultyStats}
            />
            
            <PracticeMode
              mode={mode}
              onChange={setMode}
            />
            
            <div className="space-y-3">
              <button
                onClick={handleGenerateSession}
                disabled={loadingState.isLoading}
                className={`w-full py-4 px-6 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${getActionButtonStyle()}`}
              >
                {loadingState.isLoading ? 'Loading...' : getActionButtonText()}
              </button>
              
              <p className="text-sm text-gray-600 text-center">
                {getActionDescription()}
              </p>
              
              <div className="text-center">
                <button className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  📊 View Stats
                </button>
              </div>
            </div>
          </div>
          
          <div className="lg:border-l lg:border-gray-100 lg:pl-8">
            {loadingState.isLoading && (
              <LoadingSpinner text="Loading puzzles..." />
            )}
            
            {loadingState.error && (
              <ErrorMessage 
                message={loadingState.error} 
                onRetry={() => setLoadingState({ isLoading: false, error: null })}
              />
            )}
            
            {!loadingState.isLoading && !loadingState.error && (
              <>
                {selectedPuzzles.length > 0 ? (
                  <PuzzlePreview 
                    puzzles={selectedPuzzles} 
                    onClear={() => setSelectedPuzzles([])}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-16 px-4">
                    <div className="text-6xl mb-6">🃏</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Practice?</h3>
                    <p className="text-gray-600 max-w-sm mx-auto">
                      Configure your session settings and click "{getActionButtonText()}" to get started
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};