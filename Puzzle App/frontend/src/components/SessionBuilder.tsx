import React, { useState, useEffect } from 'react';
import { puzzleService } from '../services/PuzzleService';
import type { Puzzle, DifficultySymbol, LoadingState } from '../types/Puzzle';
import { DEFAULT_SESSION_CONFIG } from '../types/Session';
import { DIFFICULTY_LEVELS } from '../types/Puzzle';
import { useQuiz } from '../hooks/useQuiz';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { ProfileView } from './ProfileView';
import { StatsModal } from './StatsModal';

export const SessionBuilder: React.FC = () => {
  const quiz = useQuiz();
  const [activeTab, setActiveTab] = useState<'declarer' | 'defense'>('declarer');
  const [problemCount, setProblemCount] = useState(DEFAULT_SESSION_CONFIG.problemCount);
  const [difficulty, setDifficulty] = useState<DifficultySymbol | 'all'>('all');
  const [mode, setMode] = useState<'play' | 'export'>('play');
  const [selectedPuzzles, setSelectedPuzzles] = useState<Puzzle[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false, error: null });
  const [difficultyStats, setDifficultyStats] = useState<Record<DifficultySymbol, number>>({} as Record<DifficultySymbol, number>);
  const [expandedSection, setExpandedSection] = useState<string>('core');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileView, setShowProfileView] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const { user } = useAuth();

  // Load difficulty statistics on component mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const availableDifficulties = await puzzleService.getAvailableDifficulties();
        const stats = availableDifficulties.reduce((acc, { difficulty, count }) => {
          acc[difficulty] = count;
          return acc;
        }, {} as Record<DifficultySymbol, number>);
        setDifficultyStats(stats);
      } catch (error) {
        console.warn('Could not load difficulty statistics:', error);
      }
    };
    loadStats();
  }, []);

  const handleGenerateSession = async () => {
    setLoadingState({ isLoading: true, error: null });
    
    try {
      let puzzles: Puzzle[];
      
      if (difficulty === 'all') {
        puzzles = await puzzleService.getRandomPuzzles({
          count: problemCount
        });
      } else {
        puzzles = await puzzleService.getPuzzlesByDifficulty(difficulty, problemCount);
      }

      setSelectedPuzzles(puzzles);
      setLoadingState({ isLoading: false, error: null });
      
      if (mode === 'play') {
        // Start the quiz automatically
        quiz.startQuiz(puzzles);
      } else {
        // Export mode - could implement PDF/LIN generation here
        console.log('Exporting', puzzles.length, 'puzzles');
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to generate session'
      });
    }
  };

  const getActionButtonText = () => {
    return mode === 'play' ? 'Generate Session' : 'Export Problems';
  };

  const getActionDescription = () => {
    return mode === 'play'
      ? 'Creates an interactive practice session.'
      : 'Saves both PDF and LIN files to your device.';
  };

  const AccordionSection = ({ title, id, children }: { title: string; id: string; children: React.ReactNode }) => {
    const isOpen = expandedSection === id;
    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #ECF0F1',
        borderRadius: '12px',
        marginBottom: '12px',
        overflow: 'hidden',
        boxShadow: '0px 2px 8px rgba(44, 62, 80, 0.04)'
      }}>
        <div 
          style={{
            padding: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '15px',
            backgroundColor: '#F8F9FA',
            color: '#2C3E50'
          }}
          onClick={() => setExpandedSection(isOpen ? '' : id)}
        >
          <span>{title}</span>
          <span style={{ color: '#9ca3af' }}>{isOpen ? '−' : '+'}</span>
        </div>
        {isOpen && (
          <div style={{ padding: '12px' }}>
            {children}
          </div>
        )}
      </div>
    );
  };

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
    color: '#8B1538'
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFBFC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      {/* Phone frame container */}
      <div style={phoneFrameStyle}>
        <div style={phoneContentStyle}>
          {/* Phone content */}
          <div style={contentAreaStyle}>
            
            {/* Tab Navigation */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '16px' }}>
              <button
                onClick={() => setActiveTab('declarer')}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: activeTab === 'declarer' ? '#8B1538' : '#7F8C8D',
                  borderBottom: activeTab === 'declarer' ? '2px solid #8B1538' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Declarer Play
              </button>
              <button
                onClick={() => setActiveTab('defense')}
                disabled
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#BDC3C7',
                  borderBottom: '2px solid transparent',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'not-allowed'
                }}
              >
                Defense
              </button>
            </div>

            {/* Accordion Sections */}
            <div>
              <AccordionSection title="Core Settings" id="core">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#2C3E50', marginBottom: '8px' }}>
                  Number of Problems: {problemCount}
                </label>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={problemCount}
                  onChange={(e) => setProblemCount(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </AccordionSection>

              <AccordionSection title="Difficulty" id="difficulty">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultySymbol | 'all')}
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '14px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #D5DBDB',
                    borderRadius: '12px',
                    height: '56px'
                  }}
                >
                  <option value="all">♣ ♦ ♥ ♠ All Difficulties</option>
                  {Object.values(DIFFICULTY_LEVELS).map((level) => (
                    <option key={level.symbol} value={level.symbol}>
                      {level.symbol} {level.name}
                      {difficultyStats[level.symbol] ? ` (${difficultyStats[level.symbol]})` : ''}
                    </option>
                  ))}
                </select>
              </AccordionSection>

              <AccordionSection title="Techniques" id="techniques">
                <select style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #D5DBDB',
                  borderRadius: '12px',
                  height: '56px'
                }}>
                  <option>All Techniques</option>
                  <option>Finesse</option>
                  <option>Safety Play</option>
                  <option>Squeeze</option>
                </select>
              </AccordionSection>

              <AccordionSection title="Sources" id="sources">
                <select style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #D5DBDB',
                  borderRadius: '12px',
                  height: '56px'
                }}>
                  <option>All Sources</option>
                  <option>Dynamic Declarer Play</option>
                </select>
              </AccordionSection>
            </div>

            {/* Practice Mode Toggle */}
            <div style={{
              backgroundColor: '#F8F9FA',
              borderRadius: '8px',
              padding: '4px',
              display: 'flex',
              marginTop: '20px',
              marginBottom: '16px'
            }}>
              <button
                onClick={() => setMode('play')}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: mode === 'play' ? 'white' : '#F4E8ED',
                  color: mode === 'play' ? '#8B1538' : '#6b7280',
                  boxShadow: mode === 'play' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  height: '44px'
                }}
              >
                Play Here
              </button>
              <button
                onClick={() => setMode('export')}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: mode === 'export' ? 'white' : '#F4E8ED',
                  color: mode === 'export' ? '#6D1028' : '#6b7280',
                  boxShadow: mode === 'export' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  height: '44px'
                }}
              >
                Export Only
              </button>
            </div>
            
            {/* Generate Button */}
            <button
              onClick={handleGenerateSession}
              disabled={loadingState.isLoading}
              style={{
                width: '100%',
                padding: '16px',
                marginTop: '8px',
                color: 'white',
                fontWeight: '600',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: mode === 'play' ? '#8B1538' : '#6D1028',
                cursor: loadingState.isLoading ? 'not-allowed' : 'pointer',
                opacity: loadingState.isLoading ? 0.5 : 1,
                boxShadow: '0px 2px 8px rgba(139, 21, 56, 0.15)',
                height: '50px'
              }}
            >
              {loadingState.isLoading ? 'Loading...' : getActionButtonText()}
            </button>
            
            <p style={{ 
              fontSize: '13px', 
              color: '#7F8C8D', 
              textAlign: 'center', 
              marginTop: '8px',
              lineHeight: '1.4' 
            }}>
              {getActionDescription()}
            </p>
            
            {/* Results/Preview Area */}
            <div style={{ marginTop: '16px' }}>
              {loadingState.isLoading && (
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  padding: '24px',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                  <div style={{ fontSize: '14px' }}>Loading puzzles...</div>
                </div>
              )}
              
              {loadingState.error && (
                <div style={{
                  border: '2px solid #fecaca',
                  backgroundColor: '#fef2f2',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#dc2626', fontSize: '14px' }}>{loadingState.error}</div>
                  <button 
                    onClick={() => setLoadingState({ isLoading: false, error: null })}
                    style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#dc2626',
                      textDecoration: 'underline',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Try Again
                  </button>
                </div>
              )}
              
              {!loadingState.isLoading && !loadingState.error && selectedPuzzles.length > 0 && (
                <div style={{
                  backgroundColor: '#FCF7F9',
                  border: '1px solid #F4E8ED',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <div style={{ 
                    fontSize: '15px', 
                    fontWeight: '600', 
                    color: '#6D1028',
                    marginBottom: '4px'
                  }}>
                    ✓ {selectedPuzzles.length} puzzles ready
                  </div>
                  <div style={{ fontSize: '12px', color: '#8B1538' }}>
                    {selectedPuzzles[0]?.book_title} - {selectedPuzzles[0]?.difficulty} level
                  </div>
                </div>
              )}
              
              {!loadingState.isLoading && !loadingState.error && selectedPuzzles.length === 0 && (
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  padding: '24px',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Ready to Practice?</div>
                  <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                    Choose your difficulty and problem count above, then tap
                    <span style={{ fontWeight: '600', color: '#8B1538' }}> Generate Session </span>
                    to start solving bridge puzzles!
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom Navigation */}
          <div style={bottomNavStyle}>
            <div style={activeNavItemStyle}>
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>📚</div>
              <span>Practice</span>
            </div>
            <div 
              style={{...(user ? activeNavItemStyle : navItemStyle), cursor: 'pointer'}}
              onClick={() => user ? setShowStatsModal(true) : setShowAuthModal(true)}
            >
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>📊</div>
              <span>Stats</span>
            </div>
            <div style={navItemStyle}>
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>🕒</div>
              <span>History</span>
            </div>
            <div 
              style={{...(user ? activeNavItemStyle : navItemStyle), cursor: 'pointer'}}
              onClick={() => user ? setShowProfileView(true) : setShowAuthModal(true)}
            >
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>👤</div>
              <span>Profile</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      {/* Profile View */}
      <ProfileView 
        isOpen={showProfileView} 
        onClose={() => setShowProfileView(false)} 
      />
      
      {/* Stats Modal */}
      <StatsModal 
        isOpen={showStatsModal} 
        onClose={() => setShowStatsModal(false)} 
      />
    </div>
  );
};