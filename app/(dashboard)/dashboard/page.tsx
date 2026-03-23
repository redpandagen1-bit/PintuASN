import { Suspense } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { getActivePackages, getUserAttempts } from '@/lib/supabase/queries';
import { createAdminClient } from '@/lib/supabase/server';
import { BannerSlider, StatCard, MateriTabs } from '@/components/dashboard/user';
import { FeatureGrid } from '@/components/layout/FeatureGrid';
import TryoutSection from '@/components/dashboard/user/TryoutSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

async function DashboardContent() {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  const userId = user.id;

  const [packages, attempts] = await Promise.all([
    getActivePackages(),
    getUserAttempts(userId),
  ]);

  const supabase = await createAdminClient();

  // Hitung unique users per package
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

  const packagesWithUserCount = packages.map(pkg => ({
    ...pkg,
    completedUsersCount: userCountsByPackage.get(pkg.id) || 0,
  }));

  // Ranking
  const { data: rankingData } = await supabase
    .rpc('get_user_national_rank', { p_user_id: userId });
  const rankingDisplay = rankingData && rankingData.length > 0
    ? `#${rankingData[0].user_rank.toLocaleString('id-ID')}`
    : '-';

  // Stats
  const completedAttempts = attempts.filter(a => a.status === 'completed');
  const scores = completedAttempts
    .filter(a => a.final_score !== null)
    .map(a => a.final_score!);
  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
    : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

  const packageIdsWithAttempts = attempts
    .filter(a => a.status === 'in_progress')
    .map(a => a.package_id);

  // ── Fetch materi untuk MateriTabs ──────────────────────────────────────
  const { data: materials } = await supabase
    .from('materials')
    .select('id, title, category, type, tier, duration_minutes, is_new')
    .eq('is_active', true)
    .eq('is_deleted', false)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-5 pb-10">
      <BannerSlider />
      <FeatureGrid />

      {/* Statistik Belajar */}
      <section className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-3xl p-5 md:p-7 shadow-lg border border-slate-600 space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Statistik Belajar</h2>
            <p className="text-slate-300 text-xs mt-1">Pantau perkembangan belajarmu.</p>
          </div>
          <Link href="/statistics">
            <Button className="bg-white text-slate-800 hover:bg-slate-100 flex items-center gap-1 px-4 py-2 font-semibold text-sm">
              Lihat Detail <ChevronRight size={15} />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Tryout Selesai"      value={completedAttempts.length} iconName="CheckCircle" iconColor="text-emerald-400" iconBg="bg-emerald-900/50" />
          <StatCard label="Rata-rata Skor"      value={averageScore}             iconName="BarChart2"   iconColor="text-blue-400"    iconBg="bg-blue-900/50"    />
          <StatCard label="Peringkat Nasional"  value={rankingDisplay}           iconName="Award"       iconColor="text-amber-400"   iconBg="bg-amber-900/50"   />
          <StatCard label="Skor Terbaik"        value={bestScore}                iconName="TrendingUp"  iconColor="text-purple-400"  iconBg="bg-purple-900/50"  />
        </div>
      </section>

      {/* Daftar Tryout */}
      <section className="bg-white rounded-3xl p-5 md:p-7 shadow-sm border border-slate-100 space-y-4">
        <TryoutSection
          packages={packagesWithUserCount}
          packageIdsWithAttempts={packageIdsWithAttempts}
        />
      </section>

      {/* Materi — sekarang dengan data real dari database */}
      <section className="bg-white rounded-3xl p-5 md:p-7 shadow-sm border border-slate-100 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Materi</h2>
          <p className="text-slate-500 text-xs mt-0.5">Pelajari materi persiapan CPNS 2026.</p>
        </div>
        <MateriTabs materials={materials || []} />
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
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
          {[1, 2, 3, 4, 5, 6].map((i) => (
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