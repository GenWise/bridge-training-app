# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Bridge Training App project consisting of a mobile-first React frontend with Supabase backend for practicing bridge puzzles. The app helps bridge students and players improve their skills through interactive declarer play problems with AI scoring, progress tracking, and export capabilities.

## Directory Structure

- `Puzzle App/` - Main application code
  - `frontend/` - React application source
    - `src/components/` - UI components
    - `src/hooks/` - Custom React hooks
    - `src/lib/` - Utility libraries
    - `src/pages/` - Application pages
    - `src/styles/` - Styling files
  - `supabase/` - Backend database and functions
    - `migrations/` - Database schema migrations
    - `seeds/` - Sample data
    - `functions/` - Edge functions
    - `types/` - TypeScript type definitions
  - `docs/prd.md` - Product Requirements Document
  - `core-ideas.md` - Core feature specifications
- `Puzzle Database/` - Bridge puzzle data
  - `dynamic_declarer_play_part1/` - JSON puzzle data files
  - `Books/` - Reference bridge books and materials

## Key Architecture

### Data Structure
Puzzles are stored as JSON with this structure:
- `puzzle_id`, `book_title`, `author`, `problem_page`, `solution_page`
- `final_contract`, `declarer`, `opening_lead`
- `all_hands_north/south/east/west` - Complete hand data
- `visible_in_problem` - Which hands to show during puzzle
- `difficulty` (♣/♦/♥/♠ symbols), `main_technique`, `key_insight`
- `solution_line`, `result_comparison`, `additional_notes`

### Core Features
1. **Session Builder**: Filter puzzles by difficulty, technique tags, book source, vulnerability
2. **Quiz Mode**: Display problem hands, collect user reasoning, AI scoring (0-10), show solutions
3. **Export System**: Generate LIN files for Bridge Base Online, PDF reports with diagrams
4. **Progress Tracking**: Session history, technique-based analytics, improvement metrics

### Frontend Architecture
- Mobile-first responsive design
- Three main tabs: Declarer Play (v1), Defense (placeholder), Stats
- React-based with components for session building, quiz flow, and analytics
- SVG diagrams preferred over screenshots for bridge hands

### Backend (Supabase)
- Database for puzzle storage and user progress (v2)
- Edge functions for AI scoring integration
- Local development with migrations and seed data

## Development Commands

### Frontend (React + Vite + TypeScript)
Navigate to `Puzzle App/frontend/` directory for these commands:

- **Development server**: `npm run dev` - Starts Vite dev server at http://localhost:5173/
- **Build for production**: `npm run build` - TypeScript compilation + Vite build
- **Lint code**: `npm run lint` - ESLint with TypeScript and React rules
- **Preview production build**: `npm run preview` - Preview the built app locally

## Development Notes

### Version Roadmap
- **v1**: Declarer Play puzzles, Quiz mode, LIN/PDF exports, Basic stats
- **v2**: User authentication, Defense problems, Enhanced analytics
- **Future**: Interactive hand play-out within app

### Key Implementation Considerations
- Mobile-first responsive layout is critical
- Export functionality must be accessible from both session builder and quiz modes
- AI scoring should be tolerant and educationally focused
- Handle large puzzle datasets efficiently
- Maintain professional bridge diagram standards in exports