export interface Puzzle {
  puzzle_id: string;
  problem_page: string;
  solution_page: string;
  book_title: string;
  author: string;
  dealer: string;
  vulnerability: string;
  bidding_sequence: string;
  final_contract: string;
  declarer: string;
  opening_lead: string;
  all_hands_north: string;
  all_hands_south: string;
  all_hands_east: string;
  all_hands_west: string;
  visible_in_problem: string;
  difficulty: string; // ♣, ♦, ♥, ♠
  puzzle_type: string;
  problem_setup: string;
  main_technique: string;
  key_insight: string;
  solution_line: string;
  result_comparison: string;
  round_opponent: string;
  additional_notes: string;
}

export interface PuzzleMetadata {
  id: string;
  contract: string;
  declarer: string;
  lead: string;
  difficulty: DifficultyLevel;
  technique: string;
  book: string;
}

export type DifficultySymbol = '♣' | '♦' | '♥' | '♠';

export interface DifficultyLevel {
  symbol: DifficultySymbol;
  name: string;
  description: string;
}

export const DIFFICULTY_LEVELS: Record<DifficultySymbol, DifficultyLevel> = {
  '♣': { symbol: '♣', name: 'Beginner', description: 'Basic techniques and straightforward problems' },
  '♦': { symbol: '♦', name: 'Intermediate', description: 'More complex situations requiring careful planning' },
  '♥': { symbol: '♥', name: 'Advanced', description: 'Sophisticated techniques and challenging problems' },
  '♠': { symbol: '♠', name: 'Expert', description: 'Highest level problems for experienced players' }
};

export interface PuzzleFilter {
  difficulty?: DifficultySymbol | 'all';
  technique?: string;
  book?: string;
  count: number;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}