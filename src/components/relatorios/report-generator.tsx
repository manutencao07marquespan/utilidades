'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, FileText, Download, Printer } from 'lucide-react'

interface ReportGeneratorProps {
  reportType: string
  reportName: string
  onGenerate?: (data: any) => void
}

export function ReportGenerator({ reportType, reportName, onGenerate }: ReportGeneratorProps) {
  const [filters, setFilters] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    sector: '',
    shift: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reportData, setReportData] = useState<any>(null)
  const supabase = createClient()

  async function generateReport() {
    setLoading(true)
    setError(null)
    setReportData(null)

    try {
      let data: any = {}

      switch (reportType) {
        case 'daily':
          data = await generateDailyReport()
          break
        case 'maintenance':
          data = await generateMaintenanceReport()
          break
        case 'checklist':
          data = await generateChecklistReport()
          break
        case 'laboratory':
          data = await generateLaboratoryReport()
          break
        case 'stock':
          data = await generateStockReport()
          break
        case 'horimeter':
          data = await generateHorimeterReport()
          break
        case 'hydrant':
          data = await generateHydrantReport()
          break;
        case 'alarms':
          data = await generateAlarmsReport()
          break
        default:
          data = { message: 'Relatório não disponível' }
      }

      setReportData(data)

      // Save to history
      const user = (await supabase.auth.getUser()).data.user
      console.log('Saving report to history, user:', user?.id)

      const { error: insertError } = await supabase.from('report_history').insert({
        user_id: user?.id,
        report_type: reportType,
        report_name: reportName,
        period_start: filters.start_date || null,
        period_end: filters.end_date || null,
        format: 'pdf',
        filters: filters || null,
      })

      if (insertError) {
        console.error('Error saving report history:', insertError)
      } else {
        console.log('Report saved to history successfully')
      }

      onGenerate?.(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar relatório')
    } finally {
      setLoading(false)
    }
  }

  async function generateDailyReport() {
    const [cisterns, hydrants, analyses, alerts] = await Promise.all([
      supabase.from('cistern_levels').select('*').gte('reading_date', filters.start_date).lte('reading_date', filters.end_date),
      supabase.from('hydrant_readings').select('*').gte('reading_date', filters.start_date).lte('reading_date', filters.end_date),
      supabase.from('lab_analyses').select('*').gte('analysis_date', filters.start_date).lte('analysis_date', filters.end_date),
      supabase.from('alert_history').select('*').gte('triggered_at', filters.start_date),
    ])

    return {
      title: 'Relatório Diário da ETE',
      period: `${filters.start_date} a ${filters.end_date}`,
      cisterns: cisterns.data || [],
      hydrants: hydrants.data || [],
      analyses: analyses.data || [],
      alerts: alerts.data || [],
    }
  }

  async function generateMaintenanceReport() {
    const { data: orders } = await supabase
      .from('maintenance_orders')
      .select('*, assets(name)')
      .gte('opened_at', filters.start_date)
      .lte('opened_at', filters.end_date + 'T23:59:59')

    return {
      title: 'Relatório de Manutenção',
      period: `${filters.start_date} a ${filters.end_date}`,
      orders: orders || [],
      stats: {
        total: orders?.length || 0,
        completed: orders?.filter((o: any) => o.status === 'completed').length || 0,
        open: orders?.filter((o: any) => o.status === 'open').length || 0,
      }
    }
  }

  async function generateChecklistReport() {
    const { data: executions } = await supabase
      .from('checklist_executions')
      .select('*, assets(name), checklist_templates(name), user_profiles(full_name)')
      .gte('started_at', filters.start_date)
      .lte('started_at', filters.end_date + 'T23:59:59')

    return {
      title: 'Relatório de Checklists',
      period: `${filters.start_date} a ${filters.end_date}`,
      executions: executions || [],
      stats: {
        total: executions?.length || 0,
        completed: executions?.filter((e: any) => e.status === 'completed').length || 0,
      }
    }
  }

  async function generateLaboratoryReport() {
    const { data: analyses } = await supabase
      .from('lab_analyses')
      .select('*')
      .gte('analysis_date', filters.start_date)
      .lte('analysis_date', filters.end_date)

    return {
      title: 'Relatório Laboratorial',
      period: `${filters.start_date} a ${filters.end_date}`,
      analyses: analyses || [],
      stats: {
        total: analyses?.length || 0,
        avgPH: analyses?.reduce((sum: number, a: any) => sum + (a.ph || 0), 0) / (analyses?.length || 1),
      }
    }
  }

  async function generateStockReport() {
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)

    const { data: movements } = await supabase
      .from('stock_movements')
      .select('*, products(name, unit)')
      .gte('movement_date', filters.start_date)
      .lte('movement_date', filters.end_date + 'T23:59:59')

    return {
      title: 'Relatório de Estoque',
      period: `${filters.start_date} a ${filters.end_date}`,
      products: products || [],
      movements: movements || [],
    }
  }

  async function generateHorimeterReport() {
    const { data: readings } = await supabase
      .from('well_horimeters')
      .select('*')
      .gte('reading_date', filters.start_date)
      .lte('reading_date', filters.end_date)

    return {
      title: 'Relatório de Horímetros',
      period: `${filters.start_date} a ${filters.end_date}`,
      readings: readings || [],
    }
  }

  async function generateHydrantReport() {
    const { data: readings } = await supabase
      .from('hydrant_readings')
      .select('*')
      .gte('reading_date', filters.start_date)
      .lte('reading_date', filters.end_date)

    return {
      title: 'Relatório de Hidrômetros',
      period: `${filters.start_date} a ${filters.end_date}`,
      readings: readings || [],
    }
  }

  async function generateAlarmsReport() {
    const { data: alarms } = await supabase
      .from('alert_history')
      .select('*, alert_rules(name, parameter)')
      .gte('triggered_at', filters.start_date)
      .lte('triggered_at', filters.end_date + 'T23:59:59')

    return {
      title: 'Relatório de Alarmes',
      period: `${filters.start_date} a ${filters.end_date}`,
      alarms: alarms || [],
    }
  }

  function formatReportAsText(data: any) {
    if (!data) return ''

    let text = `${'='.repeat(50)}\n`
    text += `${data.title}\n`
    text += `Período: ${data.period}\n`
    text += `${'='.repeat(50)}\n\n`

    if (data.stats) {
      text += `RESUMO:\n`
      Object.entries(data.stats).forEach(([key, value]) => {
        text += `  ${key}: ${value}\n`
      })
      text += '\n'
    }

    if (data.analyses && data.analyses.length > 0) {
      text += `ANÁLISES (${data.analyses.length} registros):\n`
      data.analyses.slice(0, 10).forEach((a: any) => {
        text += `  ${a.analysis_date} - pH: ${a.ph}, Turbidez: ${a.turbidity}\n`
      })
      if (data.analyses.length > 10) text += `  ... e mais ${data.analyses.length - 10} registros\n`
      text += '\n'
    }

    if (data.orders && data.orders.length > 0) {
      text += `ORDENS DE SERVIÇO (${data.orders.length} registros):\n`
      data.orders.slice(0, 10).forEach((o: any) => {
        text += `  ${o.os_number} - ${o.title} (${o.status})\n`
      })
      if (data.orders.length > 10) text += `  ... e mais ${data.orders.length - 10} registros\n`
      text += '\n'
    }

    if (data.readings && data.readings.length > 0) {
      text += `LEITURAS (${data.readings.length} registros):\n`
      data.readings.slice(0, 10).forEach((r: any) => {
        const code = r.hydrant_code || r.well_code || r.cistern_code || '-'
        text += `  ${r.reading_date} - ${code}\n`
      })
      if (data.readings.length > 10) text += `  ... e mais ${data.readings.length - 10} registros\n`
    }

    return text
  }

  function downloadReport() {
    if (!reportData) return

    const text = formatReportAsText(reportData)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportType}_${filters.start_date}_${filters.end_date}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function downloadExcel() {
    if (!reportData) return

    // Convert report data to CSV
    let csvContent = ''
    const dataKey = Object.keys(reportData).find(k => Array.isArray(reportData[k]))

    if (dataKey && Array.isArray(reportData[dataKey]) && reportData[dataKey].length > 0) {
      const headers = Object.keys(reportData[dataKey][0])
      csvContent = headers.join(',') + '\n'
      csvContent += reportData[dataKey].map((row: any) =>
        headers.map(h => {
          const val = row[h]
          if (val === null || val === undefined) return ''
          if (typeof val === 'object') return JSON.stringify(val)
          return String(val).includes(',') ? `"${val}"` : val
        }).join(',')
      ).join('\n')
    } else {
      // Fallback: export as text
      csvContent = formatReportAsText(reportData)
    }

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportType}_${filters.start_date}_${filters.end_date}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#1A3A5A]" />
          {reportName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <Alert className="bg-[#DC3545]/10 border-[#DC3545]/30 text-[#DC3545]">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Setor</Label>
              <select
                value={filters.sector}
                onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
              >
                <option value="">Todos</option>
                <option value="ETE">ETE</option>
                <option value="Laboratório">Laboratório</option>
                <option value="Administrativo">Administrativo</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Turno</Label>
              <select
                value={filters.shift}
                onChange={(e) => setFilters({ ...filters, shift: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
              >
                <option value="">Todos</option>
                <option value="1A">Turno 1A</option>
                <option value="1B">Turno 1B</option>
                <option value="2A">Turno 2A</option>
                <option value="2B">Turno 2B</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={generateReport}
              disabled={loading}
              className="btn-gradient-green text-white border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </>
              )}
            </Button>

            {reportData && (
              <>
                <Button variant="outline" onClick={downloadReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar TXT
                </Button>
                <Button variant="outline" onClick={downloadExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar CSV
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
              </>
            )}
          </div>

          {/* Report Preview */}
          {reportData && (
            <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/50">
              <h4 className="font-medium text-sm mb-2">Pré-visualização:</h4>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-auto max-h-96">
                {formatReportAsText(reportData)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
