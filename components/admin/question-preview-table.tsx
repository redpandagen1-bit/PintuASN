'use client';

import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';
import { CSVQuestionRow } from '@/lib/validations/question-schema';

interface QuestionPreviewTableProps {
  validRows: CSVQuestionRow[];
  invalidRows: Array<{ row: number; data: any; errors: string[] }>;
}

export function QuestionPreviewTable({ validRows, invalidRows }: QuestionPreviewTableProps) {
  const previewRows = validRows.slice(0, 10); // Show first 10

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <span className="font-semibold">{validRows.length} soal valid</span>
          </AlertDescription>
        </Alert>
        
        {invalidRows.length > 0 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <span className="font-semibold">{invalidRows.length} soal invalid</span>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Valid Rows Preview */}
      {previewRows.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b">
            <h3 className="font-semibold text-slate-800">
              Preview (10 soal pertama)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead className="w-24">Kategori</TableHead>
                  <TableHead className="min-w-[300px]">Pertanyaan</TableHead>
                  <TableHead className="w-32">Tingkat</TableHead>
                  <TableHead className="w-32">Jawaban</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <Badge variant={
                        row.category === 'TWK' ? 'default' : 
                        row.category === 'TIU' ? 'secondary' : 
                        'outline'
                      }>
                        {row.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.question_text.substring(0, 100)}
                      {row.question_text.length > 100 && '...'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {row.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {'correct_answer' in row ? (
                        <span className="font-medium">{row.correct_answer}</span>
                      ) : (
                        <span className="text-xs text-slate-500">TKP (Skor)</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {validRows.length > 10 && (
            <div className="bg-slate-50 px-4 py-2 border-t text-sm text-slate-600">
              + {validRows.length - 10} soal lainnya
            </div>
          )}
        </div>
      )}

      {/* Invalid Rows */}
      {invalidRows.length > 0 && (
        <div className="border border-red-200 rounded-lg overflow-hidden">
          <div className="bg-red-50 px-4 py-2 border-b border-red-200">
            <h3 className="font-semibold text-red-800">
              Soal dengan Error ({invalidRows.length})
            </h3>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {invalidRows.slice(0, 20).map((item, index) => (
              <div key={index} className="p-3 border-b border-red-100 last:border-0">
                <div className="flex items-start gap-2">
                  <Badge variant="destructive" className="shrink-0">
                    Baris {item.row}
                  </Badge>
                  <div className="text-sm space-y-1">
                    {item.errors.map((error, i) => (
                      <p key={i} className="text-red-700">• {error}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}