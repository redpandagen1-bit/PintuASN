import { z } from 'zod';

const baseQuestionSchema = z.object({
  category: z.enum(['TWK', 'TIU', 'TKP']),
  question_text: z.string().min(10, 'Pertanyaan minimal 10 karakter'),
  option_a: z.string().min(1, 'Option A wajib diisi'),
  option_b: z.string().min(1, 'Option B wajib diisi'),
  option_c: z.string().min(1, 'Option C wajib diisi'),
  option_d: z.string().min(1, 'Option D wajib diisi'),
  option_e: z.string().min(1, 'Option E wajib diisi'),
  explanation: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  image_url: z.string().url().optional().or(z.literal('')),
});

// TWK/TIU schema
export const twkTiuQuestionSchema = baseQuestionSchema.extend({
  correct_answer: z.enum(['A', 'B', 'C', 'D', 'E']),
  category: z.enum(['TWK', 'TIU']),
});

// TKP schema
export const tkpQuestionSchema = baseQuestionSchema.extend({
  category: z.literal('TKP'),
  tkp_score_a: z.number().int().min(1).max(5),
  tkp_score_b: z.number().int().min(1).max(5),
  tkp_score_c: z.number().int().min(1).max(5),
  tkp_score_d: z.number().int().min(1).max(5),
  tkp_score_e: z.number().int().min(1).max(5),
});

export type TWKTIUQuestion = z.infer<typeof twkTiuQuestionSchema>;
export type TKPQuestion = z.infer<typeof tkpQuestionSchema>;
export type CSVQuestionRow = TWKTIUQuestion | TKPQuestion;

export function validateQuestionRow(row: any): { 
  valid: boolean; 
  errors: string[]; 
  data?: CSVQuestionRow 
} {
  const errors: string[] = [];
  
  // Check category first
  if (!row.category || !['TWK', 'TIU', 'TKP'].includes(row.category)) {
    return { valid: false, errors: ['Category harus TWK, TIU, atau TKP'] };
  }

  try {
    if (row.category === 'TKP') {
      const result = tkpQuestionSchema.parse(row);
      return { valid: true, errors: [], data: result };
    } else {
      const result = twkTiuQuestionSchema.parse(row);
      return { valid: true, errors: [], data: result };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return { valid: false, errors: ['Validation error'] };
  }
}