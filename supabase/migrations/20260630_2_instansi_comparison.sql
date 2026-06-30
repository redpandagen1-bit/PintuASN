-- ============================================================
-- Perbandingan nilai user terhadap peserta di instansi mana pun.
-- Dipakai dropdown "bandingkan per instansi" di halaman Peluang Formasi.
-- Diterapkan ke produksi 2026-06-30.
-- ============================================================

CREATE OR REPLACE FUNCTION instansi_comparison(p_user_id text, p_instansi text)
RETURNS TABLE(total bigint, better bigint)
LANGUAGE sql STABLE AS $$
  WITH best AS (
    SELECT DISTINCT ON (a.user_id) a.user_id, a.final_score
    FROM attempts a
    WHERE a.kind='tryout' AND a.status='completed' AND a.final_score IS NOT NULL
    ORDER BY a.user_id, a.final_score DESC
  ),
  me AS (SELECT final_score FROM best WHERE user_id = p_user_id)
  SELECT
    (SELECT count(*) FROM best b JOIN profiles p ON p.user_id=b.user_id
       WHERE p.target_institution = p_instansi AND b.user_id <> p_user_id),
    (SELECT count(*) FROM best b JOIN profiles p ON p.user_id=b.user_id
       WHERE p.target_institution = p_instansi AND b.user_id <> p_user_id
         AND b.final_score < (SELECT final_score FROM me))
$$;
