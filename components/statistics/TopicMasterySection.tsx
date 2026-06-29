'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Target, ChevronRight, Sparkles } from 'lucide-react';
import {
  DRILLING_CATEGORIES,
  type DrillingCategory,
  type TopicMastery,
  type TopicMasteryByCategory,
} from '@/constants/drilling';

const LEVEL: Record<TopicMastery['level'], { bar: string; text: string }> = {
  none:   { bar: 'bg-slate-200',   text: 'text-slate-400' },
  weak:   { bar: 'bg-rose-500',    text: 'text-rose-600' },
  medium: { bar: 'bg-amber-500',   text: 'text-amber-600' },
  strong: { bar: 'bg-emerald-500', text: 'text-emerald-600' },
};

function drillHref(m: TopicMastery) {
  return `/drilling?cat=${m.category}&topic=${encodeURIComponent(m.topic)}`;
}

export function TopicMasterySection({ mastery }: { mastery: TopicMasteryByCategory }) {
  const [cat, setCat] = useState<DrillingCategory>('TWK');

  const weakest = DRILLING_CATEGORIES.flatMap((c) => mastery[c])
    .filter((m) => m.answered > 0 && m.level !== 'strong')
    .sort((a, b) => a.masteryPct - b.masteryPct)
    .slice(0, 3);

  const hasAny = DRILLING_CATEGORIES.some((c) => mastery[c].some((m) => m.answered > 0));
  const list = mastery[cat];

  return (
    <div className="space-y-4">
      {/* ── Topik yang perlu dikuasai ───────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-1">
          <Target className="h-4 w-4 text-rose-500" />
          <h3 className="font-bold text-slate-800 text-sm">Topik yang Perlu Dikuasai</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Topik dengan penguasaan terendah dari latihanmu. Latih langsung lewat drilling.
        </p>

        {weakest.length === 0 ? (
          <div className="text-center py-6">
            <Sparkles className="h-7 w-7 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">
              {hasAny
                ? 'Mantap! Semua topik yang kamu kerjakan sudah kuat.'
                : 'Kerjakan tryout atau drilling untuk melihat topik terlemahmu.'}
            </p>
            <Link
              href="/drilling"
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition"
            >
              Mulai Drilling <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {weakest.map((m) => {
              const lv = LEVEL[m.level];
              return (
                <div
                  key={`${m.category}-${m.topic}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                        {m.category}
                      </span>
                      <span className="text-sm font-semibold text-slate-700 truncate">{m.topic}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div className={`h-full rounded-full ${lv.bar}`} style={{ width: `${m.masteryPct}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${lv.text}`}>{m.masteryPct}%</span>
                    </div>
                  </div>
                  <Link
                    href={drillHref(m)}
                    className="flex-shrink-0 inline-flex items-center px-3 py-2 rounded-xl bg-yellow-400 text-slate-900 text-xs font-bold hover:bg-yellow-300 transition"
                  >
                    Drilling
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Peta penguasaan topik (per kategori) ────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 text-sm">Peta Penguasaan Topik</h3>
          <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
            {DRILLING_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                  cat === c ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {list.map((m) => {
            const lv = LEVEL[m.level];
            return (
              <div key={m.topic}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700 truncate pr-2">{m.topic}</span>
                  <span className={`text-xs font-semibold flex-shrink-0 ${lv.text}`}>
                    {m.answered === 0 ? 'Belum' : `${m.masteryPct}%`}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${lv.bar} transition-all`}
                    style={{ width: `${m.answered === 0 ? 0 : m.masteryPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 mt-3">
          TWK &amp; TIU dihitung dari akurasi jawaban benar; TKP dari skor rata-rata (skala 1-5).
        </p>
      </div>
    </div>
  );
}
