'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Wrench, Plus } from 'lucide-react'

interface Asset {
  id: string
  name: string
  asset_code: string
}

interface ServiceRequestFormProps {
  onSuccess?: () => void
}

export function ServiceRequestForm({ onSuccess }: ServiceRequestFormProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    asset_id: '',
    due_date: '',
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

      const { error: insertError } = await supabase.from('service_requests').insert({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        asset_id: formData.asset_id || null,
        requested_by: user?.id,
        due_date: formData.due_date || null,
        status: 'open',
      })

      if (insertError) throw insertError

      setSuccess('Solicitação de serviço criada com sucesso!')
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        asset_id: '',
        due_date: '',
        observations: '',
      })
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Erro ao criar solicitação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-[#DC3545]" />
          Nova Solicitação de Serviço
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
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Bomba com vibração anormal"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade *</Label>
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

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o problema ou necessidade..."
              required
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asset_id">Ativo Relacionado</Label>
              <select
                id="asset_id"
                value={formData.asset_id}
                onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
              >
                <option value="">Nenhum</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.asset_code} - {asset.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Prazo</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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
              'Criar Solicitação'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
