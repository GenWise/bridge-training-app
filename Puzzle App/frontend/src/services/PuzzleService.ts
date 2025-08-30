import type { Puzzle, DifficultySymbol, PuzzleFilter } from '../types/Puzzle';
import { puzzleDataService } from './PuzzleDataService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

class PuzzleService {
  async getAllPuzzles(): Promise<Puzzle[]> {
    if (isSupabaseConfigured()) {
      return this.loadPuzzlesFromSupabase();
    } else {
      console.log('📂 Loading puzzles from JSON files (offline mode)');
      return puzzleDataService.loadAllPuzzles();
    }
  }

  private async loadPuzzlesFromSupabase(): Promise<Puzzle[]> {
    try {
      const { data, error } = await supabase
        .from('puzzles')
        .select('*')
        .order('puzzle_id');

      if (error) {
        console.error('Error loading puzzles from Supabase:', error);
        throw new Error(`Failed to load puzzles: ${error.message}`);
      }

      console.log(`🗄️ Successfully loaded ${data?.length || 0} puzzles from Supabase`);
      return data || [];
    } catch (error) {
      console.error('Failed to load puzzles from Supabase:', error);
      console.log('📂 Falling back to JSON files');
      return puzzleDataService.loadAllPuzzles();
    }
  }

  async filterPuzzles(filter: PuzzleFilter): Promise<Puzzle[]> {
    const allPuzzles = await this.getAllPuzzles();
    
    let filtered = allPuzzles;

    // Filter by difficulty
    if (filter.difficulty && filter.difficulty !== 'all') {
      filtered = filtered.filter(puzzle => puzzle.difficulty === filter.difficulty);
    }

    // Filter by technique (if specified)
    if (filter.technique) {
      filtered = filtered.filter(puzzle => 
        puzzle.main_technique.toLowerCase().includes(filter.technique!.toLowerCase())
      );
    }

    // Filter by book (if specified)
    if (filter.book) {
      filtered = filtered.filter(puzzle => 
        puzzle.book_title.toLowerCase().includes(filter.book!.toLowerCase())
      );
    }

    return filtered;
  }

  async getRandomPuzzles(filter: PuzzleFilter): Promise<Puzzle[]> {
    const filteredPuzzles = await this.filterPuzzles(filter);

    if (filteredPuzzles.length === 0) {
      throw new Error(`No puzzles found matching the specified criteria`);
    }

    if (filteredPuzzles.length <= filter.count) {
      // If we have fewer puzzles than requested, return all available
      return this.shuffleArray([...filteredPuzzles]);
    }

    // Randomly select the requested number of puzzles
    const shuffled = this.shuffleArray([...filteredPuzzles]);
    return shuffled.slice(0, filter.count);
  }

  async getPuzzlesByDifficulty(difficulty: DifficultySymbol, count: number = 3): Promise<Puzzle[]> {
    return this.getRandomPuzzles({
      difficulty,
      count
    });
  }

  async getAvailableDifficulties(): Promise<{ difficulty: DifficultySymbol; count: number }[]> {
    const allPuzzles = await this.getAllPuzzles();
    const counts = new Map<DifficultySymbol, number>();

    allPuzzles.forEach(puzzle => {
      const difficulty = puzzle.difficulty as DifficultySymbol;
      counts.set(difficulty, (counts.get(difficulty) || 0) + 1);
    });

    return Array.from(counts.entries()).map(([difficulty, count]) => ({
      difficulty,
      count
    }));
  }

  async getAvailableTechniques(): Promise<string[]> {
    const allPuzzles = await this.getAllPuzzles();
    const techniques = new Set<string>();

    allPuzzles.forEach(puzzle => {
      if (puzzle.main_technique) {
        techniques.add(puzzle.main_technique);
      }
    });

    return Array.from(techniques).sort();
  }

  async getAvailableBooks(): Promise<string[]> {
    const allPuzzles = await this.getAllPuzzles();
    const books = new Set<string>();

    allPuzzles.forEach(puzzle => {
      if (puzzle.book_title) {
        books.add(puzzle.book_title);
      }
    });

    return Array.from(books).sort();
  }

  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // Helper method to get puzzle metadata for display
  getPuzzleMetadata(puzzle: Puzzle) {
    return {
      id: puzzle.puzzle_id,
      contract: puzzle.final_contract,
      declarer: puzzle.declarer,
      lead: puzzle.opening_lead,
      difficulty: puzzle.difficulty as DifficultySymbol,
      technique: puzzle.main_technique,
      book: puzzle.book_title,
      setup: puzzle.problem_setup
    };
  }
}

export const puzzleService = new PuzzleService();