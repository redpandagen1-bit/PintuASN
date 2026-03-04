import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/check-admin';
import { createClient } from '@/lib/supabase/server';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAdmin();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const packageId = formData.get('packageId') as string;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Parse CSV
    const text = await file.text();
    const parseResult = await new Promise<any>((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value) => (typeof value === 'string' ? value.trim() : value),
        complete: (results) => resolve(results),
        error: (error) => reject(error),
      });
    });

    const validRows: any[] = [];
    const invalidRows: any[] = [];

    // Validate each row
    parseResult.data.forEach((row: any, index: number) => {
      const errors: string[] = [];

      // Check required fields
      if (!row.category || !['TWK', 'TIU', 'TKP'].includes(row.category)) {
        errors.push('Category harus TWK, TIU, atau TKP');
      }
      if (!row.question_text) errors.push('question_text wajib diisi');
      if (!row.option_a) errors.push('option_a wajib diisi');
      if (!row.option_b) errors.push('option_b wajib diisi');
      if (!row.option_c) errors.push('option_c wajib diisi');
      if (!row.option_d) errors.push('option_d wajib diisi');
      if (!row.option_e) errors.push('option_e wajib diisi');

      // Validate TWK/TIU
      if (row.category !== 'TKP') {
        if (!row.correct_answer || !['A', 'B', 'C', 'D', 'E'].includes(row.correct_answer)) {
          errors.push('correct_answer harus A, B, C, D, atau E');
        }
      }

      // Validate TKP
      if (row.category === 'TKP') {
        if (!row.tkp_score_a || row.tkp_score_a < 1 || row.tkp_score_a > 5) {
          errors.push('tkp_score_a harus 1-5');
        }
        if (!row.tkp_score_b || row.tkp_score_b < 1 || row.tkp_score_b > 5) {
          errors.push('tkp_score_b harus 1-5');
        }
        if (!row.tkp_score_c || row.tkp_score_c < 1 || row.tkp_score_c > 5) {
          errors.push('tkp_score_c harus 1-5');
        }
        if (!row.tkp_score_d || row.tkp_score_d < 1 || row.tkp_score_d > 5) {
          errors.push('tkp_score_d harus 1-5');
        }
        if (!row.tkp_score_e || row.tkp_score_e < 1 || row.tkp_score_e > 5) {
          errors.push('tkp_score_e harus 1-5');
        }
      }

      if (errors.length > 0) {
        invalidRows.push({ row: index + 2, data: row, errors });
      } else {
        validRows.push(row);
      }
    });

    // If all valid, insert to database
    if (invalidRows.length === 0 && validRows.length > 0) {
      const supabase = await createClient();

      // Get current max position
      const { data: maxPos } = await supabase
        .from('package_questions')
        .select('position')
        .eq('package_id', packageId)
        .order('position', { ascending: false })
        .limit(1);

      let currentPosition = maxPos && maxPos.length > 0 ? maxPos[0].position : 0;

      for (const row of validRows) {
        // Insert question
        const { data: question, error: qError } = await supabase
          .from('questions')
          .insert({
            category: row.category,
            content: row.question_text,
            image_url: row.image_url || null,
            explanation: row.explanation || null,
            topic: row.topic || null,
            difficulty: row.difficulty || 'medium',
            is_published: true,
            status: 'published',
            created_by: userId,
          })
          .select()
          .single();

        if (qError) throw qError;

        // Insert choices
        const isTKP = row.category === 'TKP';
        const choices = [
          {
            question_id: question.id,
            label: 'A',
            content: row.option_a,
            is_answer: !isTKP && row.correct_answer === 'A',
            score: isTKP ? row.tkp_score_a : null,
          },
          {
            question_id: question.id,
            label: 'B',
            content: row.option_b,
            is_answer: !isTKP && row.correct_answer === 'B',
            score: isTKP ? row.tkp_score_b : null,
          },
          {
            question_id: question.id,
            label: 'C',
            content: row.option_c,
            is_answer: !isTKP && row.correct_answer === 'C',
            score: isTKP ? row.tkp_score_c : null,
          },
          {
            question_id: question.id,
            label: 'D',
            content: row.option_d,
            is_answer: !isTKP && row.correct_answer === 'D',
            score: isTKP ? row.tkp_score_d : null,
          },
          {
            question_id: question.id,
            label: 'E',
            content: row.option_e,
            is_answer: !isTKP && row.correct_answer === 'E',
            score: isTKP ? row.tkp_score_e : null,
          },
        ];

        const { error: cError } = await supabase.from('choices').insert(choices);
        if (cError) throw cError;

        // Add to package
        currentPosition++;
        const { error: pqError } = await supabase.from('package_questions').insert({
          package_id: packageId,
          question_id: question.id,
          position: currentPosition,
        });

        if (pqError) throw pqError;
      }
    }

    return NextResponse.json({
      validRows: validRows.length,
      invalidRows,
      totalRows: parseResult.data.length,
    });
  } catch (error: any) {
    console.error('CSV upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process CSV' },
      { status: 500 }
    );
  }
}