#!/usr/bin/env python3
"""
Migration script to transfer puzzle data from JSON files to Supabase database.
Run this after setting up Supabase and running migrations.
"""

import json
import os
import sys
from pathlib import Path

# Add parent directory to path to access puzzle standardization utilities
sys.path.append(str(Path(__file__).parent.parent))

def load_puzzle_files(data_dir):
    """Load all puzzle JSON files from the standardized directory."""
    puzzle_files = []
    standardized_dir = Path(data_dir) / "standardized"
    
    if not standardized_dir.exists():
        print(f"❌ Standardized directory not found: {standardized_dir}")
        print("Please run the standardization script first.")
        return []
    
    for file_path in standardized_dir.glob("*.json"):
        if file_path.name.startswith(("standardized_batch_", "standardized_dynamic_")):
            puzzle_files.append(file_path)
    
    return sorted(puzzle_files)

def clean_puzzle_data(puzzle):
    """Clean and validate puzzle data before insertion."""
    # Map old field names to new schema if needed
    cleaned = {
        'puzzle_id': puzzle.get('puzzle_id', ''),
        'book_title': puzzle.get('book_title', ''),
        'author': puzzle.get('author', ''),
        'problem_page': puzzle.get('problem_page'),
        'solution_page': puzzle.get('solution_page'),
        'final_contract': puzzle.get('final_contract', ''),
        'declarer': puzzle.get('declarer', ''),
        'opening_lead': puzzle.get('opening_lead', ''),
        'all_hands_north': puzzle.get('all_hands_north', ''),
        'all_hands_south': puzzle.get('all_hands_south', ''),
        'all_hands_east': puzzle.get('all_hands_east', ''),
        'all_hands_west': puzzle.get('all_hands_west', ''),
        'visible_in_problem': ','.join(puzzle.get('visible_in_problem', ['west', 'east'])) if isinstance(puzzle.get('visible_in_problem'), list) else puzzle.get('visible_in_problem', 'west,east'),
        'difficulty': puzzle.get('difficulty', '♣'),
        'main_technique': puzzle.get('main_technique', ''),
        'key_insight': puzzle.get('key_insight', ''),
        'solution_line': puzzle.get('solution_line', ''),
        'result_comparison': puzzle.get('result_comparison', ''),
        'additional_notes': puzzle.get('additional_notes', '')
    }
    
    # Convert None values to empty strings for text fields
    for key, value in cleaned.items():
        if value is None and key not in ['problem_page', 'solution_page']:
            cleaned[key] = ''
    
    return cleaned

def generate_sql_insert_statements(puzzle_files, output_file):
    """Generate SQL INSERT statements for all puzzles."""
    
    all_puzzles = []
    total_puzzles = 0
    
    # Load all puzzles from files
    for file_path in puzzle_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Handle both array format and object format
                if isinstance(data, list):
                    puzzles = data
                else:
                    puzzles = data.get('puzzles', [])
                all_puzzles.extend(puzzles)
                total_puzzles += len(puzzles)
                print(f"✓ Loaded {len(puzzles)} puzzles from {file_path.name}")
        except Exception as e:
            print(f"❌ Error loading {file_path}: {e}")
            continue
    
    print(f"\n📊 Total puzzles to migrate: {total_puzzles}")
    
    # Generate SQL
    sql_statements = []
    sql_statements.append("-- Auto-generated puzzle migration")
    sql_statements.append("-- Delete existing sample data")
    sql_statements.append("DELETE FROM puzzles WHERE puzzle_id LIKE 'sample_%';")
    sql_statements.append("")
    sql_statements.append("-- Insert puzzle data")
    
    for i, puzzle in enumerate(all_puzzles):
        try:
            cleaned = clean_puzzle_data(puzzle)
            
            # Create SQL INSERT statement
            sql = f"""INSERT INTO puzzles (
    puzzle_id, book_title, author, problem_page, solution_page,
    final_contract, declarer, opening_lead,
    all_hands_north, all_hands_south, all_hands_east, all_hands_west,
    visible_in_problem, difficulty, main_technique, key_insight,
    solution_line, result_comparison, additional_notes
) VALUES (
    '{cleaned["puzzle_id"].replace("'", "''")}',
    '{cleaned["book_title"].replace("'", "''")}',
    '{cleaned["author"].replace("'", "''")}',
    {cleaned["problem_page"] if cleaned["problem_page"] is not None else 'NULL'},
    {cleaned["solution_page"] if cleaned["solution_page"] is not None else 'NULL'},
    '{cleaned["final_contract"].replace("'", "''")}',
    '{cleaned["declarer"].replace("'", "''")}',
    '{cleaned["opening_lead"].replace("'", "''")}',
    '{cleaned["all_hands_north"].replace("'", "''")}',
    '{cleaned["all_hands_south"].replace("'", "''")}',
    '{cleaned["all_hands_east"].replace("'", "''")}',
    '{cleaned["all_hands_west"].replace("'", "''")}',
    '{cleaned["visible_in_problem"].replace("'", "''")}',
    '{cleaned["difficulty"]}',
    '{cleaned["main_technique"].replace("'", "''")}',
    '{cleaned["key_insight"].replace("'", "''")}',
    '{cleaned["solution_line"].replace("'", "''")}',
    '{cleaned["result_comparison"].replace("'", "''")}',
    '{cleaned["additional_notes"].replace("'", "''")}'
);"""
            sql_statements.append(sql)
            
        except Exception as e:
            print(f"❌ Error processing puzzle {i+1}: {e}")
            continue
    
    # Write SQL file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(sql_statements))
        print(f"✅ Generated SQL migration file: {output_file}")
        return len(all_puzzles)
    except Exception as e:
        print(f"❌ Error writing SQL file: {e}")
        return 0

def main():
    # Paths
    puzzle_data_dir = Path("/Users/rajeshpanchanathan/Library/CloudStorage/GoogleDrive-rajesh@genwise.in/My Drive/Personal/Bridge/Puzzle Database/dynamic_declarer_play_part1")
    output_sql = Path("../supabase/seeds/migrate_puzzles.sql")
    
    print("🌉 Bridge Puzzle Migration to Supabase")
    print("=" * 50)
    
    # Check if puzzle directory exists
    if not puzzle_data_dir.exists():
        print(f"❌ Puzzle data directory not found: {puzzle_data_dir}")
        print("Please ensure the puzzle data directory exists and contains standardized JSON files.")
        return 1
    
    # Load puzzle files
    puzzle_files = load_puzzle_files(puzzle_data_dir)
    if not puzzle_files:
        print("❌ No puzzle files found to migrate.")
        return 1
    
    print(f"📁 Found {len(puzzle_files)} puzzle batch files to process")
    
    # Generate SQL migration
    puzzle_count = generate_sql_insert_statements(puzzle_files, output_sql)
    
    if puzzle_count > 0:
        print(f"\n✅ Migration complete!")
        print(f"📊 {puzzle_count} puzzles ready for Supabase")
        print(f"📄 SQL file: {output_sql}")
        print("\nNext steps:")
        print("1. Start Supabase: npx supabase start")
        print("2. Run migration: npx supabase db reset")
        print("3. The puzzles will be automatically seeded")
    else:
        print("❌ Migration failed")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())