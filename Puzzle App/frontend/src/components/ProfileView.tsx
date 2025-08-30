import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { progressService } from '../services/ProgressService';

interface ProfileViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ isOpen, onClose }) => {
  const { user, signOut, isOfflineMode } = useAuth();
  const [stats, setStats] = React.useState<any>(null);

  React.useEffect(() => {
    if (isOpen && user) {
      // Load user statistics
      const loadStats = async () => {
        try {
          const userProgress = await progressService.getUserProgress();
          const sessionHistory = await progressService.getSessionHistory(5);
          const offlineStats = progressService.getOfflineStats();
          
          setStats({
            userProgress,
            sessionHistory,
            offlineStats,
            totalSessions: sessionHistory.length,
            joinedDate: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'
          });
        } catch (error) {
          console.warn('Failed to load user stats:', error);
          setStats({ error: 'Failed to load statistics' });
        }
      };
      loadStats();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

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
            Profile
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

        {user ? (
          <div>
            {/* User Info */}
            <div style={{
              backgroundColor: '#FCF7F9',
              border: '1px solid #F4E8ED',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <div style={{
                  fontSize: '24px',
                  marginRight: '12px'
                }}>👤</div>
                <div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#8B1538'
                  }}>
                    {user.email}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6D1028'
                  }}>
                    {isOfflineMode ? 'Offline Mode' : 'Cloud Sync Enabled'}
                  </div>
                </div>
              </div>
              
              {stats && (
                <div style={{ fontSize: '12px', color: '#8B1538' }}>
                  📊 {stats.offlineStats.totalSessions} sessions • {stats.offlineStats.totalAttempts} puzzles solved
                  <br />
                  🎯 Best score: {stats.offlineStats.bestScore}/10 • Avg: {stats.offlineStats.averageScore}/10
                  {stats.joinedDate !== 'Unknown' && (
                    <>
                      <br />
                      📅 Joined: {stats.joinedDate}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            {stats?.sessionHistory && stats.sessionHistory.length > 0 && (
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
                  📈 Recent Activity
                </div>
                {stats.sessionHistory.slice(0, 3).map((session: any, index: number) => (
                  <div key={session.id || index} style={{
                    fontSize: '12px',
                    color: '#6C757D',
                    marginBottom: '8px',
                    padding: '8px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '6px',
                    border: '1px solid #E9ECEF'
                  }}>
                    🎯 {session.problem_count} puzzles • {session.difficulty_filter || 'Mixed difficulty'}
                    <br />
                    📅 {new Date(session.created_at).toLocaleDateString()}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#DC3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginBottom: '8px'
                }}
              >
                Sign Out
              </button>
              <div style={{
                fontSize: '11px',
                color: '#6C757D'
              }}>
                Your progress is synced to the cloud
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
            <div style={{
              fontSize: '16px',
              color: '#6C757D',
              marginBottom: '20px'
            }}>
              Sign in to sync your progress
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: '#8B1538',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};