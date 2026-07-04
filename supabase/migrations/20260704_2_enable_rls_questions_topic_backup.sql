-- Audit keamanan 2026-07-04
-- Tabel backup normalisasi topik terekspos PostgREST tanpa RLS (ERROR advisor).
-- Isinya hanya metadata topik (id, category, old_topic) - tak dipakai app.
-- Enable RLS = tutup akses publik; service_role tetap bisa akses.
ALTER TABLE public.questions_topic_backup_20260629 ENABLE ROW LEVEL SECURITY;
