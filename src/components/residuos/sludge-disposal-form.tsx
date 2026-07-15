'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Truck } from 'lucide-react'

interface SludgeDisposalFormProps {
  onSuccess?: () => void
}

export function SludgeDisposalForm({ onSuccess }: SludgeDisposalFormProps) {
  const [formData, setFormData] = useState({
    disposal_date: new Date().toISOString().split('T')[0],
    source: 'decanter',
    source_id: '',
    volume: '',
    destination: '',
    transport_company: '',
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

      const { error: insertError } = await supabase.from('sludge_disposals').insert({
        disposal_date: formData.disposal_date,
        source: formData.source,
        source_id: formData.source_id || null,
        volume: parseFloat(formData.volume),
        destination: formData.destination,
        transport_company: formData.transport_company || null,
        observations: formData.observations || null,
        recorded_by: user?.id,
      })

      if (insertError) throw insertError

      setSuccess('Destino do lodo registrado com sucesso!')
      setFormData({
        disposal_date: new Date().toISOString().split('T')[0],
        source: 'decanter',
        source_id: '',
        volume: '',
        destination: '',
        transport_company: '',
        observations: '',
      })
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar destino')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-[#6C757D]" />
          Destino Final do Lodo
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
              <Label htmlFor="disposal_date">Data *</Label>
              <Input
                id="disposal_date"
                type="date"
                value={formData.disposal_date}
                onChange={(e) => setFormData({ ...formData, disposal_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Origem *</Label>
              <select
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
              >
                <option value="decanter">Decantador</option>
                <option value="drying_bed">Leito de Secagem</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="volume">Volume (m³) *</Label>
              <Input
                id="volume"
                type="number"
                step="0.01"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="destination">Destino *</Label>
              <select
                id="destination"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                required
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
              >
                <option value="">Selecione</option>
                <option value="Cooperativa">Cooperativa</option>
                <option value="Aterro Sanitário">Aterro Sanitário</option>
                <option value="Reciclagem">Reciclagem</option>
                <option value="Tratamento Especial">Tratamento Especial</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transport_company">Transportadora</Label>
              <Input
                id="transport_company"
                value={formData.transport_company}
                onChange={(e) => setFormData({ ...formData, transport_company: e.target.value })}
                placeholder="Nome da empresa"
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
            disabled={loading}
            className="btn-gradient-green text-white border-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Registrar Destino'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
