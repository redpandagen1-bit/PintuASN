// ============================================================
// components/roadmap/RekomendasiNext.tsx
// ============================================================
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RekomendasiNextProps {
  priority: 'TWK' | 'TIU' | 'TKP' | null;
  message: string;
  action: string;
  totalCompleted: number;
}

const priorityConfig: Record<
  'TWK' | 'TIU' | 'TKP',
  { color: string; bg: string; border: string; emoji: string }
> = {
  TWK: {
    color:  'text-blue-700',
    bg:     'bg-blue-50',
    border: 'border-blue-200',
    emoji:  '🇮🇩',
  },
  TIU: {
    color:  'text-purple-700',
    bg:     'bg-purple-50',
    border: 'border-purple-200',
    emoji:  '🧠',
  },
  TKP: {
    color:  'text-orange-700',
    bg:     'bg-orange-50',
    border: 'border-orange-200',
    emoji:  '🤝',
  },
};

export function RekomendasiNext({
  priority,
  message,
  action,
  totalCompleted,
}: RekomendasiNextProps) {
  const config = priority ? priorityConfig[priority] : null;

  // Tentukan href berdasarkan action
  const href =
    action === 'Mulai Tryout'
      ? '/daftar-tryout'
      : action === 'Lihat Materi'
      ? '/materi'
      : '/statistics';

  return (
    <section
      className={cn(
        'rounded-xl p-4 border',
        config ? cn(config.bg, config.border) : 'bg-green-50 border-green-200',
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
            config ? 'bg-white/70' : 'bg-white/70',
          )}
        >
          {config ? (
            <span className="text-lg">{config.emoji}</span>
          ) : (
            <Lightbulb className="w-4 h-4 text-green-600" />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                'text-xs font-bold uppercase tracking-wide',
                config ? config.color : 'text-green-700',
              )}
            >
              Rekomendasi Langkah Berikutnya
            </span>
            {priority && (
              <span
                className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/60',
                  config?.color,
                )}
              >
                {priority}
              </span>
            )}
          </div>
          <p
            className={cn(
              'text-sm leading-relaxed',
              config ? config.color : 'text-green-700',
            )}
          >
            {message}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-3 flex justify-end">
        <Button
          asChild
          size="sm"
          variant="ghost"
          className={cn(
            'text-xs font-semibold h-8 px-3 hover:bg-white/50',
            config ? config.color : 'text-green-700',
          )}
        >
          <Link href={href} className="flex items-center gap-1">
            {action}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}