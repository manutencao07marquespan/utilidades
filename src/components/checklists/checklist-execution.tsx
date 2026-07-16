'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, Clock, MapPin, AlertTriangle, ArrowLeft } from 'lucide-react'

interface QRData {
  equipment_id: string
  equipment_name: string
  equipment_code: string
  sector: string
  template_id: string
  template_name: string
}

interface TemplateItem {
  question: string
  response_type: string
  is_required: boolean
  weight?: number
}

interface ChecklistExecutionProps {
  qrData: QRData
  onComplete: () => void
  onCancel: () => void
}

export function ChecklistExecution({ qrData, onComplete, onCancel }: ChecklistExecutionProps) {
  const [items, setItems] = useState<TemplateItem[]>([])
  const [responses, setResponses] = useState<Record<number, string>>({})
  const [observations, setObservations] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [startTime] = useState(new Date())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [gpsData, setGpsData] = useState<{ lat: number; lng: number; accuracy: number } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchTemplateItems()
    requestGeolocation()
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  async function fetchTemplateItems() {
    if (!qrData.template_id) {
      setLoading(false)
      return
    }

    const { data: template } = await supabase
      .from('checklist_templates')
      .select('items')
      .eq('id', qrData.template_id)
      .single()

    if (template?.items && Array.isArray(template.items)) {
      setItems(template.items)
    }
    setLoading(false)
  }

  function requestGeolocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsData({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
        () => {}
      )
    }
  }

  function handleResponse(index: number, value: string) {
    setResponses({ ...responses, [index]: value })
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    try {
      const user = (await supabase.auth.getUser()).data.user
      const endTime = new Date()

      // Create execution - using simple fields only
      const { data: execution, error: execError } = await supabase
        .from('checklist_executions')
        .insert({
          template_id: qrData.template_id,
          equipment_id: qrData.equipment_id || null,
          user_id: user?.id,
          started_at: startTime.toISOString(),
          finished_at: endTime.toISOString(),
          latitude: gpsData?.lat || null,
          longitude: gpsData?.lng || null,
          gps_accuracy: gpsData?.accuracy || null,
          status: 'completed',
          observations: observations || null,
        })
        .select()
        .single()

      if (execError) {
        console.error('Execution error:', execError)
        throw new Error('Erro ao salvar execução: ' + execError.message)
      }

      // Save responses as observations text (simpler approach)
      const responseText = items.map((item, index) => {
        const response = responses[index] || 'Não respondido'
        return `${index + 1}. ${item.question}: ${response}`
      }).join('\n')

      await supabase
        .from('checklist_executions')
        .update({ observations: (observations ? observations + '\n\n' : '') + responseText })
        .eq('id', execution.id)

      setSuccess('Checklist concluído com sucesso!')
      setTimeout(() => onComplete(), 1500)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-[#28A745] mb-4" />
        <p className="text-muted-foreground">Carregando checklist...</p>
      </div>
    )
  }

  const completedCount = Object.keys(responses).length
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-[#1A3A5A] to-[#0d4f6b] text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onCancel} className="text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h3 className="font-bold">{qrData.template_name || 'Checklist'}</h3>
                <p className="text-white/60 text-sm">{qrData.equipment_name} • {qrData.sector}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-white/80">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
              </div>
              {gpsData && (
                <div className="flex items-center gap-1 text-white/50 text-xs mt-1">
                  <MapPin className="h-3 w-3" /> GPS OK
                </div>
              )}
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>{completedCount}/{items.length} itens</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#28A745] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="bg-[#DC3545]/10 border-[#DC3545]/30 text-[#DC3545]">
          <AlertDescription className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-[#28A745]/10 border-[#28A745]/30 text-[#28A745]">
          <AlertDescription className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> {success}</AlertDescription>
        </Alert>
      )}

      {/* Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <Card key={index} className={cn(
            'transition-all duration-200',
            responses[index] ? 'border-[#28A745]/30 bg-[#28A745]/5' : 'border-border'
          )}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                  responses[index] ? 'bg-[#28A745] text-white' : 'bg-muted text-muted-foreground'
                )}>
                  {responses[index] ? '✓' : index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">{item.question}</p>
                  {item.is_required && <span className="text-xs text-[#DC3545]">* Obrigatório</span>}

                  {item.response_type === 'boolean' && (
                    <div className="flex gap-2 mt-2">
                      <Button variant={responses[index] === 'true' ? 'default' : 'outline'} size="sm"
                        onClick={() => handleResponse(index, 'true')}
                        className={cn(responses[index] === 'true' ? 'bg-[#28A745] text-white' : '')}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Sim
                      </Button>
                      <Button variant={responses[index] === 'false' ? 'default' : 'outline'} size="sm"
                        onClick={() => handleResponse(index, 'false')}
                        className={cn(responses[index] === 'false' ? 'bg-[#DC3545] text-white' : '')}>
                        Não
                      </Button>
                      <Button variant={responses[index] === 'na' ? 'default' : 'outline'} size="sm"
                        onClick={() => handleResponse(index, 'na')}
                        className={cn(responses[index] === 'na' ? 'bg-[#6C757D] text-white' : '')}>
                        N/A
                      </Button>
                    </div>
                  )}

                  {item.response_type === 'select' && (
                    <select value={responses[index] || ''} onChange={(e) => handleResponse(index, e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-input bg-transparent text-sm mt-2">
                      <option value="">Selecione...</option>
                      <option value="ok">OK</option>
                      <option value="attention">Atenção</option>
                      <option value="critical">Crítico</option>
                    </select>
                  )}

                  {(item.response_type === 'text') && (
                    <input type="text" value={responses[index] || ''} onChange={(e) => handleResponse(index, e.target.value)}
                      placeholder="Resposta..." className="w-full h-9 px-3 rounded-lg border border-input bg-transparent text-sm mt-2" />
                  )}

                  {item.response_type === 'number' && (
                    <input type="number" step="0.01" value={responses[index] || ''} onChange={(e) => handleResponse(index, e.target.value)}
                      placeholder="0" className="w-full h-9 px-3 rounded-lg border border-input bg-transparent text-sm mt-2" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Observations */}
      <Card>
        <CardContent className="p-4">
          <Label htmlFor="observations" className="text-sm font-medium">Observações</Label>
          <textarea id="observations" value={observations} onChange={(e) => setObservations(e.target.value)}
            placeholder="Observações adicionais..." rows={3}
            className="w-full mt-2 px-3 py-2 rounded-xl border border-input bg-transparent text-sm resize-none" />
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting} className="flex-1">Cancelar</Button>
        <Button type="button" onClick={handleSubmit} disabled={submitting} className="flex-1 btn-gradient-green text-white border-0">
          {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...</> : <><CheckCircle className="h-4 w-4 mr-2" /> Concluir</>}
        </Button>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
