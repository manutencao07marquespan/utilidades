'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Gauge } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface HydrantChartProps {
  startDate: string
  endDate: string
  hydrantCode?: string
}

export function HydrantChart({ startDate, endDate, hydrantCode }: HydrantChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [startDate, endDate, hydrantCode])

  async function fetchData() {
    setLoading(true)
    let query = supabase
      .from('hydrant_readings')
      .select('reading_date, hydrant_code, reading_value, previous_reading')
      .gte('reading_date', startDate)
      .lte('reading_date', endDate)
      .order('reading_date')

    if (hydrantCode) {
      query = query.eq('hydrant_code', hydrantCode)
    }

    const { data: readings } = await query

    if (readings) {
      const chartData = readings.map((r: any) => ({
        date: r.reading_date,
        code: r.hydrant_code,
        value: r.reading_value,
        consumption: r.reading_value - (r.previous_reading || 0),
      }))
      setData(chartData)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Carregando...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Gauge className="h-4 w-4 text-[#00b4d8]" />
          {hydrantCode ? `Hidrômetro ${hydrantCode}` : 'Leituras de Hidrômetros'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="Leitura (m³)" fill="#1A3A5A" radius={[4, 4, 0, 0]} />
            <Bar dataKey="consumption" name="Consumo (m³)" fill="#28A745" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
