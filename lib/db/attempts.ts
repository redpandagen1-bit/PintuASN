import { createClient } from '@/lib/supabase/server';
import { Attempt } from '@/types/statistics';

export async function getUserAttempts(userId: string): Promise<Attempt[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data || [];
}
