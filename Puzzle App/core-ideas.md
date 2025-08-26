Bridge Training App — Core Features & Ideas

This document summarizes the front-end application design for students/players who will attempt bridge puzzles. It excludes the puzzle extraction pipeline, assuming JSON data is already available with metadata, problem, solution, tags, etc.

⸻

1. App Scope
	•	Deliver a mobile-first web app (works on tablets and desktops too).
	•	Users can practice bridge puzzles filtered by difficulty, technique, vulnerability, book/source.
	•	Supports Declarer Play (v1) and placeholder for Defense (v2).
	•	Provides quiz mode, export to LIN, and export to PDF.
	•	Tracks user progress and session history (logins planned for v2).

⸻

2. Core Screens & Navigation

Top Tabs
	•	Declarer Play
	•	Defense (placeholder)
	•	Stats (user progress and history)

Session Builder (Filters)
	•	Number of problems (slider)
	•	Difficulty (Easy, Medium, Hard)
	•	Technique/Type tags (e.g., Safety Play, Finesse, Squeeze, Endplay, Trump Management)
	•	Book/source selection
	•	Vulnerability filter (None, NS, EW, Both, Any)
	•	Options: Randomize order, Allow skip

Actions:
	•	Generate Quiz
	•	Export LIN (bundle)
	•	Export PDF (bundle)

Quiz Flow
	•	Shows one puzzle at a time
	•	Displays only the problem hands (not all four)
	•	Metadata strip (Book, Round, Board, Contract, Declarer, Lead, Difficulty, Tags)
	•	Free-text box for user to type reasoning/solution
	•	Buttons: Submit for Score (LLM), Show Solution (always available), Skip, Next
	•	Solution view: shows all four hands + commentary/notes
	•	Scoring: 0–10 with brief remarks, tolerant and encouraging

Exports
	•	LIN export: bundle selected problems into a single .lin file for BBO
	•	PDF export: include all metadata, problem diagram, solution diagram, and review notes section
	•	Allow export directly from session builder or after finishing quiz

Stats / History
	•	Track sessions attempted
	•	Per-tag analytics (e.g., Safety Play accuracy)
	•	Session history with filters applied, puzzles attempted, scores

⸻

3. JSON Data Shape (Assumed)

Each puzzle record includes:
	•	id, book, round, board_number
	•	difficulty, tags[], vulnerability
	•	bidding, contract, declarer, lead
	•	problem.visible_hands (subset)
	•	solution.visible_hands (all four)
	•	images.problem/solution (if using screenshots)
	•	lin_deal

⸻

4. Design Choices
	•	Mobile-first responsive layout
	•	Synthetic SVG diagrams preferred; screenshots optional
	•	Declarer Play and Defense tabs persist for roadmap clarity
	•	Export buttons always visible in session builder + quiz

⸻

5. Roadmap / Versions
	•	v1: Declarer Play, Quiz, LIN/PDF exports, Stats (basic)
	•	v2: Logins, persistent user accounts, Defense problems, enhanced Stats
	•	Future: Interactive play-out of hands within the app (not just on BBO)

⸻
