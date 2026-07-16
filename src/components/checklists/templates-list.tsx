'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StatusIndicator } from '@/components/shared/status-indicator'
import {
  Search, Edit, Trash2, Save, X, ClipboardCheck, Loader2,
  CheckCircle, Plus, Eye, Printer, QrCode, Copy, ArrowLeft
} from 'lucide-react'

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
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<Partial<ChecklistTemplate>>({})
  const [editItems, setEditItems] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!selectedTemplate) {
      fetchTemplates()
    }
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

  async function openDetails(template: ChecklistTemplate) {
    setSelectedTemplate(template)
    setEditData({
      name: template.name,
      category: template.category,
      periodicity: template.periodicity,
      sector: template.sector || '',
    })
    // Parse items from JSON
    const items = Array.isArray(template.items) ? template.items : []
    setEditItems(items)
    setEditMode(false)
  }

  function closeDetails() {
    setSelectedTemplate(null)
    setEditMode(false)
    setEditData({})
    setEditItems([])
    fetchTemplates()
    onRefresh?.()
  }

  async function saveEdit() {
    if (!selectedTemplate) return
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
          items: editItems,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedTemplate.id)

      if (updateError) throw updateError

      setSuccess('Modelo atualizado com sucesso!')
      setEditMode(false)
      setSelectedTemplate({
        ...selectedTemplate,
        ...editData,
        items: editItems,
      })
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar')
    } finally {
      setSaving(false)
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Tem certeza que deseja excluir este modelo?')) return
    try {
      await supabase.from('checklist_templates').delete().eq('id', id)
      setSuccess('Modelo excluído!')
      closeDetails()
    } catch (err: any) {
      setError(err.message)
    }
  }

  function addItem() {
    setEditItems([
      ...editItems,
      {
        id: Date.now().toString(),
        order: editItems.length,
        question: '',
        response_type: 'boolean',
        is_required: true,
        weight: 1,
      },
    ])
  }

  function removeItem(index: number) {
    setEditItems(editItems.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: string, value: any) {
    setEditItems(editItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ))
  }

  function printQRCode() {
    if (!selectedTemplate) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=checklist:${selectedTemplate.id}`
    const itemsList = editItems.map((item, i) =>
      `<li style="padding:8px 0;border-bottom:1px solid #eee;display:flex;align-items:center;gap:10px">
        <span style="width:24px;height:24px;border:2px solid #28A745;border-radius:4px;display:inline-block"></span>
        <span style="font-size:14px">${item.question || `Item ${i + 1}`}</span>
      </li>`
    ).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedTemplate.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
          .header { text-align: center; border: 3px solid #1A3A5A; padding: 15px; border-radius: 10px; }
          .title { font-size: 18px; font-weight: bold; color: #1A3A5A; margin: 10px 0; }
          .subtitle { font-size: 12px; color: #666; margin: 5px 0; }
          .qr { text-align: center; margin: 15px 0; }
          .qr img { width: 150px; height: 150px; }
          .code { font-size: 10px; color: #999; text-align: center; margin: 5px 0; }
          .items { margin-top: 15px; }
          .items h3 { font-size: 14px; color: #1A3A5A; margin-bottom: 10px; }
          .items ul { list-style: none; padding: 0; }
          .footer { text-align: center; font-size: 10px; color: #999; margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">PORTAL DE UTILIDADES</div>
          <div class="title">${selectedTemplate.name}</div>
          <div class="subtitle">Categoria: ${getCategoryLabel(selectedTemplate.category)} | Periodicidade: ${getPeriodicityLabel(selectedTemplate.periodicity)}</div>
          ${selectedTemplate.sector ? `<div class="subtitle">Setor: ${selectedTemplate.sector}</div>` : ''}
          <div class="qr">
            <img src="${qrUrl}" alt="QR Code" />
          </div>
          <div class="code">Código: ${selectedTemplate.id.substring(0, 8).toUpperCase()}</div>
          <div class="subtitle">Escaneie para iniciar o checklist</div>
        </div>
        <div class="items">
          <h3>Itens do Checklist</h3>
          <ul>${itemsList}</ul>
        </div>
        <div class="footer">
          Portal de Utilidades - Sistema de Controle para ETE<br/>
          ${new Date().toLocaleDateString('pt-BR')}
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  function getCategoryLabel(category: string) {
    const labels: Record<string, string> = {
      daily: 'Diária', weekly: 'Semanal', monthly: 'Mensal',
      lubrication: 'Lubrificação', inspection: 'Inspeção', custom: 'Personalizada',
    }
    return labels[category] || category
  }

  function getPeriodicityLabel(periodicity: string) {
    const labels: Record<string, string> = {
      daily: 'Diária', weekly: 'Semanal', monthly: 'Mensal',
      quarterly: 'Trimestral', annual: 'Anual',
    }
    return labels[periodicity] || periodicity
  }

  // Detail view
  if (selectedTemplate) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={closeDetails}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  {editMode ? 'Editando Modelo' : selectedTemplate.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Código: {selectedTemplate.id.substring(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!editMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={printQRCode}>
                    <Printer className="h-4 w-4 mr-1" />
                    Imprimir QR
                  </Button>
                  <Button size="sm" onClick={() => setEditMode(true)} className="btn-gradient-green text-white border-0">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteTemplate(selectedTemplate.id)} className="text-[#DC3545]">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" onClick={saveEdit} disabled={saving} className="btn-gradient-green text-white border-0">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                    Salvar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <Alert className="bg-[#DC3545]/10 border-[#DC3545]/30 text-[#DC3545]"><AlertDescription>{error}</AlertDescription></Alert>}
          {success && <Alert className="bg-[#28A745]/10 border-[#28A745]/30 text-[#28A745]"><CheckCircle className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}

          {/* QR Code Preview */}
          <div className="flex items-center gap-6 p-4 rounded-xl bg-muted/30 border">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=checklist:${selectedTemplate.id}`}
              alt="QR Code"
              className="w-32 h-32 rounded-lg"
            />
            <div>
              <h4 className="font-medium text-sm">QR Code do Checklist</h4>
              <p className="text-xs text-muted-foreground mt-1">Escaneie para iniciar a inspeção</p>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={printQRCode}>
                  <Printer className="h-3 w-3 mr-1" />
                  Imprimir Etiqueta
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  navigator.clipboard.writeText(`checklist:${selectedTemplate.id}`)
                  setSuccess('Código copiado!')
                }}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar Código
                </Button>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          {editMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={editData.name || ''} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <select value={editData.category || ''} onChange={(e) => setEditData({ ...editData, category: e.target.value })} className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm">
                  <option value="daily">Diária</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                  <option value="lubrication">Lubrificação</option>
                  <option value="inspection">Inspeção</option>
                  <option value="custom">Personalizada</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Periodicidade</Label>
                <select value={editData.periodicity || ''} onChange={(e) => setEditData({ ...editData, periodicity: e.target.value })} className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm">
                  <option value="daily">Diária</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="annual">Anual</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Setor</Label>
                <Input value={editData.sector || ''} onChange={(e) => setEditData({ ...editData, sector: e.target.value })} placeholder="Ex: ETE" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span className="text-muted-foreground">Categoria:</span> <span className="font-medium">{getCategoryLabel(selectedTemplate.category)}</span></div>
              <div><span className="text-muted-foreground">Periodicidade:</span> <span className="font-medium">{getPeriodicityLabel(selectedTemplate.periodicity)}</span></div>
              <div><span className="text-muted-foreground">Setor:</span> <span className="font-medium">{selectedTemplate.sector || 'Todos'}</span></div>
              <div><span className="text-muted-foreground">Status:</span> <StatusIndicator variant={selectedTemplate.is_active ? 'ok' : 'inactive'} label={selectedTemplate.is_active ? 'Ativo' : 'Inativo'} /></div>
            </div>
          )}

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Itens do Checklist ({editItems.length})</h4>
              {editMode && (
                <Button size="sm" variant="outline" onClick={addItem}>
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar Item
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {editItems.map((item, index) => (
                <div key={item.id || index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                  {editMode ? (
                    <>
                      <Input
                        value={item.question}
                        onChange={(e) => updateItem(index, 'question', e.target.value)}
                        className="flex-1 h-8 text-sm"
                        placeholder="Pergunta..."
                      />
                      <select
                        value={item.response_type}
                        onChange={(e) => updateItem(index, 'response_type', e.target.value)}
                        className="h-8 px-2 rounded-lg border border-input bg-transparent text-xs w-28"
                      >
                        <option value="boolean">Sim/Não</option>
                        <option value="text">Texto</option>
                        <option value="number">Número</option>
                      </select>
                      <label className="flex items-center gap-1 text-xs">
                        <input type="checkbox" checked={item.is_required} onChange={(e) => updateItem(index, 'is_required', e.target.checked)} className="rounded" />
                        Obrig.
                      </label>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-[#DC3545]" onClick={() => removeItem(index)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm">{item.question}</span>
                      <span className="text-xs px-2 py-0.5 bg-background rounded">{item.response_type === 'boolean' ? 'Sim/Não' : item.response_type}</span>
                      {item.is_required && <span className="text-xs text-[#DC3545]">*Obrig.</span>}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // List view
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          Modelos de Checklist
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <Alert className="mb-4 bg-[#DC3545]/10 border-[#DC3545]/30 text-[#DC3545]"><AlertDescription>{error}</AlertDescription></Alert>}
        {success && <Alert className="mb-4 bg-[#28A745]/10 border-[#28A745]/30 text-[#28A745]"><CheckCircle className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}

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

        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum modelo encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => {
              const itemsCount = Array.isArray(template.items) ? template.items.length : 0
              return (
                <div
                  key={template.id}
                  className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => openDetails(template)}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#00b4d8]/10 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="h-5 w-5 text-[#00b4d8]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{template.name}</span>
                      <StatusIndicator variant={template.is_active ? 'ok' : 'inactive'} label={template.is_active ? 'Ativo' : 'Inativo'} />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="px-2 py-0.5 rounded bg-muted">{getCategoryLabel(template.category)}</span>
                      <span className="px-2 py-0.5 rounded bg-muted">{getPeriodicityLabel(template.periodicity)}</span>
                      <span>{itemsCount} itens</span>
                      {template.sector && <span className="px-2 py-0.5 rounded bg-muted">{template.sector}</span>}
                    </div>
                  </div>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
