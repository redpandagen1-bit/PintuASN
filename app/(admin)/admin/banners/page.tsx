import { requireAdmin }    from '@/lib/auth/check-admin';
import { createAdminClient } from '@/lib/supabase/server';
import AdminBannersClient  from './admin-banners-client';

export default async function AdminBannersPage() {
  await requireAdmin();
  const supabase = await createAdminClient();

  const { data: banners } = await supabase
    .from('banners')
    .select('*')
    .order('order_index', { ascending: true });

  return <AdminBannersClient initialBanners={banners ?? []} />;
}