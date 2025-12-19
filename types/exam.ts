import { Question, Choice, Attempt } from './database';

// Question dengan choices-nya (untuk ditampilkan di UI)
export interface QuestionWithChoices extends Question {
  choices: Choice[]; // HARUS 5 choices (A, B, C, D, E)
}

// Attempt data yang digunakan saat exam
export interface AttemptRecord extends Attempt {
  package_title?: string;
}

// Scores per kategori
export interface CategoryScores {
  twk: number;
  tiu: number;
  tkp: number;
  total: number;
}

// State management untuk exam
export interface ExamState {
  attemptId: string;
  packageId: string;
  questions: QuestionWithChoices[];
  currentIndex: number;
  answers: AnswerMap;
  flagged: Set<string>; // question IDs yang di-flag
  timeRemaining: number; // milliseconds
  isSubmitting: boolean;
  lastSaved?: Date;
}

// Map jawaban: questionId -> choiceId
export type AnswerMap = Map<string, string>;

// Status setiap soal di navigation
export type QuestionStatus = 'unanswered' | 'answered' | 'flagged' | 'current';
