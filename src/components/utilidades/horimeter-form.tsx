'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Timer } from 'lucide-react'

interface HorimeterFormProps {
  onSuccess?: () => void
}

export function HorimeterForm({ onSuccess }: HorimeterFormProps) {
  const [formData, setFormData] = useState({
    reading_date: new Date().toISOString().split('T')[0],
    shift: '1A',
    well_code: '',
    current_hours: '',
    previous_hours: '',
    observations: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: insertError } = await supabase.from('well_horimeters').insert({
        reading_date: formData.reading_date,
        shift: formData.shift,
        well_code: formData.well_code,
        current_hours: parseFloat(formData.current_hours),
        previous_hours: formData.previous_hours ? parseFloat(formData.previous_hours) : null,
        observations: formData.observations || null,
      })

      if (insertError) throw insertError

      setSuccess('Leitura registrada com sucesso!')
      setFormData({
        ...formData,
        current_hours: '',
        previous_hours: '',
        observations: '',
      })
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar leitura')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-[#FFC107]" />
          Nova Leitura de Horímetro
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="well_code">Código Poço *</Label>
              <select
                id="well_code"
                value={formData.well_code}
                onChange={(e) => setFormData({ ...formData, well_code: e.target.value })}
                required
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
              >
                <option value="">Selecione o poço</option>
                <option value="POÇO 01">POÇO 01</option>
                <option value="POÇO 02">POÇO 02</option>
                <option value="POÇO 03">POÇO 03</option>
                <option value="POÇO 04">POÇO 04</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_hours">Horas Atuais *</Label>
              <Input
                id="current_hours"
                type="number"
                step="0.01"
                value={formData.current_hours}
                onChange={(e) => setFormData({ ...formData, current_hours: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="previous_hours">Horas Anteriores</Label>
              <Input
                id="previous_hours"
                type="number"
                step="0.01"
                value={formData.previous_hours}
                onChange={(e) => setFormData({ ...formData, previous_hours: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Input
                id="observations"
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Observações opcionais..."
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
                Salvando...
              </>
            ) : (
              'Registrar Leitura'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
