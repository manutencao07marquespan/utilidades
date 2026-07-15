-- =============================================
-- Portal das Utilidades - Seed Data
-- Using ON CONFLICT DO NOTHING for safe re-runs
-- =============================================

-- Insert default alert rules (skip if exists)
INSERT INTO public.alert_rules (name, parameter, condition, threshold, severity, notification_method) VALUES
('pH High', 'ph', '>', 9.0, 'critical', 'system'),
('pH Low', 'ph', '<', 6.0, 'critical', 'system'),
('Cistern Critical Level', 'level_percentage', '<', 20.0, 'critical', 'system'),
('Cistern Warning Level', 'level_percentage', '<', 30.0, 'warning', 'system'),
('Stock Low', 'current_stock', '<', 30.0, 'warning', 'system'),
('Stock Critical', 'current_stock', '<', 15.0, 'critical', 'system')
ON CONFLICT DO NOTHING;

-- Insert default system config (skip if exists)
INSERT INTO public.system_config (key, value, description) VALUES
('ph_min_threshold', '6.0', 'Minimum pH threshold for alerts'),
('ph_max_threshold', '9.0', 'Maximum pH threshold for alerts'),
('cistern_critical_level', '20', 'Critical level percentage for cisterns'),
('cistern_warning_level', '30', 'Warning level percentage for cisterns'),
('location_tolerance_meters', '50', 'Geolocation tolerance for QR code validation'),
('report_auto_generate', 'true', 'Auto-generate daily reports at shift end')
ON CONFLICT (key) DO NOTHING;

-- Insert default checklist templates (skip if exists)
INSERT INTO public.checklist_templates (name, type, items, qr_code_data, location_lat, location_lng) VALUES
('Checklist de Rotina Diária', 'daily', 
'[
  {"description": "Leitura dos relatórios dos últimos 3 turnos", "required": true},
  {"description": "Verificação visual geral do setor", "required": true},
  {"description": "Primeira conferência geral de itens", "required": true},
  {"description": "Segunda conferência geral de itens", "required": true},
  {"description": "Limpeza do filtro de entrada da ETE", "required": true},
  {"description": "Coleta e análise de amostras (pH, Turbidez, Temperatura)", "required": true},
  {"description": "Cadastro no sistema SIDECC/DAEE", "required": false}
]'::jsonb,
'ETE-DAILY-001', -23.5505, -46.6333),

('Checklist de Preparo de Produtos Químicos', 'chemical_preparation',
'[
  {"description": "Verificação de EPIs necessários", "required": true},
  {"description": "Conferência de lotes e validade dos produtos", "required": true},
  {"description": "Registro de dosagem e volume preparado", "required": true},
  {"description": "Verificação de funcionamento das bombas dosadoras", "required": true}
]'::jsonb,
'ETE-CHEM-001', -23.5506, -46.6334),

('Checklist de Gestão de Lodo', 'sludge',
'[
  {"description": "Avaliação de nível nos decantadores", "required": true},
  {"description": "Abertura/Fechamento de leitos de secagem", "required": true},
  {"description": "Registro de retirada e destino do lodo seco", "required": true}
]'::jsonb,
'ETE-SLUDGE-001', -23.5507, -46.6335)
ON CONFLICT (qr_code_data) DO NOTHING;

-- Insert default products (skip if exists by name)
INSERT INTO public.products (name, category, unit, current_stock, min_stock, max_stock, supplier) VALUES
('PAC (Clorossilicato de Alumínio)', 'quimico', 'kg', 150, 30, 500, 'Fornecedor A'),
('Polímero Aniônico', 'quimico', 'kg', 45, 10, 100, 'Fornecedor B'),
('Cloro', 'quimico', 'kg', 25, 15, 80, 'Fornecedor C'),
('GLP', 'glp', 'kg', 200, 50, 500, 'Distribuidor D'),
('Óleo Diesel', 'diesel', 'L', 1000, 200, 3000, 'Posto E')
ON CONFLICT DO NOTHING;

-- Insert default assets (pumps) - skip if asset_code exists
INSERT INTO public.assets (name, asset_code, type, location, manufacturer, model, status) VALUES
('Bomba Submersa B-01', 'B-01', 'pump', 'Decantador Primário', 'Manufacturer X', 'Model A', 'active'),
('Bomba Submersa B-02', 'B-02', 'pump', 'Decantador Primário', 'Manufacturer X', 'Model A', 'active'),
('Bomba Submersa B-03', 'B-03', 'pump', 'Decantador Secundário', 'Manufacturer Y', 'Model B', 'maintenance'),
('Bomba Dosadora BD-01', 'BD-01', 'pump', 'Sala de Químicos', 'Manufacturer Z', 'Model C', 'active'),
('Bomba Dosadora BD-02', 'BD-02', 'pump', 'Sala de Químicos', 'Manufacturer Z', 'Model C', 'active')
ON CONFLICT (asset_code) DO NOTHING;

-- Insert default drying beds (skip if bed_code exists)
INSERT INTO public.drying_beds (bed_code, status, sector) VALUES
('LS-01', 'available', 'Setor Norte'),
('LS-02', 'in_use', 'Setor Norte'),
('LS-03', 'available', 'Setor Sul'),
('LS-04', 'drying', 'Setor Sul'),
('LS-05', 'available', 'Setor Leste')
ON CONFLICT (bed_code) DO NOTHING;
