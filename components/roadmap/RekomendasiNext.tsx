'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight, Lightbulb, Trophy, BookOpen, Brain, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RekomendasiNextProps {
  priority:       'TWK' | 'TIU' | 'TKP' | null;
  message:        string;
  action:         string;
  href:           string;
  totalCompleted: number;
}

const priorityConfig: Record<
  'TWK' | 'TIU' | 'TKP',
  {
    color:     string;
    bg:        string;
    topBar:    string;
    border:    string;
    btnBg:     string;
    iconBg:    string;
    iconColor: string;
    chipBg:    string;
    emoji:     string;
    label:     string;
    Icon:      React.ElementType;
  }
> = {
  TWK: {
    color:     'text-blue-700',
    bg:        'bg-blue-50/60',
    topBar:    'bg-gradient-to-r from-blue-500 to-blue-600',
    border:    'border-blue-200',
    btnBg:     'bg-blue-600 hover:bg-blue-700',
    iconBg:    'bg-blue-100',
    iconColor: 'text-blue-600',
    chipBg:    'bg-blue-600 text-white',
    emoji:     '🇮🇩',
    label:     'Tes Wawasan Kebangsaan',
    Icon:      BookOpen,
  },
  TIU: {
    color:     'text-violet-700',
    bg:        'bg-violet-50/60',
    topBar:    'bg-gradient-to-r from-violet-500 to-violet-600',
    border:    'border-violet-200',
    btnBg:     'bg-violet-600 hover:bg-violet-700',
    iconBg:    'bg-violet-100',
    iconColor: 'text-violet-600',
    chipBg:    'bg-violet-600 text-white',
    emoji:     '🧠',
    label:     'Tes Intelegensi Umum',
    Icon:      Brain,
  },
  TKP: {
    color:     'text-amber-700',
    bg:        'bg-amber-50/60',
    topBar:    'bg-gradient-to-r from-amber-500 to-orange-500',
    border:    'border-amber-200',
    btnBg:     'bg-amber-500 hover:bg-amber-600',
    iconBg:    'bg-amber-100',
    iconColor: 'text-amber-600',
    chipBg:    'bg-amber-500 text-white',
    emoji:     '🤝',
    label:     'Tes Karakteristik Pribadi',
    Icon:      Heart,
  },
};

export function RekomendasiNext({
  priority,
  message,
  action,
  href,
  totalCompleted,
}: RekomendasiNextProps) {
  const cfg       = priority ? priorityConfig[priority] : null;
  const isAllDone = message.startsWith('Luar biasa');

  /* ── Semua tahap selesai ─────────────────────────────────── */
  if (isAllDone) {
    return (
      <div className="relative overflow-hidden rounded-2xl shadow-md shadow-emerald-100">
        {/* Top color bar */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
        <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 px-5 py-5">
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-20 rounded-tr-full bg-white/5 pointer-events-none" />
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/20 flex items-center justify-center flex-shrink-0 text-2xl">
              🏆
            </div>
            <div className="flex-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-white/70 uppercase tracking-widest mb-1.5">
                <Trophy className="w-3 h-3" /> Semua Tahap Selesai
              </span>
              <p className="text-sm font-semibold text-white leading-relaxed">{message}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-white/60">{totalCompleted} tryout diselesaikan</span>
                <Button asChild size="sm" className="h-8 bg-white text-emerald-700 hover:bg-white/90 text-xs font-bold px-4 rounded-lg">
                  <Link href={href} className="flex items-center gap-1.5">
                    {action} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Fokus kategori (TWK / TIU / TKP) ───────────────────── */
  if (cfg && priority) {
    const { Icon } = cfg;
    return (
      <div className={cn('rounded-2xl border overflow-hidden shadow-sm', cfg.border)}>
        {/* Top accent bar */}
        <div className={cn('h-1.5', cfg.topBar)} />
        <div className={cn('px-5 py-4', cfg.bg)}>
          <div className="flex items-start gap-4">
            {/* Big emoji icon */}
            <div className={cn(
              'w-12 h-12 rounded-2xl border border-white/80 flex items-center justify-center flex-shrink-0 text-2xl shadow-sm bg-white',
            )}>
              {cfg.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={cn('text-[10px] font-extrabold uppercase tracking-widest', cfg.color)}>
                  Fokus Sekarang
                </span>
                <span className={cn('text-[10px] font-extrabold px-2 py-0.5 rounded-full', cfg.chipBg)}>
                  {priority}
                </span>
              </div>
              <p className={cn('text-sm font-bold leading-snug', cfg.color)}>
                {message}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Icon className={cn('w-3 h-3', cfg.iconColor)} />
                <p className={cn('text-xs', cfg.color, 'opacity-70')}>{cfg.label}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-white/60 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {totalCompleted > 0
                ? `${totalCompleted} tryout dikerjakan`
                : 'Belum ada tryout dikerjakan'}
            </span>
            <Button
              asChild size="sm"
              className={cn('h-8 text-xs font-bold px-4 rounded-lg text-white', cfg.btnBg)}
            >
              <Link href={href} className="flex items-center gap-1.5">
                {action} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Default — step non-kategori ─────────────────────────── */
  return (
    <div className="rounded-2xl border border-[#1B2B5E]/15 overflow-hidden shadow-sm">
      <div className="h-1.5 bg-gradient-to-r from-[#1B2B5E] to-[#2d4a8e]" />
      <div className="bg-gradient-to-br from-[#1B2B5E]/[0.04] to-transparent px-5 py-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1B2B5E] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Lightbulb className="w-5 h-5 text-[#F5A623]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-extrabold text-[#1B2B5E]/50 uppercase tracking-widest mb-1.5">
              Langkah Selanjutnya
            </p>
            <p className="text-sm font-bold text-[#1B2B5E] leading-snug">{message}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {totalCompleted > 0 ? `${totalCompleted} tryout dikerjakan` : 'Mulai tryout pertamamu'}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-[#1B2B5E]/10 flex justify-end">
          <Button
            asChild size="sm"
            className="h-8 text-xs font-bold px-4 rounded-lg bg-[#1B2B5E] hover:bg-[#1B2B5E]/90 text-white"
          >
            <Link href={href} className="flex items-center gap-1.5">
              {action} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}