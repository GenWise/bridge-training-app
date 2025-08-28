import React, { createContext, useState, ReactNode } from 'react';
import type { Puzzle } from '../types/Puzzle';
import type { AIScoreResult } from '../services/AIService';

type QuizScreen = 'quiz' | 'scored' | 'solution';

interface QuizState {
  puzzles: Puzzle[];
  currentIndex: number;
  userReasoning: string;
  currentScreen: QuizScreen;
  aiScore: AIScoreResult | null;
  isActive: boolean;
  isScoring: boolean;
}

interface QuizContextType {
  state: QuizState;
  startQuiz: (puzzles: Puzzle[]) => void;
  nextPuzzle: () => void;
  previousPuzzle: () => void;
  setUserReasoning: (reasoning: string) => void;
  submitForScoring: () => Promise<void>;
  showFullSolution: () => void;
  exitQuiz: () => void;
  getCurrentPuzzle: () => Puzzle | null;
  getProgress: () => { current: number; total: number };
}

export const QuizContext = createContext<QuizContextType | null>(null);

interface QuizProviderProps {
  children: ReactNode;
}

export const QuizProvider: React.FC<QuizProviderProps> = ({ children }) => {
  const [state, setState] = useState<QuizState>({
    puzzles: [],
    currentIndex: 0,
    userReasoning: '',
    currentScreen: 'quiz',
    aiScore: null,
    isActive: false,
    isScoring: false
  });

  const startQuiz = (puzzles: Puzzle[]) => {
    setState({
      puzzles,
      currentIndex: 0,
      userReasoning: '',
      currentScreen: 'quiz',
      aiScore: null,
      isActive: true,
      isScoring: false
    });
  };

  const nextPuzzle = () => {
    setState(prev => {
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= prev.puzzles.length) {
        return { ...prev, isActive: false };
      }
      return {
        ...prev,
        currentIndex: nextIndex,
        userReasoning: '',
        currentScreen: 'quiz',
        aiScore: null,
        isScoring: false
      };
    });
  };

  const previousPuzzle = () => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.max(0, prev.currentIndex - 1),
      userReasoning: '',
      currentScreen: 'quiz',
      aiScore: null,
      isScoring: false
    }));
  };

  const setUserReasoning = (reasoning: string) => {
    setState(prev => ({
      ...prev,
      userReasoning: reasoning
    }));
  };

  const submitForScoring = async () => {
    setState(prev => ({ ...prev, isScoring: true }));
    
    try {
      const { aiService } = await import('../services/AIService');
      const puzzle = getCurrentPuzzle();
      
      if (puzzle) {
        let score;
        try {
          // Try real Claude API first
          score = await aiService.scoreReasoningAgainstSolution(state.userReasoning, puzzle);
        } catch (apiError) {
          console.log('Claude API unavailable, using mock scoring:', apiError);
          // Fallback to mock scoring
          score = await aiService.mockScoreReasoning(state.userReasoning);
        }
        
        setState(prev => ({
          ...prev,
          aiScore: score,
          currentScreen: 'scored',
          isScoring: false
        }));
      }
    } catch (error) {
      console.error('Scoring failed:', error);
      setState(prev => ({ ...prev, isScoring: false }));
    }
  };

  const showFullSolution = () => {
    setState(prev => ({
      ...prev,
      currentScreen: 'solution'
    }));
  };

  const exitQuiz = () => {
    setState({
      puzzles: [],
      currentIndex: 0,
      userReasoning: '',
      currentScreen: 'quiz',
      aiScore: null,
      isActive: false,
      isScoring: false
    });
  };

  const getCurrentPuzzle = (): Puzzle | null => {
    if (state.currentIndex >= 0 && state.currentIndex < state.puzzles.length) {
      return state.puzzles[state.currentIndex];
    }
    return null;
  };

  const getProgress = () => ({
    current: state.currentIndex + 1,
    total: state.puzzles.length
  });

  const contextValue: QuizContextType = {
    state,
    startQuiz,
    nextPuzzle,
    previousPuzzle,
    setUserReasoning,
    submitForScoring,
    showFullSolution,
    exitQuiz,
    getCurrentPuzzle,
    getProgress
  };

  return (
    <QuizContext.Provider value={contextValue}>
      {children}
    </QuizContext.Provider>
  );
};

