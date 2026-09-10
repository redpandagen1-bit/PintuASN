// ============================================================
// app/(admin)/admin/referrals/page.tsx
// ============================================================

import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin }      from '@/lib/auth/check-admin';
import AdminReferralsClient  from './admin-referrals-client';
import type { ReferralCode } from '@/types/referral';

async function getAllReferrals(): Promise<ReferralCode[]> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('referral_codes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);
  return (data ?? []) as ReferralCode[];
}

export default async function AdminReferralsPage() {
  await requireAdmin();
  const referrals = await getAllReferrals();
  return <AdminReferralsClient initialReferrals={referrals} />;
}
