-- ============================================
-- Melhorias no Histórico de Checklists
-- Portal das Utilidades - ETE
-- ============================================

-- 1. Adicionar campos na tabela de execuções
ALTER TABLE public.checklist_executions ADD COLUMN IF NOT EXISTS has_non_conformity BOOLEAN DEFAULT false;
ALTER TABLE public.checklist_executions ADD COLUMN IF NOT EXISTS non_conformity_count INTEGER DEFAULT 0;
ALTER TABLE public.checklist_executions ADD COLUMN IF NOT EXISTS generated_work_order BOOLEAN DEFAULT false;
ALTER TABLE public.checklist_executions ADD COLUMN IF NOT EXISTS work_order_id UUID;
ALTER TABLE public.checklist_executions ADD COLUMN IF NOT EXISTS execution_duration INTEGER;
ALTER TABLE public.checklist_executions ADD COLUMN IF NOT EXISTS qr_code_scanned BOOLEAN DEFAULT false;

-- 2. Tabela de Não Conformidades
CREATE TABLE IF NOT EXISTS public.checklist_non_conformities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES public.checklist_executions(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES public.assets(id),
  checklist_item_index INTEGER NOT NULL,
  item_question TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  response_value TEXT,
  photo_url TEXT,
  work_order_id UUID,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'cancelled')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS Policies
ALTER TABLE public.checklist_non_conformities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checklist_non_conformities_read" ON public.checklist_non_conformities
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "checklist_non_conformities_insert" ON public.checklist_non_conformities
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "checklist_non_conformities_update" ON public.checklist_non_conformities
  FOR UPDATE TO authenticated USING (public.has_min_role('Admin'));

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_checklist_executions_non_conf ON public.checklist_executions(has_non_conformity);
CREATE INDEX IF NOT EXISTS idx_checklist_executions_duration ON public.checklist_executions(execution_duration);
CREATE INDEX IF NOT EXISTS idx_non_conformities_execution ON public.checklist_non_conformities(execution_id);
CREATE INDEX IF NOT EXISTS idx_non_conformities_status ON public.checklist_non_conformities(status);
CREATE INDEX IF NOT EXISTS idx_non_conformities_severity ON public.checklist_non_conformities(severity);
