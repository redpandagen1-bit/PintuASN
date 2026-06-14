-- ─── Material Modules (materi bacaan "native" — TWK/TIU/TKP/INFORMASI) ───
-- Materi non-video: konten ditulis dalam Markdown (+ LaTeX math, SVG inline,
-- tabel) di kolom content_body, plus mini-quiz opsional (JSONB).
-- Hierarki: category → topic → sub-topik (1 baris = 1 sub-topik).
-- RLS aktif tanpa policy → hanya service role (admin/cache client) yang akses;
-- pembacaan publik lewat createCacheClient (service role) seperti tabel materials.

CREATE TABLE IF NOT EXISTS material_modules (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  category      text        NOT NULL CHECK (category = ANY (ARRAY['TWK','TIU','TKP','INFORMASI'])),
  topic         text        NOT NULL,
  title         text        NOT NULL,
  content_body  text        NOT NULL,
  quiz          jsonb,
  tier          text        NOT NULL DEFAULT 'free' CHECK (tier = ANY (ARRAY['free','premium','platinum'])),
  read_minutes  integer,
  topic_order   integer     NOT NULL DEFAULT 0,
  sub_order     integer     NOT NULL DEFAULT 0,
  is_active     boolean     NOT NULL DEFAULT true,
  is_new        boolean     NOT NULL DEFAULT false,
  is_deleted    boolean     NOT NULL DEFAULT false,
  created_by    text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_material_modules_cat_topic
  ON material_modules (category, topic_order, topic, sub_order);

CREATE INDEX IF NOT EXISTS idx_material_modules_active
  ON material_modules (is_active, is_deleted);

ALTER TABLE material_modules ENABLE ROW LEVEL SECURITY;
