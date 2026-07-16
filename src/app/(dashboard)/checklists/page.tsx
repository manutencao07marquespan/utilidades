'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { StatsCard } from '@/components/shared/stats-card'
import { TemplateForm } from '@/components/checklists/template-form'
import { TemplatesList } from '@/components/checklists/templates-list'
import { QRScanner } from '@/components/checklists/qr-scanner'
import { ChecklistExecution } from '@/components/checklists/checklist-execution'
import { ClipboardCheck, CheckCircle, Clock, AlertTriangle, QrCode, Plus, Play } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusIndicator } from '@/components/shared/status-indicator'

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
  assets?: { name: string } | null
  checklist_templates?: { name: string } | null
  user_profiles?: { full_name: string } | null
}

export default function ChecklistsPage() {
  const [activeTab, setActiveTab] = useState('execute')
  const [scanData, setScanData] = useState<QRData | null>(null)
  const [stats, setStats] = useState({ pending: 0, completed: 0, overdue: 0, qrCodes: 0 })
  const [recentExecutions, setRecentExecutions] = useState<Execution[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
    fetchRecentExecutions()
  }, [refreshKey])

  async function fetchStats() {
    const today = new Date().toISOString().split('T')[0]

    const [executions, qrCodes] = await Promise.all([
      supabase.from('checklist_executions').select('status, finished_at'),
      supabase.from('equipment_qrcodes').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ])

    if (executions.data) {
      const completedToday = executions.data.filter((e: any) =>
        e.finished_at && e.finished_at.startsWith(today)
      ).length
      const pending = executions.data.filter((e: any) => e.status === 'in_progress').length

      setStats({
        pending,
        completed: completedToday,
        overdue: 0,
        qrCodes: qrCodes.count || 0,
      })
    }
  }

  async function fetchRecentExecutions() {
    // Simple query without complex joins that might fail
    const { data, error } = await supabase
      .from('checklist_executions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching executions:', error)
    }

    if (data) {
      // Enrich with template and user names
      const enriched = await Promise.all(data.map(async (exec: any) => {
        let templateName = 'Checklist'
        let userName = 'Usuário'

        if (exec.template_id) {
          const { data: template } = await supabase
            .from('checklist_templates')
            .select('name')
            .eq('id', exec.template_id)
            .single()
          if (template) templateName = template.name
        }

        if (exec.user_id) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', exec.user_id)
            .single()
          if (profile) userName = profile.full_name
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

  if (scanData) {
    return (
      <div className="space-y-6">
        <ChecklistExecution
          qrData={scanData}
          onComplete={handleScanComplete}
          onCancel={() => setScanData(null)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Checklists"
        description="Inspeções operacionais com QR Code"
        action={{
          label: 'Executar Checklist',
          onClick: () => setActiveTab('execute'),
          icon: Play,
        }}
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-4">
        <StatsCard
          title="Checklists Hoje"
          value={stats.pending + stats.completed}
          subtitle="programados"
          icon={ClipboardCheck}
          variant="default"
        />
        <StatsCard
          title="Concluídos"
          value={stats.completed}
          subtitle="hoje"
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Pendentes"
          value={stats.pending}
          subtitle="em andamento"
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="QR Codes"
          value={stats.qrCodes}
          subtitle="ativos"
          icon={QrCode}
          variant="default"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="execute">
            <Play className="h-4 w-4 mr-2" />
            Executar
          </TabsTrigger>
          <TabsTrigger value="templates">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Modelos
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="execute">
          <QRScanner onScan={setScanData} />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <TemplatesList key={`list-${refreshKey}`} onRefresh={() => setRefreshKey(k => k + 1)} />
          <TemplateForm onSuccess={() => setRefreshKey(k => k + 1)} />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Últimas Execuções
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentExecutions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma execução registrada
                </p>
              ) : (
                <div className="space-y-3">
                  {recentExecutions.map((exec) => (
                    <div
                      key={exec.id}
                      className="flex items-center gap-4 p-3 rounded-xl border hover:bg-muted/30"
                    >
                      <StatusIndicator
                        variant={exec.status === 'completed' ? 'ok' : 'warning'}
                        label={exec.status === 'completed' ? 'Concluído' : 'Em Andamento'}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {(exec as any).template_name || 'Checklist'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(exec as any).user_name || '-'}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {new Date(exec.started_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
