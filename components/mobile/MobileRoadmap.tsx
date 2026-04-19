'use client';

// components/mobile/MobileRoadmap.tsx
// Mobile PWA Roadmap — semua fitur, padat, accordion per section

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  derivePhases,
  deriveCategoryScores,
  getMilestones,
  getRekomendasi,
} from '@/constants/roadmap-data';
import type { RoadmapStats } from '@/lib/supabase/queries';
import type { ReminderPreference } from '@/types/roadmap';
import {
  ChevronDown, CheckCircle2, Lock, ArrowRight,
  Map, BarChart3, Trophy, CalendarDays,
  Lightbulb, BookOpen, Brain, Heart,
  Bell, BellOff, ChevronLeft, ChevronRight as ChevronRightIcon,
  Check, Pencil, Target, Flame,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────

interface MobileRoadmapProps {
  stats:            RoadmapStats;
  savedPreference?: ReminderPreference | null;
  studyHistory?:    string[];
}

type ScheduleMode = 1 | 2 | 3 | 4 | 'custom';
type PhaseStatus  = 'completed' | 'active' | 'locked';

// ── Configs ────────────────────────────────────────────────────

const STEP_CFG: Record<PhaseStatus, {
  circle: string; line: string; stepChip: string; titleColor: string;
  badge: React.ReactNode | null;
}> = {
  completed: {
    circle:    'bg-[#1B2B5E] border-[#1B2B5E]',
    line:      'bg-[#1B2B5E]',
    stepChip:  'bg-emerald-100 text-emerald-700',
    titleColor:'text-slate-600',
    badge: (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
        <CheckCircle2 className="w-2 h-2" /> Selesai
      </span>
    ),
  },
  active: {
    circle:    'bg-[#F5A623] border-[#F5A623] ring-[3px] ring-[#F5A623]/20',
    line:      'bg-amber-200',
    stepChip:  'bg-amber-100 text-amber-700',
    titleColor:'text-[#1B2B5E]',
    badge: (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-[#F5A623] text-white px-1.5 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse inline-block" /> Aktif
      </span>
    ),
  },
  locked: {
    circle:    'bg-slate-100 border-slate-300',
    line:      'bg-slate-200',
    stepChip:  'bg-slate-100 text-slate-400',
    titleColor:'text-slate-400',
    badge: null,
  },
};

const PRIORITY_CFG: Record<'TWK' | 'TIU' | 'TKP', {
  topBar: string; bg: string; border: string; btnBg: string;
  chipBg: string; color: string; emoji: string; label: string; Icon: React.ElementType;
}> = {
  TWK: {
    topBar: 'bg-gradient-to-r from-blue-500 to-blue-600',
    bg: 'bg-blue-50/70', border: 'border-blue-200', btnBg: 'bg-blue-600',
    chipBg: 'bg-blue-600 text-white', color: 'text-blue-700',
    emoji: '🇮🇩', label: 'Tes Wawasan Kebangsaan', Icon: BookOpen,
  },
  TIU: {
    topBar: 'bg-gradient-to-r from-violet-500 to-violet-600',
    bg: 'bg-violet-50/70', border: 'border-violet-200', btnBg: 'bg-violet-600',
    chipBg: 'bg-violet-600 text-white', color: 'text-violet-700',
    emoji: '🧠', label: 'Tes Intelegensi Umum', Icon: Brain,
  },
  TKP: {
    topBar: 'bg-gradient-to-r from-amber-500 to-orange-500',
    bg: 'bg-amber-50/70', border: 'border-amber-200', btnBg: 'bg-amber-500',
    chipBg: 'bg-amber-500 text-white', color: 'text-amber-700',
    emoji: '🤝', label: 'Tes Karakteristik Pribadi', Icon: Heart,
  },
};

const CAT_BAR: Record<string, { bar: string; badge: string; text: string }> = {
  TWK: { bar: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700',     text: 'text-blue-600'   },
  TIU: { bar: 'bg-violet-500', badge: 'bg-violet-100 text-violet-700', text: 'text-violet-600' },
  TKP: { bar: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-700',   text: 'text-amber-600'  },
};

const PRESET_OPTIONS: { value: ScheduleMode; label: string; sublabel: string }[] = [
  { value: 1,        label: 'Tiap hari',     sublabel: 'Paling intensif'           },
  { value: 2,        label: '2 Hari Sekali', sublabel: 'Seimbang & rutin'          },
  { value: 3,        label: '3 Hari Sekali', sublabel: 'Cocok jangka panjang'      },
  { value: 4,        label: '4 Hari Sekali', sublabel: 'Ringan 1–2× seminggu'      },
  { value: 'custom', label: 'Custom',        sublabel: 'Pilih hari tertentu'       },
];

const DAY_LABELS = [
  { value: 1, short: 'Sen' }, { value: 2, short: 'Sel' }, { value: 3, short: 'Rab' },
  { value: 4, short: 'Kam' }, { value: 5, short: 'Jum' }, { value: 6, short: 'Sab' },
  { value: 0, short: 'Min' },
];

const CAL_HEADERS = ['SN', 'SL', 'RB', 'KM', 'JM', 'SB', 'MG'];

function dayToCol(jsDay: number) { return jsDay === 0 ? 6 : jsDay - 1; }

// ── Section accordion wrapper ──────────────────────────────────

function Section({
  title, icon, badge, defaultOpen = false, children,
}: {
  title: string;
  icon:  React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border-b border-slate-100">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 active:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#1B2B5E]/8 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <span className="text-sm font-extrabold text-[#1B2B5E]" style={{ fontFamily: 'var(--font-jakarta)' }}>
            {title}
          </span>
          {badge}
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0',
          open && 'rotate-180',
        )} />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────

export function MobileRoadmap({ stats, savedPreference, studyHistory = [] }: MobileRoadmapProps) {
  const phases         = useMemo(() => derivePhases(stats),         [stats]);
  const categoryScores = useMemo(() => deriveCategoryScores(stats), [stats]);
  const milestones     = useMemo(() => getMilestones(stats),        [stats]);
  const rekomendasi    = useMemo(() => getRekomendasi(stats),       [stats]);

  const completedCount = phases.filter(p => p.status === 'completed').length;
  const progressPct    = Math.round((completedCount / phases.length) * 100);
  const achievedCount  = milestones.filter(m => m.achieved).length;
  const isAllDone      = rekomendasi.message.startsWith('Luar biasa');

  // Active step auto-open
  const defaultStep = phases.find(p => p.status === 'active')?.id ?? null;
  const [openStep, setOpenStep] = useState<string | null>(defaultStep);
  const toggleStep = (id: string, status: PhaseStatus) => {
    if (status === 'locked') return;
    setOpenStep(prev => prev === id ? null : id);
  };

  // ── Calendar state ──────────────────────────────────────────

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1);
  };
  const nextMonthCal = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1);
  };
  const monthLabel = new Date(viewYear, viewMonth, 1)
    .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay  = new Date(viewYear, viewMonth + 1, 0);
    const startCol = dayToCol(firstDay.getDay());
    const cells: (number | null)[] = Array(startCol).fill(null);
    for (let d = 1; d <= lastDay.getDate(); d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const historySet = useMemo(() => {
    const s = new Set<string>();
    studyHistory.forEach(iso => {
      const d = new Date(iso);
      s.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });
    return s;
  }, [studyHistory]);

  const hasStudy  = (day: number) => historySet.has(`${viewYear}-${viewMonth}-${day}`);
  const isToday   = (day: number) => today.getFullYear()===viewYear && today.getMonth()===viewMonth && today.getDate()===day;
  const isPast    = (day: number) => { const d=new Date(viewYear,viewMonth,day); d.setHours(0,0,0,0); return d<today; };

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    savedPreference?.examDate ? new Date(savedPreference.examDate) : undefined,
  );
  const isExamDay = (day: number) =>
    !!selectedDate && selectedDate.getFullYear()===viewYear &&
    selectedDate.getMonth()===viewMonth && selectedDate.getDate()===day;

  const handleDayClick = (day: number) => {
    const clicked = new Date(viewYear, viewMonth, day);
    clicked.setHours(0,0,0,0);
    if (clicked < today) return;
    setSelectedDate(prev =>
      prev && prev.getFullYear()===viewYear && prev.getMonth()===viewMonth && prev.getDate()===day
        ? undefined : clicked,
    );
  };

  const daysLeft = selectedDate
    ? Math.ceil((selectedDate.getTime() - today.getTime()) / 86_400_000)
    : null;

  const getDayStyle = (day: number) => {
    if (isExamDay(day)) return { wrapper: 'bg-[#1B2B5E] rounded-full', text: 'text-white font-bold' };
    if (isToday(day))   return { wrapper: 'bg-[#1B2B5E]/10 rounded-full ring-2 ring-[#1B2B5E]/30', text: 'text-[#1B2B5E] font-bold' };
    if (isPast(day)) {
      if (hasStudy(day)) return { wrapper: 'bg-emerald-100 rounded-full', text: 'text-emerald-700 font-semibold' };
      return { wrapper: 'bg-red-50 rounded-full', text: 'text-red-400' };
    }
    return { wrapper: 'hover:bg-slate-100 rounded-full', text: 'text-slate-700' };
  };

  // Schedule settings
  const initMode = (): ScheduleMode => {
    if (!savedPreference) return 2;
    if (savedPreference.customDays?.length) return 'custom';
    const iv = savedPreference.intervalDays;
    if (iv === 1 || iv === 2 || iv === 3 || iv === 4) return iv;
    return 2;
  };
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>(initMode);
  const [customDays,   setCustomDays]   = useState<number[]>(savedPreference?.customDays ?? [1,3,5]);
  const [reminderOn,   setReminderOn]   = useState(savedPreference?.enabled ?? false);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const toggleCustomDay = (day: number) =>
    setCustomDays(prev => prev.includes(day)
      ? prev.length > 1 ? prev.filter(d => d!==day) : prev
      : [...prev, day]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await fetch('/api/profile/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled:      reminderOn,
          intervalDays: scheduleMode === 'custom' ? null : scheduleMode,
          customDays:   scheduleMode === 'custom' ? customDays : null,
          examDate:     selectedDate?.toISOString() ?? null,
          lastNotifAt:  null,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }, [reminderOn, scheduleMode, customDays, selectedDate]);

  // ── Render ─────────────────────────────────────────────────

  return (
    <main className="bg-slate-50 min-h-screen">

      {/* ── Hero: compact navy banner ─────────────────────── */}
      <div className="relative bg-[#1B2B5E] overflow-hidden px-4 pt-5 pb-6 mx-4 mt-4 rounded-2xl shadow-lg shadow-[#1B2B5E]/20">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/[0.04] pointer-events-none" />
        <div className="absolute top-3 right-16 w-16 h-16 rounded-full bg-[#F5A623]/10 pointer-events-none" />

        <div className="relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#F5A623]/20 text-[#F5A623] text-[10px] font-extrabold px-2.5 py-1 rounded-full mb-3 uppercase tracking-widest">
            <Map className="w-3 h-3" /> Roadmap CPNS 2026
          </div>

          {/* Title row */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <h1 className="text-xl font-extrabold text-white leading-tight"
                style={{ fontFamily: 'var(--font-jakarta)' }}>
                Jalur Persiapan<br />
                <span className="text-[#F5A623]">SKD CPNS 2026</span>
              </h1>
            </div>
            {/* Stats */}
            <div className="flex gap-2 flex-shrink-0">
              <div className="bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-center">
                <p className="text-lg font-extrabold text-white leading-none"
                  style={{ fontFamily: 'var(--font-jakarta)' }}>{stats.totalCompleted}</p>
                <p className="text-[9px] text-white/50 mt-0.5">Tryout</p>
              </div>
              <div className="bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-center">
                <p className="text-lg font-extrabold text-[#F5A623] leading-none"
                  style={{ fontFamily: 'var(--font-jakarta)' }}>{progressPct}%</p>
                <p className="text-[9px] text-white/50 mt-0.5">Selesai</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-white/60 font-medium">Progress keseluruhan</span>
              <span className="text-[#F5A623] font-extrabold">
                {completedCount}<span className="text-white/30 font-normal">/{phases.length}</span> tahap
              </span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F5A623] to-[#fbbf24] rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Rekomendasi Fokus ────────────────────────────── */}
      <div className="px-4 py-3 bg-white border-b border-slate-100">
        {isAllDone ? (
          /* All done */
          <div className="rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-4 py-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 text-xl">🏆</div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-extrabold text-white/70 uppercase tracking-widest">Semua Selesai 🎉</p>
                <p className="text-sm font-semibold text-white leading-snug mt-0.5 line-clamp-2">{rekomendasi.message}</p>
              </div>
              <Link href={rekomendasi.href}>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </Link>
            </div>
          </div>
        ) : rekomendasi.priority ? (
          /* Category focus */
          (() => {
            const cfg = PRIORITY_CFG[rekomendasi.priority as 'TWK' | 'TIU' | 'TKP'];
            const { Icon } = cfg;
            return (
              <div className={cn('rounded-2xl border overflow-hidden', cfg.border)}>
                <div className={cn('h-1', cfg.topBar)} />
                <div className={cn('px-4 py-3 flex items-center gap-3', cfg.bg)}>
                  <div className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-2xl">
                    {cfg.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className={cn('text-[9px] font-extrabold uppercase tracking-widest', cfg.color)}>Fokus Sekarang</span>
                      <span className={cn('text-[9px] font-extrabold px-1.5 py-0.5 rounded-full', cfg.chipBg)}>
                        {rekomendasi.priority}
                      </span>
                    </div>
                    <p className={cn('text-xs font-bold leading-snug line-clamp-2', cfg.color)}>
                      {rekomendasi.message}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Icon className={cn('w-3 h-3', cfg.color, 'opacity-70')} />
                      <p className={cn('text-[10px] opacity-70', cfg.color)}>{cfg.label}</p>
                    </div>
                  </div>
                  <Link href={rekomendasi.href}>
                    <button className={cn('flex items-center gap-1 text-[11px] font-extrabold text-white px-3 py-1.5 rounded-lg flex-shrink-0', cfg.btnBg)}>
                      {rekomendasi.action} <ArrowRight className="w-3 h-3" />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })()
        ) : (
          /* Default */
          <div className="rounded-2xl border border-[#1B2B5E]/15 bg-[#1B2B5E]/[0.04] px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B2B5E] flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-[#F5A623]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-extrabold text-[#1B2B5E]/50 uppercase tracking-widest">Langkah Selanjutnya</p>
              <p className="text-xs font-bold text-[#1B2B5E] leading-snug mt-0.5 line-clamp-2">{rekomendasi.message}</p>
            </div>
            <Link href={rekomendasi.href}>
              <div className="w-8 h-8 rounded-full bg-[#1B2B5E] flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* ── Section: Roadmap Persiapan (open by default) ──── */}
      <Section
        title="Roadmap Persiapan"
        icon={<Target className="w-3.5 h-3.5 text-[#1B2B5E]" />}
        badge={
          <span className="text-[10px] font-bold bg-[#1B2B5E]/8 text-[#1B2B5E] px-2 py-0.5 rounded-full">
            {completedCount}/{phases.length}
          </span>
        }
        defaultOpen
      >
        <div className="px-4 pt-2">
          {phases.map((phase, index) => {
            const cfg     = STEP_CFG[phase.status as PhaseStatus];
            const isLast  = index === phases.length - 1;
            const isOpen  = openStep === phase.id;
            const canOpen = phase.status !== 'locked';

            return (
              <div key={phase.id} className="flex gap-3">
                {/* Circle + connector */}
                <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
                  <button
                    type="button"
                    onClick={() => toggleStep(phase.id, phase.status as PhaseStatus)}
                    disabled={!canOpen}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                      cfg.circle,
                      canOpen && 'active:scale-90 cursor-pointer',
                      !canOpen && 'cursor-not-allowed',
                    )}
                  >
                    {phase.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    {phase.status === 'locked'    && <Lock className="w-3 h-3 text-slate-400" />}
                    {phase.status === 'active'    && <span className="text-sm">{phase.icon}</span>}
                  </button>
                  {!isLast && (
                    <div className={cn('w-0.5 flex-1 min-h-[1.25rem] my-0.5 rounded-full', cfg.line)} />
                  )}
                </div>

                {/* Content */}
                <div className={cn('flex-1 min-w-0', isLast ? 'pb-1' : 'pb-2')}>
                  <button
                    type="button"
                    onClick={() => toggleStep(phase.id, phase.status as PhaseStatus)}
                    disabled={!canOpen}
                    className={cn(
                      'w-full text-left py-1',
                      !canOpen && 'cursor-not-allowed',
                    )}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex-1 min-w-0">
                        {/* Step chip + badge */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className={cn('text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide', cfg.stepChip)}>
                            Step {phase.step}
                          </span>
                          {cfg.badge}
                        </div>
                        {/* Title */}
                        <p className={cn('text-sm font-bold leading-snug', cfg.titleColor)}>
                          {phase.icon} {phase.title}
                        </p>
                        {/* Description */}
                        <p className={cn(
                          'text-xs mt-0.5 leading-relaxed',
                          phase.status === 'locked' ? 'text-slate-300' : 'text-slate-500',
                        )}>
                          {phase.description}
                        </p>
                      </div>
                      {canOpen && (
                        <ChevronDown className={cn(
                          'w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-1.5 transition-transform duration-200',
                          isOpen && 'rotate-180 text-[#1B2B5E]',
                        )} />
                      )}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className={cn(
                      'mt-2 mb-1 rounded-xl border p-3 space-y-2',
                      phase.status === 'active'
                        ? 'bg-amber-50/80 border-[#F5A623]/25'
                        : 'bg-slate-50 border-slate-200',
                    )}>
                      <p className="text-xs text-slate-600 leading-relaxed">{phase.detail}</p>
                      <div className="bg-white rounded-lg p-2.5 flex items-start gap-2">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5 flex-shrink-0">
                          Syarat
                        </span>
                        <p className="text-xs text-slate-600 leading-snug">{phase.requirement}</p>
                      </div>
                      {phase.status !== 'locked' && phase.ctaLabel && phase.ctaHref && (
                        <Link href={phase.ctaHref}>
                          <button className={cn(
                            'flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-lg mt-1',
                            phase.status === 'active'
                              ? 'bg-[#1B2B5E] text-white'
                              : 'bg-white border border-[#1B2B5E]/20 text-[#1B2B5E]',
                          )}>
                            {phase.ctaLabel} <ArrowRight className="w-3 h-3" />
                          </button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Section: Progress & Pencapaian (closed by default) */}
      <Section
        title="Progress & Pencapaian"
        icon={<BarChart3 className="w-3.5 h-3.5 text-[#1B2B5E]" />}
        badge={
          achievedCount > 0
            ? <span className="text-[10px] font-bold bg-[#F5A623]/15 text-[#F5A623] px-2 py-0.5 rounded-full">
                {achievedCount} milestone
              </span>
            : undefined
        }
      >
        <div className="px-4 space-y-4">

          {/* Skor per Kategori */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-slate-100">
              <BarChart3 className="w-3.5 h-3.5 text-[#1B2B5E]" />
              <span className="text-xs font-extrabold text-[#1B2B5E]">Skor per Kategori</span>
              {stats.totalCompleted > 0 && (
                <span className="ml-auto text-[10px] text-slate-400">vs. passing grade</span>
              )}
            </div>
            {stats.totalCompleted === 0 ? (
              <div className="py-8 flex flex-col items-center text-center px-4">
                <BarChart3 className="w-8 h-8 text-slate-200 mb-2" />
                <p className="text-xs font-semibold text-slate-400">Belum ada data skor</p>
                <p className="text-[11px] text-slate-300 mt-0.5">Selesaikan tryout untuk melihat progress</p>
              </div>
            ) : (
              <div className="p-3.5 space-y-4">
                {categoryScores.map(cs => {
                  const pct   = Math.min((cs.avg / cs.passingGrade) * 100, 100);
                  const color = CAT_BAR[cs.category] ?? CAT_BAR.TWK;
                  return (
                    <div key={cs.category} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn('text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase', color.badge)}>
                            {cs.category}
                          </span>
                          <span className="text-[11px] text-slate-400 hidden xs:inline">{cs.label}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className={cn('text-sm font-extrabold leading-none', cs.isPassed ? 'text-emerald-600' : color.text)}>
                            {cs.avg}
                          </span>
                          <span className="text-slate-200">/</span>
                          <span className="text-slate-400 font-semibold">{cs.passingGrade}</span>
                          {cs.isPassed
                            ? <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-0.5" />
                            : <span className={cn('text-[9px] font-extrabold px-1 py-0.5 rounded-full bg-red-50 ml-0.5', color.text)}>
                                −{Math.abs(cs.gap)}
                              </span>
                          }
                        </div>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-700', cs.isPassed ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : color.bar)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {!cs.isPassed && (
                        <p className="text-[10px] text-slate-400">
                          Butuh <span className={cn('font-extrabold', color.text)}>{Math.abs(cs.gap)} poin</span> lagi
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Milestones */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-[#F5A623]" />
                <span className="text-xs font-extrabold text-[#1B2B5E]">Pencapaian</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                {achievedCount}<span className="text-slate-300">/{milestones.length}</span> diraih
              </span>
            </div>
            <div className="p-2.5 grid grid-cols-2 gap-2">
              {milestones.map(m => (
                <div
                  key={m.id}
                  className={cn(
                    'relative rounded-xl p-3 border transition-all',
                    m.achieved
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50/50 border-[#F5A623]/30 shadow-sm'
                      : 'bg-white border-slate-100 opacity-50 grayscale',
                  )}
                >
                  {m.achieved && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#F5A623]" />
                  )}
                  <div className="text-lg mb-1.5 leading-none">{m.achieved ? '🏅' : '🔒'}</div>
                  <p className={cn('text-xs font-extrabold leading-snug', m.achieved ? 'text-[#1B2B5E]' : 'text-slate-400')}>
                    {m.label}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{m.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </Section>

      {/* ── Section: Kalender Belajar (closed by default) ─── */}
      <Section
        title="Kalender Belajar"
        icon={<CalendarDays className="w-3.5 h-3.5 text-[#1B2B5E]" />}
        badge={
          daysLeft !== null && daysLeft > 0
            ? <span className="text-[10px] font-bold bg-[#1B2B5E] text-white px-2 py-0.5 rounded-full">
                {daysLeft}h lagi
              </span>
            : daysLeft === 0
            ? <span className="text-[10px] font-bold bg-[#F5A623] text-white px-2 py-0.5 rounded-full">Hari ini! 🎯</span>
            : undefined
        }
      >
        <div className="px-4 space-y-4">

          {/* Target ujian banner */}
          <div className="bg-[#1B2B5E] rounded-2xl px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-4 h-4 text-[#F5A623]" />
              </div>
              <div>
                <p className="text-[9px] text-white/50 font-extrabold uppercase tracking-widest">Target Ujian</p>
                {selectedDate ? (
                  <p className="text-sm font-bold text-white leading-tight mt-0.5">
                    {selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                ) : (
                  <p className="text-xs text-white/50 italic mt-0.5">Klik tanggal di kalender</p>
                )}
              </div>
            </div>
            {selectedDate && (
              <button onClick={() => setSelectedDate(undefined)}
                className="text-[10px] text-white/50 hover:text-white border border-white/15 px-2 py-1 rounded-lg transition-colors">
                Ubah
              </button>
            )}
          </div>

          {/* Calendar grid */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {/* Month nav */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <p className="text-sm font-extrabold text-[#1B2B5E] capitalize" style={{ fontFamily: 'var(--font-jakarta)' }}>
                {monthLabel}
              </p>
              <button onClick={nextMonthCal} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="px-3 pt-2 pb-3">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {CAL_HEADERS.map(h => (
                  <div key={h} className="text-center text-[10px] font-extrabold text-slate-400 uppercase py-1">{h}</div>
                ))}
              </div>
              {/* Day cells */}
              <div className="grid grid-cols-7 gap-y-0.5">
                {calendarDays.map((day, idx) => {
                  if (day === null) return <div key={`e-${idx}`} />;
                  const style = getDayStyle(day);
                  const past  = isPast(day);
                  return (
                    <div key={day} className="flex justify-center py-0.5">
                      <button
                        onClick={() => handleDayClick(day)}
                        disabled={past}
                        className={cn(
                          'w-9 h-9 flex items-center justify-center transition-all',
                          style.wrapper,
                          past ? 'cursor-default' : 'cursor-pointer active:scale-90',
                        )}
                      >
                        <span className={cn('text-[11px] font-semibold leading-none', style.text)}>{day}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex items-center gap-3 flex-wrap mt-2 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[9px] text-slate-400">Latihan</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                  <span className="text-[9px] text-slate-400">Tidak latihan</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1B2B5E]" />
                  <span className="text-[9px] text-slate-400">Target ujian</span>
                </div>
              </div>
            </div>
          </div>

          {/* Frekuensi latihan */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-slate-50">
              <p className="text-xs font-extrabold text-[#1B2B5E]">Frekuensi Latihan</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Seberapa sering kamu latihan?</p>
            </div>
            <div className="p-3 space-y-1.5">
              {PRESET_OPTIONS.map(opt => {
                const isActive = scheduleMode === opt.value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setScheduleMode(opt.value)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left active:scale-[0.98]',
                      isActive ? 'bg-[#1B2B5E]/[0.05] border-[#1B2B5E]/25' : 'bg-white border-slate-100',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {opt.value === 'custom' && <Pencil className="w-3 h-3 text-slate-400" />}
                      <div>
                        <span className={cn('text-xs font-bold block', isActive ? 'text-[#1B2B5E]' : 'text-slate-600')}>
                          {opt.label}
                        </span>
                        {isActive && (
                          <span className="text-[10px] text-slate-400">{opt.sublabel}</span>
                        )}
                      </div>
                    </div>
                    <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0', isActive ? 'border-[#1B2B5E] bg-[#1B2B5E]' : 'border-slate-300')}>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Custom days */}
            {scheduleMode === 'custom' && (
              <div className="px-3 pb-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Pilih hari latihan</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {DAY_LABELS.map(day => {
                      const sel = customDays.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleCustomDay(day.value)}
                          className={cn(
                            'w-10 h-10 rounded-xl text-[10px] font-extrabold border flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90',
                            sel ? 'bg-[#F5A623] text-white border-[#F5A623]' : 'bg-white text-slate-500 border-slate-200',
                          )}
                        >
                          <span>{day.short}</span>
                          {sel && <Check className="w-2.5 h-2.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pengingat */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-slate-50">
              <p className="text-xs font-extrabold text-[#1B2B5E]">Pengingat Otomatis</p>
            </div>
            <div className="px-3.5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', reminderOn ? 'bg-[#F5A623]/15' : 'bg-slate-100')}>
                  {reminderOn ? <Bell className="w-4 h-4 text-[#F5A623]" /> : <BellOff className="w-4 h-4 text-slate-400" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">{reminderOn ? 'Pengingat aktif' : 'Pengingat nonaktif'}</p>
                  <p className="text-[10px] text-slate-400">Via Email &amp; Notifikasi</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={reminderOn}
                onClick={() => setReminderOn(v => !v)}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
                  reminderOn ? 'bg-[#F5A623]' : 'bg-slate-300',
                )}
              >
                <span className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200',
                  reminderOn ? 'translate-x-6' : 'translate-x-0',
                )} />
              </button>
            </div>
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !selectedDate}
            className={cn(
              'w-full py-3 rounded-2xl text-sm font-extrabold transition-all active:scale-[0.98]',
              saved
                ? 'bg-emerald-100 text-emerald-700'
                : selectedDate
                ? 'bg-[#1B2B5E] text-white shadow-sm'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed',
            )}
          >
            {saved ? '✓ Jadwal berhasil disimpan' : saving ? 'Menyimpan...' : selectedDate ? 'Simpan Jadwal' : 'Pilih tanggal ujian dulu'}
          </button>

        </div>
      </Section>

      {/* Bottom spacer for BottomNav */}
      <div className="h-24" />
    </main>
  );
}
