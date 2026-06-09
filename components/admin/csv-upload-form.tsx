'use client';

// ============================================================
// components/admin/csv-upload-form.tsx
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Upload, Loader2, AlertCircle, Info, CheckCircle2, SkipForward } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CSVUploadFormProps {
  packageId: string;
  packageTitle: string;
}

export function CSVUploadForm({ packageId, packageTitle }: CSVUploadFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('File harus berformat .csv');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setParseResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('packageId', packageId);

      const response = await fetch('/api/admin/upload/csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal mengupload CSV');
      }

      const result = await response.json();
      setParseResult(result);

      if (result.invalidRows.length === 0 && result.inserted > 0) {
        setTimeout(() => {
          router.push(`/admin/packages/${packageId}`);
          router.refresh();
        }, 2500);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // ── Download template dengan kolom position ──────────────────────────
  const downloadTemplate = (type: 'twk_tiu' | 'tkp') => {
    const csvContent =
      type === 'twk_tiu'
        ? [
            'position,category,question_text,image_url,option_a,option_b,option_c,option_d,option_e,correct_answer,explanation,topic,difficulty',
            '2,TWK,Pancasila sebagai dasar negara Indonesia terdapat dalam?,,Pembukaan UUD 1945,Pasal 1 UUD 1945,Pasal 33 UUD 1945,Batang Tubuh UUD 1945,Penjelasan UUD 1945,A,Pancasila tercantum dalam Pembukaan UUD 1945 alinea keempat,Pancasila,medium',
            '3,TWK,Sila ke-3 Pancasila berbunyi?,,Ketuhanan Yang Maha Esa,Kemanusiaan yang Adil dan Beradab,Persatuan Indonesia,Kerakyatan yang Dipimpin oleh Hikmat,Keadilan Sosial bagi Seluruh Rakyat Indonesia,C,Sila ke-3 adalah Persatuan Indonesia,Pancasila,easy',
            '32,TIU,Hasil dari 15 x 8 + 25 - 10 = ?,,135,125,115,145,155,A,15 x 8 = 120 kemudian 120 + 25 = 145 kemudian 145 - 10 = 135,Matematika,easy',
          ].join('\n')
        : [
            'position,category,question_text,image_url,option_a,option_b,option_c,option_d,option_e,tkp_score_a,tkp_score_b,tkp_score_c,tkp_score_d,tkp_score_e,explanation,topic,difficulty',
            '66,TKP,Ketika rekan kerja melakukan kesalahan yang merugikan tim:,,Melaporkan langsung ke atasan,Diam saja agar tidak konflik,Berbicara baik-baik dengan rekan tersebut,Menghindari rekan tersebut,Menyebar kabar kesalahan rekan,3,1,5,2,4,Berbicara baik-baik adalah sikap yang paling konstruktif,Integritas,medium',
            '67,TKP,Saat mendapat tugas mendadak dari atasan sementara pekerjaan lain menumpuk:,,Menolak tugas tersebut,Menerima dan langsung mengerjakan tanpa memberi tahu atasan,Mendiskusikan prioritas dengan atasan,Mendelegasikan semua pekerjaan ke rekan,Mengabaikan tugas lama,2,1,5,3,4,Mendiskusikan prioritas menunjukkan profesionalisme,Manajemen Waktu,medium',
          ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${type}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const allSuccess = parseResult && parseResult.invalidRows.length === 0 && parseResult.inserted > 0;
  const hasErrors  = parseResult && parseResult.invalidRows.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/packages/${packageId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Upload Soal CSV</h1>
          <p className="text-slate-600 mt-1">Paket: {packageTitle}</p>
        </div>
      </div>

      {/* Panduan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            Panduan Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Range posisi */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'TWK', range: 'Soal 1 – 30', color: 'bg-blue-50 border-blue-200 text-blue-800' },
              { label: 'TIU', range: 'Soal 31 – 65', color: 'bg-green-50 border-green-200 text-green-800' },
              { label: 'TKP', range: 'Soal 66 – 110', color: 'bg-purple-50 border-purple-200 text-purple-800' },
            ].map(({ label, range, color }) => (
              <div key={label} className={`p-3 rounded-lg border text-center ${color}`}>
                <p className="font-bold text-sm">{label}</p>
                <p className="text-xs mt-0.5">{range}</p>
              </div>
            ))}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <ul className="space-y-1.5 mt-1">
                <li>• Kolom <code className="bg-slate-100 px-1 rounded">position</code> <strong>wajib diisi</strong> — nomor soal 1–110 sesuai urutan dalam paket</li>
                <li>• Posisi yang <strong>sudah terisi</strong> akan otomatis di-skip (tidak ditimpa)</li>
                <li>• Boleh upload sebagian soal dulu, sisanya upload di lain waktu</li>
                <li>• <code className="bg-slate-100 px-1 rounded">category</code> harus sesuai range posisi (TWK=1–30, TIU=31–65, TKP=66–110)</li>
                <li>• Jika tidak ada gambar, kosongkan kolom <code className="bg-slate-100 px-1 rounded">image_url</code></li>
                <li>• TKP: semua <code className="bg-slate-100 px-1 rounded">tkp_score_*</code> harus unik (tidak boleh ada angka sama)</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => downloadTemplate('twk_tiu')} className="gap-2">
              <Download className="h-4 w-4" />
              Template TWK / TIU
            </Button>
            <Button variant="outline" onClick={() => downloadTemplate('tkp')} className="gap-2">
              <Download className="h-4 w-4" />
              Template TKP
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload File CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <label htmlFor="csv-file" className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-700 font-medium">Klik untuk browse</span>
              <span className="text-slate-600"> atau drag & drop file CSV</span>
              <input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-sm text-slate-500 mt-1">Format: .csv</p>

            {file && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded inline-block">
                <p className="text-sm text-blue-900 font-medium">{file.name}</p>
                <p className="text-xs text-blue-700">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Hasil parse */}
          {parseResult && (
            <div className="space-y-3">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Total di CSV', value: parseResult.totalRows, color: 'text-slate-800' },
                  { label: 'Berhasil dimasukkan', value: parseResult.inserted ?? parseResult.validRows, color: 'text-emerald-600' },
                  { label: 'Di-skip (sudah ada)', value: parseResult.skippedRows?.length ?? 0, color: 'text-amber-600' },
                  { label: 'Error', value: parseResult.invalidRows.length, color: 'text-red-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-3 bg-slate-50 rounded-lg border text-center">
                    <p className={`text-2xl font-black ${color}`}>{value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Sukses */}
              {allSuccess && (
                <Alert className="border-emerald-200 bg-emerald-50">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-800">
                    <strong>✅ {parseResult.inserted} soal berhasil dimasukkan!</strong> Mengalihkan ke halaman paket...
                  </AlertDescription>
                </Alert>
              )}

              {/* Skip info */}
              {parseResult.skippedRows?.length > 0 && (
                <Alert className="border-amber-200 bg-amber-50">
                  <SkipForward className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <p className="font-medium mb-1">Posisi yang di-skip (sudah terisi):</p>
                    <p className="text-xs">
                      {parseResult.skippedRows.map((s: any) => `#${s.position}`).join(', ')}
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Error detail */}
              {hasErrors && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-2">❌ {parseResult.invalidRows.length} baris error — tidak ada soal yang dimasukkan:</p>
                    <ul className="text-xs space-y-1 max-h-40 overflow-y-auto">
                      {parseResult.invalidRows.map((row: any) => (
                        <li key={row.row} className="flex gap-2">
                          <span className="font-mono font-bold shrink-0">
                            Baris {row.row}{row.position ? ` (pos #${row.position})` : ''}:
                          </span>
                          <span>{row.errors.join(', ')}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs mt-2 font-medium">Perbaiki error di atas lalu upload ulang.</p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button variant="outline" onClick={() => router.back()} disabled={isUploading}>
              Batal
            </Button>
            <Button onClick={handleUpload} disabled={!file || isUploading || allSuccess}>
              {isUploading
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Memproses...</>
                : <><Upload className="h-4 w-4 mr-2" />Upload & Proses</>
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}