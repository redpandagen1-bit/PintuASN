-- ============================================================
-- Kecualikan attempt drilling dari statistik/peringkat nasional.
-- Bergantung pada kolom attempts.kind (lihat 20260629_1_drilling_schema.sql).
-- Diterapkan ke produksi 2026-06-29.
-- ============================================================

CREATE OR REPLACE VIEW user_average_scores AS
  SELECT user_id,
    count(id) AS total_attempts,
    round(avg(final_score), 2) AS average_score,
    max(final_score) AS best_score,
    min(final_score) AS lowest_score,
    max(completed_at) AS last_attempt_date
  FROM attempts
  WHERE status = 'completed'::text AND final_score IS NOT NULL AND kind = 'tryout'
  GROUP BY user_id;

CREATE OR REPLACE FUNCTION public.get_score_distribution()
RETURNS TABLE(bucket integer, peserta bigint)
LANGUAGE sql STABLE SET search_path TO 'public'
AS $function$
  WITH avgs AS (
    SELECT user_id, avg(final_score) AS avg_score
    FROM attempts
    WHERE status = 'completed' AND final_score IS NOT NULL AND kind = 'tryout'
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
$function$;
