-- Audit keamanan 2026-07-04
-- Dua fungsi SECURITY DEFINER dapat dipanggil peran anon/authenticated via
-- PostgREST:
--   * get_correct_choice_id(uuid)  -> membocorkan kunci jawaban (tidak dipakai app)
--   * calculate_attempt_score(uuid) -> hanya dipakai server (createAdminClient / service_role)
-- Cabut EXECUTE dari publik; sisakan hanya service_role. Reversible.

REVOKE EXECUTE ON FUNCTION public.get_correct_choice_id(uuid) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_correct_choice_id(uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.calculate_attempt_score(uuid) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.calculate_attempt_score(uuid) TO service_role;
