import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  ArrowLeft, Users, Trophy, Target, TrendingUp,
  CheckCircle2, BarChart3,
} from 'lucide-react';

interface StatsPageProps {
  params: Promise<{ id: string }>;
}

async function getPackageStats(packageId: string, userId: string) {
  const supabase = await createAdminClient();

  const [
    { data: pkg },
    { count: totalParticipants },
    { data: allAttempts },
    { data: userBestArr },
  ] = await Promise.all([
    supabase
      .from('packages')
      .select('id, title, description')
      .eq('id', packageId)
      .single(),

    supabase
      .from('attempts')
      .select('user_id', { count: 'exact', head: true })
      .eq('package_id', packageId)
      .eq('status', 'completed'),

    supabase
      .from('attempts')
      .select('final_score, is_passed, user_id, completed_at, profiles(full_name)')
      .eq('package_id', packageId)
      .eq('status', 'completed')
      .order('final_score', { ascending: false })
      .order('completed_at', { ascending: true })
      .limit(20),

    supabase
      .from('attempts')
      .select('final_score, score_twk, score_tiu, score_tkp, is_passed, completed_at')
      .eq('package_id', packageId)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('final_score', { ascending: false })
      .limit(1),
  ]);

  const userBestScore = (userBestArr ?? [])[0]?.final_score ?? 0;

  const { count: higherCount } = await supabase
    .from('attempts')
    .select('*', { count: 'exact', head: true })
    .eq('package_id', packageId)
    .eq('status', 'completed')
    .gt('final_score', userBestScore);

  const userBest = (userBestArr ?? [])[0] ?? null;

  const attempts = allAttempts ?? [];
  const total = totalParticipants ?? 0;
  const passedCount = attempts.filter((a: any) => a.is_passed).length;
  const allScores = attempts.map((a: any) => a.final_score ?? 0);
  const avgScore = allScores.length > 0
    ? Math.round(allScores.reduce((s: number, v: number) => s + v, 0) / allScores.length)
    : 0;

  const userBestAttempt = userBest;
  const userRank = userBestAttempt ? (higherCount ?? 0) + 1 : null;

  // Leaderboard top 20 (attempts already sorted by score desc)
  const leaderboard = attempts.slice(0, 20).map((a: any, idx: number) => {
    const profilesRaw = a.profiles;
    const profile = Array.isArray(profilesRaw) ? profilesRaw[0] : profilesRaw;
    return {
      rank: idx + 1,
      name: profile?.full_name ?? 'Anonymous',
      score: a.final_score ?? 0,
      is_passed: a.is_passed ?? false,
      isMe: a.user_id === userId,
    };
  });

  const passRate = total > 0 ? Math.round((passedCount / attempts.length) * 100) : 0;

  return { pkg, total, avgScore, passRate, userBestAttempt, userRank, leaderboard, passedCount };
}

function StatCard({ icon, label, value, sub, accent = false }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-5 flex items-start gap-4 ${accent ? 'bg-slate-800 text-white' : 'bg-white border border-slate-100 shadow-sm'}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent ? 'bg-white/10' : 'bg-slate-100'}`}>
        {icon}
      </div>
      <div>
        <p className={`text-xs font-semibold mb-0.5 ${accent ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
        <p className={`text-2xl font-extrabold leading-none ${accent ? 'text-white' : 'text-slate-800'}`}>{value}</p>
        {sub && <p className={`text-xs mt-0.5 ${accent ? 'text-slate-400' : 'text-slate-400'}`}>{sub}</p>}
      </div>
    </div>
  );
}

export default async function PackageStatsPage({ params }: StatsPageProps) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { id: packageId } = await params;
  const { pkg, total, avgScore, passRate, userBestAttempt, userRank, leaderboard, passedCount } = await getPackageStats(packageId, userId);

  if (!pkg) redirect('/daftar-tryout');

  const userScore = userBestAttempt?.final_score ?? null;
  const userPassed = userBestAttempt?.is_passed ?? null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <Link
            href="/daftar-tryout"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-colors mb-4"
          >
            <ArrowLeft size={15} />
            Kembali
          </Link>
          <h1 className="text-xl font-extrabold text-white leading-tight">
            Data <span className="text-yellow-400">Paket</span>
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">{pkg.title}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Users size={20} className="text-slate-600" />}
            label="Total Peserta"
            value={total.toLocaleString('id-ID')}
            sub="peserta selesai"
          />
          <StatCard
            icon={<Target size={20} className="text-emerald-600" />}
            label="Tingkat Kelulusan"
            value={`${passRate}%`}
            sub={`${passedCount} lulus`}
          />
          <StatCard
            icon={<TrendingUp size={20} className="text-sky-600" />}
            label="Rata-rata Skor"
            value={avgScore}
            sub="dari 550"
          />
          {userScore !== null ? (
            <StatCard
              icon={<BarChart3 size={20} className="text-yellow-500" />}
              label="Skor Terbaik Kamu"
              value={userScore}
              sub={userPassed ? 'Lulus ✓' : 'Belum lulus'}
              accent
            />
          ) : (
            <StatCard
              icon={<BarChart3 size={20} className="text-slate-400" />}
              label="Skor Terbaik Kamu"
              value="—"
              sub="Belum pernah mengerjakan"
            />
          )}
        </div>

        {/* Your rank */}
        {userRank !== null && userScore !== null && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-yellow-400 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-extrabold text-lg">#{userRank}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-yellow-600 uppercase tracking-wide mb-0.5">Ranking Kamu</p>
              <p className="text-slate-800 font-bold">
                Kamu berada di peringkat <span className="text-yellow-600">#{userRank}</span> dari {total.toLocaleString('id-ID')} peserta
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Berdasarkan skor terbaikmu: <span className="font-bold text-slate-700">{userScore}</span>
              </p>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
            <Trophy size={18} className="text-yellow-500 fill-yellow-500" />
            <h2 className="font-bold text-slate-800">Top 20 Peserta Terbaik</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                  <th className="text-center py-3 px-4 w-14">Rank</th>
                  <th className="text-left py-3 px-4">Peserta</th>
                  <th className="text-center py-3 px-4">Skor</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-400 text-sm">
                      Belum ada peserta yang menyelesaikan paket ini.
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((item) => (
                    <tr
                      key={item.rank}
                      className={`transition-colors ${item.isMe ? 'bg-yellow-50 border-l-2 border-yellow-400' : 'hover:bg-slate-50'}`}
                    >
                      <td className="py-3 px-4 text-center">
                        {item.rank <= 3 ? (
                          <div className={`inline-flex w-8 h-8 rounded-xl items-center justify-center text-sm font-extrabold ${
                            item.rank === 1 ? 'bg-yellow-400 text-slate-900' :
                            item.rank === 2 ? 'bg-slate-400 text-white' :
                            'bg-amber-700 text-white'
                          }`}>
                            {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-slate-500">#{item.rank}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            item.isMe ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.name[0].toUpperCase()}
                          </div>
                          <span className={`text-sm font-semibold ${item.isMe ? 'text-slate-900' : 'text-slate-700'}`}>
                            {item.name}
                            {item.isMe && <span className="ml-1.5 text-[10px] font-bold text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded-full">Kamu</span>}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-base font-extrabold text-slate-800">{item.score}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-tight ${
                          item.is_passed
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-rose-50 text-rose-500'
                        }`}>
                          {item.is_passed ? 'Lulus' : 'Belum'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {leaderboard.length > 0 && (
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center">
                Menampilkan {leaderboard.length} peserta teratas · Total {total.toLocaleString('id-ID')} peserta
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex justify-center pb-4">
          <Link
            href={`/packages/${packageId}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors"
          >
            <CheckCircle2 size={16} />
            Mulai Tryout Ini
          </Link>
        </div>
      </div>
    </div>
  );
}
