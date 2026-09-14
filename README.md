# Campus Internship Screening & Recruitment Form – University of Calcutta

A corporate-styled Next.js (App Router) web application and automated screening system designed for University of Calcutta campus internship recruitment across engineering, manufacturing, and business domains.

Candidate submissions are automatically evaluated using a 7-component weighted scorecard framework and recorded in real time to Google Sheets:
**Spreadsheet URL**: [Google Sheet Link](https://docs.google.com/spreadsheets/d/1xMgNxaHkbHmWkkSkiCORR_WaF5YknAHP3ZsSuAZYBxI/edit?gid=0#gid=0)

---

## Key Features

1. **Corporate Recruitment Visual Theme**:
   - Customized with University of Calcutta colors (Navy `#0F2C59`, Gold `#C5A880`, Accent `#1D5D9B`).
   - Clean, mobile-friendly design with step-by-step progress tracking and an estimated 8–10 minute completion time indicator.

2. **9 Form Sections + Declaration (51 Items)**:
   - Section 1: Personal & Contact Information (Q1–Q6)
   - Section 2: Academic Profile (Q7–Q14)
   - Section 3: Skills & Technical Aptitude (Q15–Q19)
   - Section 4: Communication & Problem Solving (Q20–Q24)
   - Section 5: Attitude & Workplace Behaviour (Q25–Q29)
   - Section 6: Internship Interest & Availability (Q30–Q36)
   - Section 7: Experience & Achievements (Q37–Q40)
   - Section 8: Situational Screening Questions (Q41–Q44)
   - Section 9: Final Screening (Q45–Q50)
   - Declaration (Q51)

3. **Interactive Form Capabilities**:
   - Live word counters for long paragraph questions (150 / 200 words max).
   - Client-side validation for email formats, required fields, and word limits.
   - Auto-save draft capability in `localStorage` to prevent loss of candidate progress.
   - Summary Review modal allowing candidates to verify responses prior to final submission.

4. **Automated Google Sheets Candidate Scorecard**:
   - **Weighted Score Components**:
     - Academic Profile: **15%**
     - Technical / Functional Skills: **20%**
     - Communication Ability: **15%**
     - Problem Solving Approach: **20%**
     - Learning Attitude: **15%**
     - Leadership / Initiative: **10%**
     - Internship Commitment: **5%**
   - **Recommendation Categories**:
     - `85 – 100`: **Strongly Recommended**
     - `70 – 84`: **Recommended for Interview**
     - `55 – 69`: **Consider / Further Screening**
     - `< 55`: **Not Shortlisted**
   - **Red Flags Detection**: Automatically detects poor communication ratings, sparse or generic answers, lack of commitment, limited availability, or lack of initiative.

---

## Quick Start & Setup

### 1. Install Dependencies & Run Next.js Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Verify Google Sheet Initializer API
To verify or initialize your Google Sheet tabs (`Candidate Responses` and `Screening Scorecard` headers):
Open: [http://localhost:3000/api/setup-sheet](http://localhost:3000/api/setup-sheet)

### 3. Environment Credentials (`.env.local`)
```env
GOOGLE_CLIENT_ID=625599805176-k62l9ramf3sehkkekh48bp3lohi6ll05.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REFRESH_TOKEN=1//0gG4c7w_OCwD1CgYIARAAGBASNwF-L9IrM6nxS2ZfRYmqWGd-pA2NOvXd1SJV-K6VIPzTxIM_FMLbCN4KEr83GFREd_C4vn3Kw50
GOOGLE_SPREADSHEET_ID=1xMgNxaHkbHmWkkSkiCORR_WaF5YknAHP3ZsSuAZYBxI
```
