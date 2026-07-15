'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { CisternChart } from '@/components/historico/cistern-chart'
import { HydrantChart } from '@/components/historico/hydrant-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/shared/stats-card'
import { History, Droplets, Gauge, Calendar, TrendingUp } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function HistoricoPage() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })
  const [selectedHydrant, setSelectedHydrant] = useState<string>('')

  const hydrants = [
    { code: 'HID-E-01', name: 'Hidrômetro Entrada 01' },
    { code: 'HID-S-01', name: 'Hidrômetro Saída 01' },
    { code: 'HID-E-02', name: 'Hidrômetro Entrada 02' },
    { code: 'HID-S-02', name: 'Hidrômetro Saída 02' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Histórico de Medições"
        description="Acompanhe o histórico diário e mensal das medições de campo"
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Início</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Fim</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => {
                  const today = new Date()
                  setDateRange({
                    start: today.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0],
                  })
                }}
                className="h-10 px-4 rounded-xl border border-input bg-transparent text-sm hover:bg-muted"
              >
                Hoje
              </button>
              <button
                onClick={() => {
                  const end = new Date()
                  const start = new Date()
                  start.setDate(start.getDate() - 7)
                  setDateRange({
                    start: start.toISOString().split('T')[0],
                    end: end.toISOString().split('T')[0],
                  })
                }}
                className="h-10 px-4 rounded-xl border border-input bg-transparent text-sm hover:bg-muted"
              >
                7 dias
              </button>
              <button
                onClick={() => {
                  const end = new Date()
                  const start = new Date()
                  start.setMonth(start.getMonth() - 1)
                  setDateRange({
                    start: start.toISOString().split('T')[0],
                    end: end.toISOString().split('T')[0],
                  })
                }}
                className="h-10 px-4 rounded-xl border border-input bg-transparent text-sm hover:bg-muted"
              >
                30 dias
              </button>
              <button
                onClick={() => {
                  const end = new Date()
                  const start = new Date()
                  start.setMonth(start.getMonth() - 12)
                  setDateRange({
                    start: start.toISOString().split('T')[0],
                    end: end.toISOString().split('T')[0],
                  })
                }}
                className="h-10 px-4 rounded-xl border border-input bg-transparent text-sm hover:bg-muted"
              >
                12 meses
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="cisterns">
        <TabsList>
          <TabsTrigger value="cisterns">
            <Droplets className="h-4 w-4 mr-2" />
            Cisternas
          </TabsTrigger>
          <TabsTrigger value="hydrants">
            <Gauge className="h-4 w-4 mr-2" />
            Hidrômetros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cisterns" className="space-y-6">
          <CisternChart
            startDate={dateRange.start}
            endDate={dateRange.end}
          />
        </TabsContent>

        <TabsContent value="hydrants" className="space-y-6">
          {/* Hydrant selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hidrômetro</label>
                  <select
                    value={selectedHydrant}
                    onChange={(e) => setSelectedHydrant(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
                  >
                    <option value="">Todos</option>
                    {hydrants.map((h) => (
                      <option key={h.code} value={h.code}>{h.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <HydrantChart
            startDate={dateRange.start}
            endDate={dateRange.end}
            hydrantCode={selectedHydrant || undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
