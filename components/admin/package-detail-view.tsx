'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Upload, Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

interface PackageDetailViewProps {
  packageData: any;
  questions: any[];
}

export function PackageDetailView({ packageData, questions }: PackageDetailViewProps) {
  const router = useRouter();
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRemoveQuestion = async () => {
    if (!deleteQuestionId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/packages/${packageData.id}/questions?question_id=${deleteQuestionId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        router.refresh();
        setDeleteQuestionId(null);
      } else {
        alert('Gagal menghapus soal dari paket');
      }
    } catch (error) {
      console.error('Remove question error:', error);
      alert('Terjadi kesalahan');
    } finally {
      setIsDeleting(false);
    }
  };

  // Group questions by category
  const questionsByCategory = {
    TWK: questions.filter((q) => q.category === 'TWK'),
    TIU: questions.filter((q) => q.category === 'TIU'),
    TKP: questions.filter((q) => q.category === 'TKP'),
  };

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
          <Link href={`/admin/packages/${packageData.id}/edit`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Info
            </Button>
          </Link>
        </div>
      </div>

      {/* Package Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Paket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <p className="text-sm text-slate-500">Status</p>
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
              <p className="text-3xl font-bold text-slate-900">{questions.length}</p>
              <p className="text-sm text-slate-600 mt-1">Total Soal</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-900">{questionsByCategory.TWK.length}</p>
              <p className="text-sm text-blue-700 mt-1">TWK</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-900">{questionsByCategory.TIU.length}</p>
              <p className="text-sm text-green-700 mt-1">TIU</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-900">{questionsByCategory.TKP.length}</p>
              <p className="text-sm text-purple-700 mt-1">TKP</p>
            </div>
          </div>

          {questions.length < 110 && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ Paket ini membutuhkan {110 - questions.length} soal lagi untuk mencapai 110 soal
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Soal ({questions.length})</CardTitle>
            <div className="flex gap-2">
              <Link href={`/admin/packages/${packageData.id}/questions/bulk-add`}>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Input Soal (1-110)
                </Button>
              </Link>
              <Link href={`/admin/packages/${packageData.id}/questions/upload`}>
                <Button size="sm" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Belum ada soal dalam paket ini</p>
              <p className="text-sm text-slate-400 mt-1">
                Tambah soal untuk melengkapi paket tryout
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead className="w-24">Kategori</TableHead>
                    <TableHead className="min-w-[400px]">Pertanyaan</TableHead>
                    <TableHead className="w-32">Tingkat</TableHead>
                    <TableHead className="w-20">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((q, index) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.position}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            q.category === 'TWK' ? 'default' :
                            q.category === 'TIU' ? 'secondary' :
                            'outline'
                          }
                        >
                          {q.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="line-clamp-2">{q.content}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {q.difficulty === 'easy' ? 'Mudah' :
                           q.difficulty === 'medium' ? 'Sedang' :
                           'Sulit'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteQuestionId(q.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteQuestionId} onOpenChange={() => setDeleteQuestionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Soal dari Paket?</AlertDialogTitle>
            <AlertDialogDescription>
              Soal akan dihapus dari paket ini. Soal tidak akan dihapus dari database,
              hanya hubungan dengan paket ini yang akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveQuestion}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}