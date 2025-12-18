# Product Requirements Document (PRD)
## SKD CPNS Tryout Web Application Platform

**Document Version:** 2.1 Fixed & Aligned  
**Last Updated:** December 2025  
**Product Owner:** [Yan]  
**Target Launch:** MVP within 8-12 weeks  

---

## Table of Contents
1. [Product Summary](#1-product-summary)
2. [Goals & Business Value](#2-goals--business-value)
3. [Success Metrics](#3-success-metrics)
4. [User Personas](#4-user-personas)
5. [Core MVP Features](#5-core-mvp-features)
6. [Out-of-Scope](#6-out-of-scope-mvp)
7. [User Flows](#7-user-flows)
8. [Functional Requirements](#8-functional-requirements)
9. [Non-Functional Requirements](#9-non-functional-requirements)

---

## 1. Product Summary

### 1.1 Overview
A comprehensive web-based platform that enables Indonesian civil service exam candidates to practice for the Seleksi Kompetensi Dasar (SKD) Computer Assisted Test (CAT) CPNS examination. The platform provides realistic exam simulations across three mandatory test categories: TWK (Tes Wawasan Kebangsaan), TIU (Tes Intelegensi Umum), and TKP (Tes Karakteristik Pribadi).

### 1.2 Problem Statement
CPNS candidates struggle to find quality, affordable, and accessible practice materials that accurately simulate the official CAT-BKN exam environment. Most existing solutions are:
- Expensive and require physical attendance (Rp 2-5 million)
- Don't provide immediate feedback and detailed explanations
- Lack realistic exam conditions (timer, question navigation, auto-save)
- Don't track progress over multiple attempts
- Have unclear or incorrect passing grade calculations

### 1.3 Solution
A modern, mobile-responsive web application that provides:
- Unlimited access to curated SKD CPNS practice questions
- **Realistic exam simulation with 100-minute global timer**
- **Official 2024 passing grade calculation** (TWK ≥65, TIU ≥80, TKP ≥166)
- Instant scoring with detailed answer explanations
- Progress tracking across multiple attempts
- Monthly updated question banks
- Accessible from any device with internet connection

### 1.4 Target Market
- **Primary:** CPNS exam candidates aged 20-35
- **Secondary:** Fresh graduates preparing for government positions
- **Geographic:** Indonesia (initially), with focus on tier 1-2 cities
- **Estimated TAM:** 4-5 million annual CPNS applicants

### 1.5 Tech Stack
- **Frontend:** Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes (Serverless)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Clerk
- **CSV Parsing:** Papa Parse
- **Validation:** Zod
- **Hosting:** Vercel
- **Analytics:** Vercel Analytics

---

## 2. Goals & Business Value

### 2.1 Business Goals (Realistic for MVP)
1. **User Acquisition:** Achieve **300-500 registered users** within first 3 months
2. **User Engagement:** Maintain **30-40% weekly active user rate**
3. **Content Quality:** Build a question bank of **500+ questions** within 3 months, 1,000+ within 6 months
4. **Revenue Foundation:** Establish product-market fit for future monetization (post-MVP)
5. **Brand Authority:** Position as a trusted CPNS preparation platform

### 2.2 User Goals
1. **Practice Effectively:** Access high-quality, exam-relevant questions regularly
2. **Track Progress:** Monitor performance improvement over time
3. **Learn Efficiently:** Understand mistakes through detailed explanations
4. **Simulate Real Exam:** Experience realistic exam conditions before the actual test
5. **Convenient Access:** Study anytime, anywhere on any device

---

## 3. Success Metrics

### 3.1 User Acquisition Metrics
- **Total Registered Users:** Target 300-500 in 3 months, 1,000 in 6 months
- **Daily Active Users (DAU):** Target 50-100 within 3 months
- **Weekly Active Users (WAU):** Target 150-250 within 3 months
- **User Acquisition Cost (CAC):** < $2 per user (organic + paid)

### 3.2 Engagement Metrics
- **Attempts per User:** Average 3-5 attempts per active user per month
- **Completion Rate:** 70%+ of started exams are completed
- **Quiz Review Rate:** 50%+ of completed exams are reviewed
- **Time on Platform:** Average 45+ minutes per session
- **Return Rate:** 50%+ users return within 7 days of first attempt

### 3.3 Technical Metrics
- **Page Load Time:** < 2 seconds (p95)
- **API Response Time:** < 500ms (p95)
- **Uptime:** 99.5% availability
- **Error Rate:** < 0.5% of all requests
- **Mobile Usage:** 60%+ traffic from mobile devices

---

## 4. User Personas

### 4.1 Primary Persona: "Dika - The Determined Graduate"

**Demographics:**
- Age: 24
- Education: Fresh S1 graduate (Public Administration)
- Location: Surabaya, East Java
- Income: Unemployed, living with parents
- Tech Savvy: Medium-high (smartphone native, uses social media daily)

**Goals:**
- Pass CPNS exam on first attempt to secure government job
- Practice with high-quality questions that match real exam difficulty
- Understand weak areas to focus study efforts
- Track improvement over time
- Affordable or free preparation resources

**Pain Points:**
- Can't afford expensive bimbel (tutoring) programs (Rp 2-5 million)
- Free online resources are low quality or outdated
- No way to simulate real exam conditions at home
- Unclear which topics need more focus
- Anxiety about exam time management

**User Behavior:**
- Studies 2-3 hours daily, mostly in evening
- Prefers mobile phone for quick practice sessions
- Uses laptop for serious study sessions
- Active in CPNS preparation Facebook/Telegram groups

**Quote:** *"Saya butuh platform yang bisa simulasi ujian asli, biar pas hari H nggak kaget dengan sistemnya."*

---

## 5. Core MVP Features

### 5.1 User Authentication & Profile Management
- User registration via email and Google OAuth (Clerk)
- Email verification workflow
- Secure login/logout functionality
- Profile page with basic information (name, email, avatar)
- Profile editing capability (name, phone)
- Password reset functionality via email
- Role-based access control (user/admin)

### 5.2 Question Bank Management (Admin)

#### 5.2.1 Bulk Upload
- CSV bulk question upload interface
- Support for question types: multiple choice (A-E options)
- Question metadata: category (TWK/TIU/TKP), difficulty, topic tags
- **Image support via external URL** (no file upload for MVP)
- Question editing and soft deletion capability
- Question preview before publishing
- Validation rules: duplicate detection, required fields check

#### 5.2.2 CSV Format Specification
```csv
category,question_text,option_a,option_b,option_c,option_d,option_e,correct_answer,tkp_score_a,tkp_score_b,tkp_score_c,tkp_score_d,tkp_score_e,explanation,topic,difficulty,image_url
TWK,"Pancasila sebagai...","Option A","Option B","Option C","Option D","Option E",A,,,,,,"Penjelasan lengkap...",Pancasila,medium,https://example.com/image.jpg
TKP,"Anda melihat rekan...","Option A","Option B","Option C","Option D","Option E",,5,4,3,2,1,"Penjelasan lengkap...",Integritas,easy,
```

**Required Columns:**
- `category`: TWK, TIU, or TKP
- `question_text`: Question body (min 10 chars)
- `option_a` through `option_e`: Answer options (min 1 char each)
- `correct_answer`: A-E (required for TWK/TIU, leave empty for TKP)
- `tkp_score_a` through `tkp_score_e`: 1-5 (required for TKP only)
- `explanation`: Detailed explanation (optional but recommended)
- `topic`: Topic/subtopic tag (optional)
- `difficulty`: easy/medium/hard (optional, default: medium)
- `image_url`: External URL to image (optional)

#### 5.2.3 CSV to Database Mapping
```typescript
// When parsing CSV, the 'correct_answer' column value sets the is_answer flag
const correctAnswerLabel = row.correct_answer; // Fetches 'A', 'B', 'C', 'D', 'E'

// Create 5 choices objects ready for insertion into the 'choices' table
const choices = ['A', 'B', 'C', 'D', 'E'].map(label => ({
  label: label,
  content: row[`option_${label.toLowerCase()}`],
  // Mapping Logic: is_answer flag is TRUE only if the choice's label 
  // matches the correct answer label provided in the CSV
  is_answer: label === correctAnswerLabel,
  // For TKP questions, store the score from CSV
  tkp_score: row.category === 'TKP' ? row[`tkp_score_${label.toLowerCase()}`] : null,
  question_id: questionId
}));
```

#### 5.2.4 Validation Rules
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
  correct_answer?: 'A' | 'B' | 'C' | 'D' | 'E'; // required if category is TWK or TIU
  
  // TKP specific
  tkp_scores?: {
    A: 1 | 2 | 3 | 4 | 5;
    B: 1 | 2 | 3 | 4 | 5;
    C: 1 | 2 | 3 | 4 | 5;
    D: 1 | 2 | 3 | 4 | 5;
    E: 1 | 2 | 3 | 4 | 5;
  }; // required if category is TKP
  
  // Optional
  explanation?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  image_url?: string; // must be valid URL if provided
}
```

### 5.3 Package Management (Admin)
- Create exam packages (collections of questions)
- Define package structure: **TWK (30q), TIU (35q), TKP (45q)** = 110 total
- Assign questions to packages via UI with category tabs
- Package metadata: title, description, difficulty level, is_active status
- Publish/unpublish packages
- Package templates for quick creation
- **Cannot edit packages that have user attempts** (data integrity)

### 5.4 Exam Taking Flow (User)

#### 5.4.1 Exam Interface Features
- Browse available active packages on dashboard
- **Check for existing active attempt** before starting new exam
- **Only ONE active attempt per package per user**
- If active attempt exists: Show "Lanjutkan Tryout" (Resume) button
- If no active attempt: Show "Mulai Tryout" (Start) button
- Start exam with clear instructions and time allocation
- **Global Timer: 100 minutes** for all 110 questions
- Free navigation between all questions (can jump TWK ↔ TIU ↔ TKP)
- Question navigation panel showing all 110 questions
- Visual indicators:
  - **Gray:** Unanswered
  - **Blue:** Answered
  - **Yellow:** Flagged for review
  - **Green:** Current question
- Flag/bookmark questions for review
- **Auto-save every 60 seconds** or on answer change
- Warning before submitting exam
- Force submit when time expires
- Responsive design for mobile and desktop
- No ability to pause/resume (simulates real exam)
- **⚠️ CRITICAL:** All exam progress stored server-side in `attempt_answers` table (NO localStorage)

#### 5.4.2 Auto-Save Strategy
```typescript
// Auto-save implementation
const AUTO_SAVE_INTERVAL = 60000; // 60 seconds
const AUTO_SAVE_ON_ACTION = true; // Save immediately on answer select

// IMPORTANT: Save to server-side database, NOT localStorage
// Auto-save triggers:
// 1. Immediately when user selects/changes an answer
// 2. Every 60 seconds automatically
// 3. When user navigates to different question
// 4. When user flags/unflags a question
```

### 5.5 Scoring Engine (Official 2024 Rules)

#### 5.5.1 Category Scoring
```typescript
// TWK (30 questions, max 150 points)
const scoreTWK = (answer: Answer, question: Question): number => {
  if (!answer.selected_answer) return 0;
  return answer.selected_answer === question.correct_answer ? 5 : 0;
};

// TIU (35 questions, max 175 points)
const scoreTIU = (answer: Answer, question: Question): number => {
  if (!answer.selected_answer) return 0;
  return answer.selected_answer === question.correct_answer ? 5 : 0;
};

// TKP (45 questions, max 225 points)
const scoreTKP = (answer: Answer, question: Question): number => {
  if (!answer.selected_answer) return 0;
  return question.tkp_scores[answer.selected_answer];
};
```

#### 5.5.2 Passing Grade (Official 2024)
```typescript
interface PassingGrade {
  TWK_MIN: 65;      // Minimum TWK score
  TIU_MIN: 80;      // Minimum TIU score
  TKP_MIN: 166;     // Minimum TKP score
  TOTAL_MIN: 311;   // Sum of minimums (reference only)
}

// Pass determination - ALL categories must meet threshold
const determinePassStatus = (scores: CategoryScores): boolean => {
  return (
    scores.twk >= 65 &&
    scores.tiu >= 80 &&
    scores.tkp >= 166
  );
};
```

**⚠️ IMPORTANT:** User must meet **ALL THREE** category thresholds to pass. Total score alone is not sufficient.

### 5.6 Result Review & Explanations
- Detailed result summary page with:
  - Total score and pass/fail status
  - Category breakdown (TWK, TIU, TKP scores)
  - Pass/fail indicator per category
  - Correct/incorrect/unanswered counts per category
  - Percentile ranking
  - Time spent per category
- Question-by-question review mode:
  - User's selected answer (highlighted in yellow)
  - Correct answer highlighted (green for TWK/TIU)
  - **For TKP:** Show points earned (1-5) and highlight 5-point option
  - Detailed explanation text
  - Related topic/subtopic tags
  - Supporting images if available
- Filter review by:
  - All questions
  - Incorrect only (TWK/TIU)
  - Low-score only (<4 points for TKP)
  - Flagged only
  - By category

### 5.7 Attempt History
- User dashboard showing all past attempts
- Sortable/filterable attempt list:
  - Date taken
  - Package name
  - Total score
  - Category scores with pass/fail indicators
  - Time completed
  - Completion status (completed, in-progress, abandoned)
- Access to review any past attempt
- Performance trend visualization (line chart showing score progression)
- Best score per package highlight
- Personal statistics:
  - Total attempts
  - Average score
  - Improvement rate
  - Success rate

### 5.8 Admin Dashboard
- Overview statistics:
  - Total users, active users today/week
  - Total attempts today/week/month
  - Total questions by category
  - Total packages
  - Average scores by category
  - Pass rate by category
- Recent activity feed (last 20 attempts)
- Question performance analytics:
  - Most missed questions
  - Average time per question
  - Question effectiveness metrics
  - Problem questions (correct rate < 30%)
  - Too easy questions (correct rate > 95%)
- User management: view users, search, deactivate
- System health indicators (API latency, error rates)

---

## 6. Out-of-Scope (MVP)

### 6.1 Deferred to Post-MVP
1. **Payment Integration:** No payment gateways in MVP (all packages free)
2. **Discussion Forums:** No community features
3. **Study Materials:** No textbooks or video tutorials beyond questions
4. **Mobile App:** Web-only; native apps not included
5. **Advanced Analytics:** No AI-powered weak area detection
6. **Gamification:** No badges, leaderboards, achievements
7. **Collaborative Features:** No study groups or friend system
8. **Multi-language Support:** Indonesian only
9. **Offline Mode:** No PWA offline capabilities
10. **Email Notifications:** No automated reminders (except auth emails)
11. **Advanced Question Types:** Multiple choice only
12. **Adaptive Testing:** No difficulty adjustment
13. **Per-Category Timer:** Global timer only
14. **Practice Mode:** Only full exam simulation

---

## 7. User Flows

### 7.1 New User Registration Flow

1. User lands on homepage
2. Clicks "Daftar Sekarang" (Sign Up)
3. Redirected to Clerk sign-up page
4. Enters email + password OR clicks "Continue with Google"
5. **If email/password:** Clerk sends verification email
6. User verifies email by clicking link
7. Redirected to onboarding page
8. User completes profile (name, phone - optional)
9. Profile record created in Supabase `profiles` table via webhook
10. Redirected to user dashboard
11. Sees available packages and "Start First Tryout" CTA

### 7.2 Taking an Exam Flow

1. User views dashboard → sees available packages
2. Clicks on package card → sees package detail page
3. Reviews package info: question count, time limit (100 mins), description
4. **System checks for existing in-progress attempt for this package**
5. **If no active attempt:** Clicks "Mulai Tryout" (Start Exam)
   - System creates new attempt record (status: in_progress)
6. **If active attempt exists:** Shows "Lanjutkan Tryout" (Resume Exam)
   - System loads existing attempt and answers
7. Loads all questions for package (TWK → TIU → TKP)
8. Exam interface displays:
   - **Global timer starts countdown from 100:00**
   - First question displayed
   - Navigation sidebar shows all 110 question numbers
9. User reads question and selects an answer
10. **Auto-save triggers immediately** (saves to `attempt_answers` table server-side)
11. User navigates to next question or uses sidebar (can jump between categories)
12. **Auto-save also triggers every 60 seconds**
13. User can flag questions for later review
14. User clicks "Submit" button OR timer expires
15. System shows confirmation modal: "Submit now? X questions unanswered"
16. User confirms submission
17. System updates attempt status to 'completed'
18. Scoring engine calculates results via `calculate_attempt_score` function:
    - Checks passing grades: TWK≥65, TIU≥80, TKP≥166
    - Calculates percentile
19. User redirected to Result Summary page
20. Can access Detailed Review or return to dashboard

### 7.3 Admin Question Upload Flow

1. Admin logs in → navigates to Admin Dashboard
2. Clicks "Upload Questions" in sidebar
3. Upload page displays:
   - File upload dropzone (CSV)
   - Instructions: "Upload CSV with external image URLs"
   - Template download links
4. Admin drags/drops CSV file or selects via file picker
5. Frontend validates file format and size (< 10MB)
6. Admin clicks "Preview" button
7. System parses file with Papa Parse and displays preview table (first 10 rows)
8. Frontend validation highlights errors:
   - Missing required fields
   - Invalid category values
   - TWK/TIU without correct_answer
   - TKP without tkp_scores
9. **If errors exist:**
   - Admin can fix CSV and re-upload
   - OR continue with valid rows only (skip invalid)
10. **If all valid:**
    - Admin clicks "Upload Questions" button
11. Frontend sends batch to API endpoint
12. API validates with Zod and inserts questions into `questions` table
13. **If image_url provided:**
    - Store URL directly in question record (no upload needed)
14. Success message displays: "X questions uploaded successfully"
15. Admin redirected to Question Management page
16. New questions appear in list (status: draft)

### 7.4 Admin Package Creation Flow

1. Admin navigates to Package Management page
2. Clicks "Create New Package" button
3. **Step 1: Package Info** form displays:
   - Package name (required)
   - Description (optional)
   - Difficulty level (dropdown: easy/medium/hard)
   - Passing score displayed (TWK:65, TIU:80, TKP:166) - not editable
   - Is Active checkbox
4. Admin fills in package details
5. Admin clicks "Next: Select Questions"
6. **Step 2: Question Selection** - tabbed interface:
   - **Tab 1: TWK** - must select exactly 30 questions
   - **Tab 2: TIU** - must select exactly 35 questions
   - **Tab 3: TKP** - must select exactly 45 questions
7. Each tab has:
   - Filter by difficulty, topic
   - Search functionality
   - Question list with checkboxes
   - Selected count indicator: "25/30 selected"
8. Admin selects questions in each category
9. System validates:
   - Correct question counts per category (30+35+45)
   - No duplicate questions
   - All questions are published status
10. **Step 3: Review and Confirm**
    - Summary of selections
    - Preview selected questions (collapsible list)
11. Admin clicks "Create Package"
12. API creates package record in `packages` table
13. API creates associations in `package_questions` table
14. Success message: "Package created successfully"
15. Admin redirected to Package Management page
16. New package appears in list

---

## 8. Functional Requirements

### 8.1 Authentication & Authorization (Clerk)

**FR-AUTH-001**: The system shall use Clerk for all authentication flows (sign up, sign in, sign out, password reset).

**FR-AUTH-002**: The system shall support email/password and Google OAuth sign-in methods.

**FR-AUTH-003**: The system shall require email verification before granting access to protected resources.

**FR-AUTH-004**: The system shall automatically create a profile record in Supabase when a new user signs up via Clerk webhook.

**FR-AUTH-005**: The system shall implement role-based access control with two roles: "user" and "admin".

**FR-AUTH-006**: The system shall restrict admin pages to users with admin role only.

**FR-AUTH-007**: The system shall maintain session state using Clerk's session management.

**FR-AUTH-008**: The system shall automatically log out users after 7 days of inactivity.

**FR-AUTH-009**: The system shall redirect unauthenticated users to sign-in page when accessing protected routes.

**FR-AUTH-010**: The system shall display user avatar and name from Clerk in navigation bar.

### 8.2 User Profile Management

**FR-PROF-001**: The system shall store extended user data in the `profiles` table (user_id, full_name, phone, created_at, updated_at).

**FR-PROF-002**: The system shall allow users to update their full name and phone number.

**FR-PROF-003**: The system shall not allow users to change their email address (managed by Clerk).

**FR-PROF-004**: The system shall display user statistics on profile page: total attempts, average score, rank percentile.

**FR-PROF-005**: The system shall support profile avatar upload via Clerk interface.

### 8.3 Question Management (Admin)

**FR-QUES-001**: The system shall support bulk question upload via CSV file format.

**FR-QUES-002**: CSV format shall include columns: category, question_text, option_a through option_e, correct_answer (TWK/TIU), tkp_score_a through tkp_score_e (TKP), explanation, topic, difficulty, image_url.

**FR-QUES-003**: The system shall validate uploaded questions for:
- Required fields presence (category, question_text, all options)
- Valid category values (TWK, TIU, TKP)
- Valid difficulty values (easy, medium, hard)
- TWK/TIU must have correct_answer (A-E)
- TKP must have all tkp_scores (1-5)
- Image URL format validation if provided

**FR-QUES-004**: The system shall detect and prevent duplicate questions based on question_text similarity (fuzzy matching).

**FR-QUES-005**: The system shall validate that exactly one choice is marked as correct answer for TWK/TIU questions.

**FR-QUES-006**: The system shall validate that TKP questions have scores for all 5 options (1-5 range).

**FR-QUES-007**: The system shall store images via external URL only (no file upload in MVP).

**FR-QUES-008**: The system shall support question editing (text, options, correct answer, explanation).

**FR-QUES-009**: The system shall support soft deletion of questions (is_deleted flag, not permanent deletion).

**FR-QUES-010**: The system shall prevent deletion of questions that are part of packages with existing attempts.

**FR-QUES-011**: The system shall display question preview before publishing.

**FR-QUES-012**: The system shall support question status workflow: draft → published.

### 8.4 Package Management (Admin)

**FR-PACK-001**: The system shall allow admin to create exam packages with title, description, difficulty level.

**FR-PACK-002**: The system shall enforce package structure: exactly 30 TWK + 35 TIU + 45 TKP = 110 total questions.

**FR-PACK-003**: The system shall provide tabbed interface for question selection (TWK tab, TIU tab, TKP tab).

**FR-PACK-004**: The system shall validate that all questions in package are in published status.

**FR-PACK-005**: The system shall prevent duplicate questions within a package.

**FR-PACK-006**: The system shall support package activation/deactivation (is_active flag).

**FR-PACK-007**: The system shall prevent editing or deletion of packages that have user attempts (data integrity).

**FR-PACK-008**: The system shall display package metadata: total questions, category breakdown, estimated time, difficulty.

**FR-PACK-009**: The system shall support soft deletion of packages (is_deleted flag).

**FR-PACK-010**: The system shall provide package templates for quick creation.

### 8.5 Exam Execution (User)

**FR-EXAM-001**: The system shall check for existing active attempt before allowing user to start new exam for same package.

**FR-EXAM-002**: The system shall enforce **one active attempt per package per user** rule.

**FR-EXAM-003**: The system shall display "Resume" button if active attempt exists, "Start" button if no active attempt.

**FR-EXAM-004**: The system shall create attempt record with status 'in_progress' when exam starts.

**FR-EXAM-005**: The system shall implement **global timer of 100 minutes** for all 110 questions.

**FR-EXAM-006**: The system shall display timer countdown in MM:SS format.

**FR-EXAM-007**: The system shall **auto-submit exam when timer reaches 00:00**.

**FR-EXAM-008**: The system shall allow free navigation between all questions (can jump TWK ↔ TIU ↔ TKP).

**FR-EXAM-009**: The system shall display navigation panel showing all 110 question numbers with status indicators:
- Gray: Unanswered
- Blue: Answered
- Yellow: Flagged
- Green: Current question

**FR-EXAM-010**: The system shall allow users to flag/unflag questions for review.

**FR-EXAM-011**: The system shall **auto-save answers immediately when selected** (server-side to `attempt_answers` table).

**FR-EXAM-012**: The system shall **auto-save every 60 seconds** as backup.

**FR-EXAM-013**: The system shall **NOT use localStorage for exam progress** (all state persisted server-side).

**FR-EXAM-014**: The system shall display confirmation modal before final submission with unanswered question count.

**FR-EXAM-015**: The system shall persist timer state on page refresh (calculate remaining time from attempt start_time).

**FR-EXAM-016**: The system shall NOT allow pause/resume functionality (simulates real exam).

**FR-EXAM-017**: The system shall be fully responsive on mobile and desktop devices.

### 8.6 Scoring & Results

**FR-SCORE-001**: The system shall use Supabase function `calculate_attempt_score` for scoring.

**FR-SCORE-002**: The system shall calculate TWK score: 5 points per correct answer, 0 for incorrect/unanswered (max 150).

**FR-SCORE-003**: The system shall calculate TIU score: 5 points per correct answer, 0 for incorrect/unanswered (max 175).

**FR-SCORE-004**: The system shall calculate TKP score: 1-5 points based on option selected, 0 for unanswered (max 225).

**FR-SCORE-005**: The system shall determine pass/fail based on: **TWK ≥ 65 AND TIU ≥ 80 AND TKP ≥ 166**.

**FR-SCORE-006**: The system shall calculate percentile ranking based on all attempts for same package.

**FR-SCORE-007**: The system shall display detailed result summary with:
- Total score and pass/fail status
- Category breakdown with individual pass/fail indicators
- Correct/incorrect/unanswered counts per category
- Percentile ranking
- Time spent

**FR-SCORE-008**: The system shall provide question-by-question review mode with:
- User's selected answer highlighted
- Correct answer highlighted (for TWK/TIU)
- Points earned displayed (for TKP)
- Detailed explanation
- Topic tags
- Image if available

**FR-SCORE-009**: The system shall allow filtering review by: all questions, incorrect only, low-score only, flagged only, by category.

**FR-SCORE-010**: The system shall update attempt status to 'completed' and store all scores after submission.

### 8.7 Attempt History

**FR-HIST-001**: The system shall display all user attempts on dashboard with sortable/filterable list.

**FR-HIST-002**: The system shall display attempt metadata: date, package name, total score, category scores, completion status.

**FR-HIST-003**: The system shall allow access to review any past completed attempt.

**FR-HIST-004**: The system shall display performance trend visualization (line chart).

**FR-HIST-005**: The system shall highlight best score per package.

**FR-HIST-006**: The system shall display personal statistics: total attempts, average score, improvement rate, success rate.

### 8.8 Admin Dashboard

**FR-ADMIN-001**: The system shall display overview statistics: total users, active users, total attempts, total questions, average scores, pass rates.

**FR-ADMIN-002**: The system shall display recent activity feed (last 20 attempts).

**FR-ADMIN-003**: The system shall provide question performance analytics: most missed questions, average time per question, effectiveness metrics.

**FR-ADMIN-004**: The system shall identify problem questions (correct rate < 30%) and too easy questions (correct rate > 95%).

**FR-ADMIN-005**: The system shall provide user management interface: view users, search, deactivate.

**FR-ADMIN-006**: The system shall display system health indicators: API latency, error rates.

---

## 9. Non-Functional Requirements

### 9.1 Performance

**NFR-PERF-001**: Page load time shall be < 2 seconds (95th percentile).

**NFR-PERF-002**: API response time shall be < 500ms (95th percentile).

**NFR-PERF-003**: Exam interface shall support smooth navigation without lag.

**NFR-PERF-004**: Auto-save shall not block user interaction.

**NFR-PERF-005**: System shall handle 500 concurrent users without degradation.

### 9.2 Security

**NFR-SEC-001**: All API endpoints shall validate inputs using Zod schemas.

**NFR-SEC-002**: All sensitive data shall be transmitted over HTTPS only.

**NFR-SEC-003**: User passwords shall never be stored (handled by Clerk).

**NFR-SEC-004**: Question content shall be sanitized to prevent XSS attacks.

**NFR-SEC-005**: Admin endpoints shall verify role authorization.

**NFR-SEC-006**: Database shall use Row Level Security (RLS) policies.

**NFR-SEC-007**: **No sensitive data shall be stored in localStorage** (especially exam state).

**NFR-SEC-008**: Rate limiting shall be applied to admin upload endpoints.

### 9.3 Reliability

**NFR-REL-001**: System uptime shall be 99.5% or higher.

**NFR-REL-002**: Error rate shall be < 0.5% of all requests.

**NFR-REL-003**: Auto-save shall have retry mechanism for failed saves.

**NFR-REL-004**: System shall gracefully handle network interruptions during exam.

**NFR-REL-005**: Database backups shall be performed daily.

### 9.4 Usability

**NFR-USE-001**: Interface language shall be Indonesian (formal).

**NFR-USE-002**: Interface shall be mobile-responsive (320px to 1440px).

**NFR-USE-003**: Interface shall use shadcn/ui components for consistency.

**NFR-USE-004**: Loading states shall use skeleton loaders.

**NFR-USE-005**: Actions shall show spinners and toast notifications.

**NFR-USE-006**: Error messages shall be clear and actionable.

**NFR-USE-007**: Interface shall follow mobile-first design principles.

### 9.5 Maintainability

**NFR-MAIN-001**: Code shall follow TypeScript strict mode.

**NFR-MAIN-002**: Code shall use consistent naming conventions (kebab-case for files, PascalCase for components).

**NFR-MAIN-003**: All database operations shall use Supabase JS client.

**NFR-MAIN-004**: Project structure shall follow App Router conventions (no /src, no /pages).

**NFR-MAIN-005**: All validation shall use Zod schemas.

**NFR-MAIN-006**: Documentation shall be maintained for all major features.

### 9.6 Scalability

**NFR-SCAL-001**: System architecture shall support horizontal scaling via Vercel.

**NFR-SCAL-002**: Database shall use connection pooling.

**NFR-SCAL-003**: Question bank shall support growth to 10,000+ questions.

**NFR-SCAL-004**: Package system shall support 100+ packages.

**NFR-SCAL-005**: Attempt history shall efficiently handle 1000+ attempts per user.

---

## End of PRD

**Document Control:**
- This document supersedes all previous versions
- Changes require approval from product owner
- Technical implementation must align with `architecture.md`
- Database schema must align with `Database-Schema.md`