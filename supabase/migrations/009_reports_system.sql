-- ============================================
-- Sistema de Relatórios
-- Portal das Utilidades - ETE
-- ============================================

-- 1. Modelos de Relatórios
CREATE TABLE IF NOT EXISTS public.report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('daily', 'maintenance', 'checklist', 'laboratory', 'consumption', 'stock', 'sludge', 'occurrences', 'horimeter', 'hydrant', 'alarms', 'users', 'audit')),
  category TEXT DEFAULT 'operational' CHECK (category IN ('operational', 'managerial', 'environmental', 'financial')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Histórico de Relatórios Gerados
CREATE TABLE IF NOT EXISTS public.report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.report_templates(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id),
  report_type TEXT NOT NULL,
  report_name TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  format TEXT NOT NULL CHECK (format IN ('pdf', 'excel', 'print')),
  file_url TEXT,
  file_size INTEGER,
  filters JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Agendamentos de Relatórios
CREATE TABLE IF NOT EXISTS public.report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.report_templates(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  time_of_day TIME DEFAULT '07:00',
  recipients JSONB,
  is_active BOOLEAN DEFAULT true,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RLS Policies
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;

-- Templates: read for all, write for admin
CREATE POLICY "report_templates_read" ON public.report_templates
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "report_templates_write" ON public.report_templates
  FOR ALL TO authenticated USING (public.has_min_role('Admin'));

-- History: read for all, write for admin
CREATE POLICY "report_history_read" ON public.report_history
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "report_history_write" ON public.report_history
  FOR ALL TO authenticated USING (public.has_min_role('Admin'));

-- Schedules: read for all, write for admin
CREATE POLICY "report_schedules_read" ON public.report_schedules
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "report_schedules_write" ON public.report_schedules
  FOR ALL TO authenticated USING (public.has_min_role('Admin'));

-- 5. Seed: Modelos de relatórios padrão
INSERT INTO public.report_templates (name, description, type, category) VALUES
  ('Relatório Diário da ETE', 'Relatório completo do dia com todas as operações', 'daily', 'operational'),
  ('Relatório de Manutenção', 'Histórico de ordens de serviço e manutenções', 'maintenance', 'operational'),
  ('Relatório de Checklists', 'Resumo de inspeções e checklists executados', 'checklist', 'operational'),
  ('Relatório Laboratorial', 'Análises de qualidade da água com gráficos', 'laboratory', 'environmental'),
  ('Relatório de Consumo', 'Consumo de água, energia e insumos', 'consumption', 'managerial'),
  ('Relatório de Estoque', 'Posição de estoque e previsão de compras', 'stock', 'managerial'),
  ('Relatório de Lodo', 'Produção e destinação de lodo', 'sludge', 'environmental'),
  ('Relatório de Ocorrências', 'Ocorrências e alertas do período', 'occurrences', 'operational'),
  ('Relatório de Horímetros', 'Leituras de horímetros e horas de operação', 'horimeter', 'operational'),
  ('Relatório de Hidrômetros', 'Leituras de hidrômetros e consumo de água', 'hydrant', 'operational'),
  ('Relatório de Alarmes', 'Todos os alarmes disparados', 'alarms', 'operational'),
  ('Relatório de Usuários', 'Atividades e acessos dos usuários', 'users', 'managerial'),
  ('Auditoria do Sistema', 'Log completo de alterações no sistema', 'audit', 'managerial')
ON CONFLICT DO NOTHING;

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_report_history_user ON public.report_history(user_id);
CREATE INDEX IF NOT EXISTS idx_report_history_type ON public.report_history(report_type);
CREATE INDEX IF NOT EXISTS idx_report_history_created ON public.report_history(created_at);
