'use client';

import { useState } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  XCircle,
  Check,
  BarChart2,
  Share2,
  Lock,
  Crown,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { UpgradeModal } from '@/components/shared/upgrade-modal';
import type { Attempt, Package } from '@/types/database';

interface AttemptHistoryCardProps {
  attempt: Attempt & { packages: Package };
  isLocked?: boolean;
}

export function AttemptHistoryCard({ attempt, isLocked = false }: AttemptHistoryCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const calculateDuration = (start: string, end: string | undefined) => {
    if (!end) return null;
    const durationMs = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.round(durationMs / 60000);
    if (mins <= 0 || mins > 200) return null;
    return `${mins} menit`;
  };

  const isPassed = () => {
    const twk = attempt.score_twk ?? 0;
    const tiu = attempt.score_tiu ?? 0;
    const tkp = attempt.score_tkp ?? 0;
    return twk >= 65 && tiu >= 80 && tkp >= 166;
  };

  const passed = isPassed();
  const totalScore = attempt.total_score ?? (attempt as any).final_score ?? null;
  const completedAt = (attempt as any).completed_at || attempt.started_at;
  const duration = calculateDuration(attempt.started_at, (attempt as any).completed_at);

  const handleCopyLink = async () => {
    if (isLocked) return;
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/exam/${attempt.id}/result`
      : '';
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast.success('Link hasil berhasil disalin!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Gagal menyalin link');
    }
  };

  // ── LOCKED STATE ──────────────────────────────────────────────────────────
  if (isLocked) {
    return (
      <>
        <div
          className="relative bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden cursor-pointer group"
          onClick={() => setShowUpgradeModal(true)}
          role="button"
          aria-label="Buka riwayat terkunci — upgrade ke Platinum"
        >
          {/* Blurred content */}
          <div className="flex select-none pointer-events-none" aria-hidden="true">
            <div className={cn('w-1 flex-shrink-0', passed ? 'bg-emerald-500' : 'bg-red-400')} />
            <div className="flex-1 px-5 py-4 blur-[3px] opacity-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h3 className="text-base font-bold text-slate-800 truncate">
                      {attempt.packages?.title || 'Unknown Package'}
                    </h3>
                    <span className={cn(
                      'flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide',
                      passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                    )}>
                      {passed ? <><CheckCircle2 size={9} /> Lulus</> : <><XCircle size={9} /> Tidak Lulus</>}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-2.5">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} className="text-slate-400" />
                      {formatDate(completedAt)} · {formatTime(completedAt)}
                    </span>
                    {duration && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} className="text-slate-400" />
                        {duration}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {attempt.score_twk != null && (
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-xs font-bold text-slate-600">
                        TWK <span className="text-slate-800">{attempt.score_twk}</span>
                      </span>
                    )}
                    {attempt.score_tiu != null && (
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-xs font-bold text-slate-600">
                        TIU <span className="text-slate-800">{attempt.score_tiu}</span>
                      </span>
                    )}
                    {attempt.score_tkp != null && (
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-xs font-bold text-slate-600">
                        TKP <span className="text-slate-800">{attempt.score_tkp}</span>
                      </span>
                    )}
                  </div>
                </div>
                {totalScore !== null && (
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-black text-slate-800 leading-none">{totalScore}</div>
                    <div className="text-[10px] text-slate-400 font-medium">/ 550</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-between px-5 rounded-xl transition-all group-hover:bg-purple-50/80">
            {/* Left */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 group-hover:bg-purple-200 border border-purple-200 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 transition-colors">
                <Lock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Riwayat Terkunci</p>
                <p className="text-[11px] text-slate-500">Klik untuk buka akses semua riwayat</p>
              </div>
            </div>

            {/* Right: CTA */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 group-hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm whitespace-nowrap">
                <Crown size={11} />
                Upgrade Platinum
              </div>
            </div>
          </div>
        </div>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          requiredTier="platinum"
          contentTitle="Riwayat Tryout Lengkap"
        />
      </>
    );
  }

  // ── NORMAL STATE ──────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="flex">
        <div className={cn('w-1 flex-shrink-0', passed ? 'bg-emerald-500' : 'bg-red-400')} />

        <div className="flex-1 px-4 py-3.5">
          {/* Title row + total score inline on mobile */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-800 truncate">
                {attempt.packages?.title || 'Unknown Package'}
              </h3>
              <span className={cn(
                'flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide',
                passed
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-600'
              )}>
                {passed
                  ? <><CheckCircle2 size={9} /> Lulus</>
                  : <><XCircle size={9} /> Tidak Lulus</>}
              </span>
            </div>
            {/* Total score — always top-right */}
            {totalScore !== null && (
              <div className="flex-shrink-0 text-right">
                <div className="text-xl font-black text-slate-800 leading-none">{totalScore}</div>
                <div className="text-[10px] text-slate-400 font-medium">/ 550</div>
              </div>
            )}
          </div>

          {/* Date + duration */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <Calendar size={11} className="text-slate-400" />
              {formatDate(completedAt)} · {formatTime(completedAt)}
            </span>
            {duration && (
              <span className="flex items-center gap-1">
                <Clock size={11} className="text-slate-400" />
                {duration}
              </span>
            )}
          </div>

          {/* Score pills */}
          <div className="flex items-center gap-1.5 mb-3">
            {attempt.score_twk !== null && attempt.score_twk !== undefined && (
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-xs font-bold text-slate-600">
                TWK <span className="text-slate-800">{attempt.score_twk}</span>
              </span>
            )}
            {attempt.score_tiu !== null && attempt.score_tiu !== undefined && (
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-xs font-bold text-slate-600">
                TIU <span className="text-slate-800">{attempt.score_tiu}</span>
              </span>
            )}
            {attempt.score_tkp !== null && attempt.score_tkp !== undefined && (
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-xs font-bold text-slate-600">
                TKP <span className="text-slate-800">{attempt.score_tkp}</span>
              </span>
            )}
          </div>

          {/* Action buttons — full-width on mobile */}
          <div className="flex items-center gap-1.5">
            <Link
              href={`/exam/${attempt.id}/result`}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <BarChart2 size={13} />
              Hasil
            </Link>
            <Link
              href={`/exam/${attempt.id}/review`}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <BookOpen size={13} />
              Pembahasan
            </Link>
            <button
              onClick={handleCopyLink}
              title="Salin link hasil"
              className="flex items-center justify-center w-9 h-9 bg-slate-50 hover:bg-yellow-50 border border-slate-200 hover:border-yellow-300 text-slate-500 hover:text-yellow-600 rounded-lg transition-colors flex-shrink-0"
            >
              {isCopied ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}