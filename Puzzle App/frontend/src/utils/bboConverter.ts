import type { Puzzle } from '../types/Puzzle';

/**
 * Converts our JSON hand format to BBO HandViewer format
 * Example: "♠Q-10-8-7-6 ♥Q-10-9-8-4 ♦3 ♣10-5" → "SQT876HQT984D3CT5"
 */
export function convertHandToBBO(handString: string): string {
  if (!handString) return '';

  let result = '';
  
  // Split by suits
  const suits = handString.split(' ');
  const suitMap = { '♠': 'S', '♥': 'H', '♦': 'D', '♣': 'C' };
  
  for (const suitSection of suits) {
    if (!suitSection.trim()) continue;
    
    // Extract suit symbol (first character)
    const suitSymbol = suitSection[0];
    const bboSuit = suitMap[suitSymbol as keyof typeof suitMap];
    
    if (!bboSuit) continue;
    
    // Extract cards (everything after suit symbol)
    const cards = suitSection.slice(1);
    
    if (cards === '-' || cards === '' || cards === 'void') {
      // Empty suit - just add the suit letter
      result += bboSuit;
    } else {
      // Convert cards: 10 → T, J/Q/K/A stay same, numbers stay same
      const convertedCards = cards
        .split('-')
        .map(card => card === '10' ? 'T' : card)
        .join('');
      
      result += bboSuit + convertedCards;
    }
  }
  
  return result;
}

/**
 * Parse which hands should be visible in the problem
 */
export function parseVisibleHands(visibleString: string): string[] {
  return visibleString.toLowerCase().split(',').map(s => s.trim());
}

/**
 * Create BBO HandViewer URL for a puzzle
 */
export function createBBOViewerURL(puzzle: Puzzle, showAllHands = false): string {
  const baseURL = 'https://www.bridgebase.com/tools/handviewer.html';
  const params = new URLSearchParams();
  
  // Convert all hands
  const northHand = convertHandToBBO(puzzle.all_hands_north);
  const southHand = convertHandToBBO(puzzle.all_hands_south);
  const eastHand = convertHandToBBO(puzzle.all_hands_east);
  const westHand = convertHandToBBO(puzzle.all_hands_west);
  
  // Determine which hands to show
  const visibleHands = showAllHands ? 
    ['north', 'south', 'east', 'west'] : 
    parseVisibleHands(puzzle.visible_in_problem || 'west,east');
  
  // Add hands based on visibility
  if (visibleHands.includes('north') && northHand) params.set('n', northHand);
  if (visibleHands.includes('south') && southHand) params.set('s', southHand);
  if (visibleHands.includes('east') && eastHand) params.set('e', eastHand);
  if (visibleHands.includes('west') && westHand) params.set('w', westHand);
  
  // Add dealer (declarer)
  if (puzzle.declarer) {
    const dealerMap = { 'North': 'n', 'South': 's', 'East': 'e', 'West': 'w' };
    const declarer = puzzle.declarer.toLowerCase();
    for (const [full, short] of Object.entries(dealerMap)) {
      if (full.toLowerCase() === declarer) {
        params.set('d', short);
        break;
      }
    }
  }
  
  // Add contract using BBO auction parameter format
  if (puzzle.final_contract) {
    const contract = parseContract(puzzle.final_contract);
    if (contract.level && contract.suit && contract.declarer) {
      // Convert to BBO auction format: a=-[level][suit][declarer]
      const suitMap: Record<string, string> = {
        '♠': 's', '♥': 'h', '♦': 'd', '♣': 'c',
        'NT': 'n', 'N': 'n', 'NoTrump': 'n'
      };
      const declarerMap: Record<string, string> = {
        'North': 'n', 'South': 's', 'East': 'e', 'West': 'w'
      };
      
      const bboSuit = suitMap[contract.suit] || contract.suit.toLowerCase();
      const bboDeclar = declarerMap[contract.declarer] || contract.declarer.toLowerCase().charAt(0);
      
      // BBO format: a=-4se means 4 spades by East
      const auctionParam = `-${contract.level}${bboSuit}${bboDeclar}`;
      params.set('a', auctionParam);
      
      console.log('🎯 BBO auction parameter:', auctionParam);
    }
  }
  
  // Add board number
  if (puzzle.puzzle_id) {
    params.set('b', puzzle.puzzle_id);
  }
  
  return `${baseURL}?${params.toString()}`;
}

/**
 * Extract contract information for display
 */
export function parseContract(contractString: string): {
  level: string;
  suit: string;
  declarer: string;
} {
  // Example: "6♦ by West" → { level: "6", suit: "♦", declarer: "West" }
  const match = contractString.match(/(\d+)(\S+)\s+by\s+(\w+)/i);
  
  if (match) {
    return {
      level: match[1],
      suit: match[2],
      declarer: match[3]
    };
  }
  
  return {
    level: '',
    suit: '',
    declarer: ''
  };
}

/**
 * Format difficulty symbol for display
 */
export function formatDifficulty(difficulty: string): string {
  const difficultyMap: Record<string, string> = {
    '♣': '♣ Beginner',
    '♦': '♦ Intermediate', 
    '♥': '♥ Advanced',
    '♠': '♠ Expert'
  };
  
  return difficultyMap[difficulty] || difficulty;
}