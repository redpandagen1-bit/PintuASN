// ============================================================
// types/roadmap.ts
// ============================================================

export type PhaseStatus = 'completed' | 'active' | 'locked';

export interface RoadmapPhase {
  id: number;
  title: string;
  description: string;
  icon: string;
  status: PhaseStatus;
  detail: string;
}

export interface CategoryScore {
  category: 'TWK' | 'TIU' | 'TKP';
  avg: number;
  passingGrade: number;
  label: string;
  isPassed: boolean;
  gap: number; // selisih dari passing grade (negatif = kurang)
}

export interface Milestone {
  id: string;
  label: string;
  achieved: boolean;
  description: string;
}

export interface RoadmapPageData {
  avgTwk: number;
  avgTiu: number;
  avgTkp: number;
  totalCompleted: number;
  bestFinalScore: number;
  lastAttemptDate: string | null;
}