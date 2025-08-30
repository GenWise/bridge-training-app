import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Puzzle } from '../types/Puzzle'
import type { AIScoreResult } from './AIService'

export interface SessionAttempt {
  id?: string
  session_id: string
  puzzle_id: string
  user_reasoning: string
  ai_score: number
  ai_feedback: string
  ai_strengths: string[]
  ai_improvements: string[]
  time_spent_seconds: number
  submitted_at: string
}

export interface Session {
  id?: string
  user_id?: string
  name?: string
  puzzle_ids: string[]
  difficulty_filter?: string
  problem_count: number
  created_at?: string
  completed_at?: string
  is_active: boolean
}

export interface UserProgress {
  technique: string
  difficulty: string
  total_attempts: number
  average_score: number
  best_score: number
  last_attempt: string
}

class ProgressService {
  private localSessions: Session[] = []
  private localAttempts: SessionAttempt[] = []

  // Session Management
  async createSession(puzzles: Puzzle[], difficultyFilter?: string): Promise<string> {
    if (isSupabaseConfigured()) {
      try {
        // Get current user session to determine if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // User is authenticated - save to Supabase
          const sessionData = {
            user_id: session.user.id,
            puzzle_ids: puzzles.map(p => p.puzzle_id),
            difficulty_filter: difficultyFilter,
            problem_count: puzzles.length,
            is_active: true
          }

          const { data, error } = await supabase
            .from('sessions')
            .insert([sessionData])
            .select()
            .single()

          if (error) throw error
          console.log('✅ Session created in Supabase for authenticated user:', data.id)
          return data.id
        } else {
          console.log('📱 No authenticated user, creating session locally')
        }
      } catch (error) {
        console.warn('Failed to save session to Supabase, using local storage:', error)
      }
    } else {
      console.log('📱 Supabase not configured, creating session locally')
    }

    // Fallback to local storage
    const session: Session = {
      id: this.generateId(),
      puzzle_ids: puzzles.map(p => p.puzzle_id),
      difficulty_filter: difficultyFilter,
      problem_count: puzzles.length,
      created_at: new Date().toISOString(),
      is_active: true
    }

    this.localSessions.push(session)
    this.saveToLocalStorage()
    return session.id!
  }

  async saveAttempt(
    sessionId: string,
    puzzle: Puzzle,
    userReasoning: string,
    aiScore: AIScoreResult,
    timeSpent: number
  ): Promise<void> {
    const attempt: SessionAttempt = {
      id: this.generateId(),
      session_id: sessionId,
      puzzle_id: puzzle.puzzle_id,
      user_reasoning: userReasoning,
      ai_score: aiScore.score,
      ai_feedback: aiScore.feedback,
      ai_strengths: aiScore.strengths,
      ai_improvements: aiScore.improvements,
      time_spent_seconds: timeSpent,
      submitted_at: new Date().toISOString()
    }

    if (isSupabaseConfigured()) {
      try {
        // Get current user session to determine if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // User is authenticated - save to Supabase
          const { error } = await supabase
            .from('session_attempts')
            .insert([attempt])

          if (error) throw error
          console.log('✅ Attempt saved to Supabase for authenticated user')
          return
        } else {
          console.log('📱 No authenticated user, saving attempt locally')
        }
      } catch (error) {
        console.warn('Failed to save attempt to Supabase, using local storage:', error)
      }
    } else {
      console.log('📱 Supabase not configured, saving attempt locally')
    }

    // Fallback to local storage
    this.localAttempts.push(attempt)
    this.saveToLocalStorage()
    console.log('📱 Attempt saved locally')
  }

  async completeSession(sessionId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('sessions')
          .update({ 
            completed_at: new Date().toISOString(),
            is_active: false 
          })
          .eq('id', sessionId)

        if (error) throw error
        return
      } catch (error) {
        console.warn('Failed to complete session in Supabase:', error)
      }
    }

    // Fallback to local storage
    const session = this.localSessions.find(s => s.id === sessionId)
    if (session) {
      session.completed_at = new Date().toISOString()
      session.is_active = false
      this.saveToLocalStorage()
    }
  }

  // Progress Analytics
  async getUserProgress(): Promise<UserProgress[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .order('technique', { ascending: true })

        if (error) throw error
        return data || []
      } catch (error) {
        console.warn('Failed to fetch progress from Supabase:', error)
      }
    }

    // Fallback to local analysis
    return this.calculateLocalProgress()
  }

  async getSessionHistory(limit = 10): Promise<Session[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error
        return data || []
      } catch (error) {
        console.warn('Failed to fetch session history from Supabase:', error)
      }
    }

    // Fallback to local storage
    this.loadFromLocalStorage()
    return this.localSessions
      .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
      .slice(0, limit)
  }

  async getSessionAttempts(sessionId: string): Promise<SessionAttempt[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('session_attempts')
          .select('*')
          .eq('session_id', sessionId)
          .order('submitted_at', { ascending: true })

        if (error) throw error
        return data || []
      } catch (error) {
        console.warn('Failed to fetch session attempts from Supabase:', error)
      }
    }

    // Fallback to local storage
    this.loadFromLocalStorage()
    return this.localAttempts.filter(a => a.session_id === sessionId)
  }

  // Local Storage Helpers
  private generateId(): string {
    return 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('bridge_sessions', JSON.stringify(this.localSessions))
      localStorage.setItem('bridge_attempts', JSON.stringify(this.localAttempts))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const sessions = localStorage.getItem('bridge_sessions')
      const attempts = localStorage.getItem('bridge_attempts')
      
      if (sessions) {
        this.localSessions = JSON.parse(sessions)
      }
      if (attempts) {
        this.localAttempts = JSON.parse(attempts)
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error)
    }
  }

  private calculateLocalProgress(): UserProgress[] {
    this.loadFromLocalStorage()
    
    const progressMap = new Map<string, UserProgress>()
    
    for (const attempt of this.localAttempts) {
      const key = `${attempt.puzzle_id}_difficulty` // We'd need puzzle data to get actual technique/difficulty
      
      if (!progressMap.has(key)) {
        progressMap.set(key, {
          technique: 'Local Practice',
          difficulty: '♣',
          total_attempts: 0,
          average_score: 0,
          best_score: 0,
          last_attempt: attempt.submitted_at
        })
      }
      
      const progress = progressMap.get(key)!
      progress.total_attempts++
      progress.average_score = (progress.average_score * (progress.total_attempts - 1) + attempt.ai_score) / progress.total_attempts
      progress.best_score = Math.max(progress.best_score, attempt.ai_score)
      
      if (new Date(attempt.submitted_at) > new Date(progress.last_attempt)) {
        progress.last_attempt = attempt.submitted_at
      }
    }
    
    return Array.from(progressMap.values())
  }

  // Statistics
  getOfflineStats() {
    this.loadFromLocalStorage()
    
    const totalSessions = this.localSessions.length
    const totalAttempts = this.localAttempts.length
    const averageScore = totalAttempts > 0 
      ? this.localAttempts.reduce((sum, a) => sum + a.ai_score, 0) / totalAttempts 
      : 0
    const bestScore = totalAttempts > 0
      ? Math.max(...this.localAttempts.map(a => a.ai_score))
      : 0

    return {
      totalSessions,
      totalAttempts,
      averageScore: Math.round(averageScore * 10) / 10,
      bestScore,
      isOfflineMode: !isSupabaseConfigured()
    }
  }
}

export const progressService = new ProgressService()