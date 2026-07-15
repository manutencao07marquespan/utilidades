'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { Loader2, CheckCircle, Clock, MapPin, AlertTriangle } from 'lucide-react'

interface QRData {
  equipment_id: string
  equipment_name: string
  equipment_code: string
  sector: string
  template_id: string
  template_name: string
}

interface TemplateItem {
  id: string
  question: string
  response_type: string
  is_required: boolean
  weight: number
}

interface ChecklistExecutionProps {
  qrData: QRData
  onComplete: () => void
  onCancel: () => void
}

export function ChecklistExecution({ qrData, onComplete, onCancel }: ChecklistExecutionProps) {
  const [items, setItems] = useState<TemplateItem[]>([])
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [observations, setObservations] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [startTime] = useState(new Date())
  const [gpsData, setGpsData] = useState<{ lat: number; lng: number; accuracy: number } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchTemplateItems()
    requestGeolocation()
  }, [])

  async function fetchTemplateItems() {
    if (!qrData.template_id) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('checklist_template_items')
      .select('*')
      .eq('template_id', qrData.template_id)
      .order('order_index')

    if (data) {
      setItems(data as TemplateItem[])
    }
    setLoading(false)
  }

  function requestGeolocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsData({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          })
        },
        (error) => {
          console.log('Geolocation not available:', error.message)
        }
      )
    }
  }

  function handleResponse(itemId: string, value: string) {
    setResponses({ ...responses, [itemId]: value })
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    try {
      const user = (await supabase.auth.getUser()).data.user
      const endTime = new Date()

      // Create execution
      const { data: execution, error: execError } = await supabase
        .from('checklist_executions')
        .insert({
          template_id: qrData.template_id || null,
          equipment_id: qrData.equipment_id,
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

      if (execError) throw execError

      // Create responses
      const responsesToInsert = items.map(item => ({
        execution_id: execution.id,
        item_id: item.id,
        response: responses[item.id] || null,
        completed: responses[item.id] === 'true' || responses[item.id] === 'ok',
        completed_by: user?.id,
        completed_at: endTime.toISOString(),
      }))

      const { error: respError } = await supabase
        .from('checklist_execution_items')
        .insert(responsesToInsert)

      if (respError) throw respError

      // Check for critical issues and create OS if needed
      const criticalItems = items.filter(item =>
        responses[item.id] === 'critical' || responses[item.id] === 'false'
      )

      if (criticalItems.length > 0) {
        // Generate OS number
        const { data: osNumber } = await supabase.rpc('generate_os_number')

        // Create maintenance order
        await supabase.from('maintenance_orders').insert({
          os_number: osNumber || `OS-${new Date().getFullYear()}-00001`,
          equipment_id: qrData.equipment_id,
          type: 'corrective',
          priority: 'high',
          status: 'open',
          title: `Correção necessária - ${qrData.equipment_name}`,
          description: `Checklist identificou problemas: ${criticalItems.map(i => i.question).join(', ')}`,
          requested_by: user?.id,
          sector: qrData.sector,
        })
      }

      setSuccess('Checklist concluído com sucesso!')
      setTimeout(() => onComplete(), 1500)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar checklist')
    } finally {
      setSubmitting(false)
    }
  }

  function getElapsedTime() {
    const now = new Date()
    const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60)
    return `${diff} min`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando checklist...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">{qrData.equipment_name}</h3>
              <p className="text-sm text-muted-foreground">{qrData.equipment_code} • {qrData.sector}</p>
            </div>
            <div className="text-right">
              <StatusIndicator variant="ok" label="Em Execução" />
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getElapsedTime()}
              </p>
            </div>
          </div>
          {gpsData && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              GPS: {gpsData.lat.toFixed(6)}, {gpsData.lng.toFixed(6)} (±{gpsData.accuracy.toFixed(0)}m)
            </p>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert className="bg-[#DC3545]/10 border-[#DC3545]/30 text-[#DC3545]">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-[#28A745]/10 border-[#28A745]/30 text-[#28A745]">
          <AlertDescription className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Checklist Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{qrData.template_name || 'Checklist'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border ${
                  responses[item.id] ? 'border-[#28A745]/30 bg-[#28A745]/5' : 'border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs text-muted-foreground mt-1 w-6">{index + 1}.</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.question}</p>
                    {item.is_required && (
                      <span className="text-xs text-[#DC3545]">* Obrigatório</span>
                    )}
                  </div>
                </div>

                {/* Response Options */}
                <div className="mt-3 ml-9">
                  {item.response_type === 'boolean' && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={responses[item.id] === 'true' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleResponse(item.id, 'true')}
                        className={responses[item.id] === 'true' ? 'btn-gradient-green text-white' : ''}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Sim
                      </Button>
                      <Button
                        type="button"
                        variant={responses[item.id] === 'false' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleResponse(item.id, 'false')}
                        className={responses[item.id] === 'false' ? 'bg-[#DC3545] text-white' : ''}
                      >
                        Não
                      </Button>
                      <Button
                        type="button"
                        variant={responses[item.id] === 'na' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleResponse(item.id, 'na')}
                        className={responses[item.id] === 'na' ? 'bg-[#6C757D] text-white' : ''}
                      >
                        N/A
                      </Button>
                    </div>
                  )}

                  {item.response_type === 'select' && (
                    <select
                      value={responses[item.id] || ''}
                      onChange={(e) => handleResponse(item.id, e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
                    >
                      <option value="">Selecione</option>
                      <option value="ok">OK</option>
                      <option value="attention">Atenção</option>
                      <option value="critical">Crítico</option>
                    </select>
                  )}

                  {item.response_type === 'text' && (
                    <input
                      type="text"
                      value={responses[item.id] || ''}
                      onChange={(e) => handleResponse(item.id, e.target.value)}
                      placeholder="Resposta..."
                      className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
                    />
                  )}

                  {item.response_type === 'number' && (
                    <input
                      type="number"
                      step="0.01"
                      value={responses[item.id] || ''}
                      onChange={(e) => handleResponse(item.id, e.target.value)}
                      placeholder="0"
                      className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Observations */}
      <Card>
        <CardContent className="p-4">
          <Label htmlFor="observations">Observações</Label>
          <textarea
            id="observations"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Observações adicionais..."
            rows={3}
            className="w-full mt-2 px-3 py-2 rounded-xl border border-input bg-transparent text-sm resize-none"
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 btn-gradient-green text-white border-0"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Concluir Checklist
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
