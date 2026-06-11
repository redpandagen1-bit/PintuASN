-- ============================================================
-- PURGE AMAN: hapus permanen soal arsip yang TIDAK terpakai
-- ------------------------------------------------------------
-- Jalankan manual sesekali (Supabase SQL editor) kalau bank soal
-- membengkak. TIDAK wajib — soft-delete tidak mengganggu performa.
--
-- Hanya menghapus soal yang:
--   1) sudah diarsip (is_deleted = true), DAN
--   2) tidak pernah dijawab peserta (tidak ada di attempt_answers).
--
-- choices & package_questions ikut terhapus via FK ON DELETE CASCADE.
-- Riwayat attempt tetap utuh karena soal yang punya jawaban TIDAK ikut
-- terhapus (kondisi NOT EXISTS attempt_answers).
-- ============================================================

-- 1) PRATINJAU dulu — berapa soal yang akan terhapus:
SELECT count(*) AS akan_dihapus
FROM questions q
WHERE q.is_deleted = true
  AND NOT EXISTS (
    SELECT 1 FROM attempt_answers a WHERE a.question_id = q.id
  );

-- 2) EKSEKUSI (jalankan setelah yakin dengan angka pratinjau):
-- DELETE FROM questions q
-- WHERE q.is_deleted = true
--   AND NOT EXISTS (
--     SELECT 1 FROM attempt_answers a WHERE a.question_id = q.id
--   );
