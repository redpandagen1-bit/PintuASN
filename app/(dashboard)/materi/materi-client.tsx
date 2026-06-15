'use client';

// ============================================================
// app/(dashboard)/materi/materi-client.tsx
// Materi "modul" (bacaan native) — Tab → Topik → Sub-topik → Reader.
// Materi video TIDAK ditampilkan di sini (halaman terpisah).
// ============================================================

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  BookOpen, FileText, ChevronRight,
  Clock, Lock, CheckCircle2, GraduationCap, Layers, ArrowRight,
} from 'lucide-react';
import { UpgradeModal }     from '@/components/shared/upgrade-modal';
import { ModuleReader }     from '@/components/materi/module-reader';
import { canAccess }        from '@/lib/subscription-utils';
import type { SubscriptionTier } from '@/lib/subscription-utils';
import {
  readState, markRead, type MaterialModule,
} from './shared';

const TABS = [
  { id: 'INFORMASI', label: 'Informasi CPNS',
    description: 'Jadwal, persyaratan, dan alur pendaftaran CPNS.' },
  { id: 'TWK',       label: 'Tes Wawasan Kebangsaan',
    description: 'Nasionalisme, Integritas, Bela Negara, Pilar Negara, Bahasa Indonesia.' },
  { id: 'TIU',       label: 'Tes Intelegensia Umum',
    description: 'Verbal, numerik, figural, dan logika penalaran.' },
  { id: 'TKP',       label: 'Tes Karakteristik Pribadi',
    description: 'Pelayanan publik, jejaring kerja, sosial budaya, profesionalisme.' },
] as const;

interface TopicGroup { topic: string; modules: MaterialModule[] }

function TierPill({ tier }: { tier: MaterialModule['tier'] }) {
  if (tier === 'premium')  return <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Premium</span>;
  if (tier === 'platinum') return <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">Platinum</span>;
  return null;
}

export default function MateriPageClient({
  modules, userTier,
}: {
  modules:  MaterialModule[];
  userTier: SubscriptionTier;
}) {
  const [activeTab,    setActiveTab]    = useState<string>('INFORMASI');
  const [openTopic,    setOpenTopic]    = useState<string | null>(null);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [upgradeOpen,  setUpgradeOpen]  = useState(false);
  const [upgradeTier,  setUpgradeTier]  = useState<'premium' | 'platinum'>('premium');
  const [upgradeTitle, setUpgradeTitle] = useState('');
  const [readVersion,  setReadVersion]  = useState(0);

  const topicGroups: TopicGroup[] = useMemo(() => {
    const groups = new Map<string, MaterialModule[]>();
    for (const m of modules) {
      if (m.category !== activeTab) continue;
      if (!groups.has(m.topic)) groups.set(m.topic, []);
      groups.get(m.topic)!.push(m);
    }
    return Array.from(groups.entries()).map(([topic, mods]) => ({ topic, modules: mods }));
  }, [modules, activeTab]);

  const activeGroup = topicGroups.find(g => g.topic === openTopic) || null;
  const openModule  = activeGroup?.modules.find(m => m.id === openModuleId) || null;
  const readMap     = useMemo(() => readState(), [readVersion]);

  // ── Integrasi tombol "kembali" browser dengan navigasi in-app ──
  // Tanpa ini, back dari /materi langsung ke dashboard.
  // Dengan ini: Reader → daftar sub-topik → daftar topik → baru keluar.
  const moduleRef = useRef<string | null>(null);
  const topicRef  = useRef<string | null>(null);
  moduleRef.current = openModuleId;
  topicRef.current  = openTopic;

  useEffect(() => {
    const onPop = () => {
      if (moduleRef.current !== null) setOpenModuleId(null);
      else if (topicRef.current !== null) setOpenTopic(null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const pushHist     = () => { try { window.history.pushState({ materi: Date.now() }, ''); } catch { /* ignore */ } };
  const backOneLevel = () => { try { window.history.back(); } catch { setOpenModuleId(null); setOpenTopic(null); } };
  const handleLocked = (title: string, tier: 'premium' | 'platinum') => {
    setUpgradeTitle(title); setUpgradeTier(tier); setUpgradeOpen(true);
  };
  // Klik topik: jika seluruh materi terkunci → popup upgrade; jika 1 sub-topik → langsung reader.
  const openTopicNav = (g: TopicGroup) => {
    const anyAccessible = g.modules.some(m => canAccess(userTier, m.tier));
    if (!anyAccessible) {
      const t = (g.modules[0]?.tier === 'platinum' ? 'platinum' : 'premium') as 'premium' | 'platinum';
      handleLocked(g.topic, t);
      return;
    }
    setOpenTopic(g.topic); pushHist();
  };
  const openModuleSafe = (m: MaterialModule) => {
    if (canAccess(userTier, m.tier)) { setOpenModuleId(m.id); pushHist(); }
    else handleLocked(m.title, m.tier as 'premium' | 'platinum');
  };

  const activeTabConfig = TABS.find(t => t.id === activeTab)!;

  // ── READER ──────────────────────────────────────────────────
  // Modul yang dibaca: yang dipilih dari daftar, ATAU otomatis bila topik hanya 1 sub-topik.
  const soloMod  = activeGroup && activeGroup.modules.length === 1 ? activeGroup.modules[0] : null;
  const readerMod = openModule || soloMod;
  if (activeGroup && readerMod) {
    const idx  = activeGroup.modules.findIndex(m => m.id === readerMod.id);
    const next = activeGroup.modules[idx + 1] || null;
    const finishAndNext = () => {
      markRead(readerMod.id);
      setReadVersion(v => v + 1);
      if (next && canAccess(userTier, next.tier)) setOpenModuleId(next.id);
      else backOneLevel();
    };
    return (
      <>
        <div className="max-w-3xl mx-auto pb-10">
          <ModuleReader module={readerMod} onBack={backOneLevel} onComplete={finishAndNext} />
        </div>
        <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)}
          requiredTier={upgradeTier} contentTitle={upgradeTitle} />
      </>
    );
  }

  // ── SUB-TOPIK LIST ──────────────────────────────────────────
  if (activeGroup) {
    const total     = activeGroup.modules.length;
    const avail     = activeGroup.modules.filter(m => !m.is_placeholder);
    const doneCount = avail.filter(m => readMap[m.id]).length;
    const totalMin  = activeGroup.modules.reduce((s, m) => s + (m.read_minutes || 0), 0);
    const pct       = avail.length ? Math.round((doneCount / avail.length) * 100) : 0;

    return (
      <>
        <div className="max-w-3xl mx-auto pb-10 space-y-5">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <button onClick={backOneLevel} className="hover:text-slate-700 transition-colors">Materi</button>
            <ChevronRight size={13} />
            <button onClick={backOneLevel} className="hover:text-slate-700 transition-colors">{activeTabConfig.label}</button>
            <ChevronRight size={13} />
            <span className="text-slate-700">{activeGroup.topic}</span>
          </nav>

          {/* Judul + materi digabung dalam satu kontainer */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            {/* Judul (slate-800) */}
            <div className="bg-slate-800 px-6 pt-6 pb-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
              <div className="relative z-10">
                <p className="text-yellow-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">{activeTabConfig.label}</p>
                <h1 className="text-2xl font-extrabold text-white mb-4">{activeGroup.topic}</h1>
                <div className="flex items-center gap-2 mb-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1"><Layers size={13} /> {total} sub-topik</span>
                  {totalMin > 0 && <><span className="text-slate-600">·</span><span className="flex items-center gap-1"><Clock size={13} /> {totalMin} menit</span></>}
                  <span className="ml-auto font-bold text-yellow-400">{pct}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">{doneCount} dari {avail.length} materi tersedia selesai{total > avail.length ? ` · ${total - avail.length} segera hadir` : ''}</p>
              </div>
            </div>

            {/* Materi (daftar sub-topik) */}
            <div className="bg-white p-3 divide-y divide-slate-100">
              {activeGroup.modules.map((m, i) => {
                const placeholder = m.is_placeholder;
                const accessible  = canAccess(userTier, m.tier);
                const isDone      = !!readMap[m.id];
                const pages       = (m.pages?.length) || 1;
                return (
                  <button key={m.id} onClick={() => !placeholder && openModuleSafe(m)} disabled={placeholder}
                    className={`group w-full flex items-center gap-4 px-3 py-3.5 text-left rounded-lg transition-colors ${
                      placeholder ? 'cursor-default opacity-70' : accessible ? 'hover:bg-slate-50' : ''
                    }`}>
                    <span className="flex-shrink-0">
                      {placeholder
                        ? <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center"><span className="text-xs font-bold text-slate-400">{i + 1}</span></span>
                        : !accessible
                        ? <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center"><Lock size={16} className="text-slate-400" /></span>
                        : isDone
                        ? <span className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center"><CheckCircle2 size={18} className="text-emerald-500" /></span>
                        : <span className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-slate-800 flex items-center justify-center transition-colors"><span className="text-xs font-bold text-slate-500 group-hover:text-yellow-400">{i + 1}</span></span>}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-semibold truncate ${placeholder ? 'text-slate-400' : accessible ? 'text-slate-800' : 'text-slate-500'}`}>{m.title}</span>
                      {!placeholder && (
                        <span className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1"><FileText size={11} /> {pages} halaman</span>
                          {m.read_minutes ? <><span>·</span><span className="flex items-center gap-1"><Clock size={11} /> {m.read_minutes} mnt</span></> : null}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-2.5 flex-shrink-0">
                      {placeholder
                        ? <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Segera hadir</span>
                        : <>
                            {m.is_new && <span className="text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">Baru</span>}
                            {!accessible && <TierPill tier={m.tier} />}
                            {accessible && <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all" />}
                          </>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)}
          requiredTier={upgradeTier} contentTitle={upgradeTitle} />
      </>
    );
  }

  // ── TOPIK GRID ──────────────────────────────────────────────
  const totalModules = modules.length;
  const totalTopics  = new Set(modules.map(m => `${m.category}:${m.topic}`)).size;

  return (
    <>
      <div className="space-y-6 pb-10">

        {/* HERO */}
        <div className="bg-slate-800 rounded-2xl px-6 py-7 md:px-8 md:py-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 max-w-xl">
            <h1 className="text-[28px] md:text-4xl font-extrabold text-white leading-tight tracking-tight mb-2.5">
              Pelajari <span className="text-yellow-400">Materinya</span>
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Materi SKD dirangkum per topik dan sub-topik, lengkap dengan kuis di setiap halaman agar benar-benar paham.
            </p>
          </div>
          <div className="relative z-10 grid grid-cols-2 gap-3 md:flex-shrink-0">
            {[
              { icon: GraduationCap, value: totalModules, label: 'Sub-topik' },
              { icon: Layers,        value: totalTopics,  label: 'Topik'     },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3.5 md:w-28 text-center">
                <Icon size={18} className="text-yellow-400 mx-auto mb-1.5" />
                <div className="text-2xl font-extrabold text-white leading-none">{value}</div>
                <div className="text-[11px] text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
            {TABS.map(tab => {
              const isActive = tab.id === activeTab;
              const count = new Set(modules.filter(m => m.category === tab.id).map(m => m.topic)).size;
              return (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setOpenTopic(null); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-200 flex-shrink-0 border ${
                    isActive
                      ? 'bg-slate-800 text-yellow-400 border-slate-800 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}>
                  {tab.label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-yellow-400/15 text-yellow-300' : 'bg-slate-100 text-slate-400'}`}>{count}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 mt-3 px-1">{activeTabConfig.description}</p>
        </div>

        {/* TOPIC CARDS */}
        {topicGroups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topicGroups.map((g, i) => {
              const total     = g.modules.length;
              const avail     = g.modules.filter(m => !m.is_placeholder);
              const doneCount = avail.filter(m => readMap[m.id]).length;
              const pct       = avail.length ? Math.round((doneCount / avail.length) * 100) : 0;
              const isDone    = avail.length > 0 && doneCount === avail.length;
              const status    = avail.length === 0 ? 'Segera hadir'
                              : doneCount === 0 ? 'Belum dimulai'
                              : isDone ? 'Selesai' : `${doneCount}/${avail.length} selesai`;
              const solo      = total === 1;
              const soloPages = solo ? (g.modules[0].pages?.length || 1) : 0;
              const locked    = g.modules.length > 0 && g.modules.every(m => !canAccess(userTier, m.tier));
              return (
                <button key={g.topic} onClick={() => openTopicNav(g)}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 text-left flex flex-col">
                  {/* Top */}
                  <div className="flex items-start justify-between mb-4">
                    <span className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center">
                      <span className="text-base font-extrabold text-yellow-400">{String(i + 1).padStart(2, '0')}</span>
                    </span>
                    {locked ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full"><Lock size={11} /> Premium</span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 mt-1 flex items-center gap-1">
                        <Layers size={12} /> {solo ? `${soloPages} halaman` : `${total} sub-topik`}
                      </span>
                    )}
                  </div>
                  {/* Title */}
                  <h3 className="text-[15px] font-bold text-slate-800 leading-snug mb-4 flex-1 line-clamp-2 min-h-[42px] group-hover:text-slate-900">{g.topic}</h3>
                  {/* Progress */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[11px] font-semibold flex items-center gap-1 ${isDone ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {isDone && <CheckCircle2 size={12} />}{status}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-emerald-500' : 'bg-slate-800'}`} style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen size={24} className="text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-700 mb-1">Materi {activeTabConfig.label} Segera Hadir</h3>
            <p className="text-slate-400 text-sm max-w-xs">Kami sedang menyiapkan materi terbaik untuk kategori ini.</p>
          </div>
        )}
      </div>

      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)}
        requiredTier={upgradeTier} contentTitle={upgradeTitle} />
    </>
  );
}
