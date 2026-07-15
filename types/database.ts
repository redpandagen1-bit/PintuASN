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
  full_name?: string | null;
  phone?: string | null;
  role: 'user' | 'admin';
  avatar_url?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  date_of_birth?: string | null;
  birth_date?: string | null;
  address?: string | null;
  province?: string | null;
  city?: string | null;
  district?: string | null;
  postal_code?: string | null;
  target_institution?: string | null;
  referral_source?: 'TikTok' | 'Google' | 'Instagram' | 'Youtube' | 'Facebook' | null;
  profile_completed?: boolean;
  is_deleted?: boolean;
  deleted_at?: string | null;
  subscription_tier?: 'free' | 'premium' | 'platinum';
  subscription_start?: string | null;
  // ─── Single Active Session ───────────────────────────────────
  // Diisi oleh webhook session.created dengan Clerk session ID.
  // NULL berarti user belum pernah login setelah fitur ini aktif,
  // atau sudah sign out (session.ended webhook).
  // Middleware hanya enforce jika nilai ini bukan NULL.
  active_session_id?: string | null;
  // ─────────────────────────────────────────────────────────────
  onboarding_completed?: boolean;
  deletion_requested_at?: string | null;
  subscription_end?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  title: string;
  description?: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  duration_minutes: number;
  tier?: 'free' | 'premium' | 'platinum';
  is_hots?: boolean;
  total_questions?: number;
  kind?: 'tryout' | 'drilling';
  created_by?: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  category: 'TWK' | 'TIU' | 'TKP';
  // Kolom DB asli adalah `content` & `image_url` (bukan question_text/
  // question_image_url). CSV upload memakai header `question_text` — itu tipe
  // input terpisah, bukan tipe tabel ini.
  content: string;
  image_url?: string | null;
  explanation?: string | null;
  explanation_image_url?: string | null;
  topic?: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  type?: string | null;
  status?: 'draft' | 'published' | 'deleted';
  is_published?: boolean;
  is_deleted: boolean;
  package_id?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Choice {
  id: string;
  question_id: string;
  label: 'A' | 'B' | 'C' | 'D' | 'E';
  content: string;
  image_url?: string | null;
  is_answer: boolean;
  score: number;
  created_at: string;
}

export interface Attempt {
  id: string;
  user_id: string;
  package_id: string;
  started_at: string;
  completed_at?: string | null;
  // Kolom DB asli: `time_remaining` (integer, satuan ms). Bukan time_remaining_ms.
  time_remaining?: number | null;
  score_twk?: number | null;
  score_tiu?: number | null;
  score_tkp?: number | null;
  // Kolom DB asli: `final_score` (bukan total_score).
  final_score?: number | null;
  is_passed?: boolean | null;
  percentile?: number | null;
  kind?: 'tryout' | 'drilling';
  status: 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export interface AttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  choice_id?: string | null;
  is_flagged: boolean;
  answered_at: string;
  time_spent_seconds?: number | null;
}

export interface PackageQuestion {
  id: string;
  package_id: string;
  question_id: string;
  // Kolom DB asli: `position` (bukan order_number).
  position: number;
  created_at: string;
}

export interface ReviewChoice {
  id: string;
  label: string;
  content: string;
  image_url?: string | null;
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
  explanation_image_url?: string | null;
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