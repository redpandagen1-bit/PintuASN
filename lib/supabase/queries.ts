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
      question:questions (*, choices (*))
    `)
    .eq('package_id', packageId)
    .order('position');
  
  if (error) throw error;
  return data;
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
  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .eq('id', attemptId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getAttemptWithAnswers(attemptId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('attempts')
    .select(`
      *,
      attempt_answers (
        *,
        question:questions (*, choices (*)),
        choice:choices (*)
      )
    `)
    .eq('id', attemptId)
    .single();
  
  if (error) throw error;
  return data;
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
