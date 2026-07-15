'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Droplets } from 'lucide-react'

interface CisternFormProps {
  onSuccess?: () => void
}

export function CisternForm({ onSuccess }: CisternFormProps) {
  const [formData, setFormData] = useState({
    reading_date: new Date().toISOString().split('T')[0],
    shift: '1A',
    cistern_code: '',
    level_percentage: '',
    level_meters: '',
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
      const { error: insertError } = await supabase.from('cistern_levels').insert({
        reading_date: formData.reading_date,
        shift: formData.shift,
        cistern_code: formData.cistern_code,
        level_percentage: formData.level_percentage ? parseFloat(formData.level_percentage) : null,
        level_meters: formData.level_meters ? parseFloat(formData.level_meters) : null,
        observations: formData.observations || null,
      })

      if (insertError) throw insertError

      setSuccess('Leitura registrada com sucesso!')
      setFormData({
        ...formData,
        level_percentage: '',
        level_meters: '',
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
          <Droplets className="h-5 w-5 text-[#00b4d8]" />
          Nova Leitura de Cisterna
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
              <Label htmlFor="cistern_code">Código Cisterna *</Label>
              <select
                id="cistern_code"
                value={formData.cistern_code}
                onChange={(e) => setFormData({ ...formData, cistern_code: e.target.value })}
                required
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
              >
                <option value="">Selecione a cisterna</option>
                <option value="BACIA AMORTECIMENTO - 296 M³">BACIA AMORTECIMENTO - 296 M³</option>
                <option value="CISTERNA LAVAGEM - 320 M³">CISTERNA LAVAGEM - 320 M³</option>
                <option value="CISTERNA E. BRUTO - 440 M³">CISTERNA E. BRUTO - 440 M³</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level_percentage">Nível (%)</Label>
              <Input
                id="level_percentage"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.level_percentage}
                onChange={(e) => setFormData({ ...formData, level_percentage: e.target.value })}
                placeholder="0-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level_meters">Nível (metros)</Label>
              <Input
                id="level_meters"
                type="number"
                step="0.01"
                value={formData.level_meters}
                onChange={(e) => setFormData({ ...formData, level_meters: e.target.value })}
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
