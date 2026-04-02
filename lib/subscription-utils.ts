// ============================================================
// lib/subscription-utils.ts
//
// Helper tier yang AMAN diimport dari Client Component maupun
// Server Component karena TIDAK menggunakan next/headers,
// supabase/server, atau API apapun yang hanya berjalan di server.
// ============================================================

export type SubscriptionTier = 'free' | 'premium' | 'platinum';

/**
 * Cek apakah userTier bisa mengakses contentTier.
 *
 * free     → hanya bisa akses konten 'free'
 * premium  → bisa akses 'free' dan 'premium'
 * platinum → bisa akses semua
 */
export function canAccess(
  userTier:    SubscriptionTier,
  contentTier: SubscriptionTier,
): boolean {
  if (userTier === 'platinum') return true;
  if (userTier === 'premium')  return contentTier === 'free' || contentTier === 'premium';
  return contentTier === 'free';
}