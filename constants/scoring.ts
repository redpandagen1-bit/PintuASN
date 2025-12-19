// HANYA scoring configuration - JANGAN TAMBAH YANG LAIN

export const TWK_CONFIG = {
  QUESTIONS: 30,
  POINTS_CORRECT: 5,
  PASSING_GRADE: 65,
  MAX_SCORE: 150,
} as const;

export const TIU_CONFIG = {
  QUESTIONS: 35,
  POINTS_CORRECT: 5,
  PASSING_GRADE: 80,
  MAX_SCORE: 175,
} as const;

export const TKP_CONFIG = {
  QUESTIONS: 45,
  POINTS_MIN: 1,
  POINTS_MAX: 5,
  PASSING_GRADE: 166,
  MAX_SCORE: 225,
} as const;

export const TOTAL_QUESTIONS = 110;
export const TOTAL_MAX_SCORE = 550;