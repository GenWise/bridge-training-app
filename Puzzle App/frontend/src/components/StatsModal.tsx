import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { progressService } from '../services/ProgressService';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  const { user, isOfflineMode } = useAuth();
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const loadStats = async () => {
        try {
          const userProgress = await progressService.getUserProgress();
          const sessionHistory = await progressService.getSessionHistory(10);
          const offlineStats = progressService.getOfflineStats();
          
          setStats({
            userProgress,
            sessionHistory,
            offlineStats,
            totalPuzzlesSolved: offlineStats.totalAttempts,
            averageSessionSize: sessionHistory.length > 0 ? 
              sessionHistory.reduce((sum: number, s: any) => sum + s.problem_count, 0) / sessionHistory.length : 0
          });
        } catch (error) {
          console.warn('Failed to load statistics:', error);
          setStats({ error: 'Failed to load statistics' });
        } finally {
          setLoading(false);
        }
      };
      loadStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '16px',
        width: '90%',
        maxWidth: '280px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0px 20px 50px rgba(0, 0, 0, 0.15)',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#2C3E50',
            margin: 0
          }}>
            📊 Statistics
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#7F8C8D',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>📊</div>
            <div style={{ color: '#6C757D' }}>Loading statistics...</div>
          </div>
        ) : stats ? (
          <div>
            {/* Overview */}
            <div style={{
              backgroundColor: '#F8F9FA',
              border: '1px solid #E9ECEF',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#2C3E50',
                marginBottom: '12px'
              }}>
                🎯 Overall Performance
              </div>
              <div style={{ fontSize: '12px', color: '#6C757D', lineHeight: '1.5' }}>
                <div>📚 <strong>{stats.offlineStats.totalSessions}</strong> training sessions</div>
                <div>🧩 <strong>{stats.totalPuzzlesSolved}</strong> puzzles solved</div>
                <div>⭐ Best score: <strong>{stats.offlineStats.bestScore}/10</strong></div>
                <div>📊 Average: <strong>{stats.offlineStats.averageScore}/10</strong></div>
                {stats.averageSessionSize > 0 && (
                  <div>📈 Avg per session: <strong>{Math.round(stats.averageSessionSize)}</strong></div>
                )}
              </div>
            </div>

            {/* Recent Sessions */}
            {stats.sessionHistory && stats.sessionHistory.length > 0 && (
              <div style={{
                backgroundColor: '#E8F5E8',
                border: '1px solid #C8E6C9',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2E7D32',
                  marginBottom: '12px'
                }}>
                  📈 Recent Activity
                </div>
                {stats.sessionHistory.slice(0, 5).map((session: any, index: number) => (
                  <div key={session.id || index} style={{
                    fontSize: '12px',
                    color: '#1B5E20',
                    marginBottom: '8px',
                    padding: '8px',
                    backgroundColor: '#F1F8E9',
                    borderRadius: '6px'
                  }}>
                    <div>🎯 {session.problem_count} puzzles • {session.difficulty_filter || 'Mixed'}</div>
                    <div>📅 {new Date(session.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Motivation */}
            <div style={{
              textAlign: 'center',
              fontSize: '12px',
              color: '#8B1538',
              padding: '16px',
              backgroundColor: '#FCF7F9',
              borderRadius: '8px'
            }}>
              {stats.totalPuzzlesSolved === 0 ? 
                '🌟 Start your bridge journey!' :
                stats.totalPuzzlesSolved < 10 ?
                  `🚀 Great start! ${stats.totalPuzzlesSolved} puzzles solved!` :
                  `🏆 Excellent! ${stats.totalPuzzlesSolved} puzzles mastered!`
              }
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>📊</div>
            <div style={{ color: '#6C757D' }}>No data available yet</div>
          </div>
        )}
      </div>
    </div>
  );
};