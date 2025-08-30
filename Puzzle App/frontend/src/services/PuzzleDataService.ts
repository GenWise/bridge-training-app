import type { Puzzle } from '../types/Puzzle';

class PuzzleDataService {
  private cache: Puzzle[] | null = null;
  private loadPromise: Promise<Puzzle[]> | null = null;

  private readonly BATCH_FILES = [
    'standardized_batch_01.json',
    'standardized_batch_02.json',
    'standardized_batch_03.json',
    'standardized_batch_04.json',
    'standardized_batch_05.json',
    'standardized_batch_06.json',
    'standardized_batch_07.json',
    'standardized_dynamic_declarer_play_part1_batch_08.json',
    'standardized_dynamic_declarer_play_part1_batch_09.json',
    'standardized_dynamic_declarer_play_part1_batch_10.json',
    'standardized_dynamic_declarer_play_part1_batch_11.json',
    'standardized_dynamic_declarer_play_part1_batch_12.json',
    'standardized_batch_13_puzzles_81_90.json',
    'standardized_batch_14_puzzles_91_100.json',
    'standardized_batch_15_puzzles_101_110.json',
    'standardized_batch_16_puzzles_111_120.json',
    'standardized_batch_17_puzzles_121_130.json',
    'standardized_batch_18_puzzles_131_140.json',
    'standardized_batch_19_puzzles_141_150.json',
    'standardized_batch_20_puzzles_151_160.json',
    'standardized_batch_21_puzzles_161_170.json'
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
        const response = await fetch(`/data/standardized/${filename}`);
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