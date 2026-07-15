import { type LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/cn'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

const variantStyles = {
  default: {
    icon: 'text-muted-foreground',
    border: 'border-l-muted-foreground/20',
    iconBg: 'bg-muted/50',
  },
  success: {
    icon: 'text-[#28A745]',
    border: 'border-l-[#28A745]/40',
    iconBg: 'bg-[#28A745]/10',
  },
  warning: {
    icon: 'text-[#FFC107]',
    border: 'border-l-[#FFC107]/40',
    iconBg: 'bg-[#FFC107]/10',
  },
  danger: {
    icon: 'text-[#DC3545]',
    border: 'border-l-[#DC3545]/40',
    iconBg: 'bg-[#DC3545]/10',
  },
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: StatsCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card className={cn(
      'border-l-4 transition-all duration-200 hover:shadow-md',
      styles.border
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn('p-2 rounded-xl', styles.iconBg)}>
          <Icon className={cn('h-4 w-4', styles.icon)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <div
            className={cn(
              'flex items-center text-xs mt-2 font-medium',
              trend.direction === 'up' ? 'text-[#28A745]' : 'text-[#DC3545]'
            )}
          >
            {trend.direction === 'up' ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {trend.direction === 'up' ? '+' : ''}
            {trend.value}%
          </div>
        )}
      </CardContent>
    </Card>
  )
}
