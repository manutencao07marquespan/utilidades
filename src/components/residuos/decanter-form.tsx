'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Droplets } from 'lucide-react'

interface DecanterFormProps {
  onSuccess?: () => void
}

export function DecanterForm({ onSuccess }: DecanterFormProps) {
  const [formData, setFormData] = useState({
    reading_date: new Date().toISOString().split('T')[0],
    shift: '1A',
    decanter_code: '',
    action_type: 'emptying',
    sludge_volume: '',
    sludge_destination: '',
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
      const user = (await supabase.auth.getUser()).data.user

      const { error: insertError } = await supabase.from('decanter_records').insert({
        reading_date: formData.reading_date,
        shift: formData.shift,
        decanter_code: formData.decanter_code,
        action_type: formData.action_type,
        sludge_volume: formData.sludge_volume ? parseFloat(formData.sludge_volume) : null,
        sludge_destination: formData.sludge_destination || null,
        observations: formData.observations || null,
        recorded_by: user?.id,
      })

      if (insertError) throw insertError

      setSuccess('Registro do decantador salvo com sucesso!')
      setFormData({
        ...formData,
        sludge_volume: '',
        sludge_destination: '',
        observations: '',
      })
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-[#6C757D]" />
          Registro de Decantador
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
              <Label htmlFor="decanter_code">Decantador *</Label>
              <select
                id="decanter_code"
                value={formData.decanter_code}
                onChange={(e) => setFormData({ ...formData, decanter_code: e.target.value })}
                required
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
              >
                <option value="">Selecione</option>
                <option value="DEC-01">DEC-01</option>
                <option value="DEC-02">DEC-02</option>
                <option value="DEC-03">DEC-03</option>
                <option value="DEC-04">DEC-04</option>
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
                <option value="emptying">Esgotamento</option>
                <option value="inspection">Inspeção</option>
                <option value="maintenance">Manutenção</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="sludge_destination">Destino do Lodo</Label>
              <select
                id="sludge_destination"
                value={formData.sludge_destination}
                onChange={(e) => setFormData({ ...formData, sludge_destination: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
              >
                <option value="">Selecione</option>
                <option value="Leito de Secagem">Leito de Secagem</option>
                <option value="Cooperativa">Cooperativa</option>
                <option value="Aterro Sanitário">Aterro Sanitário</option>
                <option value="Reciclagem">Reciclagem</option>
              </select>
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
            disabled={loading || !formData.decanter_code}
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
