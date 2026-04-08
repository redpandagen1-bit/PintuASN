// HANYA type untuk tabel database

export type AttemptWithPackage = Attempt & {
  packages: {
    id: string;
    title: string;
    description: string | null;
    difficulty: string;
    total_questions: number;
  } | null;
};

export interface Profile {
  user_id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  gender?: 'Pria' | 'Wanita';
  birth_date?: string;
  address?: string;
  province?: string;
  city?: string;
  district?: string;
  postal_code?: string;
  target_institution?: string;
  subscription_tier?: 'free' | 'premium' | 'platinum';
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration_minutes: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  category: 'TWK' | 'TIU' | 'TKP';
  content: string;                // ← sesuai queries.ts & exam-interface
  image_url?: string | null;      // ← sesuai queries.ts & exam-interface
  explanation?: string | null;
  topic?: string | null;          // ← dipakai di queries.ts
  difficulty: 'easy' | 'medium' | 'hard';
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Choice {
  id: string;
  question_id: string;
  label: string;                  // ← sesuai ReviewChoice
  content: string;                // ← sesuai ReviewChoice & exam-interface
  image_url?: string | null;      // ← dipakai di exam-interface
  is_answer: boolean;             // ← sesuai ReviewChoice & queries.ts
  score?: number | null;          // ← sesuai ReviewChoice & queries.ts
  created_at: string;
}

export interface Choice {
  id: string;
  question_id: string;
  choice_text: string;
  choice_label: 'A' | 'B' | 'C' | 'D' | 'E';
  points: number;
  is_correct: boolean;
  created_at: string;
}

export interface Attempt {
  id: string;
  user_id: string;
  package_id: string;
  started_at: string;
  submitted_at?: string;
  time_remaining_ms?: number;
  score_twk?: number;
  score_tiu?: number;
  score_tkp?: number;
  total_score?: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export interface AttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  choice_id: string;
  is_flagged: boolean;
  answered_at: string;
}

export interface PackageQuestion {
  id: string;
  package_id: string;
  question_id: string;
  order_number: number;
  created_at: string;
}

export interface ReviewChoice {
  id: string;
  label: string;
  content: string;
  is_answer: boolean;
  score?: number;
}

export interface ReviewQuestion {
  position: number;
  id: string;
  category: 'TWK' | 'TIU' | 'TKP';
  content: string;
  image_url?: string | null;
  explanation?: string | null;
  topic?: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  choices: ReviewChoice[];
  userAnswer: {
    id: string;
    attempt_id: string;
    question_id: string;
    choice_id: string;
    is_flagged: boolean;
    answered_at: string;
  } | null;
  isCorrect: boolean | null;
  score: number | null;
  userChoice: ReviewChoice | null;
  correctChoice: ReviewChoice | null;
  isFlagged: boolean;
}

export interface ReviewData {
  attempt: Attempt & {
    packages: Package;
  };
  questions: ReviewQuestion[];
}

export type ReviewFilter = 'all' | 'incorrect' | 'low_score' | 'TWK' | 'TIU' | 'TKP';