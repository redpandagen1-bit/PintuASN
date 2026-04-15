// ============================================================
// types/roadmap.ts
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
  step: number;
  title: string;
  description: string;
  detail: string;
  requirement: string;
  icon: string;
  status: PhaseStatus;
  ctaLabel?: string;
  ctaHref?: string;
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
  avgTwk: number;
  avgTiu: number;
  avgTkp: number;
  totalCompleted: number;
  bestFinalScore: number;
  lastAttemptDate: string | null;
  informasiViewCount: number;
  materiViewCount: number;
}

// ─── Reminder preference ─────────────────────────────────────
export interface ReminderPreference {
  enabled:      boolean;

  /**
   * Interval preset: latihan setiap N hari.
   * null jika mode custom (gunakan customDays).
   */
  intervalDays: 1 | 2 | 3 | 4 | null;

  /**
   * Mode custom: hari-hari dalam seminggu yang dipilih.
   * 0 = Minggu, 1 = Senin, ..., 6 = Sabtu.
   * null jika pakai intervalDays.
   */
  customDays:   number[] | null;

  examDate:     string | null; // ISO string — tanggal ujian target
  lastNotifAt:  string | null; // ISO string — diisi oleh Edge Function/cron
}