import { CheckCircle2, XCircle } from 'lucide-react';

interface ResultHeaderProps {
  isPassed: boolean | null;
  packageTitle?: string | null;
}

export default function ResultHeader({ isPassed, packageTitle }: ResultHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-6">
        {isPassed ? (
          <CheckCircle2 className="w-20 h-20 text-green-500" />
        ) : (
          <XCircle className="w-20 h-20 text-red-500" />
        )}
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-3">
        {isPassed ? 'Selamat! Anda Lulus' : 'Belum Lulus'}
      </h1>
      <p className="text-muted-foreground text-lg">
        {packageTitle || 'Tryout SKD'}
      </p>
      <div className="mt-4">
        {isPassed ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300 font-medium">
              Lulus dalam ujian
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-red-700 dark:text-red-300 font-medium">
              Belum lulus dalam ujian
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
