-- ============================================
-- Sistema Meteorológico
-- Portal das Utilidades - ETE
-- ============================================

-- 1. Previsões Meteorológicas
CREATE TABLE IF NOT EXISTS public.weather_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_date DATE NOT NULL,
  forecast_hour INTEGER DEFAULT 0,
  temperature NUMERIC(5,2),
  temperature_min NUMERIC(5,2),
  temperature_max NUMERIC(5,2),
  humidity NUMERIC(5,2),
  wind_speed NUMERIC(5,2),
  wind_direction TEXT,
  precipitation_probability NUMERIC(5,2),
  precipitation_mm NUMERIC(8,2),
  weather_condition TEXT,
  weather_icon TEXT,
  weather_description TEXT,
  pressure NUMERIC(7,2),
  visibility NUMERIC(5,2),
  cloud_cover NUMERIC(5,2),
  sunrise TIME,
  sunset TIME,
  alert_level TEXT DEFAULT 'none' CHECK (alert_level IN ('none', 'low', 'moderate', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Alertas Meteorológicos
CREATE TABLE IF NOT EXISTS public.weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('rain', 'storm', 'flood', 'heat', 'cold', 'wind')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  recommendation TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Impactos Operacionais
CREATE TABLE IF NOT EXISTS public.operational_impacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_id UUID REFERENCES public.weather_forecasts(id) ON DELETE CASCADE,
  predicted_flow NUMERIC(10,2),
  predicted_flow_change_percent NUMERIC(5,2),
  predicted_chemical_consumption JSONB,
  predicted_sludge NUMERIC(10,2),
  risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  impact_description TEXT,
  recommended_actions JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Histórico Climático (para análises)
CREATE TABLE IF NOT EXISTS public.weather_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_date DATE NOT NULL,
  record_hour INTEGER DEFAULT 0,
  temperature NUMERIC(5,2),
  humidity NUMERIC(5,2),
  precipitation_mm NUMERIC(8,2),
  wind_speed NUMERIC(5,2),
  weather_condition TEXT,
  flow_rate NUMERIC(10,2),
  water_level NUMERIC(5,2),
  ph_value NUMERIC(4,2),
  turbidity NUMERIC(8,2),
  efficiency NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. RLS Policies
ALTER TABLE public.weather_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_impacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_history ENABLE ROW LEVEL SECURITY;

-- Forecasts: read for all, write for admin
CREATE POLICY "weather_forecasts_read" ON public.weather_forecasts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "weather_forecasts_write" ON public.weather_forecasts
  FOR ALL TO authenticated USING (public.has_min_role('Admin'));

-- Alerts: read for all, write for admin
CREATE POLICY "weather_alerts_read" ON public.weather_alerts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "weather_alerts_write" ON public.weather_alerts
  FOR ALL TO authenticated USING (public.has_min_role('Admin'));

-- Impacts: read for all, write for admin
CREATE POLICY "operational_impacts_read" ON public.operational_impacts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "operational_impacts_write" ON public.operational_impacts
  FOR ALL TO authenticated USING (public.has_min_role('Admin'));

-- History: read for all, write for admin
CREATE POLICY "weather_history_read" ON public.weather_history
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "weather_history_write" ON public.weather_history
  FOR ALL TO authenticated USING (public.has_min_role('Admin'));

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_weather_forecasts_date ON public.weather_forecasts(forecast_date);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_active ON public.weather_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_weather_history_date ON public.weather_history(record_date);
CREATE INDEX IF NOT EXISTS idx_operational_impacts_forecast ON public.operational_impacts(forecast_id);

-- 7. Function to calculate operational impact
CREATE OR REPLACE FUNCTION public.calculate_operational_impact(
  p_precipitation_mm NUMERIC
) RETURNS TABLE (
  risk_level TEXT,
  flow_change_percent NUMERIC,
  pac_change_percent NUMERIC,
  polymer_change_percent NUMERIC,
  recommendation TEXT
) AS $$
BEGIN
  IF p_precipitation_mm >= 50 THEN
    risk_level := 'critical';
    flow_change_percent := 35;
    pac_change_percent := 20;
    polymer_change_percent := 15;
    recommendation := 'Evitar abertura de leitos. Verificar bombas e drenagem. Aumentar monitoramento.';
  ELSIF p_precipitation_mm >= 25 THEN
    risk_level := 'high';
    flow_change_percent := 25;
    pac_change_percent := 15;
    polymer_change_percent := 12;
    recommendation := 'Verificar bacia de amortecimento e decantadores. Monitorar bombas.';
  ELSIF p_precipitation_mm >= 10 THEN
    risk_level := 'moderate';
    flow_change_percent := 15;
    pac_change_percent := 10;
    polymer_change_percent := 8;
    recommendation := 'Monitorar níveis. Verificar equipamentos de drenagem.';
  ELSE
    risk_level := 'low';
    flow_change_percent := 0;
    pac_change_percent := 0;
    polymer_change_percent := 0;
    recommendation := 'Operação normal.';
  END IF;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
