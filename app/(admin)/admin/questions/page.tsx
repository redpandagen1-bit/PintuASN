import { Suspense } from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/check-admin';
import { getQuestionsAdmin } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QuestionTable } from '@/components/admin/question-table';
import { QuestionFilters } from '@/components/admin/question-filters';
import { Upload, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  searchParams: Promise<{
    category?: string;
    difficulty?: string;
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function QuestionsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;

  const result = await getQuestionsAdmin({
    category: params.category as any,
    difficulty: params.difficulty as any,
    status: params.status as any,
    search: params.search,
    page: params.page ? parseInt(params.page) : 1,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Kelola Soal</h1>
          <p className="text-slate-600 mt-2">
            Total {result.totalCount} soal
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/questions/upload">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload CSV
            </Button>
          </Link>
        </div>
      </div>

      <QuestionFilters />

      <Card>
        <CardContent className="p-0">
          <Suspense fallback={<QuestionTableSkeleton />}>
            <QuestionTable
              questions={result.questions}
              currentPage={result.currentPage}
              totalPages={result.totalPages}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function QuestionTableSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}