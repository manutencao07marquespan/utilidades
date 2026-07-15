-- ============================================
-- Criar usuário Admin
-- Portal das Utilidades - ETE
-- ============================================

-- 1. Criar usuário no auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'dione@utilidades.com.br',
  crypt('dione123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- 2. Criar perfil Admin
INSERT INTO user_profiles (id, full_name, role, role_id, is_active, is_first_user)
SELECT 
  id,
  'Dione',
  'Admin',
  (SELECT id FROM roles WHERE name = 'Admin'),
  true,
  false
FROM auth.users 
WHERE email = 'dione@utilidades.com.br'
ON CONFLICT (id) DO UPDATE SET 
  full_name = 'Dione',
  role = 'Admin',
  role_id = (SELECT id FROM roles WHERE name = 'Admin'),
  is_active = true;

-- 3. Verificar se foi criado
SELECT 
  au.email,
  up.full_name,
  up.role,
  r.name as role_name,
  r.level
FROM auth.users au
JOIN user_profiles up ON up.id = au.id
LEFT JOIN roles r ON r.id = up.role_id
WHERE au.email = 'dione@utilidades.com.br';
