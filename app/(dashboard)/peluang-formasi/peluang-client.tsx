'use client';

import Link from 'next/link';
import {
  Gauge,
  Target,
  Users,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TWK_CONFIG, TIU_CONFIG, TKP_CONFIG, TOTAL_MAX_SCORE } from '@/constants/scoring';
import type { PeluangFormasi } from '@/lib/supabase/peluang-formasi';

const CATS = [
  { key: 'twk' as const, label: 'TWK', cfg: TWK_CONFIG },
  { key: 'tiu' as const, label: 'TIU', cfg: TIU_CONFIG },
  { key: 'tkp' as const, label: 'TKP', cfg: TKP_CONFIG },
];

type Verdict = {
  label: string;
  ring: string;   // warna ring/aksen (hex)
  chip: string;   // kelas badge
  desc: string;
};

function getVerdict(d: PeluangFormasi): Verdict {
  if (!d.passing.all) {
    return {
      label: 'Belum Lolos Passing Grade',
      ring: '#f43f5e',
      chip: 'bg-rose-100 text-rose-700',
      desc: 'Ada kategori yang belum memenuhi nilai ambang. Perbaiki dulu agar memenuhi syarat dasar.',
    };
  }
  const p = d.percentile;
  if (p == null) {
    return { label: 'Lolos Passing Grade', ring: '#10b981', chip: 'bg-emerald-100 text-emerald-700', desc: 'Kamu memenuhi semua nilai ambang. Belum ada pembanding untuk posisi peringkat.' };
  }
  if (p >= 75) return { label: 'Peluang Besar', ring: '#10b981', chip: 'bg-emerald-100 text-emerald-700', desc: 'Nilaimu unggul dibanding mayoritas peserta. Pertahankan dan jaga konsistensi.' };
  if (p >= 50) return { label: 'Bersaing', ring: '#f59e0b', chip: 'bg-amber-100 text-amber-700', desc: 'Nilaimu di atas rata-rata, tapi persaingan ketat. Tingkatkan untuk lebih aman.' };
  return { label: 'Perlu Ditingkatkan', ring: '#fb923c', chip: 'bg-orange-100 text-orange-700', desc: 'Nilaimu masih di bawah sebagian besar peserta. Fokus latihan untuk naik peringkat.' };
}

export function PeluangFormasiClient({ data }: { data: PeluangFormasi }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0 pb-10">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <div className="bg-slate-800 rounded-2xl p-4 md:p-5 mt-3 md:mt-0 mb-4 relative overflow-hidden shadow-xl border border-slate-700 flex items-center justify-between gap-3">
        <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-xl md:text-2xl font-extrabold text-white mb-1 tracking-tight">
            Peluang <span className="text-yellow-400">Formasi</span>
          </h1>
          <p className="text-slate-300 text-[11px] md:text-xs leading-relaxed">
            Estimasi posisi nilai SKD-mu dibanding peserta PintuASN lain. Bukan hasil resmi BKN.
          </p>
        </div>
        <div className="relative z-10 flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-slate-700/40 rounded-2xl border border-slate-600 shadow-inner rotate-3 flex-shrink-0">
          <Gauge className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
        </div>
      </div>

      {!data.hasData ? <EmptyState /> : <Result data={data} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-14 rounded-2xl border-2 border-dashed border-slate-200">
      <ClipboardList className="w-9 h-9 text-slate-300 mx-auto mb-3" />
      <p className="text-sm font-semibold text-slate-700 mb-1">Belum ada nilai tryout</p>
      <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto">
        Kerjakan minimal satu tryout dulu agar peluang formasimu bisa dihitung.
      </p>
      <Link
        href="/daftar-tryout"
        className="inline-flex items-center gap-1.5 h-11 px-6 rounded-xl bg-yellow-400 text-slate-900 font-bold hover:bg-yellow-300 transition"
      >
        Mulai Tryout <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function Result({ data }: { data: PeluangFormasi }) {
  const v = getVerdict(data);
  const ringPct = data.percentile ?? 0;
  const weakest = [...CATS]
    .map((c) => ({ ...c, ratio: (data[c.key] - c.cfg.PASSING_GRADE) / c.cfg.MAX_SCORE }))
    .sort((a, b) => a.ratio - b.ratio)[0];
  const weakCat = weakest.label as 'TWK' | 'TIU' | 'TKP';

  return (
    <div className="space-y-4">
      {/* ── Verdict + persentil ──────────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-100 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div
            className="relative w-28 h-28 rounded-full flex-shrink-0"
            style={{ background: `conic-gradient(${v.ring} ${ringPct * 3.6}deg, #f1f5f9 0deg)` }}
          >
            <div className="absolute inset-[10px] bg-white rounded-full flex flex-col items-center justify-center">
              {data.percentile == null ? (
                <CheckCircle2 className="w-8 h-8" style={{ color: v.ring }} />
              ) : (
                <>
                  <span className="text-2xl font-bold text-slate-800 leading-none">{data.percentile}%</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">persentil</span>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <span className={cn('inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full mb-2', v.chip)}>
              {data.passing.all ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
              {v.label}
            </span>
            <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-xs text-slate-400">Nilai terbaikmu</span>
              <span className="text-xl font-bold text-slate-800">{data.finalScore}</span>
              <span className="text-xs text-slate-400">/ {TOTAL_MAX_SCORE}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Passing Grade per kategori ───────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-3">Status Nilai Ambang (Passing Grade)</h3>
        <div className="space-y-3">
          {CATS.map((c) => {
            const score = data[c.key];
            const passed = score >= c.cfg.PASSING_GRADE;
            const pct = Math.min((score / c.cfg.MAX_SCORE) * 100, 100);
            const minPct = Math.min((c.cfg.PASSING_GRADE / c.cfg.MAX_SCORE) * 100, 100);
            const gap = c.cfg.PASSING_GRADE - score;
            return (
              <div key={c.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-700">{c.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 tabular-nums">
                      {score} <span className="text-slate-300">/ {c.cfg.MAX_SCORE}</span>
                    </span>
                    <span className={cn(
                      'inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                      passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600',
                    )}>
                      {passed ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
                      {passed ? 'Lolos' : `-${gap}`}
                    </span>
                  </span>
                </div>
                <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={cn('h-full rounded-full', passed ? 'bg-emerald-500' : 'bg-rose-400')} style={{ width: `${pct}%` }} />
                  <div className="absolute top-0 bottom-0 w-0.5 bg-slate-400" style={{ left: `${minPct}%` }} title={`Ambang ${c.cfg.PASSING_GRADE}`} />
                </div>
                <div className="flex justify-end mt-0.5">
                  <span className="text-[10px] text-slate-400">ambang {c.cfg.PASSING_GRADE}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Posisi vs peserta ────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-sky-500" />
          <h3 className="font-bold text-slate-800 text-sm">Posisi Kamu</h3>
        </div>

        {data.percentile == null || data.peers === 0 ? (
          <p className="text-sm text-slate-500">
            Belum ada peserta lain sebagai pembanding. Posisimu akan muncul seiring bertambahnya peserta.
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              Nilaimu lebih tinggi dari{' '}
              <span className="font-bold text-slate-800">{data.percentile}%</span>{' '}
              peserta ({data.betterThan} dari {data.peers} pembanding).
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              {data.scope === 'instansi'
                ? <>Dibanding peserta yang mengincar <span className="font-semibold text-slate-700">{data.instansi}</span></>
                : <>Dibanding <span className="font-semibold text-slate-700">seluruh peserta PintuASN</span>{data.instansi ? ' (peserta untuk instansimu belum cukup)' : ''}</>}
            </div>
          </>
        )}

        {!data.instansi && (
          <Link href="/profile" className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700">
            <Info className="h-3.5 w-3.5" /> Atur instansi tujuan di profil untuk perbandingan lebih relevan
          </Link>
        )}
      </div>

      {/* ── Rekomendasi ──────────────────────────────────────── */}
      <div className="rounded-2xl bg-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-white">
          <div className="flex items-center gap-2 text-sm font-semibold mb-0.5">
            <Target className="w-4 h-4 text-yellow-400" /> Langkah berikutnya
          </div>
          <p className="text-xs text-slate-300">
            {data.passing.all
              ? <>Fokus naikkan kategori terlemahmu: <span className="font-bold text-white">{weakCat}</span>.</>
              : <>Prioritaskan kategori yang belum lolos ambang.</>}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/drilling?cat=${weakCat}`} className="h-10 px-4 inline-flex items-center gap-1.5 rounded-xl bg-yellow-400 text-slate-900 text-sm font-bold hover:bg-yellow-300 transition">
            Drilling {weakCat}
          </Link>
          <Link href="/statistics" className="h-10 px-4 inline-flex items-center rounded-xl border border-slate-600 text-slate-200 text-sm font-semibold hover:bg-slate-700 transition">
            Statistik
          </Link>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 text-center px-4">
        Estimasi berdasarkan data pengguna PintuASN dan aturan nilai ambang resmi. Bukan prediksi hasil resmi BKN.
      </p>
    </div>
  );
}
