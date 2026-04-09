// ============================================================
// app/(admin)/admin/analytics/page.tsx
// ============================================================

import { requireAdmin }  from '@/lib/auth/check-admin';
import { createClient }  from '@/lib/supabase/server';
import {
  Users, TrendingUp, CreditCard, BookOpen,
  FileQuestion, Package, CheckCircle, XCircle,
  BarChart3, Award, Percent, Tag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const revalidate = 3600; // cache 1 jam

// ── helpers ───────────────────────────────────────────────────
function fmt(n: number) { return n.toLocaleString('id-ID'); }
function fmtRp(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000)     return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  return `Rp ${fmt(n)}`;
}
function fmtPct(val: number, total: number) {
  if (!total) return '0%';
  return `${((val / total) * 100).toFixed(1)}%`;
}

// ── data fetching ─────────────────────────────────────────────
async function getAnalytics() {
  const supabase = await createClient();

  const now              = new Date();
  const startOfMonth     = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
  const thirtyDaysAgo    = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalUsers, newUsersThisMonth, newUsersLastMonth, activeUsers,
    tierDistribution, genderDistribution, referralSources,
    totalRevenue, revenueThisMonth, revenueLastMonth,
    txSuccess, txPending, txFailed, topPackagesByRevenue,
    referralCodesUsage, ordersWithReferral,
    totalAttempts, completedAttempts, abandonedAttempts, passedAttempts,
    avgScores, topPackagesByAttempt,
    totalQuestions, publishedQuestions, questionsByCategory,
    totalMaterials, packagesByTier, materialViews,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfLastMonth).lte('created_at', endOfLastMonth),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('updated_at', thirtyDaysAgo).eq('is_deleted', false),
    supabase.from('profiles').select('subscription_tier').eq('is_deleted', false),
    supabase.from('profiles').select('gender').eq('is_deleted', false),
    supabase.from('profiles').select('referral_source').eq('is_deleted', false).not('referral_source', 'is', null),
    supabase.from('payment_orders').select('final_price').eq('status', 'settlement'),
    supabase.from('payment_orders').select('final_price').eq('status', 'settlement').gte('created_at', startOfMonth),
    supabase.from('payment_orders').select('final_price').eq('status', 'settlement').gte('created_at', startOfLastMonth).lte('created_at', endOfLastMonth),
    supabase.from('payment_orders').select('*', { count: 'exact', head: true }).eq('status', 'settlement'),
    supabase.from('payment_orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('payment_orders').select('*', { count: 'exact', head: true }).eq('status', 'cancel'),
    supabase.from('payment_orders').select('package_name, final_price').eq('status', 'settlement'),
    supabase.from('referral_codes').select('code, name, used_count, discount_type, discount_value, max_uses, is_active').order('used_count', { ascending: false }),
    supabase.from('payment_orders').select('referral_code, discount_amount').eq('status', 'settlement').not('referral_code', 'is', null),
    supabase.from('attempts').select('*', { count: 'exact', head: true }),
    supabase.from('attempts').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('attempts').select('*', { count: 'exact', head: true }).eq('status', 'abandoned'),
    supabase.from('attempts').select('*', { count: 'exact', head: true }).eq('is_passed', true),
    supabase.from('attempts').select('score_twk, score_tiu, score_tkp, final_score').eq('status', 'completed'),
    supabase.from('attempts').select('package_id, packages(title)').eq('status', 'completed'),
    supabase.from('questions').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('questions').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('questions').select('category').eq('is_deleted', false),
    supabase.from('materials').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('is_deleted', false),
    supabase.from('packages').select('tier').eq('is_active', true).eq('is_deleted', false),
    supabase.from('material_views').select('*', { count: 'exact', head: true }),
  ]);

  // ── process ──────────────────────────────────────────────
  const sumRev = (rows: { final_price: number }[] | null) =>
    (rows ?? []).reduce((s, r) => s + (r.final_price ?? 0), 0);

  const totalRevenueVal     = sumRev(totalRevenue.data);
  const revenueThisMonthVal = sumRev(revenueThisMonth.data);
  const revenueLastMonthVal = sumRev(revenueLastMonth.data);
  const revenueGrowth = revenueLastMonthVal
    ? (((revenueThisMonthVal - revenueLastMonthVal) / revenueLastMonthVal) * 100).toFixed(1) : null;

  const userGrowth = (newUsersLastMonth.count ?? 0)
    ? ((((newUsersThisMonth.count ?? 0) - (newUsersLastMonth.count ?? 0)) / (newUsersLastMonth.count ?? 1)) * 100).toFixed(1) : null;

  const tierMap: Record<string, number> = {};
  (tierDistribution.data ?? []).forEach(r => { const t = r.subscription_tier ?? 'free'; tierMap[t] = (tierMap[t] ?? 0) + 1; });

  const genderMap: Record<string, number> = {};
  (genderDistribution.data ?? []).forEach(r => { const g = r.gender ?? 'unknown'; genderMap[g] = (genderMap[g] ?? 0) + 1; });

  const refMap: Record<string, number> = {};
  (referralSources.data ?? []).forEach(r => { const s = r.referral_source ?? 'unknown'; refMap[s] = (refMap[s] ?? 0) + 1; });
  const refSorted = Object.entries(refMap).sort((a, b) => b[1] - a[1]);

  const totalDiscountGiven   = (ordersWithReferral.data ?? []).reduce((s, r) => s + (r.discount_amount ?? 0), 0);
  const referralCodesList    = (referralCodesUsage.data ?? []).map(r => ({
    code: r.code, name: r.name ?? r.code,
    usedCount: r.used_count ?? 0, maxUses: r.max_uses,
    discountType: r.discount_type, discountValue: r.discount_value, isActive: r.is_active,
  }));

  const scoreRows = avgScores.data ?? [];
  const avgTWK   = scoreRows.length ? Math.round(scoreRows.reduce((s, r) => s + (r.score_twk ?? 0), 0) / scoreRows.length) : 0;
  const avgTIU   = scoreRows.length ? Math.round(scoreRows.reduce((s, r) => s + (r.score_tiu ?? 0), 0) / scoreRows.length) : 0;
  const avgTKP   = scoreRows.length ? Math.round(scoreRows.reduce((s, r) => s + (r.score_tkp ?? 0), 0) / scoreRows.length) : 0;
  const avgFinal = scoreRows.length ? Math.round(scoreRows.reduce((s, r) => s + (r.final_score ?? 0), 0) / scoreRows.length) : 0;

  const pkgMap: Record<string, { title: string; count: number }> = {};
  (topPackagesByAttempt.data ?? []).forEach((r: any) => {
    const pid = r.package_id;
    const title = (Array.isArray(r.packages) ? r.packages[0]?.title : r.packages?.title) ?? pid;
    if (!pkgMap[pid]) pkgMap[pid] = { title, count: 0 };
    pkgMap[pid].count++;
  });
  const topPkgs = Object.values(pkgMap).sort((a, b) => b.count - a.count).slice(0, 5);

  const pkgRevMap: Record<string, { title: string; total: number }> = {};
  (topPackagesByRevenue.data ?? []).forEach(r => {
    const k = r.package_name;
    if (!pkgRevMap[k]) pkgRevMap[k] = { title: k, total: 0 };
    pkgRevMap[k].total += r.final_price ?? 0;
  });
  const topPkgRev = Object.values(pkgRevMap).sort((a, b) => b.total - a.total).slice(0, 5);

  const catMap: Record<string, number> = {};
  (questionsByCategory.data ?? []).forEach(r => { const c = r.category ?? 'unknown'; catMap[c] = (catMap[c] ?? 0) + 1; });

  const pkgTierMap: Record<string, number> = {};
  (packagesByTier.data ?? []).forEach(r => { const t = r.tier ?? 'free'; pkgTierMap[t] = (pkgTierMap[t] ?? 0) + 1; });
  const totalPackagesCount = Object.values(pkgTierMap).reduce((s, v) => s + v, 0);

  return {
    users:   { total: totalUsers.count ?? 0, newThisMonth: newUsersThisMonth.count ?? 0, newLastMonth: newUsersLastMonth.count ?? 0, active30d: activeUsers.count ?? 0, growth: userGrowth, tiers: tierMap, genders: genderMap, refSources: refSorted },
    revenue: { total: totalRevenueVal, thisMonth: revenueThisMonthVal, lastMonth: revenueLastMonthVal, growth: revenueGrowth, txSuccess: txSuccess.count ?? 0, txPending: txPending.count ?? 0, txFailed: txFailed.count ?? 0, topPackages: topPkgRev, referralCodes: referralCodesList, totalDiscountGiven, totalOrdersWithRef: ordersWithReferral.data?.length ?? 0 },
    attempts: { total: totalAttempts.count ?? 0, completed: completedAttempts.count ?? 0, abandoned: abandonedAttempts.count ?? 0, passed: passedAttempts.count ?? 0, avgTWK, avgTIU, avgTKP, avgFinal, topPackages: topPkgs },
    content:  { totalQuestions: totalQuestions.count ?? 0, publishedQuestions: publishedQuestions.count ?? 0, questionsByCategory: catMap, totalMaterials: totalMaterials.count ?? 0, totalPackages: totalPackagesCount, pkgTiers: pkgTierMap, materialViews: materialViews.count ?? 0 },
  };
}

// ── sub-components ────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, bg }: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string; bg: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{label}</CardTitle>
        <div className={cn('p-2 rounded-lg', bg)}><Icon className={cn('h-5 w-5', color)} /></div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">{children}</h2>;
}

// Label tampil penuh — tidak truncate
function BarRow({ label, value, max, display }: { label: string; value: number; max: number; display: string }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-slate-600 leading-snug">{label}</span>
        <span className="text-sm font-semibold text-slate-700 shrink-0">{display}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────
export default async function AnalyticsPage() {
  await requireAdmin();
  const d = await getAnalytics();

  const totalTx       = d.revenue.txSuccess + d.revenue.txPending + d.revenue.txFailed;
  const maxPkgAttempt = d.attempts.topPackages[0]?.count ?? 1;
  const maxPkgRev     = d.revenue.topPackages[0]?.total ?? 1;
  const maxRef        = d.users.refSources[0]?.[1] ?? 1;
  const maxRefCode    = d.revenue.referralCodes[0]?.usedCount ?? 1;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-blue-600" /> Analytics
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Data diperbarui setiap 1 jam</p>
      </div>

      {/* ── USERS ── */}
      <section>
        <SectionTitle>👥 User & Pertumbuhan</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total User"          value={fmt(d.users.total)}        icon={Users}       color="text-blue-600"    bg="bg-blue-100"    sub="Semua user terdaftar" />
          <StatCard label="User Baru Bulan Ini" value={fmt(d.users.newThisMonth)} icon={TrendingUp}  color="text-emerald-600" bg="bg-emerald-100" sub={d.users.growth ? `${d.users.growth}% vs bulan lalu` : undefined} />
          <StatCard label="User Aktif 30 Hari"  value={fmt(d.users.active30d)}   icon={CheckCircle} color="text-violet-600"  bg="bg-violet-100"  sub={fmtPct(d.users.active30d, d.users.total) + ' dari total'} />
          <StatCard label="Bulan Lalu"          value={fmt(d.users.newLastMonth)} icon={Users}       color="text-slate-600"   bg="bg-slate-100"   sub="User baru bulan lalu" />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold text-slate-700">Distribusi Subscription</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[['free','bg-slate-400'],['premium','bg-blue-500'],['platinum','bg-amber-500']].map(([tier, color]) => {
                const count = d.users.tiers[tier] ?? 0;
                return (
                  <div key={tier} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', color)} />
                      <span className="text-sm text-slate-600 capitalize">{tier}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{fmt(count)}</span>
                      <span className="text-xs text-slate-400">({fmtPct(count, d.users.total)})</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold text-slate-700">Distribusi Gender</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[['male','Laki-laki','bg-blue-400'],['female','Perempuan','bg-pink-400'],['other','Lainnya','bg-slate-400']].map(([key, label, color]) => {
                const count = d.users.genders[key] ?? 0;
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', color)} />
                      <span className="text-sm text-slate-600">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{fmt(count)}</span>
                      <span className="text-xs text-slate-400">({fmtPct(count, d.users.total)})</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold text-slate-700">Sumber Referral</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {d.users.refSources.length === 0 && <p className="text-xs text-slate-400">Belum ada data</p>}
              {d.users.refSources.map(([src, count]) => (
                <BarRow key={src} label={src} value={count} max={maxRef} display={fmt(count)} />
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── REVENUE ── */}
      <section>
        <SectionTitle>💰 Revenue & Transaksi</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Pendapatan"     value={fmtRp(d.revenue.total)}      icon={CreditCard}  color="text-emerald-600" bg="bg-emerald-100" />
          <StatCard label="Pendapatan Bulan Ini" value={fmtRp(d.revenue.thisMonth)}  icon={TrendingUp}  color="text-blue-600"    bg="bg-blue-100"    sub={d.revenue.growth ? `${d.revenue.growth}% vs bulan lalu` : undefined} />
          <StatCard label="Bulan Lalu"           value={fmtRp(d.revenue.lastMonth)}  icon={CreditCard}  color="text-slate-600"   bg="bg-slate-100"   />
          <StatCard label="Transaksi Sukses"     value={fmt(d.revenue.txSuccess)}    icon={CheckCircle} color="text-emerald-600" bg="bg-emerald-100" sub={fmtPct(d.revenue.txSuccess, totalTx) + ' dari total'} />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold text-slate-700">Status Transaksi</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Sukses',  count: d.revenue.txSuccess, color: 'bg-emerald-400' },
                { label: 'Pending', count: d.revenue.txPending, color: 'bg-amber-400'   },
                { label: 'Gagal',   count: d.revenue.txFailed,  color: 'bg-red-400'     },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', color)} />
                    <span className="text-sm text-slate-600">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{fmt(count)}</span>
                    <span className="text-xs text-slate-400">({fmtPct(count, totalTx)})</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold text-slate-700">Paket Terlaris (Revenue)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {d.revenue.topPackages.length === 0 && <p className="text-xs text-slate-400">Belum ada data</p>}
              {d.revenue.topPackages.map(pkg => (
                <BarRow key={pkg.title} label={pkg.title} value={pkg.total} max={maxPkgRev} display={fmtRp(pkg.total)} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Referral Codes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Penggunaan Kode Referral</CardTitle>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>Order pakai kode: <strong className="text-slate-700">{fmt(d.revenue.totalOrdersWithRef)}</strong></span>
                <span>Total diskon: <strong className="text-emerald-600">{fmtRp(d.revenue.totalDiscountGiven)}</strong></span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {d.revenue.referralCodes.length === 0 && <p className="text-xs text-slate-400">Belum ada kode referral</p>}
            <div className="space-y-4">
              {d.revenue.referralCodes.map(rc => (
                <div key={rc.code} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Tag size={13} className="text-slate-400 shrink-0" />
                      <span className="font-mono text-sm font-semibold text-slate-800">{rc.code}</span>
                      {rc.name !== rc.code && <span className="text-xs text-slate-400">({rc.name})</span>}
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-semibold', rc.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                        {rc.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Diskon: <strong className="text-slate-700">{rc.discountType === 'percent' ? `${rc.discountValue}%` : fmtRp(rc.discountValue)}</strong></span>
                      <span>Dipakai: <strong className="text-slate-700">{fmt(rc.usedCount)}{rc.maxUses ? ` / ${fmt(rc.maxUses)}` : ''}</strong></span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${maxRefCode ? Math.round((rc.usedCount / maxRefCode) * 100) : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── ATTEMPTS ── */}
      <section>
        <SectionTitle>📝 Tryout & Engagement</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Attempt" value={fmt(d.attempts.total)}     icon={FileQuestion} color="text-blue-600"    bg="bg-blue-100"    />
          <StatCard label="Selesai"       value={fmt(d.attempts.completed)} icon={CheckCircle}  color="text-emerald-600" bg="bg-emerald-100" sub={fmtPct(d.attempts.completed, d.attempts.total) + ' dari total'} />
          <StatCard label="Ditinggalkan"  value={fmt(d.attempts.abandoned)} icon={XCircle}      color="text-red-600"     bg="bg-red-100"     sub={fmtPct(d.attempts.abandoned, d.attempts.total) + ' dari total'} />
          <StatCard label="Lulus"         value={fmt(d.attempts.passed)}    icon={Award}        color="text-amber-600"   bg="bg-amber-100"   sub={fmtPct(d.attempts.passed, d.attempts.completed) + ' dari selesai'} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold text-slate-700">Rata-rata Skor</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'TWK',         score: d.attempts.avgTWK,   max: 150, color: 'bg-blue-500'    },
                { label: 'TIU',         score: d.attempts.avgTIU,   max: 175, color: 'bg-violet-500'  },
                { label: 'TKP',         score: d.attempts.avgTKP,   max: 225, color: 'bg-emerald-500' },
                { label: 'Total (SKD)', score: d.attempts.avgFinal, max: 550, color: 'bg-amber-500'   },
              ].map(({ label, score, max, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 font-medium">{label}</span>
                    <span className="font-bold text-slate-800">{score} <span className="text-slate-400 font-normal">/ {max}</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={cn('h-2 rounded-full', color)} style={{ width: `${Math.min((score / max) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold text-slate-700">Paket Terpopuler (Attempt)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {d.attempts.topPackages.length === 0 && <p className="text-xs text-slate-400">Belum ada data</p>}
              {d.attempts.topPackages.map(pkg => (
                <BarRow key={pkg.title} label={pkg.title} value={pkg.count} max={maxPkgAttempt} display={`${fmt(pkg.count)}x`} />
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section>
        <SectionTitle>📚 Konten</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Soal"        value={fmt(d.content.totalQuestions)}  icon={FileQuestion} color="text-blue-600"    bg="bg-blue-100"    sub={`${fmt(d.content.publishedQuestions)} published`} />
          <StatCard label="Total Materi"      value={fmt(d.content.totalMaterials)}  icon={BookOpen}     color="text-violet-600"  bg="bg-violet-100"  />
          <StatCard label="Total Paket"       value={fmt(d.content.totalPackages)}   icon={Package}      color="text-emerald-600" bg="bg-emerald-100" />
          <StatCard label="Total View Materi" value={fmt(d.content.materialViews)}   icon={Percent}      color="text-amber-600"   bg="bg-amber-100"   />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold text-slate-700">Soal per Kategori</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {['TWK', 'TIU', 'TKP'].map(cat => {
                const count = d.content.questionsByCategory[cat] ?? 0;
                return (
                  <div key={cat} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', { TWK: 'bg-blue-500', TIU: 'bg-violet-500', TKP: 'bg-emerald-500' }[cat])} />
                      <span className="text-sm text-slate-600">{cat}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{fmt(count)}</span>
                      <span className="text-xs text-slate-400">({fmtPct(count, d.content.totalQuestions)})</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold text-slate-700">Paket per Tier</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { tier: 'free',     label: 'Free',     color: 'bg-slate-400' },
                { tier: 'premium',  label: 'Premium',  color: 'bg-blue-500'  },
                { tier: 'platinum', label: 'Platinum', color: 'bg-amber-500' },
              ].map(({ tier, label, color }) => {
                const count = d.content.pkgTiers[tier] ?? 0;
                return (
                  <div key={tier} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', color)} />
                      <span className="text-sm text-slate-600">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{fmt(count)}</span>
                      <span className="text-xs text-slate-400">({fmtPct(count, d.content.totalPackages)})</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}