#!/usr/bin/env python3
"""
Clean the JSON file by removing duplicates and analyze what's missing.
"""
import json

def clean_and_analyze():
    """Clean duplicates and create detailed analysis."""
    
    # Load the data
    with open('dynamic_declarer_play_part1_complete.json', 'r') as f:
        puzzles = json.load(f)
    
    print("=== CLEANING AND FINAL ANALYSIS ===")
    print(f"Original puzzle count: {len(puzzles)}")
    
    # Remove duplicates by keeping first occurrence of each puzzle_id
    seen_ids = set()
    cleaned_puzzles = []
    duplicates_removed = []
    
    for puzzle in puzzles:
        pid = puzzle.get('puzzle_id')
        if pid:
            try:
                pid_int = int(pid)
                if pid_int not in seen_ids:
                    seen_ids.add(pid_int)
                    cleaned_puzzles.append(puzzle)
                else:
                    duplicates_removed.append(pid_int)
            except ValueError:
                print(f"WARNING: Invalid puzzle_id: {pid}")
    
    print(f"After removing duplicates: {len(cleaned_puzzles)} puzzles")
    print(f"Duplicates removed: {sorted(duplicates_removed)}")
    
    # Save cleaned version
    with open('dynamic_declarer_play_part1_cleaned.json', 'w') as f:
        json.dump(cleaned_puzzles, f, indent=2, ensure_ascii=False)
    
    print(f"Saved cleaned version to: dynamic_declarer_play_part1_cleaned.json")
    
    # Analyze completeness of cleaned data
    puzzles_by_id = {int(p['puzzle_id']): p for p in cleaned_puzzles}
    
    # Check for complete vs incomplete puzzles
    complete_puzzles = []  # Have all hand data and solution
    partial_puzzles = []   # Have hand data but no solution  
    missing_hands = []     # Missing hand data
    
    for pid in range(1, 171):
        if pid not in puzzles_by_id:
            missing_hands.append(pid)
            continue
            
        puzzle = puzzles_by_id[pid]
        
        # Check if has all hands
        has_all_hands = all(puzzle.get(f'all_hands_{pos}') 
                          for pos in ['north', 'south', 'east', 'west'])
        
        # Check if has solution
        has_solution = puzzle.get('solution_line') and str(puzzle['solution_line']).strip()
        
        if not has_all_hands:
            missing_hands.append(pid)
        elif has_solution:
            complete_puzzles.append(pid)
        else:
            partial_puzzles.append(pid)
    
    print(f"\n=== FINAL COMPLETENESS SUMMARY ===")
    print(f"Total expected: 170 puzzles")
    print(f"Puzzles with complete data (hands + solution): {len(complete_puzzles)}")
    print(f"Puzzles with hands only (no solution): {len(partial_puzzles)}")
    print(f"Puzzles missing hand data: {len(missing_hands)}")
    
    if complete_puzzles:
        print(f"\nComplete puzzles (1-{max(complete_puzzles)}): {len(complete_puzzles)} puzzles")
        print(f"Range coverage: Puzzles 1-{max(complete_puzzles)}")
    
    if partial_puzzles:
        print(f"\nPartial puzzles: {partial_puzzles}")
    
    if missing_hands:
        print(f"\nMissing hand data: {min(missing_hands)}-{max(missing_hands)} ({len(missing_hands)} puzzles)")
    
    # Data extraction status by page ranges
    print(f"\n=== DATA EXTRACTION STATUS BY RANGE ===")
    ranges = [
        (1, 30, "Pages 10-80"),
        (31, 60, "Pages 82-144"), 
        (61, 90, "Pages 146-210"),
        (91, 120, "Pages 212-278"),
        (121, 150, "Pages 280-344"),
        (151, 170, "Pages 346-386")
    ]
    
    for start, end, page_range in ranges:
        range_complete = [p for p in complete_puzzles if start <= p <= end]
        range_partial = [p for p in partial_puzzles if start <= p <= end] 
        range_missing = [p for p in missing_hands if start <= p <= end]
        
        print(f"Puzzles {start:3d}-{end:3d} ({page_range:15s}): "
              f"{len(range_complete):2d} complete, {len(range_partial):2d} partial, "
              f"{len(range_missing):2d} missing")
    
    # Success metrics
    extraction_success = len(complete_puzzles) / 170 * 100
    hand_data_success = (len(complete_puzzles) + len(partial_puzzles)) / 170 * 100
    
    print(f"\n=== SUCCESS METRICS ===")
    print(f"Complete extraction success: {extraction_success:.1f}% ({len(complete_puzzles)}/170)")
    print(f"Hand data extraction success: {hand_data_success:.1f}% ({len(complete_puzzles) + len(partial_puzzles)}/170)")
    print(f"Solution data extraction: {len(complete_puzzles)}/{len(complete_puzzles) + len(partial_puzzles)} = {len(complete_puzzles)/(len(complete_puzzles) + len(partial_puzzles)) * 100:.1f}% of puzzles with hands")
    
    return {
        'total_clean': len(cleaned_puzzles),
        'complete': len(complete_puzzles),
        'partial': len(partial_puzzles), 
        'missing': len(missing_hands),
        'extraction_success': extraction_success
    }

if __name__ == "__main__":
    results = clean_and_analyze()