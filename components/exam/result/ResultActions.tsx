import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2, XCircle, ArrowLeft, FileText, Grid3x3 } from 'lucide-react';

interface ResultActionsProps {
  attemptId: string;
  isPassed: boolean | null;
}

export default function ResultActions({ attemptId, isPassed }: ResultActionsProps) {
  return (
    <div className="mt-8">
      {/* Motivational Message */}
      <div className="mb-6 text-center">
        {isPassed ? (
          <div className="inline-flex items-center gap-2 px-6 py-4 bg-green-50 dark:bg-green-950 rounded-xl border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-lg font-semibold text-green-800 dark:text-green-200">
                Kerja bagus! Pertahankan performa Anda! 🎉
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Anda berhasil melewati ambang batas kelulusan
              </p>
            </div>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-6 py-4 bg-red-50 dark:bg-red-950 rounded-xl border border-red-200 dark:border-red-800">
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-lg font-semibold text-red-800 dark:text-red-200">
                Jangan menyerah! Terus berlatih! 💪
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Setiap percobaan membawa Anda lebih dekat dengan kesuksesan
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Button asChild variant="outline" size="lg">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
        </Button>
        
        <Button asChild variant="default" size="lg">
          <Link href={`/exam/${attemptId}/review`} className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Lihat Pembahasan
          </Link>
        </Button>

        <Button asChild variant="secondary" size="lg">
          <Link href="/daftar-tryout" className="flex items-center gap-2">
            <Grid3x3 className="w-4 h-4" />
            Coba Tryout Lain
          </Link>
        </Button>
      </div>

      {/* Study Tips */}
      <div className="bg-blue-50 dark:bg-blue-950 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          💡 Tips Belajar Lanjutan
        </h4>
        {isPassed ? (
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Mantap! Sekarang coba paket soal dengan tingkat kesulitan lebih tinggi</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Fokus pada kategori soal yang nilai Anda masih di batas minimum</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Latih manajemen waktu untuk meningkatkan efisiensi</span>
            </li>
          </ul>
        ) : (
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Ulangi materi dari kategori yang Anda belum lulus</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Coba lagi setelah 1 minggu untuk melihat peningkatan</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Pelajari strategi menjawab soal yang memakan waktu lama</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
