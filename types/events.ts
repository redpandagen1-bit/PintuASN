// ============================================================
// types/events.ts
// ============================================================

export type EventType = 'promo' | 'event' | 'flash_sale' | 'diskon';

export interface Event {
  id: string;
  title: string;
  type: EventType;
  banner_url: string;
  description: string | null;
  benefit: string | null;        // e.g. "Diskon 30%" / "Gratis Akses 1 Bulan"
  referral_code: string | null;
  cta_label: string;             // e.g. "Klaim Sekarang"
  cta_link: string | null;
  start_date: string | null;     // ISO string
  end_date: string | null;       // ISO string
  quota: number | null;          // null = unlimited
  quota_used: number;
  terms: string | null;          // syarat & ketentuan (collapsible)
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export type EventDraft = Omit<Event, 'created_at' | 'updated_at' | 'quota_used'> & {
  id: string; // empty string = new
};