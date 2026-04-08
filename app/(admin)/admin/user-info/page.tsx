import { requireAdmin }     from '@/lib/auth/check-admin';
import { createAdminClient } from '@/lib/supabase/server';
import UserInfoClient        from './user-info-client';

export default async function UserInfoPage() {
  await requireAdmin();
  const supabase = await createAdminClient();

  const [{ data: banners }, { data: referrals }] = await Promise.all([
    supabase
      .from('banners')
      .select('*')
      .order('order_index', { ascending: true }),
    supabase
      .from('referral_codes')
      .select('*')
      .order('created_at', { ascending: false }),
  ]);

  return (
    <UserInfoClient
      initialBanners={banners ?? []}
      initialReferrals={referrals ?? []}
    />
  );
}