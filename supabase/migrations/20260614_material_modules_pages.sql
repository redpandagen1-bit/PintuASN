-- Materi modul multi-halaman: simpan isi sebagai array halaman (pages) di JSONB.
-- content_body lama (1 halaman) dijadikan nullable sebagai fallback/legacy.
ALTER TABLE material_modules ADD COLUMN IF NOT EXISTS pages jsonb;
ALTER TABLE material_modules ALTER COLUMN content_body DROP NOT NULL;
