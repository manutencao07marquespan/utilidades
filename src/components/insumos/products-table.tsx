'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { Search, Package } from 'lucide-react'

interface Product {
  id: string
  name: string
  category: string
  unit: string
  current_stock: number
  min_stock: number
  max_stock: number | null
  supplier: string | null
  unit_price: number | null
  location: string | null
  is_active: boolean
}

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [search, categoryFilter])

  async function fetchProducts() {
    setLoading(true)
    let query = supabase
      .from('products')
      .select('*')
      .order('name')

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    if (categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter)
    }

    const { data } = await query

    if (data) {
      setProducts(data as Product[])
    }
    setLoading(false)
  }

  function getStockStatus(product: Product) {
    if (product.current_stock <= 0) return { variant: 'critical' as const, label: 'Sem Estoque' }
    if (product.current_stock <= product.min_stock) return { variant: 'warning' as const, label: 'Estoque Baixo' }
    return { variant: 'ok' as const, label: 'Normal' }
  }

  function getCategoryLabel(category: string) {
    const labels: Record<string, string> = {
      quimico: 'Químico',
      glp: 'GLP',
      diesel: 'Diesel',
      outro: 'Outro',
    }
    return labels[category] || category
  }

  function formatCurrency(value: number | null) {
    if (value === null) return '-'
    return `R$ ${value.toFixed(2)}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produtos Cadastrados
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Pesquisar produto..."
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
            <option value="quimico">Químico</option>
            <option value="glp">GLP</option>
            <option value="diesel">Diesel</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 text-xs font-medium text-muted-foreground">Produto</th>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground hidden md:table-cell">Categoria</th>
                <th className="text-right p-2 text-xs font-medium text-muted-foreground">Estoque</th>
                <th className="text-right p-2 text-xs font-medium text-muted-foreground hidden lg:table-cell">Mínimo</th>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-right p-2 text-xs font-medium text-muted-foreground hidden xl:table-cell">Preço</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Nenhum produto encontrado
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const stockStatus = getStockStatus(product)
                  return (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-2">
                        <div>
                          <span className="font-medium text-sm">{product.name}</span>
                          {product.location && (
                            <p className="text-xs text-muted-foreground">{product.location}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-2 text-sm text-muted-foreground hidden md:table-cell">
                        {getCategoryLabel(product.category)}
                      </td>
                      <td className="p-2 text-right">
                        <span className={`font-bold ${
                          product.current_stock <= 0 ? 'text-[#DC3545]' :
                          product.current_stock <= product.min_stock ? 'text-[#FFC107]' :
                          'text-foreground'
                        }`}>
                          {product.current_stock}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">{product.unit}</span>
                      </td>
                      <td className="p-2 text-sm text-muted-foreground text-right hidden lg:table-cell">
                        {product.min_stock} {product.unit}
                      </td>
                      <td className="p-2">
                        <StatusIndicator
                          variant={stockStatus.variant}
                          label={stockStatus.label}
                        />
                      </td>
                      <td className="p-2 text-sm text-right hidden xl:table-cell">
                        {formatCurrency(product.unit_price)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
