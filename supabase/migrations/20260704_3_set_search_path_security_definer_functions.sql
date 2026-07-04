-- Audit keamanan 2026-07-04
-- Hardening: kunci search_path pada fungsi SECURITY DEFINER (cegah pembajakan
-- resolusi objek). Tidak mengubah logika fungsi.
ALTER FUNCTION public.cleanup_abandoned_drilling(p_user_id text) SET search_path = public, extensions, pg_temp;
ALTER FUNCTION public.drilling_pick_questions(p_user_id text, p_category text, p_topics text[], p_count integer) SET search_path = public, extensions, pg_temp;
ALTER FUNCTION public.drilling_pick_questions_multi(p_user_id text, p_pairs text[], p_count integer) SET search_path = public, extensions, pg_temp;
ALTER FUNCTION public.drilling_topic_stats(p_user_id text, p_topics text[]) SET search_path = public, extensions, pg_temp;
ALTER FUNCTION public.instansi_comparison(p_user_id text, p_instansi text) SET search_path = public, extensions, pg_temp;
ALTER FUNCTION public.peluang_formasi(p_user_id text) SET search_path = public, extensions, pg_temp;
ALTER FUNCTION public.protect_profile_privileged_columns() SET search_path = public, extensions, pg_temp;
ALTER FUNCTION public.topic_mastery(p_user_id text) SET search_path = public, extensions, pg_temp;
