import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/check-admin';
import { createAdminClient } from '@/lib/supabase/server';
import Papa from 'papaparse';

const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
const VALID_CATEGORIES = ['TWK', 'TIU', 'TKP'] as const;
const VALID_ANSWERS = ['A', 'B', 'C', 'D', 'E'] as const;

function getExpectedCategory(position: number): 'TWK' | 'TIU' | 'TKP' {
  if (position <= 30) return 'TWK';
  if (position <= 65) return 'TIU';
  return 'TKP';
}

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

    // Ambil posisi yang sudah terisi di package ini
    const supabase = await createAdminClient();
    const { data: existingPositions } = await supabase
      .from('package_questions')
      .select('position')
      .eq('package_id', packageId);

    const occupiedPositions = new Set(
      (existingPositions ?? []).map((p: any) => p.position)
    );

    const validRows: any[] = [];
    const invalidRows: any[] = [];
    const skippedRows: any[] = [];

    parseResult.data.forEach((row: any, index: number) => {
      const rowNumber = index + 2; // +2: index 0-based + 1 baris header
      const errors: string[] = [];

      // ── Validasi kolom position ──────────────────────────────────────
      const position = Number(row.position);
      if (!row.position || isNaN(position) || position < 1 || position > 110) {
        errors.push('position wajib diisi dan harus angka 1–110');
        invalidRows.push({ row: rowNumber, position: row.position, data: row, errors });
        return;
      }

      // ── Cek apakah posisi sudah terisi ──────────────────────────────
      if (occupiedPositions.has(position)) {
        skippedRows.push({ row: rowNumber, position, reason: 'Posisi sudah terisi' });
        return;
      }

      // ── Validasi category ────────────────────────────────────────────
      if (!row.category || !VALID_CATEGORIES.includes(row.category)) {
        errors.push('category harus TWK, TIU, atau TKP');
      } else {
        const expectedCategory = getExpectedCategory(position);
        if (row.category !== expectedCategory) {
          errors.push(
            `Posisi ${position} harus category ${expectedCategory}, bukan ${row.category}`
          );
        }
      }

      // ── Validasi difficulty ──────────────────────────────────────────
      if (!row.difficulty) {
        // akan di-default ke 'medium' saat insert, tidak perlu error
      } else if (!VALID_DIFFICULTIES.includes(row.difficulty)) {
        errors.push(
          `difficulty harus easy, medium, atau hard — nilai saat ini: "${String(row.difficulty).substring(0, 50)}". ` +
          `Kemungkinan ada newline/karakter tersembunyi di kolom explanation atau topic pada baris ini.`
        );
      }

      // ── Validasi konten soal ─────────────────────────────────────────
      if (!row.question_text) errors.push('question_text wajib diisi');
      if (!row.option_a) errors.push('option_a wajib diisi');
      if (!row.option_b) errors.push('option_b wajib diisi');
      if (!row.option_c) errors.push('option_c wajib diisi');
      if (!row.option_d) errors.push('option_d wajib diisi');
      if (!row.option_e) errors.push('option_e wajib diisi');

      // ── Validasi TWK/TIU ─────────────────────────────────────────────
      if (row.category !== 'TKP') {
        if (
          !row.correct_answer ||
          !VALID_ANSWERS.includes(row.correct_answer)
        ) {
          errors.push('correct_answer harus A, B, C, D, atau E');
        }
      }

      // ── Validasi TKP ─────────────────────────────────────────────────
      if (row.category === 'TKP') {
        const scores: number[] = [];

        ['a', 'b', 'c', 'd', 'e'].forEach((letter) => {
          const raw = row[`tkp_score_${letter}`];
          const score = Number(raw);

          if (raw === null || raw === undefined || raw === '' || isNaN(score)) {
            errors.push(`tkp_score_${letter} wajib diisi dengan angka`);
          } else if (score < 1 || score > 5) {
            errors.push(`tkp_score_${letter} harus 1–5, saat ini: ${score}`);
          } else {
            scores.push(score);
          }
        });

        // Semua skor TKP harus unik
        if (errors.length === 0 && new Set(scores).size !== 5) {
          errors.push(
            `Semua tkp_score harus berbeda (tidak boleh sama) — saat ini: [${scores.join(', ')}]`
          );
        }
      }

      if (errors.length > 0) {
        invalidRows.push({ row: rowNumber, position: row.position, data: row, errors });
      } else {
        validRows.push({ ...row, position });
      }
    });

    // ── Insert ke database jika semua valid ──────────────────────────────
    if (invalidRows.length === 0 && validRows.length > 0) {
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
            difficulty: VALID_DIFFICULTIES.includes(row.difficulty) ? row.difficulty : 'medium',
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
          { label: 'A', content: row.option_a, score: isTKP ? row.tkp_score_a : null, is_answer: !isTKP && row.correct_answer === 'A' },
          { label: 'B', content: row.option_b, score: isTKP ? row.tkp_score_b : null, is_answer: !isTKP && row.correct_answer === 'B' },
          { label: 'C', content: row.option_c, score: isTKP ? row.tkp_score_c : null, is_answer: !isTKP && row.correct_answer === 'C' },
          { label: 'D', content: row.option_d, score: isTKP ? row.tkp_score_d : null, is_answer: !isTKP && row.correct_answer === 'D' },
          { label: 'E', content: row.option_e, score: isTKP ? row.tkp_score_e : null, is_answer: !isTKP && row.correct_answer === 'E' },
        ].map((c) => ({ ...c, question_id: question.id }));

        const { error: cError } = await supabase.from('choices').insert(choices);
        if (cError) throw cError;

        // Insert ke package_questions di posisi yang diminta
        const { error: pqError } = await supabase
          .from('package_questions')
          .insert({ package_id: packageId, question_id: question.id, position: row.position });

        if (pqError) throw pqError;
      }
    }

    return NextResponse.json({
      validRows: validRows.length,
      invalidRows,
      skippedRows,
      totalRows: parseResult.data.length,
      inserted: invalidRows.length === 0 ? validRows.length : 0,
    });
  } catch (error: any) {
    console.error('CSV upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process CSV' },
      { status: 500 }
    );
  }
}