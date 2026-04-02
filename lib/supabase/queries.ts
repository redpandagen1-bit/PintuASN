// ============================================================
// lib/supabase/queries.ts
// ============================================================

import { createClient } from './server';
import type { Profile, Package, Attempt } from '@/types/database';

// Re-export dari subscription-utils agar kode lain yang sudah
// import dari queries tidak perlu diubah
export type { SubscriptionTier } from '@/lib/subscription-utils';
export { canAccess }              from '@/lib/subscription-utils';

// ─────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles').select('*').eq('user_id', userId).single();
  if (error) throw new Error(`Failed to fetch profile: ${error.message}`);
  return data;
}

/**
 * Ambil hanya subscription_tier user — query ringan
 */
export async function getUserTier(
  userId: string,
): Promise<import('@/lib/subscription-utils').SubscriptionTier> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles').select('subscription_tier').eq('user_id', userId).single();
  return (data?.subscription_tier as import('@/lib/subscription-utils').SubscriptionTier) ?? 'free';
}

// ─────────────────────────────────────────────────────────────
// PACKAGES
// ─────────────────────────────────────────────────────────────

export async function getActivePackages(): Promise<Package[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('packages').select('*')
    .eq('is_active', true).eq('is_deleted', false)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to fetch packages: ${error.message}`);
  return data ?? [];
}

export async function getPackageById(packageId: string): Promise<Package> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('packages').select('*').eq('id', packageId).single();
  if (error) {
    if (error.code === 'PGRST116') throw new Error('Package not found');
    throw new Error(`Failed to fetch package: ${error.message}`);
  }
  return data;
}

// ─────────────────────────────────────────────────────────────
// MATERIALS
// ─────────────────────────────────────────────────────────────

export async function getAllMaterials() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('materials').select('*')
    .eq('is_active', true).eq('is_deleted', false)
    .order('order_index', { ascending: true })
    .order('created_at',  { ascending: false });
  if (error) throw new Error(`Failed to fetch materials: ${error.message}`);
  return data ?? [];
}

// ─────────────────────────────────────────────────────────────
// PACKAGE QUESTIONS
// ─────────────────────────────────────────────────────────────

export async function getPackageQuestions(packageId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('package_questions')
    .select(`
      position,
      questions!inner (
        id, category, content, image_url, explanation, topic, difficulty,
        choices ( id, label, content, is_answer, score )
      )
    `)
    .eq('package_id', packageId)
    .order('position', { ascending: true });

  if (error) throw new Error(`Failed to fetch package questions: ${error.message}`);
  if (!data?.length) throw new Error(`No questions found for package ${packageId}`);

  const questions = data.map((pq: any) => ({
    id:          pq.questions.id,
    category:    pq.questions.category,
    content:     pq.questions.content,
    image_url:   pq.questions.image_url   ?? null,
    explanation: pq.questions.explanation ?? null,
    topic:       pq.questions.topic       ?? null,
    difficulty:  pq.questions.difficulty  ?? 'medium',
    choices:     pq.questions.choices     ?? [],
  }));

  questions.forEach((q: any, i: number) => {
    if (!q.choices || q.choices.length !== 5)
      throw new Error(`Question ${i + 1} (${q.category}) does not have 5 choices`);
  });

  return questions;
}

// ─────────────────────────────────────────────────────────────
// ATTEMPTS
// ─────────────────────────────────────────────────────────────

export async function createAttempt(attempt: Partial<Attempt>): Promise<Attempt> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('attempts').insert(attempt).select().single();
  if (error) throw new Error(`Failed to create attempt: ${error.message}`);
  return data;
}

export async function getAttemptById(attemptId: string) {
  const supabase = await createClient();

  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .select('*, packages ( id, title, difficulty )')
    .eq('id', attemptId).single();

  if (attemptError) {
    throw new Error(
      attemptError.code === 'PGRST116' ? 'Attempt not found' : attemptError.message,
    );
  }
  if (!attempt) throw new Error('Attempt not found');

  const { data: packageQuestions, error: questionsError } = await supabase
    .from('package_questions')
    .select('position, questions ( *, choices ( id, label, content, is_answer, score ) )')
    .eq('package_id', attempt.package_id)
    .order('position');

  if (questionsError) throw new Error(questionsError.message);
  if (!packageQuestions?.length) throw new Error('No questions found for this exam');

  return {
    attempt,
    questions: packageQuestions.map((pq: any) => pq.questions).filter(Boolean),
  };
}

export async function getAttemptWithAnswers(attemptId: string) {
  const supabase = await createClient();
  const [
    { data: attempt, error: attemptError },
    { data: answers, error: answersError },
  ] = await Promise.all([
    supabase.from('attempts').select('*').eq('id', attemptId).single(),
    supabase.from('attempt_answers').select('*').eq('attempt_id', attemptId),
  ]);
  if (attemptError) throw new Error(`Failed to fetch attempt: ${attemptError.message}`);
  if (answersError) throw new Error(`Failed to fetch answers: ${answersError.message}`);
  return { attempt, answers: answers ?? [] };
}

export async function getUserAttempts(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('attempts')
    .select('*, packages ( id, title, description, difficulty )')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });
  if (error) throw new Error(`Failed to fetch attempts: ${error.message}`);
  return data ?? [];
}

export async function getAttemptHistory(
  userId:   string,
  sortBy:   'newest' | 'oldest' | 'highest_score' = 'newest',
  filterBy: 'all' | 'passed' | 'failed' = 'all',
  page:     number = 1,
  limit:    number = 20,
) {
  const supabase = await createClient();

  let query = supabase
    .from('attempts')
    .select('*, packages ( id, title, difficulty )', { count: 'exact' })
    .eq('user_id', userId).eq('status', 'completed');

  if (filterBy === 'passed')
    query = query.gte('score_twk', 65).gte('score_tiu', 80).gte('score_tkp', 166);

  if (sortBy === 'newest')      query = query.order('completed_at', { ascending: false });
  else if (sortBy === 'oldest') query = query.order('completed_at', { ascending: true });
  else                          query = query.order('final_score',   { ascending: false });

  const from = (page - 1) * limit;
  const { data, error, count } = await query.range(from, from + limit - 1);
  if (error) throw new Error(`Failed to fetch attempt history: ${error.message}`);

  let filteredData = data ?? [];
  if (filterBy === 'failed')
    filteredData = filteredData.filter(a =>
      a.score_twk < 65 || a.score_tiu < 80 || a.score_tkp < 166);

  return {
    attempts:    filteredData as (Attempt & { packages: Package })[],
    totalCount:  count ?? 0,
    totalPages:  Math.ceil((count ?? 0) / limit),
    currentPage: page,
  };
}

export async function getUserStats(userId: string) {
  const supabase = await createClient();
  const { data: attempts, error } = await supabase
    .from('attempts').select('*')
    .eq('user_id', userId).eq('status', 'completed')
    .order('completed_at', { ascending: false });
  if (error) throw new Error(`Failed to fetch user stats: ${error.message}`);

  const completed = attempts ?? [];
  const scores    = completed.filter(a => a.final_score != null).map(a => a.final_score!);
  const passed    = completed.filter(a =>
    a.score_twk >= 65 && a.score_tiu >= 80 && a.score_tkp >= 166);

  return {
    totalAttempts:  completed.length,
    averageScore:   scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0,
    bestScore:      scores.length ? Math.max(...scores) : 0,
    passRate:       completed.length ? Math.round((passed.length / completed.length) * 100) : 0,
    recentAttempts: completed.slice(0, 5),
  };
}

export type UserStats = {
  totalAttempts: number; averageScore: number;
  bestScore: number;     passRate: number;
  recentAttempts: Attempt[];
};
export type AttemptHistoryData = {
  attempts: (Attempt & { packages: Package })[];
  totalCount: number; totalPages: number; currentPage: number;
};

// ─────────────────────────────────────────────────────────────
// REVIEW
// ─────────────────────────────────────────────────────────────

export async function getReviewData(attemptId: string) {
  const supabase = await createClient();

  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .select('*, packages ( id, title, description, difficulty )')
    .eq('id', attemptId).eq('status', 'completed').single();

  if (attemptError) throw new Error(`Failed to fetch attempt: ${attemptError.message}`);
  if (!attempt)     throw new Error(`Attempt ${attemptId} not found or not completed`);

  const [
    { data: packageQuestions, error: questionsError },
    { data: userAnswers,      error: answersError   },
  ] = await Promise.all([
    supabase
      .from('package_questions')
      .select(`
        position,
        questions!inner (
          id, category, content, image_url, explanation, topic, difficulty,
          choices ( id, label, content, is_answer, score )
        )
      `)
      .eq('package_id', attempt.package_id)
      .order('position', { ascending: true }),
    supabase.from('attempt_answers').select('*').eq('attempt_id', attemptId),
  ]);

  if (questionsError) throw new Error(`Failed to fetch questions: ${questionsError.message}`);
  if (answersError)   throw new Error(`Failed to fetch answers: ${answersError.message}`);

  const questions = (packageQuestions ?? []).map((pq: any, index: number) => {
    const question    = pq.questions;
    const userAnswer  = (userAnswers ?? []).find((a: any) => a.question_id === question.id);
    const correctChoice = question.choices.find((c: any) => c.is_answer);
    const userChoice    = question.choices.find((c: any) => c.id === userAnswer?.choice_id);
    const isCorrect     = question.category !== 'TKP'
      ? (userAnswer?.choice_id === correctChoice?.id) ?? false : null;
    const score = question.category === 'TKP' && userChoice ? userChoice.score ?? 1 : null;

    return {
      position: index + 1, id: question.id, category: question.category,
      content: question.content, image_url: question.image_url ?? null,
      explanation: question.explanation ?? null, topic: question.topic ?? null,
      difficulty: question.difficulty ?? 'medium', choices: question.choices ?? [],
      userAnswer: userAnswer ?? null, isCorrect, score,
      userChoice: userChoice ?? null, correctChoice: correctChoice ?? null,
      isFlagged: userAnswer?.is_flagged ?? false,
    };
  });

  return { attempt, questions };
}

// ─────────────────────────────────────────────────────────────
// ADMIN — QUESTIONS
// ─────────────────────────────────────────────────────────────

export async function getQuestionsAdmin(params?: {
  category?: 'TWK' | 'TIU' | 'TKP' | 'all'; difficulty?: 'easy' | 'medium' | 'hard' | 'all';
  status?: 'draft' | 'published' | 'all'; search?: string; page?: number; limit?: number;
}) {
  const supabase = await createClient();
  let query = supabase.from('questions')
    .select('*, choices (*)', { count: 'exact' }).eq('is_deleted', false);

  if (params?.category   && params.category   !== 'all') query = query.eq('category',   params.category);
  if (params?.difficulty && params.difficulty !== 'all') query = query.eq('difficulty', params.difficulty);
  if (params?.status     && params.status     !== 'all') query = query.eq('status',     params.status);
  if (params?.search) query = query.ilike('content', `%${params.search}%`);

  const page = params?.page ?? 1; const limit = params?.limit ?? 50;
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (error) throw error;

  return {
    questions:   data ?? [],
    totalCount:  count ?? 0,
    totalPages:  Math.ceil((count ?? 0) / limit),
    currentPage: page,
  };
}

export async function getQuestionById(questionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('questions').select('*, choices (*)').eq('id', questionId).single();
  if (error) throw error;
  return data;
}

export async function updateQuestion(questionId: string, updates: {
  content?: string; explanation?: string; topic?: string;
  difficulty?: string; image_url?: string; status?: string; is_published?: boolean;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('questions').update(updates).eq('id', questionId).select().single();
  if (error) throw error;
  return data;
}

export async function updateChoice(choiceId: string, updates: {
  content?: string; is_answer?: boolean; score?: number;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('choices').update(updates).eq('id', choiceId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteQuestion(questionId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('questions')
    .update({ is_deleted: true, is_published: false, status: 'deleted' })
    .eq('id', questionId);
  if (error) throw error;
}

export async function togglePublishQuestion(questionId: string, publish: boolean) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('questions')
    .update({ is_published: publish, status: publish ? 'published' : 'draft' })
    .eq('id', questionId).select().single();
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────
// ADMIN — PACKAGES
// ─────────────────────────────────────────────────────────────

export async function getPackagesAdmin(includeInactive = false) {
  const supabase = await createClient();
  let query = supabase.from('packages')
    .select('*, package_questions (count)')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });
  if (!includeInactive) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((pkg: any) => ({
    ...pkg,
    question_count: pkg.package_questions[0]?.count ?? 0,
  }));
}

export async function getPublishedQuestionsByCategory(category: 'TWK' | 'TIU' | 'TKP') {
  const supabase = await createClient();
  const { data, error } = await supabase.from('questions')
    .select('id, content, difficulty, topic')
    .eq('category', category).eq('is_published', true).eq('is_deleted', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createPackage(packageData: {
  title: string; description?: string; difficulty: 'easy' | 'medium' | 'hard';
  tier: 'free' | 'premium' | 'platinum'; is_active: boolean;
  questionIds: string[]; userId: string;
}) {
  const supabase = await createClient();
  if (packageData.questionIds.length !== 110)
    throw new Error('Paket harus berisi tepat 110 soal');

  const { data: pkg, error: pkgError } = await supabase.from('packages')
    .insert({
      title: packageData.title, description: packageData.description,
      difficulty: packageData.difficulty, tier: packageData.tier,
      duration_minutes: 100, is_active: packageData.is_active, created_by: packageData.userId,
    }).select().single();
  if (pkgError) throw pkgError;

  const { error: pqError } = await supabase.from('package_questions')
    .insert(packageData.questionIds.map((qid, i) => ({
      package_id: pkg.id, question_id: qid, position: i + 1,
    })));
  if (pqError) {
    await supabase.from('packages').delete().eq('id', pkg.id);
    throw pqError;
  }
  return pkg;
}

export async function updatePackageInfo(packageId: string, updates: {
  title?: string; description?: string; difficulty?: string; tier?: string; is_active?: boolean;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('packages').update(updates).eq('id', packageId).select().single();
  if (error) throw error;
  return data;
}

export async function deletePackage(packageId: string) {
  const supabase = await createClient();
  const { data: attempts } = await supabase
    .from('attempts').select('id').eq('package_id', packageId).limit(1);
  if (attempts?.length) throw new Error('Paket tidak bisa dihapus karena sudah ada percobaan');
  const { error } = await supabase.from('packages')
    .update({ is_deleted: true, is_active: false }).eq('id', packageId);
  if (error) throw error;
}

export async function getPackageWithQuestions(packageId: string) {
  const supabase = await createClient();
  const [
    { data: pkg,       error: pkgError },
    { data: questions, error: qError   },
  ] = await Promise.all([
    supabase.from('packages').select('*').eq('id', packageId).single(),
    supabase.from('package_questions')
      .select('position, questions!inner ( id, category, content, difficulty, topic )')
      .eq('package_id', packageId).order('position'),
  ]);
  if (pkgError) throw pkgError;
  if (qError)   throw qError;
  return {
    package:   pkg,
    questions: (questions ?? []).map((pq: any) => ({ position: pq.position, ...pq.questions })),
  };
}