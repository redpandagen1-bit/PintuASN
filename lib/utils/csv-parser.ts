import Papa from 'papaparse';
import { validateQuestionRow, CSVQuestionRow } from '@/lib/validations/question-schema';

export interface ParsedCSVResult {
  validRows: CSVQuestionRow[];
  invalidRows: Array<{ row: number; data: any; errors: string[] }>;
  totalRows: number;
}

export async function parseQuestionCSV(file: File): Promise<ParsedCSVResult> {
  return new Promise((resolve, reject) => {
    const validRows: CSVQuestionRow[] = [];
    const invalidRows: Array<{ row: number; data: any; errors: string[] }> = [];
    
    Papa.parse(file, {
      header: true,
      dynamicTyping: true, // Auto convert numbers
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => {
        if (typeof value === 'string') {
          return value.trim();
        }
        return value;
      },
      complete: (results) => {
        results.data.forEach((row: any, index: number) => {
          const validation = validateQuestionRow(row);
          
          if (validation.valid && validation.data) {
            validRows.push(validation.data);
          } else {
            invalidRows.push({
              row: index + 2, // +2 karena index 0 + 1 row header
              data: row,
              errors: validation.errors,
            });
          }
        });

        resolve({
          validRows,
          invalidRows,
          totalRows: results.data.length,
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
}

// Helper untuk check duplicate berdasarkan question_text
export function findDuplicateQuestions(questions: CSVQuestionRow[]): number[] {
  const seen = new Map<string, number>();
  const duplicates: number[] = [];

  questions.forEach((q, index) => {
    const text = q.question_text.toLowerCase().trim();
    if (seen.has(text)) {
      duplicates.push(index);
    } else {
      seen.set(text, index);
    }
  });

  return duplicates;
}