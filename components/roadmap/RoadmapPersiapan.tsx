'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { RoadmapPhase, PhaseStatus } from '@/types/roadmap';
import { CheckCircle2, Lock, ChevronDown, ArrowRight, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoadmapPersiapanProps {
  phases: RoadmapPhase[];
}

const statusConfig: Record<PhaseStatus, {
  circle:    string;
  line:      string;
  stepChip:  string;
  cardBg:    string;
  titleColor: string;
  badge:     React.ReactNode | null;
}> = {
  completed: {
    circle:    'bg-[#1B2B5E] border-[#1B2B5E] shadow shadow-[#1B2B5E]/20',
    line:      'bg-[#1B2B5E]',
    stepChip:  'bg-emerald-100 text-emerald-700',
    cardBg:    'bg-slate-50/70 border-slate-200',
    titleColor:'text-slate-600',
    badge: (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-2.5 h-2.5" /> Selesai
      </span>
    ),
  },
  active: {
    circle:    'bg-[#F5A623] border-[#F5A623] ring-[3px] ring-[#F5A623]/25 shadow shadow-[#F5A623]/30',
    line:      'bg-amber-200',
    stepChip:  'bg-amber-100 text-amber-700',
    cardBg:    'bg-amber-50/80 border-[#F5A623]/35',
    titleColor:'text-[#1B2B5E]',
    badge: (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#F5A623] text-white px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse inline-block" />
        Aktif
      </span>
    ),
  },
  locked: {
    circle:    'bg-slate-100 border-slate-300',
    line:      'bg-slate-200',
    stepChip:  'bg-slate-100 text-slate-400',
    cardBg:    'bg-white border-slate-100',
    titleColor:'text-slate-400',
    badge: null,
  },
};

function StepIcon({ phase }: { phase: RoadmapPhase }) {
  if (phase.status === 'completed') return <CheckCircle2 className="w-4 h-4 text-white" />;
  if (phase.status === 'locked')    return <Lock className="w-3.5 h-3.5 text-slate-400" />;
  return <span className="text-base leading-none">{phase.icon}</span>;
}

function AccordionDetail({ phase }: { phase: RoadmapPhase }) {
  return (
    <div className="mt-3 space-y-2.5">
      <p className="text-xs text-slate-600 leading-relaxed">{phase.detail}</p>

      <div className={cn(
        'rounded-xl border px-3 py-2.5 flex items-start gap-2.5',
        phase.status === 'active' ? 'bg-white border-[#F5A623]/20' : 'bg-white border-slate-100',
      )}>
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5 flex-shrink-0 pt-px">
          Syarat
        </span>
        <p className="text-xs text-slate-600 leading-snug">{phase.requirement}</p>
      </div>

      {phase.status !== 'locked' && phase.ctaLabel && phase.ctaHref && (
        <Button
          asChild size="sm"
          className={cn(
            'h-8 text-xs px-4 rounded-lg font-bold mt-1',
            phase.status === 'active'
              ? 'bg-[#1B2B5E] hover:bg-[#1B2B5E]/90 text-white'
              : 'bg-white border border-[#1B2B5E]/20 text-[#1B2B5E] hover:bg-slate-50',
          )}
        >
          <Link href={phase.ctaHref} className="flex items-center gap-1.5">
            {phase.ctaLabel}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Button>
      )}
    </div>
  );
}

export function RoadmapPersiapan({ phases }: RoadmapPersiapanProps) {
  const defaultOpen = phases.find(p => p.status === 'active')?.id ?? null;
  const [openId, setOpenId] = useState<string | null>(defaultOpen);

  const toggle = (id: string, status: PhaseStatus) => {
    if (status === 'locked') return;
    setOpenId(prev => prev === id ? null : id);
  };

  const completedCount = phases.filter(p => p.status === 'completed').length;
  const progressPct    = Math.round((completedCount / phases.length) * 100);

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1B2B5E]/8 flex items-center justify-center flex-shrink-0">
              <ListChecks className="w-4.5 h-4.5 text-[#1B2B5E]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#1B2B5E]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                Roadmap Persiapan
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">9 tahap terstruktur menuju kelulusan SKD</p>
            </div>
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <span className="text-sm font-extrabold text-[#1B2B5E]">
              {completedCount}
              <span className="text-slate-300 font-normal text-xs">/{phases.length}</span>
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">{progressPct}% selesai</span>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1B2B5E] to-[#2d4a8e] rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── Vertical Timeline ──────────────────────────────── */}
      <div className="px-5 py-4">
        {phases.map((phase, index) => {
          const cfg     = statusConfig[phase.status];
          const isLast  = index === phases.length - 1;
          const isOpen  = openId === phase.id;
          const canOpen = phase.status !== 'locked';

          return (
            <div key={phase.id} className="flex gap-3.5">

              {/* Left: circle + connector line */}
              <div className="flex flex-col items-center flex-shrink-0">
                <button
                  type="button"
                  onClick={() => toggle(phase.id, phase.status)}
                  disabled={!canOpen}
                  aria-label={`Step ${phase.step}: ${phase.title}`}
                  className={cn(
                    'w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 outline-none',
                    cfg.circle,
                    canOpen && 'hover:scale-105 active:scale-95 cursor-pointer',
                    !canOpen && 'cursor-not-allowed',
                    isOpen && canOpen && 'scale-105',
                  )}
                >
                  <StepIcon phase={phase} />
                </button>

                {!isLast && (
                  <div className={cn(
                    'w-0.5 flex-1 my-1 min-h-[1.75rem] rounded-full transition-colors duration-300',
                    cfg.line,
                  )} />
                )}
              </div>

              {/* Right: step card */}
              <div className={cn('flex-1 min-w-0', isLast ? 'pb-1' : 'pb-2')}>
                <button
                  type="button"
                  onClick={() => toggle(phase.id, phase.status)}
                  disabled={!canOpen}
                  className={cn(
                    'w-full text-left rounded-xl border px-3.5 py-3 transition-all duration-200',
                    cfg.cardBg,
                    canOpen && 'hover:shadow-sm cursor-pointer',
                    !canOpen && 'cursor-not-allowed',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">

                      {/* Step chip + badge */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                        <span className={cn(
                          'text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wide',
                          cfg.stepChip,
                        )}>
                          Step {phase.step}
                        </span>
                        {cfg.badge}
                      </div>

                      {/* Title */}
                      <p className={cn(
                        'text-sm font-bold leading-snug',
                        cfg.titleColor,
                      )}>
                        {phase.icon} {phase.title}
                      </p>

                      {/* Description */}
                      <p className={cn(
                        'text-xs mt-1 leading-relaxed',
                        phase.status === 'locked' ? 'text-slate-300' : 'text-slate-500',
                      )}>
                        {phase.description}
                      </p>
                    </div>

                    {canOpen && (
                      <ChevronDown className={cn(
                        'w-4 h-4 text-slate-400 flex-shrink-0 mt-1 transition-transform duration-200',
                        isOpen && 'rotate-180 text-[#1B2B5E]',
                      )} />
                    )}
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="mt-2 px-3.5">
                    <AccordionDetail phase={phase} />
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}