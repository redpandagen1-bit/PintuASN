-- ============================================================
-- Soal figural (TIU, bergambar/SVG) masuk taksonomi drilling sebagai
-- topik 'Figural'. Sebelumnya topic-nya NULL (route upload figural tidak
-- mengisi topic) sehingga tidak terjaring drilling.
-- Diterapkan ke produksi 2026-06-29. Idempotent.
-- ============================================================

UPDATE questions SET topic = 'Figural'
WHERE category = 'TIU' AND NOT is_deleted
  AND image_url IS NOT NULL AND image_url <> ''
  AND COALESCE(btrim(topic), '') NOT IN (
    'Verbal Analogi','Verbal Silogisme','Verbal Penalaran Analitis','Aritmatika Sosial',
    'Matematika Dasar Berhitung','Deret Angka','Perbandingan Kuantitatif','Jarak Waktu Kecepatan','Figural'
  );
