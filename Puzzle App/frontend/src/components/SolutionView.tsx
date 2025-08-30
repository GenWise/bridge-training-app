import React, { useState } from 'react';
import { useQuiz } from '../hooks/useQuiz';
import { createBBOViewerURL, formatDifficulty } from '../utils/bboConverter';

export const SolutionView: React.FC = () => {
  const quiz = useQuiz();
  const puzzle = quiz.getCurrentPuzzle();
  const progress = quiz.getProgress();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  if (!puzzle) return null;

  const phoneFrameStyle: React.CSSProperties = {
    width: '320px',
    height: '640px',
    backgroundColor: '#000',
    borderRadius: '30px',
    padding: '4px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 8px #222'
  };

  const phoneContentStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: '26px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative'
  };

  const contentAreaStyle: React.CSSProperties = {
    flex: 1,
    padding: '16px',
    paddingBottom: '80px', // Extra space for bottom nav
    overflowY: 'auto',
    maxHeight: '100%'
  };

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
  };

  const navItemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '11px',
    color: '#9ca3af'
  };

  const activeNavItemStyle: React.CSSProperties = {
    ...navItemStyle,
    color: '#8B1538'
  };

  // Create BBO URL showing all hands
  const bboURL = createBBOViewerURL(puzzle, true);

  const AllHandsFallback = () => (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '11px',
      fontFamily: 'monospace',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '12px', fontWeight: '600' }}>
        Complete Deal
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <strong>North:</strong><br />
          {puzzle.all_hands_north}
        </div>
        <div>
          <strong>South:</strong><br />
          {puzzle.all_hands_south}
        </div>
        <div>
          <strong>East:</strong><br />
          {puzzle.all_hands_east}
        </div>
        <div>
          <strong>West:</strong><br />
          {puzzle.all_hands_west}
        </div>
      </div>
    </div>
  );

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
            
            {/* Compact header with AI Score (if available) */}
            {quiz.state.aiScore && (
              <div style={{
                backgroundColor: quiz.state.aiScore.score >= 7 ? '#f0fdfa' : '#fffbeb',
                border: quiz.state.aiScore.score >= 7 ? '1px solid #5eead4' : '1px solid #fbbf24',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: quiz.state.aiScore.score >= 7 ? '#065f46' : '#92400e',
                  marginBottom: '4px'
                }}>
                  AI Score: {quiz.state.aiScore.score}/10 {quiz.state.aiScore.score >= 7 ? '👍' : '📚'}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: quiz.state.aiScore.score >= 7 ? '#047857' : '#78350f',
                  lineHeight: '1.4'
                }}>
                  {quiz.state.aiScore.feedback}
                </div>
              </div>
            )}

            {/* Compact progress */}
            <div style={{ 
              textAlign: 'center', 
              fontSize: '15px', 
              color: '#2C3E50',
              marginBottom: '12px',
              fontWeight: '600'
            }}>
              Problem {progress.current} of {progress.total} - Complete Solution
            </div>

            {/* Complete bridge deal */}
            <div style={{
              height: '200px',
              marginBottom: '16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {!iframeError ? (
                <>
                  <iframe
                    src={bboURL}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      margin: 0,
                      padding: 0,
                      display: iframeLoaded ? 'block' : 'none',
                      backgroundColor: 'white'
                    }}
                    onLoad={() => setIframeLoaded(true)}
                    onError={() => setIframeError(true)}
                    title="Complete Bridge Deal"
                    frameBorder="0"
                    scrolling="no"
                  />
                  {!iframeLoaded && !iframeError && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f9fafb',
                      color: '#6b7280',
                      fontSize: '14px'
                    }}>
                      Loading complete deal...
                    </div>
                  )}
                </>
              ) : (
                <AllHandsFallback />
              )}
            </div>

            {/* Compact info */}
            <div style={{
              fontSize: '11px',
              backgroundColor: '#f8fafc',
              padding: '8px',
              borderRadius: '6px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span><strong>{formatDifficulty(puzzle.difficulty)}</strong></span>
              <span style={{ color: '#6b7280' }}>{puzzle.main_technique}</span>
            </div>

            {/* Key Insight */}
            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '8px'
              }}>
                💡 Key Insight
              </div>
              <div style={{
                fontSize: '12px',
                color: '#78350f',
                lineHeight: '1.5'
              }}>
                {puzzle.key_insight}
              </div>
            </div>

            {/* Detailed Solution */}
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #0ea5e9',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#0c4a6e',
                marginBottom: '8px'
              }}>
                📋 Solution Line
              </div>
              <div style={{
                fontSize: '12px',
                color: '#0f172a',
                lineHeight: '1.6'
              }}>
                {puzzle.solution_line}
              </div>
            </div>

            {/* Result Analysis */}
            {puzzle.result_comparison && (
              <div style={{
                backgroundColor: '#fef7ff',
                border: '1px solid #a855f7',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#7c2d92',
                  marginBottom: '8px'
                }}>
                  📊 Result Analysis
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#581c87',
                  lineHeight: '1.5'
                }}>
                  {puzzle.result_comparison}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {puzzle.additional_notes && (
              <div style={{
                fontSize: '11px',
                color: '#6b7280',
                fontStyle: 'italic',
                marginBottom: '12px',
                paddingTop: '8px',
                borderTop: '1px solid #e5e7eb'
              }}>
                {puzzle.additional_notes}
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button
                onClick={() => quiz.backToPuzzle()}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'transparent',
                  border: '1.5px solid #8B1538',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#8B1538',
                  cursor: 'pointer',
                  height: '50px'
                }}
              >
                ← Back to Puzzle
              </button>
              <button
                onClick={() => quiz.nextPuzzle()}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#8B1538',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  height: '50px',
                  boxShadow: '0px 2px 8px rgba(139, 21, 56, 0.15)'
                }}
              >
                Next Problem →
              </button>
            </div>
          </div>
          
          {/* Bottom Navigation */}
          <div style={bottomNavStyle}>
            <div 
              style={{...activeNavItemStyle, cursor: 'pointer'}}
              onClick={() => quiz.exitQuiz()}
            >
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>📚</div>
              <span>Practice</span>
            </div>
            <div style={navItemStyle}>
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
  );
};