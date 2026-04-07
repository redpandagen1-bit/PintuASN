// ============================================================
// components/roadmap/RoadmapPersiapan.tsx
// ============================================================
'use client';

import { cn } from '@/lib/utils';
import type { RoadmapPhase, PhaseStatus } from '@/types/roadmap';
import { CheckCircle2, Circle, Lock } from 'lucide-react';

interface RoadmapPersiapanProps {
  phases: RoadmapPhase[];
}

const statusConfig: Record<
  PhaseStatus,
  { icon: React.ReactNode; containerClass: string; titleClass: string; lineClass: string }
> = {
  completed: {
    icon: <CheckCircle2 className="w-5 h-5 text-white" />,
    containerClass: 'bg-[#1B2B5E] border-[#1B2B5E]',
    titleClass: 'text-[#1B2B5E]',
    lineClass: 'bg-[#1B2B5E]',
  },
  active: {
    icon: <Circle className="w-5 h-5 text-white fill-white" />,
    containerClass: 'bg-[#F5A623] border-[#F5A623] ring-4 ring-[#F5A623]/20',
    titleClass: 'text-[#1B2B5E] font-semibold',
    lineClass: 'bg-gray-200',
  },
  locked: {
    icon: <Lock className="w-4 h-4 text-gray-400" />,
    containerClass: 'bg-gray-100 border-gray-200',
    titleClass: 'text-gray-400',
    lineClass: 'bg-gray-200',
  },
};

export function RoadmapPersiapan({ phases }: RoadmapPersiapanProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-[#1B2B5E]">Roadmap Persiapan</h2>
        <p className="text-sm text-gray-500 mt-0.5">Jalur belajar dari awal hingga hari H ujian</p>
      </div>

      <div className="relative">
        {phases.map((phase, index) => {
          const config = statusConfig[phase.status];
          const isLast = index === phases.length - 1;

          return (
            <div key={phase.id} className="flex gap-4">
              {/* Icon + connector line */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-full border-2 flex-shrink-0 transition-all duration-300',
                    config.containerClass,
                  )}
                >
                  {phase.icon ? (
                    phase.status === 'locked' ? (
                      config.icon
                    ) : (
                      <span className="text-base leading-none">{phase.icon}</span>
                    )
                  ) : null}
                </div>
                {!isLast && (
                  <div className={cn('w-0.5 flex-1 min-h-[1.5rem] my-1', config.lineClass)} />
                )}
              </div>

              {/* Content */}
              <div
                className={cn(
                  'pb-5 flex-1',
                  phase.status === 'locked' && 'opacity-50',
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={cn('text-sm font-medium', config.titleClass)}>
                      {phase.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{phase.description}</p>
                  </div>
                  {phase.status === 'active' && (
                    <span className="text-[10px] font-semibold bg-[#F5A623]/15 text-[#F5A623] px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                      SEKARANG
                    </span>
                  )}
                  {phase.status === 'completed' && (
                    <span className="text-[10px] font-semibold bg-green-50 text-green-600 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                      SELESAI
                    </span>
                  )}
                </div>

                {/* Detail hanya tampil untuk active phase */}
                {phase.status === 'active' && (
                  <div className="mt-2 p-3 bg-[#F5A623]/8 rounded-lg border border-[#F5A623]/20">
                    <p className="text-xs text-gray-600 leading-relaxed">{phase.detail}</p>
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