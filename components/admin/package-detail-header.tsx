'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, Edit, Settings } from 'lucide-react';
import { PackageEditDialog } from '@/components/admin/package-edit-dialog';

interface PackageDetailHeaderProps {
  packageData: any;
  questions: any[];
}

export function PackageDetailHeader({ packageData, questions }: PackageDetailHeaderProps) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Calculate statistics
  const totalQuestions = 110;
  const filledQuestions = questions.length;
  const emptyQuestions = totalQuestions - filledQuestions;

  // Count by category
  const twkCount = questions.filter((q) => q.category === 'TWK').length;
  const tiuCount = questions.filter((q) => q.category === 'TIU').length;
  const tkpCount = questions.filter((q) => q.category === 'TKP').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/packages">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{packageData.title}</h1>
            <p className="text-slate-600 mt-1">{packageData.description}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/admin/packages/${packageData.id}/questions/bulk-add`}>
            <Button className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Soal Paket
            </Button>
          </Link>
          <Link href={`/admin/packages/${packageData.id}/questions/upload`}>
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload CSV
            </Button>
          </Link>
        </div>
      </div>

      {/* Package Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle>Informasi Paket</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditDialogOpen(true)}
            title="Pengaturan Paket"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div>
              <p className="text-sm text-slate-500">Tier</p>
              <Badge
                variant={
                  packageData.tier === 'free' ? 'secondary' :
                  packageData.tier === 'premium' ? 'default' :
                  'outline'
                }
                className={
                  packageData.tier === 'platinum'
                    ? 'bg-amber-100 text-amber-800 border-amber-300 mt-1'
                    : 'mt-1'
                }
              >
                {packageData.tier === 'free' ? 'Gratis' :
                 packageData.tier === 'premium' ? 'Premium' :
                 'Platinum'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-500">Tingkat Kesulitan</p>
              <Badge variant="outline" className="capitalize mt-1">
                {packageData.difficulty === 'easy' ? 'Mudah' :
                 packageData.difficulty === 'medium' ? 'Sedang' :
                 'Sulit'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-500">Durasi</p>
              <p className="font-semibold text-slate-900 mt-1">
                {packageData.duration_minutes} menit
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Soal</p>
              <p className="font-semibold text-slate-900 mt-1">
                {filledQuestions} / {totalQuestions}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Status Paket</p>
              <Badge
                variant={packageData.is_active ? 'default' : 'secondary'}
                className={
                  packageData.is_active
                    ? 'bg-green-100 text-green-800 border-green-300 mt-1'
                    : 'bg-slate-100 text-slate-700 mt-1'
                }
              >
                {packageData.is_active ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Statistik Soal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-3xl font-bold text-slate-900">{filledQuestions}</p>
              <p className="text-sm text-slate-600 mt-1">Total Soal Terisi</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-900">{twkCount}</p>
              <p className="text-sm text-blue-700 mt-1">TWK (Target: 30)</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-900">{tiuCount}</p>
              <p className="text-sm text-green-700 mt-1">TIU (Target: 35)</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-900">{tkpCount}</p>
              <p className="text-sm text-purple-700 mt-1">TKP (Target: 45)</p>
            </div>
          </div>

          {emptyQuestions > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Paket ini membutuhkan {emptyQuestions} soal lagi untuk mencapai 110 soal
              </p>
            </div>
          )}

          {filledQuestions === 110 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Paket sudah lengkap! Semua 110 soal telah terisi.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <PackageEditDialog
        packageData={packageData}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}