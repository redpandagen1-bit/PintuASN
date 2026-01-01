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