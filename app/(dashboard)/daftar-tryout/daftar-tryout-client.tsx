'use client';

import { useState, useMemo } from 'react';
import { PackageCardUser } from '@/components/shared/package-card-user';
import TryoutFilterTabs from '@/components/dashboard/user/TryoutFilterTabs';
import { TrendingUp, Search, X, FileText } from 'lucide-react';

type TierFilter = 'Semua' | 'Gratis' | 'Premium' | 'Platinum';

interface DaftarTryoutClientProps {
  packages: Array<{
    id: string;
    title: string;
    description?: string | null;
    difficulty: string;
    tier?: string;
    completedUsersCount: number;
    [key: string]: unknown;
  }>;
  packageIdsWithAttempts: string[];
}

const TIER_MAP: Record<TierFilter, string> = {
  'Semua':    '',
  'Gratis':   'free',
  'Premium':  'premium',
  'Platinum': 'platinum',
};

export function DaftarTryoutClient({ packages, packageIdsWithAttempts }: DaftarTryoutClientProps) {
  const [activeFilter, setActiveFilter] = useState<TierFilter>('Semua');
  const [search, setSearch] = useState('');
  const activeSet = new Set(packageIdsWithAttempts);

  const filtered = useMemo(() => {
    let result = activeFilter === 'Semua'
      ? packages
      : packages.filter(pkg => pkg.tier === TIER_MAP[activeFilter]);

    if (search.trim()) {
      result = result.filter(pkg =>
        pkg.title.toLowerCase().includes(search.trim().toLowerCase())
      );
    }

    return result;
  }, [packages, activeFilter, search]);

  return (
    <div className="space-y-5 pb-10">

      {/* ── HERO BANNER ──────────────────────────────────────────────── */}
      <div className="bg-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600 mb-4">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-300">Pusat Latihan SKD</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Daftar <span className="text-yellow-400">Tryout</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Semua paket simulasi SKD tersedia di sini. Ada total{' '}
            <span className="text-yellow-400 font-bold">{packages.length} paket</span>{' '}
            yang bisa Anda kerjakan. Pilih tryout yang sesuai dengan kebutuhan belajarmu dan mulailah berlatih!
          </p>
        </div>

        <div className="relative z-10 hidden md:flex items-center justify-center w-20 h-20 bg-slate-700/40 rounded-2xl border border-slate-600 shadow-inner rotate-3 flex-shrink-0">
          <FileText className="w-10 h-10 text-yellow-400" />
        </div>
      </div>

      {/* ── FILTER + SEARCH HEADER ───────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col gap-3">
          {/* Title + filter tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-slate-500 text-sm mt-0.5">
                Menampilkan{' '}
                <span className="font-medium text-slate-700">{filtered.length}</span>{' '}
                dari{' '}
                <span className="font-medium text-slate-700">{packages.length}</span>{' '}
                paket tersedia.
              </p>
            </div>
            <TryoutFilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama tryout..."
              className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── GRID / EMPTY STATE ───────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pkg) => (
            <PackageCardUser
              key={pkg.id}
              packageData={pkg as any}
              hasActiveAttempt={activeSet.has(pkg.id)}
              completedUsersCount={pkg.completedUsersCount}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            {search ? <Search className="h-7 w-7 text-slate-400" /> : <TrendingUp className="h-7 w-7 text-slate-400" />}
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            {search ? `Tidak ditemukan "${search}"` : `Tidak Ada Paket ${activeFilter !== 'Semua' ? activeFilter : ''}`}
          </h3>
          <p className="text-slate-500 text-sm">
            {search
              ? 'Coba kata kunci lain atau hapus pencarian.'
              : activeFilter === 'Semua'
                ? 'Paket tryout akan segera tersedia.'
                : `Belum ada paket tier ${activeFilter} saat ini.`}
          </p>
        </div>
      )}
    </div>
  );
}