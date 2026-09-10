// ============================================================
// types/referral.ts
// ============================================================

export type PackageTier = 'premium' | 'platinum';

export interface ReferralCode {
  id: string;
  name: string | null;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expired_at: string | null;
  allowed_tiers: PackageTier[] | null; // null/[] = berlaku untuk semua tier
  created_at: string;
}
