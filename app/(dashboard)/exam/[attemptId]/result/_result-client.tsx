'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  BarChart2,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RotateCcw,
  Eye,
  TrendingUp,
  BookOpen,
  GraduationCap,
  Zap,
  Calendar,
  User,
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
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function checkPass(score: number | null, pg: number) {
  return (score || 0) >= pg;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Sub-components                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

function SidebarLink({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-200 ${
        active
          ? 'bg-yellow-400 text-slate-900 font-black shadow-lg shadow-yellow-400/10 translate-x-1'
          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
      }`}
    >
      {icon}
      <span className="text-sm tracking-tight">{label}</span>
    </a>
  );
}

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
      <div className="text-yellow-400">{icon}</div>
      <div className="text-left">
        <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{label}</p>
        <p className="text-xs font-black text-white">{value}</p>
      </div>
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-yellow-400/50 transition-all">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black text-slate-800 tracking-tight group-hover:text-yellow-600 transition-colors">
        {value}
      </p>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  primary = false,
  secondary = false,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  secondary?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm transition-all duration-300 ${
        primary
          ? 'bg-slate-800 text-white shadow-xl shadow-slate-300 hover:bg-slate-700 scale-105 active:scale-95'
          : secondary
          ? 'bg-white border-2 border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-200'
          : 'bg-yellow-400 text-slate-900 shadow-xl shadow-yellow-400/20 hover:bg-yellow-300 scale-105 active:scale-95'
      }`}
    >
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
  userRankInLeaderboard,
}: ResultClientProps) {
  const isPassed = attempt.is_passed;
  const finalScore = attempt.final_score || 0;
  const scoreTWK = attempt.score_twk || 0;
  const scoreTIU = attempt.score_tiu || 0;
  const scoreTKP = attempt.score_tkp || 0;

  // Chart data — progress over attempts
  const chartData = attemptHistory.map((h, i) => ({
    name: `Ujian ${i + 1}`,
    TWK: h.score_twk || 0,
    TIU: h.score_tiu || 0,
    TKP: h.score_tkp || 0,
    Total: h.final_score || 0,
  }));

  // Time analysis
  const questionsWithTime = useMemo(() => {
    return answers.map((answer, index) => {
      let timeSpent = answer.time_spent_seconds || 0;
      if (timeSpent === 0 && answer.answered_at) {
        const prevTime =
          index > 0
            ? new Date(answers[index - 1].answered_at).getTime()
            : new Date(attempt.started_at).getTime();
        const currentTime = new Date(answer.answered_at).getTime();
        timeSpent = Math.round((currentTime - prevTime) / 1000);
      }
      return {
        questionNumber: index + 1,
        question: (answer.questions?.content || '').substring(0, 50) + '...',
        category: answer.questions?.category || '',
        timeSpent: Math.min(timeSpent, 600),
      };
    });
  }, [answers, attempt.started_at]);

  const slowestQuestions = useMemo(
    () => [...questionsWithTime].sort((a, b) => b.timeSpent - a.timeSpent).slice(0, 5),
    [questionsWithTime]
  );

  const questionChartData = slowestQuestions.map((q, i) => ({
    name: `S${q.questionNumber}`,
    durasi: q.timeSpent,
  }));

  const percentile =
    totalParticipants > 0
      ? Math.round(((totalParticipants - packageRank) / totalParticipants) * 100)
      : 0;

  const aboveCount = packageRank - 1;
  const belowCount = totalParticipants - packageRank;

  const scores = [
    {
      category: 'TWK',
      score: scoreTWK,
      min: TWK_CONFIG.PASSING_GRADE,
      maxScore: TWK_CONFIG.MAX_SCORE,
      status: checkPass(scoreTWK, TWK_CONFIG.PASSING_GRADE) ? 'passed' : 'failed',
    },
    {
      category: 'TIU',
      score: scoreTIU,
      min: TIU_CONFIG.PASSING_GRADE,
      maxScore: TIU_CONFIG.MAX_SCORE,
      status: checkPass(scoreTIU, TIU_CONFIG.PASSING_GRADE) ? 'passed' : 'failed',
    },
    {
      category: 'TKP',
      score: scoreTKP,
      min: TKP_CONFIG.PASSING_GRADE,
      maxScore: TKP_CONFIG.MAX_SCORE,
      status: checkPass(scoreTKP, TKP_CONFIG.PASSING_GRADE) ? 'passed' : 'failed',
    },
  ];

  const completedDate = attempt.completed_at
    ? new Date(attempt.completed_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  const completedTime = attempt.completed_at
    ? new Date(attempt.completed_at).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const difficultyLabel: Record<string, string> = {
    mudah: 'Mudah',
    sedang: 'Sedang',
    sulit: 'Sulit',
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <main className="flex-1 p-6 md:p-10">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Hasil <span className="text-yellow-500">Simulasi</span>
            </h1>
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <Calendar size={14} />
              <span>
                Dikerjakan pada {completedDate}
                {completedTime && ` • ${completedTime} WIB`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <Link
              href={`/exam/${attemptId}/review`}
              className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors"
            >
              Bedah Pembahasan
            </Link>
          </div>
        </header>

        {/* ── HERO SCORE CARD ─────────────────────────────────────────────── */}
        <div className="mb-8">

          {/* Full-width hero */}
          <section className="bg-slate-800 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200 relative overflow-hidden text-white mb-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-[80px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] -ml-24 -mb-24" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              {/* Score circle */}
              <div className="relative flex-shrink-0 w-48 h-48">
                {/* Track ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="88" stroke="#334155" strokeWidth="14" fill="transparent" />
                  <circle
                    cx="100" cy="100" r="88"
                    stroke={isPassed ? '#22c55e' : '#ef4444'}
                    strokeWidth="14"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - finalScore / 550)}`}
                    style={{ filter: isPassed ? 'drop-shadow(0 0 8px rgba(34,197,94,0.6))' : 'drop-shadow(0 0 8px rgba(239,68,68,0.6))' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="block text-5xl font-black text-white leading-none">{finalScore}</span>
                  <span className={`text-[10px] font-black tracking-[0.2em] uppercase mt-1 ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                    Skor Total
                  </span>
                </div>
              </div>

              {/* Text side */}
              <div className="flex-1 text-center md:text-left">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] mb-4 border ${
                  isPassed
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                }`}>
                  {isPassed ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {isPassed ? 'Status: Lulus Passing Grade' : 'Status: Belum Lulus Passing Grade'}
                </div>

                <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
                  {isPassed
                    ? <>Selamat, <span className="text-yellow-400">Kamu Lulus!</span></>
                    : <>Terus Berjuang! <span className="text-yellow-400">Jangan Menyerah.</span></>}
                </h2>
                <p className="text-slate-400 text-base font-medium leading-relaxed max-w-md">
                  {isPassed
                    ? 'Kamu berhasil melewati ambang batas minimum. Pertahankan dan tingkatkan terus!'
                    : 'Hasil skor kamu masih di bawah ambang batas minimum. Jangan berkecil hati, mari kita bedah kelemahanmu.'}
                </p>

                <div className="flex flex-wrap gap-4 mt-8">
                  <InfoPill icon={<Clock size={16} />} label="Durasi" value={`${duration} menit`} />
                  <InfoPill
                    icon={<TrendingUp size={16} />}
                    label="Kesulitan"
                    value={difficultyLabel[packageInfo?.difficulty || ''] || 'Sedang'}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Score cards — TWK / TIU / TKP only */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {scores.map((s) => (
              <div
                key={s.category}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:border-yellow-400 transition-colors group flex flex-col justify-between"
              >
                <div>
                  <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">
                    {s.category}
                  </p>
                  <h4 className="text-2xl font-black text-slate-800 leading-none">{s.score}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">/ {s.maxScore}</p>
                </div>
                <div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 mb-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        s.status === 'passed' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min((s.score / s.min) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      Min: <span className="text-slate-700">{s.min}</span>
                    </p>
                    <div className={`w-6 h-6 rounded-xl flex items-center justify-center ${
                      s.status === 'passed' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'
                    }`}>
                      {s.status === 'passed' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ranking card — full width below scores */}
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <h3 className="font-black text-slate-800 mb-6 uppercase tracking-widest text-xs text-center">
              Peringkat Kamu
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Circle badge */}
              <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center mx-auto md:mx-0">
                <div className="absolute inset-0 bg-yellow-400/10 rounded-full animate-ping" />
                <div className="relative w-32 h-32 bg-slate-800 rounded-full border-8 border-yellow-400 flex items-center justify-center shadow-xl shadow-yellow-400/20">
                  <div className="text-center">
                    <span className="block text-4xl font-black text-white">#{packageRank}</span>
                    <span className="text-[8px] font-black text-yellow-400 uppercase tracking-widest">
                      Dari {totalParticipants}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detail boxes */}
              <div className="flex-1 w-full">
                <p className="text-sm font-bold text-slate-400 mb-4 text-center md:text-left">
                  Kamu berada di{' '}
                  <span className="text-slate-800 font-black italic">Top {percentile}%</span>{' '}
                  dari semua peserta paket ini.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <DetailBox label="Posisi" value={`#${packageRank}`} />
                  <DetailBox label="Persentil" value={`${percentile}%`} />
                  <DetailBox label="Di Atas" value={`${aboveCount} Orang`} />
                  <DetailBox label="Di Bawah" value={`${Math.max(0, belowCount)} Orang`} />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── ANALYTICS ───────────────────────────────────────────────────── */}
        <div className="space-y-8">

          {/* Chart + Detail Soal — side by side, same row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Trend chart — always show, 8/12 */}
            <section className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-xl text-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                    <TrendingUp size={20} />
                  </div>
                  Analisis Progres Nilai
                </h3>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-500">
                    <span className="w-6 h-1 bg-slate-800 rounded-full inline-block" />
                    Total
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-slate-400">
                    <span className="w-6 h-0.5 border-t-2 border-dashed border-slate-300 inline-block" />
                    TKP
                  </span>
                </div>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.length > 0 ? chartData : [{ name: 'Ujian 1', Total: finalScore, TKP: scoreTKP }]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }} dx={-15} domain={[0, 550]} />
                    <Tooltip
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                      formatter={(value: number, name: string) => [value, name === 'Total' ? 'Total' : name]}
                    />
                    <Line type="monotone" dataKey="Total" stroke="#1E293B" strokeWidth={5} dot={{ r: 6, fill: '#FACC15', strokeWidth: 3, stroke: '#1E293B' }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="TKP" stroke="#CBD5E1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Detail Soal — 4/12, beside chart */}
            {answers.length > 0 && (
              <section className="lg:col-span-4 bg-slate-800 rounded-[2.5rem] p-8 border border-slate-700 shadow-xl overflow-hidden relative">
                <div className="absolute -right-6 -bottom-6 text-yellow-400/10 rotate-12">
                  <BookOpen size={120} />
                </div>
                <h3 className="font-bold text-white mb-6 relative z-10">Detail Soal</h3>
                <div className="space-y-3 relative z-10 max-h-[320px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 transparent' }}>
                  {answers.slice(0, 20).map((a, i) => (
                    <div key={a.id} className="p-4 bg-slate-700/40 rounded-2xl border border-slate-600 hover:border-yellow-400/50 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                          a.questions?.category === 'TWK' ? 'bg-blue-400 text-white'
                          : a.questions?.category === 'TIU' ? 'bg-green-400 text-white'
                          : 'bg-yellow-400 text-slate-900'
                        }`}>
                          {a.questions?.category || '-'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">#{i + 1}</span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium line-clamp-2 group-hover:text-white">
                        {a.questions?.content
                          ? a.questions.content.substring(0, 80) + '...'
                          : 'Soal tidak tersedia'}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Leaderboard + Time Analysis — side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Leaderboard */}
            <section className="bg-slate-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Trophy size={100} />
              </div>
              <h3 className="font-bold text-lg mb-6 flex items-center gap-3 relative z-10 text-yellow-400 uppercase tracking-widest">
                <Trophy size={20} fill="currentColor" />
                Leaderboard
              </h3>
              <div className="space-y-3 relative z-10 max-h-[320px] overflow-y-auto pr-1">
                {leaderboard.slice(0, 10).map((item, idx) => {
                  const isMe = item.user_id === userId;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center p-3 rounded-2xl transition-all border ${
                        isMe ? 'bg-white/10 border-yellow-400/50' : 'bg-slate-700/30 border-transparent'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black mr-3 ${
                        idx === 0 ? 'bg-yellow-400 text-slate-900' : 'bg-slate-600 text-slate-300'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">
                          {item.profiles?.full_name || 'Anonymous'}
                          {isMe && <span className="text-yellow-400 ml-1">(Anda)</span>}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {item.completed_at
                            ? new Date(item.completed_at).toLocaleDateString('id-ID')
                            : '-'}
                        </p>
                      </div>
                      <div className="text-base font-black text-yellow-400">{item.final_score || 0}</div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Time Analysis */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
              <h3 className="font-black text-slate-800 mb-6 uppercase tracking-widest text-sm flex items-center gap-2">
                <Clock className="text-yellow-500" size={18} />
                Manajemen Waktu
              </h3>
              {slowestQuestions.length > 0 && slowestQuestions.some(q => q.timeSpent > 0) ? (
                <>
                  <div className="h-[180px] w-full mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={questionChartData}>
                        <Bar dataKey="durasi" radius={[6, 6, 0, 0]}>
                          {questionChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#1E293B' : '#E2E8F0'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {slowestQuestions.slice(0, 3).map((q, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <span className="text-xs font-bold text-slate-600">Soal #{q.questionNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-lg font-black ${
                          q.category === 'TWK' ? 'bg-blue-100 text-blue-700'
                          : q.category === 'TIU' ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                        }`}>{q.category}</span>
                        <span className="text-xs font-black text-orange-600">{formatTime(q.timeSpent)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-slate-400 text-sm text-center py-8">Data waktu belum tersedia</p>
              )}
            </section>
          </div>

          {/* Riwayat + Pelajari Materi — full width, side by side */}
          {lastThreeAttempts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Riwayat — 8/12 */}
              <section className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm overflow-x-auto">
                <h3 className="font-black text-slate-800 mb-8 flex items-center justify-between">
                  <span>Riwayat Percobaan</span>
                  <span className="text-xs text-slate-400 font-medium">3 Terakhir</span>
                </h3>
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="text-left pb-4">Tanggal</th>
                      <th className="text-center pb-4">TWK</th>
                      <th className="text-center pb-4">TIU</th>
                      <th className="text-center pb-4">TKP</th>
                      <th className="text-center pb-4">Total</th>
                      <th className="text-right pb-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {lastThreeAttempts.map((h, i) => {
                      const passed =
                        checkPass(h.score_twk, TWK_CONFIG.PASSING_GRADE) &&
                        checkPass(h.score_tiu, TIU_CONFIG.PASSING_GRADE) &&
                        checkPass(h.score_tkp, TKP_CONFIG.PASSING_GRADE);
                      return (
                        <tr key={i} className="group hover:bg-slate-50 transition-colors">
                          <td className="py-4 text-sm font-bold text-slate-700">
                            {h.completed_at
                              ? new Date(h.completed_at).toLocaleDateString('id-ID')
                              : '-'}
                          </td>
                          <td className="py-4 text-center text-sm font-medium text-slate-500">{h.score_twk || 0}</td>
                          <td className="py-4 text-center text-sm font-medium text-slate-500">{h.score_tiu || 0}</td>
                          <td className="py-4 text-center text-sm font-medium text-slate-500">{h.score_tkp || 0}</td>
                          <td className="py-4 text-center text-sm font-black text-slate-800">{h.final_score || 0}</td>
                          <td className="py-4 text-right">
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter ${
                              passed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                            }`}>
                              {passed ? 'LULUS' : 'TIDAK LULUS'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>

              {/* Pelajari Materi — 4/12 */}
              <Link
                href="/materi"
                className="lg:col-span-4 bg-slate-800 rounded-[2.5rem] p-8 border border-slate-700 shadow-xl overflow-hidden relative flex flex-col justify-between group hover:border-yellow-400/40 transition-all"
              >
                <div className="absolute -right-6 -bottom-6 text-yellow-400/10 rotate-12 pointer-events-none">
                  <BookOpen size={130} />
                </div>
                <div className="relative z-10">
                  <div className="w-11 h-11 bg-yellow-400 rounded-2xl flex items-center justify-center text-slate-900 mb-5 shadow-lg shadow-yellow-400/20 group-hover:scale-110 transition-transform">
                    <BookOpen size={22} />
                  </div>
                  <h4 className="text-xl font-black text-white mb-2 leading-snug">
                    Pelajari <span className="text-yellow-400">Materi</span>
                  </h4>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    Perkuat pemahaman kamu dengan materi TWK, TIU, dan TKP lengkap.
                  </p>
                </div>
                <div className="relative z-10 mt-8">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-slate-900 rounded-2xl text-sm font-black group-hover:bg-yellow-300 transition-colors shadow-md">
                    Lihat Materi
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* ── CTA BOTTOM ──────────────────────────────────────────────────── */}
        <div className="mt-12 bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm overflow-hidden relative">
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
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <ActionButton icon={<Eye size={18} />} label="Bedah Pembahasan" primary href={`/exam/${attemptId}/review`} />
                <ActionButton icon={<RotateCcw size={18} />} label="Ulangi Simulasi" href="/packages" />
                <ActionButton icon={<ArrowLeft size={18} />} label="Ke Dashboard" secondary href="/dashboard" />
              </div>
            </div>

            <div className="hidden lg:block w-56 h-56 bg-slate-800 rounded-[2.5rem] relative shadow-2xl shadow-slate-300 overflow-hidden border-4 border-white rotate-3 hover:rotate-0 transition-transform duration-300 group">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center text-slate-900 mb-4 shadow-xl shadow-yellow-400/30">
                  <GraduationCap size={28} />
                </div>
                <p className="text-white font-black text-base">SIAP JADI ASN 2026</p>
                <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest mt-2 underline">
                  Mulai Belajar
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}