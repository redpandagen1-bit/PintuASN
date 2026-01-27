'use client';

import { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, ReferenceLine
} from 'recharts';
import { 
  Trophy, 
  FileText, 
  Activity, 
  CheckCircle2,
  XCircle,
  Target
} from 'lucide-react';

// ===== TYPES =====
interface Attempt {
  id: string;
  status: string;
  is_passed: boolean;
  score_twk: number;
  score_tiu: number;
  score_tkp: number;
  final_score: number;
  completed_at: string;
}

interface RankingData {
  user_rank: number;
  total_users: number;
  user_average_score: number;
  percentile: number;
}

interface StatisticsViewProps {
  data: Attempt[];
  ranking?: RankingData | null;
}

// ===== CONSTANTS =====
const THRESHOLD_TWK = 65;
const THRESHOLD_TIU = 80;
const THRESHOLD_TKP = 166;

// ===== COMPONENTS =====

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, icon: Icon, trend }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200">
    <div className="flex justify-between items-start mb-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
        <Icon className="w-6 h-6 text-yellow-400" />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-800">{value}</span>
        {subtext && <span className="text-xs text-slate-400">{subtext}</span>}
      </div>
    </div>
  </div>
);

const SectionHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-lg font-bold text-slate-800">{title}</h2>
    <p className="text-sm text-slate-500">{subtitle}</p>
  </div>
);

interface GapProgressProps {
  current: number;
  threshold: number;
  label: string;
  maxScore: number;
}

const GapProgress: React.FC<GapProgressProps> = ({ current, threshold, label, maxScore }) => {
  const percentage = Math.min((current / threshold) * 100, 100);
  const gap = Math.max(threshold - current, 0);
  const isPass = current >= threshold;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className={`text-sm font-semibold ${isPass ? 'text-emerald-600' : 'text-rose-600'}`}>
          {current} / {threshold} {gap > 0 && `(-${gap})`}
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${isPass ? 'bg-emerald-500' : 'bg-rose-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====

const StatisticsView: React.FC<StatisticsViewProps> = ({ data, ranking }) => {
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
        recentAttempts: [],
        gapAnalysisData: []
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
      twk: Math.round(totalScores.twk / completedAttempts.length),
      tiu: Math.round(totalScores.tiu / completedAttempts.length),
      tkp: Math.round(totalScores.tkp / completedAttempts.length),
      final: Math.round(totalScores.final / completedAttempts.length)
    };

    const bestScore = Math.max(...completedAttempts.map(attempt => attempt.final_score));

    // Tren data - ambil 10 terakhir untuk grafik
    const trendData = completedAttempts
      .slice()
      .reverse()
      .slice(0, 10)
      .reverse()
      .map((attempt, index) => ({
        name: `TO-${index + 1}`,
        skor: attempt.final_score,
        avg: averageScores.final,
        twk: attempt.score_twk,
        tiu: attempt.score_tiu,
        tkp: attempt.score_tkp
      }));

    // Score distribution untuk kurva normal
    const scoreDistribution = [];
    const step = 50;
    for (let i = 300; i <= 550; i += step) {
      const count = completedAttempts.filter(
        attempt => attempt.final_score >= i && attempt.final_score < i + step
      ).length;
      scoreDistribution.push({ x: i, y: count });
    }

    const twkPassCount = completedAttempts.filter(attempt => attempt.score_twk >= THRESHOLD_TWK).length;
    const tiuPassCount = completedAttempts.filter(attempt => attempt.score_tiu >= THRESHOLD_TIU).length;
    const tkpPassCount = completedAttempts.filter(attempt => attempt.score_tkp >= THRESHOLD_TKP).length;

    const categoryPassRates = {
      twk: Math.round((twkPassCount / completedAttempts.length) * 100),
      tiu: Math.round((tiuPassCount / completedAttempts.length) * 100),
      tkp: Math.round((tkpPassCount / completedAttempts.length) * 100)
    };

    const recentAttempts = completedAttempts
      .slice()
      .reverse()
      .slice(0, 5);

    const gapAnalysisData = [
      { subject: 'TWK', skorKamu: averageScores.twk, ambangBatas: THRESHOLD_TWK, fullMark: 150 },
      { subject: 'TIU', skorKamu: averageScores.tiu, ambangBatas: THRESHOLD_TIU, fullMark: 175 },
      { subject: 'TKP', skorKamu: averageScores.tkp, ambangBatas: THRESHOLD_TKP, fullMark: 225 },
    ];

    return {
      totalAttempts: completedAttempts.length,
      passRate,
      averageScores,
      bestScore,
      trendData,
      scoreDistribution,
      categoryPassRates,
      recentAttempts,
      gapAnalysisData
    };
  }, [data]);

  if (stats.totalAttempts === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="text-slate-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Belum ada data statistik</h3>
          <p className="text-slate-500">Selesaikan tryout untuk melihat statistik performa Anda</p>
        </div>
      </div>
    );
  }

  // Calculate percentile display
  const percentileText = ranking 
    ? `Anda lebih unggul dari ${Math.round((1 - (ranking.user_rank / ranking.total_users)) * 100)}% peserta lain.`
    : 'Belum ada data peringkat';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Statistik Performa</h1>
          <p className="text-slate-500 mt-1">Analisis mendalam hasil simulasi SKD Anda.</p>
        </div>

        {/* 1. Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Tryout" 
            value={stats.totalAttempts} 
            subtext="Paket Selesai" 
            icon={FileText}
          />
          <StatCard 
            title="Skor Tertinggi" 
            value={stats.bestScore} 
            subtext="/ 550" 
            icon={Trophy} 
          />
          <StatCard 
            title="Rata-rata Skor" 
            value={stats.averageScores.final} 
            subtext="Stabil" 
            icon={Activity} 
          />
          <StatCard 
            title="Tingkat Kelulusan" 
            value={`${Math.round(stats.passRate)}%`} 
            subtext="Passing Grade" 
            icon={CheckCircle2} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* 2. Main Chart: Performance Trend (Takes up 2 cols) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <SectionHeader 
                title="Tren Performa Skor" 
                subtitle="Perbandingan skor Anda vs Rata-rata" 
              />
              <div className="flex gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-slate-800"></span> Skor Kamu
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span> Rata-rata
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSkor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e293b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    domain={[250, 550]} 
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="skor" 
                    stroke="#1e293b" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorSkor)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avg" 
                    stroke="#cbd5e1" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    fill="transparent" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. National Rank Card (Compact) - SESUAI SCREENSHOT */}
          <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-slate-700 rounded-full opacity-50 blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium opacity-90">Peringkat Nasional</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-400/10">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    #{ranking?.user_rank.toLocaleString('id-ID') || '—'}
                  </span>
                  <span className="text-slate-400 text-sm">
                    / {ranking?.total_users.toLocaleString('id-ID') || '—'} user
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Rata-rata Anda</span>
                  <span className="font-semibold">{ranking?.user_average_score || stats.averageScores.final}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full transition-all duration-500" 
                    style={{ width: ranking ? `${Math.min((1 - (ranking.user_rank / ranking.total_users)) * 100, 100)}%` : '0%' }}
                  ></div>
                </div>
                <p className="text-xs text-slate-400 mt-2">{percentileText}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700 relative z-10">
              <h4 className="text-sm font-semibold mb-3">Distribusi Per Kategori</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Wawasan</span>
                    <span className="text-white font-medium">{stats.categoryPassRates.twk}% Lulus</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${stats.categoryPassRates.twk}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Intelegensia</span>
                    <span className="text-white font-medium">{stats.categoryPassRates.tiu}% Lulus</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${stats.categoryPassRates.tiu}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Karakteristik</span>
                    <span className="text-white font-medium">{stats.categoryPassRates.tkp}% Lulus</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${stats.categoryPassRates.tkp}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Secondary Charts: Gap Analysis & Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Gap Analysis */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <SectionHeader 
              title="Gap Nilai Minimum (Passing Grade)" 
              subtitle="Posisi skor rata-rata kamu vs Ambang Batas" 
            />
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.gapAnalysisData} layout="vertical" margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="subject" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    width={40}
                    tick={{ fill: '#64748b', fontWeight: 600 }}
                  />
                  <RechartsTooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="ambangBatas" name="Passing Grade" fill="#e2e8f0" barSize={20} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="skorKamu" name="Skor Kamu" fill="#1e293b" barSize={20} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Score Distribution Simulation */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <SectionHeader 
              title="Distribusi Skor Peserta" 
              subtitle="Posisi kamu dalam kurva peserta" 
            />
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.scoreDistribution}>
                  <defs>
                    <linearGradient id="distGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="x" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10 }}
                  />
                  <RechartsTooltip />
                  <Area 
                    type="monotone" 
                    dataKey="y" 
                    stroke="#6366f1" 
                    fill="url(#distGradient)" 
                    strokeWidth={2} 
                  />
                  <ReferenceLine 
                    x={stats.averageScores.final} 
                    stroke="#1e293b" 
                    strokeDasharray="3 3" 
                    label={{ 
                      position: 'top', 
                      value: 'Kamu', 
                      fill: '#1e293b', 
                      fontSize: 12, 
                      fontWeight: 'bold' 
                    }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 5. Last 5 Tryouts Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">5 Tryout Terakhir</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4 text-center">TWK</th>
                  <th className="px-6 py-4 text-center">TIU</th>
                  <th className="px-6 py-4 text-center">TKP</th>
                  <th className="px-6 py-4 text-center">Total</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentAttempts.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {new Date(row.completed_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className={`px-6 py-4 text-center font-semibold ${row.score_twk >= THRESHOLD_TWK ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {row.score_twk}
                    </td>
                    <td className={`px-6 py-4 text-center font-semibold ${row.score_tiu >= THRESHOLD_TIU ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {row.score_tiu}
                    </td>
                    <td className={`px-6 py-4 text-center font-semibold ${row.score_tkp >= THRESHOLD_TKP ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {row.score_tkp}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800">{row.final_score}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.is_passed 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {row.is_passed ? <CheckCircle2 className="w-3 h-3 mr-1"/> : <XCircle className="w-3 h-3 mr-1"/>}
                        {row.is_passed ? 'Lulus' : 'Tidak Lulus'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default StatisticsView;