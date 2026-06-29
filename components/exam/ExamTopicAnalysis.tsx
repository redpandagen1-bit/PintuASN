'use client';

import Link from 'next/link';
import { Target } from 'lucide-react';
import { DRILLING_TOPICS, type DrillingCategory } from '@/constants/drilling';
import type { TopicBreakdownRow } from './DrillingTopicBreakdown';

function isDrillable(category: string, topic: string) {
  const list = (DRILLING_TOPICS as Record<string, string[]>)[category];
  return Array.isArray(list) && list.includes(topic);
}
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

/**
 * Analisis topik untuk hasil tryout: tampilkan topik terlemah di tryout ini,
 * dan untuk topik yang masuk taksonomi drilling beri tombol latih cepat.
 */
export function ExamTopicAnalysis({ topics }: { topics: TopicBreakdownRow[] }) {
  const rows = topics
    .filter((t) => t.answered > 0)
    .map((t) => {
      const pct = t.isTKP
        ? Math.round((t.scoreSum / (t.answered * 5)) * 100)
        : Math.round((t.correct / t.answered) * 100);
      return { ...t, pct, drillable: isDrillable(t.category, t.topic) };
    })
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 6);

  if (rows.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
      <div className="flex items-center gap-2 mb-1">
        <Target className="h-4 w-4 text-rose-500" />
        <h3 className="font-bold text-slate-800 text-sm">Topik untuk Ditingkatkan</h3>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Topik dengan penguasaan terendah di tryout ini. Latih yang masih lemah lewat drilling.
      </p>

      <div className="space-y-2.5">
        {rows.map((t) => (
          <div
            key={`${t.category}-${t.topic}`}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 flex-shrink-0">
                  {t.category}
                </span>
                <span className="text-sm font-semibold text-slate-700 truncate">{t.topic}</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div className={`h-full rounded-full ${barColor(t.pct)}`} style={{ width: `${t.pct}%` }} />
                </div>
                <span className={`text-xs font-bold tabular-nums ${textColor(t.pct)}`}>
                  {t.isTKP ? `${(t.scoreSum / t.answered).toFixed(1)}/5` : `${t.correct}/${t.answered}`}
                </span>
              </div>
            </div>
            {t.drillable && t.pct < 80 && (
              <Link
                href={`/drilling?cat=${t.category}&topic=${encodeURIComponent(t.topic)}`}
                className="flex-shrink-0 inline-flex items-center px-3 py-2 rounded-xl bg-yellow-400 text-slate-900 text-xs font-bold hover:bg-yellow-300 transition"
              >
                Drilling
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
