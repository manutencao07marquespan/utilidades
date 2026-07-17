import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsCard } from '@/components/shared/stats-card'
import { DashboardGrid, DashboardGridItem } from '@/components/dashboard/dashboard-grid'
import { PageHeader } from '@/components/shared/page-header'
import { Activity, Droplets, AlertTriangle, CheckCircle, Gauge, BarChart3, Cloud } from 'lucide-react'
import {
  LazyWeatherCard,
  LazyWeatherForecastCard,
  LazyOperationalImpactCard,
  LazyWaterBalanceChart,
  LazyPumpStatusCard,
  LazyCriticalAlertsPanel,
  LazyCisternSimulator,
  LazyHydrantSimulator,
  LazyProductionSummary,
} from '@/components/dashboard/lazy-widgets'

export const dynamic = 'force-dynamic'

const CISTERN_CONFIG: Record<string, { capacity: number; shortName: string }> = {
  'BACIA AMORTECIMENTO - 296 M³': { capacity: 296, shortName: 'BACIA AMORT.' },
  'CISTERNA LAVAGEM - 320 M³': { capacity: 320, shortName: 'CIST. LAVAGEM' },
  'CISTERNA E. BRUTO - 440 M³': { capacity: 440, shortName: 'CIST. E. BRUTO' },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: pumps },
    { data: alerts },
    { data: cisterns },
    { data: analyses },
    { data: hydrants },
  ] = await Promise.all([
    supabase.from('assets').select('*').eq('type', 'pump').limit(10),
    supabase.from('alert_history').select('*').eq('acknowledged', false).order('triggered_at', { ascending: false }).limit(5),
    supabase.from('cistern_levels').select('*').order('reading_date', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('lab_analyses').select('*').order('analysis_date', { ascending: false }).limit(10),
    supabase.from('hydrant_readings').select('*').order('reading_date', { ascending: false }).order('created_at', { ascending: false }),
  ])

  const activePumps = pumps?.filter((p: any) => p.status === 'active').length || 0
  const totalPumps = pumps?.length || 0
  const activeAlerts = alerts?.length || 0

  const cisternMap = new Map<string, any>()
  cisterns?.forEach((c: any) => {
    if (!cisternMap.has(c.cistern_code)) cisternMap.set(c.cistern_code, c)
  })
  const uniqueCisterns = Array.from(cisternMap.entries()).map(([code, data]) => ({
    code,
    config: CISTERN_CONFIG[code] || { capacity: 500, shortName: code },
    level: data.level_percentage || 0,
  }))

  const latestPH = analyses?.[0]?.ph || 0

  const hydrantMap = new Map<string, any>()
  hydrants?.forEach((h: any) => {
    if (!hydrantMap.has(h.hydrant_code)) hydrantMap.set(h.hydrant_code, h)
  })
  const uniqueHydrants = Array.from(hydrantMap.values()).slice(0, 3)

  const waterBalanceData = [
    { date: 'Seg', input: 1200, output: 1150 },
    { date: 'Ter', input: 1180, output: 1120 },
    { date: 'Qua', input: 1250, output: 1200 },
    { date: 'Qui', input: 1190, output: 1140 },
    { date: 'Sex', input: 1220, output: 1180 },
    { date: 'Sáb', input: 1100, output: 1050 },
    { date: 'Dom', input: 980, output: 940 },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Visão geral do sistema de controle da ETE" />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Bombas Ativas" value={`${activePumps}/${totalPumps}`} subtitle="de total" icon={Activity} variant={activePumps === totalPumps ? 'success' : 'warning'} />
        <StatsCard title="Alertas Ativos" value={activeAlerts} subtitle="requer atenção" icon={AlertTriangle} variant={activeAlerts > 0 ? 'danger' : 'success'} />
        <StatsCard title="pH Atual" value={latestPH.toFixed(2)} subtitle={latestPH >= 6 && latestPH <= 9 ? 'Na faixa ideal' : 'Fora da faixa'} icon={CheckCircle} variant={latestPH >= 6 && latestPH <= 9 ? 'success' : 'danger'} />
        <StatsCard title="Análises Hoje" value={analyses?.length || 0} subtitle="registros" icon={BarChart3} variant="default" />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <LazyWeatherCard />
        <LazyWeatherForecastCard />
        <LazyOperationalImpactCard />
      </div>

      <DashboardGrid>
        <DashboardGridItem span={2}>
          <LazyWaterBalanceChart data={waterBalanceData} />
        </DashboardGridItem>
        <DashboardGridItem>
          <LazyPumpStatusCard pumps={pumps || []} />
        </DashboardGridItem>
        <DashboardGridItem>
          <LazyCriticalAlertsPanel alerts={alerts || []} />
        </DashboardGridItem>

        {uniqueCisterns.length > 0 ? (
          uniqueCisterns.map((cistern) => (
            <DashboardGridItem key={cistern.code}>
              <LazyCisternSimulator code={cistern.config.shortName} level={cistern.level} capacity={cistern.config.capacity} currentVolume={(cistern.level / 100) * cistern.config.capacity} />
            </DashboardGridItem>
          ))
        ) : (
          <>
            <DashboardGridItem><LazyCisternSimulator code="BACIA AMORT." level={0} capacity={296} currentVolume={0} /></DashboardGridItem>
            <DashboardGridItem><LazyCisternSimulator code="CIST. LAVAGEM" level={85} capacity={320} currentVolume={272} /></DashboardGridItem>
            <DashboardGridItem><LazyCisternSimulator code="CIST. E. BRUTO" level={65} capacity={440} currentVolume={286} /></DashboardGridItem>
          </>
        )}

        {uniqueHydrants.length > 0 ? (
          uniqueHydrants.map((hydrant: any) => (
            <DashboardGridItem key={hydrant.id}>
              <LazyHydrantSimulator code={hydrant.hydrant_code} currentValue={hydrant.reading_value || 0} dailyAverage={hydrant.previous_reading || 0} />
            </DashboardGridItem>
          ))
        ) : (
          <>
            <DashboardGridItem><LazyHydrantSimulator code="HID-ENTRADA" currentValue={1250} dailyAverage={1180} /></DashboardGridItem>
            <DashboardGridItem><LazyHydrantSimulator code="HID-SAÍDA" currentValue={1100} dailyAverage={1050} /></DashboardGridItem>
          </>
        )}

        <DashboardGridItem span={2}>
          <LazyProductionSummary totalInput={1200} totalOutput={1150} averageRetentionTime={8.5} efficiency={95.8} />
        </DashboardGridItem>
      </DashboardGrid>
    </div>
  )
}
