-- Peringkat nasional: ganti MATERIALIZED VIEW (basi, tak pernah di-refresh)
-- menjadi VIEW biasa agar selalu fresh untuk semua user.
DROP MATERIALIZED VIEW IF EXISTS user_average_scores;

CREATE VIEW user_average_scores AS
SELECT
  user_id,
  count(id)                  AS total_attempts,
  round(avg(final_score), 2) AS average_score,
  max(final_score)           AS best_score,
  min(final_score)           AS lowest_score,
  max(completed_at)          AS last_attempt_date
FROM attempts
WHERE status = 'completed' AND final_score IS NOT NULL
GROUP BY user_id;

-- Index pendukung agregasi (ringan; berguna saat data bertumbuh)
CREATE INDEX IF NOT EXISTS idx_attempts_completed_score
  ON attempts (user_id, final_score)
  WHERE status = 'completed' AND final_score IS NOT NULL;

-- Distribusi skor peserta: rata-rata skor per user dikelompokkan ke
-- bucket 50 poin (0..550). Dipakai grafik "Distribusi Skor Peserta".
CREATE OR REPLACE FUNCTION get_score_distribution()
RETURNS TABLE(bucket integer, peserta bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH avgs AS (
    SELECT user_id, avg(final_score) AS avg_score
    FROM attempts
    WHERE status = 'completed' AND final_score IS NOT NULL
    GROUP BY user_id
  ),
  buckets AS (
    SELECT generate_series(0, 550, 50) AS bucket
  )
  SELECT b.bucket, count(a.user_id) AS peserta
  FROM buckets b
  LEFT JOIN avgs a ON (floor(a.avg_score / 50) * 50) = b.bucket
  GROUP BY b.bucket
  ORDER BY b.bucket;
$$;
