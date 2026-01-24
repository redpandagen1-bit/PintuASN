'use client';

import { useMemo } from 'react';
import { Attempt } from '@/types/statistics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const THRESHOLD_TWK = 65;
const THRESHOLD_TIU = 80;
const THRESHOLD_TKP = 166;

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, trend }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {trend && (
          <span
            className={`ml-2 text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
};

interface GapProgressProps {
  current: number;
  threshold: number;
  label: string;
  color: string;
}

const GapProgress: React.FC<GapProgressProps> = ({ current, threshold, label, color }) => {
  const percentage = Math.min((current / threshold) * 100, 100);
  const gap = Math.max(threshold - current, 0);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">
          {current}/{threshold} {gap > 0 && `(-${gap})`}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface StatisticsViewProps {
  data: Attempt[];
}

const StatisticsView: React.FC<StatisticsViewProps> = ({ data }) => {
  const stats = useMemo(() => {
    const completedAttempts = data.filter(attempt => attempt.status === 'completed');
    
    if (completedAttempts.length === 0) {
      return {
        totalAttempts: 0,
        passRate: 0,
        averageScores: { twk: 0, tiu: 0, tkp: 0, final: 0 },
        bestScore: 0,
        trendData: [],
        scoreDistribution: [],
        categoryPassRates: { twk: 0, tiu: 0, tkp: 0 },
        recentAttempts: []
      };
    }

    const passCount = completedAttempts.filter(attempt => attempt.is_passed).length;
    const passRate = (passCount / completedAttempts.length) * 100;

    const totalScores = completedAttempts.reduce(
      (acc, attempt) => ({
        twk: acc.twk + attempt.score_twk,
        tiu: acc.tiu + attempt.score_tiu,
        tkp: acc.tkp + attempt.score_tkp,
        final: acc.final + attempt.final_score
      }),
      { twk: 0, tiu: 0, tkp: 0, final: 0 }
    );

    const averageScores = {
      twk: totalScores.twk / completedAttempts.length,
      tiu: totalScores.tiu / completedAttempts.length,
      tkp: totalScores.tkp / completedAttempts.length,
      final: totalScores.final / completedAttempts.length
    };

    const bestScore = Math.max(...completedAttempts.map(attempt => attempt.final_score));

    const trendData = completedAttempts
      .slice()
      .reverse()
      .map((attempt, index) => ({
        attempt: index + 1,
        score: attempt.final_score,
        twk: attempt.score_twk,
        tiu: attempt.score_tiu,
        tkp: attempt.score_tkp,
        date: new Date(attempt.completed_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short'
        })
      }));

    const scoreDistribution = [
      { range: '0-100', count: 0 },
      { range: '101-200', count: 0 },
      { range: '201-300', count: 0 },
      { range: '301-400', count: 0 },
      { range: '401-500', count: 0 }
    ];

    completedAttempts.forEach(attempt => {
      const score = attempt.final_score;
      if (score <= 100) scoreDistribution[0].count++;
      else if (score <= 200) scoreDistribution[1].count++;
      else if (score <= 300) scoreDistribution[2].count++;
      else if (score <= 400) scoreDistribution[3].count++;
      else scoreDistribution[4].count++;
    });

    const twkPassCount = completedAttempts.filter(attempt => attempt.score_twk >= THRESHOLD_TWK).length;
    const tiuPassCount = completedAttempts.filter(attempt => attempt.score_tiu >= THRESHOLD_TIU).length;
    const tkpPassCount = completedAttempts.filter(attempt => attempt.score_tkp >= THRESHOLD_TKP).length;

    const categoryPassRates = {
      twk: (twkPassCount / completedAttempts.length) * 100,
      tiu: (tiuPassCount / completedAttempts.length) * 100,
      tkp: (tkpPassCount / completedAttempts.length) * 100
    };

    const recentAttempts = completedAttempts
      .slice()
      .reverse()
      .slice(0, 5);

    return {
      totalAttempts: completedAttempts.length,
      passRate,
      averageScores,
      bestScore,
      trendData,
      scoreDistribution,
      categoryPassRates,
      recentAttempts
    };
  }, [data]);

  if (stats.totalAttempts === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data statistik</h3>
        <p className="text-gray-500">Selesaikan tryout untuk melihat statistik performa Anda</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tryout"
          value={stats.totalAttempts}
        />
        <StatCard
          title="Tingkat Kelulusan"
          value={`${stats.passRate.toFixed(1)}%`}
          subtitle={`${Math.round(stats.passRate * stats.totalAttempts / 100)} dari ${stats.totalAttempts} tryout`}
        />
        <StatCard
          title="Skor Tertinggi"
          value={stats.bestScore}
          subtitle="dari 500 skor maksimal"
        />
        <StatCard
          title="Rata-rata Skor"
          value={Math.round(stats.averageScores.final)}
          subtitle={`TWK: ${Math.round(stats.averageScores.twk)} | TIU: ${Math.round(stats.averageScores.tiu)} | TKP: ${Math.round(stats.averageScores.tkp)}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tren Performa</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="attempt" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="twk" stroke="#10b981" strokeWidth={1} />
              <Line type="monotone" dataKey="tiu" stroke="#f59e0b" strokeWidth={1} />
              <Line type="monotone" dataKey="tkp" stroke="#ef4444" strokeWidth={1} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribusi Skor</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Gap terhadap Nilai Minimum</h3>
        <div className="space-y-4">
          <GapProgress
            current={Math.round(stats.averageScores.twk)}
            threshold={THRESHOLD_TWK}
            label="Tes Wawasan Kebangsaan (TWK)"
            color={stats.averageScores.twk >= THRESHOLD_TWK ? "bg-green-500" : "bg-yellow-500"}
          />
          <GapProgress
            current={Math.round(stats.averageScores.tiu)}
            threshold={THRESHOLD_TIU}
            label="Tes Intelegensi Umum (TIU)"
            color={stats.averageScores.tiu >= THRESHOLD_TIU ? "bg-green-500" : "bg-yellow-500"}
          />
          <GapProgress
            current={Math.round(stats.averageScores.tkp)}
            threshold={THRESHOLD_TKP}
            label="Tes Karakteristik Pribadi (TKP)"
            color={stats.averageScores.tkp >= THRESHOLD_TKP ? "bg-green-500" : "bg-yellow-500"}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tingkat Kelulusan per Kategori</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">TWK (≥{THRESHOLD_TWK})</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.categoryPassRates.twk.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{ width: `${stats.categoryPassRates.twk}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">TIU (≥{THRESHOLD_TIU})</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.categoryPassRates.tiu.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{ width: `${stats.categoryPassRates.tiu}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">TKP (≥{THRESHOLD_TKP})</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.categoryPassRates.tkp.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{ width: `${stats.categoryPassRates.tkp}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">5 Tryout Terakhir</h3>
          <div className="space-y-3">
            {stats.recentAttempts.map((attempt, index) => (
              <div key={attempt.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    attempt.is_passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(attempt.completed_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      TWK: {attempt.score_twk} | TIU: {attempt.score_tiu} | TKP: {attempt.score_tkp}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{attempt.final_score}</p>
                  <p className={`text-xs ${attempt.is_passed ? 'text-green-600' : 'text-red-600'}`}>
                    {attempt.is_passed ? 'LULUS' : 'TIDAK LULUS'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;
