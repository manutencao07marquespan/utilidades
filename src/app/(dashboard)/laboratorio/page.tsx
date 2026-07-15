'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { AnalysisTable } from '@/components/laboratorio/analysis-table'
import { PHTurbidityChart } from '@/components/laboratorio/ph-turbidity-chart'
import { DecantationEfficiencyChart } from '@/components/laboratorio/decantation-efficiency-chart'
import { StatsCard } from '@/components/shared/stats-card'
import { FlaskConical, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'

export default function LaboratorioPage() {
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchAnalyses()
  }, [])

  async function fetchAnalyses() {
    const { data, error } = await supabase
      .from('lab_analyses')
      .select('*')
      .order('analysis_date', { ascending: false })
      .limit(50)

    if (data) {
      setAnalyses(data)
    }
    setLoading(false)
  }

  // Calculate stats
  const latestPH = analyses[0]?.ph || 0
  const latestTurbidity = analyses[0]?.turbidity || 0
  const avgEfficiency = analyses.length > 0
    ? analyses.reduce((sum, a) => sum + (a.decantation_efficiency || 0), 0) / analyses.length
    : 0
  const alertsCount = analyses.filter(a => a.ph && (a.ph < 6 || a.ph > 9)).length

  // Prepare chart data
  const chartData = analyses.slice(0, 10).reverse().map(a => ({
    date: new Date(a.analysis_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    ph: a.ph || 0,
    turbidity: a.turbidity || 0,
    point: a.collection_point,
  }))

  const efficiencyData = analyses.slice(0, 10).reverse().map(a => ({
    date: new Date(a.analysis_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    efficiency: a.decantation_efficiency || 0,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laboratório & Análises"
        description="Controle de qualidade da água"
        action={{
          label: 'Nova Análise',
          href: '/laboratorio/nova',
        }}
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="pH Atual"
          value={latestPH.toFixed(2)}
          subtitle={latestPH >= 6 && latestPH <= 9 ? 'Na faixa ideal' : 'Fora da faixa'}
          icon={FlaskConical}
          variant={latestPH >= 6 && latestPH <= 9 ? 'success' : 'danger'}
        />
        <StatsCard
          title="Turbidez Atual"
          value={`${latestTurbidity.toFixed(1)} NTU`}
          subtitle="última medição"
          icon={TrendingUp}
        />
        <StatsCard
          title="Eficiência Média"
          value={`${avgEfficiency.toFixed(1)}%`}
          subtitle="de decantação"
          icon={CheckCircle}
          variant={avgEfficiency > 90 ? 'success' : 'warning'}
        />
        <StatsCard
          title="Alertas"
          value={alertsCount}
          subtitle="pH fora da faixa"
          icon={AlertTriangle}
          variant={alertsCount > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Tabela</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table" className="space-y-4">
          <AnalysisTable data={analyses} />
        </TabsContent>
        
        <TabsContent value="charts" className="space-y-4">
          <div className="grid gap-5 md:grid-cols-2">
            <PHTurbidityChart data={chartData} />
            <DecantationEfficiencyChart data={efficiencyData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
