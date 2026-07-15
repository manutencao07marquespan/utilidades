-- ============================================
-- Sistema de Checklists com QR Code
-- Portal das Utilidades - ETE
-- ============================================

-- 1. Modelos de Checklist
CREATE TABLE IF NOT EXISTS public.checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'daily' CHECK (category IN ('daily', 'weekly', 'monthly', 'lubrication', 'inspection', 'custom')),
  periodicity TEXT DEFAULT 'daily' CHECK (periodicity IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annual')),
  sector TEXT,
  estimated_time_minutes INTEGER,
  require_photo BOOLEAN DEFAULT false,
  require_signature BOOLEAN DEFAULT true,
  require_qr BOOLEAN DEFAULT true,
  require_gps BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Itens do Modelo de Checklist
CREATE TABLE IF NOT EXISTS public.checklist_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  question TEXT NOT NULL,
  response_type TEXT NOT NULL DEFAULT 'boolean' CHECK (response_type IN ('boolean', 'text', 'number', 'select', 'photo', 'signature', 'code', 'reading')),
  options JSONB,
  is_required BOOLEAN DEFAULT true,
  require_photo BOOLEAN DEFAULT false,
  weight INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. QR Codes dos Equipamentos
CREATE TABLE IF NOT EXISTS public.equipment_qrcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  qr_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  qr_code TEXT NOT NULL,
  location TEXT,
  sector TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'printed')),
  printed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Execuções de Checklist
CREATE TABLE IF NOT EXISTS public.checklist_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.checklist_templates(id),
  equipment_id UUID REFERENCES public.assets(id),
  qr_code_id UUID REFERENCES public.equipment_qrcodes(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  gps_accuracy NUMERIC(10, 2),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  score NUMERIC(5, 2),
  observations TEXT,
  signature_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Respostas do Checklist
CREATE TABLE IF NOT EXISTS public.checklist_execution_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES public.checklist_executions(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.checklist_template_items(id),
  response TEXT,
  response_value NUMERIC(10, 2),
  observation TEXT,
  photo_url TEXT,
  completed BOOLEAN DEFAULT false,
  completed_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. RLS Policies
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_qrcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_execution_items ENABLE ROW LEVEL SECURITY;

-- Templates: read for all, write for admin
CREATE POLICY "checklist_templates_read" ON public.checklist_templates
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "checklist_templates_write" ON public.checklist_templates
  FOR ALL TO authenticated USING (public.has_min_role('Admin'));

-- Template items: read for all, write for admin
CREATE POLICY "checklist_template_items_read" ON public.checklist_template_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "checklist_template_items_write" ON public.checklist_template_items
  FOR ALL TO authenticated USING (public.has_min_role('Admin'));

-- QR Codes: read for all, write for admin
CREATE POLICY "equipment_qrcodes_read" ON public.equipment_qrcodes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "equipment_qrcodes_write" ON public.equipment_qrcodes
  FOR ALL TO authenticated USING (public.has_min_role('Admin'));

-- Executions: all authenticated
CREATE POLICY "checklist_executions_all" ON public.checklist_executions
  FOR ALL TO authenticated USING (true);

-- Execution items: all authenticated
CREATE POLICY "checklist_execution_items_all" ON public.checklist_execution_items
  FOR ALL TO authenticated USING (true);

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_checklist_executions_equipment ON public.checklist_executions(equipment_id);
CREATE INDEX IF NOT EXISTS idx_checklist_executions_user ON public.checklist_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_checklist_executions_status ON public.checklist_executions(status);
CREATE INDEX IF NOT EXISTS idx_equipment_qrcodes_token ON public.equipment_qrcodes(qr_token);
CREATE INDEX IF NOT EXISTS idx_equipment_qrcodes_equipment ON public.equipment_qrcodes(equipment_id);
CREATE INDEX IF NOT EXISTS idx_checklist_template_items_template ON public.checklist_template_items(template_id);

-- 8. Function para gerar QR Code URL
CREATE OR REPLACE FUNCTION public.get_qr_url(p_qr_token UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://portalutilidades.com/checklists/scan/' || p_qr_token::TEXT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
