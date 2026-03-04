import { requireAdmin } from '@/lib/auth/check-admin';
import { getPackageById } from '@/lib/supabase/queries';
import { QuestionManualForm } from '@/components/admin/question-manual-form';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AddQuestionPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  try {
    const packageData = await getPackageById(id);
    return <QuestionManualForm packageId={id} packageTitle={packageData.title} />;
  } catch (error) {
    notFound();
  }
}