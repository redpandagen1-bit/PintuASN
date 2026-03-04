import { Suspense } from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/check-admin';
import { getPackagesAdmin } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PackageTable } from '@/components/admin/package-table';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default async function PackagesPage() {
  await requireAdmin();
  const packages = await getPackagesAdmin(true); // include inactive

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Kelola Paket Tryout</h1>
          <p className="text-slate-600 mt-2">
            Total {packages.length} paket
          </p>
        </div>
        <Link href="/admin/packages/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Buat Paket Baru
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <Suspense fallback={<PackageTableSkeleton />}>
            <PackageTable packages={packages} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function PackageTableSkeleton() {
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