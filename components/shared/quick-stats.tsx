import { Card, CardContent } from '@/components/ui/card';

interface QuickStatsProps {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
}

export function QuickStats({ totalAttempts, averageScore, bestScore }: QuickStatsProps) {
  const stats = [
    {
      title: 'Total Percobaan',
      value: totalAttempts,
      description: 'Semua tryout yang telah dikerjakan',
    },
    {
      title: 'Rata-rata Skor',
      value: averageScore,
      description: 'Skor rata-rata dari semua percobaan',
    },
    {
      title: 'Skor Terbaik',
      value: bestScore,
      description: 'Skor tertinggi yang pernah dicapai',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {typeof stat.value === 'number' ? stat.value.toFixed(0) : stat.value}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <div className="h-6 w-6 rounded-full bg-blue-600" />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
