// HANYA type untuk tabel database

export interface Profile {
  user_id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'user' | 'admin';
  avatar_url?: string;
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
  question_text: string;
  question_image_url?: string;
  explanation?: string;
  explanation_image_url?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
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
