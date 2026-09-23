// ============================================================
// lib/supabase/roadmap-progress.ts
// Progres mentah user untuk Peta Perjalanan (roadmap spot-per-spot).
// ============================================================

import { createAdminClient } from '@/lib/supabase/server';
import type { ContentTier, RoadmapProgress } from '@/types/roadmap';

const PAGE_SIZE = 1000; // batas baris default PostgREST
const ID_BATCH  = 100;

export async function getRoadmapProgress(userId: string): Promise<RoadmapProgress> {
  const supabase = await createAdminClient();

  const [modulesRes, viewsRes, tryoutsRes, drillingRes, profileRes] = await Promise.all([
    supabase
      .from('material_modules')
      .select('id, category, topic, title, tier, is_placeholder')
      .eq('is_active', true)
      .eq('is_deleted', false),
    supabase.from('material_module_views').select('module_id').eq('user_id', userId),
    supabase
      .from('attempts')
      .select('package_id, score_twk, score_tiu, score_tkp, final_score, packages ( tier, is_hots )')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .eq('kind', 'tryout'),
    supabase
      .from('attempts')
      .select('package_id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .eq('kind', 'drilling'),
    supabase.from('profiles').select('target_institution').eq('user_id', userId).maybeSingle(),
  ]);

  for (const [name, res] of [
    ['modules', modulesRes], ['module views', viewsRes], ['tryouts', tryoutsRes], ['drilling', drillingRes],
  ] as const) {
    if (res.error) throw new Error(`Failed to fetch roadmap ${name}: ${res.error.message}`);
  }

  // ── Tryout: skor rata-rata + paket unik yang diselesaikan ──
  type TryoutRow = {
    package_id: string;
    score_twk: number | null;
    score_tiu: number | null;
    score_tkp: number | null;
    final_score: number | null;
    packages: { tier: string | null; is_hots: boolean | null } | { tier: string | null; is_hots: boolean | null }[] | null;
  };
  const tryouts = (tryoutsRes.data ?? []) as unknown as TryoutRow[];

  const n = tryouts.length;
  const avg = (pick: (r: TryoutRow) => number | null) =>
    n === 0 ? 0 : Math.round(tryouts.reduce((s, r) => s + (pick(r) ?? 0), 0) / n);

  const donePackages = new Map<string, { tier: ContentTier; isHots: boolean }>();
  for (const r of tryouts) {
    const pkg = Array.isArray(r.packages) ? r.packages[0] : r.packages;
    donePackages.set(r.package_id, {
      tier: (pkg?.tier as ContentTier) ?? 'free',
      isHots: !!pkg?.is_hots,
    });
  }

  // ── Drilling: topik yang tercakup di sesi yang sudah selesai ──
  const drillPackageIds = Array.from(new Set((drillingRes.data ?? []).map(r => r.package_id as string)));
  const drilledTopics = new Set<string>();

  // ID dikirim di query string → dibatch agar URL tidak kepanjangan
  // untuk user dengan ratusan sesi drilling.
  for (let i = 0; i < drillPackageIds.length; i += ID_BATCH) {
    const batch = drillPackageIds.slice(i, i + ID_BATCH);
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from('package_questions')
        .select('questions!inner ( category, topic )')
        .in('package_id', batch)
        .order('package_id')
        .order('position')
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw new Error(`Failed to fetch drilling topics: ${error.message}`);

      for (const row of (data ?? []) as unknown as { questions: { category: string; topic: string | null } | { category: string; topic: string | null }[] }[]) {
        const q = Array.isArray(row.questions) ? row.questions[0] : row.questions;
        if (q?.topic) drilledTopics.add(`${q.category}|${q.topic.trim()}`);
      }
      if (!data || data.length < PAGE_SIZE) break;
    }
  }

  return {
    modules: ((modulesRes.data ?? []) as RoadmapProgress['modules']).map(m => ({
      ...m,
      tier: (m.tier ?? 'free') as ContentTier,
      is_placeholder: !!m.is_placeholder,
    })),
    viewedModuleIds: (viewsRes.data ?? []).map(v => v.module_id as string),
    drilledTopics: Array.from(drilledTopics),
    tryoutsDone: Array.from(donePackages.values()),
    avgTwk: avg(r => r.score_twk),
    avgTiu: avg(r => r.score_tiu),
    avgTkp: avg(r => r.score_tkp),
    bestFinalScore: n === 0 ? 0 : Math.max(...tryouts.map(r => r.final_score ?? 0)),
    hasInstansi: !!profileRes.data?.target_institution?.trim(),
  };
}
