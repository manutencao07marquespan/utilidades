'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { Search, Wrench } from 'lucide-react'

interface Asset {
  id: string
  name: string
  asset_code: string
  type: string
  status: string
  location: string | null
  manufacturer: string | null
  model: string | null
}

export function AssetsTable() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    fetchAssets()
  }, [search, statusFilter])

  async function fetchAssets() {
    setLoading(true)
    let query = supabase
      .from('assets')
      .select('*')
      .order('name')

    if (search) {
      query = query.or(`name.ilike.%${search}%,asset_code.ilike.%${search}%`)
    }

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data } = await query

    if (data) {
      setAssets(data as Asset[])
    }
    setLoading(false)
  }

  function getStatusVariant(status: string) {
    const variants: Record<string, 'ok' | 'warning' | 'critical' | 'inactive'> = {
      active: 'ok',
      maintenance: 'warning',
      inactive: 'inactive',
      retired: 'inactive',
    }
    return variants[status] || 'ok'
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      active: 'Ativo',
      maintenance: 'Em Manutenção',
      inactive: 'Inativo',
      retired: 'Aposentado',
    }
    return labels[status] || status
  }

  function getTypeLabel(type: string) {
    const labels: Record<string, string> = {
      pump: 'Bomba',
      valve: 'Válvula',
      motor: 'Motor',
      other: 'Outro',
    }
    return labels[type] || type
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Ativos Cadastrados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Pesquisar ativo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
          >
            <option value="all">Todos status</option>
            <option value="active">Ativos</option>
            <option value="maintenance">Em Manutenção</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 text-xs font-medium text-muted-foreground">Código</th>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground">Nome</th>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground hidden md:table-cell">Tipo</th>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground hidden lg:table-cell">Local</th>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Nenhum ativo encontrado
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-2 font-mono text-sm font-medium">{asset.asset_code}</td>
                    <td className="p-2 text-sm">{asset.name}</td>
                    <td className="p-2 text-sm text-muted-foreground hidden md:table-cell">
                      {getTypeLabel(asset.type)}
                    </td>
                    <td className="p-2 text-sm text-muted-foreground hidden lg:table-cell">
                      {asset.location || '-'}
                    </td>
                    <td className="p-2">
                      <StatusIndicator
                        variant={getStatusVariant(asset.status)}
                        label={getStatusLabel(asset.status)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
