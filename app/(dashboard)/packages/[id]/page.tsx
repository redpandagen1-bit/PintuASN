import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { getPackageById, getUserAttempts } from '@/lib/supabase/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExamInstructionsModal } from '@/components/exam/exam-instructions-modal';
import { Clock, FileText, Trophy, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function getDifficultyVariant(difficulty: string): 'default' | 'secondary' | 'destructive' {
  switch (difficulty) {
    case 'easy':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'hard':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export default async function PackageDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }>  // ✅ BENAR
}) {
  const { id } = await params;  // ✅ BENAR
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const packageData = await getPackageById(params.id);
  if (!packageData) notFound();

  const attempts = await getUserAttempts(user.id);
  const activeAttempt = attempts.find(
    a => a.package_id === params.id && a.status === 'in_progress'
  );

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Package Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-slate-900">{packageData.title}</h1>
          <Badge 
            variant={getDifficultyVariant(packageData.difficulty)}
            className={
              packageData.difficulty === 'easy' 
                ? 'bg-green-100 text-green-800 border-green-300' 
                : packageData.difficulty === 'hard'
                ? 'bg-red-100 text-red-800 border-red-300'
                : 'bg-yellow-100 text-yellow-800 border-yellow-300'
            }
          >
            {packageData.difficulty === 'easy' ? 'Mudah' : packageData.difficulty === 'hard' ? 'Sulit' : 'Sedang'}
          </Badge>
        </div>
        {packageData.description && (
          <p className="text-slate-600">{packageData.description}</p>
        )}
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Total Soal</CardTitle>
            <FileText className="h-8 w-8 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">110 Soal</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Durasi</CardTitle>
            <Clock className="h-8 w-8 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100 Menit</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Passing Grade</CardTitle>
            <Trophy className="h-8 w-8 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-sm">TWK ≥ 65</div>
              <div className="text-sm">TIU ≥ 80</div>
              <div className="text-sm">TKP ≥ 166</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Passing Grade Alert */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="font-semibold mb-2">Persyaratan Kelulusan:</div>
          <div className="space-y-1">
            <div>• TWK ≥ 65</div>
            <div>• TIU ≥ 80</div>
            <div>• TKP ≥ 166</div>
            <div className="text-xs mt-2 text-orange-700">Semua kategori harus memenuhi batas minimal</div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Question Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Distribusi Soal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">30</div>
              <div className="text-sm text-blue-600">TWK</div>
              <div className="text-xs text-gray-600">Tes Wawasan Kebangsaan</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">35</div>
              <div className="text-sm text-green-600">TIU</div>
              <div className="text-xs text-gray-600">Tes Intelegensia Umum</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">45</div>
              <div className="text-sm text-purple-600">TKP</div>
              <div className="text-xs text-gray-600">Tes Karakteristik Pribadi</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Section */}
      <Card>
        <CardContent className="pt-6">
          {activeAttempt ? (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Anda memiliki ujian yang sedang berlangsung untuk paket ini.
                </AlertDescription>
              </Alert>
              <Link href={`/exam/${activeAttempt.id}`}>
                <Button className="w-full md:w-auto">
                  Lanjutkan Tryout
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex justify-center">
              <ExamInstructionsModal packageId={params.id} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
