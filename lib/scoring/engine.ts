import { createClient } from '@/lib/supabase/server';
import type { CategoryScores } from '@/types/exam';

export async function calculateAttemptScore(attemptId: string): Promise<CategoryScores> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('calculate_attempt_score', { attempt_uuid: attemptId });
  
  if (error) throw error;
  if (!data) throw new Error('No data returned from calculate_attempt_score');
  
  return {
    twk: data.twk_score,
    tiu: data.tiu_score,
    tkp: data.tkp_score,
    total: data.total_score,
  };
}

export function determinePassStatus(scores: CategoryScores): boolean {
  return scores.twk >= 65 && scores.tiu >= 80 && scores.tkp >= 166;
}

export function formatScore(score: number, maxScore: number): string {
  return `${score}/${maxScore}`;
}
