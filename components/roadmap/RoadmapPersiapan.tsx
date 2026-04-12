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

const statusConfig: Record<PhaseStatus, {
  iconWrap:  string;
  lineClass: string;
  cardClass: string;
  badge:     React.ReactNode | null;
}> = {
  completed: {
    iconWrap:  'bg-[#1B2B5E] border-[#1B2B5E] shadow-md shadow-[#1B2B5E]/20',
    lineClass: 'bg-[#1B2B5E]',
    cardClass: 'border-[#1B2B5E]/15 bg-white',
    badge: (
      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
        Selesai ✓
      </span>
    ),
  },
  active: {
    iconWrap:  'bg-[#F5A623] border-[#F5A623] ring-4 ring-[#F5A623]/25 shadow-md shadow-[#F5A623]/30',
    lineClass: 'bg-gray-300',
    cardClass: 'border-[#F5A623]/40 bg-amber-50/60 shadow-sm',
    badge: (
      <span className="text-[10px] font-bold bg-[#F5A623] text-white px-2 py-0.5 rounded-full animate-pulse">
        ● Sekarang
      </span>
    ),
  },
  locked: {
    // Warna lebih tajam: border & bg abu gelap, icon gembok kontras
    iconWrap:  'bg-slate-200 border-slate-400',
    lineClass: 'bg-slate-300',
    cardClass: 'border-slate-200 bg-slate-50',
    badge: null,
  },
};

function StepIcon({ phase }: { phase: RoadmapPhase }) {
  if (phase.status === 'completed') return <CheckCircle2 className="w-3.5 h-3.5 text-white" />;
  // Gembok lebih gelap dan jelas
  if (phase.status === 'locked')    return <Lock className="w-3 h-3 text-slate-500" />;
  return <span className="text-sm leading-none">{phase.icon}</span>;
}

function AccordionContent({ phase }: { phase: RoadmapPhase }) {
  const bgMap: Record<PhaseStatus, string> = {
    completed: 'bg-slate-50 border-slate-100',
    active:    'bg-amber-50/60 border-[#F5A623]/15',
    locked:    'bg-slate-50 border-slate-200',
  };

  return (
    <div className={cn('mt-3 rounded-xl border p-3 space-y-2.5', bgMap[phase.status])}>
      <p className="text-xs text-gray-600 leading-relaxed">{phase.detail}</p>
      <div className="flex items-start gap-2 bg-white/80 rounded-lg p-2.5">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 flex-shrink-0">
          Syarat
        </span>
        <p className="text-xs text-gray-600 leading-snug">{phase.requirement}</p>
      </div>
      {phase.status !== 'locked' && phase.ctaLabel && phase.ctaHref && (
        <div className="pt-1">
          <Button
            asChild size="sm"
            className={cn(
              'h-8 text-xs px-4 rounded-full font-bold',
              phase.status === 'active'
                ? 'bg-[#1B2B5E] hover:bg-[#1B2B5E]/90 text-white'
                : 'bg-white border border-[#1B2B5E]/20 text-[#1B2B5E] hover:bg-[#1B2B5E]/5',
            )}
          >
            <Link href={phase.ctaHref} className="flex items-center gap-1.5">
              {phase.ctaLabel}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>
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
  const activePhase    = phases.find(p => p.id === openId) ?? null;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#1B2B5E]">Roadmap Persiapan</h2>
          <p className="text-xs text-gray-500 mt-0.5">Ikuti tahap demi tahap menuju kelulusan SKD</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-[#1B2B5E]">
            {completedCount}
            <span className="text-gray-300 font-normal">/{phases.length}</span>
          </p>
          <p className="text-[10px] text-gray-400">tahap selesai</p>
        </div>
      </div>

      {/* ── HORIZONTAL TIMELINE ─────────────────────────────── */}
      <div className="w-full py-1">
        <div className="flex items-center w-full">
          {phases.map((phase, index) => {
            const config  = statusConfig[phase.status];
            const isLast  = index === phases.length - 1;
            const isOpen  = openId === phase.id;
            const canOpen = phase.status !== 'locked';

            return (
              <div
                key={phase.id}
                className={cn('flex items-center', isLast ? 'flex-shrink-0' : 'flex-1')}
              >
                <button
                  type="button"
                  onClick={() => toggle(phase.id, phase.status)}
                  disabled={!canOpen}
                  title={`Step ${phase.step}: ${phase.title}`}
                  className={cn(
                    'flex flex-col items-center gap-1 flex-shrink-0 outline-none',
                    canOpen ? 'cursor-pointer' : 'cursor-not-allowed',
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300',
                      config.iconWrap,
                      isOpen && canOpen && 'scale-110',
                    )}
                  >
                    <StepIcon phase={phase} />
                  </div>
                  <span className={cn(
                    'text-[10px] font-semibold leading-none',
                    phase.status === 'active'    ? 'text-[#F5A623]' :
                    phase.status === 'completed' ? 'text-[#1B2B5E]' : 'text-slate-400',
                  )}>
                    {phase.step}
                  </span>
                </button>

                {!isLast && (
                  <div className={cn(
                    'flex-1 h-0.5 mx-1 -mt-4 transition-colors duration-300',
                    config.lineClass,
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── DETAIL CARD ─────────────────────────────────────── */}
      {activePhase && (
        <div className={cn(
          'rounded-xl border-2 p-4 transition-all duration-300',
          statusConfig[activePhase.status].cardClass,
        )}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                  Step {activePhase.step}
                </span>
                {statusConfig[activePhase.status].badge}
              </div>
              <p className={cn(
                'text-sm font-bold leading-tight',
                activePhase.status === 'completed' ? 'text-gray-600' : 'text-[#1B2B5E]',
              )}>
                {activePhase.icon} {activePhase.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                {activePhase.description}
              </p>
            </div>
            <button
              onClick={() => setOpenId(null)}
              className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0"
            >
              <ChevronDown className="w-4 h-4 rotate-180" />
            </button>
          </div>

          <AccordionContent phase={activePhase} />
        </div>
      )}
    </section>
  );
}