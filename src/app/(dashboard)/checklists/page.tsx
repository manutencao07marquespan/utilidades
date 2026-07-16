'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { StatsCard } from '@/components/shared/stats-card'
import { TemplateForm } from '@/components/checklists/template-form'
import { TemplatesList } from '@/components/checklists/templates-list'
import { QRScanner } from '@/components/checklists/qr-scanner'
import { ChecklistExecution } from '@/components/checklists/checklist-execution'
import { ExecutionDetail } from '@/components/checklists/execution-detail'
import { ClipboardCheck, CheckCircle, Clock, AlertTriangle, QrCode, Play, Search, Eye, Filter } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

interface QRData {
  equipment_id: string
  equipment_name: string
  equipment_code: string
  sector: string
  template_id: string
  template_name: string
}

interface Execution {
  id: string
  status: string
  started_at: string
  finished_at: string | null
  has_non_conformity: boolean
  non_conformity_count: number
  execution_duration: number | null
  template_name?: string
  user_name?: string
}

export default function ChecklistsPage() {
  const [activeTab, setActiveTab] = useState('execute')
  const [scanData, setScanData] = useState<QRData | null>(null)
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null)
  const [stats, setStats] = useState({ pending: 0, completed: 0, nonConformities: 0, qrCodes: 0 })
  const [recentExecutions, setRecentExecutions] = useState<Execution[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [templates, setTemplates] = useState<any[]>([])
  const [equipmentList, setEquipmentList] = useState<any[]>([])
  const [filters, setFilters] = useState({
    dateStart: '',
    dateEnd: '',
    template: '',
    equipment: '',
    status: '',
    shift: '',
    nonConformity: false,
  })
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
    fetchRecentExecutions()
    fetchFilterData()
  }, [refreshKey])

  async function fetchFilterData() {
    const [templatesRes, equipmentRes] = await Promise.all([
      supabase.from('checklist_templates').select('id, name').order('name'),
      supabase.from('assets').select('id, name, asset_code').order('name'),
    ])
    if (templatesRes.data) setTemplates(templatesRes.data)
    if (equipmentRes.data) setEquipmentList(equipmentRes.data)
  }

  async function fetchStats() {
    const [executions, templates] = await Promise.all([
      supabase.from('checklist_executions').select('status, has_non_conformity'),
      supabase.from('checklist_templates').select('id', { count: 'exact', head: true }),
    ])

    if (executions.data) {
      const completed = executions.data.filter((e: any) => e.status === 'completed').length
      const nonConf = executions.data.filter((e: any) => e.has_non_conformity).length
      setStats({
        pending: executions.data.filter((e: any) => e.status === 'in_progress').length,
        completed,
        nonConformities: nonConf,
        qrCodes: templates.count || 0,
      })
    }
  }

  async function fetchRecentExecutions() {
    let query = supabase
      .from('checklist_executions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(50)

    if (filters.dateStart) query = query.gte('started_at', filters.dateStart)
    if (filters.dateEnd) query = query.lte('started_at', filters.dateEnd + 'T23:59:59')
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.nonConformity) query = query.eq('has_non_conformity', true)

    const { data } = await query

    if (data) {
      const enriched = await Promise.all(data.map(async (exec: any) => {
        let templateName = 'Checklist'
        let userName = 'Usuário'

        if (exec.template_id) {
          const { data: t } = await supabase.from('checklist_templates').select('name').eq('id', exec.template_id).single()
          if (t) templateName = t.name
        }
        if (exec.user_id) {
          const { data: p } = await supabase.from('user_profiles').select('full_name').eq('id', exec.user_id).single()
          if (p) userName = p.full_name
        }

        return { ...exec, template_name: templateName, user_name: userName }
      }))
      setRecentExecutions(enriched)
    }
  }

  function handleScanComplete() {
    setScanData(null)
    setRefreshKey(k => k + 1)
    setActiveTab('history')
  }

  if (selectedExecution) {
    return (
      <ExecutionDetail
        executionId={selectedExecution}
        onBack={() => setSelectedExecution(null)}
      />
    )
  }

  if (scanData) {
    return (
      <ChecklistExecution
        qrData={scanData}
        onComplete={handleScanComplete}
        onCancel={() => setScanData(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Checklists"
        description="Inspeções operacionais com QR Code"
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-4">
        <StatsCard title="Executados" value={stats.completed} subtitle="total" icon={CheckCircle} variant="success" />
        <StatsCard title="Não Conformidades" value={stats.nonConformities} subtitle="registradas" icon={AlertTriangle} variant={stats.nonConformities > 0 ? 'danger' : 'success'} />
        <StatsCard title="Modelos" value={stats.qrCodes} subtitle="cadastrados" icon={ClipboardCheck} variant="default" />
        <StatsCard title="Pendentes" value={stats.pending} subtitle="em andamento" icon={Clock} variant="warning" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="execute"><Play className="h-4 w-4 mr-2" />Executar</TabsTrigger>
          <TabsTrigger value="history"><Clock className="h-4 w-4 mr-2" />Histórico</TabsTrigger>
          <TabsTrigger value="templates"><ClipboardCheck className="h-4 w-4 mr-2" />Modelos</TabsTrigger>
        </TabsList>

        <TabsContent value="execute">
          <QRScanner onScan={setScanData} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Data Início</label>
                  <input type="date" value={filters.dateStart} onChange={(e) => setFilters({ ...filters, dateStart: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-input bg-transparent text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Data Fim</label>
                  <input type="date" value={filters.dateEnd} onChange={(e) => setFilters({ ...filters, dateEnd: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-input bg-transparent text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Status</label>
                  <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-input bg-transparent text-sm">
                    <option value="">Todos</option>
                    <option value="completed">Concluído</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Turno</label>
                  <select value={filters.shift} onChange={(e) => setFilters({ ...filters, shift: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg border border-input bg-transparent text-sm">
                    <option value="">Todos</option>
                    <option value="1A">Turno 1A</option>
                    <option value="1B">Turno 1B</option>
                    <option value="2A">Turno 2A</option>
                    <option value="2B">Turno 2B</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={filters.nonConformity}
                    onChange={(e) => setFilters({ ...filters, nonConformity: e.target.checked })}
                    className="rounded" />
                  Apenas Não Conformidades
                </label>
                <Button variant="outline" size="sm" onClick={() => setFilters({ dateStart: '', dateEnd: '', template: '', equipment: '', status: '', shift: '', nonConformity: false })}>
                  Limpar Filtros
                </Button>
                <Button size="sm" onClick={() => { setRefreshKey(k => k + 1); fetchRecentExecutions() }} className="btn-gradient-green text-white border-0">
                  <Search className="h-3 w-3 mr-1" /> Pesquisar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* History Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Últimas Execuções ({recentExecutions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {recentExecutions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma execução encontrada</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 text-xs font-medium text-muted-foreground">Data</th>
                        <th className="text-left p-2 text-xs font-medium text-muted-foreground">Checklist</th>
                        <th className="text-left p-2 text-xs font-medium text-muted-foreground">Operador</th>
                        <th className="text-left p-2 text-xs font-medium text-muted-foreground hidden md:table-cell">Tempo</th>
                        <th className="text-left p-2 text-xs font-medium text-muted-foreground">Status</th>
                        <th className="text-center p-2 text-xs font-medium text-muted-foreground">NC</th>
                        <th className="text-right p-2 text-xs font-medium text-muted-foreground">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentExecutions.map((exec) => (
                        <tr key={exec.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer"
                          onClick={() => setSelectedExecution(exec.id)}>
                          <td className="p-2 text-xs">{new Date(exec.started_at).toLocaleDateString('pt-BR')}</td>
                          <td className="p-2 text-sm font-medium">{exec.template_name}</td>
                          <td className="p-2 text-sm">{exec.user_name}</td>
                          <td className="p-2 text-xs text-muted-foreground hidden md:table-cell">
                            {exec.execution_duration ? `${Math.floor(exec.execution_duration / 60)}min` : '-'}
                          </td>
                          <td className="p-2">
                            <StatusIndicator
                              variant={exec.status === 'completed' ? 'ok' : exec.status === 'in_progress' ? 'warning' : 'inactive'}
                              label={exec.status === 'completed' ? 'Executado' : exec.status === 'in_progress' ? 'Em Andamento' : 'Cancelado'}
                            />
                          </td>
                          <td className="p-2 text-center">
                            {exec.has_non_conformity && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#FFC107]">
                                ⚠ {exec.non_conformity_count || ''}
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-right">
                            <Button variant="ghost" size="icon" className="h-7 w-7"
                              onClick={(e) => { e.stopPropagation(); setSelectedExecution(exec.id) }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <TemplatesList key={`list-${refreshKey}`} onRefresh={() => setRefreshKey(k => k + 1)} />
          <TemplateForm onSuccess={() => setRefreshKey(k => k + 1)} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
