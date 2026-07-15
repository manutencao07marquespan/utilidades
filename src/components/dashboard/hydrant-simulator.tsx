'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/cn'
import { Gauge, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface HydrantSimulatorProps {
  code: string
  currentValue: number
  dailyAverage: number
  unit?: string
}

export function HydrantSimulator({
  code,
  currentValue,
  dailyAverage,
  unit = 'm³',
}: HydrantSimulatorProps) {
  const difference = currentValue - dailyAverage
  const percentDiff = dailyAverage > 0 ? (difference / dailyAverage) * 100 : 0

  const getBorderColor = () => {
    if (percentDiff > 5) return 'border-l-[#DC3545]'
    if (percentDiff < -5) return 'border-l-[#28A745]'
    return 'border-l-[#00b4d8]'
  }

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-md border-l-4', getBorderColor())}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{code}</CardTitle>
        <div className="p-2 rounded-xl bg-[#00b4d8]/10">
          <Gauge className="h-4 w-4 text-[#00b4d8]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Valor Atual</p>
            <p className="text-2xl font-bold tracking-tight">
              {currentValue.toFixed(2)} {unit}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Média Diária</p>
            <p className="text-lg font-semibold">
              {dailyAverage.toFixed(2)} {unit}
            </p>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-1">Variação</p>
            <div className="flex items-center gap-1.5">
              {percentDiff > 0 ? (
                <TrendingUp className="h-4 w-4 text-[#DC3545]" />
              ) : percentDiff < 0 ? (
                <TrendingDown className="h-4 w-4 text-[#28A745]" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <p
                className={`text-sm font-semibold ${
                  percentDiff > 0
                    ? 'text-[#DC3545]'
                    : percentDiff < 0
                    ? 'text-[#28A745]'
                    : 'text-muted-foreground'
                }`}
              >
                {percentDiff > 0 ? '+' : ''}
                {percentDiff.toFixed(1)}% vs média
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
