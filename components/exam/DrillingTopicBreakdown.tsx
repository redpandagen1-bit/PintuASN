'use client';

import { Layers } from 'lucide-react';

export type TopicBreakdownRow = {
  category: 'TWK' | 'TIU' | 'TKP';
  topic: string;
  answered: number;
  correct: number;
  scoreSum: number;
  isTKP: boolean;
};

function barColor(pct: number) {
  if (pct < 60) return 'bg-rose-500';
  if (pct < 80) return 'bg-amber-500';
  return 'bg-emerald-500';
}
function textColor(pct: number) {
  if (pct < 60) return 'text-rose-600';
  if (pct < 80) return 'text-amber-600';
  return 'text-emerald-600';
}

export function DrillingTopicBreakdown({ topics }: { topics: TopicBreakdownRow[] }) {
  if (!topics || topics.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
      <div className="flex items-center gap-2 mb-1">
        <Layers className="h-4 w-4 text-sky-500" />
        <h3 className="font-bold text-slate-800 text-sm">Penguasaan per Topik (sesi ini)</h3>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Akurasi tiap topik yang kamu kerjakan di sesi ini. TKP dihitung dari skor rata-rata (skala 1-5).
      </p>
      <div className="space-y-3">
        {topics.map((t) => {
          const pct = t.answered === 0
            ? 0
            : t.isTKP
              ? Math.round((t.scoreSum / (t.answered * 5)) * 100)
              : Math.round((t.correct / t.answered) * 100);
          return (
            <div key={`${t.category}-${t.topic}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 flex-shrink-0">
                    {t.category}
                  </span>
                  <span className="text-sm text-slate-700 truncate">{t.topic}</span>
                </span>
                <span className={`text-xs font-semibold flex-shrink-0 tabular-nums ${textColor(pct)}`}>
                  {t.isTKP ? `${(t.scoreSum / t.answered).toFixed(1)}/5` : `${t.correct}/${t.answered}`}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full rounded-full ${barColor(pct)} transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
