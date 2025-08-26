# Bridge Training App - Product Requirements Document

## Overview

The Bridge Training App is a mobile-first web application designed to help bridge students and players practice and improve their skills through interactive puzzles. The app provides a comprehensive learning platform where users can attempt bridge puzzles filtered by difficulty, technique, and source material, with immediate feedback and progress tracking.

**Target Users**: Bridge students, intermediate to advanced players looking to practice specific techniques, and anyone wanting to improve their declarer play skills.

**Core Value Proposition**: Structured, adaptive bridge puzzle practice with intelligent scoring, multiple export formats, and comprehensive progress tracking.

## Core Features

### Session Builder & Filtering
- **Problem Selection**: Adjustable slider for number of problems per session
- **Difficulty Levels**: Easy, Medium, Hard filtering
- **Technique Tags**: Safety Play, Finesse, Squeeze, Endplay, Trump Management, and more
- **Source Filtering**: Filter by specific books or puzzle collections
- **Vulnerability Options**: None, NS, EW, Both, or Any
- **Session Options**: Randomize problem order, Allow skip functionality

### Quiz Experience
- **Problem Display**: Shows only relevant hands (not all four initially)
- **Rich Metadata**: Book, Round, Board, Contract, Declarer, Lead, Difficulty, Tags
- **Interactive Elements**: 
  - Free-text reasoning box for user solutions
  - Submit for AI scoring (0-10 scale with encouragement)
  - Always-available solution reveal
  - Skip and Next navigation
- **Solution View**: Complete hand display with commentary and notes

### Export Capabilities
- **LIN Export**: Bundle selected problems into single .lin file for Bridge Base Online
- **PDF Export**: Comprehensive format including metadata, problem diagrams, solution diagrams, and review sections
- **Flexible Timing**: Export directly from session builder or after completing quiz

### Progress Tracking & Analytics
- **Session History**: Track all attempted sessions with applied filters and scores
- **Technique Analytics**: Performance breakdown by specific tags (e.g., Safety Play accuracy)
- **Progress Visualization**: Track improvement over time across different skill areas

### Navigation Structure
- **Primary Tabs**: Declarer Play (v1), Defense (placeholder for v2), Stats
- **Responsive Design**: Optimized for mobile, tablet, and desktop use

## User Flow

### Typical User Journey

1. **App Entry**: User opens app and selects "Declarer Play" tab
2. **Session Configuration**: 
   - Set number of problems (e.g., 10 problems)
   - Choose difficulty level (Medium)
   - Select technique focus (Finesse, Safety Play)
   - Pick source material preferences
   - Configure vulnerability settings
   - Enable/disable randomization and skip options
3. **Session Start**: Click "Generate Quiz" to begin
4. **Problem Solving Loop**:
   - View problem hands and metadata
   - Enter reasoning/solution in text box
   - Choose action: Submit for Score, Show Solution, or Skip
   - If submitted: receive AI feedback (score + remarks)
   - View complete solution with all hands and commentary
   - Proceed to next problem
5. **Session Completion**: Review session summary with scores and analytics
6. **Post-Session Actions**:
   - Export session to LIN or PDF if desired
   - View updated stats and progress
   - Plan next practice session

### Alternative Export Flow
- **Pre-Session Export**: Configure filters and export problem set without attempting quiz
- **Batch Operations**: Select multiple sessions or problem sets for combined exports

## Tech Notes

### Technical Architecture
- **Platform**: Mobile-first responsive web application
- **Compatibility**: Optimized for mobile devices, with full tablet and desktop support
- **Data Format**: JSON-based puzzle data with comprehensive metadata structure

### Data Requirements
Each puzzle record includes:
- **Identifiers**: id, book, round, board_number
- **Classification**: difficulty, tags[], vulnerability
- **Game Data**: bidding, contract, declarer, lead
- **Hand Information**: problem.visible_hands (subset), solution.visible_hands (all four)
- **Visual Assets**: Optional images.problem/solution screenshots
- **Export Data**: lin_deal format for BBO compatibility

### Design Preferences
- **Visual Representation**: Synthetic SVG diagrams preferred over screenshots
- **UI Consistency**: Persistent tab structure (Declarer Play/Defense) for clear roadmap
- **Export Accessibility**: Export buttons always visible in both session builder and quiz modes

### Development Roadmap
- **Version 1**: Declarer Play, Quiz functionality, LIN/PDF exports, Basic stats
- **Version 2**: User authentication, persistent accounts, Defense problems, Enhanced analytics
- **Future Considerations**: In-app interactive hand play-out (beyond BBO integration)

### Technical Constraints
- **Performance**: Must handle large puzzle datasets efficiently
- **Offline Capability**: Consider offline mode for completed sessions
- **Export Quality**: PDF exports must maintain professional bridge diagram standards
- **AI Integration**: LLM scoring system must be tolerant and educationally focused

### Framework Considerations
- **Frontend**: Modern responsive framework suitable for mobile-first development
- **Data Management**: Efficient filtering and search capabilities for large puzzle collections
- **Export Libraries**: Robust PDF generation and LIN file creation capabilities
- **Analytics**: Local storage for progress tracking (v1), database integration (v2)