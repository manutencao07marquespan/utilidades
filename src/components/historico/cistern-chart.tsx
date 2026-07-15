'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Droplets } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface CisternChartProps {
  startDate: string
  endDate: string
}

export function CisternChart({ startDate, endDate }: CisternChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [startDate, endDate])

  async function fetchData() {
    setLoading(true)
    const { data: readings } = await supabase
      .from('cistern_levels')
      .select('reading_date, cistern_code, level_percentage')
      .gte('reading_date', startDate)
      .lte('reading_date', endDate)
      .order('reading_date')

    if (readings) {
      // Group by date and cistern
      const grouped = new Map<string, any>()
      readings.forEach((r: any) => {
        const existing = grouped.get(r.reading_date) || { date: r.reading_date }
        existing[r.cistern_code] = r.level_percentage
        grouped.set(r.reading_date, existing)
      })
      setData(Array.from(grouped.values()))
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
          <Droplets className="h-4 w-4 text-[#00b4d8]" />
          Níveis das Cisternas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="BACIA AMORTECIMENTO - 296 M³" stroke="#00b4d8" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="CISTERNA LAVAGEM - 320 M³" stroke="#28A745" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="CISTERNA E. BRUTO - 440 M³" stroke="#FFC107" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
