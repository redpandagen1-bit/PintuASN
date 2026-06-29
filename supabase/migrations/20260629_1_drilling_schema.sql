-- ============================================================
-- Fitur Drilling: skema + fungsi
-- Diterapkan ke produksi 2026-06-29 (didokumentasikan ke git di sini).
-- Idempotent: aman dijalankan ulang.
-- ============================================================

-- Penanda jenis paket & attempt: 'tryout' (default) vs 'drilling'.
ALTER TABLE packages ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'tryout';
ALTER TABLE attempts ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'tryout';

CREATE INDEX IF NOT EXISTS idx_attempts_user_kind_status ON attempts (user_id, kind, status);
CREATE INDEX IF NOT EXISTS idx_questions_topic_pub ON questions (topic) WHERE is_published AND NOT is_deleted;

-- Statistik per topik untuk konfigurator drilling:
-- total soal tersedia & berapa yang sudah pernah dikerjakan user.
CREATE OR REPLACE FUNCTION drilling_topic_stats(p_user_id text, p_topics text[])
RETURNS TABLE(category text, topic text, total bigint, done bigint)
LANGUAGE sql STABLE AS $$
  WITH answered AS (
    SELECT DISTINCT aa.question_id
    FROM attempt_answers aa
    JOIN attempts a ON a.id = aa.attempt_id
    WHERE a.user_id = p_user_id
  )
  SELECT q.category, btrim(q.topic) AS topic,
         count(*) AS total,
         count(*) FILTER (WHERE q.id IN (SELECT question_id FROM answered)) AS done
  FROM questions q
  WHERE q.is_published AND NOT q.is_deleted
    AND btrim(q.topic) = ANY(p_topics)
  GROUP BY q.category, btrim(q.topic);
$$;

-- Pilih soal untuk sesi drilling lintas kategori. p_pairs berisi 'CATEGORY|Topic'.
-- Prioritaskan soal yang BELUM dikerjakan, acak, batasi p_count.
CREATE OR REPLACE FUNCTION drilling_pick_questions_multi(p_user_id text, p_pairs text[], p_count int)
RETURNS TABLE(id uuid)
LANGUAGE sql STABLE AS $$
  WITH answered AS (
    SELECT DISTINCT aa.question_id
    FROM attempt_answers aa
    JOIN attempts a ON a.id = aa.attempt_id
    WHERE a.user_id = p_user_id
  )
  SELECT s.id FROM (
    SELECT q.id, (q.id IN (SELECT question_id FROM answered)) AS is_done
    FROM questions q
    WHERE q.is_published AND NOT q.is_deleted
      AND (q.category || '|' || btrim(q.topic)) = ANY(p_pairs)
  ) s
  ORDER BY s.is_done ASC, random()
  LIMIT p_count;
$$;

-- Versi lama (tidak dipakai aplikasi) — dibuang agar tidak ambigu.
DROP FUNCTION IF EXISTS drilling_pick_questions(text, text[], int);
DROP FUNCTION IF EXISTS drilling_pick_questions(text, text, text[], int);

-- Penguasaan per topik (statistik): dari semua attempt selesai (tryout + drilling).
-- TWK/TIU: correct/answered. TKP: score_sum/(answered*5).
CREATE OR REPLACE FUNCTION topic_mastery(p_user_id text)
RETURNS TABLE(category text, topic text, answered bigint, correct bigint, score_sum bigint)
LANGUAGE sql STABLE AS $$
  SELECT q.category, btrim(q.topic) AS topic,
    count(*) AS answered,
    count(*) FILTER (WHERE q.category <> 'TKP' AND ch.is_answer) AS correct,
    COALESCE(sum(ch.score) FILTER (WHERE q.category = 'TKP'), 0) AS score_sum
  FROM attempt_answers aa
  JOIN attempts a  ON a.id = aa.attempt_id
  JOIN questions q ON q.id = aa.question_id
  LEFT JOIN choices ch ON ch.id = aa.choice_id
  WHERE a.user_id = p_user_id
    AND a.status = 'completed'
  GROUP BY q.category, btrim(q.topic);
$$;
