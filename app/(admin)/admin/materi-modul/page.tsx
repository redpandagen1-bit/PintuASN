import { requireAdmin } from '@/lib/auth/check-admin';
import { createAdminClient } from '@/lib/supabase/server';
import { MaterialModuleUploadForm } from '@/components/admin/material-module-upload-form';

export default async function AdminMateriModulPage() {
  await requireAdmin();

  const supabase = await createAdminClient();
  const { data: modules } = await supabase
    .from('material_modules')
    .select('id, category, topic, title, tier, read_minutes, topic_order, sub_order, is_new')
    .eq('is_deleted', false)
    .order('category').order('topic_order').order('topic').order('sub_order');

  return <MaterialModuleUploadForm existing={modules || []} />;
}
