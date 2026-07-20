'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { ArrowUpDown, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StockMovement {
  id: string
  movement_type: string
  quantity: number
  unit_price: number | null
  reason: string | null
  reference_document: string | null
  movement_date: string
  created_at: string
  products?: { name: string; unit: string } | null
  user_profiles?: { full_name: string } | null
}

interface StockMovementsListProps {
  refreshKey?: number
}

export function StockMovementsList({ refreshKey }: StockMovementsListProps) {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchMovements()
  }, [refreshKey])

  async function fetchMovements() {
    setLoading(true)
    const { data } = await supabase
      .from('stock_movements')
      .select('*, products(name, unit), user_profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      setMovements(data as StockMovement[])
    }
    setLoading(false)
  }

  function getTypeConfig(type: string) {
    const configs: Record<string, { label: string; icon: any; color: string }> = {
      entry: { label: 'Entrada', icon: TrendingUp, color: 'text-[#28A745]' },
      exit: { label: 'Saída', icon: TrendingDown, color: 'text-[#DC3545]' },
      adjustment: { label: 'Ajuste', icon: Minus, color: 'text-[#FFC107]' },
    }
    return configs[type] || configs.entry
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <ArrowUpDown className="h-4 w-4" />
          Últimas Movimentações
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-4">Carregando...</p>
        ) : movements.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Nenhuma movimentação registrada</p>
        ) : (
          <div className="space-y-2">
            {movements.map((movement) => {
              const config = getTypeConfig(movement.movement_type)
              const Icon = config.icon
              return (
                <div key={movement.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className={cn('p-2 rounded-lg', movement.movement_type === 'entry' ? 'bg-[#28A745]/10' : movement.movement_type === 'exit' ? 'bg-[#DC3545]/10' : 'bg-[#FFC107]/10')}>
                    <Icon className={cn('h-4 w-4', config.color)} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{movement.products?.name || 'Produto'}</p>
                    <p className="text-xs text-muted-foreground">
                      {config.label} • {movement.quantity} {movement.products?.unit || ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {movement.movement_type === 'entry' ? '+' : movement.movement_type === 'exit' ? '-' : ''}{movement.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(movement.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
