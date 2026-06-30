'use client';

import { useState } from 'react';
import Link from 'next/link';
import { INSTANSI } from '@/constants/instansi';
import SearchableDropdown from '@/components/onboarding/searchable-dropdown';
import {
  Gauge,
  Target,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  ClipboardList,
  Trophy,
  Sparkles,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TWK_CONFIG, TIU_CONFIG, TKP_CONFIG, TOTAL_MAX_SCORE } from '@/constants/scoring';
import type { PeluangFormasi } from '@/lib/supabase/peluang-formasi';

const CATS = [
  { key: 'twk' as const, label: 'TWK', cfg: TWK_CONFIG },
  { key: 'tiu' as const, label: 'TIU', cfg: TIU_CONFIG },
  { key: 'tkp' as const, label: 'TKP', cfg: TKP_CONFIG },
];

// Sampel instansi dianggap "cukup" untuk persaingan bila >= ini (selain kamu).
const INSTANSI_ENOUGH = 7;

type Verdict = { label: string; ring: string; chip: string; desc: string };

function getVerdict(d: PeluangFormasi): Verdict {
  if (!d.passing.all) {
    return {
      label: 'Belum Lolos Passing Grade',
      ring: '#f43f5e',
      chip: 'bg-rose-100 text-rose-700',
      desc: 'Ada kategori yang belum memenuhi nilai ambang. Penuhi dulu syarat dasarnya.',
    };
  }
  const p = d.nationalPercentile;
  if (p == null) return { label: 'Lolos Passing Grade', ring: '#10b981', chip: 'bg-emerald-100 text-emerald-700', desc: 'Kamu memenuhi semua nilai ambang. Belum ada pembanding untuk peringkat.' };
  if (p >= 75) return { label: 'Peluang Besar', ring: '#10b981', chip: 'bg-emerald-100 text-emerald-700', desc: 'Nilaimu unggul dibanding mayoritas peserta. Pertahankan konsistensi.' };
  if (p >= 50) return { label: 'Bersaing', ring: '#f59e0b', chip: 'bg-amber-100 text-amber-700', desc: 'Nilaimu di atas rata-rata, tapi persaingan ketat. Tingkatkan agar lebih aman.' };
  return { label: 'Perlu Ditingkatkan', ring: '#fb923c', chip: 'bg-orange-100 text-orange-700', desc: 'Nilaimu masih di bawah sebagian besar peserta. Fokus latihan untuk naik.' };
}

export function PeluangFormasiClient({ data }: { data: PeluangFormasi }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0 pb-10">
      <div className="bg-slate-800 rounded-2xl p-3.5 md:p-4 mt-2 md:mt-0 mb-3 relative overflow-hidden shadow-xl border border-slate-700 flex items-center justify-between gap-3">
        <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-xl md:text-2xl font-extrabold text-white mb-1 tracking-tight">
            Peluang <span className="text-yellow-400">Formasi</span>
          </h1>
          <p className="text-slate-300 text-[11px] md:text-xs leading-relaxed">
            Bandingkan nilai SKD-mu dengan peserta PintuASN lain di instansi yang sama. Estimasi, bukan hasil resmi BKN.
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
      <Link href="/daftar-tryout" className="inline-flex items-center gap-1.5 h-11 px-6 rounded-xl bg-yellow-400 text-slate-900 font-bold hover:bg-yellow-300 transition">
        Mulai Tryout <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// Bar posisi nasional dengan penanda persentil di atas gradasi merah→hijau.
function StandingBar({ percentile, peers }: { percentile: number; peers: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-slate-600">Se-nasional</span>
        <span className="text-[11px] text-slate-400">{peers.toLocaleString('id-ID')} peserta PintuASN</span>
      </div>
      <div
        className="relative h-3 rounded-full"
        style={{ background: 'linear-gradient(to right, #fecdd3, #fde68a, #a7f3d0)' }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-[3px] border-slate-800 shadow-sm"
          style={{ left: `calc(${percentile}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-slate-400">
        <span>Terendah</span>
        <span>Tertinggi</span>
      </div>
      <p className="text-xs text-slate-600 mt-2">
        Kamu di <span className="font-bold text-slate-800">persentil {percentile}</span>, lebih tinggi
        dari <span className="font-bold text-slate-800">{percentile}%</span> peserta.
      </p>
    </div>
  );
}

function Result({ data }: { data: PeluangFormasi }) {
  const v = getVerdict(data);
  const ringPct = data.nationalPercentile ?? 0;
  const weakest = [...CATS]
    .map((c) => ({ ...c, ratio: (data[c.key] - c.cfg.PASSING_GRADE) / c.cfg.MAX_SCORE }))
    .sort((a, b) => a.ratio - b.ratio)[0];
  const weakCat = weakest.label as 'TWK' | 'TIU' | 'TKP';

  // Perbandingan instansi: default ke instansi tujuan user, bisa diganti.
  const [selectedInst, setSelectedInst] = useState<string>(data.instansi ?? '');
  const [cmp, setCmp] = useState<{ peers: number; better: number; percentile: number | null; rank: number | null }>({
    peers: data.instansiPeers,
    better: data.instansiBetter,
    percentile: data.instansiPercentile,
    rank: data.instansiRank,
  });
  const [loadingCmp, setLoadingCmp] = useState(false);

  async function onPickInstansi(nama: string) {
    setSelectedInst(nama);
    if (!nama) return;
    setLoadingCmp(true);
    try {
      const res = await fetch(`/api/peluang-formasi?instansi=${encodeURIComponent(nama)}`);
      const d = await res.json();
      setCmp({ peers: d.peers ?? 0, better: d.better ?? 0, percentile: d.percentile ?? null, rank: d.rank ?? null });
    } catch {
      /* abaikan error jaringan */
    } finally {
      setLoadingCmp(false);
    }
  }

  const isOwnInst = !!data.instansi && selectedInst === data.instansi;
  const instTotalSel = cmp.peers + 1;
  const instSmallSample = cmp.peers > 0 && instTotalSel < INSTANSI_ENOUGH;

  return (
    <div className="space-y-3">
      {/* ── Verdict + persentil nasional ─────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full flex-shrink-0" style={{ background: `conic-gradient(${v.ring} ${ringPct * 3.6}deg, #f1f5f9 0deg)` }}>
            <div className="absolute inset-[7px] bg-white rounded-full flex flex-col items-center justify-center">
              {data.nationalPercentile == null ? (
                <CheckCircle2 className="w-6 h-6" style={{ color: v.ring }} />
              ) : (
                <>
                  <span className="text-lg font-bold text-slate-800 leading-none">{data.nationalPercentile}%</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">persentil</span>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <span className={cn('inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full mb-1.5', v.chip)}>
              {data.passing.all ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
              {v.label}
            </span>
            <p className="text-xs text-slate-500 leading-snug">{v.desc}</p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-[11px] text-slate-400">Nilai terbaikmu</span>
              <span className="text-lg font-bold text-slate-800">{data.finalScore}</span>
              <span className="text-[11px] text-slate-400">/ {TOTAL_MAX_SCORE}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Posisi & Instansi Tujuan ─────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-sky-500" />
          <h3 className="font-bold text-slate-800 text-sm">Posisi Kamu</h3>
        </div>

        {/* Posisi nasional: visual utama (data nyata) */}
        {data.nationalPercentile != null ? (
          <StandingBar percentile={data.nationalPercentile} peers={data.nationalPeers} />
        ) : (
          <p className="text-sm text-slate-500">Belum ada peserta lain sebagai pembanding nasional.</p>
        )}

        {/* Bandingkan dengan instansi (bisa pilih instansi lain) */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Bandingkan per instansi</span>
          </div>
          <SearchableDropdown
            value={selectedInst}
            onChange={onPickInstansi}
            options={INSTANSI}
            placeholder="Cari instansi..."
          />

          <div className="mt-2">
            {loadingCmp ? (
              <p className="text-sm text-slate-400">Menghitung...</p>
            ) : !selectedInst ? (
              <p className="text-xs text-slate-400">Pilih instansi untuk melihat posisimu di antara pesertanya.</p>
            ) : cmp.peers === 0 ? (
              <div className="flex items-start gap-2.5 rounded-xl bg-sky-50 border border-sky-100 px-3.5 py-3">
                <Sparkles className="h-4 w-4 text-sky-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-sky-800 leading-relaxed">
                  Belum ada peserta lain yang memilih <span className="font-bold">{selectedInst}</span>
                  {isOwnInst ? ' (instansi tujuanmu)' : ''}. Pakai posisi nasional di atas sebagai acuan.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-stretch gap-3">
                  <div className="flex-shrink-0 w-24 rounded-xl bg-sky-50 border border-sky-100 flex flex-col items-center justify-center py-3">
                    <div className="flex items-center gap-1 text-sky-600">
                      <Trophy className="h-3.5 w-3.5" />
                      <span className="text-2xl font-extrabold leading-none">#{cmp.rank}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">dari {instTotalSel} peserta</span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-sm text-slate-600 mb-2">
                      {isOwnInst ? 'Di instansi tujuanmu' : 'Di instansi ini'}, nilaimu lebih tinggi dari{' '}
                      <span className="font-bold text-slate-800">{cmp.better}</span> peserta
                      {' '}(<span className="font-bold text-sky-600">{cmp.percentile}%</span>).
                    </p>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-sky-500" style={{ width: `${cmp.percentile}%` }} />
                    </div>
                  </div>
                </div>
                {instSmallSample && (
                  <p className="text-[11px] text-amber-600 mt-2.5 flex items-start gap-1">
                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    Peserta instansi ini masih sedikit, anggap sebagai gambaran awal.
                  </p>
                )}
              </>
            )}
          </div>

          {!data.instansi && (
            <p className="mt-2.5 text-[11px] text-slate-400">
              Belum mengatur instansi tujuan?{' '}
              <Link href="/profile" className="text-sky-600 font-semibold">Atur di profil</Link>.
            </p>
          )}
        </div>
      </div>

      {/* ── Passing Grade per kategori ───────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-2">Status Nilai Ambang (Passing Grade)</h3>
        <div className="space-y-2">
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
                    <span className="text-xs text-slate-500 tabular-nums">{score} <span className="text-slate-300">/ {c.cfg.MAX_SCORE}</span></span>
                    <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full', passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600')}>
                      {passed ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
                      {passed ? 'Lolos' : `-${gap}`}
                    </span>
                  </span>
                </div>
                <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={cn('h-full rounded-full', passed ? 'bg-emerald-500' : 'bg-rose-400')} style={{ width: `${pct}%` }} />
                  <div className="absolute top-0 bottom-0 w-0.5 bg-slate-400" style={{ left: `${minPct}%` }} />
                </div>
                <div className="flex justify-end mt-0.5"><span className="text-[10px] text-slate-400">ambang {c.cfg.PASSING_GRADE}</span></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Rekomendasi ──────────────────────────────────────── */}
      <div className="rounded-2xl bg-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-white">
          <div className="flex items-center gap-2 text-sm font-semibold mb-0.5">
            <Target className="w-4 h-4 text-yellow-400" /> Langkah berikutnya
          </div>
          <p className="text-xs text-slate-300">
            {data.passing.all
              ? <>Naikkan kategori terlemahmu: <span className="font-bold text-white">{weakCat}</span> agar peringkatmu naik.</>
              : <>Prioritaskan kategori yang belum lolos ambang.</>}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/drilling?cat=${weakCat}`} className="h-9 px-4 inline-flex items-center rounded-xl bg-yellow-400 text-slate-900 text-sm font-bold hover:bg-yellow-300 transition">Drilling {weakCat}</Link>
          <Link href="/statistics" className="h-9 px-4 inline-flex items-center rounded-xl border border-slate-600 text-slate-200 text-sm font-semibold hover:bg-slate-700 transition">Statistik</Link>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 text-center px-4">
        Estimasi berdasarkan data pengguna PintuASN dan aturan nilai ambang resmi. Bukan prediksi hasil resmi BKN.
      </p>
    </div>
  );
}
