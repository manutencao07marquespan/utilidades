-- =============================================
-- Portal das Utilidades - Initial Schema
-- Using IF NOT EXISTS to handle re-runs
-- =============================================

-- =============================================
-- 1. USER PROFILES
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'operator'
        CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
    department TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 2. LABORATORY ANALYSES
-- =============================================

CREATE TABLE IF NOT EXISTS public.lab_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift TEXT NOT NULL CHECK (shift IN ('A', 'B', 'C')),
    collection_point TEXT NOT NULL
        CHECK (collection_point IN (
            'hidrometro', 'serpentina', 'bacia_amortecimento',
            'efluente_bruto', 'efluente_tratado'
        )),
    ph NUMERIC(4,2) CHECK (ph >= 0 AND ph <= 14),
    turbidity NUMERIC(8,2) CHECK (turbidity >= 0),
    temperature NUMERIC(4,1) CHECK (temperature >= -10 AND temperature <= 100),
    decantation_efficiency NUMERIC(5,2)
        CHECK (decantation_efficiency >= 0 AND decantation_efficiency <= 100),
    observations TEXT,
    recorded_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_lab_analyses_date ON public.lab_analyses(analysis_date);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_lab_analyses_point ON public.lab_analyses(collection_point);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- =============================================
-- 3. UTILITIES & MEASUREMENTS
-- =============================================

-- Hydrant Readings (Input/Output)
CREATE TABLE IF NOT EXISTS public.hydrant_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift TEXT NOT NULL CHECK (shift IN ('A', 'B', 'C')),
    hydrant_code TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('input', 'output')),
    reading_value NUMERIC(12,2) NOT NULL,
    previous_reading NUMERIC(12,2),
    consumption NUMERIC(12,2) GENERATED ALWAYS AS
        (reading_value - COALESCE(previous_reading, 0)) STORED,
    observations TEXT,
    recorded_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Well Horimeters
CREATE TABLE IF NOT EXISTS public.well_horimeters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift TEXT NOT NULL CHECK (shift IN ('A', 'B', 'C')),
    well_code TEXT NOT NULL,
    current_hours NUMERIC(10,2) NOT NULL,
    previous_hours NUMERIC(10,2),
    hours_diff NUMERIC(10,2) GENERATED ALWAYS AS
        (current_hours - COALESCE(previous_hours, 0)) STORED,
    observations TEXT,
    recorded_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Cistern Levels
CREATE TABLE IF NOT EXISTS public.cistern_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift TEXT NOT NULL CHECK (shift IN ('A', 'B', 'C')),
    cistern_code TEXT NOT NULL,
    level_percentage NUMERIC(5,2)
        CHECK (level_percentage >= 0 AND level_percentage <= 100),
    level_meters NUMERIC(6,2),
    observations TEXT,
    recorded_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_cistern_levels_date ON public.cistern_levels(reading_date);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_cistern_levels_code ON public.cistern_levels(cistern_code);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- =============================================
-- 4. SUPPLIES & STOCK
-- =============================================

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL
        CHECK (category IN ('quimico', 'glp', 'diesel', 'outro')),
    unit TEXT NOT NULL,
    current_stock NUMERIC(10,2) DEFAULT 0,
    min_stock NUMERIC(10,2) DEFAULT 0,
    max_stock NUMERIC(10,2),
    supplier TEXT,
    unit_price NUMERIC(10,2),
    location TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id),
    movement_type TEXT NOT NULL CHECK (movement_type IN ('entry', 'exit', 'adjustment')),
    quantity NUMERIC(10,2) NOT NULL,
    unit_price NUMERIC(10,2),
    reason TEXT,
    reference_document TEXT,
    performed_by UUID REFERENCES public.user_profiles(id),
    movement_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements(product_id);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON public.stock_movements(movement_date);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- Solution Preparations
CREATE TABLE IF NOT EXISTS public.solution_preparations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    preparation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift TEXT NOT NULL CHECK (shift IN ('A', 'B', 'C')),
    product_id UUID NOT NULL REFERENCES public.products(id),
    concentration NUMERIC(5,2),
    volume_prepared NUMERIC(10,2) NOT NULL,
    unit TEXT DEFAULT 'L',
    batch_number TEXT,
    expiry_date DATE,
    observations TEXT,
    prepared_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Stock Predictions
CREATE TABLE IF NOT EXISTS public.stock_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id),
    avg_daily_consumption NUMERIC(10,4),
    days_remaining NUMERIC(6,1),
    predicted_stockout_date DATE,
    calculation_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 5. WASTE MANAGEMENT
-- =============================================

CREATE TABLE IF NOT EXISTS public.decanter_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift TEXT NOT NULL CHECK (shift IN ('A', 'B', 'C')),
    decanter_code TEXT NOT NULL,
    action_type TEXT NOT NULL
        CHECK (action_type IN ('emptying', 'inspection', 'maintenance')),
    sludge_volume NUMERIC(10,2),
    sludge_destination TEXT,
    observations TEXT,
    recorded_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.drying_beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bed_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'in_use', 'drying', 'completed')),
    sector TEXT,
    last_used_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.drying_bed_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bed_id UUID NOT NULL REFERENCES public.drying_beds(id),
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift TEXT NOT NULL CHECK (shift IN ('A', 'B', 'C')),
    action_type TEXT NOT NULL
        CHECK (action_type IN ('open', 'close', 'remove_sludge', 'inspect')),
    sludge_volume NUMERIC(10,2),
    observations TEXT,
    recorded_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sludge_disposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disposal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    source TEXT NOT NULL CHECK (source IN ('decanter', 'drying_bed')),
    source_id UUID,
    volume NUMERIC(10,2) NOT NULL,
    destination TEXT NOT NULL,
    transport_company TEXT,
    transport_document TEXT,
    observations TEXT,
    performed_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.oil_disposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disposal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    volume NUMERIC(10,2) NOT NULL,
    origin TEXT,
    destination TEXT NOT NULL,
    transport_company TEXT,
    observations TEXT,
    performed_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 6. MAINTENANCE
-- =============================================

CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    asset_code TEXT UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('pump', 'valve', 'motor', 'other')),
    location TEXT,
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    installation_date DATE,
    status TEXT DEFAULT 'active'
        CHECK (status IN ('active', 'maintenance', 'inactive', 'retired')),
    specifications JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pump_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.assets(id),
    reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift TEXT NOT NULL CHECK (shift IN ('A', 'B', 'C')),
    status TEXT NOT NULL CHECK (status IN ('running', 'stopped', 'maintenance', 'fault')),
    power_kw NUMERIC(6,2),
    flow_rate NUMERIC(8,2),
    pressure_bar NUMERIC(6,2),
    vibration NUMERIC(4,2),
    temperature NUMERIC(5,1),
    observations TEXT,
    recorded_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_pump_readings_asset ON public.pump_readings(asset_id);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_pump_readings_date ON public.pump_readings(reading_date);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.assets(id),
    maintenance_type TEXT NOT NULL
        CHECK (maintenance_type IN ('preventive', 'corrective', 'predictive')),
    description TEXT NOT NULL,
    performed_date DATE,
    next_due_date DATE,
    cost NUMERIC(10,2),
    technician TEXT,
    parts_replaced TEXT,
    observations TEXT,
    status TEXT DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'open'
        CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
    asset_id UUID REFERENCES public.assets(id),
    requested_by UUID REFERENCES public.user_profiles(id),
    assigned_to UUID REFERENCES public.user_profiles(id),
    due_date DATE,
    completed_date DATE,
    cost NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 7. PREVENTIVE ACTIVITIES
-- =============================================

CREATE TABLE IF NOT EXISTS public.preventive_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL
        CHECK (category IN ('equipment', 'facility', 'safety', 'environmental', 'other')),
    frequency_days INTEGER NOT NULL DEFAULT 30,
    asset_id UUID REFERENCES public.assets(id),
    responsible_role TEXT,
    checklist_template JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.preventive_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.preventive_activities(id),
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    status TEXT DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'skipped')),
    checklist_results JSONB,
    observations TEXT,
    performed_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_preventive_scheduled ON public.preventive_executions(scheduled_date);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_preventive_status ON public.preventive_executions(status);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- =============================================
-- 8. CHECKLISTS & QR CODE
-- =============================================

CREATE TABLE IF NOT EXISTS public.checklist_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('daily', 'chemical_preparation', 'sludge', 'custom')),
    items JSONB NOT NULL,
    qr_code_data TEXT UNIQUE,
    location_lat NUMERIC(9,6),
    location_lng NUMERIC(9,6),
    location_radius_meters INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.checklist_templates(id),
    execution_date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift TEXT NOT NULL CHECK (shift IN ('A', 'B', 'C')),
    status TEXT DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    qr_scanned_at TIMESTAMPTZ,
    scan_location_lat NUMERIC(9,6),
    scan_location_lng NUMERIC(9,6),
    geolocation_valid BOOLEAN,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
    item_index INTEGER NOT NULL,
    description TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    observations TEXT,
    photo_url TEXT,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES public.user_profiles(id)
);

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_checklists_date ON public.checklists(execution_date);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_checklists_template ON public.checklists(template_id);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- =============================================
-- 9. REPORTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_date DATE NOT NULL,
    shift TEXT NOT NULL CHECK (shift IN ('A', 'B', 'C')),
    content JSONB NOT NULL,
    pdf_url TEXT,
    generated_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 10. AUDIT LOGS
-- =============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_audit_table ON public.audit_logs(table_name);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_audit_date ON public.audit_logs(created_at);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- =============================================
-- 11. SYSTEM CONFIG & ALERTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    parameter TEXT NOT NULL,
    condition TEXT NOT NULL,
    threshold NUMERIC(10,2),
    severity TEXT NOT NULL DEFAULT 'warning'
        CHECK (severity IN ('info', 'warning', 'critical')),
    is_active BOOLEAN DEFAULT true,
    notification_method TEXT DEFAULT 'system'
        CHECK (notification_method IN ('system', 'whatsapp', 'email')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES public.alert_rules(id),
    triggered_at TIMESTAMPTZ DEFAULT now(),
    value NUMERIC(10,2),
    message TEXT,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES public.user_profiles(id),
    acknowledged_at TIMESTAMPTZ
);
