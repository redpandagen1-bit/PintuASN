'use client';

// ============================================================
// components/roadmap/StudyCalendar.tsx
// Redesign: calendar history (merah/hijau), nuansa biru navy
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import { Bell, BellOff, CalendarDays, Check, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReminderPreference } from '@/types/roadmap';

// ─── Types ───────────────────────────────────────────────────
type ScheduleMode = 1 | 2 | 3 | 4 | 'custom';

const PRESET_OPTIONS: { value: ScheduleMode; label: string; sublabel: string }[] = [
  { value: 1,        label: 'Tiap hari',     sublabel: 'Paling intensif — cocok menjelang ujian'        },
  { value: 2,        label: '2 Hari Sekali', sublabel: 'Seimbang — latihan rutin dengan jeda'           },
  { value: 3,        label: '3 Hari Sekali', sublabel: 'Santai — cocok untuk persiapan jangka panjang'  },
  { value: 4,        label: '4 Hari Sekali', sublabel: 'Ringan — latihan 1–2× seminggu'                 },
  { value: 'custom', label: 'Custom',        sublabel: 'Pilih hari-hari tertentu dalam seminggu'        },
];

const DAY_LABELS = [
  { value: 1, short: 'Sen', long: 'Senin'   },
  { value: 2, short: 'Sel', long: 'Selasa'  },
  { value: 3, short: 'Rab', long: 'Rabu'    },
  { value: 4, short: 'Kam', long: 'Kamis'   },
  { value: 5, short: 'Jum', long: "Jum'at"  },
  { value: 6, short: 'Sab', long: 'Sabtu'   },
  { value: 0, short: 'Min', long: 'Minggu'  },
];

// Header hari kalender (Minggu-pertama = Senin style Indonesia)
const CAL_HEADERS = ['SN', 'SL', 'RB', 'KM', 'JM', 'SB', 'MG'];
// 0=Min,1=Sen,...,6=Sab → indeks ke kolom header (Sen=0..Min=6)
function dayToCol(jsDay: number) {
  // jsDay: 0=Sun,1=Mon,...,6=Sat
  // kolom:  0=Sen,1=Sel,...,5=Sab,6=Min
  return jsDay === 0 ? 6 : jsDay - 1;
}

interface StudyCalendarProps {
  examTargetDate?:   Date | null;
  savedPreference?:  ReminderPreference | null;
  /** Tanggal-tanggal di mana user mengerjakan tryout (ISO string) */
  studyHistory?:     string[];
  onSavePreference?: (pref: ReminderPreference) => Promise<void>;
}

export function StudyCalendar({
  examTargetDate,
  savedPreference,
  studyHistory = [],
  onSavePreference,
}: StudyCalendarProps) {

  // ─── Calendar navigation ──────────────────────────────────
  const today = useMemo(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d;
  }, []);

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-based

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0);  setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const monthLabel = new Date(viewYear, viewMonth, 1)
    .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  // ─── Calendar grid ────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay  = new Date(viewYear, viewMonth + 1, 0);
    const startCol = dayToCol(firstDay.getDay());
    const cells: (number | null)[] = Array(startCol).fill(null);
    for (let d = 1; d <= lastDay.getDate(); d++) cells.push(d);
    // Pad to complete last row
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  // ─── History set ─────────────────────────────────────────
  const historySet = useMemo(() => {
    const s = new Set<string>();
    studyHistory.forEach(iso => {
      const d = new Date(iso);
      s.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });
    return s;
  }, [studyHistory]);

  const hasStudy = (day: number) =>
    historySet.has(`${viewYear}-${viewMonth}-${day}`);

  // ─── Exam target ──────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    examTargetDate ?? undefined,
  );
  const isExamDay = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === viewYear &&
           selectedDate.getMonth()    === viewMonth &&
           selectedDate.getDate()     === day;
  };
  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth()    === viewMonth &&
    today.getDate()     === day;

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0,0,0,0);
    return d < today;
  };

  const handleDayClick = (day: number) => {
    const clicked = new Date(viewYear, viewMonth, day);
    clicked.setHours(0,0,0,0);
    if (clicked < today) return; // tidak bisa pilih masa lalu
    setSelectedDate(prev =>
      prev && prev.getFullYear() === viewYear &&
      prev.getMonth() === viewMonth && prev.getDate() === day
        ? undefined
        : clicked
    );
  };

  const daysLeft = selectedDate
    ? Math.ceil((selectedDate.getTime() - today.getTime()) / 86_400_000)
    : null;

  // ─── Reminder & schedule ─────────────────────────────────
  const [reminderOn, setReminderOn] = useState(savedPreference?.enabled ?? false);

  const initMode = (): ScheduleMode => {
    if (!savedPreference) return 2;
    if (savedPreference.customDays?.length) return 'custom';
    const iv = savedPreference.intervalDays;
    if (iv === 1 || iv === 2 || iv === 3 || iv === 4) return iv;
    return 2;
  };
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>(initMode);
  const [customDays,   setCustomDays]   = useState<number[]>(
    savedPreference?.customDays ?? [1, 3, 5],
  );
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const toggleCustomDay = (day: number) =>
    setCustomDays(prev =>
      prev.includes(day)
        ? prev.length > 1 ? prev.filter(d => d !== day) : prev
        : [...prev, day],
    );

  const handleSave = useCallback(async () => {
    if (!onSavePreference) return;
    setSaving(true);
    try {
      await onSavePreference({
        enabled:      reminderOn,
        intervalDays: scheduleMode === 'custom' ? null : scheduleMode,
        customDays:   scheduleMode === 'custom' ? customDays : null,
        examDate:     selectedDate?.toISOString() ?? null,
        lastNotifAt:  null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }, [onSavePreference, reminderOn, scheduleMode, customDays, selectedDate]);

  // ─── Day cell style ───────────────────────────────────────
  const getDayStyle = (day: number) => {
    if (isExamDay(day)) return {
      wrapper: 'bg-[#1B2B5E] text-white rounded-full shadow-md shadow-[#1B2B5E]/30',
      text: 'text-white font-bold',
    };
    if (isToday(day)) return {
      wrapper: 'bg-[#1B2B5E]/10 text-[#1B2B5E] rounded-full ring-2 ring-[#1B2B5E]/30',
      text: 'text-[#1B2B5E] font-bold',
    };
    if (isPast(day)) {
      if (hasStudy(day)) return {
        wrapper: 'bg-emerald-100 text-emerald-700 rounded-full',
        text: 'text-emerald-700 font-semibold',
      };
      return {
        wrapper: 'bg-red-50 text-red-400 rounded-full',
        text: 'text-red-400',
      };
    }
    return {
      wrapper: 'hover:bg-slate-100 rounded-full text-slate-700',
      text: 'text-slate-700',
    };
  };

  // ─── Render ───────────────────────────────────────────────
  return (
    <section className="space-y-4">

      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#1B2B5E]">Kalender Belajar</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Tentukan tanggal ujian dan pantau konsistensi latihanmu
          </p>
        </div>
        {daysLeft !== null && daysLeft > 0 && (
          <div className="text-right bg-[#1B2B5E]/5 px-3 py-1.5 rounded-xl">
            <p className="text-sm font-bold text-[#1B2B5E]">{daysLeft} hari</p>
            <p className="text-[10px] text-gray-400">menuju ujian</p>
          </div>
        )}
        {daysLeft !== null && daysLeft <= 0 && (
          <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full">
            Tanggal ujian sudah lewat
          </span>
        )}
      </div>

      {/* Main card */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">

        {/* ── Banner atas biru navy ── */}
        <div className="bg-[#1B2B5E] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-[#F5A623]" />
            </div>
            <div>
              {selectedDate ? (
                <>
                  <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">
                    Target Ujian
                  </p>
                  <p className="text-sm font-bold text-white leading-tight">
                    {selectedDate.toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">
                    Target Ujian
                  </p>
                  <p className="text-sm text-white/60 leading-tight">
                    Belum diatur — klik tanggal di kalender
                  </p>
                </>
              )}
            </div>
          </div>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(undefined)}
              className="text-[10px] text-white/40 hover:text-white/70 transition-colors border border-white/10 px-2 py-1 rounded-lg"
            >
              Ubah
            </button>
          )}
        </div>

        {/* ── Kalender custom ── */}
        <div className="px-5 pt-4 pb-2">

          {/* Nav bulan */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <p className="text-sm font-bold text-[#1B2B5E] capitalize">{monthLabel}</p>
            <button
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Header hari */}
          <div className="grid grid-cols-7 mb-1">
            {CAL_HEADERS.map(h => (
              <div key={h} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">
                {h}
              </div>
            ))}
          </div>

          {/* Grid tanggal */}
          <div className="grid grid-cols-7 gap-y-1">
            {calendarDays.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />;
              const style = getDayStyle(day);
              const past  = isPast(day);
              return (
                <div key={day} className="flex justify-center py-0.5">
                  <button
                    onClick={() => handleDayClick(day)}
                    disabled={past}
                    className={cn(
                      'w-9 h-9 flex items-center justify-center text-sm transition-all duration-150',
                      style.wrapper,
                      past ? 'cursor-default' : 'cursor-pointer',
                    )}
                  >
                    <span className={cn('text-xs leading-none', style.text)}>{day}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Legend ── */}
        <div className="px-5 pb-3 pt-1 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-slate-500">Latihan dikerjakan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-300" />
            <span className="text-[10px] text-slate-500">Tidak latihan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#1B2B5E]" />
            <span className="text-[10px] text-slate-500">Target ujian</span>
          </div>
        </div>

        <div className="h-px bg-slate-100 mx-5" />

        {/* ── Settings ── */}
        <div className="px-5 py-4 space-y-4">

          {/* Frekuensi */}
          <div className="space-y-2.5">
            <div>
              <p className="text-xs font-bold text-[#1B2B5E]">Frekuensi Latihan</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Seberapa sering kamu mau mengerjakan soal latihan?
              </p>
            </div>

            {/* Radio list */}
            <div className="space-y-1.5">
              {PRESET_OPTIONS.map(opt => {
                const isActive = scheduleMode === opt.value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setScheduleMode(opt.value)}
                    className={cn(
                      'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all duration-150 text-left',
                      isActive
                        ? 'bg-[#1B2B5E]/5 border-[#1B2B5E]/30'
                        : 'bg-white border-slate-100 hover:border-slate-200',
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      {opt.value === 'custom' && (
                        <Pencil className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      )}
                      <span className={cn(
                        'text-xs font-semibold',
                        isActive ? 'text-[#1B2B5E]' : 'text-slate-600',
                      )}>
                        {opt.label}
                      </span>
                    </div>
                    {/* Radio dot */}
                    <div className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                      isActive ? 'border-[#1B2B5E] bg-[#1B2B5E]' : 'border-slate-300',
                    )}>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom day picker */}
            {scheduleMode === 'custom' && (
              <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Pilih hari latihan
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {DAY_LABELS.map(day => {
                    const sel = customDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleCustomDay(day.value)}
                        className={cn(
                          'w-10 h-10 rounded-xl text-[10px] font-bold border transition-all flex flex-col items-center justify-center gap-0.5',
                          sel
                            ? 'bg-[#F5A623] text-white border-[#F5A623] shadow-sm'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-[#F5A623]/60',
                        )}
                      >
                        <span>{day.short}</span>
                        {sel && <Check className="w-2.5 h-2.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-slate-100" />

          {/* Toggle pengingat */}
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-[#1B2B5E]">Pengingat Otomatis</p>
            <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0',
                  reminderOn ? 'bg-[#F5A623]/15' : 'bg-slate-200',
                )}>
                  {reminderOn
                    ? <Bell    className="w-3.5 h-3.5 text-[#F5A623]" />
                    : <BellOff className="w-3.5 h-3.5 text-slate-400" />
                  }
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700">
                    {reminderOn ? 'Pengingat aktif' : 'Pengingat nonaktif'}
                  </p>
                  <p className="text-[10px] text-slate-400">Via Email &amp; Notifikasi</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={reminderOn}
                onClick={() => setReminderOn(v => !v)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 outline-none',
                  'focus-visible:ring-2 focus-visible:ring-[#1B2B5E]',
                  reminderOn ? 'bg-[#F5A623]' : 'bg-slate-300',
                )}
              >
                <span className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200',
                  reminderOn ? 'translate-x-5' : 'translate-x-0',
                )} />
              </button>
            </div>
          </div>

          {/* Save */}
          {onSavePreference && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !selectedDate}
              className={cn(
                'w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200',
                saved
                  ? 'bg-emerald-100 text-emerald-700'
                  : selectedDate
                  ? 'bg-[#1B2B5E] text-white hover:bg-[#1B2B5E]/90 shadow-sm'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed',
              )}
            >
              {saved ? '✓ Jadwal berhasil disimpan'
                : saving ? 'Menyimpan...'
                : selectedDate ? 'Simpan Jadwal'
                : 'Pilih tanggal ujian terlebih dahulu'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}