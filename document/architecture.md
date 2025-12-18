# Architecture Specification — SKD CPNS Tryout Platform

This document defines the authoritative technical architecture for the SKD CPNS Tryout Web Application. Cursor **MUST follow this document** when generating or modifying code.

---

# 1. Tech Stack (Final)
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth Provider:** Clerk (Email/Password + Google OAuth)
- **Database:** Supabase PostgreSQL + RLS
- **Hosting:** Vercel
- **Analytics:** Vercel Analytics
- **CSV Parsing:** Papa Parse
- **Validation:** Zod
- **State Management:** React hooks & Context only (no Zustand unless requested)
- **Images:** External URL only (no file upload for MVP)

---

# 2. Project Structure (MANDATORY)
```
/
├── app/
│   ├── (auth)/           # Clerk auth pages
│   ├── (dashboard)/      # User dashboard & exam flows
│   ├── (admin)/          # Admin dashboard & tools
│   └── api/              # Next.js Route Handlers (API endpoints)
│
├── components/
│   ├── ui/               # shadcn/ui wrappers
│   ├── exam/             # Exam components
│   ├── admin/            # Admin components
│   └── shared/           # Shared components
│
├── lib/
│   ├── supabase/         # Supabase client, database helpers
│   ├── scoring/          # Scoring engine wrapper
│   ├── validation/       # Zod schemas
│   └── utils/            # Utilities (formatTime, helpers)
│
├── constants/            # Passing grades, timers, UI labels
├── types/                # Global TypeScript types
├── hooks/                # Custom hooks (timer, auto-save, exam state)
└── public/               # Static assets
```

### ⚠️ Strict Rules:
- ❌ No `/src` folder  
- ❌ No `/pages` folder  
- ✓ Must use **App Router only**

---

# 3. Naming Conventions
- **Files:** kebab-case → `exam-timer.tsx`
- **Components:** PascalCase → `ExamTimer`
- **Functions:** camelCase → `calculateAttemptScore`
- **Types:** PascalCase → `AttemptRecord`
- **Constants:** UPPER_SNAKE_CASE → `EXAM_DURATION_MS`
- **DB Tables:** snake_case (use schema from Database-Schema.md)

---

# 4. Database Layer (Supabase)
### Authoritative Schema  
Use **ONLY** the schema in `Database-Schema.md`.

Includes:
- `profiles`, `packages`, `package_questions`
- `questions`, `choices`
- `attempts`, `attempt_answers`
- Views + Materialized Views
- Functions:
  - `calculate_attempt_score`
  - `validate_single_correct_answer`
  - `sync_question_status`
  - `get_correct_choice_id`

### Rules:
- Do NOT modify schema without explicit instruction.
- All DB operations through Supabase JS client.
- Use RLS.
- Use RPC for multi-table queries.
- Safe pattern:
```ts
const { data, error } = await supabase
  .from("attempts")
  .select("*")
  .eq("user_id", userId);
```

---

# 5. Authentication (Clerk)
Strict rules:
- `currentUser()` for server-side
- `useUser()` for client-side
- `auth()` middleware for API routes
- Sync Clerk user → Supabase via webhook
- Admin role in `publicMetadata.role`
- Never store passwords locally

---

# 6. Exam Engine Architecture
### 6.1 Global Timer
- Duration: **100 minutes (6,000,000 ms)**
- One timer for all 110 questions
- No pause/resume
- Auto-submit when time reaches 0
- Timer persists on refresh

### 6.2 Auto-Save Rules
Save answer:
- on answer select  
- AND every 60 seconds  

Stored in `attempt_answers`.

**⚠️ CRITICAL:** No localStorage for exam state. All exam progress MUST be persisted server-side via `attempt_answers` table.

### 6.3 Navigation Rules
- User can jump freely between all 110 questions
- Indicators:
  - Gray = Unanswered
  - Blue = Answered
  - Yellow = Flagged
  - Green = Current question

### 6.4 Attempt Lifecycle
- Create record: `in_progress`
- **Only ONE active attempt per package per user**
- If active attempt exists, show "Resume" button
- On submit:
  - call `calculate_attempt_score`
  - update `status = 'completed'`
  - fill scores (TWK, TIU, TKP, total, pass/fail)

---

# 7. Scoring Engine (Official CPNS 2024 — IMMUTABLE)
### TWK
- 30 questions
- 5 points correct
- 0 points incorrect/unanswered
- max score: **150**
- min passing: **65**

### TIU
- 35 questions
- 5 points correct
- 0 points incorrect/unanswered
- max score: **175**
- min passing: **80**

### TKP
- 45 questions  
- score per option: **1–5**
- 0 points unanswered
- max score: **225**
- min passing: **166**

### Passing Condition
```
Pass = TWK ≥ 65 AND TIU ≥ 80 AND TKP ≥ 166
```
**ALL THREE** categories must meet threshold. Total score alone is NOT sufficient.

### MUST use Supabase function:
```
select * from calculate_attempt_score(attempt_id);
```

---

# 8. Admin Features Architecture
AI must implement:

### Bulk Question Upload
- CSV parsing with Papa Parse
- Zod validation
- Supports:
  - category (TWK/TIU/TKP)
  - question_text
  - option_a–e
  - correct_answer (TWK/TIU only, A-E)
  - tkp_score_a–e (TKP only, 1-5)
  - topic, difficulty
  - explanation
  - image_url (external URL)

### CSV Format Specification
```csv
category,question_text,option_a,option_b,option_c,option_d,option_e,correct_answer,tkp_score_a,tkp_score_b,tkp_score_c,tkp_score_d,tkp_score_e,explanation,topic,difficulty,image_url
TWK,"Pancasila sebagai...","Option A","Option B","Option C","Option D","Option E",A,,,,,,"Penjelasan...",Pancasila,medium,https://example.com/img.jpg
TKP,"Anda melihat rekan...","Option A","Option B","Option C","Option D","Option E",,5,4,3,2,1,"Penjelasan...",Integritas,easy,
```

### CSV to Database Mapping
```typescript
// When parsing CSV, the 'correct_answer' column sets the is_answer flag
const correctAnswerLabel = row.correct_answer; // 'A', 'B', 'C', 'D', 'E'

// Create 5 choices for insertion into 'choices' table
const choices = ['A', 'B', 'C', 'D', 'E'].map(label => ({
  label: label,
  content: row[`option_${label.toLowerCase()}`],
  // is_answer is TRUE only if label matches correct_answer
  is_answer: label === correctAnswerLabel,
  // For TKP, store score from tkp_score_{label}
  tkp_score: row.category === 'TKP' ? row[`tkp_score_${label.toLowerCase()}`] : null,
  question_id: questionId
}));
```

### Validation Rules
```typescript
interface QuestionValidation {
  // All categories
  category: 'TWK' | 'TIU' | 'TKP';
  question_text: string; // min 10 chars
  option_a: string; // min 1 char
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  
  // TWK/TIU specific
  correct_answer?: 'A' | 'B' | 'C' | 'D' | 'E'; // required if TWK or TIU
  
  // TKP specific
  tkp_scores?: {
    A: 1 | 2 | 3 | 4 | 5;
    B: 1 | 2 | 3 | 4 | 5;
    C: 1 | 2 | 3 | 4 | 5;
    D: 1 | 2 | 3 | 4 | 5;
    E: 1 | 2 | 3 | 4 | 5;
  }; // required if TKP
  
  // Optional
  explanation?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  image_url?: string; // must be valid URL if provided
}
```

### Package Builder
- Must enforce **30 TWK + 35 TIU + 45 TKP = 110 total**
- Questions must be published
- **Cannot edit package with existing attempts** (data integrity)
- Tabbed interface: TWK tab, TIU tab, TKP tab

### Admin Dashboard
Uses DB views:
- question performance
- leaderboard (materialized view)
- attempt stats

---

# 9. API Standards (Next.js App Router)
- Must use `/app/api/*/route.ts`
- All input validated with Zod
- Error format:
```ts
return NextResponse.json(
  { error: "Invalid input", code: "INVALID_DATA" },
  { status: 400 }
);
```
- Authentication via Clerk middleware
- Admin-only routes must verify role

---

# 10. UI/UX Requirements
### Language: Indonesian (formal)
Examples:
- "Mulai Tryout"
- "Lanjutkan"
- "Pembahasan Soal"
- "Riwayat Ujian"

### Must include:
- Skeleton loaders
- Spinners for actions
- Toast error/success notifications
- Mobile-first design
- Use shadcn/ui components for consistency

### Responsive breakpoints:
- 320, 768, 1024, 1440

---

# 11. Security Rules
- No API keys in client-side code
- Validate all inputs (client + server)
- Use HTTPS only
- Sanitize question text
- Enforce RLS
- **No sensitive data in localStorage** (especially exam state)
- Rate-limit admin endpoints

---

# 12. State Management Rules
- Local state: React hooks
- Shared state: React Context
- **Exam state MUST be persisted via server-side `attempt_answers` table**
- **No localStorage for exam progress**
- Timer state can use sessionStorage for UI only (not source of truth)

---

# 13. Non-Negotiable Constraints
Cursor MUST NOT:
- ❌ Create `/src`
- ❌ Use Prisma
- ❌ Store exam state in localStorage
- ❌ Change passing grade rules (TWK≥65, TIU≥80, TKP≥166)
- ❌ Add new question types beyond multiple choice
- ❌ Modify database schema without approval
- ❌ Create per-category timers (global timer only)
- ❌ Allow editing packages with attempts
- ❌ Delete questions/packages (soft delete only)

Cursor MUST:
- ✓ Follow 110-question structure (30+35+45)
- ✓ Use shadcn/ui
- ✓ Use Supabase JS client
- ✓ Use Zod everywhere
- ✓ Implement auto-save (answer change + 60s interval)
- ✓ Implement global 100-minute timer
- ✓ Use current schema
- ✓ Enforce "one active attempt per package per user"
- ✓ Persist exam state server-side only

---

# 14. Priority Order (When AI is Uncertain)
1. **architecture.md** (THIS FILE)
2. Rules - Cursor fix.txt
3. prd.md
4. Database-Schema.md
5. Developer instructions

---

# End of architecture.md
