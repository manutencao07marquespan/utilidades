'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { StatsCard } from '@/components/shared/stats-card'
import { DecanterForm } from '@/components/residuos/decanter-form'
import { DryingBedForm } from '@/components/residuos/drying-bed-form'
import { SludgeDisposalForm } from '@/components/residuos/sludge-disposal-form'
import { Recycle, Droplets, Trash2, Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ResiduosPage() {
  const [activeTab, setActiveTab] = useState('decanter')
  const [stats, setStats] = useState({ decanters: 0, beds: 0, disposed: 0 })
  const [refreshKey, setRefreshKey] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [refreshKey])

  async function fetchStats() {
    const [decanters, beds, disposals] = await Promise.all([
      supabase.from('decanter_records').select('id', { count: 'exact', head: true }),
      supabase.from('drying_beds').select('id, status'),
      supabase.from('sludge_disposals').select('volume'),
    ])

    const availableBeds = beds.data?.filter((b: any) => b.status === 'available').length || 0
    const totalDisposed = disposals.data?.reduce((sum: number, d: any) => sum + (d.volume || 0), 0) || 0

    setStats({
      decanters: decanters.count || 0,
      beds: availableBeds,
      disposed: Math.round(totalDisposed),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Resíduos"
        description="Controle de lodo e óleo - decantadores, leitos de secagem e destino final"
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3">
        <StatsCard
          title="Registros Decantador"
          value={stats.decanters}
          subtitle="leituras este mês"
          icon={Recycle}
          variant="default"
        />
        <StatsCard
          title="Leitos Disponíveis"
          value={stats.beds}
          subtitle="de 5 leitos"
          icon={Droplets}
          variant="default"
        />
        <StatsCard
          title="Lodo Destinado"
          value={`${stats.disposed} m³`}
          subtitle="este mês"
          icon={Trash2}
          variant="default"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="decanter">
            <Recycle className="h-4 w-4 mr-2" />
            Decantadores
          </TabsTrigger>
          <TabsTrigger value="drying-bed">
            <Droplets className="h-4 w-4 mr-2" />
            Leitos de Secagem
          </TabsTrigger>
          <TabsTrigger value="disposal">
            <Trash2 className="h-4 w-4 mr-2" />
            Destino Final
          </TabsTrigger>
        </TabsList>

        <TabsContent value="decanter" className="space-y-6">
          <DecanterForm onSuccess={() => setRefreshKey(k => k + 1)} />
        </TabsContent>

        <TabsContent value="drying-bed" className="space-y-6">
          <DryingBedForm onSuccess={() => setRefreshKey(k => k + 1)} />
        </TabsContent>

        <TabsContent value="disposal" className="space-y-6">
          <SludgeDisposalForm onSuccess={() => setRefreshKey(k => k + 1)} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
