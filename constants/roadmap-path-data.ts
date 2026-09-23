// ============================================================
// constants/roadmap-path-data.ts
// "Peta Perjalanan" — roadmap spot-per-spot (gaya Duolingo).
//
// Setiap spot punya link spesifik (materi per topik, drilling per topik,
// tryout per tier) dan aturan selesai yang dicek dari progres nyata user.
// Spot dibuka berurutan: spot N baru 'completed' bila spot N-1 completed.
//
// Zona: ±1/3 awal GRATIS → PREMIUM → PLATINUM di akhir.
// Drilling selalu gratis, jadi boleh muncul di zona mana pun.
// ============================================================

import { canAccess } from '@/lib/subscription-utils';
import type {
  ContentTier, PathNode, PathSection, PathZone, PhaseStatus, RoadmapProgress,
} from '@/types/roadmap';
import { PASSING_GRADES } from '@/constants/roadmap-data';

type Category = 'INFORMASI' | 'TWK' | 'TIU' | 'TKP';
type SkdCategory = 'TWK' | 'TIU' | 'TKP';

type SpotRequirement =
  | {
      kind: 'materi';
      category: Category;
      topic: string;
      /** Hanya modul dengan tier ini (mis. memisah Nasionalisme gratis vs lanjutan). */
      tier?: ContentTier;
      /** Hanya modul yang judulnya memuat salah satu kata ini. */
      include?: string[];
      /** Buang modul yang judulnya memuat salah satu kata ini. */
      exclude?: string[];
    }
  | { kind: 'drilling'; category: SkdCategory; topics: string[] }
  | { kind: 'tryout'; tier: ContentTier; count: number; hots?: boolean }
  | { kind: 'instansi' }
  | { kind: 'passing_grade' }
  | { kind: 'score'; min: number };

interface SpotDef {
  id: string;
  label: string;
  tooltip: string;
  req: SpotRequirement;
}

interface SectionDef {
  id: string;
  title: string;
  zone: PathZone;
  spots: SpotDef[];
}

const materi = (
  id: string, label: string, tooltip: string,
  category: Category, topic: string,
  opts: { tier?: ContentTier; include?: string[]; exclude?: string[] } = {},
): SpotDef => ({ id, label, tooltip, req: { kind: 'materi', category, topic, ...opts } });

const drilling = (
  id: string, label: string, tooltip: string, category: SkdCategory, ...topics: string[]
): SpotDef => ({ id, label, tooltip, req: { kind: 'drilling', category, topics } });

const tryout = (
  id: string, label: string, tooltip: string, tier: ContentTier, count: number, hots?: boolean,
): SpotDef => ({ id, label, tooltip, req: { kind: 'tryout', tier, count, hots } });

// ─────────────────────────────────────────────────────────────
// URUTAN SPOT
// ─────────────────────────────────────────────────────────────
const SECTIONS: SectionDef[] = [
  // ══════════════ ZONA GRATIS ══════════════
  {
    id: 'kenali_seleksi',
    title: 'Kenali Seleksi CPNS',
    zone: 'free',
    spots: [
      materi('info_pengenalan', 'Pengenalan Seleksi CPNS', 'Gambaran umum seleksi CPNS dari awal sampai akhir', 'INFORMASI', 'Pengenalan Seleksi CPNS'),
      materi('info_alur', 'Alur & Tahapan Seleksi', 'Urutan tahapan dari pendaftaran hingga pengumuman', 'INFORMASI', 'Alur dan Tahapan Seleksi'),
      materi('info_syarat', 'Persyaratan & Formasi', 'Dokumen wajib dan cara memilih formasi', 'INFORMASI', 'Persyaratan dan Formasi'),
      materi('info_skd', 'Mengenal SKD', 'Komposisi soal TWK, TIU, TKP dan passing grade', 'INFORMASI', 'Mengenal SKD'),
      materi('info_skb', 'Mengenal SKB', 'Tahap seleksi kompetensi bidang setelah SKD', 'INFORMASI', 'Mengenal SKB'),
      materi('info_tips', 'Tips & Strategi Lolos', 'Strategi belajar dan mengerjakan ujian CAT', 'INFORMASI', 'Tips dan Strategi Lolos'),
    ],
  },
  {
    id: 'cicip_twk',
    title: 'Cicip Soal TWK',
    zone: 'free',
    spots: [
      materi('twk_nasionalisme_dasar', 'Pengertian Nasionalisme', 'Materi pembuka Tes Wawasan Kebangsaan', 'TWK', 'Nasionalisme', { tier: 'free' }),
      drilling('dr_nasionalisme', 'Drilling Nasionalisme', 'Coba soal-soal Nasionalisme', 'TWK', 'Nasionalisme'),
      drilling('dr_integritas', 'Drilling Integritas', 'Coba soal-soal Integritas', 'TWK', 'Integritas'),
      drilling('dr_bela_negara', 'Drilling Bela Negara', 'Coba soal-soal Bela Negara', 'TWK', 'Bela Negara'),
      drilling('dr_pilar_negara', 'Drilling Pilar Negara', 'Coba soal Pancasila, UUD 1945, NKRI', 'TWK', 'Pilar Negara'),
      drilling('dr_bahasa', 'Drilling Bahasa Indonesia', 'Coba soal EYD dan kebahasaan', 'TWK', 'Bahasa Indonesia'),
    ],
  },
  {
    id: 'cicip_tiu_tkp',
    title: 'Cicip Soal TIU & TKP',
    zone: 'free',
    spots: [
      drilling('dr_analogi', 'Drilling Verbal Analogi', 'Coba soal hubungan antar kata', 'TIU', 'Verbal Analogi'),
      drilling('dr_deret', 'Drilling Deret Angka', 'Coba tebak pola deret bilangan', 'TIU', 'Deret Angka'),
      drilling('dr_figural', 'Drilling Figural', 'Coba soal pola dan rotasi gambar', 'TIU', 'Figural'),
      drilling('dr_pelayanan', 'Drilling Pelayanan Publik', 'Coba soal situasi pelayanan publik', 'TKP', 'Pelayanan Publik'),
      drilling('dr_sosbud', 'Drilling Sosial Budaya', 'Coba soal sikap dalam keberagaman', 'TKP', 'Sosial Budaya'),
      drilling('dr_profesionalisme', 'Drilling Profesionalisme', 'Coba soal sikap profesional ASN', 'TKP', 'Profesionalisme'),
    ],
  },
  {
    id: 'tryout_perdana',
    title: 'Tryout Perdana',
    zone: 'free',
    spots: [
      tryout('to_gratis', 'Tryout SKD Gratis', 'Simulasi CAT penuh untuk mengukur skor awalmu', 'free', 1),
      { id: 'ukur_peluang', label: 'Ukur Peluang Lolos', tooltip: 'Tetapkan instansi tujuan dan lihat posisimu', req: { kind: 'instansi' } },
    ],
  },

  // ══════════════ ZONA PREMIUM ══════════════
  {
    id: 'twk_mendalam',
    title: 'TWK: Kebangsaan',
    zone: 'premium',
    spots: [
      materi('twk_nasionalisme', 'Nasionalisme Lanjutan', 'Faktor pembentuk, tujuan, dan contoh nasionalisme', 'TWK', 'Nasionalisme', { tier: 'premium' }),
      materi('twk_integritas', 'Materi Integritas', 'Indikator, urgensi, dan nilai-nilai integritas ASN', 'TWK', 'Integritas'),
      materi('twk_bela_negara', 'Materi Bela Negara', 'Nilai dasar, komponen, dan bentuk bela negara', 'TWK', 'Bela Negara'),
      materi('twk_pancasila', 'Pilar Negara: Pancasila', 'Lahirnya, fungsi, dan nilai-nilai Pancasila', 'TWK', 'Pilar Negara', { include: ['Pilar Negara', 'Pancasila'] }),
      materi('twk_uud', 'Pilar Negara: UUD 1945', 'Dinamika konstitusi, amandemen, dan sistematika UUD', 'TWK', 'Pilar Negara', { include: ['Konstitusi', 'UUD'] }),
      materi('twk_bahasa', 'Materi Bahasa Indonesia', 'EYD Edisi V, huruf kapital, singkatan, dan akronim', 'TWK', 'Bahasa Indonesia'),
      tryout('to_premium_1', 'Tryout Premium #1', 'Uji penguasaan TWK di simulasi penuh', 'premium', 1),
    ],
  },
  {
    id: 'tiu_verbal',
    title: 'TIU: Verbal',
    zone: 'premium',
    spots: [
      materi('tiu_analogi', 'Materi Verbal Analogi', '9 tipe analogi dari sinonim sampai sebab-akibat', 'TIU', 'Kemampuan Verbal Analogi'),
      materi('tiu_silogisme', 'Materi Silogisme', 'Logika matematika, modus ponens & tollens', 'TIU', 'Kemampuan Verbal Silogisme'),
      drilling('dr_silogisme', 'Drilling Silogisme', 'Latih penarikan kesimpulan logis', 'TIU', 'Verbal Silogisme'),
      materi('tiu_analitis', 'Materi Penalaran Analitis', 'Tipe implikasi, urutan, dan kombinasi', 'TIU', 'Kemampuan Verbal Penalaran Analitis'),
      drilling('dr_analitis', 'Drilling Penalaran Analitis', 'Latih soal urutan dan kombinasi', 'TIU', 'Verbal Penalaran Analitis'),
    ],
  },
  {
    id: 'tiu_numerik',
    title: 'TIU: Hitung & Figural',
    zone: 'premium',
    spots: [
      materi('tiu_mtk_operasi', 'Matematika Dasar: Operasi', 'Bilangan bulat, pecahan, pangkat, dan akar', 'TIU', 'Matematika Dasar Berhitung', { exclude: ['Satuan', 'Pengolahan Data', 'Pemodelan'] }),
      materi('tiu_mtk_terapan', 'Matematika Dasar: Terapan', 'Kesetaraan satuan, pengolahan data, pemodelan', 'TIU', 'Matematika Dasar Berhitung', { include: ['Satuan', 'Pengolahan Data', 'Pemodelan'] }),
      drilling('dr_mtk', 'Drilling Matematika Dasar', 'Latih kecepatan berhitung', 'TIU', 'Matematika Dasar Berhitung'),
      materi('tiu_aritmatika', 'Materi Aritmatika Sosial', 'Untung rugi, diskon, bunga, bruto-neto-tara', 'TIU', 'Aritmatika Sosial'),
      drilling('dr_aritmatika', 'Drilling Aritmatika Sosial', 'Latih soal cerita jual beli', 'TIU', 'Aritmatika Sosial'),
      materi('tiu_deret', 'Materi Deret Angka', 'Pola Fibonacci, larik, bertingkat, kombinasi', 'TIU', 'Deret Angka'),
      materi('tiu_perbandingan', 'Materi Perbandingan', 'Perbandingan senilai, berbalik nilai, campuran', 'TIU', 'Perbandingan Kuantitatif'),
      drilling('dr_perbandingan', 'Drilling Perbandingan', 'Latih soal perbandingan kuantitatif', 'TIU', 'Perbandingan Kuantitatif'),
      materi('tiu_jwk', 'Jarak, Waktu, Kecepatan', 'Berpapasan dan menyusul', 'TIU', 'Jarak Waktu Kecepatan'),
      drilling('dr_jwk', 'Drilling Jarak Waktu Kecepatan', 'Latih soal gerak dan waktu tempuh', 'TIU', 'Jarak Waktu Kecepatan'),
      materi('tiu_figural', 'Materi Figural', 'Analogi, klasifikasi, serial, dan rotasi gambar', 'TIU', 'Figural'),
      tryout('to_premium_2', 'Tryout Premium #2', 'Uji TWK + TIU di simulasi penuh', 'premium', 2),
    ],
  },
  {
    id: 'tkp',
    title: 'TKP: Karakter Pribadi',
    zone: 'premium',
    spots: [
      materi('tkp_pelayanan', 'Materi Pelayanan Publik', 'Asas, standar, dan pelayanan prima ASN', 'TKP', 'Pelayanan Publik'),
      materi('tkp_jejaring', 'Materi Jejaring Kerja', 'Membangun kolaborasi dan relasi kerja', 'TKP', 'Jejaring Kerja'),
      drilling('dr_jejaring', 'Drilling Jejaring Kerja', 'Latih soal situasi kolaborasi', 'TKP', 'Jejaring Kerja'),
      materi('tkp_sosbud', 'Materi Sosial Budaya', 'Sikap adaptif dalam masyarakat majemuk', 'TKP', 'Sosial Budaya'),
      materi('tkp_tik', 'Materi TIK', 'Pemanfaatan teknologi dalam pekerjaan', 'TKP', 'Teknologi Informasi dan Komunikasi'),
      drilling('dr_tik', 'Drilling TIK', 'Latih soal teknologi informasi', 'TKP', 'Teknologi Informasi dan Komunikasi'),
      materi('tkp_radikalisme', 'Materi Anti Radikalisme', 'Mengenali dan menangkal paham radikal', 'TKP', 'Anti Radikalisme'),
      drilling('dr_radikalisme', 'Drilling Anti Radikalisme', 'Latih soal sikap anti radikalisme', 'TKP', 'Anti Radikalisme'),
      materi('tkp_profesionalisme', 'Materi Profesionalisme', 'Ciri dan penerapan sikap profesional ASN', 'TKP', 'Profesionalisme'),
      tryout('to_premium_3', 'Tryout Premium #3', 'Simulasi penuh dengan seluruh materi', 'premium', 3),
    ],
  },
  {
    id: 'latihan_intensif',
    title: 'Latihan Intensif',
    zone: 'premium',
    spots: [
      tryout('to_hots_premium', 'Tryout HOTS', 'Soal tipe HOTS yang lebih menantang', 'premium', 1, true),
      tryout('to_premium_5', 'Tryout Premium #5', 'Bangun konsistensi lewat latihan rutin', 'premium', 5),
      { id: 'passing_grade', label: 'Lampaui Passing Grade', tooltip: `Rata-rata TWK ≥ ${PASSING_GRADES.TWK}, TIU ≥ ${PASSING_GRADES.TIU}, TKP ≥ ${PASSING_GRADES.TKP}`, req: { kind: 'passing_grade' } },
    ],
  },

  // ══════════════ ZONA PLATINUM ══════════════
  {
    id: 'menuju_puncak',
    title: 'Menuju Puncak',
    zone: 'platinum',
    spots: [
      tryout('to_platinum_1', 'Tryout Platinum #1', 'Paket eksklusif setara ujian sebenarnya', 'platinum', 1),
      tryout('to_hots_platinum', 'Tryout HOTS Platinum', 'Level tersulit untuk menguji kesiapan', 'platinum', 1, true),
      tryout('to_platinum_5', 'Tryout Platinum #5', 'Pertajam strategi di banyak variasi soal', 'platinum', 5),
      { id: 'silver', label: 'Prestasi Silver', tooltip: 'Raih skor final di atas 475', req: { kind: 'score', min: 475 } },
      { id: 'gold', label: 'Prestasi Gold', tooltip: 'Raih skor final di atas 500 — siap tempur!', req: { kind: 'score', min: 500 } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Evaluasi
// ─────────────────────────────────────────────────────────────
const TIER_RANK: Record<ContentTier, number> = { free: 0, premium: 1, platinum: 2 };

const hasAny = (title: string, words: string[]) =>
  words.some(w => title.toLowerCase().includes(w.toLowerCase()));

type ModuleRow = RoadmapProgress['modules'][number];

function matchModules(req: Extract<SpotRequirement, { kind: 'materi' }>, modules: ModuleRow[]) {
  return modules.filter(m =>
    m.category === req.category &&
    m.topic === req.topic &&
    !m.is_placeholder &&
    (!req.tier || m.tier === req.tier) &&
    (!req.include || hasAny(m.title, req.include)) &&
    (!req.exclude || !hasAny(m.title, req.exclude)),
  );
}

function hrefFor(req: SpotRequirement): string {
  switch (req.kind) {
    case 'materi':
      return `/materi?${new URLSearchParams({ cat: req.category, topic: req.topic })}`;
    case 'drilling': {
      const qs = new URLSearchParams({ cat: req.category });
      req.topics.forEach(t => qs.append('topic', t));
      return `/drilling?${qs}`;
    }
    case 'tryout':
      return `/daftar-tryout?tier=${req.tier}`;
    case 'instansi':
      return '/peluang-formasi';
    case 'passing_grade':
    case 'score':
      return '/statistics';
  }
}

function kindFor(req: SpotRequirement): PathNode['kind'] {
  switch (req.kind) {
    case 'materi':        return 'reading';
    case 'drilling':      return 'quiz';
    case 'tryout':        return 'tryout';
    case 'score':         return 'trophy';
    default:              return 'target';
  }
}

function countLabel(nodes: PathNode[]): string {
  const count = (k: PathNode['kind']) => nodes.filter(n => n.kind === k).length;
  return [
    [count('reading'), 'Materi'],
    [count('quiz'),    'Drilling'],
    [count('tryout'),  'Tryout'],
    [count('target') + count('trophy'), 'Target'],
  ]
    .filter(([c]) => (c as number) > 0)
    .map(([c, l]) => `${c} ${l}`)
    .join(' · ');
}

export function buildPathSections(
  progress: RoadmapProgress,
  userTier: ContentTier,
): PathSection[] {
  const viewed  = new Set(progress.viewedModuleIds);
  const drilled = new Set(progress.drilledTopics);

  const evaluate = (req: SpotRequirement): { done: boolean; tier: ContentTier } | null => {
    switch (req.kind) {
      case 'materi': {
        const mods = matchModules(req, progress.modules);
        if (mods.length === 0) return null; // konten belum tersedia → spot disembunyikan
        const tier = mods.reduce<ContentTier>(
          (t, m) => (TIER_RANK[m.tier] > TIER_RANK[t] ? m.tier : t), 'free');
        return { done: mods.every(m => viewed.has(m.id)), tier };
      }
      case 'drilling':
        return { done: req.topics.every(t => drilled.has(`${req.category}|${t}`)), tier: 'free' };
      case 'tryout': {
        const n = progress.tryoutsDone.filter(t =>
          TIER_RANK[t.tier] >= TIER_RANK[req.tier] && (!req.hots || t.isHots),
        ).length;
        return { done: n >= req.count, tier: req.tier };
      }
      case 'instansi':
        return { done: progress.hasInstansi, tier: 'free' };
      case 'passing_grade':
        return {
          done: progress.avgTwk >= PASSING_GRADES.TWK
             && progress.avgTiu >= PASSING_GRADES.TIU
             && progress.avgTkp >= PASSING_GRADES.TKP,
          tier: 'free',
        };
      case 'score':
        return { done: progress.bestFinalScore > req.min, tier: 'free' };
    }
  };

  let previousCompleted = true;
  let foundActive = false;

  return SECTIONS.map((section): PathSection => {
    const nodes: PathNode[] = [];

    for (const spot of section.spots) {
      const result = evaluate(spot.req);
      if (!result) continue;

      let status: PhaseStatus;
      if (previousCompleted && result.done) {
        status = 'completed';
      } else {
        previousCompleted = false;
        status = foundActive ? 'locked' : 'active';
        foundActive = true;
      }

      nodes.push({
        id: spot.id,
        label: spot.label,
        tooltip: spot.tooltip,
        kind: kindFor(spot.req),
        href: hrefFor(spot.req),
        status,
        tier: result.tier,
        needsUpgrade: !canAccess(userTier, result.tier),
      });
    }

    return {
      id: section.id,
      title: section.title,
      zone: section.zone,
      countLabel: countLabel(nodes),
      nodes,
    };
  }).filter(s => s.nodes.length > 0);
}
