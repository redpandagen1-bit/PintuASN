'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Eye,
  ArrowLeft,
  TrendingUp,
  BookOpen,
  GraduationCap,
  Timer,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { TWK_CONFIG, TIU_CONFIG, TKP_CONFIG } from '@/constants/scoring';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Types                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */

interface AttemptHistory {
  final_score: number | null;
  score_twk: number | null;
  score_tiu: number | null;
  score_tkp: number | null;
  completed_at: string | null;
}

interface LeaderboardItem {
  id: string;
  rank: number;
  user_id: string;
  final_score: number | null;
  completed_at: string | null;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

interface AnswerData {
  id: string;
  answered_at: string;
  time_spent_seconds: number | null;
  questions: { id: string; content: string | null; category: string } | null;
}

interface ResultClientProps {
  attemptId: string;
  attempt: {
    id: string;
    user_id: string;
    final_score: number | null;
    score_twk: number | null;
    score_tiu: number | null;
    score_tkp: number | null;
    is_passed: boolean | null;
    started_at: string;
    completed_at: string | null;
  };
  packageInfo: { id: string; title: string | null; description: string | null; difficulty: string } | null;
  leaderboard: LeaderboardItem[];
  packageRank: number;
  totalParticipants: number;
  attemptHistory: AttemptHistory[];
  lastThreeAttempts: AttemptHistory[];
  answers: AnswerData[];
  duration: number;
  userId: string;
  userRankInLeaderboard?: number;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}d`;
}

function checkPass(score: number | null, pg: number) {
  return (score || 0) >= pg;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Reusable tiny components                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

function ActionButton({
  icon,
  label,
  variant = 'default',
  href,
}: {
  icon: React.ReactNode;
  label: string;
  variant?: 'primary' | 'default' | 'ghost';
  href: string;
}) {
  const base = 'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200';
  const styles = {
    primary: `${base} bg-slate-800 text-white hover:bg-slate-700 shadow-sm`,
    default: `${base} bg-yellow-400 text-slate-900 hover:bg-yellow-300 shadow-sm shadow-yellow-400/20`,
    ghost:   `${base} bg-white border border-slate-200 text-slate-600 hover:bg-slate-50`,
  };
  return (
    <Link href={href} className={styles[variant]}>
      {icon}
      {label}
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Main Component                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

export default function ResultClient({
  attemptId,
  attempt,
  packageInfo,
  leaderboard,
  packageRank,
  totalParticipants,
  attemptHistory,
  lastThreeAttempts,
  answers,
  duration,
  userId,
}: ResultClientProps) {
  const isPassed    = attempt.is_passed;
  const finalScore  = attempt.final_score  || 0;
  const scoreTWK    = attempt.score_twk    || 0;
  const scoreTIU    = attempt.score_tiu    || 0;
  const scoreTKP    = attempt.score_tkp    || 0;

  const percentile  = totalParticipants > 0
    ? Math.round(((totalParticipants - packageRank) / totalParticipants) * 100)
    : 0;

  /* chart data */
  const chartData = attemptHistory.map((h, i) => ({
    name: `#${i + 1}`,
    Total: h.final_score || 0,
  }));
  if (chartData.length === 0) chartData.push({ name: '#1', Total: finalScore });

  /* time analysis */
  const slowestQuestions = useMemo(() => {
    const withTime = answers.map((a, i) => {
      let t = a.time_spent_seconds || 0;
      if (t === 0 && a.answered_at) {
        const prev = i > 0
          ? new Date(answers[i - 1].answered_at).getTime()
          : new Date(attempt.started_at).getTime();
        t = Math.round((new Date(a.answered_at).getTime() - prev) / 1000);
      }
      return {
        num: i + 1,
        category: a.questions?.category || '-',
        content: a.questions?.content || '',
        time: Math.min(t, 600),
      };
    });
    return [...withTime].sort((a, b) => b.time - a.time).slice(0, 5);
  }, [answers, attempt.started_at]);

  const hasTimeData = slowestQuestions.some(q => q.time > 0);

  const timeChartData = slowestQuestions.map(q => ({
    name: `S${q.num}`,
    detik: q.time,
  }));

  /* scores config */
  const scoreRows = [
    { label: 'TWK', score: scoreTWK, min: TWK_CONFIG.PASSING_GRADE, max: TWK_CONFIG.MAX_SCORE },
    { label: 'TIU', score: scoreTIU, min: TIU_CONFIG.PASSING_GRADE, max: TIU_CONFIG.MAX_SCORE },
    { label: 'TKP', score: scoreTKP, min: TKP_CONFIG.PASSING_GRADE, max: TKP_CONFIG.MAX_SCORE },
  ];

  const completedDate = attempt.completed_at
    ? new Date(attempt.completed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ══ HERO — score card, title, dan tombol di dalam ══════════════════ */}
      <section className="bg-slate-900 relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-yellow-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-sky-500/6 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-10">

          {/* title row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">
                {completedDate}
              </p>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Hasil <span className="text-yellow-400">Simulasi</span>
              </h1>
              {packageInfo?.title && (
                <p className="text-slate-400 text-sm mt-0.5">{packageInfo.title}</p>
              )}
            </div>
            <Link
              href={`/exam/${attemptId}/review`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-xl text-sm font-bold transition-colors flex-shrink-0"
            >
              <Eye size={15} />
              Lihat Pembahasan
            </Link>
          </div>

          {/* score + TWK/TIU/TKP row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

            {/* total score circle */}
            <div className="md:col-span-2 bg-white/5 border border-white/8 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <div className="relative w-36 h-36 mb-4">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 144 144">
                  <circle cx="72" cy="72" r="62" stroke="#334155" strokeWidth="10" fill="transparent" />
                  <circle
                    cx="72" cy="72" r="62"
                    stroke={isPassed ? '#22c55e' : '#f87171'}
                    strokeWidth="10"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 62}`}
                    strokeDashoffset={`${2 * Math.PI * 62 * (1 - finalScore / 550)}`}
                    style={{ filter: isPassed ? 'drop-shadow(0 0 6px rgba(34,197,94,.5))' : 'drop-shadow(0 0 6px rgba(248,113,113,.5))' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-white leading-none">{finalScore}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">/ 550</span>
                </div>
              </div>

              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                isPassed
                  ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
                  : 'bg-rose-500/15 border-rose-500/25 text-rose-400'
              }`}>
                {isPassed ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                {isPassed ? 'Lulus Passing Grade' : 'Belum Lulus Passing Grade'}
              </div>

              <p className="text-slate-300 text-sm font-semibold mt-3 leading-snug">
                {isPassed
                  ? 'Pertahankan dan tingkatkan terus!'
                  : 'Jangan menyerah, pelajari pembahasannya!'}
              </p>

              <div className="flex items-center gap-1.5 mt-3 text-slate-400 text-xs font-medium">
                <Clock size={12} />
                Durasi: <span className="text-white font-bold">{duration} menit</span>
              </div>
            </div>

            {/* TWK / TIU / TKP */}
            <div className="md:col-span-3 grid grid-cols-3 gap-3">
              {scoreRows.map(({ label, score, min, max }) => {
                const passed  = score >= min;
                const pct     = Math.min((score / max) * 100, 100);
                const minPct  = Math.min((min / max) * 100, 100);
                return (
                  <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-widest">
                        {label}
                      </span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-end">
                      <span className="text-3xl font-extrabold text-white leading-none">{score}</span>
                      <span className="text-[11px] text-slate-400 font-medium mt-0.5">dari {max}</span>

                      {/* progress bar */}
                      <div className="relative w-full h-2 bg-slate-700 rounded-full mt-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${passed ? 'bg-emerald-400' : 'bg-rose-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                        {/* min marker */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-white/40"
                          style={{ left: `${minPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-slate-500">Nilai kamu</span>
                        <span className="text-[10px] text-slate-400">Min <span className="text-white font-bold">{min}</span></span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* info cards row 2 */}
              <div className="col-span-3 grid grid-cols-2 gap-3">
                {/* peringkat */}
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl border-2 border-yellow-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-base font-extrabold text-white">#{packageRank}</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-yellow-400 uppercase tracking-wide">
                      Peringkat kamu dalam paket ini
                    </p>
                    <p className="text-white text-sm font-bold mt-0.5">
                      Top {percentile}% dari {totalParticipants} peserta
                    </p>
                  </div>
                </div>

                {/* progress trend mini */}
                <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Tren Skor</p>
                  {chartData.length > 1 ? (
                    <div className="h-14">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <Line type="monotone" dataKey="Total" stroke="#facc15" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs pt-2">Kerjakan lebih banyak soal untuk melihat tren.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ ANALYTICS SECTION ══════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Row 1: Progress chart + Leaderboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Progress chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-slate-500" />
              <h3 className="font-bold text-slate-800 text-sm">Progres Nilai per Percobaan</h3>
            </div>
            {chartData.length > 1 ? (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} domain={[0, 550]} width={30} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,.08)', fontSize: 12 }}
                      formatter={(v: number) => [v, 'Skor Total']}
                    />
                    <Line type="monotone" dataKey="Total" stroke="#1E293B" strokeWidth={2.5} dot={{ r: 4, fill: '#FACC15', strokeWidth: 2, stroke: '#1E293B' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center">
                <TrendingUp className="h-8 w-8 text-slate-200 mb-2" />
                <p className="text-slate-400 text-sm">Belum cukup data untuk menampilkan tren.</p>
                <p className="text-slate-300 text-xs mt-1">Kerjakan paket ini lagi untuk melihat perkembanganmu.</p>
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-4 w-4 text-yellow-400" fill="currentColor" />
              <h3 className="font-bold text-white text-sm">Leaderboard Paket Ini</h3>
            </div>
            <div className="space-y-1.5 overflow-y-auto flex-1" style={{ maxHeight: 220 }}>
              {leaderboard.slice(0, 10).map((item, idx) => {
                const isMe = item.user_id === userId;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                      isMe ? 'bg-yellow-400/10 border border-yellow-400/25' : 'hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                      idx === 0 ? 'bg-yellow-400 text-slate-900'
                      : idx === 1 ? 'bg-slate-400 text-white'
                      : idx === 2 ? 'bg-amber-700 text-white'
                      : 'bg-slate-700 text-slate-300'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className="flex-1 text-sm font-medium text-slate-200 truncate">
                      {item.profiles?.full_name || 'Anonymous'}
                      {isMe && <span className="text-yellow-400 ml-1 text-xs">(Kamu)</span>}
                    </span>
                    <span className="text-sm font-extrabold text-yellow-400 flex-shrink-0">
                      {item.final_score || 0}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: 5 soal waktu terlama */}
        {hasTimeData && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Timer className="h-4 w-4 text-slate-500" />
              <h3 className="font-bold text-slate-800 text-sm">5 Soal dengan Pengerjaan Waktu Terlama</h3>
              <span className="text-xs text-slate-400 font-medium ml-auto">Soal-soal ini perlu lebih banyak latihan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {/* Bar chart */}
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeChartData} barSize={28}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} width={28}
                      tickFormatter={(v) => `${Math.floor(v / 60)}m`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.08)', fontSize: 12 }}
                      formatter={(v: number) => [formatTime(v), 'Waktu']}
                    />
                    <Bar dataKey="detik" radius={[6, 6, 0, 0]}>
                      {timeChartData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? '#1E293B' : '#E2E8F0'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* List */}
              <div className="space-y-2">
                {slowestQuestions.map((q, i) => {
                  const catColor = q.category === 'TWK'
                    ? 'bg-sky-100 text-sky-700'
                    : q.category === 'TIU'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-violet-100 text-violet-700';
                  return (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                      <span className="text-xs font-bold text-slate-400 w-14 flex-shrink-0">
                        Soal #{q.num}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase flex-shrink-0 ${catColor}`}>
                        {q.category}
                      </span>
                      <span className="text-xs text-slate-500 flex-1 truncate">
                        {q.content ? q.content.substring(0, 55) + '...' : '—'}
                      </span>
                      <span className="text-xs font-extrabold text-orange-500 flex-shrink-0 flex items-center gap-1">
                        <Clock size={11} />
                        {formatTime(q.time)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Row 3: Riwayat percobaan */}
        {lastThreeAttempts.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Riwayat Percobaan</h3>
              <span className="text-xs text-slate-400">3 terakhir di paket ini</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="text-left pb-3">Tanggal</th>
                    <th className="text-center pb-3">TWK</th>
                    <th className="text-center pb-3">TIU</th>
                    <th className="text-center pb-3">TKP</th>
                    <th className="text-center pb-3">Total</th>
                    <th className="text-right pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {lastThreeAttempts.map((h, i) => {
                    const p =
                      checkPass(h.score_twk, TWK_CONFIG.PASSING_GRADE) &&
                      checkPass(h.score_tiu, TIU_CONFIG.PASSING_GRADE) &&
                      checkPass(h.score_tkp, TKP_CONFIG.PASSING_GRADE);
                    return (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 font-semibold text-slate-700 text-xs">
                          {h.completed_at ? new Date(h.completed_at).toLocaleDateString('id-ID') : '-'}
                        </td>
                        <td className="py-3 text-center text-xs text-slate-500">{h.score_twk || 0}</td>
                        <td className="py-3 text-center text-xs text-slate-500">{h.score_tiu || 0}</td>
                        <td className="py-3 text-center text-xs text-slate-500">{h.score_tkp || 0}</td>
                        <td className="py-3 text-center text-sm font-extrabold text-slate-800">{h.final_score || 0}</td>
                        <td className="py-3 text-right">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-tight ${
                            p ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                          }`}>
                            {p ? 'Lulus' : 'Belum Lulus'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ CTA — JANGAN DIUBAH ════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 skew-x-12 -mr-20" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block px-4 py-2 bg-yellow-400 rounded-2xl text-slate-900 font-black text-sm mb-4 shadow-lg shadow-yellow-400/20">
                Tips Jitu ✨
              </div>
              <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">
                Ulangi & Tingkatkan <span className="text-yellow-500">Skor Kamu</span>
              </h3>
              <p className="text-slate-500 font-medium max-w-lg mb-8">
                Review pembahasan setiap soal yang salah agar kamu memahami pola soal lebih baik di simulasi berikutnya.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <ActionButton icon={<Eye size={16} />} label="Bedah Pembahasan" variant="primary" href={`/exam/${attemptId}/review`} />
                <ActionButton icon={<RotateCcw size={16} />} label="Ulangi Simulasi" variant="default" href="/packages" />
                <ActionButton icon={<ArrowLeft size={16} />} label="Ke Dashboard" variant="ghost" href="/dashboard" />
              </div>
            </div>

            <div className="hidden lg:block w-48 h-48 bg-slate-800 rounded-[2rem] relative shadow-xl shadow-slate-200 overflow-hidden border-4 border-white rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-5">
                <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-slate-900 mb-3 shadow-lg shadow-yellow-400/30">
                  <GraduationCap size={24} />
                </div>
                <p className="text-white font-black text-sm">SIAP JADI ASN 2026</p>
                <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest mt-2 underline">
                  Mulai Belajar
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}