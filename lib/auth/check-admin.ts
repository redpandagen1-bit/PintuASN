import { cache } from 'react';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';

// Catatan: pakai auth() (verifikasi token sesi secara lokal, TANPA memanggil
// Clerk Backend API) — bukan currentUser() yang melakukan request jaringan ke
// Clerk setiap kali dipanggil. Saat bulk upload soal (ratusan request beruntun),
// currentUser() memicu rate limit Clerk (429 Too Many Requests).
//
// OPTIMASI: lookup role dibungkus React cache() → dalam SATU request, layout
// (checkIsAdmin) dan page (requireAdmin) berbagi 1 query, bukan 2. Ini menghapus
// satu round-trip DB di SETIAP halaman admin.
const getRole = cache(async (userId: string): Promise<string | null> => {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single();
  return (data?.role as string | undefined) ?? null;
});

export async function checkIsAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  return (await getRole(userId)) === 'admin';
}

export async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized: Admin access required');
  }

  if ((await getRole(userId)) !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  return userId;
}