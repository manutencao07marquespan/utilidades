'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { ArrowLeft, CheckCircle, Clock, Package, Wrench, Camera } from 'lucide-react'

interface Order {
  id: string
  os_number: string
  type: string
  priority: string
  status: string
  title: string
  description: string | null
  sector: string | null
  opened_at: string
  started_at: string | null
  finished_at: string | null
  hours_worked: number | null
  team_members: string | null
  tools_used: string | null
  observations: string | null
  assets?: { name: string; asset_code: string; location: string | null } | null
  user_profiles?: { full_name: string } | null
}

interface ChecklistItem {
  id: string
  title: string
  completed: boolean
  observation: string | null
}

interface MaterialUsed {
  id: string
  quantity: number
  products?: { name: string; unit: string } | null
}

interface EquipmentHistory {
  os_number: string
  type: string
  title: string
  finished_at: string
}

interface OSDetailProps {
  order: Order
  onBack: () => void
}

export function OSDetail({ order, onBack }: OSDetailProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [materials, setMaterials] = useState<MaterialUsed[]>([])
  const [history, setHistory] = useState<EquipmentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchDetails()
  }, [order.id])

  async function fetchDetails() {
    setLoading(true)

    // Fetch checklist
    const { data: checklistData } = await supabase
      .from('maintenance_order_checklist')
      .select('id, completed, observation, maintenance_checklists(title)')
      .eq('order_id', order.id)

    if (checklistData) {
      setChecklist(checklistData.map((c: any) => ({
        id: c.id,
        title: c.maintenance_checklists?.title || '',
        completed: c.completed,
        observation: c.observation,
      })))
    }

    // Fetch materials
    const { data: materialsData } = await supabase
      .from('maintenance_order_materials')
      .select('id, quantity, products(name, unit)')
      .eq('order_id', order.id)

    if (materialsData) {
      setMaterials(materialsData as MaterialUsed[])
    }

    // Fetch equipment history
    if (order.assets) {
      const { data: historyData } = await supabase
        .rpc('get_equipment_history', { p_equipment_id: order.assets.name ? order.id : null })

      if (historyData) {
        setHistory(historyData as EquipmentHistory[])
      }
    }

    setLoading(false)
  }

  function getStatusConfig(status: string) {
    const configs: Record<string, { label: string; variant: 'ok' | 'warning' | 'critical' | 'inactive' }> = {
      open: { label: 'Aberta', variant: 'warning' },
      in_progress: { label: 'Em Andamento', variant: 'ok' },
      paused: { label: 'Pausada', variant: 'inactive' },
      waiting_parts: { label: 'Aguardando Peças', variant: 'critical' },
      completed: { label: 'Concluída', variant: 'ok' },
      cancelled: { label: 'Cancelada', variant: 'inactive' },
    }
    return configs[status] || { label: status, variant: 'ok' }
  }

  function getTypeLabel(type: string) {
    const labels: Record<string, string> = {
      corrective: 'Corretiva',
      preventive: 'Preventiva',
      predictive: 'Preditiva',
      emergency: 'Emergencial',
    }
    return labels[type] || type
  }

  function getPriorityLabel(priority: string) {
    const labels: Record<string, string> = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      critical: 'Crítica',
    }
    return labels[priority] || priority
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('pt-BR')
  }

  const statusConfig = getStatusConfig(order.status)
  const completedItems = checklist.filter(c => c.completed).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{order.os_number}</h2>
            <p className="text-muted-foreground">{order.title}</p>
          </div>
        </div>
        <StatusIndicator variant={statusConfig.variant} label={statusConfig.label} />
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tipo</span>
                <span className="text-sm font-medium">{getTypeLabel(order.type)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Prioridade</span>
                <span className="text-sm font-medium">{getPriorityLabel(order.priority)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Setor</span>
                <span className="text-sm font-medium">{order.sector || '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Equipamento</span>
                <span className="text-sm font-medium">{order.assets?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Código</span>
                <span className="text-sm font-medium">{order.assets?.asset_code || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Local</span>
                <span className="text-sm font-medium">{order.assets?.location || '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Abertura</span>
                <span className="text-sm font-medium">{formatDateTime(order.opened_at)}</span>
              </div>
              {order.started_at && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Início</span>
                  <span className="text-sm font-medium">{formatDateTime(order.started_at)}</span>
                </div>
              )}
              {order.finished_at && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Conclusão</span>
                  <span className="text-sm font-medium">{formatDateTime(order.finished_at)}</span>
                </div>
              )}
              {order.hours_worked && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Horas</span>
                  <span className="text-sm font-medium">{order.hours_worked}h</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {order.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{order.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Checklist */}
      {checklist.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4" />
              Checklist ({completedItems}/{checklist.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-2 rounded-lg ${item.completed ? 'bg-[#28A745]/5' : 'bg-muted/30'}`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    item.completed ? 'bg-[#28A745] border-[#28A745]' : 'border-muted-foreground/30'
                  }`}>
                    {item.completed && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                  <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Materials */}
      {materials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4" />
              Materiais Utilizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-xs font-medium text-muted-foreground">Produto</th>
                  <th className="text-right p-2 text-xs font-medium text-muted-foreground">Qtd</th>
                  <th className="text-left p-2 text-xs font-medium text-muted-foreground">Unidade</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((mat) => (
                  <tr key={mat.id} className="border-b last:border-0">
                    <td className="p-2 text-sm">{mat.products?.name || '-'}</td>
                    <td className="p-2 text-sm text-right font-medium">{mat.quantity}</td>
                    <td className="p-2 text-sm text-muted-foreground">{mat.products?.unit || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Equipment History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wrench className="h-4 w-4" />
              Histórico do Equipamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground w-20">
                    {h.finished_at ? formatDate(h.finished_at) : '-'}
                  </div>
                  <span className="text-sm font-medium">{h.title}</span>
                  <StatusIndicator variant="ok" label={getTypeLabel(h.type)} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
