-- ============================================================
-- Pembersihan sesi drilling abandoned (cegah paket throwaway menumpuk).
-- Dipanggil saat user memulai sesi drilling baru.
-- Diterapkan ke produksi 2026-06-29.
-- ============================================================

CREATE OR REPLACE FUNCTION cleanup_abandoned_drilling(p_user_id text)
RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  v_pkg uuid[];
BEGIN
  SELECT array_agg(a.package_id) INTO v_pkg
  FROM attempts a
  JOIN packages p ON p.id = a.package_id
  WHERE a.user_id = p_user_id
    AND a.kind = 'drilling' AND p.kind = 'drilling'
    AND a.status = 'abandoned';

  IF v_pkg IS NULL THEN RETURN; END IF;

  DELETE FROM attempt_answers WHERE attempt_id IN (
    SELECT id FROM attempts WHERE package_id = ANY(v_pkg)
  );
  DELETE FROM attempts          WHERE package_id = ANY(v_pkg) AND kind = 'drilling';
  DELETE FROM package_questions WHERE package_id = ANY(v_pkg);
  DELETE FROM packages          WHERE id = ANY(v_pkg) AND kind = 'drilling';
END;
$$;
