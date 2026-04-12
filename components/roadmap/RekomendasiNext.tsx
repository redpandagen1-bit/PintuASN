'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight, Lightbulb, Trophy, AlertCircle } from 'lucide-react';
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
  { color: string; bg: string; border: string; accent: string; emoji: string; label: string }
> = {
  TWK: {
    color:  'text-blue-700',
    bg:     'bg-gradient-to-br from-blue-50 to-blue-50/60',
    border: 'border-blue-200',
    accent: 'bg-blue-600',
    emoji:  '🇮🇩',
    label:  'Tes Wawasan Kebangsaan',
  },
  TIU: {
    color:  'text-violet-700',
    bg:     'bg-gradient-to-br from-violet-50 to-violet-50/60',
    border: 'border-violet-200',
    accent: 'bg-violet-600',
    emoji:  '🧠',
    label:  'Tes Intelegensi Umum',
  },
  TKP: {
    color:  'text-amber-700',
    bg:     'bg-gradient-to-br from-amber-50 to-orange-50/60',
    border: 'border-amber-200',
    accent: 'bg-amber-500',
    emoji:  '🤝',
    label:  'Tes Karakteristik Pribadi',
  },
};

export function RekomendasiNext({
  priority,
  message,
  action,
  href,
  totalCompleted,
}: RekomendasiNextProps) {
  const config    = priority ? priorityConfig[priority] : null;
  const isAllDone = message.startsWith('Luar biasa');

  if (isAllDone) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 shadow-lg shadow-emerald-200">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
        <div className="relative flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Semua Tahap Selesai 🎉</p>
            <p className="text-sm text-white leading-relaxed">{message}</p>
            <Button asChild size="sm" className="mt-3 bg-white text-emerald-700 hover:bg-white/90 h-8 text-xs font-bold px-4 rounded-full">
              <Link href={href} className="flex items-center gap-1">
                {action}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (config && priority) {
    return (
      <div className={cn('rounded-2xl border-2 p-5', config.bg, config.border)}>
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-xl">
            {config.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={cn('text-xs font-bold uppercase tracking-wider', config.color)}>
                Fokus Sekarang
              </span>
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full text-white', config.accent)}>
                {priority}
              </span>
            </div>
            <p className={cn('text-sm font-medium leading-relaxed', config.color)}>
              {message}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{config.label}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{totalCompleted} tryout dikerjakan</span>
          </div>
          <Button
            asChild
            size="sm"
            className={cn('h-8 text-xs font-bold px-4 rounded-full text-white', config.accent, 'hover:opacity-90')}
          >
            <Link href={href} className="flex items-center gap-1.5">
              {action}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Default — step non-kategori
  return (
    <div className="rounded-2xl border border-[#1B2B5E]/15 bg-gradient-to-br from-[#1B2B5E]/5 to-[#1B2B5E]/[0.02] p-5">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#1B2B5E] flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-[#F5A623]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[#1B2B5E]/60 uppercase tracking-wider mb-1">
            Langkah Selanjutnya
          </p>
          <p className="text-sm text-[#1B2B5E] leading-relaxed font-medium">
            {message}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{totalCompleted} tryout dikerjakan</span>
        </div>
        <Button
          asChild
          size="sm"
          className="h-8 text-xs font-bold px-4 rounded-full bg-[#1B2B5E] hover:bg-[#1B2B5E]/90 text-white"
        >
          <Link href={href} className="flex items-center gap-1.5">
            {action}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}