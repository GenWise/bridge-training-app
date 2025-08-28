import React, { useState } from 'react';
import { useQuiz } from '../hooks/useQuiz';
import { createBBOViewerURL, formatDifficulty } from '../utils/bboConverter';

export const QuizView: React.FC = () => {
  const quiz = useQuiz();
  const puzzle = quiz.getCurrentPuzzle();
  const progress = quiz.getProgress();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  if (!puzzle) {
    return null;
  }

  // Phone frame styles
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
    paddingBottom: '70px',
    overflowY: 'auto'
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
    color: '#0d9488'
  };

  const bboURL = createBBOViewerURL(puzzle);
  
  // Debug: Log the actual BBO URL being used
  console.log('🌐 BBO URL:', bboURL);

  const handleSubmit = async () => {
    await quiz.submitForScoring();
  };

  const handleShowSolution = () => {
    quiz.showFullSolution();
  };

  // Fallback text display if BBO iframe fails
  const TextFallback = () => {
    const visibleHands = puzzle.visible_in_problem?.split(',').map(s => s.trim().toLowerCase()) || ['west', 'east'];
    
    return (
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '12px',
        fontFamily: 'monospace',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '12px', fontWeight: '600' }}>
          Bridge Hand
        </div>
        {visibleHands.includes('west') && (
          <div style={{ marginBottom: '8px' }}>
            <strong>West:</strong> {puzzle.all_hands_west}
          </div>
        )}
        {visibleHands.includes('east') && (
          <div style={{ marginBottom: '8px' }}>
            <strong>East:</strong> {puzzle.all_hands_east}
          </div>
        )}
        {visibleHands.includes('north') && (
          <div style={{ marginBottom: '8px' }}>
            <strong>North:</strong> {puzzle.all_hands_north}
          </div>
        )}
        {visibleHands.includes('south') && (
          <div style={{ marginBottom: '8px' }}>
            <strong>South:</strong> {puzzle.all_hands_south}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={phoneFrameStyle}>
        <div style={phoneContentStyle}>
          <div style={contentAreaStyle}>
            
            {/* Progress indicator */}
            <div style={{ 
              textAlign: 'center', 
              fontSize: '14px', 
              color: '#6b7280',
              marginBottom: '12px'
            }}>
              Problem {progress.current} of {progress.total}
            </div>

            {/* Puzzle metadata */}
            <div style={{
              fontSize: '12px',
              backgroundColor: '#f3f4f6',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              lineHeight: '1.5'
            }}>
              <div><strong>Contract:</strong> {puzzle.final_contract}</div>
              <div><strong>Lead:</strong> {puzzle.opening_lead}</div>
              <div><strong>Difficulty:</strong> {formatDifficulty(puzzle.difficulty)}</div>
            </div>

            {/* Bridge hand display - BBO iframe with fallback */}
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
                      display: iframeLoaded ? 'block' : 'none'
                    }}
                    onLoad={() => setIframeLoaded(true)}
                    onError={() => setIframeError(true)}
                    title="Bridge Hand"
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
                      Loading hand...
                    </div>
                  )}
                </>
              ) : (
                <TextFallback />
              )}
            </div>

            {quiz.state.currentScreen === 'quiz' && (
              <>
                {/* User reasoning input */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Your Reasoning:
                  </label>
                  <textarea
                    value={quiz.state.userReasoning}
                    onChange={(e) => quiz.setUserReasoning(e.target.value)}
                    placeholder="Describe your line of play..."
                    style={{
                      width: '100%',
                      height: '80px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      padding: '8px',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif',
                      resize: 'none'
                    }}
                  />
                </div>

                {/* Action buttons */}
                <button
                  onClick={handleSubmit}
                  disabled={quiz.state.isScoring || !quiz.state.userReasoning.trim()}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: quiz.state.isScoring ? '#6b7280' : '#0d9488',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: quiz.state.isScoring ? 'not-allowed' : 'pointer',
                    marginBottom: '12px',
                    opacity: !quiz.state.userReasoning.trim() ? 0.5 : 1
                  }}
                >
                  {quiz.state.isScoring ? 'Analyzing...' : 'Submit for Score'}
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleShowSolution}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: 'transparent',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#6b7280',
                      cursor: 'pointer'
                    }}
                  >
                    Show Solution
                  </button>
                  <button
                    onClick={() => quiz.nextPuzzle()}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: 'transparent',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#6b7280',
                      cursor: 'pointer'
                    }}
                  >
                    Skip
                  </button>
                </div>
              </>
            )}

            {quiz.state.currentScreen === 'scored' && quiz.state.aiScore && (
              <>
                {/* AI Score Display */}
                <div style={{
                  backgroundColor: quiz.state.aiScore.score >= 7 ? '#f0fdfa' : '#fffbeb',
                  border: quiz.state.aiScore.score >= 7 ? '1px solid #5eead4' : '1px solid #fbbf24',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: quiz.state.aiScore.score >= 7 ? '#065f46' : '#92400e',
                    marginBottom: '8px',
                    textAlign: 'center'
                  }}>
                    AI Score: {quiz.state.aiScore.score}/10 {quiz.state.aiScore.score >= 7 ? '👍' : '📚'}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: quiz.state.aiScore.score >= 7 ? '#047857' : '#78350f',
                    lineHeight: '1.5',
                    textAlign: 'center',
                    marginBottom: '12px'
                  }}>
                    {quiz.state.aiScore.feedback}
                  </div>
                  
                  {quiz.state.aiScore.strengths.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#065f46' }}>
                        ✓ Strengths:
                      </div>
                      <div style={{ fontSize: '11px', color: '#047857' }}>
                        {quiz.state.aiScore.strengths.join(', ')}
                      </div>
                    </div>
                  )}
                  
                  {quiz.state.aiScore.improvements.length > 0 && (
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#92400e' }}>
                        💡 To Improve:
                      </div>
                      <div style={{ fontSize: '11px', color: '#78350f' }}>
                        {quiz.state.aiScore.improvements.join(', ')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons after scoring */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button
                    onClick={handleShowSolution}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#0d9488',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    View Full Solution
                  </button>
                  <button
                    onClick={() => quiz.nextPuzzle()}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: 'transparent',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#6b7280',
                      cursor: 'pointer'
                    }}
                  >
                    Next Problem
                  </button>
                </div>
              </>
            )}
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