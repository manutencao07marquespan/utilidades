'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { Search, Edit, Trash2, Save, X, ClipboardCheck, Loader2, CheckCircle, Plus } from 'lucide-react'

interface ChecklistTemplate {
  id: string
  name: string
  type: string
  category: string
  periodicity: string
  items: any
  sector: string | null
  is_active: boolean
  created_at: string
}

interface TemplatesListProps {
  onRefresh?: () => void
}

export function TemplatesList({ onRefresh }: TemplatesListProps) {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<ChecklistTemplate>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchTemplates()
  }, [search])

  async function fetchTemplates() {
    setLoading(true)
    let query = supabase
      .from('checklist_templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data } = await query

    if (data) {
      setTemplates(data as ChecklistTemplate[])
    }
    setLoading(false)
  }

  function startEditing(template: ChecklistTemplate) {
    setEditingId(template.id)
    setEditData({
      name: template.name,
      category: template.category,
      periodicity: template.periodicity,
      sector: template.sector || '',
    })
  }

  function cancelEditing() {
    setEditingId(null)
    setEditData({})
  }

  async function saveEdit() {
    if (!editingId) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: updateError } = await supabase
        .from('checklist_templates')
        .update({
          name: editData.name,
          category: editData.category,
          periodicity: editData.periodicity,
          sector: editData.sector || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId)

      if (updateError) throw updateError

      setSuccess('Modelo atualizado com sucesso!')
      setEditingId(null)
      setEditData({})
      fetchTemplates()
      onRefresh?.()
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar modelo')
    } finally {
      setSaving(false)
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Tem certeza que deseja excluir este modelo?')) return

    try {
      const { error } = await supabase
        .from('checklist_templates')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSuccess('Modelo excluído com sucesso!')
      fetchTemplates()
      onRefresh?.()
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir modelo')
    }
  }

  function getCategoryLabel(category: string) {
    const labels: Record<string, string> = {
      daily: 'Diária',
      weekly: 'Semanal',
      monthly: 'Mensal',
      lubrication: 'Lubrificação',
      inspection: 'Inspeção',
      custom: 'Personalizada',
    }
    return labels[category] || category
  }

  function getPeriodicityLabel(periodicity: string) {
    const labels: Record<string, string> = {
      daily: 'Diária',
      weekly: 'Semanal',
      biweekly: 'Quinzenal',
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      annual: 'Anual',
    }
    return labels[periodicity] || periodicity
  }

  function getItemsCount(items: any) {
    if (Array.isArray(items)) return items.length
    if (items && typeof items === 'object') return Object.keys(items).length
    return 0
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Modelos de Checklist
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {templates.length} modelo(s)
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 bg-[#DC3545]/10 border-[#DC3545]/30 text-[#DC3545]">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 bg-[#28A745]/10 border-[#28A745]/30 text-[#28A745]">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Pesquisar modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
            />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum modelo encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-4 rounded-xl border hover:bg-muted/30 transition-colors"
              >
                {editingId === template.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Nome</Label>
                        <Input
                          value={editData.name || ''}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Categoria</Label>
                        <select
                          value={editData.category || ''}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                          className="w-full h-8 px-2 rounded-lg border border-input bg-transparent text-sm"
                        >
                          <option value="daily">Diária</option>
                          <option value="weekly">Semanal</option>
                          <option value="monthly">Mensal</option>
                          <option value="lubrication">Lubrificação</option>
                          <option value="inspection">Inspeção</option>
                          <option value="custom">Personalizada</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Periodicidade</Label>
                        <select
                          value={editData.periodicity || ''}
                          onChange={(e) => setEditData({ ...editData, periodicity: e.target.value })}
                          className="w-full h-8 px-2 rounded-lg border border-input bg-transparent text-sm"
                        >
                          <option value="daily">Diária</option>
                          <option value="weekly">Semanal</option>
                          <option value="monthly">Mensal</option>
                          <option value="quarterly">Trimestral</option>
                          <option value="annual">Anual</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Setor</Label>
                        <Input
                          value={editData.sector || ''}
                          onChange={(e) => setEditData({ ...editData, sector: e.target.value })}
                          className="h-8 text-sm"
                          placeholder="Ex: ETE"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={saveEdit}
                        disabled={saving}
                        className="btn-gradient-green text-white border-0"
                      >
                        {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                        Salvar
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditing}>
                        <X className="h-3 w-3 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{template.name}</span>
                        <StatusIndicator
                          variant={template.is_active ? 'ok' : 'inactive'}
                          label={template.is_active ? 'Ativo' : 'Inativo'}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 rounded bg-muted">{getCategoryLabel(template.category)}</span>
                        <span className="px-2 py-0.5 rounded bg-muted">{getPeriodicityLabel(template.periodicity)}</span>
                        <span>{getItemsCount(template.items)} itens</span>
                        {template.sector && <span className="px-2 py-0.5 rounded bg-muted">{template.sector}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(template)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTemplate(template.id)}
                        className="h-8 w-8 p-0 text-[#DC3545] hover:text-[#c82333]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
