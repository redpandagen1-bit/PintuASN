import { unstable_cache } from 'next/cache';
import { requireAdmin } from '@/lib/auth/check-admin';
import { createCacheClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileQuestion, Package, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// Statistik global — di-cache 120s (count exact pada tabel besar itu mahal,
// dan angka overview tak perlu real-time).
const getAdminCounts = unstable_cache(
  async () => {
    const supabase = createCacheClient();
    const [usersCount, questionsCount, packagesCount, attemptsCount] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('questions').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('packages').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('attempts').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    ]);
    return {
      users:     usersCount.count     ?? 0,
      questions: questionsCount.count ?? 0,
      packages:  packagesCount.count  ?? 0,
      attempts:  attemptsCount.count  ?? 0,
    };
  },
  ['admin-overview-counts'],
  { tags: ['admin-counts'], revalidate: 120 },
);

export default async function AdminDashboardPage() {
  await requireAdmin(); // This will throw if not admin

  const counts = await getAdminCounts();

  const metrics = [
    {
      label: 'Total Users',
      value: counts.users,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: 'Total Soal',
      value: counts.questions,
      icon: FileQuestion,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'Total Paket',
      value: counts.packages,
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      label: 'Total Percobaan',
      value: counts.attempts,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Admin</h1>
        <p className="text-slate-600 mt-2">Kelola konten dan monitoring platform</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {metric.label}
                </CardTitle>
                <div className={cn('p-2 rounded-lg', metric.bg)}>
                  <Icon className={cn('h-5 w-5', metric.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {metric.value.toLocaleString('id-ID')}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}