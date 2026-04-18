'use client';

// components/mobile/MobileHasilSimulasi.tsx
// Mobile exam result — mirrors desktop features, mobile-optimised

import { useMemo } from 'react';
import Link from 'next/link';
import {
  CheckCircle2, XCircle, Trophy, Clock, TrendingUp,
  AlertTriangle, Timer, Lock, BookOpen, Eye, RotateCcw,
} from 'lucide-react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, LineChart, Line, CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';
import { TWK_CONFIG, TIU_CONFIG, TKP_CONFIG } from '@/constants/scoring';
import { getSlowestQuestions, getWrongAnalysis, calcPercentile } from '@/lib/scoring/analysis';
import type { SubscriptionTier } from '@/lib/subscription-utils';

// ── Types ─────────────────────────────────────────────────────

interface AttemptHistory {
  final_score:  number | null;
  score_twk:    number | null;
  score_tiu:    number | null;
  score_tkp:    number | null;
  completed_at: string | null;
}

interface LeaderboardItem {
  id:           string;
  rank:         number;
  user_id:      string;
  final_score:  number | null;
  completed_at: string | null;
  profiles:     { full_name: string | null; avatar_url: string | null } | null;
}

interface AnswerData {
  id: string;
  answered_at: string;
  time_spent_seconds: number | null;
  choice_id?: string | null;
  is_correct?: boolean | null;
  tkp_score?: number | null;
  questions: { id: string; content: string | null; category: string } | null;
}

interface MobileHasilSimulasiProps {
  attemptId:          string;
  finalScore:         number | null;
  scoreTwk:           number | null;
  scoreTiu:           number | null;
  scoreTkp:           number | null;
  isPassed:           boolean | null;
  packageRank:        number;
  totalParticipants:  number;
  attemptHistory:     AttemptHistory[];
  lastThreeAttempts:  AttemptHistory[];
  completedAt:        string | null;
  startedAt:          string;
  packageTitle:       string | null;
  packageId?:         string | null;
  leaderboard?:       LeaderboardItem[];
  userId?:            string;
  answers:            AnswerData[];
  duration:           number;
  subscriptionTier:   SubscriptionTier;
}

// ── Helpers ───────────────────────────────────────────────────

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}d`;
}

function checkPass(score: number | null, pg: number) {
  return (score || 0) >= pg;
}

function catColor(cat: string) {
  if (cat === 'TWK') return 'bg-sky-100 text-sky-700';
  if (cat === 'TIU') return 'bg-emerald-100 text-emerald-700';
  return 'bg-violet-100 text-violet-700';
}

// ── LockedSection ─────────────────────────────────────────────

function LockedSection({
  title, icon, children, locked,
}: {
  title: React.ReactNode;
  icon: React.ReactNode;
  children: React.ReactNode;
  locked: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-start gap-2 px-4 pt-4 pb-3">
        <span className="mt-0.5 flex-shrink-0">{icon}</span>
        <span className="font-bold text-slate-800 text-sm flex-1">{title}</span>
        {locked && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">
            <Lock size={9} />Platinum
          </span>
        )}
      </div>
      <div className="relative px-4 pb-4">
        <div className={locked ? 'blur-sm pointer-events-none select-none' : ''}>
          {children}
        </div>
        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-800 flex items-center justify-center shadow-lg">
              <Lock size={18} className="text-yellow-400" />
            </div>
            <div className="text-center px-4">
              <p className="text-sm font-bold text-slate-800">Fitur Eksklusif Platinum</p>
              <p className="text-xs text-slate-500 mt-0.5">Upgrade untuk melihat analisis lengkap</p>
            </div>
            <Link
              href="/beli-paket"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-400 text-slate-900 rounded-xl text-xs font-bold shadow-sm shadow-yellow-400/20"
            >
              Upgrade Platinum →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────

export function MobileHasilSimulasi({
  attemptId,
  finalScore,
  scoreTwk,
  scoreTiu,
  scoreTkp,
  isPassed,
  packageRank,
  totalParticipants,
  attemptHistory,
  lastThreeAttempts,
  completedAt,
  startedAt,
  packageTitle,
  packageId,
  leaderboard = [],
  userId,
  answers,
  duration,
  subscriptionTier,
}: MobileHasilSimulasiProps) {
  const isPlatinum = subscriptionTier === 'platinum';
  const score      = finalScore ?? 0;
  const scoreTWK   = scoreTwk  ?? 0;
  const scoreTIU   = scoreTiu  ?? 0;
  const scoreTKP   = scoreTkp  ?? 0;
  const maxScore   = TWK_CONFIG.MAX_SCORE + TIU_CONFIG.MAX_SCORE + TKP_CONFIG.MAX_SCORE;
  const percentile = calcPercentile(packageRank, totalParticipants);
  const accuracy   = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  // SVG circle
  const r         = 56;
  const circ      = 2 * Math.PI * r;
  const dashOffset = circ * (1 - score / 550);

  // Chart data for trend
  const chartData = attemptHistory.map((h, i) => ({ name: `#${i + 1}`, Total: h.final_score || 0 }));
  if (chartData.length === 0) chartData.push({ name: '#1', Total: score });

  // Wrong analysis
  const wrongAnalysis = useMemo(() => getWrongAnalysis(answers), [answers]);
  const hasWrongData  = answers.some(a => a.is_correct !== undefined);
  const wrongBarData  = [
    { name: 'TWK',  salah: wrongAnalysis.byCategory.TWK, color: '#38bdf8' },
    { name: 'TIU',  salah: wrongAnalysis.byCategory.TIU, color: '#34d399' },
    { name: 'TKP*', salah: wrongAnalysis.byCategory.TKP, color: '#a78bfa' },
  ];

  // Time analysis
  const slowestQuestions = useMemo(
    () => getSlowestQuestions(answers, startedAt),
    [answers, startedAt],
  );
  const hasTimeData   = slowestQuestions.some(q => q.time > 0);
  const timeChartData = slowestQuestions.map(q => ({ name: `S${q.num}`, detik: q.time }));

  // Score rows
  const scoreRows = [
    { label: 'TWK', score: scoreTWK, min: TWK_CONFIG.PASSING_GRADE, max: TWK_CONFIG.MAX_SCORE },
    { label: 'TIU', score: scoreTIU, min: TIU_CONFIG.PASSING_GRADE, max: TIU_CONFIG.MAX_SCORE },
    { label: 'TKP', score: scoreTKP, min: TKP_CONFIG.PASSING_GRADE, max: TKP_CONFIG.MAX_SCORE },
  ];

  const completedDate = completedAt
    ? new Date(completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

  return (
    <main className="pb-16 space-y-4">

      {/* ── Hero — dark bg matching desktop ───────────────────── */}
      <section className="bg-slate-900 relative overflow-hidden mx-3 mt-3 rounded-3xl shadow-xl px-4 pt-6 pb-8">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-sky-500/6 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Top row: date + button */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest mb-0.5">
                {completedDate}
              </p>
              <h1 className="text-lg font-extrabold text-white">
                Hasil <span className="text-yellow-400">Simulasi</span>
              </h1>
              {packageTitle && (
                <p className="text-slate-400 text-xs mt-0.5">{packageTitle}</p>
              )}
            </div>
            <Link
              href={`/exam/${attemptId}/review`}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-yellow-400 text-slate-900 rounded-xl text-xs font-bold flex-shrink-0 shadow-sm"
            >
              <Eye size={13} />
              Lihat Pembahasan
            </Link>
          </div>

          {/* Circle + subject scores side by side */}
          <div className="flex gap-4 items-center">
            {/* SVG Circle progress */}
            <div className="relative flex-shrink-0" style={{ width: 130, height: 130 }}>
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r={r} stroke="#334155" strokeWidth="9" fill="transparent" />
                <circle cx="65" cy="65" r={r}
                  stroke={isPassed ? '#22c55e' : '#f87171'}
                  strokeWidth="9"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={`${circ}`}
                  strokeDashoffset={`${dashOffset}`}
                  style={{
                    filter: isPassed
                      ? 'drop-shadow(0 0 6px rgba(34,197,94,.5))'
                      : 'drop-shadow(0 0 6px rgba(248,113,113,.5))',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white leading-none">{score}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">/ 550</span>
              </div>
            </div>

            {/* Subject breakdown bars */}
            <div className="flex-1 space-y-2.5">
              {scoreRows.map(({ label, score: s, min, max }) => {
                const passed = s >= min;
                const pct    = Math.min((s / max) * 100, 100);
                const minPct = Math.min((min / max) * 100, 100);
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase w-7">{label}</span>
                        <span className="text-sm font-extrabold text-white">{s}</span>
                        <span className="text-[10px] text-slate-500">/{max}</span>
                      </div>
                      <div className={cn(
                        'flex items-center gap-0.5 text-[10px] font-bold',
                        passed ? 'text-emerald-400' : 'text-rose-400',
                      )}>
                        {passed ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        <span>{passed ? 'Lulus' : 'Belum'}</span>
                      </div>
                    </div>
                    <div className="relative w-full h-1.5 bg-slate-700 rounded-full overflow-visible">
                      <div
                        className={cn('h-full rounded-full', passed ? 'bg-emerald-400' : 'bg-rose-400')}
                        style={{ width: `${pct}%` }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white/40"
                        style={{ left: `${minPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Pass/fail badge */}
              <div className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border',
                isPassed
                  ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
                  : 'bg-rose-500/15 border-rose-500/25 text-rose-400',
              )}>
                {isPassed ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                {isPassed ? 'Lulus Passing Grade' : 'Belum Lulus Passing Grade'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Compact Stats: Peringkat · Persentil · Akurasi ────── */}
      <div className="px-4">
        <div className="grid grid-cols-3 divide-x divide-slate-100 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {[
            { icon: '🏆', value: `#${packageRank}`, label: 'Peringkat', sub: `${totalParticipants.toLocaleString('id-ID')} peserta` },
            { icon: '📊', value: `Top ${percentile}%`, label: 'Persentil', sub: 'nasional' },
            { icon: '🎯', value: `${accuracy}%`, label: 'Akurasi', sub: 'dari skor maks' },
          ].map(({ icon, value, label, sub }) => (
            <div key={label} className="flex flex-col items-center py-3 px-1 text-center">
              <span className="text-base mb-1">{icon}</span>
              <span className="text-sm font-extrabold text-slate-800 leading-none">{value}</span>
              <span className="text-[10px] font-semibold text-slate-600 mt-0.5">{label}</span>
              <span className="text-[9px] text-slate-400 mt-0.5">{sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Duration row */}
      <div className="px-4 -mt-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock size={12} />
          <span>Durasi: <span className="font-bold text-slate-600">{duration} menit</span></span>
        </div>
      </div>

      {/* ── Tren Skor — Platinum only ─────────────────────────── */}
      <div className="px-4">
        <LockedSection
          locked={!isPlatinum}
          icon={<TrendingUp className="h-4 w-4 text-slate-500" />}
          title="Progres Nilai per Percobaan"
        >
          {chartData.length > 1 ? (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 10 }} domain={[0, 550]} width={28} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,.08)', fontSize: 12 }}
                    formatter={(v) => [v ?? 0, 'Skor Total']}
                  />
                  <Line
                    type="monotone" dataKey="Total"
                    stroke="#1E293B" strokeWidth={2.5}
                    dot={{ r: 4, fill: '#FACC15', strokeWidth: 2, stroke: '#1E293B' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-center">
              <TrendingUp className="h-8 w-8 text-slate-200 mb-2" />
              <p className="text-slate-400 text-sm">Belum cukup data untuk menampilkan tren.</p>
              <p className="text-slate-300 text-xs mt-1">Kerjakan paket ini lagi untuk melihat perkembanganmu.</p>
            </div>
          )}
        </LockedSection>
      </div>

      {/* ── Leaderboard ───────────────────────────────────────── */}
      {leaderboard.length > 0 && (
        <div className="px-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-yellow-400" fill="currentColor" />
              <h3 className="font-bold text-white text-sm flex-1">Leaderboard Paket Ini</h3>
              <span className="text-xs text-slate-500">Top {Math.min(leaderboard.length, 10)}</span>
            </div>
            <div className="space-y-1">
              {leaderboard.slice(0, 10).map((item, idx) => {
                const isMe = item.user_id === userId;
                const initials = item.profiles?.full_name
                  ? item.profiles.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
                  : '?';
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center gap-2 px-2.5 py-2 rounded-xl',
                      isMe ? 'bg-yellow-400/10 border border-yellow-400/25' : 'hover:bg-slate-800',
                    )}
                  >
                    <div className={cn(
                      'w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-extrabold flex-shrink-0',
                      idx === 0 ? 'bg-yellow-400 text-slate-900'
                      : idx === 1 ? 'bg-slate-400 text-white'
                      : idx === 2 ? 'bg-amber-700 text-white'
                      : 'bg-slate-700 text-slate-300',
                    )}>
                      {idx + 1}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.profiles?.avatar_url
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={item.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                        : <span className="text-[10px] font-bold text-slate-300">{initials}</span>
                      }
                    </div>
                    <span className="flex-1 text-xs font-medium text-slate-200 truncate">
                      {item.profiles?.full_name ?? 'Anonim'}
                      {isMe && <span className="text-yellow-400 ml-1">(Kamu)</span>}
                    </span>
                    <span className="text-sm font-extrabold text-yellow-400 flex-shrink-0">
                      {item.final_score ?? 0}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Analisis Soal Salah — Platinum only ───────────────── */}
      {hasWrongData && (
        <div className="px-4">
          <LockedSection
            locked={!isPlatinum}
            icon={<AlertTriangle className="h-4 w-4 text-rose-500" />}
            title={
              <span>
                Analisis Soal Salah
                <span className="block text-[11px] text-slate-400 font-normal mt-0.5">
                  {wrongAnalysis.totalWrong} salah TWK+TIU · {wrongAnalysis.totalLowTkp} TKP skor rendah
                </span>
              </span>
            }
          >
            <p className="text-xs text-slate-400 mb-3">
              Pelajari soal-soal ini di pembahasan untuk meningkatkan skor pada percobaan berikutnya.
            </p>

            <p className="text-xs font-semibold text-slate-500 mb-2">Jumlah salah per kategori</p>
            <div className="h-32 mb-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wrongBarData} barSize={36}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 11 }} width={22} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.08)', fontSize: 12 }}
                    formatter={(v) => [v ?? 0, 'Soal']}
                  />
                  <Bar dataKey="salah" radius={[6, 6, 0, 0]}>
                    {wrongBarData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 mb-3">*TKP: soal dengan skor &lt; 3</p>
            <div className="flex gap-2 flex-wrap mb-4">
              {wrongBarData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-100 bg-slate-50">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-[11px] font-bold text-slate-600">{d.name}</span>
                  <span className="text-[11px] text-slate-400">{d.salah} soal</span>
                </div>
              ))}
            </div>

            <p className="text-xs font-semibold text-slate-500 mb-2">Daftar soal yang perlu dipelajari</p>
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {wrongAnalysis.topWrong.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-300 mb-2" />
                  <p className="text-sm text-slate-400 font-medium">Semua jawaban benar!</p>
                </div>
              ) : (
                wrongAnalysis.topWrong.map((q, i) => (
                  <div key={i} className="flex items-start gap-2.5 py-2 border-b border-slate-50 last:border-0">
                    <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <XCircle className="w-3 h-3 text-rose-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold text-slate-400">Soal #{q.num}</span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase ${catColor(q.category)}`}>
                          {q.category}
                        </span>
                        {q.category === 'TKP' && q.tkp_score !== null && (
                          <span className="text-[10px] text-slate-400">skor {q.tkp_score}/5</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                        {q.content ? q.content.substring(0, 80) + (q.content.length > 80 ? '…' : '') : '—'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {wrongAnalysis.topWrong.length > 0 && (
              <Link
                href={`/exam/${attemptId}/review`}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 underline underline-offset-2"
              >
                <BookOpen size={12} />
                Lihat semua pembahasan →
              </Link>
            )}
          </LockedSection>
        </div>
      )}

      {/* ── 5 Soal Waktu Terlama — Platinum only ──────────────── */}
      {hasTimeData && (
        <div className="px-4">
          <LockedSection
            locked={!isPlatinum}
            icon={<Timer className="h-4 w-4 text-slate-500" />}
            title="5 Soal dengan Pengerjaan Waktu Terlama"
          >
            <div className="h-36 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeChartData} barSize={28}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 11 }} width={28}
                    tickFormatter={(v) => `${Math.floor(v / 60)}m`} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.08)', fontSize: 12 }}
                    formatter={(v) => [formatTime((v as number) ?? 0), 'Waktu']}
                  />
                  <Bar dataKey="detik" radius={[6, 6, 0, 0]}>
                    {timeChartData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? '#1E293B' : '#E2E8F0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {slowestQuestions.map((q, i) => (
                <div key={i} className="flex items-center gap-2 py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs font-bold text-slate-400 w-14 flex-shrink-0">Soal #{q.num}</span>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase flex-shrink-0 ${catColor(q.category)}`}>
                    {q.category}
                  </span>
                  <span className="text-xs text-slate-500 flex-1 truncate">
                    {q.content ? q.content.substring(0, 45) + '…' : '—'}
                  </span>
                  <span className="text-xs font-extrabold text-orange-500 flex-shrink-0 flex items-center gap-1">
                    <Clock size={11} />{formatTime(q.time)}
                  </span>
                </div>
              ))}
            </div>
          </LockedSection>
        </div>
      )}

      {/* ── Riwayat Percobaan — Platinum only ─────────────────── */}
      {lastThreeAttempts.length > 0 && (
        <div className="px-4">
          <LockedSection
            locked={!isPlatinum}
            icon={<Trophy className="h-4 w-4 text-slate-500" />}
            title={
              <span className="flex items-center justify-between w-full">
                Riwayat Percobaan
                <span className="text-[11px] text-slate-400 font-normal">
                  {lastThreeAttempts.length} percobaan terakhir
                </span>
              </span>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[300px]">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="text-left pb-2.5">Tanggal</th>
                    <th className="text-center pb-2.5">TWK</th>
                    <th className="text-center pb-2.5">TIU</th>
                    <th className="text-center pb-2.5">TKP</th>
                    <th className="text-center pb-2.5">Total</th>
                    <th className="text-right pb-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {lastThreeAttempts.map((h, i) => {
                    const p = checkPass(h.score_twk, TWK_CONFIG.PASSING_GRADE) &&
                      checkPass(h.score_tiu, TIU_CONFIG.PASSING_GRADE) &&
                      checkPass(h.score_tkp, TKP_CONFIG.PASSING_GRADE);
                    return (
                      <tr key={i}>
                        <td className="py-2.5 font-semibold text-slate-700">
                          {h.completed_at
                            ? new Date(h.completed_at).toLocaleDateString('id-ID')
                            : '-'}
                        </td>
                        <td className="py-2.5 text-center text-slate-500">{h.score_twk || 0}</td>
                        <td className="py-2.5 text-center text-slate-500">{h.score_tiu || 0}</td>
                        <td className="py-2.5 text-center text-slate-500">{h.score_tkp || 0}</td>
                        <td className="py-2.5 text-center font-extrabold text-slate-800">{h.final_score || 0}</td>
                        <td className="py-2.5 text-right">
                          <span className={cn(
                            'text-[10px] font-extrabold px-2 py-0.5 rounded-lg uppercase tracking-tight',
                            p ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500',
                          )}>
                            {p ? 'Lulus' : 'Belum'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </LockedSection>
        </div>
      )}

      {/* ── CTA ───────────────────────────────────────────────── */}
      <div className="px-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 skew-x-12 -mr-16 pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-block px-3 py-1.5 bg-yellow-400 rounded-xl text-slate-900 font-black text-xs mb-3 shadow-sm shadow-yellow-400/20">
              Tips Jitu ✨
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2 tracking-tight leading-snug">
              Ulangi & Tingkatkan <span className="text-yellow-500">Skor Kamu</span>
            </h3>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              Review pembahasan setiap soal yang salah agar kamu memahami pola soal lebih baik.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href={`/exam/${attemptId}/review`}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-xl text-sm font-bold"
              >
                <Eye size={15} />Bedah Pembahasan
              </Link>
              <Link
                href={packageId ? `/packages/${packageId}` : '/daftar-tryout'}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 text-slate-900 rounded-xl text-sm font-bold shadow-sm shadow-yellow-400/20"
              >
                <RotateCcw size={15} />Ulangi Simulasi
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Action Buttons — above BottomNav ─────────── */}
      {/* BottomNav ~56-68px, bottom-20 = 80px clears it safely */}
      <div className="fixed bottom-20 left-0 right-0 px-4 flex gap-3 z-40">
        <Link href={`/exam/${attemptId}/review`} className="flex-1">
          <button className="w-full bg-slate-800 text-white font-extrabold py-3.5 rounded-2xl shadow-lg text-sm">
            Bedah Pembahasan
          </button>
        </Link>
        <Link href={packageId ? `/packages/${packageId}` : '/daftar-tryout'} className="flex-1">
          <button className="w-full bg-yellow-400 text-slate-900 font-extrabold py-3.5 rounded-2xl shadow-lg shadow-yellow-400/25 text-sm">
            Ulangi Simulasi
          </button>
        </Link>
      </div>

    </main>
  );
}
