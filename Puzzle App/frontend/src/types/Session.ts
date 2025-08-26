import type { Puzzle, DifficultySymbol } from './Puzzle';

export interface SessionConfig {
  problemCount: number;
  difficulty: DifficultySymbol | 'all';
  techniques: string[];
  books: string[];
  mode: 'play' | 'export';
  randomize: boolean;
  allowSkip: boolean;
}

export interface SessionState {
  puzzles: Puzzle[];
  currentPuzzleIndex: number;
  answers: SessionAnswer[];
  isActive: boolean;
  completed: boolean;
}

export interface SessionAnswer {
  puzzleId: string;
  userAnswer: string;
  score?: number;
  feedback?: string;
  skipped: boolean;
  showedSolution: boolean;
  timestamp: Date;
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  problemCount: 3,
  difficulty: 'all',
  techniques: [],
  books: [],
  mode: 'play',
  randomize: true,
  allowSkip: true
};