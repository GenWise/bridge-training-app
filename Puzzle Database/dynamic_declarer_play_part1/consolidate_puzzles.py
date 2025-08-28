#!/usr/bin/env python3
"""
Consolidate all dynamic_declarer_play_part1 batch JSON files into a single complete file.
"""

import json
import os
from pathlib import Path

def consolidate_puzzle_files():
    """Read all batch files and consolidate into a single JSON file."""
    
    # Define the directory path
    base_dir = Path("/Users/rajeshpanchanathan/Library/CloudStorage/GoogleDrive-rajesh@genwise.in/My Drive/Personal/Bridge/Puzzle Database/dynamic_declarer_play_part1/")
    
    # Initialize list to store all puzzles
    all_puzzles = []
    
    # Process files batch_01 through batch_27
    total_files_processed = 0
    for batch_num in range(1, 28):  # 1 to 27 inclusive
        batch_file = base_dir / f"dynamic_declarer_play_part1_batch_{batch_num:02d}.json"
        
        if batch_file.exists():
            print(f"Processing {batch_file.name}...")
            try:
                with open(batch_file, 'r', encoding='utf-8') as f:
                    batch_data = json.load(f)
                    
                # Add all puzzles from this batch
                if isinstance(batch_data, list):
                    all_puzzles.extend(batch_data)
                    print(f"  Added {len(batch_data)} puzzles")
                else:
                    print(f"  Warning: {batch_file.name} does not contain a list")
                    
                total_files_processed += 1
                    
            except json.JSONDecodeError as e:
                print(f"  Error parsing {batch_file.name}: {e}")
            except Exception as e:
                print(f"  Error reading {batch_file.name}: {e}")
        else:
            print(f"Warning: {batch_file.name} not found")
    
    print(f"\nTotal files processed: {total_files_processed}")
    print(f"Total puzzles before sorting: {len(all_puzzles)}")
    
    # Sort puzzles by puzzle_id numerically
    def get_puzzle_id(puzzle):
        """Extract puzzle_id as integer for proper numerical sorting."""
        try:
            return int(puzzle.get('puzzle_id', '0'))
        except (ValueError, TypeError):
            return 0
    
    all_puzzles.sort(key=get_puzzle_id)
    
    # Verify sorting worked correctly
    print("\nFirst 10 puzzle IDs after sorting:")
    for i, puzzle in enumerate(all_puzzles[:10]):
        print(f"  {i+1}: puzzle_id = {puzzle.get('puzzle_id', 'N/A')}")
    
    if len(all_puzzles) > 10:
        print(f"...\nLast 5 puzzle IDs:")
        for i, puzzle in enumerate(all_puzzles[-5:], len(all_puzzles)-4):
            print(f"  {i}: puzzle_id = {puzzle.get('puzzle_id', 'N/A')}")
    
    # Write consolidated file
    output_file = base_dir / "dynamic_declarer_play_part1_complete.json"
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_puzzles, f, indent=2, ensure_ascii=False)
        
        print(f"\nSuccessfully created {output_file.name}")
        print(f"Total puzzles consolidated: {len(all_puzzles)}")
        
        # Verify file was created and get size
        file_size = output_file.stat().st_size
        print(f"Output file size: {file_size:,} bytes ({file_size / (1024*1024):.2f} MB)")
        
    except Exception as e:
        print(f"Error writing consolidated file: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Starting puzzle consolidation...")
    success = consolidate_puzzle_files()
    if success:
        print("\nConsolidation completed successfully!")
    else:
        print("\nConsolidation failed!")