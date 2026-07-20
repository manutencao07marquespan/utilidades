'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { StatsCard } from '@/components/shared/stats-card'
import { ProductForm } from '@/components/insumos/product-form'
import { StockMovementForm } from '@/components/insumos/stock-movement-form'
import { ProductsTable } from '@/components/insumos/products-table'
import { StockMovementsList } from '@/components/insumos/stock-movements-list'
import { Package, AlertTriangle, TrendingDown, Plus, ArrowUpDown, Clock } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function InsumosPage() {
  const [activeTab, setActiveTab] = useState('list')
  const [stats, setStats] = useState({ total: 0, lowStock: 0, outOfStock: 0 })
  const [refreshKey, setRefreshKey] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [refreshKey])

  async function fetchStats() {
    const { data: products } = await supabase
      .from('products')
      .select('current_stock, min_stock, is_active')
      .eq('is_active', true)

    if (products) {
      const total = products.length
      const lowStock = products.filter((p: any) => p.current_stock > 0 && p.current_stock <= p.min_stock).length
      const outOfStock = products.filter((p: any) => p.current_stock <= 0).length

      setStats({ total, lowStock, outOfStock })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insumos & Estoque"
        description="Gestão de produtos químicos, GLP e diesel"
        action={{
          label: 'Novo Produto',
          onClick: () => setActiveTab('new'),
          icon: Plus,
        }}
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3">
        <StatsCard
          title="Produtos"
          value={stats.total}
          subtitle="cadastrados"
          icon={Package}
          variant="default"
        />
        <StatsCard
          title="Estoque Baixo"
          value={stats.lowStock}
          subtitle="abaixo do mínimo"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatsCard
          title="Sem Estoque"
          value={stats.outOfStock}
          subtitle="itens zerados"
          icon={TrendingDown}
          variant="danger"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">
            <Package className="h-4 w-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="movement">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Movimentação
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <ProductsTable key={refreshKey} />
        </TabsContent>

        <TabsContent value="movement" className="space-y-6">
          <StockMovementForm onSuccess={() => setRefreshKey(k => k + 1)} />
        </TabsContent>

        <TabsContent value="history">
          <StockMovementsList refreshKey={refreshKey} />
        </TabsContent>

        <TabsContent value="new" className="space-y-6">
          <ProductForm onSuccess={() => {
            setRefreshKey(k => k + 1)
            setActiveTab('list')
          }} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
