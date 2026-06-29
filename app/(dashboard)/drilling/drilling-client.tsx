'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Target,
  Minus,
  Plus,
  Clock,
  ListChecks,
  Sparkles,
  Loader2,
  Check,
  CheckCheck,
  ArrowRight,
  RotateCcw,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DRILLING_TOPICS,
  DRILLING_CATEGORIES,
  DRILLING_LIMITS,
  CATEGORY_LABEL,
  type DrillingCategory,
  type DrillingCategoryStats,
} from '@/constants/drilling';

const CATEGORY_THEME: Record<
  DrillingCategory,
  { active: string; ring: string; text: string; badge: string; dot: string }
> = {
  TWK: {
    active: 'bg-sky-500 text-white border-sky-500',
    ring: 'ring-sky-200 border-sky-400 bg-sky-50',
    text: 'text-sky-700',
    badge: 'bg-sky-500 text-white',
    dot: 'bg-sky-500',
  },
  TIU: {
    active: 'bg-emerald-500 text-white border-emerald-500',
    ring: 'ring-emerald-200 border-emerald-400 bg-emerald-50',
    text: 'text-emerald-700',
    badge: 'bg-emerald-500 text-white',
    dot: 'bg-emerald-500',
  },
  TKP: {
    active: 'bg-violet-500 text-white border-violet-500',
    ring: 'ring-violet-200 border-violet-400 bg-violet-50',
    text: 'text-violet-700',
    badge: 'bg-violet-500 text-white',
    dot: 'bg-violet-500',
  },
};

export function DrillingClient({
  stats,
  inProgress,
}: {
  stats: DrillingCategoryStats;
  inProgress?: { id: string; title: string; totalQuestions: number } | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Preselect dari query (?cat=TWK&topic=Bela+Negara) — dipakai tombol
  // "Drilling topik ini" di halaman Statistik.
  const initCat = (() => {
    const c = searchParams.get('cat');
    return c && c in DRILLING_TOPICS ? (c as DrillingCategory) : 'TWK';
  })();

  const [category, setCategory] = useState<DrillingCategory>(initCat);
  // Default KOSONG, kecuali ada topik dari query
  const [selected, setSelected] = useState<Record<DrillingCategory, Set<string>>>(() => {
    const base = {
      TWK: new Set<string>(),
      TIU: new Set<string>(),
      TKP: new Set<string>(),
    };
    const c = searchParams.get('cat') as DrillingCategory | null;
    const t = searchParams.get('topic');
    if (c && c in DRILLING_TOPICS && t && DRILLING_TOPICS[c].includes(t)) {
      base[c] = new Set([t]);
    }
    return base;
  });
  const [count, setCount] = useState<number>(DRILLING_LIMITS.DEFAULT_QUESTIONS);
  const [minutes, setMinutes] = useState<number>(DRILLING_LIMITS.DEFAULT_MINUTES);
  const [starting, setStarting] = useState(false);

  const topicStats = stats[category];
  const selectedSet = selected[category];
  const theme = CATEGORY_THEME[category];

  // Cari stat (total/remaining) untuk satu pasangan kategori+topik
  function statFor(cat: DrillingCategory, topic: string) {
    return stats[cat].find((t) => t.topic === topic);
  }

  // Agregat LINTAS kategori (untuk mixing)
  const { totalSelected, availableTotal } = useMemo(() => {
    let topics = 0;
    let total = 0;
    for (const cat of DRILLING_CATEGORIES) {
      for (const topic of selected[cat]) {
        topics += 1;
        const s = statFor(cat, topic);
        if (s) total += s.total;
      }
    }
    return { totalSelected: topics, availableTotal: total };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, stats]);

  const maxQuestions = Math.min(DRILLING_LIMITS.MAX_QUESTIONS, Math.max(0, availableTotal));
  const effectiveCount = Math.min(count, maxQuestions || DRILLING_LIMITS.MIN_QUESTIONS);
  const canStart = totalSelected > 0 && availableTotal >= DRILLING_LIMITS.MIN_QUESTIONS;

  function toggleTopic(topic: string) {
    setSelected((prev) => {
      const next = new Set(prev[category]);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return { ...prev, [category]: next };
    });
  }
  function selectAll() {
    setSelected((prev) => ({ ...prev, [category]: new Set(DRILLING_TOPICS[category]) }));
  }
  function clearAll() {
    setSelected((prev) => ({ ...prev, [category]: new Set() }));
  }
  const allSelected = selectedSet.size === DRILLING_TOPICS[category].length;

  function clampCount(v: number) {
    const hi = maxQuestions || DRILLING_LIMITS.MAX_QUESTIONS;
    return Math.max(DRILLING_LIMITS.MIN_QUESTIONS, Math.min(hi, v));
  }
  function clampMinutes(v: number) {
    return Math.max(DRILLING_LIMITS.MIN_MINUTES, Math.min(DRILLING_LIMITS.MAX_MINUTES, v));
  }

  async function handleStart() {
    if (!canStart || starting) return;
    const selections = DRILLING_CATEGORIES.flatMap((cat) =>
      Array.from(selected[cat]).map((topic) => ({ category: cat, topic })),
    );
    setStarting(true);
    const toastId = toast.loading('Menyiapkan sesi drilling...');
    try {
      const res = await fetch('/api/drilling/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selections, count: effectiveCount, durationMinutes: minutes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Gagal memulai sesi');
      toast.success(`Sesi siap! ${data.total} soal`, { id: toastId });
      router.push(`/drilling/${data.attemptId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal memulai sesi', { id: toastId });
      setStarting(false);
    }
  }

  const involvedCats = DRILLING_CATEGORIES.filter((c) => selected[c].size > 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0 pb-24 md:pb-10">
      {/* ── HERO BANNER (selaras dengan halaman Statistik) ───── */}
      <div className="bg-slate-800 rounded-2xl p-4 md:p-5 mt-3 md:mt-0 mb-4 relative overflow-hidden shadow-xl border border-slate-700 flex items-center justify-between gap-3">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-xl md:text-2xl font-extrabold text-white mb-1 tracking-tight">
            Drilling <span className="text-yellow-400">Soal</span>
          </h1>
          <p className="text-slate-300 text-[11px] md:text-xs leading-relaxed">
            Latihan terfokus per topik TWK, TIU &amp; TKP (boleh dicampur). Atur jumlah soal &amp; waktu, lalu kerjakan.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-slate-700/40 rounded-2xl border border-slate-600 shadow-inner rotate-3 flex-shrink-0">
          <Target className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
        </div>
      </div>

      {/* ── Lanjutkan sesi + link riwayat ───────────────────── */}
      <div className="mb-4 space-y-2">
        {inProgress && (
          <Link
            href={`/drilling/${inProgress.id}`}
            className="flex items-center justify-between gap-3 rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3"
          >
            <span className="flex items-center gap-2 min-w-0">
              <RotateCcw className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="text-sm font-semibold text-amber-800 truncate">
                Lanjutkan sesi yang belum selesai
              </span>
            </span>
            <span className="text-xs font-bold text-amber-700 flex-shrink-0">Lanjutkan →</span>
          </Link>
        )}
        <div className="flex justify-end">
          <Link
            href="/drilling/riwayat"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <History className="w-3.5 h-3.5" /> Riwayat Drilling
          </Link>
        </div>
      </div>

      {/* ── Step 1: Kategori (dengan badge jumlah terpilih) ─── */}
      <SectionLabel step={1} title="Pilih kategori" />
      <div className="grid grid-cols-3 gap-2 mb-4">
        {DRILLING_CATEGORIES.map((cat) => {
          const isActive = cat === category;
          const t = CATEGORY_THEME[cat];
          const picked = selected[cat].size;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'relative rounded-xl border-2 px-3 py-2.5 text-left transition-all',
                isActive ? cn('ring-2', t.ring) : 'border-slate-200 bg-white hover:border-slate-300',
              )}
            >
              {picked > 0 && (
                <span
                  className={cn(
                    'absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center shadow',
                    t.badge,
                  )}
                >
                  {picked}
                </span>
              )}
              <div className="flex items-center justify-between">
                <span className={cn('text-base font-bold', isActive ? t.text : 'text-slate-700')}>
                  {cat}
                </span>
                {isActive && <span className={cn('w-2.5 h-2.5 rounded-full', t.dot)} />}
              </div>
              <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                {CATEGORY_LABEL[cat]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Step 2: Topik ──────────────────────────────────── */}
      <div className="flex items-center justify-between mb-2">
        <SectionLabel step={2} title={`Pilih topik ${category}`} noMargin />
        <button
          onClick={allSelected ? clearAll : selectAll}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          {allSelected ? 'Kosongkan' : (<><CheckCheck className="w-3.5 h-3.5" /> Pilih semua</>)}
        </button>
      </div>
      <div className="grid gap-1.5 sm:grid-cols-2 mb-4">
        {topicStats.map((t) => {
          const isOn = selectedSet.has(t.topic);
          const disabled = t.total === 0;
          return (
            <button
              key={t.topic}
              disabled={disabled}
              onClick={() => toggleTopic(t.topic)}
              className={cn(
                'flex items-center gap-2.5 rounded-xl border-2 px-3 py-2 text-left transition-all',
                disabled && 'opacity-40 cursor-not-allowed',
                isOn && !disabled ? cn('ring-1', theme.ring) : 'border-slate-200 bg-white hover:border-slate-300',
              )}
            >
              <span
                className={cn(
                  'flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors',
                  isOn ? cn(theme.active, 'border-transparent') : 'border-slate-300 bg-white',
                )}
              >
                {isOn && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-slate-700 truncate leading-tight">{t.topic}</span>
                <span className="block text-[11px] text-slate-400 leading-tight">{t.total} soal</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Step 3: Jumlah & Durasi ────────────────────────── */}
      <SectionLabel step={3} title="Atur sesi" />
      <div className="grid gap-2 sm:grid-cols-2 mb-4">
        <Stepper
          icon={<ListChecks className="w-4 h-4" />}
          label="Jumlah soal"
          value={effectiveCount}
          suffix="soal"
          onDec={() => setCount(clampCount(effectiveCount - 1))}
          onInc={() => setCount(clampCount(effectiveCount + 1))}
          presets={[10, 20, 30, 50].filter((p) => p <= (maxQuestions || DRILLING_LIMITS.MAX_QUESTIONS))}
          onPreset={(p) => setCount(clampCount(p))}
          hint={maxQuestions > 0 ? `maks ${maxQuestions}` : 'pilih topik dulu'}
        />
        <Stepper
          icon={<Clock className="w-4 h-4" />}
          label="Durasi"
          value={minutes}
          suffix="menit"
          onDec={() => setMinutes(clampMinutes(minutes - 5))}
          onInc={() => setMinutes(clampMinutes(minutes + 5))}
          presets={[10, 20, 30, 60]}
          onPreset={(p) => setMinutes(clampMinutes(p))}
          hint={`maks ${DRILLING_LIMITS.MAX_MINUTES} menit`}
        />
      </div>

      {/* ── Ringkasan + CTA (in-flow; aman dari bottom-nav PWA) ─ */}
      <SummaryBar
        involvedCats={involvedCats}
        topics={totalSelected}
        count={effectiveCount}
        minutes={minutes}
        canStart={canStart}
        starting={starting}
        onStart={handleStart}
      />
    </div>
  );
}

function SectionLabel({ step, title, noMargin }: { step: number; title: string; noMargin?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2', noMargin ? '' : 'mb-1.5')}>
      <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center">
        {step}
      </span>
      <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide">{title}</h2>
    </div>
  );
}

function Stepper({
  icon, label, value, suffix, onDec, onInc, presets, onPreset, hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
  onDec: () => void;
  onInc: () => void;
  presets: number[];
  onPreset: (p: number) => void;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          {icon} {label}
        </span>
        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>
      <div className="flex items-center justify-center gap-4 mb-2">
        <button
          onClick={onDec}
          className="w-9 h-9 rounded-lg border-2 border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="text-center min-w-[72px]">
          <span className="text-2xl font-bold text-slate-800 tabular-nums">{value}</span>
          <span className="block text-[10px] text-slate-400 -mt-0.5">{suffix}</span>
        </div>
        <button
          onClick={onInc}
          className="w-9 h-9 rounded-lg border-2 border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-1.5 justify-center">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => onPreset(p)}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-semibold border transition',
              value === p
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300',
            )}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryBar({
  involvedCats, topics, count, minutes, canStart, starting, onStart,
}: {
  involvedCats: string[];
  topics: number;
  count: number;
  minutes: number;
  canStart: boolean;
  starting: boolean;
  onStart: () => void;
}) {
  return (
    <div className="rounded-2xl bg-slate-800 p-3.5 flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
      <div className="text-white">
        <div className="flex items-center gap-2 text-sm font-semibold mb-0.5">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          Ringkasan sesi
        </div>
        <div className="text-xs text-slate-300">
          {involvedCats.length > 0 && (
            <span className="font-bold text-white">{involvedCats.join(' + ')} · </span>
          )}
          <span className="font-bold text-white">{topics}</span> topik ·{' '}
          <span className="font-bold text-white">{count}</span> soal ·{' '}
          <span className="font-bold text-white">{minutes}</span> menit
        </div>
      </div>
      <div className="w-full md:w-48 flex-shrink-0">
        <StartButton canStart={canStart} starting={starting} onStart={onStart} />
      </div>
    </div>
  );
}

function StartButton({
  canStart, starting, onStart,
}: {
  canStart: boolean;
  starting: boolean;
  onStart: () => void;
}) {
  return (
    <button
      onClick={onStart}
      disabled={!canStart || starting}
      className={cn(
        'w-full h-12 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all',
        canStart && !starting
          ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-300 active:scale-[0.99] shadow-sm'
          : 'bg-slate-200 text-slate-400 cursor-not-allowed',
      )}
    >
      {starting ? (
        <><Loader2 className="w-5 h-5 animate-spin" /> Menyiapkan...</>
      ) : canStart ? (
        <>Mulai Drilling <ArrowRight className="w-5 h-5" /></>
      ) : (
        'Pilih topik dulu'
      )}
    </button>
  );
}
