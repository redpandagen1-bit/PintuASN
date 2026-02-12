import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export async function checkIsAdmin(): Promise<boolean> {
  const user = await currentUser();
  if (!user) return false;
  
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();
  
  return data?.role === 'admin';
}

export async function requireAdmin() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }
  const user = await currentUser();
  return user!.id;
}