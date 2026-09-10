// ============================================================
// app/(admin)/admin/follow-proofs/page.tsx
// ============================================================

import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin }      from '@/lib/auth/check-admin';
import AdminFollowProofsClient from './admin-follow-proofs-client';

async function getSubmissions() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('follow_proof_submissions')
    .select('*, packages(title), events(title)')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function AdminFollowProofsPage() {
  await requireAdmin();
  const submissions = await getSubmissions();
  return <AdminFollowProofsClient initialSubmissions={submissions} />;
}
