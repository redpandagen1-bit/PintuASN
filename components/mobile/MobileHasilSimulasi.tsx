'use client';

// components/mobile/MobileHasilSimulasi.tsx
// Mobile-only exam result — Pathfinder Navy MD3 design

import Link from 'next/link';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TWK_CONFIG, TIU_CONFIG, TKP_CONFIG } from '@/constants/scoring';

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

interface MobileHasilSimulasiProps {
  attemptId:         string;
  finalScore:        number | null;
  scoreTwk:          number | null;
  scoreTiu:          number | null;
  scoreTkp:          number | null;
  isPassed:          boolean | null;
  packageRank:       number;
  totalParticipants: number;
  attemptHistory:    AttemptHistory[];
  completedAt:       string | null;
  packageTitle:      string | null;
  leaderboard?:      LeaderboardItem[];
  userId?:           string;
}

// ── Helpers ───────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function calcAccuracy(scoreTwk: number | null, scoreTiu: number | null, scoreTkp: number | null) {
  const total    = (scoreTwk ?? 0) + (scoreTiu ?? 0) + (scoreTkp ?? 0);
  const maxTotal = TWK_CONFIG.MAX_SCORE + TIU_CONFIG.MAX_SCORE + TKP_CONFIG.MAX_SCORE;
  return maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
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
  packageTitle,
  leaderboard = [],
  userId,
}: MobileHasilSimulasiProps) {
  const accuracy  = calcAccuracy(scoreTwk, scoreTiu, scoreTkp);
  const score     = finalScore ?? 0;
  const maxScore  = TWK_CONFIG.MAX_SCORE + TIU_CONFIG.MAX_SCORE + TKP_CONFIG.MAX_SCORE; // 550
  const scorePct  = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  // Circular progress ring via conic-gradient
  const ringStyle = {
    background: `conic-gradient(#f9bd22 ${scorePct}%, #eff4ff 0)`,
  };

  // Trend chart: last 5 attempts
  const chartData = attemptHistory.slice(-5);
  const maxBar    = chartData.length ? Math.max(...chartData.map(a => a.final_score ?? 0)) : 550;

  // Subject rows
  const subjects = [
    { key: 'TWK', label: 'Wawasan Kebangsaan', score: scoreTwk, max: TWK_CONFIG.MAX_SCORE, min: TWK_CONFIG.PASSING_GRADE, color: 'bg-blue-100 text-blue-700'   },
    { key: 'TIU', label: 'Intelegensia Umum',  score: scoreTiu, max: TIU_CONFIG.MAX_SCORE, min: TIU_CONFIG.PASSING_GRADE, color: 'bg-purple-100 text-purple-700' },
    { key: 'TKP', label: 'Karakteristik Pribadi', score: scoreTkp, max: TKP_CONFIG.MAX_SCORE, min: TKP_CONFIG.PASSING_GRADE, color: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <main className="pb-40 px-5 space-y-6 max-w-md mx-auto">

      {/* ── Score Hero ────────────────────────────────────────── */}
      <section className="mt-4 relative overflow-hidden bg-md-primary rounded-[2rem] p-8 text-white shadow-md3-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-md-secondary opacity-20 blur-3xl -mr-16 -mt-16" />
        <div className="relative z-10 flex flex-col items-center">

          {/* Circular progress */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full opacity-20" style={ringStyle} />
            <div className="absolute inset-4 rounded-full bg-md-primary flex flex-col items-center justify-center">
              <span className="text-5xl font-extrabold text-md-secondary-container"
                style={{ fontFamily: 'var(--font-jakarta)' }}>
                {score}
              </span>
              <span className="text-md-on-primary-container text-xs font-medium tracking-widest uppercase mt-1">
                Total Skor
              </span>
            </div>
          </div>

          {/* Pass/fail badge */}
          <div className="mt-6 text-center">
            <div className={cn(
              'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2',
              isPassed
                ? 'bg-md-secondary-container/10 border border-md-secondary-container/20 text-md-secondary-container'
                : 'bg-red-500/10 border border-red-400/20 text-red-300',
            )}>
              {isPassed
                ? <><CheckCircle2 size={14} className="mr-1" /> Lolos Ambang Batas</>
                : <><XCircle size={14} className="mr-1" /> Tidak Lolos</>
              }
            </div>
            <p className="text-md-on-primary-container/80 text-sm">
              {packageTitle ?? 'Simulasi SKD CPNS'}
            </p>
          </div>
        </div>
      </section>

      {/* ── Bento Stats ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-md3-sm flex flex-col justify-between aspect-square">
          <div className="w-10 h-10 rounded-lg bg-md-surface-container-low flex items-center justify-center">
            <span className="text-lg">🏆</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-md-primary"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              #{packageRank}
            </h3>
            <p className="text-md-on-surface-variant text-xs font-medium">
              dari {totalParticipants.toLocaleString('id-ID')} peserta
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md3-sm flex flex-col justify-between aspect-square">
          <div className="w-10 h-10 rounded-lg bg-md-surface-container-low flex items-center justify-center">
            <span className="text-lg">🎯</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-md-primary"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              {accuracy}%
            </h3>
            <p className="text-md-on-surface-variant text-xs font-medium">Akurasi Jawaban</p>
          </div>
        </div>
      </div>

      {/* ── Subject Breakdown ─────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-bold text-md-primary text-lg px-1"
          style={{ fontFamily: 'var(--font-jakarta)' }}>
          Rincian Materi
        </h2>
        <div className="space-y-3">
          {subjects.map(({ key, label, score: s, max, min, color }) => {
            const pct     = max > 0 ? Math.round(((s ?? 0) / max) * 100) : 0;
            const passed  = (s ?? 0) >= min;
            return (
              <div key={key} className="bg-md-surface-container-low p-4 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase', color)}>{key}</span>
                    <span className="text-sm font-bold text-md-primary">{label}</span>
                  </div>
                  <span className="text-sm font-bold text-md-primary">
                    {s ?? 0}<span className="text-md-on-surface-variant/50 font-medium">/{max}</span>
                  </span>
                </div>
                <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                  <div className="bg-md-secondary-container h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-md-on-surface-variant font-medium">
                  <span>Min: {min}</span>
                  <span className={cn('flex items-center gap-1', passed ? 'text-emerald-600' : 'text-red-600')}>
                    {passed
                      ? <><CheckCircle2 size={10} /> TERPENUHI</>
                      : <><XCircle size={10} /> BELUM TERPENUHI</>
                    }
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Trend Chart ───────────────────────────────────────── */}
      {chartData.length > 0 && (
        <section className="bg-white p-6 rounded-2xl shadow-md3-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-md-primary"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              Tren Progres
            </h2>
          </div>
          <div className="h-32 flex items-end justify-between gap-2 px-2">
            {chartData.map((a, i) => {
              const isLatest  = i === chartData.length - 1;
              const heightPct = maxBar > 0 ? Math.round(((a.final_score ?? 0) / maxBar) * 100) : 10;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 relative">
                  {isLatest && (
                    <div className="absolute -top-6 bg-md-primary text-white text-[8px] py-1 px-2 rounded">
                      {a.final_score ?? 0}
                    </div>
                  )}
                  <div
                    className={cn('w-full rounded-t-lg', isLatest ? 'bg-md-secondary-container shadow-md3-sm' : 'bg-md-surface-container-low')}
                    style={{ height: `${Math.max(heightPct, 8)}%`, minHeight: 8 }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-3 px-1 text-[10px] text-md-on-surface-variant/50 font-bold uppercase tracking-tight">
            {chartData.map((_, i) => (
              <span key={i}>{i === chartData.length - 1 ? 'TERBARU' : `SIM ${String(i + 1).padStart(2, '0')}`}</span>
            ))}
          </div>
        </section>
      )}

      {/* ── Recent Attempts ───────────────────────────────────── */}
      {attemptHistory.length > 1 && (
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-md-primary text-lg"
              style={{ fontFamily: 'var(--font-jakarta)' }}>
              Riwayat Percobaan
            </h2>
            <Link href="/history" className="text-xs font-bold text-md-secondary flex items-center gap-0.5">
              Lihat Semua <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {attemptHistory.slice(0, 4).map((a, i) => (
              <div key={i} className={cn('bg-white p-4 rounded-xl flex items-center justify-between shadow-md3-sm', i > 0 && 'opacity-70')}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-md-surface-container-low flex items-center justify-center text-md-primary font-bold text-xs">
                    {String(attemptHistory.length - i).padStart(2, '0')}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-md-primary">
                      {formatDate(a.completed_at)}
                    </p>
                    <p className="text-[10px] text-md-on-surface-variant">
                      Skor {a.final_score ?? 0}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-md-primary">{a.final_score ?? 0}</p>
                  <p className={cn('text-[10px] font-bold uppercase',
                    (a.score_twk ?? 0) >= TWK_CONFIG.PASSING_GRADE &&
                    (a.score_tiu ?? 0) >= TIU_CONFIG.PASSING_GRADE &&
                    (a.score_tkp ?? 0) >= TKP_CONFIG.PASSING_GRADE
                      ? 'text-emerald-600' : 'text-red-600',
                  )}>
                    {(a.score_twk ?? 0) >= TWK_CONFIG.PASSING_GRADE &&
                     (a.score_tiu ?? 0) >= TIU_CONFIG.PASSING_GRADE &&
                     (a.score_tkp ?? 0) >= TKP_CONFIG.PASSING_GRADE
                      ? 'Lolos' : 'Tidak Lolos'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Leaderboard ───────────────────────────────────────── */}
      {leaderboard.length > 0 && (
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-md-primary text-lg" style={{ fontFamily: 'var(--font-jakarta)' }}>
              Leaderboard
            </h2>
            <span className="text-xs text-md-on-surface-variant">Top {Math.min(leaderboard.length, 10)}</span>
          </div>
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((item) => {
              const isCurrentUser = item.user_id === userId;
              const medal = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : null;
              const initials = item.profiles?.full_name
                ? item.profiles.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
                : '?';
              return (
                <div
                  key={item.id}
                  className={cn(
                    'bg-white p-4 rounded-xl flex items-center gap-3 shadow-md3-sm',
                    isCurrentUser && 'ring-2 ring-md-secondary-container',
                  )}
                >
                  <div className="w-8 flex-shrink-0 text-center">
                    {medal
                      ? <span className="text-lg">{medal}</span>
                      : <span className="text-sm font-bold text-md-on-surface-variant">#{item.rank}</span>
                    }
                  </div>
                  <div className="w-9 h-9 rounded-full bg-md-surface-container flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.profiles?.avatar_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={item.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      : <span className="text-xs font-bold text-md-primary">{initials}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-bold truncate', isCurrentUser ? 'text-md-secondary' : 'text-md-on-surface')}>
                      {isCurrentUser ? 'Kamu' : (item.profiles?.full_name ?? 'Anonim')}
                    </p>
                    <p className="text-[10px] text-md-on-surface-variant">
                      {formatDate(item.completed_at)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="font-extrabold text-md-primary text-sm" style={{ fontFamily: 'var(--font-jakarta)' }}>
                      {item.final_score ?? 0}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Floating Action Buttons ───────────────────────────── */}
      <div className="fixed bottom-6 left-0 right-0 px-6 flex gap-3 z-40 max-w-md mx-auto">
        <Link href={`/exam/${attemptId}/review`} className="flex-1">
          <button className="w-full bg-md-secondary-container text-md-primary font-extrabold py-4 rounded-2xl shadow-md3-lg active-press text-sm">
            Bedah Pembahasan
          </button>
        </Link>
        <Link href={`/exam/${attemptId}/start`} className="flex-1">
          <button className="w-full bg-md-primary text-white font-extrabold py-4 rounded-2xl border-2 border-md-primary/20 active-press text-sm">
            Ulangi Simulasi
          </button>
        </Link>
      </div>

    </main>
  );
}
