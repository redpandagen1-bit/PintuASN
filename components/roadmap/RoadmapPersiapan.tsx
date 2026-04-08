// ============================================================
// components/roadmap/RoadmapPersiapan.tsx  (replace file lama)
// ============================================================
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { RoadmapPhase, PhaseStatus } from '@/types/roadmap';
import { CheckCircle2, Lock, ChevronDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoadmapPersiapanProps {
  phases: RoadmapPhase[];
}

// ─── visual config per status ───────────────────────────────
const statusConfig: Record<
  PhaseStatus,
  {
    iconBg:       string;
    titleClass:   string;
    lineClass:    string;
    badge:        React.ReactNode | null;
  }
> = {
  completed: {
    iconBg:     'bg-[#1B2B5E] border-[#1B2B5E]',
    titleClass: 'text-[#1B2B5E]',
    lineClass:  'bg-[#1B2B5E]',
    badge: (
      <span className="text-[10px] font-semibold bg-green-50 text-green-600 px-2 py-0.5 rounded-full flex-shrink-0">
        SELESAI
      </span>
    ),
  },
  active: {
    iconBg:     'bg-[#F5A623] border-[#F5A623] ring-4 ring-[#F5A623]/20',
    titleClass: 'text-[#1B2B5E] font-semibold',
    lineClass:  'bg-gray-200',
    badge: (
      <span className="text-[10px] font-semibold bg-[#F5A623]/15 text-[#F5A623] px-2 py-0.5 rounded-full flex-shrink-0">
        SEKARANG
      </span>
    ),
  },
  locked: {
    iconBg:     'bg-gray-100 border-gray-200',
    titleClass: 'text-gray-400',
    lineClass:  'bg-gray-200',
    badge:      null,
  },
};

// ─── step icon ──────────────────────────────────────────────
function StepIcon({ phase }: { phase: RoadmapPhase }) {
  if (phase.status === 'completed') {
    return <CheckCircle2 className="w-4 h-4 text-white" />;
  }
  if (phase.status === 'locked') {
    return <Lock className="w-3.5 h-3.5 text-gray-400" />;
  }
  // active
  return <span className="text-base leading-none">{phase.icon}</span>;
}

// ─── accordion content ──────────────────────────────────────
function AccordionContent({ phase }: { phase: RoadmapPhase }) {
  const bgMap: Record<PhaseStatus, string> = {
    completed: 'bg-green-50  border-green-100',
    active:    'bg-[#F5A623]/6 border-[#F5A623]/20',
    locked:    'bg-gray-50   border-gray-100',
  };

  return (
    <div
      className={cn(
        'mt-2 mb-1 rounded-lg border p-3.5 space-y-3',
        bgMap[phase.status],
      )}
    >
      {/* Detail penjelasan */}
      <p className="text-xs text-gray-600 leading-relaxed">{phase.detail}</p>

      {/* Syarat */}
      <div className="flex items-start gap-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5 flex-shrink-0">
          Syarat
        </span>
        <p className="text-xs text-gray-500 leading-snug">{phase.requirement}</p>
      </div>

      {/* CTA — hanya tampil jika bukan locked */}
      {phase.status !== 'locked' && phase.ctaLabel && phase.ctaHref && (
        <div className="pt-1">
          <Button
            asChild
            size="sm"
            variant={phase.status === 'active' ? 'default' : 'outline'}
            className={cn(
              'h-7 text-xs px-3 rounded-full',
              phase.status === 'active'
                ? 'bg-[#1B2B5E] hover:bg-[#1B2B5E]/90 text-white'
                : 'border-[#1B2B5E]/30 text-[#1B2B5E] hover:bg-[#1B2B5E]/5',
            )}
          >
            <Link href={phase.ctaHref} className="flex items-center gap-1">
              {phase.ctaLabel}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── main component ─────────────────────────────────────────
export function RoadmapPersiapan({ phases }: RoadmapPersiapanProps) {
  // Default: buka accordion fase aktif, semua lain tertutup
  const defaultOpen = phases.find((p) => p.status === 'active')?.id ?? null;
  const [openId, setOpenId] = useState<string | null>(defaultOpen);

  const toggle = (id: string, status: PhaseStatus) => {
    // Fase locked tidak bisa dibuka
    if (status === 'locked') return;
    setOpenId((prev) => (prev === id ? null : id));
  };

  const completedCount = phases.filter((p) => p.status === 'completed').length;

  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#1B2B5E]">Roadmap Persiapan</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Jalur belajar terstruktur menuju kelulusan SKD
          </p>
        </div>
        <span className="text-xs text-gray-400 pb-0.5">
          {completedCount}/{phases.length} selesai
        </span>
      </div>

      {/* Steps */}
      <div className="relative">
        {phases.map((phase, index) => {
          const config  = statusConfig[phase.status];
          const isLast  = index === phases.length - 1;
          const isOpen  = openId === phase.id;
          const canOpen = phase.status !== 'locked';

          return (
            <div key={phase.id} className="flex gap-3">
              {/* Icon column + connector line */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-full border-2 flex-shrink-0 transition-all duration-200',
                    config.iconBg,
                  )}
                >
                  <StepIcon phase={phase} />
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 min-h-[1rem] my-1 transition-colors duration-300',
                      config.lineClass,
                    )}
                  />
                )}
              </div>

              {/* Content column */}
              <div
                className={cn(
                  'flex-1 pb-3',
                  phase.status === 'locked' && 'opacity-45',
                )}
              >
                {/* Row: title + badge + chevron */}
                <button
                  type="button"
                  onClick={() => toggle(phase.id, phase.status)}
                  className={cn(
                    'w-full flex items-start justify-between text-left gap-2 group',
                    canOpen ? 'cursor-pointer' : 'cursor-default',
                  )}
                  aria-expanded={isOpen}
                  disabled={!canOpen}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          'text-xs text-gray-400 font-medium',
                        )}
                      >
                        Step {phase.step}
                      </span>
                      <p className={cn('text-sm', config.titleClass)}>
                        {phase.title}
                      </p>
                      {config.badge}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                      {phase.description}
                    </p>
                  </div>

                  {/* Chevron — hanya muncul jika bisa dibuka */}
                  {canOpen && (
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform duration-200',
                        isOpen && 'rotate-180',
                      )}
                    />
                  )}
                </button>

                {/* Accordion body */}
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    isOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0',
                  )}
                >
                  <AccordionContent phase={phase} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}