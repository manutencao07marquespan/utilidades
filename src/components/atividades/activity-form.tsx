'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CalendarPlus } from 'lucide-react'

interface Asset {
  id: string
  name: string
  asset_code: string
}

interface ActivityFormProps {
  onSuccess?: () => void
}

export function ActivityForm({ onSuccess }: ActivityFormProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    equipment_id: '',
    sector: '',
    category: 'equipment',
    periodicity: 'monthly',
    interval_value: '',
    next_execution: '',
    estimated_time_hours: '',
    priority: 'medium',
    assigned_to: '',
    observations: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchAssets()
  }, [])

  async function fetchAssets() {
    const { data } = await supabase
      .from('assets')
      .select('id, name, asset_code')
      .eq('is_active', true)
      .order('name')

    if (data) {
      setAssets(data as Asset[])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const user = (await supabase.auth.getUser()).data.user

      const { error: insertError } = await supabase.from('maintenance_plans').insert({
        name: formData.name,
        description: formData.description || null,
        equipment_id: formData.equipment_id || null,
        sector: formData.sector || null,
        type: 'preventive',
        category: formData.category,
        periodicity: formData.periodicity,
        interval_value: formData.interval_value ? parseFloat(formData.interval_value) : null,
        next_execution: formData.next_execution || null,
        estimated_time_hours: formData.estimated_time_hours ? parseFloat(formData.estimated_time_hours) : null,
        priority: formData.priority,
        assigned_to: formData.assigned_to || null,
        created_by: user?.id,
        is_active: true,
      })

      if (insertError) throw insertError

      setSuccess('Plano de manutenção preventiva criado com sucesso!')
      setFormData({
        name: '',
        description: '',
        equipment_id: '',
        sector: '',
        category: 'equipment',
        periodicity: 'monthly',
        interval_value: '',
        next_execution: '',
        estimated_time_hours: '',
        priority: 'medium',
        assigned_to: '',
        observations: '',
      })
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Erro ao criar plano')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarPlus className="h-5 w-5 text-[#28A745]" />
          Novo Plano Preventivo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="bg-[#DC3545]/10 border-[#DC3545]/30 text-[#DC3545]">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-[#28A745]/10 border-[#28A745]/30 text-[#28A745]">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Atividade *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Lubrificação de bombas"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment_id">Equipamento</Label>
              <select
                id="equipment_id"
                value={formData.equipment_id}
                onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
              >
                <option value="">Selecione</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.asset_code} - {asset.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sector">Setor</Label>
              <select
                id="sector"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
              >
                <option value="">Selecione</option>
                <option value="ETE">ETE</option>
                <option value="Laboratório">Laboratório</option>
                <option value="Administração">Administração</option>
                <option value="Estoque">Estoque</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
              >
                <option value="equipment">Equipamento</option>
                <option value="facility">Infraestrutura</option>
                <option value="safety">Segurança</option>
                <option value="environmental">Ambiental</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodicity">Periodicidade *</Label>
              <select
                id="periodicity"
                value={formData.periodicity}
                onChange={(e) => setFormData({ ...formData, periodicity: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
              >
                <option value="daily">Diária</option>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quinzenal</option>
                <option value="monthly">Mensal</option>
                <option value="bimonthly">Bimestral</option>
                <option value="quarterly">Trimestral</option>
                <option value="semiannual">Semestral</option>
                <option value="annual">Anual</option>
                <option value="hour_meter">Por Horímetro</option>
                <option value="hydrometer">Por Hidrômetro</option>
                <option value="production">Por Produção</option>
                <option value="custom">Personalizada</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interval_value">Intervalo</Label>
              <Input
                id="interval_value"
                type="number"
                value={formData.interval_value}
                onChange={(e) => setFormData({ ...formData, interval_value: e.target.value })}
                placeholder="Ex: 30 (dias)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_execution">Próxima Execução</Label>
              <Input
                id="next_execution"
                type="date"
                value={formData.next_execution}
                onChange={(e) => setFormData({ ...formData, next_execution: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_time_hours">Tempo Estimado (horas)</Label>
              <Input
                id="estimated_time_hours"
                type="number"
                step="0.5"
                value={formData.estimated_time_hours}
                onChange={(e) => setFormData({ ...formData, estimated_time_hours: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva a atividade..."
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="btn-gradient-green text-white border-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Plano Preventivo'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
