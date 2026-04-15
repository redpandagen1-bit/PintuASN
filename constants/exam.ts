// HANYA exam-related constants - JANGAN TAMBAH YANG LAIN

export const EXAM_DURATION_MS = 6_000_000; // 100 menit = 6,000,000 ms
export const AUTO_SAVE_INTERVAL = 60_000; // 60 detik = 60,000 ms
export const WARNING_TIME_MS = 300_000; // 5 menit = 300,000 ms (untuk warning)

export const QUESTION_COUNTS = {
  TWK: 30,
  TIU: 35,
  TKP: 45,
  TOTAL: 110,
} as const;

export const CATEGORIES = ['TWK', 'TIU', 'TKP'] as const;
export type Category = typeof CATEGORIES[number];

export const PASSING_GRADES = {
  TWK: 65,
  TIU: 80,
  TKP: 166,
} as const;
