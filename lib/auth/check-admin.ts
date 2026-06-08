import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';

// Catatan: pakai auth() (verifikasi token sesi secara lokal, TANPA memanggil
// Clerk Backend API) — bukan currentUser() yang melakukan request jaringan ke
// Clerk setiap kali dipanggil. Saat bulk upload soal (ratusan request beruntun),
// currentUser() memicu rate limit Clerk (429 Too Many Requests).
export async function checkIsAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const supabase = await createAdminClient();
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single();

  return data?.role === 'admin';
}

export async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized: Admin access required');
  }

  const supabase = await createAdminClient();
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (data?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  return userId;
}