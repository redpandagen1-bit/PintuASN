-- Rate limits table untuk distributed rate limiting
-- Menggantikan in-memory Map yang tidak efektif di Vercel multi-instance

CREATE TABLE IF NOT EXISTS rate_limits (
  key          TEXT        PRIMARY KEY,
  count        INTEGER     NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Izinkan service role untuk read/write (RLS off untuk tabel internal ini)
ALTER TABLE rate_limits DISABLE ROW LEVEL SECURITY;

-- Auto-cleanup: hapus entri yang window-nya sudah lebih dari 1 jam
-- (dijalankan manual atau via pg_cron jika tersedia)
-- DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
