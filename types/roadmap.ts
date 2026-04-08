// ============================================================
// types/roadmap.ts  (replace seluruh file lama)
// ============================================================

export type PhaseStatus = 'completed' | 'active' | 'locked';

export type PhaseId =
  | 'kenali_ujian'
  | 'kuasai_materi_awal'
  | 'simulasi_awal'
  | 'kuasai_materi_lanjut'
  | 'simulasi_intensif'
  | 'capai_passing_grade'
  | 'evaluasi_mendalam'
  | 'silver'
  | 'gold';

export interface RoadmapPhase {
  id: PhaseId;
  step: number;           // 1–9
  title: string;
  description: string;    // satu kalimat ringkas
  detail: string;         // penjelasan profesional untuk accordion
  requirement: string;    // requirement teknis, tampil di accordion
  icon: string;
  status: PhaseStatus;
  ctaLabel?: string;      // label tombol aksi di accordion
  ctaHref?: string;       // href tombol aksi
}

export interface CategoryScore {
  category: 'TWK' | 'TIU' | 'TKP';
  avg: number;
  passingGrade: number;
  label: string;
  isPassed: boolean;
  gap: number;
}

export interface Milestone {
  id: string;
  label: string;
  achieved: boolean;
  description: string;
}

export interface RoadmapPageData {
  // dari getRoadmapStats()
  avgTwk: number;
  avgTiu: number;
  avgTkp: number;
  totalCompleted: number;
  bestFinalScore: number;
  lastAttemptDate: string | null;
  // tambahan baru
  informasiViewCount: number;   // jumlah materi INFORMASI yang sudah dibuka
  materiViewCount: number;      // jumlah materi TWK/TIU/TKP yang sudah dibuka
}