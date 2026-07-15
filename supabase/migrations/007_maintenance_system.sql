-- ============================================
-- Sistema de Manutenção - Ordens de Serviço
-- Portal das Utilidades - ETE
-- ============================================

-- 1. Planos de Manutenção Preventiva
CREATE TABLE IF NOT EXISTS public.maintenance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'preventive' CHECK (type IN ('preventive', 'predictive')),
  category TEXT DEFAULT 'equipment' CHECK (category IN ('equipment', 'facility', 'safety', 'environmental', 'other')),
  periodicity TEXT NOT NULL CHECK (periodicity IN ('daily', 'weekly', 'biweekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual', 'hour_meter', 'hydrometer', 'production', 'mileage', 'custom')),
  interval_value NUMERIC(10,2),
  next_execution DATE,
  estimated_time_hours NUMERIC(5,2),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Ordens de Serviço
CREATE TABLE IF NOT EXISTS public.maintenance_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_number TEXT UNIQUE NOT NULL,
  equipment_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES public.maintenance_plans(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('corrective', 'preventive', 'predictive', 'emergency')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'paused', 'waiting_parts', 'completed', 'cancelled')),
  title TEXT NOT NULL,
  description TEXT,
  requested_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sector TEXT,
  opened_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  hours_worked NUMERIC(5,2),
  team_members TEXT,
  tools_used TEXT,
  observations TEXT,
  signature_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Checklist模板
CREATE TABLE IF NOT EXISTS public.maintenance_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.maintenance_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Checklist preenchido na OS
CREATE TABLE IF NOT EXISTS public.maintenance_order_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.maintenance_orders(id) ON DELETE CASCADE,
  checklist_item_id UUID REFERENCES public.maintenance_checklists(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  observation TEXT
);

-- 5. Materiais previstos no plano
CREATE TABLE IF NOT EXISTS public.maintenance_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.maintenance_plans(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Materiais utilizados na OS
CREATE TABLE IF NOT EXISTS public.maintenance_order_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.maintenance_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity NUMERIC(10,2) NOT NULL,
  unit_price NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Fotos da OS
CREATE TABLE IF NOT EXISTS public.maintenance_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.maintenance_orders(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  description TEXT,
  photo_type TEXT DEFAULT 'during' CHECK (photo_type IN ('before', 'during', 'after')),
  taken_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Histórico de manutenções do equipamento (view materializada)
CREATE OR REPLACE FUNCTION public.get_equipment_history(p_equipment_id UUID)
RETURNS TABLE (
  os_number TEXT,
  type TEXT,
  title TEXT,
  finished_at TIMESTAMPTZ,
  description TEXT,
  hours_worked NUMERIC(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mo.os_number,
    mo.type,
    mo.title,
    mo.finished_at,
    mo.description,
    mo.hours_worked
  FROM public.maintenance_orders mo
  WHERE mo.equipment_id = p_equipment_id
    AND mo.status = 'completed'
  ORDER BY mo.finished_at DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql STABLE;

-- 9. Function para gerar número da OS
CREATE OR REPLACE FUNCTION public.generate_os_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  os_num TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(os_number FROM 5) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.maintenance_orders
  WHERE os_number LIKE 'OS-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-%';
  
  os_num := 'OS-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(next_num::TEXT, 5, '0');
  RETURN os_num;
END;
$$ LANGUAGE plpgsql;

-- 10. RLS Policies
ALTER TABLE public.maintenance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_order_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_order_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_photos ENABLE ROW LEVEL SECURITY;

-- Plans: admin/manager can CRUD, others read
CREATE POLICY "maintenance_plans_read" ON public.maintenance_plans
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "maintenance_plans_write" ON public.maintenance_plans
  FOR ALL TO authenticated USING (public.has_min_role('Admin'));

-- Orders: all authenticated can read, admin/manager can create
CREATE POLICY "maintenance_orders_read" ON public.maintenance_orders
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "maintenance_orders_insert" ON public.maintenance_orders
  FOR INSERT TO authenticated WITH CHECK (public.has_min_role('Admin'));
CREATE POLICY "maintenance_orders_update" ON public.maintenance_orders
  FOR UPDATE TO authenticated USING (public.has_min_role('Admin'));

-- Checklists: read for all, write for admin
CREATE POLICY "maintenance_checklists_read" ON public.maintenance_checklists
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "maintenance_checklists_write" ON public.maintenance_checklists
  FOR ALL TO authenticated USING (public.has_min_role('Admin'));

-- Order checklist: all authenticated
CREATE POLICY "maintenance_order_checklist_all" ON public.maintenance_order_checklist
  FOR ALL TO authenticated USING (true);

-- Materials: read for all, write for admin
CREATE POLICY "maintenance_materials_read" ON public.maintenance_materials
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "maintenance_materials_write" ON public.maintenance_materials
  FOR ALL TO authenticated USING (public.has_min_role('Admin'));

-- Order materials: all authenticated
CREATE POLICY "maintenance_order_materials_all" ON public.maintenance_order_materials
  FOR ALL TO authenticated USING (true);

-- Photos: all authenticated
CREATE POLICY "maintenance_photos_all" ON public.maintenance_photos
  FOR ALL TO authenticated USING (true);

-- 11. Indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_status ON public.maintenance_orders(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_equipment ON public.maintenance_orders(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_os_number ON public.maintenance_orders(os_number);
CREATE INDEX IF NOT EXISTS idx_maintenance_plans_next_execution ON public.maintenance_plans(next_execution);
CREATE INDEX IF NOT EXISTS idx_maintenance_order_checklist_order ON public.maintenance_order_checklist(order_id);
