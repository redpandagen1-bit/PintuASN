// Pure functions untuk analisis hasil exam — dapat digunakan di server maupun client

interface AnswerData {
  id: string;
  answered_at: string;
  time_spent_seconds: number | null;
  choice_id?: string | null;
  is_correct?: boolean | null;
  tkp_score?: number | null;
  questions: { id: string; content: string | null; category: string } | null;
}

export interface SlowestQuestion {
  num: number;
  category: string;
  content: string;
  time: number;
}

export interface WrongAnalysis {
  byCategory: { TWK: number; TIU: number; TKP: number };
  totalWrong: number;
  totalLowTkp: number;
  topWrong: Array<{
    num: number;
    category: string;
    content: string;
    is_correct: boolean | null | undefined;
    tkp_score: number | null | undefined;
  }>;
}

/**
 * Hitung 5 soal dengan waktu pengerjaan terlama.
 */
export function getSlowestQuestions(
  answers: AnswerData[],
  startedAt: string,
): SlowestQuestion[] {
  const withTime = answers.map((a, i) => {
    let t = a.time_spent_seconds || 0;
    if (t === 0 && a.answered_at) {
      const prev = i > 0
        ? new Date(answers[i - 1].answered_at).getTime()
        : new Date(startedAt).getTime();
      t = Math.round((new Date(a.answered_at).getTime() - prev) / 1000);
    }
    return {
      num: i + 1,
      category: a.questions?.category || '-',
      content: a.questions?.content || '',
      time: Math.min(t, 600),
    };
  });
  return [...withTime].sort((a, b) => b.time - a.time).slice(0, 5);
}

/**
 * Analisis soal yang dijawab salah atau memiliki skor TKP rendah.
 */
export function getWrongAnalysis(answers: AnswerData[]): WrongAnalysis {
  const wrongList = answers
    .map((a, i) => ({
      num: i + 1,
      category: a.questions?.category || '-',
      content: a.questions?.content || '',
      is_correct: a.is_correct,
      tkp_score: a.tkp_score,
    }))
    .filter(a => a.category === 'TKP' ? (a.tkp_score ?? 5) < 3 : a.is_correct === false);

  const byCategory = {
    TWK: wrongList.filter(a => a.category === 'TWK').length,
    TIU: wrongList.filter(a => a.category === 'TIU').length,
    TKP: wrongList.filter(a => a.category === 'TKP').length,
  };

  return {
    byCategory,
    totalWrong: wrongList.filter(a => a.category !== 'TKP').length,
    totalLowTkp: byCategory.TKP,
    topWrong: wrongList.slice(0, 8),
  };
}

/**
 * Hitung persentil user dibandingkan seluruh peserta.
 * Semakin tinggi persentil, semakin baik posisi user.
 */
export function calcPercentile(rank: number, totalParticipants: number): number {
  if (totalParticipants <= 0) return 0;
  return Math.round(((totalParticipants - rank) / totalParticipants) * 100);
}
