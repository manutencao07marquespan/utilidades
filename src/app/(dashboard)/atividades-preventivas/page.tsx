'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { StatsCard } from '@/components/shared/stats-card'
import { ActivityForm } from '@/components/atividades/activity-form'
import { ActivitiesList } from '@/components/atividades/activities-list'
import { ActivitiesCalendar } from '@/components/atividades/activities-calendar'
import { CalendarCheck, AlertTriangle, CheckCircle, Clock, Plus, Calendar } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AtividadesPreventivasPage() {
  const [activeTab, setActiveTab] = useState('calendar')
  const [stats, setStats] = useState({ pending: 0, overdue: 0, completed: 0, upcoming: 0 })
  const [refreshKey, setRefreshKey] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [refreshKey])

  async function fetchStats() {
    const { data: activities } = await supabase
      .from('preventive_activities')
      .select('next_due_date, is_active')

    if (activities) {
      const today = new Date()
      const next7Days = new Date()
      next7Days.setDate(today.getDate() + 7)

      const active = activities.filter((a: any) => a.is_active)
      const overdue = active.filter((a: any) => {
        if (!a.next_due_date) return false
        return new Date(a.next_due_date) < today
      }).length
      const upcoming = active.filter((a: any) => {
        if (!a.next_due_date) return false
        const due = new Date(a.next_due_date)
        return due >= today && due <= next7Days
      }).length
      const pending = active.filter((a: any) => {
        if (!a.next_due_date) return true
        return new Date(a.next_due_date) >= today
      }).length

      setStats({ pending, overdue, completed: 0, upcoming })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Atividades Preventivas"
        description="Gestão de manutenção preventiva e calendário de atividades"
        action={{
          label: 'Nova Atividade',
          onClick: () => setActiveTab('new'),
          icon: Plus,
        }}
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-4">
        <StatsCard
          title="Pendentes"
          value={stats.pending}
          subtitle="aguardando execução"
          icon={Clock}
          variant="default"
        />
        <StatsCard
          title="Atrasadas"
          value={stats.overdue}
          subtitle="requer ação urgente"
          icon={AlertTriangle}
          variant="danger"
        />
        <StatsCard
          title="Próximas"
          value={stats.upcoming}
          subtitle="próximos 7 dias"
          icon={CalendarCheck}
          variant="warning"
        />
        <StatsCard
          title="Total"
          value={stats.pending + stats.overdue}
          subtitle="atividades ativas"
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="list">
            <CalendarCheck className="h-4 w-4 mr-2" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="new">
            <Plus className="h-4 w-4 mr-2" />
            Nova Atividade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <ActivitiesCalendar key={`calendar-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="list">
          <ActivitiesList key={`list-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="new" className="space-y-6">
          <ActivityForm onSuccess={() => {
            setRefreshKey(k => k + 1)
            setActiveTab('calendar')
          }} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
