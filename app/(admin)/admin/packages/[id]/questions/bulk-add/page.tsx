import { requireAdmin } from '@/lib/auth/check-admin';
import { getPackageById } from '@/lib/supabase/queries';
import { QuestionBulkForm } from '@/components/admin/question-bulk-form';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BulkAddQuestionPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  try {
    const packageData = await getPackageById(id);
    return <QuestionBulkForm packageId={id} packageTitle={packageData.title} />;
  } catch (error) {
    notFound();
  }
}