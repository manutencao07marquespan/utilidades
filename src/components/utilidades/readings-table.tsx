'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { History } from 'lucide-react'

interface Reading {
  id: string
  reading_date: string
  shift: string
  created_at: string
  [key: string]: any
}

interface ReadingsTableProps {
  type: 'hydrant' | 'horimeter' | 'cistern'
}

export function ReadingsTable({ type }: ReadingsTableProps) {
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchReadings()
  }, [type])

  async function fetchReadings() {
    setLoading(true)
    let table = ''
    let columns = '*'

    switch (type) {
      case 'hydrant':
        table = 'hydrant_readings'
        columns = '*, (reading_value - COALESCE(previous_reading, 0)) as consumption'
        break
      case 'horimeter':
        table = 'well_horimeters'
        columns = '*, (current_hours - COALESCE(previous_hours, 0)) as hours_diff'
        break
      case 'cistern':
        table = 'cistern_levels'
        break
    }

    const { data } = await supabase
      .from(table)
      .select(columns)
      .order('reading_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      setReadings(data as Reading[])
    }
    setLoading(false)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  function getShiftLabel(shift: string) {
    const labels: Record<string, string> = { '1A': 'Turno 1A', '1B': 'Turno 1B', '2A': 'Turno 2A', '2B': 'Turno 2B' }
    return labels[shift] || shift
  }

  function getShiftVariant(shift: string) {
    const variants: Record<string, 'ok' | 'warning' | 'critical' | 'inactive'> = {
      '1A': 'ok',
      '1B': 'warning',
      '2A': 'critical',
      '2B': 'inactive',
    }
    return variants[shift] || 'ok'
  }

  const titles: Record<string, string> = {
    hydrant: 'Últimas Leituras de Hidrômetro',
    horimeter: 'Últimas Leituras de Horímetro',
    cistern: 'Últimas Leituras de Cisterna',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          {titles[type]}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-4">Carregando...</p>
        ) : readings.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Nenhuma leitura registrada</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-xs font-medium text-muted-foreground">Data</th>
                  <th className="text-left p-2 text-xs font-medium text-muted-foreground">Turno</th>
                  {type === 'hydrant' && (
                    <>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Código</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Tipo</th>
                      <th className="text-right p-2 text-xs font-medium text-muted-foreground">Leitura</th>
                      <th className="text-right p-2 text-xs font-medium text-muted-foreground">Consumo</th>
                    </>
                  )}
                  {type === 'horimeter' && (
                    <>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Poço</th>
                      <th className="text-right p-2 text-xs font-medium text-muted-foreground">Horas</th>
                      <th className="text-right p-2 text-xs font-medium text-muted-foreground">Diferença</th>
                    </>
                  )}
                  {type === 'cistern' && (
                    <>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Cisterna</th>
                      <th className="text-right p-2 text-xs font-medium text-muted-foreground">Nível %</th>
                      <th className="text-right p-2 text-xs font-medium text-muted-foreground">Metros</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {readings.map((reading) => (
                  <tr key={reading.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-2 text-sm">{formatDate(reading.reading_date)}</td>
                    <td className="p-2">
                      <StatusIndicator
                        variant={getShiftVariant(reading.shift)}
                        label={getShiftLabel(reading.shift)}
                      />
                    </td>
                    {type === 'hydrant' && (
                      <>
                        <td className="p-2 text-sm font-medium">{reading.hydrant_code}</td>
                        <td className="p-2">
                          <StatusIndicator
                            variant={reading.direction === 'input' ? 'ok' : 'warning'}
                            label={reading.direction === 'input' ? 'Entrada' : 'Saída'}
                          />
                        </td>
                        <td className="p-2 text-sm text-right">{reading.reading_value?.toFixed(2)} m³</td>
                        <td className="p-2 text-sm text-right font-medium">
                          {reading.consumption?.toFixed(2) || '-'} m³
                        </td>
                      </>
                    )}
                    {type === 'horimeter' && (
                      <>
                        <td className="p-2 text-sm font-medium">{reading.well_code}</td>
                        <td className="p-2 text-sm text-right">{reading.current_hours?.toFixed(2)} h</td>
                        <td className="p-2 text-sm text-right font-medium">
                          {reading.hours_diff?.toFixed(2) || '-'} h
                        </td>
                      </>
                    )}
                    {type === 'cistern' && (
                      <>
                        <td className="p-2 text-sm font-medium">{reading.cistern_code}</td>
                        <td className="p-2 text-sm text-right">
                          <span className={`font-medium ${
                            (reading.level_percentage || 0) < 20 ? 'text-[#DC3545]' :
                            (reading.level_percentage || 0) < 30 ? 'text-[#FFC107]' :
                            'text-[#00b4d8]'
                          }`}>
                            {reading.level_percentage?.toFixed(1) || '-'}%
                          </span>
                        </td>
                        <td className="p-2 text-sm text-right">{reading.level_meters?.toFixed(2) || '-'} m</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
