'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/shared/stats-card'
import { StatusIndicator } from '@/components/shared/status-indicator'
import {
  Activity, Droplets, AlertTriangle, CheckCircle, Clock, Users,
  TrendingUp, TrendingDown, Timer, Target, BarChart3, UserCheck
} from 'lucide-react'
import { cn } from '@/lib/cn'

interface OperatorStats {
  name: string
  userId: string
  checklistsCompleted: number
  avgTimeMinutes: number
  totalTimeMinutes: number
  nonConformities: number
  lastChecklist: string | null
}

interface ShiftStats {
  shift: string
  label: string
  checklists: number
  avgTime: number
  operators: number
  operatorIds: string[]
  nonConformities: number
  efficiency: number
}

export default function SupervisaoPage() {
  const [operatorStats, setOperatorStats] = useState<OperatorStats[]>([])
  const [shiftStats, setShiftStats] = useState<ShiftStats[]>([])
  const [allExecutions, setAllExecutions] = useState<any[]>([])
  const [selectedShift, setSelectedShift] = useState<string>('all')
  const [stats, setStats] = useState({
    totalChecklists: 0,
    avgTime: 0,
    totalOperators: 0,
    nonConformities: 0,
    completedToday: 0,
    inProgress: 0,
  })
  const [loading, setLoading] = useState(true)
  const [turnoAtual, setTurnoAtual] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchData()
    setTurnoAtual(getCurrentShift())
  }, [])

  useEffect(() => {
    filterData()
  }, [selectedShift, allExecutions])

  function getCurrentShift() {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 18) return '1A'
    return '1B'
  }

  async function fetchData() {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data: executions } = await supabase
        .from('checklist_executions')
        .select('*, user_profiles(full_name)')
        .gte('started_at', today)
        .order('started_at', { ascending: false })

      if (executions) {
        setAllExecutions(executions)
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  function filterData() {
    let filtered = allExecutions

    // Filter by shift
    if (selectedShift !== 'all') {
      filtered = allExecutions.filter((exec: any) => {
        const execDate = new Date(exec.started_at)
        const hour = execDate.getHours()
        let shift = '1A'
        if (hour >= 18 || hour < 6) shift = '1B'
        else if (execDate.getDay() % 2 === 0) shift = '2A'
        else shift = '2B'
        return shift === selectedShift
      })
    }

    // Calculate operator stats
    const operatorMap = new Map<string, OperatorStats>()
    filtered.forEach((exec: any) => {
      const userId = exec.user_id
      const userName = exec.user_profiles?.full_name || 'Desconhecido'
      const duration = exec.execution_duration ? exec.execution_duration / 60 : 0

      if (!operatorMap.has(userId)) {
        operatorMap.set(userId, {
          name: userName,
          userId,
          checklistsCompleted: 0,
          avgTimeMinutes: 0,
          totalTimeMinutes: 0,
          nonConformities: 0,
          lastChecklist: null,
        })
      }

      const stats = operatorMap.get(userId)!
      stats.checklistsCompleted++
      stats.totalTimeMinutes += duration
      if (exec.has_non_conformity) stats.nonConformities++
      if (!stats.lastChecklist || exec.started_at > stats.lastChecklist) {
        stats.lastChecklist = exec.started_at
      }
    })

    operatorMap.forEach(stats => {
      stats.avgTimeMinutes = stats.checklistsCompleted > 0
        ? Math.round(stats.totalTimeMinutes / stats.checklistsCompleted)
        : 0
    })

    const operatorArray = Array.from(operatorMap.values())
      .sort((a, b) => b.checklistsCompleted - a.checklistsCompleted)

    setOperatorStats(operatorArray)

    // Overall stats
    const totalTime = filtered.reduce((sum: number, e: any) =>
      sum + (e.execution_duration ? e.execution_duration / 60 : 0), 0)
    const completedCount = filtered.filter((e: any) => e.status === 'completed').length
    const ncCount = filtered.filter((e: any) => e.has_non_conformity).length
    const uniqueOperators = new Set(filtered.map((e: any) => e.user_id))

    setStats({
      totalChecklists: filtered.length,
      avgTime: completedCount > 0 ? Math.round(totalTime / completedCount) : 0,
      totalOperators: uniqueOperators.size,
      nonConformities: ncCount,
      completedToday: completedCount,
      inProgress: filtered.filter((e: any) => e.status === 'in_progress').length,
    })
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
        description="Avaliação da equipe e tempo de checklists"
      />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Última atualização: {new Date().toLocaleString('pt-BR')}</span>
        <span>Turno Atual: <strong className="text-foreground">{turnoAtual}</strong></span>
      </div>

      {/* Filtro de Turno */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Filtrar por Turno:</span>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Todos' },
                { value: '1A', label: 'Turno 1A' },
                { value: '1B', label: 'Turno 1B' },
                { value: '2A', label: 'Turno 2A' },
                { value: '2B', label: 'Turno 2B' },
              ].map((shift) => (
                <button
                  key={shift.value}
                  onClick={() => setSelectedShift(shift.value)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    selectedShift === shift.value
                      ? 'bg-[#28A745] text-white shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {shift.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Gerais */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Checklists Hoje"
          value={stats.totalChecklists}
          subtitle={`${stats.completedToday} concluídos`}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Tempo Médio"
          value={`${stats.avgTime} min`}
          subtitle="por checklist"
          icon={Timer}
          variant="default"
        />
        <StatsCard
          title="Equipe Ativa"
          value={stats.totalOperators}
          subtitle="operadores hoje"
          icon={Users}
          variant="default"
        />
        <StatsCard
          title="Não Conformidades"
          value={stats.nonConformities}
          subtitle="registradas hoje"
          icon={AlertTriangle}
          variant={stats.nonConformities > 0 ? 'danger' : 'success'}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Desempenho da Equipe */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <UserCheck className="h-4 w-4 text-[#28A745]" />
              Desempenho da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            {operatorStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum checklist executado hoje</p>
            ) : (
              <div className="space-y-3">
                {operatorStats.map((op, i) => {
                  const maxChecklists = Math.max(...operatorStats.map(o => o.checklistsCompleted))
                  const barWidth = maxChecklists > 0 ? (op.checklistsCompleted / maxChecklists) * 100 : 0
                  const avgTarget = 10 // Meta: 10 min por checklist
                  const timeStatus = op.avgTimeMinutes <= avgTarget ? 'ok' : op.avgTimeMinutes <= avgTarget * 1.5 ? 'warning' : 'critical'

                  return (
                    <div key={op.userId} className="p-4 rounded-xl bg-muted/30 border border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#28A745] to-[#218838] flex items-center justify-center text-white text-sm font-bold">
                            {op.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{op.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {op.checklistsCompleted} checklists • {op.avgTimeMinutes} min médio
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {op.nonConformities > 0 && (
                            <span className="text-xs font-medium text-[#FFC107]">⚠ {op.nonConformities}</span>
                          )}
                          <StatusIndicator
                            variant={timeStatus}
                            label={timeStatus === 'ok' ? 'Bom' : timeStatus === 'warning' ? 'Atenção' : 'Lento'}
                          />
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            timeStatus === 'ok' ? 'bg-[#28A745]' : timeStatus === 'warning' ? 'bg-[#FFC107]' : 'bg-[#DC3545]'
                          )}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>Total: {Math.round(op.totalTimeMinutes)} min</span>
                        <span>Média: {op.avgTimeMinutes} min/checklist</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Desempenho por Turno */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-[#00b4d8]" />
              Por Turno
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shiftStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Sem dados</p>
            ) : (
              <div className="space-y-4">
                {shiftStats.map(s => (
                  <div key={s.shift} className={cn(
                    'p-4 rounded-xl border',
                    s.shift === turnoAtual ? 'border-[#28A745] bg-[#28A745]/5' : 'border-border'
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{s.label}</span>
                      {s.shift === turnoAtual && (
                        <StatusIndicator variant="ok" label="Atual" />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Checklists</p>
                        <p className="font-bold text-lg">{s.checklists}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tempo Médio</p>
                        <p className="font-bold text-lg">{Math.round(s.avgTime)} min</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Operadores</p>
                        <p className="font-bold text-lg">{s.operators}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Eficiência</p>
                        <p className={cn('font-bold text-lg', s.efficiency >= 90 ? 'text-[#28A745]' : 'text-[#FFC107]')}>
                          {s.efficiency}%
                        </p>
                      </div>
                    </div>
                    {s.nonConformities > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-[#FFC107]">
                        <AlertTriangle className="h-3 w-3" />
                        {s.nonConformities} não conformidade(s)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparativo de Tempos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Timer className="h-4 w-4 text-[#FFC107]" />
            Comparativo de Tempo por Operador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {operatorStats.map((op, i) => {
              const maxTime = Math.max(...operatorStats.map(o => o.avgTimeMinutes), 1)
              const barWidth = (op.avgTimeMinutes / maxTime) * 100
              const isSlow = op.avgTimeMinutes > 10

              return (
                <div key={op.userId} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-32 truncate">{op.name}</span>
                  <div className="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-lg flex items-center px-2 text-xs font-medium text-white',
                        isSlow ? 'bg-[#FFC107]' : 'bg-[#28A745]'
                      )}
                      style={{ width: `${Math.max(barWidth, 10)}%` }}
                    >
                      {op.avgTimeMinutes} min
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right">
                    {op.checklistsCompleted} check
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-[#28A745]"></div>
              ≤ 10 min (meta)
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-[#FFC107]"></div>
              {'>'} 10 min (acima da meta)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
