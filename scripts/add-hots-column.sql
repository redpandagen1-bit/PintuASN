-- ============================================================
-- Migration: tambah kolom is_hots ke tabel packages
-- ------------------------------------------------------------
-- Menandai paket tryout sebagai HOTS (Higher Order Thinking
-- Skills). Saat true, badge HOTS beraksen api tampil di pojok
-- kanan atas card paket (daftar tryout & dashboard).
--
-- Jalankan di Supabase SQL Editor (idempotent, aman diulang).
-- ============================================================

ALTER TABLE packages
  ADD COLUMN IF NOT EXISTS is_hots boolean NOT NULL DEFAULT false;
