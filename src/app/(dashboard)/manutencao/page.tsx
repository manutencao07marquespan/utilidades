'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { StatsCard } from '@/components/shared/stats-card'
import { OSTable } from '@/components/manutencao/os-table'
import { OSDetail } from '@/components/manutencao/os-detail'
import { Wrench, AlertTriangle, CheckCircle, Clock, Plus, FileText } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

export default function ManutencaoPage() {
  const [activeTab, setActiveTab] = useState('orders')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [stats, setStats] = useState({ open: 0, inProgress: 0, completed: 0, overdue: 0 })
  const [refreshKey, setRefreshKey] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [refreshKey])

  async function fetchStats() {
    const { data: orders } = await supabase
      .from('maintenance_orders')
      .select('status, opened_at')

    if (orders) {
      const open = orders.filter((o: any) => o.status === 'open').length
      const inProgress = orders.filter((o: any) => o.status === 'in_progress').length
      const completed = orders.filter((o: any) => o.status === 'completed').length
      const today = new Date()
      const overdue = orders.filter((o: any) => {
        if (o.status === 'completed' || o.status === 'cancelled') return false
        return new Date(o.opened_at) < new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      }).length

      setStats({ open, inProgress, completed, overdue })
    }
  }

  function handleSelectOrder(order: any) {
    setSelectedOrder(order as Order)
    setActiveTab('detail')
  }

  if (selectedOrder && activeTab === 'detail') {
    return (
      <div className="space-y-6">
        <OSDetail
          order={selectedOrder}
          onBack={() => {
            setSelectedOrder(null)
            setActiveTab('orders')
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manutenção"
        description="Ordens de Serviço - Corretiva, Preventiva, Preditiva e Emergencial"
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-4">
        <StatsCard
          title="Abertas"
          value={stats.open}
          subtitle="aguardando execução"
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Em Andamento"
          value={stats.inProgress}
          subtitle="em execução"
          icon={Wrench}
          variant="default"
        />
        <StatsCard
          title="Concluídas"
          value={stats.completed}
          subtitle="este mês"
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Atrasadas"
          value={stats.overdue}
          subtitle="mais de 7 dias"
          icon={AlertTriangle}
          variant="danger"
        />
      </div>

      {/* Orders Table */}
      <OSTable
        onSelect={handleSelectOrder}
        refreshKey={refreshKey}
      />
    </div>
  )
}
