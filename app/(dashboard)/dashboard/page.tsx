import { Suspense } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { getActivePackages, getUserAttempts } from '@/lib/supabase/queries';
import { PackageCardUser } from '@/components/shared/package-card-user';
import { BannerSlider, StatCard, TryoutFilterTabs, MateriTabs } from '@/components/dashboard/user';
import { FeatureGrid } from '@/components/layout/FeatureGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

async function DashboardContent() {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  const userId = user.id;
  const firstName = user.firstName || 'Pengguna';

  // Fetch data - KEEP THIS EXACTLY AS IS
  const [packages, attempts] = await Promise.all([
    getActivePackages(),
    getUserAttempts(userId),
  ]);

  // Calculate stats - KEEP THIS EXACTLY AS IS
  const totalAttempts = attempts.length;
  const completedAttempts = attempts.filter(a => a.status === 'completed');
  const scores = completedAttempts
    .filter(a => a.final_score !== null)
    .map(a => a.final_score!);
  
  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;
  
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

  // Limit packages to first 6 for display - KEEP THIS
  const displayedPackages = packages.slice(0, 6);
  const hasMorePackages = packages.length > 6;

  // Check for active attempts per package - KEEP THIS
  const packageIdsWithAttempts = new Set(
    attempts
      .filter(a => a.status === 'in_progress')
      .map(a => a.package_id)
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Banner Slider - AT TOP */}
      <BannerSlider />

      {/* Feature Grid - Mobile Only */}
      <FeatureGrid />

      {/* Statistik Belajar - NEW DESIGN */}
      <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Statistik Belajar</h2>
            <p className="text-slate-500 text-sm mt-1">Pantau perkembangan belajarmu.</p>
          </div>
          <Link href="/statistics">
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center gap-1">
              Lihat Detail <ChevronRight size={16} />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Tryout Selesai"
            value={completedAttempts.length}
            iconName="CheckCircle"
            iconColor="text-emerald-600"
            iconBg="bg-emerald-100"
          />
          <StatCard
            label="Rata-rata Skor"
            value={averageScore}
            iconName="BarChart2"
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          />
          <StatCard
            label="Peringkat Nasional"
            value="Top 5%"
            iconName="Award"
            iconColor="text-amber-600"
            iconBg="bg-amber-100"
          />
          <StatCard
            label="Skor Terbaik"
            value={bestScore}
            iconName="TrendingUp"
            iconColor="text-purple-600"
            iconBg="bg-purple-100"
          />
        </div>
      </section>

      {/* Daftar Tryout */}
      <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Daftar Tryout
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Pilih paket simulasi SKD sesuai kebutuhanmu.
            </p>
          </div>
          
          {/* Filter Tabs */}
          <TryoutFilterTabs />
        </div>
        
        {displayedPackages.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedPackages.map((pkg) => (
              <PackageCardUser 
                key={pkg.id}
                packageData={pkg}
                hasActiveAttempt={packageIdsWithAttempts.has(pkg.id)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Belum Ada Paket Tryout
              </h3>
              <p className="text-slate-600 mb-4">
                Paket tryout akan segera tersedia. Cek kembali nanti!
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Materi Section */}
      <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
                Materi
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Pelajari materi persiapan CPNS 2026.
              </p>
            </div>
          
          <MateriTabs />
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
    <div className="space-y-8">
      {/* Welcome Section Skeleton */}
      <div className="text-center space-y-2">
        <Skeleton className="h-9 w-64 mx-auto" />
        <Skeleton className="h-6 w-48 mx-auto" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Packages Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-20 mt-2" />
              </CardHeader>
              <CardContent className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}