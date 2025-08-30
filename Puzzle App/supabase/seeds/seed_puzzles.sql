-- This seed file will be populated with puzzle data migration script
-- For now, just create a few sample puzzles for testing

INSERT INTO puzzles (
  puzzle_id,
  book_title,
  author,
  problem_page,
  solution_page,
  final_contract,
  declarer,
  opening_lead,
  all_hands_north,
  all_hands_south,
  all_hands_east,
  all_hands_west,
  visible_in_problem,
  difficulty,
  main_technique,
  key_insight,
  solution_line,
  result_comparison,
  additional_notes
) VALUES
(
  'sample_001',
  'Dynamic Declarer Play Part 1',
  'Sample Author',
  1,
  101,
  '3NT by South',
  'South',
  '♠4',
  '♠A-K-Q ♥J-10-9 ♦A-K-Q ♣A-K-Q',
  '♠J-10-9 ♥A-K-Q ♦J-10-9 ♣J-10-9',
  '♠8-7-6 ♥8-7-6 ♦8-7-6 ♣8-7-6',
  '♠5-4-3-2 ♥5-4-3-2 ♦5-4-3-2 ♣5-4-3-2',
  'west,east',
  '♣',
  'Safety Play',
  'Need to ensure 9 tricks without allowing defense to establish 5 tricks first',
  'Win the opening lead, count tricks (7 top tricks), need 2 more. Lead small to jack, if it holds, continue suit. If it loses, hope for favorable splits.',
  'Making 3NT scores +400. Going down scores -50 to -150 depending on vulnerability.',
  'Basic safety play example for beginners'
),
(
  'sample_002', 
  'Dynamic Declarer Play Part 1',
  'Sample Author',
  2,
  102,
  '4♠ by South',
  'South',
  '♥K',
  '♠K-Q-J ♥A-10-9 ♦A-K-Q ♣A-K-Q',
  '♠A-10-9-8-7 ♥J-8-7 ♦J-10-9 ♣J-10',
  '♠6-5-4 ♥Q-6-5-4 ♦8-7-6 ♣9-8-7',
  '♠3-2 ♥K-3-2 ♦5-4-3-2 ♣6-5-4-3-2',
  'west,east',
  '♦',
  'Trump Management',
  'Need to draw trumps efficiently while maintaining control',
  'Win heart ace, lead trump to ace, back to hand with club, lead trump to king. If trumps split 3-2, draw last trump and claim. If 4-1, need to adjust plan.',
  'Making 4♠ scores +420. Going down scores -50 to -100.',
  'Intermediate trump drawing technique'
);

-- Add a few more sample puzzles for different difficulties
INSERT INTO puzzles (puzzle_id, book_title, author, final_contract, declarer, opening_lead, all_hands_north, all_hands_south, all_hands_east, all_hands_west, difficulty, main_technique, key_insight, solution_line) VALUES
('sample_003', 'Test Puzzles', 'Test Author', '6♦ by South', 'South', '♠K', '♠A-Q ♥K-Q-J ♦A-K-Q-J ♣A-K', '♠J-10 ♥A-10-9 ♦10-9-8-7 ♣Q-J', '♠9-8-7 ♥8-7-6 ♦6-5 ♣10-9-8', '♠K-6-5-4-3-2 ♥5-4-3-2 ♦4-3-2 ♣7', '♥', 'Finesse', 'Need to locate missing honors for slam', 'Win ace of spades, finesse queen, if successful play for drop of king'),
('sample_004', 'Test Puzzles', 'Test Author', '7NT by South', 'South', '♠2', '♠A-K-Q ♥A-K-Q ♦A-K-Q ♣A-K', '♠J-10-9 ♥J-10-9 ♦J-10-9 ♣Q-J', '♠8-7-6 ♥8-7-6 ♦8-7-6 ♣10-9', '♠5-4-3-2 ♥5-4-3-2 ♦5-4-3-2 ♣8', '♠', 'Squeeze', 'Advanced squeeze technique required', 'Count tricks, identify squeeze possibilities');