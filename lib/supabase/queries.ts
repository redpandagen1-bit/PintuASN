import { createClient } from './server';
import type { Profile, Package, Attempt } from '@/types/database';

export async function getProfile(userId: string): Promise<Profile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('getProfile error:', error);
    throw new Error(`Failed to fetch profile: ${error.message || 'Unknown error'}`);
  }
  return data;
}

export async function getActivePackages(): Promise<Package[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('is_active', true)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('getActivePackages error:', error);
    if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to connect to database');
    }
    throw new Error(`Failed to fetch packages: ${error.message || 'Unknown error'}`);
  }
  return data;
}

export async function getPackageById(packageId: string): Promise<Package> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('id', packageId)
    .single();
  
  if (error) {
    console.error('getPackageById error:', error);
    if (error.code === 'PGRST116') {
      throw new Error('Package not found');
    }
    if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to connect to database');
    }
    throw new Error(`Failed to fetch package: ${error.message || 'Unknown error'}`);
  }
  return data;
}

export async function getPackageQuestions(packageId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('package_questions')
    .select(`
      position,
      questions!inner (
        id,
        category,
        content,
        image_url,
        explanation,
        topic,
        difficulty,
        choices (
          id,
          label,
          content,
          is_answer,
          score
        )
      )
    `)
    .eq('package_id', packageId)
    .order('position', { ascending: true });
  
  if (error) {
    console.error('getPackageQuestions error:', error);
    throw new Error(`Failed to fetch package questions: ${error.message}`);
  }
  
  if (!data || data.length === 0) {
    throw new Error(`No questions found for package ${packageId}`);
  }
  
  // Transform to flat QuestionWithChoices[] structure
  const questions = data.map((pq: any) => ({
    id: pq.questions.id,
    category: pq.questions.category,
    content: pq.questions.content,
    image_url: pq.questions.image_url || null,
    explanation: pq.questions.explanation || null,
    topic: pq.questions.topic || null,
    difficulty: pq.questions.difficulty || 'medium',
    choices: pq.questions.choices || []
  }));
  
  // Validate: Each question must have exactly 5 choices
  questions.forEach((q: any, index: number) => {
    if (!q.choices || q.choices.length !== 5) {
      console.error(`Question ${index + 1} validation failed:`, q);
      throw new Error(`Question ${index + 1} (${q.category}) does not have 5 choices`);
    }
  });
  
  console.log(`✓ Loaded ${questions.length} questions for package ${packageId}`);
  return questions;
}

export async function createAttempt(attempt: Partial<Attempt>): Promise<Attempt> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('attempts')
    .insert(attempt)
    .select()
    .single();
  
  if (error) {
    console.error('createAttempt error:', error);
    if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to connect to database');
    }
    throw new Error(`Failed to create attempt: ${error.message || 'Unknown error'}`);
  }
  return data;
}

export async function getAttemptById(attemptId: string) {
  const supabase = await createClient();
  
  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .select(`
      *,
      packages (
        id,
        title,
        difficulty
      )
    `)
    .eq('id', attemptId)
    .single();

  if (attemptError) {
    console.error('getAttemptById - attempt error:', {
      message: attemptError.message,
      code: attemptError.code,
      details: attemptError.details,
      hint: attemptError.hint
    });
    
    const errorMessage = attemptError.code === 'PGRST116' 
      ? 'Attempt not found'
      : attemptError.message || 'Database error occurred';
    
    throw new Error(errorMessage);
  }

  if (!attempt) {
    throw new Error('Attempt not found');
  }

  // ✅ FIX: Fetch questions melalui junction table package_questions
  const { data: packageQuestions, error: questionsError } = await supabase
    .from('package_questions')
    .select(`
      position,
      questions (
        *,
        choices (
          id,
          label,
          content,
          is_answer,
          score
        )
      )
    `)
    .eq('package_id', attempt.package_id)
    .order('position');

  if (questionsError) {
    console.error('getAttemptById - questions error:', questionsError);
    
    const errorMessage = questionsError.message?.includes('fetch')
      ? 'Network error: Unable to connect to database'
      : questionsError.message || 'Failed to load questions';
    
    throw new Error(errorMessage);
  }

  if (!packageQuestions || packageQuestions.length === 0) {
    throw new Error('No questions found for this exam');
  }

  // ✅ Extract questions from the nested structure and sort by position
  const questions = packageQuestions
    .map(pq => pq.questions)
    .filter(q => q !== null);

  return { attempt, questions };
}

export async function getAttemptWithAnswers(attemptId: string) {
  const supabase = await createClient();
  
  // Fetch attempt
  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .select('*')
    .eq('id', attemptId)
    .single();
  
  if (attemptError) {
    console.error('getAttemptWithAnswers - attempt error:', attemptError);
    throw new Error(`Failed to fetch attempt: ${attemptError.message}`);
  }
  
  // Fetch answers separately
  const { data: answers, error: answersError } = await supabase
    .from('attempt_answers')
    .select('*')
    .eq('attempt_id', attemptId);
  
  if (answersError) {
    console.error('getAttemptWithAnswers - answers error:', answersError);
    throw new Error(`Failed to fetch answers: ${answersError.message}`);
  }
  
  console.log(`✓ Loaded attempt ${attemptId} with ${answers?.length || 0} answers`);
  
  // Return format matching page.tsx destructuring
  return {
    attempt,
    answers: answers || []
  };
}

export async function getUserAttempts(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('attempts')
    .select(`
      *,
      packages (
        id,
        title,
        description,
        difficulty
      )
    `)
    .eq('user_id', userId)
    .order('started_at', { ascending: false });
  
  if (error) {
    console.error('❌ getUserAttempts error:', error);
    throw new Error(`Failed to fetch attempts: ${error.message || 'Database error'}`);
  }
  
  console.log('✅ Fetched attempts:', data?.length || 0);
  return data || [];
}

export async function getAttemptHistory(
  userId: string, 
  sortBy: 'newest' | 'oldest' | 'highest_score' = 'newest',
  filterBy: 'all' | 'passed' | 'failed' = 'all',
  page: number = 1,
  limit: number = 20
) {
  const supabase = await createClient();
  
  // Build query
  let query = supabase
    .from('attempts')
    .select(`
      *,
      packages (
        id,
        title,
        difficulty
      )
    `, { count: 'exact' })
    .eq('user_id', userId)
    .eq('status', 'completed');

  // Apply filter
  if (filterBy === 'passed') {
    query = query
      .gte('score_twk', 65)
      .gte('score_tiu', 80)
      .gte('score_tkp', 166);
  }

  // Apply sorting
  if (sortBy === 'newest') {
    query = query.order('completed_at', { ascending: false });
  } else if (sortBy === 'oldest') {
    query = query.order('completed_at', { ascending: true });
  } else if (sortBy === 'highest_score') {
    query = query.order('final_score', { ascending: false });
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error('getAttemptHistory error:', error);
    throw new Error(`Failed to fetch attempt history: ${error.message || 'Database error'}`);
  }

  // Post-filter for 'failed'
  let filteredData = data || [];
  if (filterBy === 'failed') {
    filteredData = filteredData.filter(attempt => 
      attempt.score_twk < 65 || 
      attempt.score_tiu < 80 || 
      attempt.score_tkp < 166
    );
  }

  return {
    attempts: filteredData as (Attempt & { packages: Package })[],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page,
  };
}

export async function getUserStats(userId: string) {
  const supabase = await createClient();
  
  const { data: attempts, error } = await supabase
    .from('attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });
  
  if (error) {
    console.error('getUserStats error:', error);
    throw new Error(`Failed to fetch user stats: ${error.message || 'Database error'}`);
  }
  
  const completedAttempts = attempts || [];
  const totalAttempts = completedAttempts.length;
  
  // Calculate statistics
  const scores = completedAttempts
    .filter(a => a.final_score !== null)
    .map(a => a.final_score!);
  
  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;
  
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  
  // Calculate pass rate
  const passedAttempts = completedAttempts.filter(attempt => 
    attempt.score_twk >= 65 && 
    attempt.score_tiu >= 80 && 
    attempt.score_tkp >= 166
  ).length;
  
  const passRate = totalAttempts > 0 
    ? Math.round((passedAttempts / totalAttempts) * 100) 
    : 0;
  
  return {
    totalAttempts,
    averageScore,
    bestScore,
    passRate,
    recentAttempts: completedAttempts.slice(0, 5),
  };
}

export type UserStats = {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  passRate: number;
  recentAttempts: Attempt[];
};

export type AttemptHistoryData = {
  attempts: (Attempt & { packages: Package })[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

export async function getReviewData(attemptId: string) {
  const supabase = await createClient();
  
  // Get attempt details
  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .select(`
      *,
      packages (
        id, 
        title, 
        description, 
        difficulty
      )
    `)
    .eq('id', attemptId)
    .eq('status', 'completed')
    .single();
  
  if (attemptError) {
    throw new Error(`Failed to fetch attempt: ${attemptError.message}`);
  }
  
  if (!attempt) {
    throw new Error(`Attempt ${attemptId} not found or not completed`);
  }
  
  // Get package questions with choices
  const { data: packageQuestions, error: questionsError } = await supabase
    .from('package_questions')
    .select(`
      position,
      questions!inner (
        id,
        category,
        content,
        image_url,
        explanation,
        topic,
        difficulty,
        choices (
          id,
          label,
          content,
          is_answer,
          score
        )
      )
    `)
    .eq('package_id', attempt.package_id)
    .order('position', { ascending: true });
  
  if (questionsError) {
    throw new Error(`Failed to fetch questions: ${questionsError.message}`);
  }
  
  // Get user answers
  const { data: userAnswers, error: answersError } = await supabase
    .from('attempt_answers')
    .select('*')
    .eq('attempt_id', attemptId);
  
  if (answersError) {
    throw new Error(`Failed to fetch answers: ${answersError.message}`);
  }
  
  // Transform data to structured format
  const questions = packageQuestions.map((pq, index: number) => {
    const question = pq.questions;
    const userAnswer = userAnswers.find((answer) => answer.question_id === question.id);
    
    // Find correct answer for TWK/TIU questions
    const correctChoice = question.choices.find((choice) => choice.is_answer);
    const userChoice = question.choices.find((choice) => choice.id === userAnswer?.choice_id);
    
    // Determine if answer is correct
    const isCorrect = question.category !== 'TKP' 
      ? userAnswer?.choice_id === correctChoice?.id 
      : null;
    
    // Calculate score for TKP questions
    const score = question.category === 'TKP' && userChoice 
      ? userChoice.score || 1 
      : null;
    
    return {
      position: index + 1,
      id: question.id,
      category: question.category,
      content: question.content,
      image_url: question.image_url || null,
      explanation: question.explanation || null,
      topic: question.topic || null,
      difficulty: question.difficulty || 'medium',
      choices: question.choices || [],
      userAnswer: userAnswer || null,
      isCorrect,
      score,
      userChoice,
      correctChoice,
      isFlagged: userAnswer?.is_flagged || false
    };
  });
  
  return {
    attempt,
    questions
  };
}

// ============================================
// ADMIN QUESTION MANAGEMENT FUNCTIONS
// ============================================

export async function getQuestionsAdmin(params?: {
  category?: 'TWK' | 'TIU' | 'TKP' | 'all';
  difficulty?: 'easy' | 'medium' | 'hard' | 'all';
  status?: 'draft' | 'published' | 'all';
  search?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createClient();
  
  let query = supabase
    .from('questions')
    .select(`
      *,
      choices (*)
    `, { count: 'exact' })
    .eq('is_deleted', false);

  // Filters
  if (params?.category && params.category !== 'all') {
    query = query.eq('category', params.category);
  }
  if (params?.difficulty && params.difficulty !== 'all') {
    query = query.eq('difficulty', params.difficulty);
  }
  if (params?.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }
  if (params?.search) {
    query = query.ilike('content', `%${params.search}%`);
  }

  // Pagination
  const page = params?.page || 1;
  const limit = params?.limit || 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    questions: data || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page,
  };
}

export async function getQuestionById(questionId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      choices (*)
    `)
    .eq('id', questionId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateQuestion(
  questionId: string,
  updates: {
    content?: string;
    explanation?: string;
    topic?: string;
    difficulty?: string;
    image_url?: string;
    status?: string;
    is_published?: boolean;
  }
) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('questions')
    .update(updates)
    .eq('id', questionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateChoice(
  choiceId: string,
  updates: {
    content?: string;
    is_answer?: boolean;
    score?: number;
  }
) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('choices')
    .update(updates)
    .eq('id', choiceId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteQuestion(questionId: string) {
  const supabase = await createClient();
  
  // Soft delete
  const { error } = await supabase
    .from('questions')
    .update({
      is_deleted: true,
      is_published: false,
      status: 'deleted'
    })
    .eq('id', questionId);

  if (error) throw error;
}

export async function togglePublishQuestion(questionId: string, publish: boolean) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('questions')
    .update({
      is_published: publish,
      status: publish ? 'published' : 'draft'
    })
    .eq('id', questionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// ADMIN PACKAGE MANAGEMENT FUNCTIONS
// ============================================

export async function getPackagesAdmin(includeInactive = false) {
  const supabase = await createClient();
  
  let query = supabase
    .from('packages')
    .select(`
      *,
      package_questions (count)
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Transform to include question count
  return (data || []).map((pkg: any) => ({
    ...pkg,
    question_count: pkg.package_questions[0]?.count || 0,
  }));
}

export async function getPublishedQuestionsByCategory(category: 'TWK' | 'TIU' | 'TKP') {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('questions')
    .select('id, content, difficulty, topic')
    .eq('category', category)
    .eq('is_published', true)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createPackage(packageData: {
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tier: 'free' | 'premium' | 'platinum';
  is_active: boolean;
  questionIds: string[];
  userId: string;
}) {
  const supabase = await createClient();

  // Validate 110 questions
  if (packageData.questionIds.length !== 110) {
    throw new Error('Paket harus berisi tepat 110 soal');
  }

  // Insert package
  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .insert({
      title: packageData.title,
      description: packageData.description,
      difficulty: packageData.difficulty,
      tier: packageData.tier,
      duration_minutes: 100,
      is_active: packageData.is_active,
      created_by: packageData.userId,
    })
    .select()
    .single();

  if (pkgError) throw pkgError;

  // Insert package_questions with positions
  const packageQuestions = packageData.questionIds.map((qid, index) => ({
    package_id: pkg.id,
    question_id: qid,
    position: index + 1,
  }));

  const { error: pqError } = await supabase
    .from('package_questions')
    .insert(packageQuestions);

  if (pqError) {
    // Rollback - delete package
    await supabase.from('packages').delete().eq('id', pkg.id);
    throw pqError;
  }

  return pkg;
}

export async function updatePackageInfo(
  packageId: string,
  updates: {
    title?: string;
    description?: string;
    difficulty?: string;
    tier?: string;
    is_active?: boolean;
  }
) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('packages')
    .update(updates)
    .eq('id', packageId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePackage(packageId: string) {
  const supabase = await createClient();
  
  // Check if package has attempts
  const { data: attempts } = await supabase
    .from('attempts')
    .select('id')
    .eq('package_id', packageId)
    .limit(1);

  if (attempts && attempts.length > 0) {
    throw new Error('Paket tidak bisa dihapus karena sudah ada percobaan');
  }

  // Soft delete
  const { error } = await supabase
    .from('packages')
    .update({ is_deleted: true, is_active: false })
    .eq('id', packageId);

  if (error) throw error;
}

export async function getPackageWithQuestions(packageId: string) {
  const supabase = await createClient();
  
  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .select('*')
    .eq('id', packageId)
    .single();

  if (pkgError) throw pkgError;

  const { data: questions, error: qError } = await supabase
    .from('package_questions')
    .select(`
      position,
      questions!inner (
        id,
        category,
        content,
        difficulty,
        topic
      )
    `)
    .eq('package_id', packageId)
    .order('position');

  if (qError) throw qError;

  return {
    package: pkg,
    questions: questions.map((pq: any) => ({
      position: pq.position,
      ...pq.questions,
    })),
  };
}

// ============================================
// USER PACKAGE ACCESS FUNCTIONS
// ============================================

export async function getPackagesForUser(userId: string): Promise<Package[]> {
  const supabase = await createClient();

  // Get user's subscription tier from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('user_id', userId)
    .single();

  const userTier = profile?.subscription_tier || 'free';

  let query = supabase
    .from('packages')
    .select('*')
    .eq('is_active', true)
    .eq('is_deleted', false);

  // Filter accessible tiers based on user's subscription
  // free    → only free packages
  // premium → free + premium packages
  // platinum → all packages (no filter needed)
  if (userTier === 'free') {
    query = query.eq('tier', 'free');
  } else if (userTier === 'premium') {
    query = query.in('tier', ['free', 'premium']);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('getPackagesForUser error:', error);
    throw new Error(`Failed to fetch packages: ${error.message || 'Unknown error'}`);
  }

  return data || [];
}