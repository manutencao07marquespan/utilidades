'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/cn'

interface KPICardProps {
  title: string
  value: number | string
  unit: string
  target: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'stable'
  trendValue?: number
  status: 'good' | 'warning' | 'critical'
  description?: string
}

export function KPICard({
  title,
  value,
  unit,
  target,
  icon: Icon,
  trend,
  trendValue,
  status,
  description,
}: KPICardProps) {
  const statusConfig = {
    good: { label: 'Meta atingida', variant: 'ok' as const, color: 'text-[#28A745]' },
    warning: { label: 'Atenção', variant: 'warning' as const, color: 'text-[#FFC107]' },
    critical: { label: 'Crítico', variant: 'critical' as const, color: 'text-[#DC3545]' },
  }

  const trendConfig = {
    up: { icon: TrendingUp, color: 'text-[#DC3545]' },
    down: { icon: TrendingDown, color: 'text-[#28A745]' },
    stable: { icon: Minus, color: 'text-muted-foreground' },
  }

  const config = statusConfig[status]
  const trendInfo = trend ? trendConfig[trend] : null

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md border-l-4',
      status === 'good' && 'border-l-[#28A745]',
      status === 'warning' && 'border-l-[#FFC107]',
      status === 'critical' && 'border-l-[#DC3545]'
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn(
          'p-2 rounded-xl',
          status === 'good' && 'bg-[#28A745]/10',
          status === 'warning' && 'bg-[#FFC107]/10',
          status === 'critical' && 'bg-[#DC3545]/10'
        )}>
          <Icon className={cn('h-4 w-4', config.color)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className={cn('text-3xl font-bold tracking-tight', config.color)}>
              {value}
              <span className="text-lg font-normal text-muted-foreground ml-1">{unit}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Meta: {target}
            </p>
          </div>
          {trendInfo && (
            <div className="flex items-center gap-1">
              <trendInfo.icon className={cn('h-4 w-4', trendInfo.color)} />
              {trendValue !== undefined && (
                <span className={cn('text-sm font-medium', trendInfo.color)}>
                  {trendValue > 0 ? '+' : ''}{trendValue}%
                </span>
              )}
            </div>
          )}
        </div>
        <div className="mt-3">
          <StatusIndicator variant={config.variant} label={config.label} />
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
