'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/cn'

interface KPIGaugeProps {
  title: string
  value: number
  min: number
  max: number
  target: number
  unit: string
  status: 'good' | 'warning' | 'critical'
}

export function KPIGauge({
  title,
  value,
  min,
  max,
  target,
  unit,
  status,
}: KPIGaugeProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
  const targetPercentage = Math.min(100, Math.max(0, ((target - min) / (max - min)) * 100))

  const statusColors = {
    good: 'from-[#28A745] to-[#218838]',
    warning: 'from-[#FFC107] to-[#e0a800]',
    critical: 'from-[#DC3545] to-[#c82333]',
  }

  const statusTextColors = {
    good: 'text-[#28A745]',
    warning: 'text-[#FFC107]',
    critical: 'text-[#DC3545]',
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          {/* Gauge visual */}
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/30"
              />
              {/* Progress arc */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 2.51} 251`}
                className={cn(
                  'transition-all duration-500',
                  status === 'good' && 'stroke-[#28A745]',
                  status === 'warning' && 'stroke-[#FFC107]',
                  status === 'critical' && 'stroke-[#DC3545]'
                )}
              />
              {/* Target marker */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="2 249"
                strokeDashoffset={251 - (targetPercentage * 2.51)}
                className="text-muted-foreground"
              />
            </svg>
            {/* Center value */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn('text-lg font-bold', statusTextColors[status])}>
                {value.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <p className="text-2xl font-bold tracking-tight">
              {value.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Meta: {target} {unit}
            </p>
            <p className="text-xs text-muted-foreground">
              Faixa: {min} - {max} {unit}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
