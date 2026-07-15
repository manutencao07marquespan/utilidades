'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { Search, FileText, Eye } from 'lucide-react'

interface Order {
  id: string
  os_number: string
  type: string
  priority: string
  status: string
  title: string
  sector: string | null
  opened_at: string
  assets?: { name: string; asset_code: string } | null
  user_profiles?: { full_name: string } | null
}

interface OSTableProps {
  onSelect?: (order: Order) => void
  refreshKey?: number
}

export function OSTable({ onSelect, refreshKey }: OSTableProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()
  }, [search, typeFilter, statusFilter, refreshKey])

  async function fetchOrders() {
    setLoading(true)
    let query = supabase
      .from('maintenance_orders')
      .select('*, assets(name, asset_code), user_profiles!assigned_to(full_name)')
      .order('opened_at', { ascending: false })

    if (search) {
      query = query.or(`os_number.ilike.%${search}%,title.ilike.%${search}%`)
    }

    if (typeFilter !== 'all') {
      query = query.eq('type', typeFilter)
    }

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data } = await query

    if (data) {
      setOrders(data as Order[])
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

  function getTypeVariant(type: string) {
    const variants: Record<string, 'ok' | 'warning' | 'critical' | 'inactive'> = {
      corrective: 'warning',
      preventive: 'ok',
      predictive: 'critical',
      emergency: 'critical',
    }
    return variants[type] || 'ok'
  }

  function getPriorityVariant(priority: string) {
    const variants: Record<string, 'ok' | 'warning' | 'critical' | 'inactive'> = {
      low: 'ok',
      medium: 'warning',
      high: 'critical',
      critical: 'critical',
    }
    return variants[priority] || 'ok'
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
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Ordens de Serviço
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Pesquisar por nº OS ou título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
          >
            <option value="all">Todos tipos</option>
            <option value="corrective">Corretiva</option>
            <option value="preventive">Preventiva</option>
            <option value="predictive">Preditiva</option>
            <option value="emergency">Emergencial</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
          >
            <option value="all">Todos status</option>
            <option value="open">Aberta</option>
            <option value="in_progress">Em Andamento</option>
            <option value="waiting_parts">Aguardando Peças</option>
            <option value="completed">Concluída</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 text-xs font-medium text-muted-foreground">Nº OS</th>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground">Tipo</th>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground">Equipamento</th>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground hidden md:table-cell">Setor</th>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground hidden lg:table-cell">Prioridade</th>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground hidden xl:table-cell">Responsável</th>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground">Data</th>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-right p-2 text-xs font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    Nenhuma OS encontrada
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusConfig = getStatusConfig(order.status)
                  return (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-2 font-mono text-sm font-bold">{order.os_number}</td>
                      <td className="p-2">
                        <StatusIndicator
                          variant={getTypeVariant(order.type)}
                          label={getTypeLabel(order.type)}
                        />
                      </td>
                      <td className="p-2 text-sm">
                        <div>
                          <span className="font-medium">{order.assets?.name || '-'}</span>
                          {order.assets?.asset_code && (
                            <p className="text-xs text-muted-foreground">{order.assets.asset_code}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-2 text-sm text-muted-foreground hidden md:table-cell">
                        {order.sector || '-'}
                      </td>
                      <td className="p-2 hidden lg:table-cell">
                        <StatusIndicator
                          variant={getPriorityVariant(order.priority)}
                          label={getPriorityLabel(order.priority)}
                        />
                      </td>
                      <td className="p-2 text-sm text-muted-foreground hidden xl:table-cell">
                        {order.user_profiles?.full_name || '-'}
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {formatDate(order.opened_at)}
                      </td>
                      <td className="p-2">
                        <StatusIndicator
                          variant={statusConfig.variant}
                          label={statusConfig.label}
                        />
                      </td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => onSelect?.(order)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg hover:bg-muted transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Abrir
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
