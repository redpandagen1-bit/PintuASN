export interface Attempt {
  id: string;
  status: string;
  score_twk: number;
  score_tiu: number;
  score_tkp: number;
  final_score: number;
  is_passed: boolean;
  completed_at: string;
}
