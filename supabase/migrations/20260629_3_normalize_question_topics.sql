-- ============================================================
-- Normalisasi kolom questions.topic ke taksonomi baku drilling.
-- One-time data migration (sudah diterapkan ke produksi 2026-06-29).
-- Disimpan di git untuk riwayat. Aman dijalankan ulang: pola variannya
-- tidak cocok lagi dengan nilai yang sudah baku, jadi tidak merusak.
-- Soal di luar kisi-kisi (HAM, Sistem Ketatanegaraan, dll) sengaja dibiarkan.
-- ============================================================

-- Backup nilai topic lama (sekali; dilewati jika tabel sudah ada).
CREATE TABLE IF NOT EXISTS questions_topic_backup_20260629 AS
SELECT id, category, topic AS old_topic, is_deleted, is_published, now() AS backed_up_at
FROM questions;

-- TWK: berbasis induk topik (anti-kontaminasi, mis. "Mahkamah Konstitusi").
UPDATE questions SET topic = CASE
  WHEN btrim(split_part(btrim(topic),' - ',1)) ILIKE 'nasionalisme' THEN 'Nasionalisme'
  WHEN btrim(split_part(btrim(topic),' - ',1)) ILIKE 'integritas' THEN 'Integritas'
  WHEN btrim(split_part(btrim(topic),' - ',1)) ILIKE 'bela negara' THEN 'Bela Negara'
  WHEN btrim(split_part(btrim(topic),' - ',1)) ILIKE 'bahasa indonesia' THEN 'Bahasa Indonesia'
  WHEN btrim(split_part(btrim(topic),' - ',1)) ILIKE 'pilar negara'
    OR btrim(split_part(btrim(topic),' - ',1)) ILIKE 'pancasila'
    OR btrim(split_part(btrim(topic),' - ',1)) ILIKE 'uud%' THEN 'Pilar Negara'
  ELSE topic
END
WHERE category='TWK' AND NOT is_deleted AND is_published;

-- TIU: berbasis kata kunci berurutan.
UPDATE questions SET topic = CASE
  WHEN topic ILIKE '%analogi%' THEN 'Verbal Analogi'
  WHEN topic ILIKE '%silogisme%' THEN 'Verbal Silogisme'
  WHEN topic ILIKE '%penalaran analitis%' THEN 'Verbal Penalaran Analitis'
  WHEN topic ILIKE '%aritmatika%' THEN 'Aritmatika Sosial'
  WHEN topic ILIKE '%deret%' THEN 'Deret Angka'
  WHEN topic ILIKE '%perbandingan%' THEN 'Perbandingan Kuantitatif'
  WHEN topic ILIKE '%jarak%' OR topic ILIKE '%kecepatan%' THEN 'Jarak Waktu Kecepatan'
  WHEN topic ILIKE '%berhitung%' OR topic ILIKE '%matematika dasar%' OR topic ILIKE '%operasi%'
    OR topic ILIKE '%aljabar%' OR topic ILIKE '%bilangan%' OR topic ILIKE '%pecahan%'
    OR topic ILIKE '%akar%' OR topic ILIKE '%pangkat%' THEN 'Matematika Dasar Berhitung'
  ELSE topic
END
WHERE category='TIU' AND NOT is_deleted AND is_published;

-- TKP: berbasis kata kunci (teknologi, bukan '%tik%' agar 'etika' tidak ketangkap).
UPDATE questions SET topic = CASE
  WHEN topic ILIKE '%pelayanan%' THEN 'Pelayanan Publik'
  WHEN topic ILIKE '%jejaring%' THEN 'Jejaring Kerja'
  WHEN topic ILIKE '%sosial budaya%' THEN 'Sosial Budaya'
  WHEN topic ILIKE '%teknologi%' THEN 'Teknologi Informasi dan Komunikasi'
  WHEN topic ILIKE '%radikal%' THEN 'Anti Radikalisme'
  WHEN topic ILIKE '%profesional%' THEN 'Profesionalisme'
  ELSE topic
END
WHERE category='TKP' AND NOT is_deleted AND is_published;
