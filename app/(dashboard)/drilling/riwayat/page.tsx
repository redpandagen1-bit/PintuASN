import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { ArrowLeft, Target, BookOpenCheck, History } from 'lucide-react';
import { getDrillingHistory } from '@/lib/supabase/drilling';

function fmt(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function DrillingHistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const sessions = await getDrillingHistory(userId);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0 pb-10">
      <div className="flex items-center gap-2.5 mt-3 md:mt-0 mb-5">
        <Link
          href="/drilling"
          className="w-9 h-9 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Riwayat Drilling</h1>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-slate-200">
          <History className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 mb-4">Belum ada sesi drilling yang selesai.</p>
          <Link
            href="/drilling"
            className="inline-flex items-center gap-1.5 px-5 h-11 rounded-xl bg-yellow-400 text-slate-900 font-bold hover:bg-yellow-300 transition"
          >
            <Target className="w-4 h-4" /> Mulai Drilling
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border-2 border-slate-100 bg-white p-4 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{s.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {fmt(s.completedAt)} · {s.totalQuestions} soal
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link
                  href={`/exam/${s.id}/result`}
                  className="px-3 h-9 inline-flex items-center rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition"
                >
                  Hasil
                </Link>
                <Link
                  href={`/exam/${s.id}/review`}
                  className="px-3 h-9 inline-flex items-center gap-1 rounded-xl border-2 border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  <BookOpenCheck className="w-3.5 h-3.5" /> Pembahasan
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
