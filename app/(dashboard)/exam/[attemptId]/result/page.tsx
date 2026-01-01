import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface ResultPageProps {
  params: Promise<{ attemptId: string }>;
}

async function getResultData(attemptId: string, userId: string) {
  const supabase = await createAdminClient();

  // ✅ STEP 1: Fetch attempt dengan semua data yang dibutuhkan
  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .select(`
      id,
      user_id,
      package_id,
      status,
      score_twk,
      score_tiu,
      score_tkp,
      final_score,
      is_passed,
      started_at,
      completed_at,
      packages (
        id,
        title,
        description,
        difficulty
      )
    `)
    .eq('id', attemptId)
    .eq('user_id', userId)
    .single();

  if (attemptError || !attempt) {
    console.error('Error fetching attempt:', attemptError);
    redirect('/dashboard');
  }

  // ✅ Redirect if not completed (FIXED SYNTAX!)
  if (attempt.status !== 'completed') {
    redirect(`/exam/${attemptId}`); // ← FIXED: Parentheses, not backticks!
  }

  return {
    attempt,
    packageInfo: attempt.packages,
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const { attemptId } = await params;
  const { attempt, packageInfo } = await getResultData(attemptId, userId);

  // Calculate duration
  const duration = attempt.completed_at && attempt.started_at
    ? Math.round((new Date(attempt.completed_at).getTime() - new Date(attempt.started_at).getTime()) / 60000)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          {attempt.is_passed ? (
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500" />
          )}
        </div>
        <h1 className="text-3xl font-bold mb-2">
          {attempt.is_passed ? 'Selamat! Anda Lulus' : 'Belum Lulus'}
        </h1>
        <p className="text-muted-foreground">
          {packageInfo?.title || 'Tryout SKD'}
        </p>
      </div>

      {/* Score Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ringkasan Nilai</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Score */}
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {attempt.final_score || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Nilai</div>
            </div>

            {/* TWK Score */}
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {attempt.score_twk || 0}
              </div>
              <div className="text-sm text-muted-foreground">TWK</div>
            </div>

            {/* TIU Score */}
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {attempt.score_tiu || 0}
              </div>
              <div className="text-sm text-muted-foreground">TIU</div>
            </div>

            {/* TKP Score */}
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {attempt.score_tkp || 0}
              </div>
              <div className="text-sm text-muted-foreground">TKP</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Durasi</div>
                <div className="text-xl font-semibold">{duration} menit</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <Badge variant={attempt.is_passed ? 'default' : 'destructive'}>
                  {attempt.is_passed ? 'LULUS' : 'TIDAK LULUS'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {packageInfo?.difficulty === 'mudah' ? 'M' : 
                 packageInfo?.difficulty === 'sedang' ? 'S' : 'S'}
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Tingkat</div>
                <div className="text-xl font-semibold capitalize">
                  {packageInfo?.difficulty || 'Sedang'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pembahasan Notice */}
      <Card className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 <strong>Pembahasan soal</strong> akan tersedia setelah Anda menyelesaikan ujian. 
            Klik tombol "Lihat Pembahasan" di bawah untuk melihat jawaban yang benar dan penjelasan lengkap.
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/dashboard">
            Kembali ke Dashboard
          </Link>
        </Button>
        
        <Button asChild variant="default" size="lg">
          <Link href={`/exam/${attemptId}/review`}>
            Lihat Pembahasan
          </Link>
        </Button>

        <Button asChild variant="secondary" size="lg">
          <Link href="/packages">
            Coba Tryout Lain
          </Link>
        </Button>
      </div>

      {/* Motivational Message */}
      <div className="mt-8 text-center">
        {attempt.is_passed ? (
          <div className="text-green-600 dark:text-green-400">
            <p className="text-lg font-medium">
              Kerja bagus! Pertahankan performa Anda! 🎉
            </p>
          </div>
        ) : (
          <div className="text-muted-foreground">
            <p className="text-lg font-medium">
              Jangan menyerah! Terus berlatih untuk hasil yang lebih baik! 💪
            </p>
          </div>
        )}
      </div>
    </div>
  );
}