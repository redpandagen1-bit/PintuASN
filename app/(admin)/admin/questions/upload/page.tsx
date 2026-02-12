'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CSVDropzone } from '@/components/admin/csv-dropzone';
import { QuestionPreviewTable } from '@/components/admin/question-preview-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, Loader2 } from 'lucide-react';
import { parseQuestionCSV, findDuplicateQuestions } from '@/lib/utils/csv-parser';
import { CSVQuestionRow } from '@/lib/validations/question-schema';

export default function QuestionsUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<{
    validRows: CSVQuestionRow[];
    invalidRows: Array<{ row: number; data: any; errors: string[] }>;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setParseResult(null);
    setUploadError(null);

    try {
      const result = await parseQuestionCSV(selectedFile);
      
      // Check for duplicates
      const duplicateIndices = findDuplicateQuestions(result.validRows);
      if (duplicateIndices.length > 0) {
        setUploadError(
          `Ditemukan ${duplicateIndices.length} soal duplikat. Harap hapus duplikat sebelum upload.`
        );
      }

      setParseResult(result);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Gagal parsing CSV'
      );
    }
  };

  const handleUpload = async () => {
    if (!parseResult || parseResult.validRows.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await fetch('/api/admin/questions/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: parseResult.validRows }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload gagal');
      }

      // Success - redirect to questions list
      router.push('/admin/questions');
      router.refresh();
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Terjadi kesalahan saat upload'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Upload Soal</h1>
        <p className="text-slate-600 mt-2">Upload soal dalam format CSV</p>
      </div>

      {/* Download Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Template CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">
            Download template sesuai jenis soal yang akan diupload:
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="/templates/template_twk_tiu.csv" download>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Template TWK/TIU
              </Button>
            </a>
            <a href="/templates/template_tkp.csv" download>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Template TKP
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload File CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <CSVDropzone onFileSelect={handleFileSelect} />
          
          {file && (
            <Alert className="mt-4">
              <AlertDescription>
                File terpilih: <span className="font-medium">{file.name}</span>
              </AlertDescription>
            </Alert>
          )}

          {uploadError && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Preview Results */}
      {parseResult && (
        <>
          <QuestionPreviewTable
            validRows={parseResult.validRows}
            invalidRows={parseResult.invalidRows}
          />

          {parseResult.validRows.length > 0 && parseResult.invalidRows.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      Siap upload {parseResult.validRows.length} soal
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      Pastikan semua data sudah benar sebelum upload
                    </p>
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    size="lg"
                    className="gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload Soal
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}