-- ============================================================
-- Peluang Formasi V1: nilai terbaik user + jumlah peserta lain (lebih rendah)
-- di instansi yang sama DAN se-nasional (tryout completed). Aplikasi memilih
-- scope (instansi bila peserta cukup, else nasional) & menghitung persentil.
-- Diterapkan ke produksi 2026-06-30.
-- ============================================================

CREATE OR REPLACE FUNCTION peluang_formasi(p_user_id text)
RETURNS TABLE(
  my_final int, my_twk int, my_tiu int, my_tkp int,
  inst text,
  inst_total bigint, inst_better bigint,
  nat_total bigint, nat_better bigint
)
LANGUAGE sql STABLE AS $$
  WITH best AS (
    SELECT DISTINCT ON (a.user_id)
      a.user_id, a.final_score, a.score_twk, a.score_tiu, a.score_tkp
    FROM attempts a
    WHERE a.kind = 'tryout' AND a.status = 'completed' AND a.final_score IS NOT NULL
    ORDER BY a.user_id, a.final_score DESC
  ),
  me AS ( SELECT * FROM best WHERE user_id = p_user_id ),
  my_inst AS ( SELECT target_institution AS inst FROM profiles WHERE user_id = p_user_id )
  SELECT
    (SELECT final_score FROM me),
    (SELECT score_twk   FROM me),
    (SELECT score_tiu   FROM me),
    (SELECT score_tkp   FROM me),
    (SELECT inst FROM my_inst),
    (SELECT count(*) FROM best b JOIN profiles p ON p.user_id = b.user_id
       WHERE (SELECT inst FROM my_inst) IS NOT NULL
         AND p.target_institution = (SELECT inst FROM my_inst)
         AND b.user_id <> p_user_id),
    (SELECT count(*) FROM best b JOIN profiles p ON p.user_id = b.user_id
       WHERE (SELECT inst FROM my_inst) IS NOT NULL
         AND p.target_institution = (SELECT inst FROM my_inst)
         AND b.user_id <> p_user_id
         AND b.final_score < (SELECT final_score FROM me)),
    (SELECT count(*) FROM best b WHERE b.user_id <> p_user_id),
    (SELECT count(*) FROM best b WHERE b.user_id <> p_user_id
        AND b.final_score < (SELECT final_score FROM me))
$$;
