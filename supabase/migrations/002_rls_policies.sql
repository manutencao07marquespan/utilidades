-- =============================================
-- Portal das Utilidades - RLS Policies
-- Using DROP IF EXISTS to handle re-runs
-- =============================================

-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hydrant_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.well_horimeters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cistern_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_preparations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decanter_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drying_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drying_bed_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sludge_disposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oil_disposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pump_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTION: Get user role
-- =============================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.user_profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- =============================================
-- DROP EXISTING POLICIES (safe re-run)
-- =============================================

DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON public.lab_analyses;
    DROP POLICY IF EXISTS "operators_insert" ON public.lab_analyses;
    DROP POLICY IF EXISTS "managers_update" ON public.lab_analyses;
    DROP POLICY IF EXISTS "admin_delete" ON public.lab_analyses;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON public.hydrant_readings;
    DROP POLICY IF EXISTS "operators_insert" ON public.hydrant_readings;
    DROP POLICY IF EXISTS "managers_update" ON public.hydrant_readings;
    DROP POLICY IF EXISTS "admin_delete" ON public.hydrant_readings;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON public.well_horimeters;
    DROP POLICY IF EXISTS "operators_insert" ON public.well_horimeters;
    DROP POLICY IF EXISTS "managers_update" ON public.well_horimeters;
    DROP POLICY IF EXISTS "admin_delete" ON public.well_horimeters;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON public.cistern_levels;
    DROP POLICY IF EXISTS "operators_insert" ON public.cistern_levels;
    DROP POLICY IF EXISTS "managers_update" ON public.cistern_levels;
    DROP POLICY IF EXISTS "admin_delete" ON public.cistern_levels;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON public.products;
    DROP POLICY IF EXISTS "managers_insert" ON public.products;
    DROP POLICY IF EXISTS "managers_update" ON public.products;
    DROP POLICY IF EXISTS "admin_delete" ON public.products;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON public.stock_movements;
    DROP POLICY IF EXISTS "operators_insert" ON public.stock_movements;
    DROP POLICY IF EXISTS "admin_delete" ON public.stock_movements;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON public.assets;
    DROP POLICY IF EXISTS "managers_insert" ON public.assets;
    DROP POLICY IF EXISTS "managers_update" ON public.assets;
    DROP POLICY IF EXISTS "admin_delete" ON public.assets;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON public.pump_readings;
    DROP POLICY IF EXISTS "operators_insert" ON public.pump_readings;
    DROP POLICY IF EXISTS "admin_delete" ON public.pump_readings;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON public.maintenance_records;
    DROP POLICY IF EXISTS "operators_insert" ON public.maintenance_records;
    DROP POLICY IF EXISTS "managers_update" ON public.maintenance_records;
    DROP POLICY IF EXISTS "admin_delete" ON public.maintenance_records;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON public.service_requests;
    DROP POLICY IF EXISTS "operators_insert" ON public.service_requests;
    DROP POLICY IF EXISTS "managers_update" ON public.service_requests;
    DROP POLICY IF EXISTS "admin_delete" ON public.service_requests;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "admin_only" ON public.user_profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "read_only_audit" ON public.audit_logs;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON public.checklist_templates;
    DROP POLICY IF EXISTS "managers_insert" ON public.checklist_templates;
    DROP POLICY IF EXISTS "managers_update" ON public.checklist_templates;
    DROP POLICY IF EXISTS "admin_delete" ON public.checklist_templates;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON public.checklists;
    DROP POLICY IF EXISTS "operators_insert" ON public.checklists;
    DROP POLICY IF EXISTS "managers_update" ON public.checklists;
    DROP POLICY IF EXISTS "admin_delete" ON public.checklists;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON public.checklist_items;
    DROP POLICY IF EXISTS "operators_insert" ON public.checklist_items;
    DROP POLICY IF EXISTS "managers_update" ON public.checklist_items;
    DROP POLICY IF EXISTS "admin_delete" ON public.checklist_items;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "authenticated_read" ON public.daily_reports;
    DROP POLICY IF EXISTS "managers_insert" ON public.daily_reports;
    DROP POLICY IF EXISTS "managers_update" ON public.daily_reports;
    DROP POLICY IF EXISTS "admin_delete" ON public.daily_reports;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "managers_read" ON public.system_config;
    DROP POLICY IF EXISTS "admin_manage" ON public.system_config;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "managers_read" ON public.alert_rules;
    DROP POLICY IF EXISTS "admin_manage" ON public.alert_rules;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "managers_read" ON public.alert_history;
    DROP POLICY IF EXISTS "system_insert" ON public.alert_history;
    DROP POLICY IF EXISTS "managers_acknowledge" ON public.alert_history;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- =============================================
-- CREATE POLICIES
-- =============================================

-- Lab Analyses
CREATE POLICY "authenticated_read" ON public.lab_analyses
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "operators_insert" ON public.lab_analyses
    FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('admin', 'manager', 'operator'));

CREATE POLICY "managers_update" ON public.lab_analyses
    FOR UPDATE TO authenticated
    USING (public.get_user_role() IN ('admin', 'manager'));

CREATE POLICY "admin_delete" ON public.lab_analyses
    FOR DELETE TO authenticated
    USING (public.get_user_role() = 'admin');

-- Hydrant Readings
CREATE POLICY "authenticated_read" ON public.hydrant_readings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "operators_insert" ON public.hydrant_readings
    FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('admin', 'manager', 'operator'));

CREATE POLICY "managers_update" ON public.hydrant_readings
    FOR UPDATE TO authenticated
    USING (public.get_user_role() IN ('admin', 'manager'));

CREATE POLICY "admin_delete" ON public.hydrant_readings
    FOR DELETE TO authenticated
    USING (public.get_user_role() = 'admin');

-- Well Horimeters
CREATE POLICY "authenticated_read" ON public.well_horimeters
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "operators_insert" ON public.well_horimeters
    FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('admin', 'manager', 'operator'));

CREATE POLICY "managers_update" ON public.well_horimeters
    FOR UPDATE TO authenticated
    USING (public.get_user_role() IN ('admin', 'manager'));

CREATE POLICY "admin_delete" ON public.well_horimeters
    FOR DELETE TO authenticated
    USING (public.get_user_role() = 'admin');

-- Cistern Levels
CREATE POLICY "authenticated_read" ON public.cistern_levels
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "operators_insert" ON public.cistern_levels
    FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('admin', 'manager', 'operator'));

CREATE POLICY "managers_update" ON public.cistern_levels
    FOR UPDATE TO authenticated
    USING (public.get_user_role() IN ('admin', 'manager'));

CREATE POLICY "admin_delete" ON public.cistern_levels
    FOR DELETE TO authenticated
    USING (public.get_user_role() = 'admin');

-- Products
CREATE POLICY "authenticated_read" ON public.products
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "managers_insert" ON public.products
    FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('admin', 'manager'));

CREATE POLICY "managers_update" ON public.products
    FOR UPDATE TO authenticated
    USING (public.get_user_role() IN ('admin', 'manager'));

CREATE POLICY "admin_delete" ON public.products
    FOR DELETE TO authenticated
    USING (public.get_user_role() = 'admin');

-- Stock Movements
CREATE POLICY "authenticated_read" ON public.stock_movements
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "operators_insert" ON public.stock_movements
    FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('admin', 'manager', 'operator'));

CREATE POLICY "admin_delete" ON public.stock_movements
    FOR DELETE TO authenticated
    USING (public.get_user_role() = 'admin');

-- Assets
CREATE POLICY "authenticated_read" ON public.assets
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "managers_insert" ON public.assets
    FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('admin', 'manager'));

CREATE POLICY "managers_update" ON public.assets
    FOR UPDATE TO authenticated
    USING (public.get_user_role() IN ('admin', 'manager'));

CREATE POLICY "admin_delete" ON public.assets
    FOR DELETE TO authenticated
    USING (public.get_user_role() = 'admin');

-- Pump Readings
CREATE POLICY "authenticated_read" ON public.pump_readings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "operators_insert" ON public.pump_readings
    FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('admin', 'manager', 'operator'));

CREATE POLICY "admin_delete" ON public.pump_readings
    FOR DELETE TO authenticated
    USING (public.get_user_role() = 'admin');

-- Maintenance Records
CREATE POLICY "authenticated_read" ON public.maintenance_records
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "operators_insert" ON public.maintenance_records
    FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('admin', 'manager', 'operator'));

CREATE POLICY "managers_update" ON public.maintenance_records
    FOR UPDATE TO authenticated
    USING (public.get_user_role() IN ('admin', 'manager'));

CREATE POLICY "admin_delete" ON public.maintenance_records
    FOR DELETE TO authenticated
    USING (public.get_user_role() = 'admin');

-- Service Requests
CREATE POLICY "authenticated_read" ON public.service_requests
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "operators_insert" ON public.service_requests
    FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('admin', 'manager', 'operator'));

CREATE POLICY "managers_update" ON public.service_requests
    FOR UPDATE TO authenticated
    USING (public.get_user_role() IN ('admin', 'manager'));

CREATE POLICY "admin_delete" ON public.service_requests
    FOR DELETE TO authenticated
    USING (public.get_user_role() = 'admin');

-- User Profiles (admin only)
CREATE POLICY "admin_only" ON public.user_profiles
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'admin');

-- Audit Logs (read-only via policy)
CREATE POLICY "read_only_audit" ON public.audit_logs
    FOR SELECT TO authenticated USING (true);

-- Checklist Templates
CREATE POLICY "authenticated_read" ON public.checklist_templates
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "managers_insert" ON public.checklist_templates
    FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('admin', 'manager'));

CREATE POLICY "managers_update" ON public.checklist_templates
    FOR UPDATE TO authenticated
    USING (public.get_user_role() IN ('admin', 'manager'));

CREATE POLICY "admin_delete" ON public.checklist_templates
    FOR DELETE TO authenticated
    USING (public.get_user_role() = 'admin');

-- Checklists
CREATE POLICY "authenticated_read" ON public.checklists
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "operators_insert" ON public.checklists
    FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('admin', 'manager', 'operator'));

CREATE POLICY "managers_update" ON public.checklists
    FOR UPDATE TO authenticated
    USING (public.get_user_role() IN ('admin', 'manager'));

CREATE POLICY "admin_delete" ON public.checklists
    FOR DELETE TO authenticated
    USING (public.get_user_role() = 'admin');

-- Checklist Items
CREATE POLICY "authenticated_read" ON public.checklist_items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "operators_insert" ON public.checklist_items
    FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('admin', 'manager', 'operator'));

CREATE POLICY "managers_update" ON public.checklist_items
    FOR UPDATE TO authenticated
    USING (public.get_user_role() IN ('admin', 'manager'));

CREATE POLICY "admin_delete" ON public.checklist_items
    FOR DELETE TO authenticated
    USING (public.get_user_role() = 'admin');

-- Daily Reports
CREATE POLICY "authenticated_read" ON public.daily_reports
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "managers_insert" ON public.daily_reports
    FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('admin', 'manager'));

CREATE POLICY "managers_update" ON public.daily_reports
    FOR UPDATE TO authenticated
    USING (public.get_user_role() IN ('admin', 'manager'));

CREATE POLICY "admin_delete" ON public.daily_reports
    FOR DELETE TO authenticated
    USING (public.get_user_role() = 'admin');

-- System Config
CREATE POLICY "managers_read" ON public.system_config
    FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('admin', 'manager'));

CREATE POLICY "admin_manage" ON public.system_config
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'admin');

-- Alert Rules
CREATE POLICY "managers_read" ON public.alert_rules
    FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('admin', 'manager'));

CREATE POLICY "admin_manage" ON public.alert_rules
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'admin');

-- Alert History
CREATE POLICY "managers_read" ON public.alert_history
    FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('admin', 'manager'));

CREATE POLICY "system_insert" ON public.alert_history
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "managers_acknowledge" ON public.alert_history
    FOR UPDATE TO authenticated
    USING (public.get_user_role() IN ('admin', 'manager'));

-- =============================================
-- AUDIT TRIGGER FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate triggers (safe re-run)
DROP TRIGGER IF EXISTS audit_user_profiles ON public.user_profiles;
CREATE TRIGGER audit_user_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_lab_analyses ON public.lab_analyses;
CREATE TRIGGER audit_lab_analyses
    AFTER INSERT OR UPDATE OR DELETE ON public.lab_analyses
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_stock_movements ON public.stock_movements;
CREATE TRIGGER audit_stock_movements
    AFTER INSERT OR UPDATE OR DELETE ON public.stock_movements
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_service_requests ON public.service_requests;
CREATE TRIGGER audit_service_requests
    AFTER INSERT OR UPDATE OR DELETE ON public.service_requests
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
