-- ============================================
-- Adicionar coluna email na tabela user_profiles
-- ============================================

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill: copiar email dos usuarios existentes via function
CREATE OR REPLACE FUNCTION public.backfill_user_emails()
RETURNS void AS $$
BEGIN
  UPDATE public.user_profiles up
  SET email = au.email
  FROM auth.users au
  WHERE up.id = au.id AND up.email IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT public.backfill_user_emails();

DROP FUNCTION public.backfill_user_emails();
