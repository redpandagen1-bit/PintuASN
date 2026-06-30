'use client';

// components/mobile/MobileMateri.tsx
// Mobile materi modul — Tab → Topik → Sub-topik → Reader. Tanpa video.

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  BookOpen, ChevronRight, Lock, CheckCircle2,
} from 'lucide-react';
import { UpgradeModal }     from '@/components/shared/upgrade-modal';
import { ModuleReader }     from '@/components/materi/module-reader';
import { canAccess }        from '@/lib/subscription-utils';
import type { SubscriptionTier } from '@/lib/subscription-utils';
import { readState, markRead, type MaterialModule } from '@/app/(dashboard)/materi/shared';

type TabId = 'TWK' | 'TIU' | 'TKP' | 'INFORMASI';

const TABS: { id: TabId; label: string }[] = [
  { id: 'INFORMASI', label: 'Info CPNS' },
  { id: 'TWK',       label: 'TWK' },
  { id: 'TIU',       label: 'TIU' },
  { id: 'TKP',       label: 'TKP' },
];

function TierPill({ tier }: { tier: MaterialModule['tier'] }) {
  if (tier === 'premium')  return <span className="text-[9px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full">Premium</span>;
  if (tier === 'platinum') return <span className="text-[9px] font-black text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full">Platinum</span>;
  return null;
}

export function MobileMateri({
  modules, userTier,
}: {
  modules:  MaterialModule[];
  userTier: SubscriptionTier;
}) {
  const [activeTab,    setActiveTab]    = useState<TabId>('INFORMASI');
  const [openTopic,    setOpenTopic]    = useState<string | null>(null);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [upgradeOpen,  setUpgradeOpen]  = useState(false);
  const [upgradeTier,  setUpgradeTier]  = useState<'premium' | 'platinum'>('premium');
  const [upgradeTitle, setUpgradeTitle] = useState('');
  const [readVersion,  setReadVersion]  = useState(0);

  // ── Integrasi tombol "kembali" perangkat (PWA) dengan navigasi in-app ──
  // Tanpa ini, back perangkat dari /materi langsung ke dashboard.
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

  const pushHist    = () => { try { window.history.pushState({ materi: Date.now() }, ''); } catch { /* ignore */ } };
  const backOneLevel = () => { try { window.history.back(); } catch { setOpenModuleId(null); setOpenTopic(null); } };

  // Topik selalu bisa dibuka untuk melihat daftar sub-bab; yang terkunci hanya sub-bab-nya.
  const openTopicNav = (g: { topic: string; modules: MaterialModule[] }) => { setOpenTopic(g.topic); pushHist(); };

  const topicGroups = useMemo(() => {
    const groups = new Map<string, MaterialModule[]>();
    for (const m of modules) {
      if (m.category !== activeTab) continue;
      if (!groups.has(m.topic)) groups.set(m.topic, []);
      groups.get(m.topic)!.push(m);
    }
    return Array.from(groups.entries()).map(([topic, mods]) => ({ topic, modules: mods }));
  }, [modules, activeTab]);

  const readMap     = useMemo(() => readState(), [readVersion]);
  const activeGroup = topicGroups.find(g => g.topic === openTopic) || null;
  const openModule  = activeGroup?.modules.find(m => m.id === openModuleId) || null;

  const openModuleSafe = (m: MaterialModule) => {
    if (canAccess(userTier, m.tier)) { setOpenModuleId(m.id); pushHist(); }
    else { setUpgradeTitle(m.title); setUpgradeTier(m.tier as 'premium' | 'platinum'); setUpgradeOpen(true); }
  };

  // ── READER ──────────────────────────────────────────────────
  const soloMod   = activeGroup && activeGroup.modules.length === 1 && canAccess(userTier, activeGroup.modules[0].tier)
    ? activeGroup.modules[0] : null;
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
        <div className="px-4 pb-24">
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
    const pct       = avail.length ? Math.round((doneCount / avail.length) * 100) : 0;
    return (
      <>
        <div className="px-4 pb-24 space-y-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <button onClick={backOneLevel} className="hover:text-slate-700">Materi</button>
            <ChevronRight size={12} />
            <span className="text-slate-700 truncate">{activeGroup.topic}</span>
          </nav>

          {/* Judul + materi digabung dalam satu kontainer */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 px-5 pt-5 pb-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-yellow-500/10 rounded-full blur-2xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
              <div className="relative z-10">
                <h1 className="text-xl font-extrabold text-white mb-3">{activeGroup.topic}</h1>
                <div className="flex items-center gap-2 mb-1.5 text-[11px] text-slate-300">
                  <span>{total} sub-topik</span>
                  <span className="ml-auto font-bold text-yellow-400">{pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-white p-2 divide-y divide-slate-100">
              {activeGroup.modules.map((m, i) => {
                const placeholder = m.is_placeholder;
                const accessible  = canAccess(userTier, m.tier);
                const isDone      = !!readMap[m.id];
                const pages       = (m.pages?.length) || 1;
                return (
                  <button key={m.id} onClick={() => !placeholder && openModuleSafe(m)} disabled={placeholder}
                    className={`w-full flex items-center gap-3 px-2.5 py-3 text-left ${placeholder ? 'opacity-70' : ''}`}>
                    <span className="flex-shrink-0">
                      {placeholder
                        ? <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><span className="text-[11px] font-bold text-slate-400">{i + 1}</span></span>
                        : !accessible
                        ? <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Lock size={14} className="text-blue-500" /></span>
                        : isDone
                        ? <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><CheckCircle2 size={16} className="text-emerald-500" /></span>
                        : <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><span className="text-[11px] font-bold text-slate-500">{i + 1}</span></span>}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className={`block text-sm font-semibold truncate ${placeholder ? 'text-slate-400' : accessible ? 'text-slate-800' : 'text-slate-500'}`}>{m.title}</span>
                      {!placeholder && <span className="text-[10px] text-slate-400">{pages} halaman{m.read_minutes ? ` · ${m.read_minutes} mnt` : ''}</span>}
                    </span>
                    {placeholder
                      ? <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full flex-shrink-0">Segera</span>
                      : <>
                          {!accessible && <TierPill tier={m.tier} />}
                        </>}
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
  return (
    <>
      <div className="px-4 pb-24 space-y-5">
        <div className="bg-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-yellow-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl font-extrabold text-white leading-tight mb-1">Pelajari <span className="text-yellow-400">Materinya</span></h1>
            <p className="text-slate-300 text-xs leading-relaxed">Dirangkum per topik &amp; sub-topik, lengkap dengan kuis tiap halaman.</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {TABS.map(tab => {
            const isActive = tab.id === activeTab;
            return (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setOpenTopic(null); }}
                className={`px-1 py-2 rounded-lg font-semibold text-[11px] text-center truncate border ${
                  isActive ? 'bg-slate-800 text-yellow-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200'
                }`}>
                {tab.label}
              </button>
            );
          })}
        </div>

        {topicGroups.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {topicGroups.map((g, i) => {
              const total     = g.modules.length;
              const avail     = g.modules.filter(m => !m.is_placeholder);
              const doneCount = avail.filter(m => readMap[m.id]).length;
              const pct       = avail.length ? Math.round((doneCount / avail.length) * 100) : 0;
              const isDone    = avail.length > 0 && doneCount === avail.length;
              const solo       = total === 1;
              const soloPages  = solo ? (g.modules[0].pages?.length || 1) : 0;
              return (
                <button key={g.topic} onClick={() => openTopicNav(g)}
                  className="bg-white rounded-2xl border border-slate-200 p-4 text-left flex flex-col active:scale-[0.98] transition-transform">
                  <div className="flex items-start justify-between mb-3">
                    <span className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
                      <span className="text-sm font-extrabold text-yellow-400">{String(i + 1).padStart(2, '0')}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{solo ? `${soloPages} hal` : `${total} sub`}</span>
                  </div>
                  <h3 className="text-[13px] font-bold text-slate-800 mb-3 flex-1 leading-snug line-clamp-2 min-h-[34px]">{g.topic}</h3>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-semibold ${isDone ? 'text-emerald-600' : 'text-slate-400'}`}>{avail.length === 0 ? 'Segera hadir' : isDone ? 'Selesai' : `${doneCount}/${avail.length}`}</span>
                    <span className="text-[10px] font-bold text-slate-400">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${isDone ? 'bg-emerald-500' : 'bg-slate-800'}`} style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
            <BookOpen size={28} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600">Segera Hadir</p>
            <p className="text-xs text-slate-400 mt-1">Materi kategori ini sedang disiapkan.</p>
          </div>
        )}
      </div>
      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)}
        requiredTier={upgradeTier} contentTitle={upgradeTitle} />
    </>
  );
}
