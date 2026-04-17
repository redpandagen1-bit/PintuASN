import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { getPackageById, getUserAttempts } from '@/lib/supabase/queries';
import { ExamInstructionsModal } from '@/components/exam/exam-instructions-modal';
import { MobilePageWrapper }    from '@/components/mobile/MobilePageWrapper';
import { MobilePackageDetail }  from '@/components/mobile/MobilePackageDetail';
import {
  Clock,
  FileText,
  Target,
  AlertCircle,
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  Users,
  PlayCircle,
} from 'lucide-react';
import Link from 'next/link';

// ── HELPERS ────────────────────────────────────────────────────────────────

function getDifficultyLabel(difficulty: string) {
  switch (difficulty) {
    case 'easy':   return { label: 'Mudah',  color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'medium': return { label: 'Sedang', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    case 'hard':   return { label: 'Sulit',  color: 'bg-red-100 text-red-800 border-red-200' };
    default:       return { label: difficulty, color: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

// ── PAGE ───────────────────────────────────────────────────────────────────

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const packageData = await getPackageById(id);
  if (!packageData) notFound();

  const attempts = await getUserAttempts(user.id);
  const activeAttempt = attempts.find(
    a => a.package_id === id && a.status === 'in_progress'
  );

  const difficulty = getDifficultyLabel(packageData.difficulty);

  const distribution = { twk: 30, tiu: 35, tkp: 45 };
  const totalQuestions = 110;
  const passingGrade = { twk: 65, tiu: 80, tkp: 166 };

  return (
    <>
      <MobilePageWrapper>
        <MobilePackageDetail
          packageId={id}
          title={packageData.title}
          description={packageData.description}
          difficulty={packageData.difficulty}
          tier={(packageData as any).tier ?? null}
          hasActiveAttempt={!!activeAttempt}
          activeAttemptId={activeAttempt?.id ?? null}
        />
      </MobilePageWrapper>
      <div className="hidden md:block min-h-screen bg-slate-50 pb-20 md:pb-8">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Back */}
        <Link
          href="/daftar-tryout"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors"
        >
          <ArrowLeft size={16} /> Kembali ke Daftar Tryout
        </Link>

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <div className="relative bg-pn-navy rounded-2xl p-5 md:p-8 overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 w-64 h-64 bg-yellow-400 rounded-full opacity-10 blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            {/* Left text */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${difficulty.color}`}>
                  {difficulty.label}
                </span>
                <span className="text-slate-400 text-sm flex items-center gap-1.5">
                  <Target size={14} /> SKD CPNS
                </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 tracking-tight">
                {packageData.title}
              </h1>

              {packageData.description && (
                <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl">
                  {packageData.description}
                </p>
              )}
            </div>

            {/* CTA card */}
            <div className="shrink-0 w-full md:w-auto flex flex-col items-center bg-white/5 p-5 rounded-xl border border-white/10 backdrop-blur-sm">
              <div className="flex justify-between w-full mb-4 md:hidden text-slate-300 text-sm">
                <span>{totalQuestions} Soal</span>
                <span>100 Menit</span>
              </div>

              {activeAttempt ? (
                <Link href={`/exam/${activeAttempt.id}`} className="w-full md:w-56">
                  <button className="w-full group flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-3.5 px-6 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(250,204,21,0.4)] hover:-translate-y-0.5">
                    <PlayCircle size={20} className="group-hover:scale-110 transition-transform" />
                    LANJUTKAN TRYOUT
                  </button>
                </Link>
              ) : (
                <div className="w-full md:w-56 [&_button]:w-full [&_button]:bg-yellow-400 [&_button]:hover:bg-yellow-500 [&_button]:text-slate-900 [&_button]:font-bold [&_button]:py-3.5 [&_button]:px-6 [&_button]:rounded-xl [&_button]:border-0 [&_button]:shadow-[0_4px_14px_0_rgba(250,204,21,0.4)] [&_button]:transition-all [&_button]:text-base">
                  <ExamInstructionsModal packageId={id} />
                </div>
              )}

              <p className="text-xs text-slate-400 mt-3 text-center">
                Kerjakan dengan jujur dan fokus.
              </p>
            </div>
          </div>
        </div>

        {/* ── QUICK STATS ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Row 1: Total Soal + Durasi */}
          <div className="bg-white p-5 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Soal</p>
              <p className="text-2xl font-bold text-slate-800">{totalQuestions}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Durasi</p>
              <p className="text-2xl font-bold text-slate-800">100 Menit</p>
            </div>
          </div>

          {/* Row 2: Perhatian — full width */}
          <div className="col-span-2 bg-amber-50 p-5 rounded-xl border border-amber-200 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Perhatian</p>
              <p className="text-sm font-semibold text-amber-900">
                Semua kategori harus memenuhi nilai ambang batas (Passing Grade). Pastikan koneksi internet stabil sebelum memulai.
              </p>
            </div>
          </div>
        </div>

        {/* ── DETAIL GRID ───────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Passing Grade */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center gap-2">
              <Target size={18} className="text-yellow-600" />
              <h3 className="font-bold text-slate-800">Target Passing Grade</h3>
            </div>
            <div className="p-5 space-y-4">
              {[
                { key: 'TWK', label: 'Tes Wawasan Kebangsaan', value: passingGrade.twk, Icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
                { key: 'TIU', label: 'Tes Intelegensia Umum',  value: passingGrade.tiu, Icon: BrainCircuit, color: 'text-green-600 bg-green-50' },
                { key: 'TKP', label: 'Tes Karakteristik Pribadi', value: passingGrade.tkp, Icon: Users, color: 'text-purple-600 bg-purple-50' },
              ].map((item, i) => (
                <div key={item.key}>
                  {i > 0 && <div className="h-px bg-slate-100 mb-4" />}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                        <item.Icon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.key}</p>
                        <p className="text-xs text-slate-500">{item.label}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-0.5">Nilai Minimal</p>
                      <p className="text-lg font-black text-slate-800">≥ {item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribusi Soal */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center gap-2">
              <FileText size={18} className="text-slate-600" />
              <h3 className="font-bold text-slate-800">Distribusi Jumlah Soal</h3>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {/* Progress bar */}
              <div className="flex h-3 rounded-full overflow-hidden">
                <div className="bg-indigo-500" style={{ width: `${(distribution.twk / totalQuestions) * 100}%` }} />
                <div className="bg-emerald-500" style={{ width: `${(distribution.tiu / totalQuestions) * 100}%` }} />
                <div className="bg-purple-500"  style={{ width: `${(distribution.tkp / totalQuestions) * 100}%` }} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'TWK', count: distribution.twk, dot: 'bg-indigo-500' },
                  { label: 'TIU', count: distribution.tiu, dot: 'bg-emerald-500' },
                  { label: 'TKP', count: distribution.tkp, dot: 'bg-purple-500'  },
                ].map(item => (
                  <div key={item.label} className="bg-[#eff4ff] rounded-xl p-3 text-center">
                    <div className={`w-2 h-2 rounded-full ${item.dot} mx-auto mb-2`} />
                    <p className="text-2xl font-black text-slate-800 leading-none mb-1">{item.count}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Soal {item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* ── STICKY MOBILE BUTTON ──────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        {activeAttempt ? (
          <Link href={`/exam/${activeAttempt.id}`} className="block">
            <button className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-3.5 px-6 rounded-xl transition-all">
              <PlayCircle size={20} /> LANJUTKAN TRYOUT
            </button>
          </Link>
        ) : (
          <div className="[&_button]:w-full [&_button]:bg-yellow-400 [&_button]:hover:bg-yellow-500 [&_button]:text-slate-900 [&_button]:font-bold [&_button]:py-3.5 [&_button]:px-6 [&_button]:rounded-xl [&_button]:border-0 [&_button]:text-base">
            <ExamInstructionsModal packageId={id} />
          </div>
        )}
      </div>
    </div>
    </>
  );
}