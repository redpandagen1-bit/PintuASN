'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AttemptHistory {
  final_score: number | null;
  score_twk: number | null;
  score_tiu: number | null;
  score_tkp: number | null;
  completed_at: string | null;
}

interface ProgressChartSectionProps {
  attemptHistory: AttemptHistory[];
}

export default function ProgressChartSection({ attemptHistory }: ProgressChartSectionProps) {
  const chartData = attemptHistory.map((attempt, index) => ({
    percobaan: `Percobaan ${index + 1}`,
    Total: attempt.final_score || 0,
    TWK: attempt.score_twk || 0,
    TIU: attempt.score_tiu || 0,
    TKP: attempt.score_tkp || 0,
  }));

  if (chartData.length === 0) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Grafik Perkembangan Nilai</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Belum ada data perkembangan
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Grafik Perkembangan Nilai</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="percobaan" />
            <YAxis domain={[0, 550]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Total" stroke="#8b5cf6" strokeWidth={2} />
            <Line type="monotone" dataKey="TWK" stroke="#3b82f6" />
            <Line type="monotone" dataKey="TIU" stroke="#10b981" />
            <Line type="monotone" dataKey="TKP" stroke="#a855f7" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
