-- ─── PWA install tracking (distinct standalone, login + anonim) ───
-- Mencatat perangkat yang membuka aplikasi dalam mode terpasang (standalone).
-- Satu baris per perangkat (device_id), di-upsert. RLS aktif tanpa policy
-- sehingga hanya service role (admin client) yang boleh akses.

CREATE TABLE IF NOT EXISTS pwa_installs (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id       text        NOT NULL,
  user_id         text,
  platform        text        NOT NULL DEFAULT 'unknown',
  first_opened_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pwa_installs_device
  ON pwa_installs (device_id);

CREATE INDEX IF NOT EXISTS idx_pwa_installs_user
  ON pwa_installs (user_id);

CREATE INDEX IF NOT EXISTS idx_pwa_installs_platform
  ON pwa_installs (platform);

ALTER TABLE pwa_installs ENABLE ROW LEVEL SECURITY;
