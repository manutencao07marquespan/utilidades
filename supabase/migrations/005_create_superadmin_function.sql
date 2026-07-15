-- Função para criar SuperAdmin inicial
-- Esta função deve ser chamada via RPC para criar o primeiro usuário
-- quando não existe nenhum SuperAdmin no sistema

CREATE OR REPLACE FUNCTION public.create_superadmin(
  user_email TEXT,
  user_password TEXT,
  user_full_name TEXT,
  user_department TEXT DEFAULT NULL,
  user_job_title TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  new_user_id UUID;
  role_id_val UUID;
  result JSONB;
BEGIN
  -- Verificar se já existe SuperAdmin
  IF EXISTS (SELECT 1 FROM public.user_profiles WHERE role = 'SuperAdmin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Já existe um SuperAdmin configurado'
    );
  END IF;

  -- Criar usuário no auth (usando service_role via trigger ou manual)
  -- NOTA: Esta função precisa ser executada com privilégios de service_role
  -- ou via edge function

  -- Buscar role_id do SuperAdmin
  SELECT id INTO role_id_val FROM public.roles WHERE name = 'SuperAdmin';

  -- Criar perfil do usuário
  -- O id do auth.users deve ser fornecido externamente
  -- Esta função é um placeholder - o fluxo real usa a API auth

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Função preparada - use a API para criar o usuário'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função mais simples: verificar se precisa de setup
CREATE OR REPLACE FUNCTION public.needs_setup()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.user_profiles WHERE role = 'SuperAdmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
