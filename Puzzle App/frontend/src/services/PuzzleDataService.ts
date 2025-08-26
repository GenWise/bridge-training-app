import type { Puzzle } from '../types/Puzzle';

class PuzzleDataService {
  private cache: Puzzle[] | null = null;
  private loadPromise: Promise<Puzzle[]> | null = null;

  private readonly BATCH_FILES = [
    'dynamic_declarer_play_part1_batch_01.json',
    'dynamic_declarer_play_part1_batch_02.json',
    'dynamic_declarer_play_part1_batch_03.json',
    'dynamic_declarer_play_part1_batch_04.json',
    'dynamic_declarer_play_part1_batch_05.json',
    'dynamic_declarer_play_part1_batch_06.json',
    'dynamic_declarer_play_part1_batch_07.json',
    'dynamic_declarer_play_part1_batch_08.json',
    'dynamic_declarer_play_part1_batch_09.json',
    'dynamic_declarer_play_part1_batch_10.json'
  ];

  async loadAllPuzzles(): Promise<Puzzle[]> {
    // Return cached data if available
    if (this.cache) {
      return this.cache;
    }

    // Return existing promise if already loading
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Create new load promise
    this.loadPromise = this.fetchAndCombineData();
    
    try {
      this.cache = await this.loadPromise;
      return this.cache;
    } catch (error) {
      // Reset promise on error to allow retry
      this.loadPromise = null;
      throw error;
    }
  }

  private async fetchAndCombineData(): Promise<Puzzle[]> {
    const allPuzzles: Puzzle[] = [];

    for (const filename of this.BATCH_FILES) {
      try {
        const response = await fetch(`/data/${filename}`);
        if (!response.ok) {
          throw new Error(`Failed to load ${filename}: ${response.statusText}`);
        }
        
        const batchData: Puzzle[] = await response.json();
        allPuzzles.push(...batchData);
      } catch (error) {
        console.error(`Error loading batch file ${filename}:`, error);
        throw new Error(`Failed to load puzzle data from ${filename}`);
      }
    }

    if (allPuzzles.length === 0) {
      throw new Error('No puzzle data loaded');
    }

    console.log(`Successfully loaded ${allPuzzles.length} puzzles from ${this.BATCH_FILES.length} batch files`);
    return allPuzzles;
  }

  // Clear cache (useful for testing or data refresh)
  clearCache(): void {
    this.cache = null;
    this.loadPromise = null;
  }
}

export const puzzleDataService = new PuzzleDataService();