-- Pelacakan materi modul yang sudah dibuka user (untuk progres Roadmap).
-- Satu baris per (user, modul); di-upsert agar tidak duplikat.
CREATE TABLE IF NOT EXISTS material_module_views (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    text        NOT NULL,
  module_id  uuid        NOT NULL,
  viewed_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mmv_user_module ON material_module_views (user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_mmv_user ON material_module_views (user_id);
ALTER TABLE material_module_views ENABLE ROW LEVEL SECURITY;
