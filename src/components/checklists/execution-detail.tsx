'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { ArrowLeft, Clock, MapPin, QrCode, User, Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface ExecutionDetailProps {
  executionId: string
  onBack: () => void
}

export function ExecutionDetail({ executionId, onBack }: ExecutionDetailProps) {
  const [execution, setExecution] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchExecution()
  }, [executionId])

  async function fetchExecution() {
    const { data } = await supabase
      .from('checklist_executions')
      .select('*')
      .eq('id', executionId)
      .single()

    if (data) {
      // Get template name
      if (data.template_id) {
        const { data: template } = await supabase
          .from('checklist_templates')
          .select('name, items')
          .eq('id', data.template_id)
          .single()
        data.template_name = template?.name || 'Checklist'
        data.template_items = template?.items || []
      }

      // Get user name
      if (data.user_id) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('id', data.user_id)
          .single()
        data.user_name = profile?.full_name || 'Usuário'
      }

      setExecution(data)
    }
    setLoading(false)
  }

  function formatTime(seconds: number) {
    if (!seconds) {
      // Try to calculate from started_at and finished_at
      if (execution?.started_at && execution?.finished_at) {
        const start = new Date(execution.started_at).getTime()
        const end = new Date(execution.finished_at).getTime()
        seconds = Math.floor((end - start) / 1000)
      } else {
        return '-'
      }
    }
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}min ${secs}s`
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('pt-BR')
  }

  // Parse responses from observations
  function parseResponses(observations: string) {
    if (!observations) return []
    const lines = observations.split('\n').filter(l => l.trim())
    return lines.map(line => {
      // Match patterns like "1. Question: Response" or "1. Question: Sim"
      const match = line.match(/^(\d+)\.\s*(.+?):\s*(.+)$/)
      if (match) {
        return {
          index: parseInt(match[1]),
          question: match[2].trim(),
          response: translateResponse(match[3].trim()),
        }
      }
      // Also match "1. Question" without response
      const matchNoResponse = line.match(/^(\d+)\.\s*(.+)$/)
      if (matchNoResponse) {
        return {
          index: parseInt(matchNoResponse[1]),
          question: matchNoResponse[2].trim(),
          response: 'Não respondido',
        }
      }
      return null
    }).filter(Boolean)
  }

  function translateResponse(response: string) {
    const translations: Record<string, string> = {
      'true': 'Sim',
      'false': 'Não',
      'na': 'Não se aplica',
      'ok': 'OK',
      'attention': 'Atenção',
      'critical': 'Crítico',
    }
    return translations[response] || response
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12">Carregando...</div>
  }

  if (!execution) {
    return <div className="text-center py-12 text-muted-foreground">Execução não encontrada</div>
  }

  const responses = parseResponses(execution.observations)
  const hasNonConformity = execution.has_non_conformity || responses.some((r: any) =>
    r.response.includes('Não') || r.response.includes('Crítico') || r.response.includes('false')
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-[#1A3A5A] to-[#0d4f6b] text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <StatusIndicator
              variant={execution.status === 'completed' ? 'ok' : 'warning'}
              label={execution.status === 'completed' ? 'Concluído' : 'Em Andamento'}
            />
          </div>

          <h2 className="text-xl font-bold">{execution.template_name}</h2>
          <p className="text-white/60 text-sm mb-4">Execução #{execution.id.substring(0, 8).toUpperCase()}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-white/50" />
              <div>
                <p className="text-white/50 text-xs">Data</p>
                <p className="font-medium">{formatDate(execution.started_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-white/50" />
              <div>
                <p className="text-white/50 text-xs">Operador</p>
                <p className="font-medium">{execution.user_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-white/50" />
              <div>
                <p className="text-white/50 text-xs">Tempo</p>
                <p className="font-medium">{formatTime(execution.execution_duration)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-white/50" />
              <div>
                <p className="text-white/50 text-xs">QR Code</p>
                <p className="font-medium">{execution.qr_code_scanned ? 'Lido' : 'Manual'}</p>
              </div>
            </div>
          </div>

          {execution.latitude && (
            <div className="mt-3 flex items-center gap-2 text-white/50 text-xs">
              <MapPin className="h-3 w-3" />
              GPS: {execution.latitude?.toFixed(6)}, {execution.longitude?.toFixed(6)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Non-conformity indicator */}
      {hasNonConformity && (
        <Card className="border-l-4 border-l-[#FFC107] bg-[#FFC107]/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[#FFC107]" />
            <div>
              <p className="font-medium text-sm">Não Conformidades Identificadas</p>
              <p className="text-xs text-muted-foreground">Itens com resposta negativa ou crítica</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Responses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Respostas do Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          {responses.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nenhuma resposta registrada</p>
          ) : (
            <div className="space-y-3">
              {responses.map((resp: any, index: number) => {
                const isNegative = resp.response.includes('Não') || resp.response.includes('Crítico') || resp.response.includes('false')
                return (
                  <div
                    key={index}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg',
                      isNegative ? 'bg-[#DC3545]/5 border-l-4 border-l-[#DC3545]' : 'bg-[#28A745]/5 border-l-4 border-l-[#28A745]'
                    )}
                  >
                    {isNegative ? (
                      <XCircle className="h-5 w-5 text-[#DC3545] mt-0.5 shrink-0" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-[#28A745] mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{resp.question}</p>
                      <p className={cn('text-sm', isNegative ? 'text-[#DC3545]' : 'text-[#28A745]')}>
                        {resp.response}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work Order */}
      {execution.generated_work_order && (
        <Card className="border-l-4 border-l-[#00b4d8]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00b4d8]/10">
              <AlertTriangle className="h-4 w-4 text-[#00b4d8]" />
            </div>
            <div>
              <p className="font-medium text-sm">Ordem de Serviço Gerada</p>
              <p className="text-xs text-muted-foreground">
                OS #{execution.work_order_id?.substring(0, 8) || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
