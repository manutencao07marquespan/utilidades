'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { Search, CalendarCheck, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

interface Activity {
  id: string
  name: string
  description: string | null
  category: string
  frequency_days: number | null
  next_due_date: string | null
  asset_code: string | null
  is_active: boolean
  created_at: string
}

export function ActivitiesList() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    fetchActivities()
  }, [search, categoryFilter])

  async function fetchActivities() {
    setLoading(true)
    let query = supabase
      .from('preventive_activities')
      .select('*')
      .order('next_due_date', { ascending: true })

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    if (categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter)
    }

    const { data } = await query

    if (data) {
      setActivities(data as Activity[])
    }
    setLoading(false)
  }

  function getCategoryLabel(category: string) {
    const labels: Record<string, string> = {
      equipment: 'Equipamento',
      facility: 'Infraestrutura',
      safety: 'Segurança',
      environmental: 'Ambiental',
      other: 'Outro',
    }
    return labels[category] || category
  }

  function getCategoryVariant(category: string) {
    const variants: Record<string, 'ok' | 'warning' | 'critical' | 'inactive'> = {
      equipment: 'ok',
      facility: 'warning',
      safety: 'critical',
      environmental: 'ok',
      other: 'inactive',
    }
    return variants[category] || 'ok'
  }

  function getDueStatus(dueDate: string | null) {
    if (!dueDate) return null
    const today = new Date()
    const due = new Date(dueDate)
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { label: 'Atrasada', variant: 'critical' as const, color: 'text-[#DC3545]' }
    if (diffDays <= 3) return { label: `${diffDays} dias`, variant: 'warning' as const, color: 'text-[#FFC107]' }
    if (diffDays <= 7) return { label: `${diffDays} dias`, variant: 'ok' as const, color: 'text-[#00b4d8]' }
    return { label: `${diffDays} dias`, variant: 'ok' as const, color: 'text-muted-foreground' }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5" />
          Atividades Preventivas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Pesquisar atividade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
          >
            <option value="all">Todas categorias</option>
            <option value="equipment">Equipamento</option>
            <option value="facility">Infraestrutura</option>
            <option value="safety">Segurança</option>
            <option value="environmental">Ambiental</option>
          </select>
        </div>

        {/* List */}
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Carregando...</p>
        ) : activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhuma atividade encontrada</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const dueStatus = getDueStatus(activity.next_due_date)
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {dueStatus?.variant === 'critical' ? (
                      <AlertTriangle className="h-5 w-5 text-[#DC3545]" />
                    ) : dueStatus?.variant === 'warning' ? (
                      <Clock className="h-5 w-5 text-[#FFC107]" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-[#28A745]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{activity.name}</span>
                      <StatusIndicator
                        variant={getCategoryVariant(activity.category)}
                        label={getCategoryLabel(activity.category)}
                      />
                    </div>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      {activity.asset_code && <span>Ativo: {activity.asset_code}</span>}
                      {activity.frequency_days && <span>Freq: {activity.frequency_days} dias</span>}
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    {activity.next_due_date ? (
                      <>
                        <p className="text-xs text-muted-foreground">Próxima</p>
                        <p className={`text-sm font-medium ${dueStatus?.color || ''}`}>
                          {formatDate(activity.next_due_date)}
                        </p>
                        {dueStatus && (
                          <p className={`text-xs font-medium ${dueStatus.color}`}>
                            {dueStatus.label}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">Sem prazo</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
