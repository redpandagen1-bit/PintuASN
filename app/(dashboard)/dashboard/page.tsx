// app/(dashboard)/dashboard/page.tsx

import { Suspense }      from 'react';
import { currentUser }  from '@clerk/nextjs/server';
import {
  getActivePackages,
  getUserAttempts,
  getUserTier,
} from '@/lib/supabase/queries';
import { createAdminClient } from '@/lib/supabase/server';
import { BannerSlider, StatCard, MateriTabs } from '@/components/dashboard/user';
import { FeatureGrid }   from '@/components/layout/FeatureGrid';
import TryoutSection     from '@/components/dashboard/user/TryoutSection';
import { Button }        from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import Link              from 'next/link';
import { ChevronRight }  from 'lucide-react';
import { Skeleton }      from '@/components/ui/skeleton';
import PaymentSuccessToast from '@/components/shared/payment-success-toast';
import { MobilePageWrapper } from '@/components/mobile/MobilePageWrapper';
import { MobileDashboard }   from '@/components/mobile/MobileDashboard';

// ─────────────────────────────────────────────────────────────

async function DashboardContent() {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  const userId = user.id;

  const [packages, attempts, userTier] = await Promise.all([
    getActivePackages(),
    getUserAttempts(userId),
    getUserTier(userId),
  ]);

  const supabase    = await createAdminClient();
  const packageIds  = packages.map(pkg => pkg.id);

  const [
    { data: completedCounts },
    { data: rankingData },
    { data: materials },
  ] = await Promise.all([
    supabase
      .from('attempts')
      .select('package_id, user_id')
      .in('package_id', packageIds)
      .eq('status', 'completed'),

    supabase.rpc('get_user_national_rank', { p_user_id: userId }),

    supabase
      .from('materials')
      .select('id, title, category, type, tier, duration_minutes, is_new, content_url')
      .eq('is_active', true)
      .eq('is_deleted', false)
      .order('order_index', { ascending: true })
      .order('created_at',  { ascending: false }),
  ]);

  const userCountsByPackage = new Map<string, number>();
  if (completedCounts) {
    const packageUserSets = new Map<string, Set<string>>();
    completedCounts.forEach(({ package_id, user_id }) => {
      if (!packageUserSets.has(package_id)) packageUserSets.set(package_id, new Set());
      packageUserSets.get(package_id)!.add(user_id);
    });
    packageUserSets.forEach((set, id) => userCountsByPackage.set(id, set.size));
  }

  const packagesWithUserCount = packages.map(pkg => ({
    ...pkg,
    completedUsersCount: userCountsByPackage.get(pkg.id) ?? 0,
  }));

  const rankingDisplay = rankingData?.length
    ? `#${rankingData[0].user_rank.toLocaleString('id-ID')}`
    : '-';

  const completedAttempts = attempts.filter(a => a.status === 'completed');
  const scores = completedAttempts
    .filter(a => a.final_score !== null)
    .map(a => a.final_score!);
  const averageScore = scores.length
    ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
    : 0;
  const bestScore = scores.length ? Math.max(...scores) : 0;

  const packageIdsWithAttempts = attempts
    .filter(a => a.status === 'in_progress')
    .map(a => a.package_id);

  return (
    <>
      {/* ── MOBILE layout (md:hidden via MobilePageWrapper) ── */}
      <MobilePageWrapper>
        {/* Banner full-width mobile */}
        <div className="mb-4">
          <BannerSlider />
        </div>
        <MobileDashboard
          completedCount={completedAttempts.length}
          averageScore={averageScore}
          bestScore={bestScore}
          rankingDisplay={rankingDisplay}
          packages={packagesWithUserCount}
          packageIdsWithAttempts={packageIdsWithAttempts}
          materials={materials ?? []}
          userTier={userTier as 'free' | 'premium' | 'platinum'}
        />
      </MobilePageWrapper>

      {/* ── DESKTOP layout (hidden on mobile) ─────────────── */}
      <div className="hidden md:block space-y-5 pb-10">
        <BannerSlider />
        <FeatureGrid />

        {/* Statistik Belajar */}
        <section className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-3xl p-5 md:p-7 shadow-lg border border-slate-600 space-y-5">
          <div className="flex flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white">
                Statistik <span className="text-yellow-400">Belajar</span>
              </h2>
              <p className="text-slate-300 text-xs mt-0.5">Pantau perkembangan belajarmu.</p>
            </div>
            <Link href="/statistics" className="flex-shrink-0">
              <Button className="bg-white text-slate-800 hover:bg-slate-100 flex items-center gap-1 px-3 md:px-4 py-2 font-semibold text-xs md:text-sm">
                Lihat Detail <ChevronRight size={13} />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Tryout Selesai"     value={completedAttempts.length} iconName="CheckCircle" iconColor="text-yellow-400" iconBg="bg-slate-800" />
            <StatCard label="Rata-rata Skor"     value={averageScore}             iconName="BarChart2"   iconColor="text-yellow-400" iconBg="bg-slate-800" />
            <StatCard label="Peringkat Nasional" value={rankingDisplay}           iconName="Award"       iconColor="text-yellow-400" iconBg="bg-slate-800" />
            <StatCard label="Skor Terbaik"       value={bestScore}                iconName="TrendingUp"  iconColor="text-yellow-400" iconBg="bg-slate-800" />
          </div>
        </section>

        {/* Daftar Tryout */}
        <section className="bg-white rounded-3xl p-5 md:p-7 shadow-sm space-y-4">
          <TryoutSection
            packages={packagesWithUserCount}
            packageIdsWithAttempts={packageIdsWithAttempts}
            userTier={userTier}
          />
        </section>

        {/* Materi */}
        <section className="bg-white rounded-3xl p-5 md:p-7 shadow-sm border border-slate-100 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Materi</h2>
            <p className="text-slate-500 text-xs mt-0.5">Pelajari materi persiapan CPNS 2026.</p>
          </div>
          <MateriTabs
            materials={materials ?? []}
            userTier={userTier}
          />
        </section>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <>
      {/* Toast muncul kalau URL mengandung ?payment=success */}
      <PaymentSuccessToast />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-7 w-40" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-full" /></CardHeader>
              <CardContent><Skeleton className="h-4 w-24" /></CardContent>
              <CardFooter><Skeleton className="h-9 w-full" /></CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}