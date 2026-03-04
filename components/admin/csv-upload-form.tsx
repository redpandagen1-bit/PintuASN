'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Upload, Loader2, AlertCircle } from 'lucide-react';
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

      if (result.invalidRows.length === 0) {
        // Auto submit if all valid
        setTimeout(() => {
          router.push(`/admin/packages/${packageId}`);
        }, 2000);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = (type: 'twk_tiu' | 'tkp') => {
    const csvContent =
      type === 'twk_tiu'
        ? `category,question_text,image_url,option_a,option_b,option_c,option_d,option_e,correct_answer,explanation,topic,difficulty
TWK,Pancasila sebagai dasar negara Indonesia disahkan pada tanggal?,,17 Agustus 1945,18 Agustus 1945,1 Juni 1945,22 Juni 1945,5 Juli 1945,A,Pancasila disahkan pada 18 Agustus 1945,Pancasila,medium
TIU,Hasil dari 15 x 8 + 25 - 10 = ?,,135,125,115,145,155,A,15 x 8 = 120; 120 + 25 = 145; 145 - 10 = 135,Matematika,easy`
        : `category,question_text,image_url,option_a,option_b,option_c,option_d,option_e,tkp_score_a,tkp_score_b,tkp_score_c,tkp_score_d,tkp_score_e,explanation,topic,difficulty
TKP,Ketika rekan kerja melakukan kesalahan yang merugikan tim:,,Melaporkan langsung ke atasan,Diam saja agar tidak konflik,Berbicara baik-baik dengan rekan tersebut,Menghindari rekan tersebut,Menyebar kabar kesalahan rekan,5,1,4,2,1,Berbicara baik-baik adalah sikap yang konstruktif,Integritas,medium`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${type}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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

      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle>Download Template CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Download template sesuai jenis soal yang akan diupload:
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => downloadTemplate('twk_tiu')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Template TWK/TIU
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadTemplate('tkp')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Template TKP
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Penting:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Untuk gambar soal: upload gambar dulu ke Storage, lalu paste URL di kolom <code>image_url</code></li>
                <li>Jika tidak ada gambar, kosongkan kolom <code>image_url</code></li>
                <li>TWK/TIU: <code>correct_answer</code> harus A, B, C, D, atau E</li>
                <li>TKP: Semua <code>tkp_score_*</code> harus diisi dengan angka 1-5</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload File CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <div className="space-y-2">
              <label htmlFor="csv-file" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 font-medium">
                  Klik untuk browse
                </span>
                <span className="text-slate-600"> atau drag & drop file CSV</span>
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-slate-500">Format: .csv, Maksimal 10MB</p>
            </div>

            {file && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded inline-block">
                <p className="text-sm text-blue-900 font-medium">{file.name}</p>
                <p className="text-xs text-blue-700">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {parseResult && (
            <Alert
              variant={parseResult.invalidRows.length === 0 ? 'default' : 'destructive'}
            >
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    {parseResult.invalidRows.length === 0
                      ? '✅ Semua soal valid!'
                      : `❌ ${parseResult.invalidRows.length} soal tidak valid`}
                  </p>
                  <p className="text-sm">
                    Valid: {parseResult.validRows.length} soal | Invalid:{' '}
                    {parseResult.invalidRows.length} soal
                  </p>
                  {parseResult.invalidRows.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Error:</p>
                      <ul className="text-xs space-y-1">
                        {parseResult.invalidRows.slice(0, 5).map((row: any) => (
                          <li key={row.row}>
                            Baris {row.row}: {row.errors.join(', ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isUploading}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Parse
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}