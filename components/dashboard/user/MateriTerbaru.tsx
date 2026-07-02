'use client';

// ============================================================
// components/dashboard/user/MateriTerbaru.tsx
//
// Section "Materi Terbaru" di dashboard (desktop).
// Menampilkan modul materi (material_modules) terbaru — bukan lagi
// video/pdf. Prioritas: modul ber-flag "Baru", lalu isi berikutnya.
// Kartu me-link ke halaman /materi (reader modul dibuka di sana).
// ============================================================

import Link from 'next/link';
import {
  BookOpen, ChevronRight, Clock, Lock, Sparkles,
  Landmark, Brain, HeartHandshake, Info,
} from 'lucide-react';
import { canAccess }             from '@/lib/subscription-utils';
import type { SubscriptionTier } from '@/lib/subscription-utils';

// ── Tipe modul (subset dari material_modules) ─────────────────

export interface MateriModuleLite {
  id:             string;
  category:       'TWK' | 'TIU' | 'TKP' | 'INFORMASI';
  topic:          string;
  title:          string;
  tier:           'free' | 'premium' | 'platinum';
  read_minutes:   number | null;
  is_new:         boolean;
  is_placeholder: boolean;
}

// ── Konfigurasi kategori (warna + ikon + label) ───────────────

const CAT: Record<string, {
  label: string; icon: React.ElementType;
  chip: string; iconWrap: string; accent: string;
}> = {
  INFORMASI: {
    label: 'Informasi CPNS', icon: Info,
    chip: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    iconWrap: 'bg-indigo-500', accent: 'from-indigo-500/10',
  },
  TWK: {
    label: 'TWK', icon: Landmark,
    chip: 'bg-sky-50 text-sky-600 border-sky-100',
    iconWrap: 'bg-sky-500', accent: 'from-sky-500/10',
  },
  TIU: {
    label: 'TIU', icon: Brain,
    chip: 'bg-violet-50 text-violet-600 border-violet-100',
    iconWrap: 'bg-violet-500', accent: 'from-violet-500/10',
  },
  TKP: {
    label: 'TKP', icon: HeartHandshake,
    chip: 'bg-amber-50 text-amber-600 border-amber-100',
    iconWrap: 'bg-amber-500', accent: 'from-amber-500/10',
  },
};

const TIER_BADGE: Record<string, string> = {
  premium:  'bg-sky-100 text-sky-700 border-sky-200',
  platinum: 'bg-purple-100 text-purple-700 border-purple-200',
};

// Pilih materi terbaru: buang placeholder, dahulukan yang "Baru", lalu
// ambil bergiliran antar kategori (round-robin) supaya preview bervariasi.
const CAT_ORDER = ['INFORMASI', 'TWK', 'TIU', 'TKP'] as const;

export function pickLatest<T extends { category: string; is_new: boolean; is_placeholder: boolean }>(
  modules: T[],
  limit: number,
): T[] {
  const pool = [...modules]
    .filter(m => !m.is_placeholder)
    .sort((a, b) => Number(b.is_new) - Number(a.is_new));

  const byCat = new Map<string, T[]>();
  for (const m of pool) {
    if (!byCat.has(m.category)) byCat.set(m.category, []);
    byCat.get(m.category)!.push(m);
  }

  const result: T[] = [];
  let added = true;
  while (result.length < limit && added) {
    added = false;
    for (const c of CAT_ORDER) {
      const arr = byCat.get(c);
      if (arr && arr.length) {
        result.push(arr.shift()!);
        added = true;
        if (result.length >= limit) break;
      }
    }
  }
  return result;
}

export default function MateriTerbaru({
  modules, userTier,
}: {
  modules:  MateriModuleLite[];
  userTier: SubscriptionTier;
}) {
  const items = pickLatest(modules, 6);

  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-400 text-sm">Materi akan segera hadir.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(m => {
          const cat        = CAT[m.category] ?? CAT.INFORMASI;
          const Icon       = cat.icon;
          const accessible = canAccess(userTier, m.tier);
          const isPaid     = m.tier !== 'free';

          return (
            <Link
              key={m.id}
              href="/materi"
              className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-4 overflow-hidden transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Aksen gradien pojok */}
              <div className={`pointer-events-none absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${cat.accent} to-transparent blur-2xl`} />

              {/* Header: ikon kategori + badge */}
              <div className="relative flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${cat.iconWrap} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div className="flex items-center gap-1.5">
                  {m.is_new && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                      <Sparkles size={9} /> Baru
                    </span>
                  )}
                  {!accessible && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-500">
                      <Lock size={11} />
                    </span>
                  )}
                </div>
              </div>

              {/* Kategori + topik */}
              <div className="relative flex items-center gap-1.5 mb-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.chip}`}>
                  {cat.label}
                </span>
                <span className="text-[11px] text-slate-400 font-medium truncate">{m.topic}</span>
              </div>

              {/* Judul */}
              <h3 className="relative text-sm font-bold text-slate-800 leading-snug line-clamp-2 mb-4 min-h-[2.5rem]">
                {m.title}
              </h3>

              {/* Footer */}
              <div className="relative mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {m.read_minutes ? (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <Clock size={11} /> {m.read_minutes} mnt
                    </span>
                  ) : <span />}
                  {isPaid && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border capitalize ${TIER_BADGE[m.tier]}`}>
                      {m.tier}
                    </span>
                  )}
                </div>
                <span className="flex items-center gap-0.5 text-[11px] font-bold text-slate-700 group-hover:text-slate-900 group-hover:gap-1.5 transition-all">
                  {accessible ? 'Baca' : 'Lihat'}
                  <ChevronRight size={13} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* CTA */}
      <Link href="/materi">
        <button className="w-full py-2.5 rounded-xl bg-slate-800 text-yellow-400 text-sm font-bold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
          <BookOpen size={15} />
          Lihat Semua Materi
        </button>
      </Link>
    </div>
  );
}
