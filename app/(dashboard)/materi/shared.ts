// ============================================================
// app/(dashboard)/materi/shared.ts
// Tipe & util bersama untuk materi modul (dipakai desktop & mobile).
// Status "sudah dibaca" disimpan di localStorage (per perangkat).
// ============================================================

import type { QuizItem } from '@/components/materi/module-quiz';

export interface ModulePage {
  content: string;            // isi materi (Markdown + math + SVG + tabel)
  info?:   string | null;     // "Info Penting" — tampil sebagai dropdown di bawah materi
  quiz?:   QuizItem[] | null;  // Kuis halaman ini (muncul setelah klik Selanjutnya)
}

export interface MaterialModule {
  id:           string;
  category:     'TWK' | 'TIU' | 'TKP' | 'INFORMASI';
  topic:        string;
  title:        string;
  content_body: string | null;        // legacy (1 halaman tanpa pages)
  pages:        ModulePage[] | null;   // format baru multi-halaman
  quiz:         QuizItem[] | null;     // legacy
  tier:         'free' | 'premium' | 'platinum';
  read_minutes: number | null;
  topic_order:  number;
  sub_order:    number;
  is_new:       boolean;
}

// Normalisasi modul → selalu array halaman (fallback dari content_body legacy).
export function getPages(m: MaterialModule): ModulePage[] {
  if (Array.isArray(m.pages) && m.pages.length > 0) return m.pages;
  if (m.content_body) return [{ content: m.content_body, info: null, quiz: m.quiz }];
  return [{ content: '', info: null, quiz: null }];
}

const KEY = 'materi_read_v1';

export function readState(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function markRead(id: string) {
  if (typeof window === 'undefined') return;
  const state = readState();
  state[id] = true;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}
