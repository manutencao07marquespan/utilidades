'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Sun } from 'lucide-react'

interface DryingBed {
  id: string
  bed_code: string
  status: string
}

interface DryingBedFormProps {
  onSuccess?: () => void
}

export function DryingBedForm({ onSuccess }: DryingBedFormProps) {
  const [beds, setBeds] = useState<DryingBed[]>([])
  const [formData, setFormData] = useState({
    reading_date: new Date().toISOString().split('T')[0],
    shift: '1A',
    bed_id: '',
    action_type: 'open',
    sludge_volume: '',
    observations: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchBeds()
  }, [])

  async function fetchBeds() {
    const { data } = await supabase
      .from('drying_beds')
      .select('id, bed_code, status')
      .order('bed_code')

    if (data) {
      setBeds(data as DryingBed[])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const user = (await supabase.auth.getUser()).data.user

      const { error: insertError } = await supabase.from('drying_bed_records').insert({
        bed_id: formData.bed_id,
        action_type: formData.action_type,
        sludge_volume: formData.sludge_volume ? parseFloat(formData.sludge_volume) : null,
        observations: formData.observations || null,
        recorded_by: user?.id,
      })

      if (insertError) throw insertError

      // Update bed status based on action
      let newStatus = 'available'
      if (formData.action_type === 'open') newStatus = 'in_use'
      else if (formData.action_type === 'close') newStatus = 'drying'
      else if (formData.action_type === 'remove_sludge') newStatus = 'available'

      await supabase
        .from('drying_beds')
        .update({ status: newStatus })
        .eq('id', formData.bed_id)

      setSuccess('Registro do leito de secagem salvo com sucesso!')
      setFormData({
        ...formData,
        sludge_volume: '',
        observations: '',
      })
      fetchBeds()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar registro')
    } finally {
      setLoading(false)
    }
  }

  function getBedStatusLabel(status: string) {
    const labels: Record<string, string> = {
      available: 'Disponível',
      in_use: 'Em Uso',
      drying: 'Secando',
      completed: 'Concluído',
    }
    return labels[status] || status
  }

  function getBedStatusVariant(status: string) {
    const variants: Record<string, 'ok' | 'warning' | 'critical' | 'inactive'> = {
      available: 'ok',
      in_use: 'warning',
      drying: 'critical',
      completed: 'inactive',
    }
    return variants[status] || 'ok'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-[#FFC107]" />
          Registro de Leito de Secagem
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reading_date">Data *</Label>
              <Input
                id="reading_date"
                type="date"
                value={formData.reading_date}
                onChange={(e) => setFormData({ ...formData, reading_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift">Turno *</Label>
              <select
                id="shift"
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
              >
                <option value="1A">Turno 1A</option>
                <option value="1B">Turno 1B</option>
                <option value="2A">Turno 2A</option>
                <option value="2B">Turno 2B</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bed_id">Leito *</Label>
              <select
                id="bed_id"
                value={formData.bed_id}
                onChange={(e) => setFormData({ ...formData, bed_id: e.target.value })}
                required
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
              >
                <option value="">Selecione</option>
                {beds.map((bed) => (
                  <option key={bed.id} value={bed.id}>
                    {bed.bed_code} ({getBedStatusLabel(bed.status)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action_type">Ação *</Label>
              <select
                id="action_type"
                value={formData.action_type}
                onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
              >
                <option value="open">Abrir</option>
                <option value="close">Fechar</option>
                <option value="remove_sludge">Remover Lodo</option>
                <option value="inspect">Inspeção</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sludge_volume">Volume de Lodo (m³)</Label>
              <Input
                id="sludge_volume"
                type="number"
                step="0.01"
                value={formData.sludge_volume}
                onChange={(e) => setFormData({ ...formData, sludge_volume: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Input
                id="observations"
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Observações..."
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !formData.bed_id}
            className="btn-gradient-green text-white border-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Registrar'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
