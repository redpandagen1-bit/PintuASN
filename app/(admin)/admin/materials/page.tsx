import { requireAdmin } from '@/lib/auth/check-admin';
import { createAdminClient } from '@/lib/supabase/server';
import AdminMaterialsClient from './admin-materials-client';

export default async function AdminMaterialsPage() {
  await requireAdmin();

  const supabase = await createAdminClient();

  const { data: materials, error } = await supabase
    .from('materials')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch materials:', error);
  }

  return <AdminMaterialsClient initialMaterials={materials || []} />;
}