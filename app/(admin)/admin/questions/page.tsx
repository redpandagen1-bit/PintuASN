import { Suspense } from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/check-admin';
import { getQuestionsAdmin } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QuestionTable } from '@/components/admin/question-table';
import { QuestionFilters } from '@/components/admin/question-filters';
import { ArrowLeft } from 'lucide-react';
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Kelola Soal</h1>
          <p className="text-slate-600 mt-2">
            Total {result.totalCount} soal dari semua paket
          </p>
        </div>
        <Link href="/admin/packages">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ke Paket Tryout
          </Button>
        </Link>
      </div>

      {/* Info Alert */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            💡 <strong>Tips:</strong> Untuk menambah atau upload soal, buka menu{' '}
            <Link href="/admin/packages" className="underline font-medium">
              Paket Tryout
            </Link>
            , pilih paket, lalu klik "Tambah Soal Manual" atau "Upload CSV"
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <QuestionFilters />

      {/* Table */}
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