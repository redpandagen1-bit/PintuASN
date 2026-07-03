// ============================================================
// lib/roadmap-insights.ts
//
// Helper murni (tanpa I/O) untuk fitur roadmap:
//  - Streak belajar harian dari riwayat tryout
//  - Countdown + target mingguan menuju hari ujian
//  - Ringkasan pencapaian tertinggi (untuk kartu share)
// Dipakai bersama oleh versi desktop & mobile roadmap.
// ============================================================

import { PASSING_GRADES, weakestCategory } from '@/constants/roadmap-data';
import type { RoadmapPageData } from '@/types/roadmap';

const DAY_MS = 86_400_000;

function dayStart(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

// ── Streak harian ─────────────────────────────────────────────

export interface StreakInfo {
  current: number;      // streak berjalan (hari beruntun)
  longest: number;      // rekor streak terpanjang
  studiedToday: boolean;
}

export function computeStreak(history: string[]): StreakInfo {
  if (!history || history.length === 0) {
    return { current: 0, longest: 0, studiedToday: false };
  }

  const days = Array.from(new Set(history.map((h) => dayStart(new Date(h)))))
    .sort((a, b) => a - b);

  // Streak terpanjang
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = days[i] - days[i - 1];
    if (diff === DAY_MS) {
      run += 1;
      longest = Math.max(longest, run);
    } else if (diff !== 0) {
      run = 1;
    }
  }

  // Streak berjalan: hitung mundur dari hari ini (toleransi: kemarin masih lanjut)
  const set = new Set(days);
  const today = dayStart(new Date());
  const studiedToday = set.has(today);

  let current = 0;
  let cursor = studiedToday ? today : today - DAY_MS;
  while (set.has(cursor)) {
    current += 1;
    cursor -= DAY_MS;
  }

  return { current, longest, studiedToday };
}

// ── Countdown + target mingguan ───────────────────────────────

export interface ExamPlan {
  daysLeft: number | null;
  weeksLeft: number | null;
  focus: 'TWK' | 'TIU' | 'TKP' | null;   // kategori yang perlu diprioritaskan
  allPassed: boolean;
  headline: string;   // ringkasan urgensi
  weeklyTarget: string; // saran konkret minggu ini
}

export function computeExamPlan(
  examDate: Date | null,
  data: RoadmapPageData,
): ExamPlan {
  const allPassed =
    data.avgTwk >= PASSING_GRADES.TWK &&
    data.avgTiu >= PASSING_GRADES.TIU &&
    data.avgTkp >= PASSING_GRADES.TKP;

  const focus = allPassed ? null : weakestCategory(data);

  let daysLeft: number | null = null;
  let weeksLeft: number | null = null;
  if (examDate) {
    const today = dayStart(new Date());
    daysLeft = Math.max(0, Math.round((dayStart(examDate) - today) / DAY_MS));
    weeksLeft = Math.max(1, Math.ceil(daysLeft / 7));
  }

  // Target tryout per minggu (semakin dekat ujian, semakin intens; dibatasi 3-6).
  const tryoutPerWeek = weeksLeft == null
    ? 3
    : Math.min(6, Math.max(3, Math.ceil((20 - data.totalCompleted) / weeksLeft)));

  const headline = daysLeft == null
    ? 'Tetapkan tanggal ujianmu untuk mengaktifkan target harian.'
    : daysLeft === 0
      ? 'Hari ujian telah tiba. Semoga sukses!'
      : `${daysLeft} hari lagi menuju ujianmu. Manfaatkan setiap harinya.`;

  const weeklyTarget = daysLeft == null
    ? (focus
        ? `Prioritaskan ${focus} — nilaimu masih di bawah passing grade.`
        : 'Pertahankan konsistensi latihan setiap minggu.')
    : focus
      ? `Minggu ini: ${tryoutPerWeek} tryout + fokus perkuat ${focus}.`
      : `Minggu ini: ${tryoutPerWeek} tryout untuk jaga performa & kecepatan.`;

  return { daysLeft, weeksLeft, focus, allPassed, headline, weeklyTarget };
}

// ── Pencapaian tertinggi (untuk kartu share) ──────────────────

export interface Achievement {
  emoji: string;
  title: string;
  subtitle: string;
  shareText: string;
}

export function topAchievement(
  data: RoadmapPageData,
  progressPct: number,
  nationalPercentile?: number | null,
): Achievement {
  const best = data.bestFinalScore;
  const allPassed =
    data.avgTwk >= PASSING_GRADES.TWK &&
    data.avgTiu >= PASSING_GRADES.TIU &&
    data.avgTkp >= PASSING_GRADES.TKP;

  const rankLine = nationalPercentile != null
    ? ` Aku mengungguli ${nationalPercentile}% peserta lain di PintuASN.`
    : '';

  if (best > 500) {
    return {
      emoji: '🥇',
      title: 'Prestasi Gold',
      subtitle: `Skor terbaik ${best} — level tertinggi!`,
      shareText: `🥇 Aku meraih Prestasi Gold di PintuASN dengan skor terbaik ${best} untuk SKD CPNS 2026!${rankLine} Yuk ikut latihan: https://pintuasn.com`,
    };
  }
  if (best > 475) {
    return {
      emoji: '🥈',
      title: 'Prestasi Silver',
      subtitle: `Skor terbaik ${best} — level kompetitif!`,
      shareText: `🥈 Aku meraih Prestasi Silver di PintuASN dengan skor terbaik ${best} untuk SKD CPNS 2026!${rankLine} Yuk ikut latihan: https://pintuasn.com`,
    };
  }
  if (allPassed) {
    return {
      emoji: '✅',
      title: 'Lolos Passing Grade',
      subtitle: `Rata-rata melampaui ambang batas BKN.`,
      shareText: `✅ Rata-rata skorku sudah lolos passing grade SKD CPNS 2026 di PintuASN!${rankLine} Yuk latihan bareng: https://pintuasn.com`,
    };
  }
  return {
    emoji: '🚀',
    title: `${progressPct}% Roadmap`,
    subtitle: `${data.totalCompleted} tryout diselesaikan. Terus melaju!`,
    shareText: `🚀 Progres persiapan SKD CPNS 2026-ku sudah ${progressPct}% di PintuASN (${data.totalCompleted} tryout)! Yuk ikut latihan: https://pintuasn.com`,
  };
}
