 BRIDGE PUZZLE BATCH EXTRACTION PROMPT

  Context: I'm manually re-extracting bridge puzzles from "Dynamic
  Declarer Play - Virtual European Championship part 1" by Krzysztof
  Martens. The PNG source pages are in /Users/rajeshpanchanathan/Library
  /CloudStorage/GoogleDrive-rajesh@genwise.in/My
  Drive/Personal/Bridge/Puzzle Database/Books/ with filenames
  temp_page-XXX.png where XXX = actual page number + 1.

  Current Status:
  - Puzzles 1-35: Need to check if batch files 01-07 still exist (I
  accidentally deleted them)
  - Puzzles 36-40: ✅ Completed in batch_08.json
  - Puzzles 41-170: Need re-extraction in batches of 10

  Task: Extract bridge puzzles in batches of 10 (except batch 08 which
  has 5 puzzles 36-40).

  EXTRACTION PROCESS:

  Step 1: Identify Batch Range
  - Batch 09: Puzzles 41-50
  - Batch 10: Puzzles 51-60
  - Batch 11: Puzzles 61-70
  - Continue pattern through Batch 21: Puzzles 161-170

  Step 2: Find Source Pages
  For each batch, determine which problem and solution pages contain the
   puzzles. Use these tools:
  - Task tool to search for puzzle locations if needed
  - Problem pages show: Board numbers, contracts, opening leads, visible
   hands
  - Solution pages show: Complete 4-hand diagrams, solution text, IMP
  results

  Step 3: Read Source Pages (use parallel reads for solution pages to speed up
   the process)
  Read both problem and solution pages using the Read tool:
  - Problem page: temp_page-XXX.png (where XXX = page number + 1)
  - Solution pages: Multiple pages, typically 6 pages later than problem
   page

  Step 4: Extract Data Per Puzzle
  For each puzzle, extract this exact JSON structure:
  {
    "puzzle_id": "XX",
    "problem_page": "XX",
    "solution_page": "XX",
    "book_title": "Dynamic Declarer Play - Virtual European Championship
   part 1",
    "author": "Krzysztof Martens",
    "final_contract": "X♠/♥/♦/♣/NT by West",
    "declarer": "West",
    "opening_lead": "♠X" or "♠X, S plays ♠Y" if noted,
    "all_hands_north": "♠X-X-X ♥X-X ♦X-X-X ♣X-X-X",
    "all_hands_east": "♠X-X-X ♥X-X ♦X-X-X ♣X-X-X",
    "all_hands_south": "♠X-X-X ♥X-X ♦X-X-X ♣X-X-X",
    "all_hands_west": "♠X-X-X ♥X-X ♦X-X-X ♣X-X-X",
    "vulnerability": "Extract from solution page",
    "dealer": "Extract from solution page if available",
    "main_technique": "Extract from solution page main point",
    "key_insight": "Extract from solution page key insight/order of
  play",
    "solution_summary": "Extract solution order of play text",
    "round_opponent": "Round X - Match against [Country]",
    "board_number": "XX",
    "bidding_sequence": "Not provided in detail",
    "making_contract": "Extract result info",
    "alternate_result": "Extract closed room result and IMP comparison",
    "difficulty_level": "Advanced/Intermediate/Beginner based on
  symbol",
    "educational_value": "Describe the learning objective",
    "related_concepts": "List key bridge concepts"
  }

  Step 5: Critical Hand Position Accuracy
  - WEST is ALWAYS the declarer in this book
  - Read solution page diagram carefully: West=bottom-left, North=top,
  East=right, South=bottom-right
  - Verify hands match the solution diagram positions exactly
  - Double-check contract and opening lead from problem page

  Step 6: Create Batch File
  Create file: dynamic_declarer_play_part1_batch_XX.json with array of
  10 puzzles.

  IMPORTANT NOTES:

  - PNG file numbers are offset: temp_page-049.png = page 48 in book
  - Difficulty symbols: ♣=Beginner, ♦=Intermediate, ♥=Advanced,
  ♠=Expert
  - West is always declarer - verify this in solution diagrams
  - Hand positions: Read solution page diagram positions carefully
  - Include complete solution text for educational value