-- ============================================
-- Módulo: Controle de Usuários
-- Portal das Utilidades - ETE
-- ============================================

-- 1. Tabela de perfis (roles)
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de módulos do sistema
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de permissões (ações por módulo)
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('view', 'create', 'update', 'delete', 'export')),
  UNIQUE(module_id, action)
);

-- 4. Tabela de permissões por perfil
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 5. Tabela de permissões por setor
CREATE TABLE IF NOT EXISTS public.user_sector_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sector TEXT NOT NULL,
  can_view BOOLEAN DEFAULT true,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  UNIQUE(user_id, sector)
);

-- 6. Atualizar tabela user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id),
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS is_first_user BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- 7. Seed: Perfis do sistema
INSERT INTO public.roles (name, description, level) VALUES
  ('SuperAdmin', 'Super Administrador - Acesso total ao sistema', 100),
  ('Admin', 'Administrador - Gerencia usuários e operações', 50),
  ('Usuario', 'Usuário - Operador do sistema', 10)
ON CONFLICT (name) DO NOTHING;

-- 8. Seed: Módulos do sistema
INSERT INTO public.modules (name, display_name) VALUES
  ('dashboard', 'Dashboard'),
  ('laboratorio', 'Laboratório'),
  ('utilidades', 'Utilidades'),
  ('insumos', 'Insumos & Estoque'),
  ('residuos', 'Resíduos'),
  ('manutencao', 'Manutenção'),
  ('usuarios', 'Controle de Usuários'),
  ('checklists', 'Checklists'),
  ('relatorios', 'Relatórios'),
  ('atividades', 'Atividades Preventivas')
ON CONFLICT (name) DO NOTHING;

-- 9. Seed: Permissões por módulo
INSERT INTO public.permissions (module_id, action)
SELECT m.id, a.action
FROM public.modules m
CROSS JOIN (VALUES ('view'), ('create'), ('update'), ('delete'), ('export')) AS a(action)
ON CONFLICT (module_id, action) DO NOTHING;

-- 10. Seed: Permissões do SuperAdmin (todas)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'SuperAdmin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 11. Seed: Permissões do Admin (view, create, update, delete em todos módulos exceto usuarios)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
CROSS JOIN public.modules m
WHERE r.name = 'Admin'
  AND p.module_id = m.id
  AND p.action IN ('view', 'create', 'update', 'delete')
  AND m.name != 'usuarios'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Admin pode visualizar usuários mas não criar/excluir
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
CROSS JOIN public.modules m
WHERE r.name = 'Admin'
  AND p.module_id = m.id
  AND m.name = 'usuarios'
  AND p.action IN ('view', 'create', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 12. Seed: Permissões do Usuário (view em todos, create/update em módulos operacionais)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
CROSS JOIN public.modules m
WHERE r.name = 'Usuario'
  AND p.module_id = m.id
  AND p.action = 'view'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Usuário pode criar/editar em módulos operacionais
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
CROSS JOIN public.modules m
WHERE r.name = 'Usuario'
  AND p.module_id = m.id
  AND m.name IN ('laboratorio', 'utilidades', 'insumos', 'residuos', 'checklists', 'atividades')
  AND p.action IN ('create', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 13. Function: Obter nível do perfil do usuário
CREATE OR REPLACE FUNCTION public.get_user_role_level()
RETURNS INTEGER AS $$
  SELECT COALESCE(r.level, 0)
  FROM public.user_profiles up
  LEFT JOIN public.roles r ON r.id = up.role_id
  WHERE up.id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 14. Function: Verificar permissão do usuário
CREATE OR REPLACE FUNCTION public.has_permission(module_name TEXT, action_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles up
    JOIN public.roles r ON r.id = up.role_id
    JOIN public.role_permissions rp ON rp.role_id = r.id
    JOIN public.permissions p ON p.id = rp.permission_id
    JOIN public.modules m ON m.id = p.module_id
    WHERE up.id = auth.uid()
      AND m.name = module_name
      AND p.action = action_name
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 15. Function: Verificar se usuário tem perfil mínimo
CREATE OR REPLACE FUNCTION public.has_min_role(min_role_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles up
    JOIN public.roles r ON r.id = up.role_id
    WHERE up.id = auth.uid()
      AND r.level >= (SELECT level FROM public.roles WHERE name = min_role_name)
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 16. Trigger: Sincronizar role_id com role TEXT
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role_id IS NOT NULL THEN
    NEW.role := (SELECT name FROM public.roles WHERE id = NEW.role_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_user_role ON public.user_profiles;
CREATE TRIGGER trigger_sync_user_role
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role();

-- 17. Trigger: Marcar primeiro usuário como SuperAdmin
CREATE OR REPLACE FUNCTION public.on_first_user()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.user_profiles) = 0 THEN
    NEW.role_id := (SELECT id FROM public.roles WHERE name = 'SuperAdmin');
    NEW.is_first_user := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_on_first_user ON public.user_profiles;
CREATE TRIGGER trigger_on_first_user
  BEFORE INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.on_first_user();

-- 18. Atualizar RLS policies para user_profiles
-- SuperAdmin pode tudo
DROP POLICY IF EXISTS "admin_only" ON public.user_profiles;
CREATE POLICY "superadmin_full_access" ON public.user_profiles
  FOR ALL TO authenticated
  USING (public.has_min_role('SuperAdmin'));

-- Admin pode gerenciar usuários (exceto SuperAdmin)
CREATE POLICY "admin_manage_users" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (
    public.has_min_role('Admin')
    OR id = auth.uid()
  );

CREATE POLICY "admin_insert_users" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_min_role('Admin')
    AND (
      -- Admin não pode criar SuperAdmin
      (SELECT level FROM public.roles WHERE id = role_id) < 100
      OR public.has_min_role('SuperAdmin')
    )
  );

CREATE POLICY "admin_update_users" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (
    public.has_min_role('Admin')
    AND (
      -- Admin não pode alterar SuperAdmin
      (SELECT level FROM public.roles WHERE id = role_id) < 100
      OR public.has_min_role('SuperAdmin')
    )
  )
  WITH CHECK (
    public.has_min_role('Admin')
  );

-- Usuário pode ver próprio perfil
CREATE POLICY "user_own_profile" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Usuário pode atualizar próprio perfil (campos limitados)
CREATE POLICY "user_update_own_profile" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 19. RLS para novas tabelas
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sector_permissions ENABLE ROW LEVEL SECURITY;

-- Roles: leitura para todos autenticados
CREATE POLICY "roles_read" ON public.roles
  FOR SELECT TO authenticated USING (true);

-- Modules: leitura para todos autenticados
CREATE POLICY "modules_read" ON public.modules
  FOR SELECT TO authenticated USING (true);

-- Permissions: leitura para todos autenticados
CREATE POLICY "permissions_read" ON public.permissions
  FOR SELECT TO authenticated USING (true);

-- Role permissions: leitura para todos autenticados
CREATE POLICY "role_permissions_read" ON public.role_permissions
  FOR SELECT TO authenticated USING (true);

-- Role permissions: escrita apenas para SuperAdmin
CREATE POLICY "role_permissions_write" ON public.role_permissions
  FOR ALL TO authenticated
  USING (public.has_min_role('SuperAdmin'));

-- User sector permissions: SuperAdmin pode tudo
CREATE POLICY "user_sector_permissions_superadmin" ON public.user_sector_permissions
  FOR ALL TO authenticated
  USING (public.has_min_role('SuperAdmin'));

-- User sector permissions: Admin pode gerenciar
CREATE POLICY "user_sector_permissions_admin" ON public.user_sector_permissions
  FOR ALL TO authenticated
  USING (public.has_min_role('Admin'));

-- User sector permissions: leitura para próprios dados
CREATE POLICY "user_sector_permissions_own" ON public.user_sector_permissions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 20. Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_id ON public.user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_user_sector_permissions_user_id ON public.user_sector_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_permissions_module_id ON public.permissions(module_id);
