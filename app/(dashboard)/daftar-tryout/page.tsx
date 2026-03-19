import { Suspense } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { getActivePackages, getUserAttempts } from '@/lib/supabase/queries';
import { createAdminClient } from '@/lib/supabase/server';
import { DaftarTryoutClient } from './daftar-tryout-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

async function DaftarTryoutContent() {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  const userId = user.id;

  const [packages, attempts] = await Promise.all([
    getActivePackages(),
    getUserAttempts(userId),
  ]);

  const supabase = await createAdminClient();
  const packageIds = packages.map(pkg => pkg.id);

  const { data: completedCounts } = await supabase
    .from('attempts')
    .select('package_id, user_id')
    .in('package_id', packageIds)
    .eq('status', 'completed');

  const userCountsByPackage = new Map<string, number>();
  if (completedCounts) {
    const packageUserSets = new Map<string, Set<string>>();
    completedCounts.forEach(({ package_id, user_id }) => {
      if (!packageUserSets.has(package_id)) packageUserSets.set(package_id, new Set());
      packageUserSets.get(package_id)!.add(user_id);
    });
    packageUserSets.forEach((userSet, package_id) => {
      userCountsByPackage.set(package_id, userSet.size);
    });
  }

  const packagesWithMeta = packages.map(pkg => ({
    ...pkg,
    completedUsersCount: userCountsByPackage.get(pkg.id) || 0
  }));

  const packageIdsWithAttempts = new Set(
    attempts.filter(a => a.status === 'in_progress').map(a => a.package_id)
  );

  return (
    <DaftarTryoutClient
      packages={packagesWithMeta}
      packageIdsWithAttempts={Array.from(packageIdsWithAttempts)}
    />
  );
}

export default function DaftarTryoutPage() {
  return (
    <Suspense fallback={<DaftarTryoutSkeleton />}>
      <DaftarTryoutContent />
    </Suspense>
  );
}

function DaftarTryoutSkeleton() {
  return (
    <div className="space-y-6 pb-10">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-72" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-5 w-full" /></CardHeader>
            <CardContent><Skeleton className="h-4 w-24" /></CardContent>
            <CardFooter><Skeleton className="h-9 w-full" /></CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}