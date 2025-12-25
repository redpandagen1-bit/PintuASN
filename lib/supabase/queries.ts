import { createClient } from './server';
import type { Profile, Package, Attempt } from '@/types/database';

export async function getProfile(userId: string): Promise<Profile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
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
  
  if (error) throw error;
  return data;
}

export async function getPackageById(packageId: string): Promise<Package> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('id', packageId)
    .single();
  
  if (error) throw error;
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
  
  if (error) throw error;
  return data;
}

export async function getAttemptById(attemptId: string): Promise<Attempt> {
  const supabase = await createClient();

  // Step 1: Fetch attempt only (no join to avoid coerce error)
  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .select('*')
    .eq('id', attemptId)
    .single();
  
  if (attemptError) {
    console.error('getAttemptById - attempt error:', {
      code: attemptError.code,
      message: attemptError.message,
      details: attemptError.details,
      hint: attemptError.hint
    });
    throw new Error(`Failed to fetch attempt: ${attemptError.message}`);
  }
  
  if (!attempt) {
    throw new Error(`Attempt ${attemptId} not found`);
  }
  
  console.log('✓ Attempt fetched:', {
    id: attempt.id,
    user_id: attempt.user_id,
    package_id: attempt.package_id,
    status: attempt.status
  });
  
  // Step 2: Fetch package separately (same pattern as getAttemptWithAnswers)
  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .select('id, title, description, difficulty')
    .eq('id', attempt.package_id)
    .single();
  
  if (pkgError) {
    console.error('getAttemptById - package error:', pkgError);
    console.warn(`Package ${attempt.package_id} not found or inaccessible`);
  }
  
  if (pkg) {
    console.log('✓ Package fetched:', pkg.title);
  }
  
  // Step 3: Combine results with proper type casting
  const result: Attempt = {
    ...attempt,
    packages: pkg || {
      id: attempt.package_id,
      title: 'Unknown Package',
      description: null,
      difficulty: 'medium'
    }
  };
  
  return result;
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

export async function getUserAttempts(userId: string): Promise<Attempt[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

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
      : null; // TKP doesn't have correct/incorrect
    
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