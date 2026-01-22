import { LucideIcon } from 'lucide-react';

export interface BannerSlide {
  id: number;
  title: string;
  subtitle: string;
  imagePath: string;
  buttonText: string;
  buttonLink: string;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
  ring: string;
}

export interface TryoutCardData {
  id: string;
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration_minutes: number;
  total_questions?: number;
  is_active: boolean;
}

export interface TryoutCardProps {
  packageData: TryoutCardData;
  hasActiveAttempt: boolean;
  userScore?: number | null;
  attemptStatus?: 'available' | 'finished' | 'in_progress';
}

export interface MenuItem {
  icon: string;
  label: string;
  path: string;
}
