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

// ── Penguasaan topik (statistik) ─────────────────────────────
export type TopicMasteryLevel = 'none' | 'weak' | 'medium' | 'strong';

export type TopicMastery = {
  category: DrillingCategory;
  topic: string;
  answered: number;   // jumlah soal topik ini yang pernah dijawab
  isTKP: boolean;
  // TWK/TIU: akurasi benar; TKP: persen dari skor maksimal (skor/5)
  masteryPct: number; // 0-100 (0 jika belum ada data)
  level: TopicMasteryLevel;
};

export type TopicMasteryByCategory = Record<DrillingCategory, TopicMastery[]>;

export function masteryLevel(answered: number, pct: number): TopicMasteryLevel {
  if (answered === 0) return 'none';
  if (pct < 60) return 'weak';
  if (pct < 80) return 'medium';
  return 'strong';
}
