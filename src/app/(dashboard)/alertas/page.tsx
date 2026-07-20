'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { AlertTriangle, CheckCircle, Clock, Filter, Search, Download } from 'lucide-react'
import { cn } from '@/lib/cn'

interface AlertHistory {
  id: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  parameter: string | null
  value: number | null
  acknowledged: boolean
  acknowledged_at: string | null
  triggered_at: string
}

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<AlertHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchAlerts()
  }, [search, severityFilter, statusFilter])

  async function fetchAlerts() {
    setLoading(true)
    let query = supabase
      .from('alert_history')
      .select('*')
      .order('triggered_at', { ascending: false })

    if (search) {
      query = query.ilike('message', `%${search}%`)
    }

    if (severityFilter !== 'all') {
      query = query.eq('severity', severityFilter)
    }

    if (statusFilter === 'active') {
      query = query.eq('acknowledged', false)
    } else if (statusFilter === 'resolved') {
      query = query.eq('acknowledged', true)
    }

    if (dateStart) {
      query = query.gte('triggered_at', dateStart)
    }
    if (dateEnd) {
      query = query.lte('triggered_at', dateEnd + 'T23:59:59')
    }

    const { data } = await query

    if (data) {
      setAlerts(data as AlertHistory[])
    }
    setLoading(false)
  }

  function getSeverityConfig(severity: string) {
    const configs: Record<string, { label: string; variant: 'ok' | 'warning' | 'critical'; color: string; bgColor: string }> = {
      info: { label: 'Informação', variant: 'ok', color: 'text-[#00b4d8]', bgColor: 'bg-[#00b4d8]/10' },
      warning: { label: 'Aviso', variant: 'warning', color: 'text-[#FFC107]', bgColor: 'bg-[#FFC107]/10' },
      critical: { label: 'Crítico', variant: 'critical', color: 'text-[#DC3545]', bgColor: 'bg-[#DC3545]/10' },
    }
    return configs[severity] || configs.info
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Histórico de Alertas"
        description="Registro completo de todos os alertas do sistema"
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border-l-4 border-l-[#DC3545]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Críticos</p>
                <p className="text-2xl font-bold text-[#DC3545]">
                  {alerts.filter(a => a.severity === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-[#DC3545]/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#FFC107]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas de Aviso</p>
                <p className="text-2xl font-bold text-[#FFC107]">
                  {alerts.filter(a => a.severity === 'warning').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-[#FFC107]/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#28A745]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolvidos</p>
                <p className="text-2xl font-bold text-[#28A745]">
                  {alerts.filter(a => a.acknowledged).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-[#28A745]/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Pesquisar alertas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
              />
            </div>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
            />
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
            />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
            >
              <option value="all">Todas severidades</option>
              <option value="critical">Crítico</option>
              <option value="warning">Aviso</option>
              <option value="info">Informação</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
            >
              <option value="all">Todos status</option>
              <option value="active">Ativos</option>
              <option value="resolved">Resolvidos</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const csv = ['Data,Severidade,Mensagem,Status'].concat(
                  alerts.map(a => `${a.triggered_at},${a.severity},"${a.message}",${a.acknowledged ? 'Resolvido' : 'Ativo'}`)
                ).join('\n')
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'alertas.csv'
                a.click()
              }}
            >
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alert List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-accent"></div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-[#28A745]/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum alerta encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const config = getSeverityConfig(alert.severity)
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-xl border-l-4 transition-all',
                      alert.severity === 'critical' && 'border-l-[#DC3545] bg-[#DC3545]/5',
                      alert.severity === 'warning' && 'border-l-[#FFC107] bg-[#FFC107]/5',
                      alert.severity === 'info' && 'border-l-[#00b4d8] bg-[#00b4d8]/5',
                      alert.acknowledged && 'opacity-60'
                    )}
                  >
                    {/* Severity indicator */}
                    <div className={cn('p-2 rounded-xl', config.bgColor)}>
                      <AlertTriangle className={cn('h-4 w-4', config.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusIndicator variant={config.variant} label={config.label} />
                        {alert.acknowledged && (
                          <StatusIndicator variant="ok" label="Resolvido" />
                        )}
                      </div>
                      <p className="text-sm font-medium">{alert.message}</p>
                      {alert.parameter && alert.value !== undefined && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">{alert.parameter}:</span> {alert.value}
                        </p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(alert.triggered_at)}
                      </p>
                      {alert.acknowledged_at && (
                        <p className="text-xs text-[#28A745] mt-1">
                          Resolvido: {formatDate(alert.acknowledged_at)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
