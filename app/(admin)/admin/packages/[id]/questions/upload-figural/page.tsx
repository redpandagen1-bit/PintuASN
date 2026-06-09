import { requireAdmin } from '@/lib/auth/check-admin';
import { getPackageById } from '@/lib/supabase/queries';
import { FiguralUploadForm } from '@/components/admin/figural-upload-form';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UploadFiguralPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  try {
    const packageData = await getPackageById(id);
    return <FiguralUploadForm packageId={id} packageTitle={packageData.title} />;
  } catch {
    notFound();
  }
}
