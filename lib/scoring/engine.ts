import { createAdminClient } from '@/lib/supabase/server';
import type { CategoryScores } from '@/types/exam';

export async function calculateAttemptScore(attemptId: string): Promise<CategoryScores> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.rpc('calculate_attempt_score', { attempt_uuid: attemptId });

  if (error) throw error;
  // RPC calculate_attempt_score mengembalikan TABLE (array baris), jadi ambil
  // baris pertama — sama seperti kontrak yang dipakai di /api/exam/submit.
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('No data returned from calculate_attempt_score');

  return {
    twk: row.twk_score,
    tiu: row.tiu_score,
    tkp: row.tkp_score,
    total: row.total_score,
  };
}

export function determinePassStatus(scores: CategoryScores): boolean {
  return scores.twk >= 65 && scores.tiu >= 80 && scores.tkp >= 166;
}

export function formatScore(score: number, maxScore: number): string {
  return `${score}/${maxScore}`;
}
