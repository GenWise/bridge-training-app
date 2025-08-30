-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: JWT secret is handled by Supabase configuration, not database-level setting

-- Create puzzles table
CREATE TABLE puzzles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  puzzle_id TEXT UNIQUE NOT NULL,
  book_title TEXT NOT NULL,
  author TEXT,
  problem_page INTEGER,
  solution_page INTEGER,
  final_contract TEXT NOT NULL,
  declarer TEXT NOT NULL,
  opening_lead TEXT NOT NULL,
  all_hands_north TEXT NOT NULL,
  all_hands_south TEXT NOT NULL,
  all_hands_east TEXT NOT NULL,
  all_hands_west TEXT NOT NULL,
  visible_in_problem TEXT DEFAULT 'west,east',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('♣', '♦', '♥', '♠')),
  main_technique TEXT,
  key_insight TEXT,
  solution_line TEXT,
  result_comparison TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extends auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  skill_level TEXT DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  preferred_difficulties TEXT[] DEFAULT ARRAY['♣', '♦']::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  puzzle_ids TEXT[] NOT NULL,
  difficulty_filter TEXT,
  problem_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Create session_attempts table (tracks individual puzzle attempts within a session)
CREATE TABLE session_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  puzzle_id TEXT REFERENCES puzzles(puzzle_id) NOT NULL,
  user_reasoning TEXT,
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 10),
  ai_feedback TEXT,
  ai_strengths TEXT[],
  ai_improvements TEXT[],
  time_spent_seconds INTEGER DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, puzzle_id)
);

-- Create user_progress table (aggregated stats)
CREATE TABLE user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  technique TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('♣', '♦', '♥', '♠')),
  total_attempts INTEGER DEFAULT 0,
  average_score DECIMAL(3,1) DEFAULT 0.0,
  best_score INTEGER DEFAULT 0,
  last_attempt TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, technique, difficulty)
);

-- Create indexes for better performance
CREATE INDEX idx_puzzles_difficulty ON puzzles(difficulty);
CREATE INDEX idx_puzzles_technique ON puzzles(main_technique);
CREATE INDEX idx_puzzles_book ON puzzles(book_title);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at);
CREATE INDEX idx_session_attempts_session_id ON session_attempts(session_id);
CREATE INDEX idx_session_attempts_puzzle_id ON session_attempts(puzzle_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);

-- Enable Row Level Security
ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies

-- Puzzles are readable by everyone (public data)
CREATE POLICY "Puzzles are viewable by everyone" ON puzzles FOR SELECT USING (true);

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Sessions policies  
CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON sessions FOR UPDATE USING (auth.uid() = user_id);

-- Session attempts policies
CREATE POLICY "Users can view own session attempts" ON session_attempts FOR SELECT USING (
  EXISTS (SELECT 1 FROM sessions WHERE sessions.id = session_attempts.session_id AND sessions.user_id = auth.uid())
);
CREATE POLICY "Users can create own session attempts" ON session_attempts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM sessions WHERE sessions.id = session_attempts.session_id AND sessions.user_id = auth.uid())
);
CREATE POLICY "Users can update own session attempts" ON session_attempts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM sessions WHERE sessions.id = session_attempts.session_id AND sessions.user_id = auth.uid())
);

-- User progress policies
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_puzzles_updated_at BEFORE UPDATE ON puzzles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate and update user progress
CREATE OR REPLACE FUNCTION update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update progress stats when a new session attempt is recorded
  INSERT INTO user_progress (user_id, technique, difficulty, total_attempts, average_score, best_score, last_attempt)
  SELECT 
    s.user_id,
    p.main_technique,
    p.difficulty,
    1,
    NEW.ai_score,
    NEW.ai_score,
    NEW.submitted_at
  FROM sessions s
  JOIN puzzles p ON p.puzzle_id = NEW.puzzle_id
  WHERE s.id = NEW.session_id
  ON CONFLICT (user_id, technique, difficulty)
  DO UPDATE SET
    total_attempts = user_progress.total_attempts + 1,
    average_score = (user_progress.average_score * user_progress.total_attempts + NEW.ai_score) / (user_progress.total_attempts + 1),
    best_score = GREATEST(user_progress.best_score, NEW.ai_score),
    last_attempt = NEW.submitted_at;
    
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create trigger for progress tracking
CREATE TRIGGER update_progress_on_attempt AFTER INSERT ON session_attempts
  FOR EACH ROW EXECUTE FUNCTION update_user_progress();