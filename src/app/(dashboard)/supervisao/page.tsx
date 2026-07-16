'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/shared/stats-card'
import { StatusIndicator } from '@/components/shared/status-indicator'
import {
  Activity, Droplets, AlertTriangle, CheckCircle, Clock, Package,
  TrendingUp, TrendingDown, Users, BarChart3, Gauge, Wrench,
  Thermometer, Eye, CloudRain, DollarSign, Target
} from 'lucide-react'
import { cn } from '@/lib/cn'

export default function SupervisaoPage() {
  const [stats, setStats] = useState({
    production: 0,
    productionTarget: 1000,
    efficiency: 0,
    openOS: 0,
    inProgressOS: 0,
    completedOS: 0,
    overdueOS: 0,
    criticalNC: 0,
    highNC: 0,
    mediumNC: 0,
    lowNC: 0,
    costToday: 0,
    costMonth: 0,
    costPerM3: 0,
    checklistsExecuted: 0,
    avgChecklistTime: 0,
    avgOSTime: 0,
    equipmentAvailability: 0,
  })
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [turnoAtual, setTurnoAtual] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
    setTurnoAtual(getCurrentShift())
  }, [])

  function getCurrentShift() {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 18) return '1A'
    return '1B'
  }

  async function fetchDashboardData() {
    setLoading(true)
    try {
      const [osData, ncData, stockData, checklistData, equipmentData] = await Promise.all([
        supabase.from('maintenance_orders').select('status, opened_at, finished_at'),
        supabase.from('checklist_executions').select('has_non_conformity, non_conformity_count'),
        supabase.from('products').select('current_stock, min_stock, name').eq('is_active', true),
        supabase.from('checklist_executions').select('started_at, finished_at, status').eq('status', 'completed'),
        supabase.from('assets').select('status'),
      ])

      // OS stats
      if (osData.data) {
        const os = osData.data
        setStats(prev => ({
          ...prev,
          openOS: os.filter((o: any) => o.status === 'open').length,
          inProgressOS: os.filter((o: any) => o.status === 'in_progress').length,
          completedOS: os.filter((o: any) => o.status === 'completed').length,
          overdueOS: os.filter((o: any) => {
            if (o.status === 'completed' || o.status === 'cancelled') return false
            const opened = new Date(o.opened_at)
            const daysSince = (Date.now() - opened.getTime()) / (1000 * 60 * 60 * 24)
            return daysSince > 7
          }).length,
        }))
      }

      // NC stats
      if (ncData.data) {
        const nc = ncData.data
        setStats(prev => ({
          ...prev,
          criticalNC: nc.filter((n: any) => n.has_non_conformity).length,
        }))
      }

      // Stock alerts
      if (stockData.data) {
        const critical = stockData.data.filter((p: any) => p.current_stock <= p.min_stock * 0.3)
        setAlerts(prev => [
          ...prev,
          ...critical.map((p: any) => ({
            type: 'stock',
            message: `${p.name} - Estoque baixo (${p.current_stock})`,
            severity: 'warning',
          }))
        ])
      }

      // Checklist stats
      if (checklistData.data) {
        const completed = checklistData.data
        const avgTime = completed.reduce((sum: number, c: any) => {
          if (c.started_at && c.finished_at) {
            return sum + (new Date(c.finished_at).getTime() - new Date(c.started_at).getTime()) / 1000 / 60
          }
          return sum
        }, 0) / (completed.length || 1)

        setStats(prev => ({
          ...prev,
          checklistsExecuted: completed.length,
          avgChecklistTime: Math.round(avgTime),
        }))
      }

      // Equipment availability
      if (equipmentData.data) {
        const total = equipmentData.data.length
        const active = equipmentData.data.filter((e: any) => e.status === 'active').length
        setStats(prev => ({
          ...prev,
          equipmentAvailability: total > 0 ? Math.round((active / total) * 100) : 100,
        }))
      }

      // Mock operational data
      setStats(prev => ({
        ...prev,
        production: 985,
        efficiency: 94,
        costToday: 4820,
        costMonth: 128000,
        costPerM3: 0.92,
        avgOSTime: 4.5,
      }))

      // Mock weather alerts
      setAlerts(prev => [
        ...prev,
        { type: 'weather', message: 'Chuva prevista 92% - Impacto Alto', severity: 'critical' },
      ])

    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  function getEfficiencyStars(eff: number) {
    if (eff >= 95) return 5
    if (eff >= 90) return 4
    if (eff >= 80) return 3
    if (eff >= 70) return 2
    return 1
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-muted border-t-accent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel da Supervisão"
        description="Centro de Operações da ETE"
      />

      {/* Header Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Última atualização: {new Date().toLocaleString('pt-BR')}</span>
        <span>Turno Atual: <strong className="text-foreground">{turnoAtual}</strong></span>
      </div>

      {/* Main Stats */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Produção"
          value={`${stats.production} m³`}
          subtitle={`Meta: ${stats.productionTarget} m³ (${Math.round(stats.production / stats.productionTarget * 100)}%)`}
          icon={Droplets}
          variant={stats.production >= stats.productionTarget ? 'success' : 'warning'}
        />
        <StatsCard
          title="Eficiência"
          value={`${stats.efficiency}%`}
          subtitle={`${getEfficiencyStars(stats.efficiency)} estrelas`}
          icon={Target}
          variant={stats.efficiency >= 90 ? 'success' : stats.efficiency >= 80 ? 'warning' : 'danger'}
        />
        <StatsCard
          title="OS Abertas"
          value={stats.openOS}
          subtitle={`${stats.inProgressOS} em andamento`}
          icon={Wrench}
          variant={stats.openOS > 10 ? 'danger' : stats.openOS > 5 ? 'warning' : 'success'}
        />
        <StatsCard
          title="Não Conformidades"
          value={stats.criticalNC}
          subtitle="críticas"
          icon={AlertTriangle}
          variant={stats.criticalNC > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Custos Hoje"
          value={`R$ ${stats.costToday.toLocaleString('pt-BR')}`}
          subtitle={`Mês: R$ ${stats.costMonth.toLocaleString('pt-BR')}`}
          icon={DollarSign}
          variant="default"
        />
        <StatsCard
          title="Custo por m³"
          value={`R$ ${stats.costPerM3.toFixed(2)}`}
          subtitle="custo operacional"
          icon={TrendingUp}
          variant={stats.costPerM3 <= 1 ? 'success' : 'warning'}
        />
        <StatsCard
          title="Checklists Hoje"
          value={stats.checklistsExecuted}
          subtitle={`Tempo médio: ${stats.avgChecklistTime}min`}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Disponibilidade"
          value={`${stats.equipmentAvailability}%`}
          subtitle="equipamentos ativos"
          icon={Gauge}
          variant={stats.equipmentAvailability >= 95 ? 'success' : 'warning'}
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* KPIs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 text-[#1A3A5A]" />
              Indicadores de Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'MTBF', value: '480h', icon: Clock },
                { label: 'MTTR', value: '1.8h', icon: Wrench },
                { label: 'Consumo PAC', value: '-3%', icon: TrendingDown, color: 'text-[#28A745]' },
                { label: 'Consumo Energia', value: '+5%', icon: TrendingUp, color: 'text-[#DC3545]' },
                { label: 'Eficiência Turno', value: '94%', icon: Target },
                { label: 'Eficiência Mensal', value: '92%', icon: Target },
                { label: 'Retrabalho', value: '2%', icon: AlertTriangle, color: 'text-[#FFC107]' },
                { label: 'Manutenção Prev.', value: '85%', icon: CheckCircle },
              ].map((kpi, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/30 text-center">
                  <kpi.icon className={cn('h-5 w-5 mx-auto mb-1', kpi.color || 'text-muted-foreground')} />
                  <p className="text-lg font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alarmes */}
        <Card className="border-l-4 border-l-[#DC3545]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-[#DC3545]" />
              Alarmes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum alarme ativo</p>
              ) : (
                alerts.slice(0, 5).map((alert, i) => (
                  <div key={i} className={cn(
                    'p-2 rounded-lg text-sm border-l-4',
                    alert.severity === 'critical' && 'border-l-[#DC3545] bg-[#DC3545]/5',
                    alert.severity === 'warning' && 'border-l-[#FFC107] bg-[#FFC107]/5',
                    alert.severity === 'info' && 'border-l-[#00b4d8] bg-[#00b4d8]/5',
                  )}>
                    {alert.message}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Centro de Decisão */}
        <Card className="lg:col-span-2 border-l-4 border-l-[#00b4d8]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-[#00b4d8]" />
              Centro de Decisão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-[#00b4d8]/5 border border-[#00b4d8]/20">
              <p className="font-medium text-sm mb-2">Recomendações Operacionais</p>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-[#28A745]" />
                  Verificar gradeamento de entrada (chuva prevista)
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-[#28A745]" />
                  Confirmar disponibilidade da bomba reserva
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-[#28A745]" />
                  Suspender abertura de leitos de secagem
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-[#28A745]" />
                  Conferir estoque de PAC e polímero
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-[#28A745]" />
                  Aumentar monitoramento de pH e turbidez
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Equipamentos com Mais Manutenção */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wrench className="h-4 w-4 text-[#FFC107]" />
              Top Equipamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Bomba 03', issues: 8, trend: 'up' },
                { name: 'Decantador 02', issues: 5, trend: 'up' },
                { name: 'Bomba 01', issues: 3, trend: 'down' },
                { name: 'Gradeamento', issues: 2, trend: 'stable' },
              ].map((eq, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}.</span>
                    <span className="text-sm">{eq.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{eq.issues}</span>
                    {eq.trend === 'up' && <TrendingUp className="h-3 w-3 text-[#DC3545]" />}
                    {eq.trend === 'down' && <TrendingDown className="h-3 w-3 text-[#28A745]" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Turnos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-[#00b4d8]" />
              Desempenho por Turno
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { shift: '1A', efficiency: 96, issues: 3 },
                { shift: '1B', efficiency: 92, issues: 5 },
                { shift: '2A', efficiency: 94, issues: 4 },
                { shift: '2B', efficiency: 88, issues: 7 },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Turno {s.shift}</span>
                    <span className={cn('text-sm font-bold', s.efficiency >= 90 ? 'text-[#28A745]' : 'text-[#FFC107]')}>
                      {s.efficiency}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', s.efficiency >= 90 ? 'bg-[#28A745]' : 'bg-[#FFC107]')}
                      style={{ width: `${s.efficiency}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{s.issues} ocorrências</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
