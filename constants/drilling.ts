// Taksonomi topik baku untuk fitur Drilling (lihat memory: drilling-topic-taxonomy).
// Kolom questions.topic sudah dinormalisasi ke nama-nama ini (exact match).
// Sesi drilling discope per-kategori (TWK / TIU / TKP) untuk skor & hasil yang jelas.

export type DrillingCategory = 'TWK' | 'TIU' | 'TKP';

export const DRILLING_TOPICS: Record<DrillingCategory, string[]> = {
  TWK: ['Nasionalisme', 'Integritas', 'Bela Negara', 'Pilar Negara', 'Bahasa Indonesia'],
  TIU: [
    'Verbal Analogi',
    'Verbal Silogisme',
    'Verbal Penalaran Analitis',
    'Aritmatika Sosial',
    'Matematika Dasar Berhitung',
    'Deret Angka',
    'Perbandingan Kuantitatif',
    'Jarak Waktu Kecepatan',
  ],
  TKP: [
    'Pelayanan Publik',
    'Jejaring Kerja',
    'Sosial Budaya',
    'Teknologi Informasi dan Komunikasi',
    'Anti Radikalisme',
    'Profesionalisme',
  ],
};

// Semua topik gabungan (untuk query stats sekali jalan).
export const DRILLING_ALL_TOPICS: string[] = Object.values(DRILLING_TOPICS).flat();

export const DRILLING_CATEGORIES: DrillingCategory[] = ['TWK', 'TIU', 'TKP'];

export const CATEGORY_LABEL: Record<DrillingCategory, string> = {
  TWK: 'Tes Wawasan Kebangsaan',
  TIU: 'Tes Intelegensia Umum',
  TKP: 'Tes Karakteristik Pribadi',
};

// Batas konfigurasi sesi (mengikuti pola ayocpns).
export const DRILLING_LIMITS = {
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 50,
  MIN_MINUTES: 5,
  MAX_MINUTES: 100,
  DEFAULT_QUESTIONS: 15,
  DEFAULT_MINUTES: 20,
} as const;

export type DrillingTopicStat = {
  topic: string;
  total: number; // soal tersedia di bank
  done: number;  // sudah pernah dikerjakan user
  remaining: number; // total - done
};

export type DrillingCategoryStats = Record<DrillingCategory, DrillingTopicStat[]>;
