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
  | 'ukur_peluang'
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
  /** Sudah menetapkan instansi tujuan? (untuk tahap Ukur Peluang Lolos) */
  hasInstansi: boolean;
}

// ─── Peta Perjalanan (visual path roadmap) ────────────────────
export type PathNodeKind = 'reading' | 'quiz' | 'tryout' | 'target' | 'trophy';
export type ContentTier  = 'free' | 'premium' | 'platinum';
export type PathZone     = ContentTier;

export interface PathNode {
  id: string;
  label: string;
  tooltip: string;
  kind: PathNodeKind;
  href: string;
  status: PhaseStatus;
  tier: ContentTier;
  /** Tier user belum cukup untuk mengakses konten spot ini. */
  needsUpgrade: boolean;
}

export interface PathSection {
  id: string;
  title: string;
  zone: PathZone;
  countLabel: string;
  nodes: PathNode[];
}

/** Progres mentah user untuk menghitung status tiap spot roadmap. */
export interface RoadmapProgress {
  modules: {
    id: string;
    category: string;
    topic: string;
    title: string;
    tier: ContentTier;
    is_placeholder: boolean;
  }[];
  viewedModuleIds: string[];
  /** 'CATEGORY|Topic' yang pernah tercakup di sesi drilling yang selesai. */
  drilledTopics: string[];
  /** Satu entri per paket tryout (unik) yang pernah diselesaikan. */
  tryoutsDone: { tier: ContentTier; isHots: boolean }[];
  avgTwk: number;
  avgTiu: number;
  avgTkp: number;
  bestFinalScore: number;
  hasInstansi: boolean;
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