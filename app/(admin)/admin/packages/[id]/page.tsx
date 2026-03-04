import { requireAdmin } from '@/lib/auth/check-admin';
import { getPackageWithQuestions } from '@/lib/supabase/queries';
import { PackageDetailView } from '@/components/admin/package-detail-view';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PackageDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  try {
    const data = await getPackageWithQuestions(id);
    return <PackageDetailView packageData={data.package} questions={data.questions} />;
  } catch (error) {
    notFound();
  }
}