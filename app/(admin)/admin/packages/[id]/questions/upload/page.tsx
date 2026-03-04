import { requireAdmin } from '@/lib/auth/check-admin';
import { getPackageById } from '@/lib/supabase/queries';
import { CSVUploadForm } from '@/components/admin/csv-upload-form';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UploadCSVPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  try {
    const packageData = await getPackageById(id);
    return <CSVUploadForm packageId={id} packageTitle={packageData.title} />;
  } catch (error) {
    notFound();
  }
}