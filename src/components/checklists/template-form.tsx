'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plus, Trash2 } from 'lucide-react'

interface TemplateItem {
  id: string
  question: string
  response_type: string
  is_required: boolean
  require_photo: boolean
  weight: number
}

interface TemplateFormProps {
  onSuccess?: () => void
}

export function TemplateForm({ onSuccess }: TemplateFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'daily',
    periodicity: 'daily',
    sector: '',
    estimated_time_minutes: '',
    require_photo: false,
    require_signature: true,
    require_qr: true,
    require_gps: false,
  })
  const [items, setItems] = useState<TemplateItem[]>([])
  const [newItem, setNewItem] = useState({
    question: '',
    response_type: 'boolean',
    is_required: true,
    require_photo: false,
    weight: 1,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  function addItem() {
    if (!newItem.question.trim()) return

    setItems([
      ...items,
      {
        id: Date.now().toString(),
        question: newItem.question,
        response_type: newItem.response_type,
        is_required: newItem.is_required,
        require_photo: newItem.require_photo,
        weight: newItem.weight,
      },
    ])
    setNewItem({
      question: '',
      response_type: 'boolean',
      is_required: true,
      require_photo: false,
      weight: 1,
    })
  }

  function removeItem(id: string) {
    setItems(items.filter(item => item.id !== id))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) {
      setError('Adicione pelo menos um item ao checklist')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const user = (await supabase.auth.getUser()).data.user

      // Convert items to JSON
      const itemsJson = items.map((item, index) => ({
        id: item.id,
        order: index,
        question: item.question,
        response_type: item.response_type,
        is_required: item.is_required,
        require_photo: item.require_photo,
        weight: item.weight,
      }))

      // Generate QR code data
      const qrCodeData = `CHECKLIST_${Date.now()}_${formData.name.replace(/\s/g, '_').toUpperCase()}`

      // Create template
      const { data: template, error: templateError } = await supabase
        .from('checklist_templates')
        .insert({
          name: formData.name,
          type: 'daily',
          items: itemsJson,
          qr_code_data: qrCodeData,
          description: formData.description || null,
          category: formData.category,
          periodicity: formData.periodicity,
          sector: formData.sector || null,
          estimated_time_minutes: formData.estimated_time_minutes ? parseInt(formData.estimated_time_minutes) : null,
          require_photo: formData.require_photo,
          require_signature: formData.require_signature,
          require_qr: formData.require_qr,
          require_gps: formData.require_gps,
          created_by: user?.id,
          is_active: true,
        })
        .select()
        .single()

      if (templateError) throw templateError

      // Create items
      const itemsToInsert = items.map((item, index) => ({
        template_id: template.id,
        order_index: index,
        question: item.question,
        response_type: item.response_type,
        is_required: item.is_required,
        require_photo: item.require_photo,
        weight: item.weight,
      }))

      const { error: itemsError } = await supabase
        .from('checklist_template_items')
        .insert(itemsToInsert)

      if (itemsError) throw itemsError

      setSuccess('Modelo de checklist criado com sucesso!')
      setFormData({
        name: '',
        description: '',
        category: 'daily',
        periodicity: 'daily',
        sector: '',
        estimated_time_minutes: '',
        require_photo: false,
        require_signature: true,
        require_qr: true,
        require_gps: false,
      })
      setItems([])
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Erro ao criar modelo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-[#28A745]" />
          Novo Modelo de Checklist
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
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Inspeção Diária Bombas"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
              >
                <option value="daily">Diária</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="lubrication">Lubrificação</option>
                <option value="inspection">Inspeção</option>
                <option value="custom">Personalizada</option>
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
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
              >
                <option value="">Todos</option>
                <option value="ETE">ETE</option>
                <option value="Laboratório">Laboratório</option>
                <option value="Administrativo">Administrativo</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_time_minutes">Tempo Estimado (min)</Label>
              <Input
                id="estimated_time_minutes"
                type="number"
                value={formData.estimated_time_minutes}
                onChange={(e) => setFormData({ ...formData, estimated_time_minutes: e.target.value })}
                placeholder="5"
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <div className="flex flex-wrap gap-4 h-10 items-center">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.require_signature}
                    onChange={(e) => setFormData({ ...formData, require_signature: e.target.checked })}
                    className="rounded"
                  />
                  Assinatura
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.require_qr}
                    onChange={(e) => setFormData({ ...formData, require_qr: e.target.checked })}
                    className="rounded"
                  />
                  QR Code
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.require_gps}
                    onChange={(e) => setFormData({ ...formData, require_gps: e.target.checked })}
                    className="rounded"
                  />
                  GPS
                </label>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="border rounded-xl p-4 space-y-4">
            <h4 className="font-medium text-sm">Itens do Checklist ({items.length})</h4>

            {/* Add Item Form */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                placeholder="Adicionar pergunta..."
                value={newItem.question}
                onChange={(e) => setNewItem({ ...newItem, question: e.target.value })}
                className="flex-1 h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
              />
              <select
                value={newItem.response_type}
                onChange={(e) => setNewItem({ ...newItem, response_type: e.target.value })}
                className="h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
              >
                <option value="boolean">Sim/Não</option>
                <option value="text">Texto</option>
                <option value="number">Número</option>
                <option value="select">Lista</option>
              </select>
              <Button type="button" onClick={addItem} className="btn-gradient-green text-white border-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Items List */}
            {items.length > 0 && (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                  >
                    <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                    <span className="flex-1 text-sm">{item.question}</span>
                    <span className="text-xs text-muted-foreground px-2 py-1 bg-background rounded">
                      {item.response_type === 'boolean' ? 'Sim/Não' :
                       item.response_type === 'text' ? 'Texto' :
                       item.response_type === 'number' ? 'Número' : 'Lista'}
                    </span>
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={item.is_required}
                        onChange={(e) => {
                          setItems(items.map(i =>
                            i.id === item.id ? { ...i, is_required: e.target.checked } : i
                          ))
                        }}
                        className="rounded"
                      />
                      Obrigatório
                    </label>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-[#DC3545] hover:text-[#c82333]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || items.length === 0}
            className="btn-gradient-green text-white border-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Modelo'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
