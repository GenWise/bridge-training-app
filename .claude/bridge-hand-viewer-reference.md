# Bridge Hand Viewer Implementation Reference

## Bridge Base Online Hand Viewer Format

### Hand Representation
- Hands specified using parameters: `n`, `s`, `e`, `w` for North, South, East, West
- 13-card hands use single string of cards
- Card representation rules:
  - Use T for 10 (not 10)
  - Suits in order: ♠♥♦♣ 
  - Example: `s=sakqhakqdakqcakqj`

### Key Parameters for Our Implementation
1. **Hand Specification**
   - `n`, `s`, `e`, `w`: Individual hands
   - `nn`, `sn`, `en`, `wn`: Player names  
   - `d`: Dealer (n, s, e, w)
   - `v`: Vulnerability (n, e, b, -)

2. **Display Parameters**
   - Can embed as iframe: `//www.bridgebase.com/tools/handviewer.html?s=cards&n=cards...`
   - Supports flexible sizing
   - Kibitz mode (show limited hands)

## Our Puzzle JSON Structure Analysis

### Current Format (from batch_01.json):
```json
{
  "puzzle_id": "1",
  "final_contract": "6♦ by West",
  "declarer": "West", 
  "opening_lead": "♥10, you play the jack and win the trick",
  "all_hands_north": "♠Q-10-8-7-6 ♥Q-10-9-8-4 ♦3 ♣10-5",
  "all_hands_south": "♠J-9-4-2 ♥7 ♦J-10-6-5 ♣K-J-9-6", 
  "all_hands_east": "♠A-K ♥J-6-5 ♦A-7 ♣Q-8-7-4-3-2",
  "all_hands_west": "♠5-3 ♥A-K-3-2 ♦K-Q-9-8-4-2 ♣A",
  "visible_in_problem": "West,East",
  "problem_setup": "Contract 6♦. Lead ♥10. You play the jack and win the trick."
}
```

### Data Transformation Needed:
1. **Hand Format Conversion**: `♠Q-10-8-7-6 ♥Q-10-9-8-4 ♦3 ♣10-5` → BBO format
2. **Suit Symbol Mapping**: Our JSON has ♠♥♦♣, BBO wants `shdc`
3. **Card Value Mapping**: `10` → `T`, `J` → `J`, etc.
4. **Visibility Logic**: Only show hands listed in `visible_in_problem`

## Implementation Strategy

### Phase 1: Text-Based Display (Immediate)
- Clean, formatted text display of hands
- Mobile-optimized layout
- Show only visible hands initially
- Proper suit symbols and spacing

### Phase 2: BBO Integration (Future Enhancement)  
- Convert JSON format to BBO hand viewer URLs
- Embed BBO hand viewer as iframe
- Handle responsive sizing for mobile
- Fall back to text if iframe fails

### Conversion Functions Needed:
```typescript
// Convert "♠Q-10-8-7-6 ♥Q-10-9-8-4 ♦3 ♣10-5" 
// To BBO format: "SQT876HQT984D3CT5"

function convertHandToBBO(handString: string): string
function createBBOViewerURL(puzzle: Puzzle): string  
function parseVisibleHands(visible: string): string[]
```

### Quiz Component Structure:
```typescript
interface QuizState {
  currentPuzzleIndex: number;
  totalPuzzles: number;
  puzzle: Puzzle;
  userReasoning: string;
  showSolution: boolean;
}
```

This reference will guide the implementation of both immediate text display and future BBO integration.