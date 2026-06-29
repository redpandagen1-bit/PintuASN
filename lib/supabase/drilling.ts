// ============================================================
// lib/supabase/drilling.ts — query khusus fitur Drilling
// ============================================================

import { createAdminClient } from './server';
import {
  DRILLING_TOPICS,
  DRILLING_ALL_TOPICS,
  DRILLING_CATEGORIES,
  masteryLevel,
  type DrillingCategory,
  type DrillingCategoryStats,
  type DrillingTopicStat,
  type TopicMastery,
  type TopicMasteryByCategory,
} from '@/constants/drilling';

/**
 * Statistik per topik baku untuk konfigurator drilling:
 * total soal tersedia & berapa yang sudah pernah dikerjakan user.
 * Hanya topik yang ada di taksonomi baku per kategori yang dikembalikan.
 */
export async function getDrillingTopicStats(userId: string): Promise<DrillingCategoryStats> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase.rpc('drilling_topic_stats', {
    p_user_id: userId,
    p_topics: DRILLING_ALL_TOPICS,
  });
  if (error) throw new Error(`Failed to fetch drilling stats: ${error.message}`);

  // Index by category+topic untuk lookup cepat
  const byKey = new Map<string, { total: number; done: number }>();
  for (const row of (data ?? []) as { category: string; topic: string; total: number; done: number }[]) {
    byKey.set(`${row.category}|${row.topic}`, {
      total: Number(row.total) || 0,
      done: Number(row.done) || 0,
    });
  }

  const result = {} as DrillingCategoryStats;
  for (const cat of DRILLING_CATEGORIES) {
    result[cat] = DRILLING_TOPICS[cat].map<DrillingTopicStat>((topic) => {
      const hit = byKey.get(`${cat}|${topic}`) ?? { total: 0, done: 0 };
      return {
        topic,
        total: hit.total,
        done: hit.done,
        remaining: Math.max(0, hit.total - hit.done),
      };
    });
  }
  return result;
}

/**
 * Pilih ID soal untuk sesi drilling lintas kategori.
 * pairs = daftar { category, topic }. Prioritas soal belum dikerjakan, acak.
 */
export async function pickDrillingQuestions(
  userId: string,
  pairs: { category: DrillingCategory; topic: string }[],
  count: number,
): Promise<string[]> {
  const supabase = await createAdminClient();
  const p_pairs = pairs.map((p) => `${p.category}|${p.topic}`);
  const { data, error } = await supabase.rpc('drilling_pick_questions_multi', {
    p_user_id: userId,
    p_pairs,
    p_count: count,
  });
  if (error) throw new Error(`Failed to pick drilling questions: ${error.message}`);
  return ((data ?? []) as { id: string }[]).map((r) => r.id);
}

/**
 * Penguasaan per topik baku untuk halaman Statistik.
 * Hanya topik di taksonomi drilling yang dikembalikan (per kategori).
 */
export async function getTopicMastery(userId: string): Promise<TopicMasteryByCategory> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.rpc('topic_mastery', { p_user_id: userId });
  if (error) throw new Error(`Failed to fetch topic mastery: ${error.message}`);

  const byKey = new Map<string, { answered: number; correct: number; scoreSum: number }>();
  for (const row of (data ?? []) as { category: string; topic: string; answered: number; correct: number; score_sum: number }[]) {
    byKey.set(`${row.category}|${row.topic}`, {
      answered: Number(row.answered) || 0,
      correct: Number(row.correct) || 0,
      scoreSum: Number(row.score_sum) || 0,
    });
  }

  const result = {} as TopicMasteryByCategory;
  for (const cat of DRILLING_CATEGORIES) {
    const isTKP = cat === 'TKP';
    result[cat] = DRILLING_TOPICS[cat].map<TopicMastery>((topic) => {
      const hit = byKey.get(`${cat}|${topic}`) ?? { answered: 0, correct: 0, scoreSum: 0 };
      const pct =
        hit.answered === 0
          ? 0
          : isTKP
            ? Math.round((hit.scoreSum / (hit.answered * 5)) * 100)
            : Math.round((hit.correct / hit.answered) * 100);
      return {
        category: cat,
        topic,
        answered: hit.answered,
        isTKP,
        masteryPct: pct,
        level: masteryLevel(hit.answered, pct),
      };
    });
  }
  return result;
}
