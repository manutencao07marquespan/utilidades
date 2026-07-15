'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { StatsCard } from '@/components/shared/stats-card'
import { HydrantForm } from '@/components/utilidades/hydrant-form'
import { CisternForm } from '@/components/utilidades/cistern-form'
import { ReadingsTable } from '@/components/utilidades/readings-table'
import { Gauge, Droplets, Timer, Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function UtilidadesPage() {
  const [activeTab, setActiveTab] = useState('hydrant')
  const [stats, setStats] = useState({ hydrants: 0, horimeters: 0, cisterns: 0 })
  const [refreshKey, setRefreshKey] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [refreshKey])

  async function fetchStats() {
    const [hydrants, horimeters, cisterns] = await Promise.all([
      supabase.from('hydrant_readings').select('id', { count: 'exact', head: true }),
      supabase.from('well_horimeters').select('id', { count: 'exact', head: true }),
      supabase.from('cistern_levels').select('id', { count: 'exact', head: true }),
    ])

    setStats({
      hydrants: hydrants.count || 0,
      horimeters: horimeters.count || 0,
      cisterns: cisterns.count || 0,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilidades & Medições"
        description="Leituras de campo: hidrômetros, horímetros e cisternas"
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3">
        <StatsCard
          title="Hidrômetros"
          value={stats.hydrants}
          subtitle="leituras registradas"
          icon={Gauge}
          variant="default"
        />
        <StatsCard
          title="Horímetros"
          value={stats.horimeters}
          subtitle="leituras registradas"
          icon={Timer}
          variant="default"
        />
        <StatsCard
          title="Cisternas"
          value={stats.cisterns}
          subtitle="leituras registradas"
          icon={Droplets}
          variant="default"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="hydrant">
            <Gauge className="h-4 w-4 mr-2" />
            Hidrômetros & Horímetros
          </TabsTrigger>
          <TabsTrigger value="cistern">
            <Droplets className="h-4 w-4 mr-2" />
            Cisternas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hydrant" className="space-y-6">
          <HydrantForm onSuccess={() => setRefreshKey(k => k + 1)} />
          <ReadingsTable key={`hydrant-${refreshKey}`} type="hydrant" />
        </TabsContent>

        <TabsContent value="cistern" className="space-y-6">
          <CisternForm onSuccess={() => setRefreshKey(k => k + 1)} />
          <ReadingsTable key={`cistern-${refreshKey}`} type="cistern" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
