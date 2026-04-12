// ============================================================
// constants/roadmap-data.ts
// ============================================================

import type {
  RoadmapPhase,
  RoadmapPageData,
  CategoryScore,
  Milestone,
  PhaseId,
} from '@/types/roadmap';

// ─────────────────────────────────────────────────────────────
// PASSING GRADES (resmi BKN)
// ─────────────────────────────────────────────────────────────
export const PASSING_GRADES = {
  TWK: 65,
  TIU: 80,
  TKP: 166,
} as const;

// ─────────────────────────────────────────────────────────────
// THRESHOLD per STEP
// ─────────────────────────────────────────────────────────────
export const THRESHOLDS = {
  INFORMASI_VIEW:       1,    // step 1
  MATERI_AWAL_VIEW:     4,    // step 2
  SIMULASI_AWAL:        2,    // step 3
  MATERI_LANJUT_VIEW:   8,    // step 4
  SIMULASI_INTENSIF:    6,    // step 5
  // step 6: allPassed (avg >= passing grade)
  EVALUASI_TRYOUT:      20,   // step 7
  SILVER_SCORE:         475,  // step 8
  GOLD_SCORE:           500,  // step 9
} as const;

// ─────────────────────────────────────────────────────────────
// DEFINISI 9 FASE (statis — tanpa status)
// ─────────────────────────────────────────────────────────────
const PHASE_DEFINITIONS: Omit<RoadmapPhase, 'status'>[] = [
  {
    id: 'kenali_ujian',
    step: 1,
    title: 'Kenali Ujian',
    description: 'Pahami format, struktur, dan aturan SKD CPNS 2026',
    detail:
      'Sebelum berlatih, pastikan Anda memahami secara menyeluruh mekanisme Seleksi Kompetensi Dasar (SKD): komposisi soal (TWK, TIU, TKP), sistem penilaian CAT BKN, passing grade masing-masing kategori, serta tata cara pelaksanaan ujian di lokasi. Pemahaman ini adalah fondasi agar setiap sesi latihan berjalan terarah.',
    requirement: 'Buka minimal 1 materi "Format & Informasi Ujian" di halaman Materi.',
    icon: '🔍',
    ctaLabel: 'Buka Materi',
    ctaHref: '/materi',
  },
  {
    id: 'kuasai_materi_awal',
    step: 2,
    title: 'Penguatan Materi Awal',
    description: 'Bangun pemahaman dasar pada tiga kategori SKD',
    detail:
      'Tahap ini berfokus pada pembangunan fondasi pengetahuan. Pelajari konsep-konsep inti pada kategori TWK (Wawasan Kebangsaan), TIU (Intelegensi Umum), dan TKP (Karakteristik Pribadi). Manfaatkan materi dalam format video maupun PDF yang tersedia untuk memperluas wawasan sebelum mulai mengerjakan soal latihan.',
    requirement:
      'Akses minimal 4 materi dari kategori TWK, TIU, atau TKP (video atau PDF).',
    icon: '📖',
    ctaLabel: 'Buka Materi',
    ctaHref: '/materi',
  },
  {
    id: 'simulasi_awal',
    step: 3,
    title: 'Simulasi Awal',
    description: 'Ukur kemampuan awal dengan mengerjakan tryout perdana',
    detail:
      'Setelah memiliki pemahaman dasar, saatnya mengukur posisi Anda secara objektif. Kerjakan tryout untuk mengetahui distribusi skor awal pada setiap kategori. Hasil ini akan menjadi baseline yang memandu fokus belajar Anda ke depan. Jangan khawatir dengan skor tujuan utama tahap ini adalah pemetaan, bukan pencapaian.',
    requirement: 'Selesaikan minimal 2 paket tryout hingga tuntas.',
    icon: '📝',
    ctaLabel: 'Mulai Tryout',
    ctaHref: '/daftar-tryout',
  },
  {
    id: 'kuasai_materi_lanjut',
    step: 4,
    title: 'Pendalaman Materi',
    description: 'Perdalam pemahaman berdasarkan hasil evaluasi awal',
    detail:
      'Berbekal data dari simulasi awal, identifikasi kategori dengan skor paling lemah dan prioritaskan pendalaman pada area tersebut. Eksplorasi lebih banyak materi — termasuk topik-topik spesifik dalam TWK, TIU, dan TKP — untuk menutup celah pengetahuan yang ditemukan. Kualitas pemahaman pada tahap ini akan sangat menentukan laju peningkatan skor.',
    requirement:
      'Akses minimal 8 materi dari kategori TWK, TIU, atau TKP (video atau PDF).',
    icon: '📚',
    ctaLabel: 'Buka Materi',
    ctaHref: '/materi',
  },
  {
    id: 'simulasi_intensif',
    step: 5,
    title: 'Latihan Intensif',
    description: 'Tingkatkan stamina dan konsistensi melalui latihan berulang',
    detail:
      'Tahap ini dirancang untuk membangun konsistensi dan kecepatan menjawab. Kerjakan tryout secara rutin untuk melatih kemampuan manajemen waktu, ketepatan analisis soal, dan ketahanan konsentrasi selama 100 menit penuh. Semakin banyak variasi soal yang Anda temui, semakin tajam intuisi Anda dalam menghadapi pola soal yang beragam.',
    requirement: 'Selesaikan minimal 6 paket tryout tambahan (total kumulatif).',
    icon: '💪',
    ctaLabel: 'Mulai Tryout',
    ctaHref: '/daftar-tryout',
  },
  {
    id: 'capai_passing_grade',
    step: 6,
    title: 'Capai Passing Grade',
    description: 'Pastikan rata-rata skor melampaui ambang batas kelulusan',
    detail:
      'Ini adalah tonggak kritis dalam perjalanan persiapan Anda. Target tahap ini adalah memastikan rata-rata skor pada seluruh kategori secara konsisten berada di atas passing grade yang ditetapkan BKN: TWK ≥ 65, TIU ≥ 80, dan TKP ≥ 166. Jika salah satu kategori masih di bawah threshold, fokuskan latihan pada kategori tersebut sebelum melanjutkan.',
    requirement:
      'Rata-rata skor TWK ≥ 65, TIU ≥ 80, dan TKP ≥ 166 dari seluruh tryout yang dikerjakan.',
    icon: '🎯',
    ctaLabel: 'Lihat Statistik',
    ctaHref: '/statistics',
  },
  {
    id: 'evaluasi_mendalam',
    step: 7,
    title: 'Evaluasi & Optimasi',
    description: 'Analisis pola kelemahan dan optimalkan strategi menjawab',
    detail:
      'Dengan volume latihan yang cukup, saatnya melakukan analisis mendalam terhadap pola kesalahan Anda. Perhatikan topik-topik soal yang sering keliru, evaluasi strategi pengerjaan per kategori, dan identifikasi apakah kelemahan bersifat konseptual atau teknis (mis. kehabisan waktu). Optimasi strategi pada tahap ini adalah yang paling berdampak terhadap peningkatan skor akhir.',
    requirement: 'Selesaikan minimal 20 paket tryout secara kumulatif.',
    icon: '🔬',
    ctaLabel: 'Lihat Riwayat',
    ctaHref: '/history',
  },
  {
    id: 'silver',
    step: 8,
    title: 'Prestasi Silver',
    description: 'Capai skor final di atas 475 poin',
    detail:
      'Meraih skor di atas 475 menandakan Anda telah berada pada level kompetitif yang kuat. Pada level ini, kemampuan Anda sudah secara signifikan melampaui passing grade dan memasuki zona persaingan nyata di antara peserta seleksi. Pertahankan konsistensi dan terus asah kecepatan serta akurasi untuk mencapai level berikutnya.',
    requirement: 'Raih skor final tertinggi lebih dari 475 poin pada satu paket tryout.',
    icon: '🥈',
    ctaLabel: 'Lihat Skor Terbaik',
    ctaHref: '/statistics',
  },
  {
    id: 'gold',
    step: 9,
    title: 'Prestasi Gold',
    description: 'Capai skor final di atas 500 poin — level tertinggi',
    detail:
      'Skor di atas 500 menempatkan Anda di antara peserta dengan performa terbaik. Pencapaian ini mencerminkan penguasaan materi yang komprehensif, strategi menjawab yang efisien, dan ketahanan mental yang terlatih. Anda telah melampaui level latihan biasa dan siap bersaing di posisi terdepan dalam seleksi CPNS.',
    requirement: 'Raih skor final tertinggi lebih dari 500 poin pada satu paket tryout.',
    icon: '🥇',
    ctaLabel: 'Lihat Skor Terbaik',
    ctaHref: '/statistics',
  },
];

// ─────────────────────────────────────────────────────────────
// DERIVE PHASE STATUS — BENAR-BENAR SEQUENTIAL
//
// Aturan:
//   - Step N hanya bisa 'completed' jika step N-1 juga 'completed'
//   - Step pertama yang belum completed = 'active'
//   - Semua step setelah active = 'locked'
//
// Artinya: meski syarat teknis step 5 terpenuhi (totalCompleted >= 6),
// kalau step 2 belum selesai maka step 3,4,5,... tetap locked.
// ─────────────────────────────────────────────────────────────
export function derivePhases(data: RoadmapPageData): RoadmapPhase[] {
  const {
    informasiViewCount,
    materiViewCount,
    totalCompleted,
    avgTwk,
    avgTiu,
    avgTkp,
    bestFinalScore,
  } = data;

  const allPassed =
    avgTwk >= PASSING_GRADES.TWK &&
    avgTiu >= PASSING_GRADES.TIU &&
    avgTkp >= PASSING_GRADES.TKP;

  // Syarat teknis masing-masing step (tanpa mempertimbangkan urutan)
  const technicallyDone: Record<PhaseId, boolean> = {
    kenali_ujian:         informasiViewCount >= THRESHOLDS.INFORMASI_VIEW,
    kuasai_materi_awal:   materiViewCount    >= THRESHOLDS.MATERI_AWAL_VIEW,
    simulasi_awal:        totalCompleted     >= THRESHOLDS.SIMULASI_AWAL,
    kuasai_materi_lanjut: materiViewCount    >= THRESHOLDS.MATERI_LANJUT_VIEW,
    simulasi_intensif:    totalCompleted     >= THRESHOLDS.SIMULASI_INTENSIF,
    capai_passing_grade:  allPassed,
    evaluasi_mendalam:    totalCompleted     >= THRESHOLDS.EVALUASI_TRYOUT,
    silver:               bestFinalScore     >  THRESHOLDS.SILVER_SCORE,
    gold:                 bestFinalScore     >  THRESHOLDS.GOLD_SCORE,
  };

  // Pass sequential: step N completed hanya jika step N-1 completed DAN syarat teknis terpenuhi
  let previousCompleted = true; // step pertama tidak punya prasyarat
  let foundActive = false;

  return PHASE_DEFINITIONS.map((phase) => {
    // Step ini hanya bisa completed jika step sebelumnya completed
    const isDone = previousCompleted && technicallyDone[phase.id];

    if (isDone) {
      previousCompleted = true;
      return { ...phase, status: 'completed' as const };
    }

    // Step sebelumnya tidak completed → step ini dan seterusnya locked/active
    previousCompleted = false;

    if (!foundActive) {
      foundActive = true;
      return { ...phase, status: 'active' as const };
    }

    return { ...phase, status: 'locked' as const };
  });
}

// ─────────────────────────────────────────────────────────────
// DERIVE CATEGORY SCORES
// ─────────────────────────────────────────────────────────────
export function deriveCategoryScores(data: RoadmapPageData): CategoryScore[] {
  return [
    {
      category:     'TWK',
      avg:          data.avgTwk,
      passingGrade: PASSING_GRADES.TWK,
      label:        'Tes Wawasan Kebangsaan',
      isPassed:     data.avgTwk >= PASSING_GRADES.TWK,
      gap:          data.avgTwk - PASSING_GRADES.TWK,
    },
    {
      category:     'TIU',
      avg:          data.avgTiu,
      passingGrade: PASSING_GRADES.TIU,
      label:        'Tes Intelegensi Umum',
      isPassed:     data.avgTiu >= PASSING_GRADES.TIU,
      gap:          data.avgTiu - PASSING_GRADES.TIU,
    },
    {
      category:     'TKP',
      avg:          data.avgTkp,
      passingGrade: PASSING_GRADES.TKP,
      label:        'Tes Karakteristik Pribadi',
      isPassed:     data.avgTkp >= PASSING_GRADES.TKP,
      gap:          data.avgTkp - PASSING_GRADES.TKP,
    },
  ];
}

// ─────────────────────────────────────────────────────────────
// MILESTONES
// ─────────────────────────────────────────────────────────────
export function getMilestones(data: RoadmapPageData): Milestone[] {
  const phases = derivePhases(data);
  const isCompleted = (id: PhaseId) =>
    phases.find((p) => p.id === id)?.status === 'completed';

  return [
    {
      id:          'kenali_ujian',
      label:       'Kenali Ujian',
      achieved:    isCompleted('kenali_ujian'),
      description: 'Membuka materi format ujian',
    },
    {
      id:          'simulasi_awal',
      label:       'Simulasi Perdana',
      achieved:    isCompleted('simulasi_awal'),
      description: '2 tryout pertama selesai',
    },
    {
      id:          'capai_passing_grade',
      label:       'Passing Grade',
      achieved:    isCompleted('capai_passing_grade'),
      description: 'Semua kategori melampaui ambang batas',
    },
    {
      id:          'evaluasi_mendalam',
      label:       'Evaluasi Mendalam',
      achieved:    isCompleted('evaluasi_mendalam'),
      description: '20 tryout kumulatif selesai',
    },
    {
      id:          'silver',
      label:       'Silver',
      achieved:    isCompleted('silver'),
      description: 'Skor terbaik > 475',
    },
    {
      id:          'gold',
      label:       'Gold',
      achieved:    isCompleted('gold'),
      description: 'Skor terbaik > 500',
    },
  ];
}

// ─────────────────────────────────────────────────────────────
// REKOMENDASI
// ─────────────────────────────────────────────────────────────
export function getRekomendasi(data: RoadmapPageData): {
  priority: 'TWK' | 'TIU' | 'TKP' | null;
  message: string;
  action: string;
  href: string;
} {
  const phases = derivePhases(data);
  const activePhase = phases.find((p) => p.status === 'active');

  if (!activePhase) {
    return {
      priority: null,
      message:
        'Luar biasa! Anda telah menyelesaikan seluruh tahap persiapan. Pertahankan konsistensi latihan menjelang hari ujian.',
      action: 'Lihat Statistik',
      href:   '/statistics',
    };
  }

  if (
    activePhase.id === 'kenali_ujian' ||
    activePhase.id === 'kuasai_materi_awal' ||
    activePhase.id === 'kuasai_materi_lanjut'
  ) {
    return {
      priority: null,
      message:  `Langkah berikutnya: ${activePhase.title}. ${activePhase.requirement}`,
      action:   'Buka Materi',
      href:     '/materi',
    };
  }

  if (activePhase.id === 'simulasi_awal' || activePhase.id === 'simulasi_intensif') {
    return {
      priority: null,
      message:  `Langkah berikutnya: ${activePhase.title}. ${activePhase.requirement}`,
      action:   'Mulai Tryout',
      href:     '/daftar-tryout',
    };
  }

  if (activePhase.id === 'capai_passing_grade') {
    const failing = [
      { cat: 'TWK' as const, gap: PASSING_GRADES.TWK - data.avgTwk },
      { cat: 'TIU' as const, gap: PASSING_GRADES.TIU - data.avgTiu },
      { cat: 'TKP' as const, gap: PASSING_GRADES.TKP - data.avgTkp },
    ]
      .filter((x) => x.gap > 0)
      .sort((a, b) => b.gap - a.gap);

    const worst = failing[0];
    return {
      priority: worst?.cat ?? null,
      message:  worst
        ? `Fokuskan latihan pada ${worst.cat} — masih kurang ${worst.gap} poin dari passing grade.`
        : 'Rata-rata skor Anda sudah mendekati passing grade. Terus konsisten!',
      action: 'Mulai Tryout',
      href:   '/daftar-tryout',
    };
  }

  return {
    priority: null,
    message:  `Langkah berikutnya: ${activePhase.title}. ${activePhase.requirement}`,
    action:   activePhase.ctaLabel ?? 'Lihat Detail',
    href:     activePhase.ctaHref  ?? '/statistics',
  };
}