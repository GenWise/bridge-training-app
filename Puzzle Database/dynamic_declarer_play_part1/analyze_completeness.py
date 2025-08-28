#!/usr/bin/env python3
"""
Analyze completeness of the consolidated puzzle JSON file.
"""
import json
import sys
from collections import defaultdict

def analyze_puzzle_completeness(filename):
    """Analyze completeness of puzzles in JSON file."""
    
    with open(filename, 'r', encoding='utf-8') as f:
        puzzles = json.load(f)
    
    print(f"=== COMPLETENESS ANALYSIS REPORT ===")
    print(f"File: {filename}")
    print(f"Total puzzles in file: {len(puzzles)}")
    print()
    
    # Check puzzle IDs and create mapping
    puzzle_ids = []
    puzzles_by_id = {}
    
    for puzzle in puzzles:
        puzzle_id = puzzle.get('puzzle_id', 'MISSING')
        if puzzle_id != 'MISSING':
            try:
                puzzle_ids.append(int(puzzle_id))
                puzzles_by_id[int(puzzle_id)] = puzzle
            except ValueError:
                print(f"WARNING: Invalid puzzle_id format: {puzzle_id}")
    
    puzzle_ids.sort()
    
    # Check for gaps in sequence 1-170
    expected_range = set(range(1, 171))
    found_ids = set(puzzle_ids)
    missing_ids = expected_range - found_ids
    extra_ids = found_ids - expected_range
    
    print("=== PUZZLE ID COMPLETENESS ===")
    print(f"Expected puzzle range: 1-170 (170 puzzles)")
    print(f"Found puzzle IDs: {min(puzzle_ids) if puzzle_ids else 'N/A'}-{max(puzzle_ids) if puzzle_ids else 'N/A'} ({len(puzzle_ids)} puzzles)")
    
    if missing_ids:
        print(f"MISSING puzzle IDs: {sorted(missing_ids)} (Count: {len(missing_ids)})")
    else:
        print("✓ All puzzle IDs 1-170 are present")
    
    if extra_ids:
        print(f"EXTRA puzzle IDs: {sorted(extra_ids)} (Count: {len(extra_ids)})")
    else:
        print("✓ No extra puzzle IDs found")
    
    print()
    
    # Analyze field completeness
    essential_fields = [
        'puzzle_id',
        'all_hands_north',
        'all_hands_south', 
        'all_hands_east',
        'all_hands_west',
        'final_contract',
        'opening_lead'
    ]
    
    optional_fields = [
        'solution_line',
        'result_comparison',
        'additional_notes',
        'difficulty',
        'main_technique',
        'key_insight'
    ]
    
    print("=== FIELD COMPLETENESS ANALYSIS ===")
    
    field_stats = defaultdict(lambda: {'present': 0, 'missing': 0, 'empty': 0})
    incomplete_puzzles = []
    puzzles_with_solutions = 0
    
    for puzzle_id in range(1, 171):
        if puzzle_id not in puzzles_by_id:
            incomplete_puzzles.append(f"Puzzle {puzzle_id}: COMPLETELY MISSING")
            continue
            
        puzzle = puzzles_by_id[puzzle_id]
        puzzle_incomplete = False
        missing_fields = []
        
        # Check essential fields
        for field in essential_fields:
            if field not in puzzle:
                field_stats[field]['missing'] += 1
                missing_fields.append(f"{field} (missing)")
                puzzle_incomplete = True
            elif not puzzle[field] or str(puzzle[field]).strip() == '':
                field_stats[field]['empty'] += 1  
                missing_fields.append(f"{field} (empty)")
                puzzle_incomplete = True
            else:
                field_stats[field]['present'] += 1
        
        # Check optional fields
        for field in optional_fields:
            if field not in puzzle:
                field_stats[field]['missing'] += 1
            elif not puzzle[field] or str(puzzle[field]).strip() == '':
                field_stats[field]['empty'] += 1
            else:
                field_stats[field]['present'] += 1
        
        # Check for solution data
        has_solution = (puzzle.get('solution_line') and 
                       str(puzzle['solution_line']).strip() != '')
        if has_solution:
            puzzles_with_solutions += 1
            
        # Record significantly incomplete puzzles
        if puzzle_incomplete:
            incomplete_puzzles.append(f"Puzzle {puzzle_id}: Missing {', '.join(missing_fields)}")
    
    # Print field statistics
    print("Essential Fields:")
    for field in essential_fields:
        stats = field_stats[field]
        total = stats['present'] + stats['missing'] + stats['empty']
        print(f"  {field:20}: {stats['present']:3d} complete, {stats['missing']:3d} missing, {stats['empty']:3d} empty ({stats['present']}/{total} = {100*stats['present']/total if total > 0 else 0:.1f}%)")
    
    print("\nOptional Fields:")
    for field in optional_fields:
        stats = field_stats[field]
        total = stats['present'] + stats['missing'] + stats['empty']
        print(f"  {field:20}: {stats['present']:3d} complete, {stats['missing']:3d} missing, {stats['empty']:3d} empty ({stats['present']}/{total} = {100*stats['present']/total if total > 0 else 0:.1f}%)")
    
    print()
    
    # Summary statistics
    complete_puzzles = len([p for p in range(1, 171) if p in puzzles_by_id])
    incomplete_count = len(incomplete_puzzles)
    
    print("=== SUMMARY STATISTICS ===")
    print(f"Total puzzles expected: 170")
    print(f"Puzzles present in file: {complete_puzzles}")
    print(f"Puzzles with complete essential data: {complete_puzzles - incomplete_count}")
    print(f"Puzzles with some missing data: {incomplete_count}")
    print(f"Puzzles with solution data: {puzzles_with_solutions}")
    print(f"Puzzles missing solution data: {complete_puzzles - puzzles_with_solutions}")
    
    print()
    
    # Data quality assessment
    essential_complete = sum(field_stats[f]['present'] for f in essential_fields)
    essential_total = len(essential_fields) * complete_puzzles
    essential_completeness = 100 * essential_complete / essential_total if essential_total > 0 else 0
    
    solution_completeness = 100 * puzzles_with_solutions / complete_puzzles if complete_puzzles > 0 else 0
    
    print("=== DATA QUALITY ASSESSMENT ===")
    print(f"Essential field completeness: {essential_completeness:.1f}%")
    print(f"Solution data completeness: {solution_completeness:.1f}%")
    print(f"Overall puzzle availability: {100 * complete_puzzles / 170:.1f}%")
    
    if incomplete_count > 0:
        print(f"\n=== INCOMPLETE PUZZLES ({incomplete_count} found) ===")
        for issue in incomplete_puzzles[:20]:  # Show first 20
            print(f"  {issue}")
        if incomplete_count > 20:
            print(f"  ... and {incomplete_count - 20} more")
    
    # Sample a few puzzles to show structure
    print(f"\n=== SAMPLE PUZZLE STRUCTURES ===")
    sample_ids = [1, 50, 100, 150, 170]
    for sample_id in sample_ids:
        if sample_id in puzzles_by_id:
            puzzle = puzzles_by_id[sample_id]
            print(f"\nPuzzle {sample_id}:")
            print(f"  Contract: {puzzle.get('final_contract', 'MISSING')}")
            print(f"  Declarer: {puzzle.get('declarer', 'MISSING')}")
            print(f"  Opening Lead: {puzzle.get('opening_lead', 'MISSING')[:50]}...")
            print(f"  Has Solution: {'Yes' if puzzle.get('solution_line') else 'No'}")
            print(f"  Difficulty: {puzzle.get('difficulty', 'MISSING')}")
    
    return {
        'total_expected': 170,
        'total_found': complete_puzzles,
        'missing_ids': list(missing_ids),
        'incomplete_puzzles': incomplete_count,
        'with_solutions': puzzles_with_solutions,
        'essential_completeness': essential_completeness,
        'solution_completeness': solution_completeness
    }

if __name__ == "__main__":
    filename = "dynamic_declarer_play_part1_complete.json"
    results = analyze_puzzle_completeness(filename)