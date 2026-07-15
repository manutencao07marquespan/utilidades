'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { KPICard } from '@/components/indicadores/kpi-card'
import { KPIGauge } from '@/components/indicadores/kpi-gauge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Droplets, Activity, Gauge, Zap, DollarSign, Clock,
  Beaker, TrendingUp, BarChart3, AlertTriangle, CheckCircle, Wrench
} from 'lucide-react'

export default function IndicadoresPage() {
  const [kpis, setKpis] = useState({
    waterConsumption: 0,
    treatmentEfficiency: 0,
    equipmentAvailability: 0,
    mtbf: 0,
    mttr: 0,
    chemicalConsumption: 0,
    production: 0,
    flowRate: 0,
    energy: 0,
    costs: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    calculateKPIs()
  }, [])

  async function calculateKPIs() {
    setLoading(true)

    try {
      // Fetch data
      const [hydrants, analyses, assets, orders, stock] = await Promise.all([
        supabase.from('hydrant_readings').select('reading_value, previous_reading, reading_date'),
        supabase.from('lab_analyses').select('ph, decantation_efficiency, analysis_date'),
        supabase.from('assets').select('status'),
        supabase.from('maintenance_orders').select('status, opened_at, finished_at, hours_worked'),
        supabase.from('stock_movements').select('quantity, unit_price, movement_type, products(name, unit)'),
      ])

      // Calculate water consumption (m³/day average)
      const hydrantData = hydrants.data || []
      const totalConsumption = hydrantData.reduce((sum: number, h: any) => {
        return sum + (h.reading_value - (h.previous_reading || 0))
      }, 0)
      const days = new Set(hydrantData.map((h: any) => h.reading_date)).size || 1
      const waterConsumption = totalConsumption / days

      // Calculate treatment efficiency
      const analysisData = analyses.data || []
      const avgEfficiency = analysisData.length > 0
        ? analysisData.reduce((sum: number, a: any) => sum + (a.decantation_efficiency || 0), 0) / analysisData.length
        : 95

      // Calculate equipment availability
      const assetData = assets.data || []
      const activeAssets = assetData.filter((a: any) => a.status === 'active').length
      const equipmentAvailability = assetData.length > 0
        ? (activeAssets / assetData.length) * 100
        : 100

      // Calculate MTBF and MTTR from maintenance orders
      const orderData = orders.data || []
      const completedOrders = orderData.filter((o: any) => o.status === 'completed')
      const avgHoursWorked = completedOrders.length > 0
        ? completedOrders.reduce((sum: number, o: any) => sum + (o.hours_worked || 0), 0) / completedOrders.length
        : 8
      const mtbf = 720 // Default - would need historical data
      const mttr = avgHoursWorked

      // Calculate chemical consumption (kg/m³)
      const stockData = stock.data || []
      const totalChemicals = stockData
        .filter((s: any) => s.movement_type === 'exit')
        .reduce((sum: number, s: any) => sum + (s.quantity || 0), 0)
      const chemicalConsumption = waterConsumption > 0
        ? totalChemicals / waterConsumption
        : 0.3

      // Production (m³/day)
      const production = waterConsumption * 0.85 // 85% of input becomes treated output

      // Flow rate (m³/h)
      const flowRate = waterConsumption / 24

      // Energy consumption (kWh/m³) - estimated
      const energy = 0.6 // Would need meter data

      // Costs (R$/m³) - estimated
      const costs = waterConsumption > 0
        ? stockData
            .filter((s: any) => s.movement_type === 'exit')
            .reduce((sum: number, s: any) => sum + ((s.quantity || 0) * (s.unit_price || 0)), 0) / waterConsumption
        : 3.5

      setKpis({
        waterConsumption,
        treatmentEfficiency: avgEfficiency,
        equipmentAvailability,
        mtbf,
        mttr,
        chemicalConsumption,
        production,
        flowRate,
        energy,
        costs,
      })
    } catch (error) {
      console.error('Error calculating KPIs:', error)
    } finally {
      setLoading(false)
    }
  }

  function getKPIStatus(value: number, min: number, max: number, invert = false): 'good' | 'warning' | 'critical' {
    if (invert) {
      if (value <= min) return 'good'
      if (value <= max) return 'warning'
      return 'critical'
    }
    if (value >= max) return 'good'
    if (value >= min) return 'warning'
    return 'critical'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-muted border-t-accent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Indicadores (KPIs)"
        description="Indicadores de desempenho da operação da ETE"
      />

      {/* KPIs Principais */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Consumo de Água"
          value={kpis.waterConsumption.toFixed(0)}
          unit="m³/dia"
          target="< 1500 m³/dia"
          icon={Droplets}
          status={kpis.waterConsumption < 1500 ? 'good' : kpis.waterConsumption < 1800 ? 'warning' : 'critical'}
          description="Média diária de entrada de água"
        />

        <KPICard
          title="Eficiência Tratamento"
          value={kpis.treatmentEfficiency.toFixed(1)}
          unit="%"
          target="> 95%"
          icon={Beaker}
          trend="up"
          trendValue={2.3}
          status={kpis.treatmentEfficiency >= 95 ? 'good' : kpis.treatmentEfficiency >= 90 ? 'warning' : 'critical'}
          description="Eficiência média de remoção de impurezas"
        />

        <KPICard
          title="Disponibilidade"
          value={kpis.equipmentAvailability.toFixed(1)}
          unit="%"
          target="> 98%"
          icon={Wrench}
          status={kpis.equipmentAvailability >= 98 ? 'good' : kpis.equipmentAvailability >= 95 ? 'warning' : 'critical'}
          description="Percentual de equipamentos ativos"
        />

        <KPICard
          title="Produção"
          value={kpis.production.toFixed(0)}
          unit="m³/dia"
          target="> 1000 m³/dia"
          icon={BarChart3}
          trend="up"
          trendValue={5.2}
          status={kpis.production >= 1000 ? 'good' : kpis.production >= 800 ? 'warning' : 'critical'}
          description="Volume de efluente tratado"
        />
      </div>

      {/* KPIs Secundários */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="MTBF"
          value={kpis.mtbf.toFixed(0)}
          unit="horas"
          target="> 2000 horas"
          icon={Clock}
          status={kpis.mtbf >= 2000 ? 'good' : kpis.mtbf >= 1000 ? 'warning' : 'critical'}
          description="Tempo médio entre falhas"
        />

        <KPICard
          title="MTTR"
          value={kpis.mttr.toFixed(1)}
          unit="horas"
          target="< 24 horas"
          icon={Activity}
          status={kpis.mttr <= 24 ? 'good' : kpis.mttr <= 48 ? 'warning' : 'critical'}
          description="Tempo médio de reparo"
        />

        <KPICard
          title="Consumo Químicos"
          value={kpis.chemicalConsumption.toFixed(2)}
          unit="kg/m³"
          target="< 0.5 kg/m³"
          icon={Beaker}
          status={kpis.chemicalConsumption <= 0.5 ? 'good' : kpis.chemicalConsumption <= 0.7 ? 'warning' : 'critical'}
          description="Consumo de produtos químicos por m³"
        />

        <KPICard
          title="Custos"
          value={kpis.costs.toFixed(2)}
          unit="R$/m³"
          target="< R$ 5,00/m³"
          icon={DollarSign}
          status={kpis.costs <= 5 ? 'good' : kpis.costs <= 7 ? 'warning' : 'critical'}
          description="Custo operacional por m³ tratado"
        />
      </div>

      {/* Gauges */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <KPIGauge
          title="Vazão Atual"
          value={kpis.flowRate}
          min={0}
          max={500}
          target={350}
          unit="m³/h"
          status={kpis.flowRate >= 300 && kpis.flowRate <= 400 ? 'good' : 'warning'}
        />

        <KPIGauge
          title="Consumo Energético"
          value={kpis.energy}
          min={0}
          max={1.5}
          target={0.8}
          unit="kWh/m³"
          status={kpis.energy <= 0.8 ? 'good' : kpis.energy <= 1.0 ? 'warning' : 'critical'}
        />

        <KPIGauge
          title="Eficiência Tratamento"
          value={kpis.treatmentEfficiency}
          min={0}
          max={100}
          target={95}
          unit="%"
          status={kpis.treatmentEfficiency >= 95 ? 'good' : kpis.treatmentEfficiency >= 90 ? 'warning' : 'critical'}
        />
      </div>

      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-[#28A745]" />
            Resumo Operacional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#28A745]/5 border border-[#28A745]/20">
              <p className="text-sm text-muted-foreground">KPIs no Meta</p>
              <p className="text-2xl font-bold text-[#28A745]">
                {[kpis.waterConsumption < 1500, kpis.treatmentEfficiency >= 95, kpis.equipmentAvailability >= 98, kpis.production >= 1000, kpis.mtbf >= 2000, kpis.mttr <= 24, kpis.chemicalConsumption <= 0.5, kpis.costs <= 5].filter(Boolean).length}
              </p>
              <p className="text-xs text-muted-foreground">de 8 indicadores</p>
            </div>

            <div className="p-4 rounded-xl bg-[#FFC107]/5 border border-[#FFC107]/20">
              <p className="text-sm text-muted-foreground">Em Atenção</p>
              <p className="text-2xl font-bold text-[#FFC107]">
                {[kpis.waterConsumption >= 1500 && kpis.waterConsumption < 1800, kpis.treatmentEfficiency >= 90 && kpis.treatmentEfficiency < 95, kpis.equipmentAvailability >= 95 && kpis.equipmentAvailability < 98].filter(Boolean).length}
              </p>
              <p className="text-xs text-muted-foreground">indicadores</p>
            </div>

            <div className="p-4 rounded-xl bg-[#DC3545]/5 border border-[#DC3545]/20">
              <p className="text-sm text-muted-foreground">Críticos</p>
              <p className="text-2xl font-bold text-[#DC3545]">
                {[kpis.waterConsumption >= 1800, kpis.treatmentEfficiency < 90, kpis.equipmentAvailability < 95].filter(Boolean).length}
              </p>
              <p className="text-xs text-muted-foreground">indicadores</p>
            </div>

            <div className="p-4 rounded-xl bg-[#00b4d8]/5 border border-[#00b4d8]/20">
              <p className="text-sm text-muted-foreground">Índice Geral</p>
              <p className="text-2xl font-bold text-[#00b4d8]">
                {((kpis.treatmentEfficiency + kpis.equipmentAvailability + Math.min(100, (kpis.production / 1000) * 100)) / 3).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">de performance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
