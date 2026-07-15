'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface Activity {
  id: string
  name: string
  category: string
  next_due_date: string | null
  asset_code: string | null
}

export function ActivitiesCalendar() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchActivities()
  }, [])

  async function fetchActivities() {
    setLoading(true)
    const { data } = await supabase
      .from('preventive_activities')
      .select('id, name, category, next_due_date, asset_code')
      .eq('is_active', true)
      .not('next_due_date', 'is', null)
      .order('next_due_date')

    if (data) {
      setActivities(data as Activity[])
    }
    setLoading(false)
  }

  function getDaysInMonth(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  function getActivitiesForDate(date: Date) {
    const dateStr = date.toISOString().split('T')[0]
    return activities.filter(a => a.next_due_date === dateStr)
  }

  function prevMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  function isToday(date: Date) {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  function getCategoryColor(category: string) {
    const colors: Record<string, string> = {
      equipment: 'bg-[#28A745]',
      facility: 'bg-[#FFC107]',
      safety: 'bg-[#DC3545]',
      environmental: 'bg-[#00b4d8]',
      other: 'bg-[#6C757D]',
    }
    return colors[category] || 'bg-[#6C757D]'
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const days = getDaysInMonth(currentDate)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendário de Atividades
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Carregando...</p>
        ) : (
          <>
            {/* Day names header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="h-24 border border-border/30 rounded-lg" />
                }

                const dayActivities = getActivitiesForDate(date)
                const today = isToday(date)

                return (
                  <div
                    key={date.toISOString()}
                    className={`h-24 border rounded-lg p-1 overflow-hidden transition-colors ${
                      today ? 'border-[#28A745] bg-[#28A745]/5' : 'border-border/30 hover:bg-muted/30'
                    }`}
                  >
                    <div className={`text-xs font-medium mb-1 ${today ? 'text-[#28A745] font-bold' : 'text-muted-foreground'}`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-0.5">
                      {dayActivities.slice(0, 3).map(activity => (
                        <div
                          key={activity.id}
                          className={`text-[10px] leading-tight truncate px-1 py-0.5 rounded text-white ${getCategoryColor(activity.category)}`}
                          title={activity.name}
                        >
                          {activity.name}
                        </div>
                      ))}
                      {dayActivities.length > 3 && (
                        <div className="text-[10px] text-muted-foreground text-center">
                          +{dayActivities.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[#28A745]" />
                <span className="text-xs text-muted-foreground">Equipamento</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[#FFC107]" />
                <span className="text-xs text-muted-foreground">Infraestrutura</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[#DC3545]" />
                <span className="text-xs text-muted-foreground">Segurança</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[#00b4d8]" />
                <span className="text-xs text-muted-foreground">Ambiental</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
