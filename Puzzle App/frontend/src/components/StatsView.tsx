import React, { useState, useEffect } from 'react'
import { progressService } from '../services/ProgressService'
import type { UserProgress, Session } from '../services/ProgressService'
import { useAuth } from '../contexts/AuthContext'

export const StatsView: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions'>('overview')
  const { isOfflineMode } = useAuth()

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [progressData, sessionHistory] = await Promise.all([
          progressService.getUserProgress(),
          progressService.getSessionHistory(10)
        ])
        
        setProgress(progressData)
        setSessions(sessionHistory)
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const offlineStats = progressService.getOfflineStats()

  // Phone frame styles (consistent with other components)
  const phoneFrameStyle: React.CSSProperties = {
    width: '320px',
    height: '640px',
    backgroundColor: '#000',
    borderRadius: '30px',
    padding: '4px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 8px #222'
  }

  const phoneContentStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: '26px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative'
  }

  const contentAreaStyle: React.CSSProperties = {
    flex: 1,
    padding: '16px',
    paddingBottom: '70px',
    overflowY: 'auto'
  }

  const bottomNavStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '8px 0',
    borderRadius: '0 0 26px 26px'
  }

  const navItemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '11px',
    color: '#9ca3af',
    cursor: 'pointer'
  }

  const activeNavItemStyle: React.CSSProperties = {
    ...navItemStyle,
    color: '#8B1538'
  }

  const StatCard = ({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) => (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #ECF0F1',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      boxShadow: '0px 2px 8px rgba(44, 62, 80, 0.04)'
    }}>
      <div style={{
        fontSize: '13px',
        fontWeight: '500',
        color: '#7F8C8D',
        marginBottom: '4px'
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '24px',
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: '2px'
      }}>
        {value}
      </div>
      {subtitle && (
        <div style={{
          fontSize: '12px',
          color: '#7F8C8D'
        }}>
          {subtitle}
        </div>
      )}
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFBFC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={phoneFrameStyle}>
        <div style={phoneContentStyle}>
          <div style={contentAreaStyle}>
            
            {/* Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              <h1 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#2C3E50',
                margin: 0,
                marginBottom: '4px'
              }}>
                Your Progress
              </h1>
              {isOfflineMode && (
                <div style={{
                  fontSize: '12px',
                  color: '#8B1538',
                  backgroundColor: '#FCF7F9',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  display: 'inline-block'
                }}>
                  📱 Offline Mode
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div style={{ 
              display: 'flex', 
              borderBottom: '1px solid #ECF0F1', 
              marginBottom: '16px' 
            }}>
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: activeTab === 'overview' ? '#8B1538' : '#7F8C8D',
                  borderBottom: activeTab === 'overview' ? '2px solid #8B1538' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: activeTab === 'sessions' ? '#8B1538' : '#7F8C8D',
                  borderBottom: activeTab === 'sessions' ? '2px solid #8B1538' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Sessions
              </button>
            </div>

            {loading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: '#7F8C8D'
              }}>
                Loading stats...
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div>
                    {/* Quick Stats */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <StatCard 
                        title="Sessions" 
                        value={offlineStats.totalSessions} 
                      />
                      <StatCard 
                        title="Problems Solved" 
                        value={offlineStats.totalAttempts} 
                      />
                      <StatCard 
                        title="Average Score" 
                        value={`${offlineStats.averageScore}/10`}
                        subtitle="AI Assessment"
                      />
                      <StatCard 
                        title="Best Score" 
                        value={`${offlineStats.bestScore}/10`}
                        subtitle="Personal Best"
                      />
                    </div>

                    {/* Progress by Technique */}
                    {progress.length > 0 && (
                      <div>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#2C3E50',
                          marginBottom: '12px'
                        }}>
                          Progress by Technique
                        </h3>
                        
                        {progress.map((prog, index) => (
                          <div key={index} style={{
                            backgroundColor: '#F8F9FA',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '8px'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '4px'
                            }}>
                              <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#2C3E50'
                              }}>
                                {prog.technique}
                              </span>
                              <span style={{
                                fontSize: '12px',
                                color: '#8B1538'
                              }}>
                                {prog.difficulty}
                              </span>
                            </div>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '12px',
                              color: '#7F8C8D'
                            }}>
                              <span>{prog.total_attempts} attempts</span>
                              <span>Avg: {prog.average_score.toFixed(1)}</span>
                              <span>Best: {prog.best_score}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'sessions' && (
                  <div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#2C3E50',
                      marginBottom: '12px'
                    }}>
                      Recent Sessions
                    </h3>
                    
                    {sessions.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#7F8C8D'
                      }}>
                        No sessions yet. Start practicing to see your history!
                      </div>
                    ) : (
                      sessions.map((session, index) => (
                        <div key={session.id || index} style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #ECF0F1',
                          borderRadius: '8px',
                          padding: '12px',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '4px'
                          }}>
                            <span style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#2C3E50'
                            }}>
                              {session.problem_count} Problems
                            </span>
                            <span style={{
                              fontSize: '12px',
                              color: session.is_active ? '#8B1538' : '#27AE60',
                              fontWeight: '500'
                            }}>
                              {session.is_active ? '🟡 Active' : '✅ Complete'}
                            </span>
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#7F8C8D'
                          }}>
                            {session.difficulty_filter && `${session.difficulty_filter} difficulty • `}
                            {new Date(session.created_at!).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Bottom Navigation */}
          <div style={bottomNavStyle}>
            <div style={navItemStyle}>
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>📚</div>
              <span>Practice</span>
            </div>
            <div style={activeNavItemStyle}>
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>📊</div>
              <span>Stats</span>
            </div>
            <div style={navItemStyle}>
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>🕒</div>
              <span>History</span>
            </div>
            <div style={navItemStyle}>
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>👤</div>
              <span>Profile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}