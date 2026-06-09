-- ─── Tutup landmine RLS: cegah privilege escalation via profiles ─────
-- Mencegah end-user (lewat PostgREST: role authenticated/anon) mengubah
-- kolom sensitif `role` & `subscription_tier`.
-- Service role (app & Table Editor) dan postgres (SQL Editor dashboard)
-- TETAP boleh mengubah → workflow set admin manual tidak terganggu.

CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Hanya batasi request end-user lewat PostgREST.
  -- current_user = 'service_role' (app/Table Editor) atau 'postgres' (SQL Editor) → dilewatkan.
  IF current_user IN ('authenticated', 'anon') THEN
    IF TG_OP = 'INSERT' THEN
      -- Paksa nilai aman saat user (kelak) insert profilnya sendiri
      NEW.role := 'user';
      NEW.subscription_tier := COALESCE(NEW.subscription_tier, 'free');
      IF NEW.subscription_tier <> 'free' THEN
        NEW.subscription_tier := 'free';
      END IF;
    ELSIF TG_OP = 'UPDATE' THEN
      IF NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'Perubahan role tidak diizinkan';
      END IF;
      IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
        RAISE EXCEPTION 'Perubahan subscription_tier tidak diizinkan';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_privileged ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileged
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privileged_columns();
