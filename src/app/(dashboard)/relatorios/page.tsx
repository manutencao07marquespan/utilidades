'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { StatsCard } from '@/components/shared/stats-card'
import { ReportGenerator } from '@/components/relatorios/report-generator'
import { FileText, Download, Clock, Calendar } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusIndicator } from '@/components/shared/status-indicator'

const REPORT_TYPES = [
  { type: 'daily', name: 'Relatório Diário da ETE', icon: '📄', category: 'operational' },
  { type: 'maintenance', name: 'Relatório de Manutenção', icon: '🔧', category: 'operational' },
  { type: 'checklist', name: 'Relatório de Checklists', icon: '✅', category: 'operational' },
  { type: 'laboratory', name: 'Relatório Laboratorial', icon: '🔬', category: 'environmental' },
  { type: 'stock', name: 'Relatório de Estoque', icon: '📦', category: 'managerial' },
  { type: 'horimeter', name: 'Relatório de Horímetros', icon: '⏱️', category: 'operational' },
  { type: 'hydrant', name: 'Relatório de Hidrômetros', icon: '💧', category: 'operational' },
  { type: 'alarms', name: 'Relatório de Alarmes', icon: '🔔', category: 'operational' },
]

export default function RelatoriosPage() {
  const [activeTab, setActiveTab] = useState('select')
  const [selectedReport, setSelectedReport] = useState<{ type: string; name: string } | null>(null)
  const [stats, setStats] = useState({ total: 0, pdf: 0, excel: 0, recent: 0 })
  const [history, setHistory] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
    fetchHistory()
  }, [])

  async function fetchStats() {
    const { data: reports } = await supabase
      .from('report_history')
      .select('format, created_at')

    if (reports) {
      const total = reports.length
      const pdf = reports.filter((r: any) => r.format === 'pdf').length
      const excel = reports.filter((r: any) => r.format === 'excel').length
      const today = new Date().toISOString().split('T')[0]
      const recent = reports.filter((r: any) => r.created_at?.startsWith(today)).length

      setStats({ total, pdf, excel, recent })
    }
  }

  async function fetchHistory() {
    const { data, error } = await supabase
      .from('report_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching history:', error)
    }

    if (data) {
      // Enrich with user names
      const enriched = await Promise.all(data.map(async (report: any) => {
        let userName = 'Sistema'
        if (report.user_id) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', report.user_id)
            .single()
          if (profile) userName = profile.full_name
        }
        return { ...report, user_name: userName }
      }))
      setHistory(enriched)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Central de relatórios operacionais e gerenciais"
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-4">
        <StatsCard
          title="Relatórios Gerados"
          value={stats.total}
          subtitle="total"
          icon={FileText}
          variant="default"
        />
        <StatsCard
          title="PDFs"
          value={stats.pdf}
          subtitle="gerados"
          icon={Download}
          variant="default"
        />
        <StatsCard
          title="Hoje"
          value={stats.recent}
          subtitle="relatórios"
          icon={Clock}
          variant="success"
        />
        <StatsCard
          title="Tipos"
          value={REPORT_TYPES.length}
          subtitle="disponíveis"
          icon={Calendar}
          variant="default"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="select">
            <FileText className="h-4 w-4 mr-2" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="select">
          {selectedReport ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedReport(null)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Voltar para lista
              </button>
              <ReportGenerator
                reportType={selectedReport.type}
                reportName={selectedReport.name}
              />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {REPORT_TYPES.map((report) => (
                    <button
                      key={report.type}
                      onClick={() => setSelectedReport({ type: report.type, name: report.name })}
                      className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/30 transition-colors text-left"
                    >
                      <span className="text-2xl">{report.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{report.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{report.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Histórico de Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum relatório gerado ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {history.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => {
                        setSelectedReport({ type: report.report_type, name: report.report_name })
                        setActiveTab('select')
                      }}
                      className="w-full flex items-center gap-4 p-3 rounded-xl border hover:bg-muted/30 cursor-pointer transition-colors text-left"
                    >
                      <span className="text-lg">
                        {report.format === 'pdf' ? '📄' : report.format === 'excel' ? '📊' : '🖨️'}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{report.report_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.user_name || 'Sistema'} • {formatDate(report.created_at)}
                        </p>
                      </div>
                      <StatusIndicator
                        variant="ok"
                        label={report.format.toUpperCase()}
                      />
                    </button>
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
