Bridge Training App — Export to PDF: Core Ideas & Features

Purpose

Provide learners with a ready-to-review PDF of selected bridge puzzles after attempting them (or directly from filters). The PDF serves as a companion to the LIN file for playing on BBO.

⸻

What the PDF Must Contain

A. Session Cover (Page 1)
	•	Session title + timestamp
	•	Filters used (count, difficulty, tags, book, vulnerability)
	•	Index table: # / Puzzle ID / Book / Round / Board / Contract / Page

B. One Section Per Puzzle (1–2 pages)

Header strip
	•	Puzzle ID, Book, Round, Board, Difficulty, Tags, Vulnerability, Bidding
	•	Contract, Declarer, Lead

Problem pane
	•	Problem diagram only (hands originally visible)
	•	Caption: “Problem view”

Solution pane
	•	Full solution diagram (all four hands) + solution notes
	•	Caption: “Solution view”

BBO / Results pane
	•	My result on BBO: ____
	•	Notes: ____
	•	LLM score: __/10 | Remarks: ____
	•	LIN deal: full string (copyable)
	•	Optional: Table ID, Opponents, Partner

Appendix (End of PDF)
	•	Full LIN deals for each puzzle with page references

⸻

App Workflow
	•	Export PDF available from:
	•	Session builder (without attempting quiz)
	•	Quiz results (exact puzzles attempted)
	•	Export as ZIP bundle: PDF + LIN file

⸻

Implementation Options

1. Server-Side (Recommended)
	•	Use Next.js + Puppeteer to render a /print page from React components
	•	Pros: crisp SVGs, reliable pagination, professional print quality

2. Client-Side (Quicker)
	•	Use html2canvas + jsPDF or react-to-print
	•	Pros: simple setup
	•	Cons: rasterized diagrams, less control over pagination

⸻

Layout Details
	•	A4, margins ~20mm
	•	Problem + solution as two columns (desktop) or stacked (mobile)
	•	Diagrams in 16:10 boxes for consistent sizing
	•	Footer: watermark + page numbers

⸻

Edge Cases
	•	If screenshots exist, prefer them for book-accurate diagrams
	•	Missing fields (e.g., bidding) are simply omitted
	•	Long tag lists wrap gracefully

⸻

Minimal API
	•	POST /export/pdf: { puzzles, session } → PDF
	•	POST /export/lin: { puzzles: {id, lin_deal}[] } → LIN text

⸻
