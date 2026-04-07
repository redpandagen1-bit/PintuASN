// ============================================================
// constants/roadmap-data.ts
// ============================================================

import type { RoadmapPhase, Milestone, RoadmapPageData, CategoryScore } from '@/types/roadmap';

// ─────────────────────────────────────────────────────────────
// PASSING GRADES (resmi BKN)
// ─────────────────────────────────────────────────────────────
export const PASSING_GRADES = {
  TWK: 65,
  TIU: 80,
  TKP: 166,
} as const;

// ─────────────────────────────────────────────────────────────
// FASE PERSIAPAN
// Urutan: Kenali → Kuasai → Latihan → Simulasi → Evaluasi → Siap
// ─────────────────────────────────────────────────────────────
export const ROADMAP_PHASES: Omit<RoadmapPhase, 'status'>[] = [
  {
    id: 1,
    title: 'Kenali Ujian',
    description: 'Pahami format, aturan, dan struktur SKD',
    icon: '🔍',
    detail: 'Pelajari struktur soal TWK, TIU, TKP, durasi ujian 100 menit, dan sistem penilaian CAT BKN.',
  },
  {
    id: 2,
    title: 'Kuasai Materi',
    description: 'Pelajari materi inti tiap kategori',
    icon: '📚',
    detail: 'TWK: Pancasila, UUD, NKRI, Bhineka Tunggal Ika. TIU: verbal, numerik, figural. TKP: pelayanan publik, sosial budaya.',
  },
  {
    id: 3,
    title: 'Latihan Soal',
    description: 'Kerjakan tryout untuk mengukur kemampuan',
    icon: '✏️',
    detail: 'Targetkan minimal 10 tryout selesai. Fokus pada akurasi, bukan kecepatan dulu.',
  },
  {
    id: 4,
    title: 'Simulasi CAT',
    description: 'Simulasi kondisi ujian sesungguhnya',
    icon: '🖥️',
    detail: 'Kerjakan tryout dengan timer penuh 100 menit tanpa jeda. Latih manajemen waktu dan mental.',
  },
  {
    id: 5,
    title: 'Evaluasi',
    description: 'Analisis kelemahan dan perbaiki',
    icon: '📊',
    detail: 'Review riwayat tryout. Identifikasi kategori dengan skor di bawah passing grade dan fokus perbaikan di sana.',
  },
  {
    id: 6,
    title: 'Siap Ujian',
    description: 'Semua skor sudah di atas passing grade',
    icon: '🏆',
    detail: 'TWK ≥ 65, TIU ≥ 80, TKP ≥ 166. Jaga konsistensi dan tetap percaya diri.',
  },
];

// ─────────────────────────────────────────────────────────────
// MILESTONES
// ─────────────────────────────────────────────────────────────
export const getMilestones = (totalCompleted: number, bestScore: number): Milestone[] => [
  {
    id: 'first_tryout',
    label: 'Tryout Pertama',
    achieved: totalCompleted >= 1,
    description: 'Selesaikan tryout pertamamu',
  },
  {
    id: 'tryout_5',
    label: '5 Tryout Selesai',
    achieved: totalCompleted >= 5,
    description: 'Konsistensi adalah kunci',
  },
  {
    id: 'tryout_10',
    label: '10 Tryout Selesai',
    achieved: totalCompleted >= 10,
    description: 'Latihan intensif terbukti',
  },
  {
    id: 'tryout_25',
    label: '25 Tryout Selesai',
    achieved: totalCompleted >= 25,
    description: 'Dedikasi tinggi',
  },
  {
    id: 'score_200',
    label: 'Skor 200+',
    achieved: bestScore >= 200,
    description: 'Capai skor final di atas 200',
  },
  {
    id: 'score_300',
    label: 'Skor 300+',
    achieved: bestScore >= 300,
    description: 'Performa sangat baik',
  },
];

// ─────────────────────────────────────────────────────────────
// DERIVE PHASE STATUS dari data user
// ─────────────────────────────────────────────────────────────
export function derivePhases(data: RoadmapPageData): RoadmapPhase[] {
  const { totalCompleted, avgTwk, avgTiu, avgTkp } = data;
  const allPassed =
    avgTwk >= PASSING_GRADES.TWK &&
    avgTiu >= PASSING_GRADES.TIU &&
    avgTkp >= PASSING_GRADES.TKP;

  // Tentukan phase aktif berdasarkan progress
  let activePhase = 1;
  if (totalCompleted >= 1)  activePhase = 2;
  if (totalCompleted >= 3)  activePhase = 3;
  if (totalCompleted >= 10) activePhase = 4;
  if (totalCompleted >= 20) activePhase = 5;
  if (allPassed)            activePhase = 6;

  return ROADMAP_PHASES.map((phase) => ({
    ...phase,
    status:
      phase.id < activePhase
        ? 'completed'
        : phase.id === activePhase
        ? 'active'
        : 'locked',
  }));
}

// ─────────────────────────────────────────────────────────────
// DERIVE CATEGORY SCORES
// ─────────────────────────────────────────────────────────────
export function deriveCategoryScores(data: RoadmapPageData): CategoryScore[] {
  return [
    {
      category: 'TWK',
      avg: data.avgTwk,
      passingGrade: PASSING_GRADES.TWK,
      label: 'Tes Wawasan Kebangsaan',
      isPassed: data.avgTwk >= PASSING_GRADES.TWK,
      gap: data.avgTwk - PASSING_GRADES.TWK,
    },
    {
      category: 'TIU',
      avg: data.avgTiu,
      passingGrade: PASSING_GRADES.TIU,
      label: 'Tes Intelegensi Umum',
      isPassed: data.avgTiu >= PASSING_GRADES.TIU,
      gap: data.avgTiu - PASSING_GRADES.TIU,
    },
    {
      category: 'TKP',
      avg: data.avgTkp,
      passingGrade: PASSING_GRADES.TKP,
      label: 'Tes Karakteristik Pribadi',
      isPassed: data.avgTkp >= PASSING_GRADES.TKP,
      gap: data.avgTkp - PASSING_GRADES.TKP,
    },
  ];
}

// ─────────────────────────────────────────────────────────────
// REKOMENDASI TEXT
// ─────────────────────────────────────────────────────────────
export function getRekomendasi(data: RoadmapPageData): {
  priority: 'TWK' | 'TIU' | 'TKP' | null;
  message: string;
  action: string;
} {
  const { totalCompleted, avgTwk, avgTiu, avgTkp } = data;

  if (totalCompleted === 0) {
    return {
      priority: null,
      message: 'Belum ada data tryout. Mulai dengan mengerjakan tryout pertamamu!',
      action: 'Mulai Tryout',
    };
  }

  const failing: { category: 'TWK' | 'TIU' | 'TKP'; gap: number }[] = [];
  if (avgTwk < PASSING_GRADES.TWK) failing.push({ category: 'TWK', gap: PASSING_GRADES.TWK - avgTwk });
  if (avgTiu < PASSING_GRADES.TIU) failing.push({ category: 'TIU', gap: PASSING_GRADES.TIU - avgTiu });
  if (avgTkp < PASSING_GRADES.TKP) failing.push({ category: 'TKP', gap: PASSING_GRADES.TKP - avgTkp });

  if (failing.length === 0) {
    return {
      priority: null,
      message: 'Rata-rata skormu sudah melewati semua passing grade! Jaga konsistensi dan terus latihan.',
      action: 'Lihat Statistik',
    };
  }

  // Prioritaskan yang gap-nya paling besar
  const worst = failing.sort((a, b) => b.gap - a.gap)[0];
  const categoryLabel: Record<string, string> = {
    TWK: 'Tes Wawasan Kebangsaan (TWK)',
    TIU: 'Tes Intelegensi Umum (TIU)',
    TKP: 'Tes Karakteristik Pribadi (TKP)',
  };

  return {
    priority: worst.category,
    message: `Fokus ke ${categoryLabel[worst.category]}. Rata-ratamu masih kurang ${worst.gap} poin dari passing grade.`,
    action: 'Lihat Materi',
  };
}