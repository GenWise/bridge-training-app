// import React, { createContext, useState, ReactNode } from 'react';
// 👍 This is the corrected code
import { type ReactNode, createContext, useState } from 'react';
import type { Puzzle } from '../types/Puzzle';
import type { AIScoreResult } from '../services/AIService';
import { progressService } from '../services/ProgressService';

type QuizScreen = 'quiz' | 'scored' | 'solution';

interface QuizState {
  puzzles: Puzzle[];
  currentIndex: number;
  userReasoning: string;
  currentScreen: QuizScreen;
  aiScore: AIScoreResult | null;
  isActive: boolean;
  isScoring: boolean;
  sessionId: string | null;
  startTime: number;
}

interface QuizContextType {
  state: QuizState;
  startQuiz: (puzzles: Puzzle[]) => void;
  nextPuzzle: () => void;
  previousPuzzle: () => void;
  setUserReasoning: (reasoning: string) => void;
  submitForScoring: () => Promise<void>;
  showFullSolution: () => void;
  backToPuzzle: () => void;
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
    isScoring: false,
    sessionId: null,
    startTime: 0
  });

  const startQuiz = async (puzzles: Puzzle[]) => {
    // Create session for progress tracking
    let sessionId: string | null = null;
    try {
      sessionId = await progressService.createSession(puzzles);
      console.log('📊 Created session:', sessionId);
    } catch (error) {
      console.warn('Failed to create session:', error);
    }

    setState({
      puzzles,
      currentIndex: 0,
      userReasoning: '',
      currentScreen: 'quiz',
      aiScore: null,
      isActive: true,
      isScoring: false,
      sessionId,
      startTime: Date.now()
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
        isScoring: false,
        startTime: Date.now()
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
          // Try Groq/Claude API
          score = await aiService.scoreReasoningAgainstSolution(state.userReasoning, puzzle);
        } catch (apiError) {
          console.log('AI API unavailable, using mock scoring:', apiError);
          // Fallback to mock scoring
          score = await aiService.mockScoreReasoning(state.userReasoning);
        }
        
        // Save attempt to progress service
        if (state.sessionId) {
          const timeSpent = Math.floor((Date.now() - state.startTime) / 1000);
          try {
            await progressService.saveAttempt(
              state.sessionId,
              puzzle,
              state.userReasoning,
              score,
              timeSpent
            );
          } catch (error) {
            console.warn('Failed to save attempt:', error);
          }
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

  const backToPuzzle = () => {
    setState(prev => ({
      ...prev,
      currentScreen: prev.aiScore ? 'scored' : 'quiz'
    }));
  };

  const exitQuiz = async () => {
    // Complete the session if it exists
    if (state.sessionId) {
      try {
        await progressService.completeSession(state.sessionId);
        console.log('🏁 Session completed');
      } catch (error) {
        console.warn('Failed to complete session:', error);
      }
    }

    setState({
      puzzles: [],
      currentIndex: 0,
      userReasoning: '',
      currentScreen: 'quiz',
      aiScore: null,
      isActive: false,
      isScoring: false,
      sessionId: null,
      startTime: 0
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
    backToPuzzle,
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

