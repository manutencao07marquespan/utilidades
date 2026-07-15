'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Droplets, Timer, CheckCircle } from 'lucide-react'

interface ProductionSummaryProps {
  totalInput: number
  totalOutput: number
  averageRetentionTime: number
  efficiency: number
}

export function ProductionSummary({
  totalInput,
  totalOutput,
  averageRetentionTime,
  efficiency,
}: ProductionSummaryProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Resumo de Produção</CardTitle>
        <div className="p-2 rounded-xl bg-[#1A3A5A]/10">
          <BarChart3 className="h-4 w-4 text-[#1A3A5A]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 p-3 rounded-xl bg-muted/30">
            <div className="flex items-center text-muted-foreground">
              <Droplets className="h-4 w-4 mr-1 text-[#00b4d8]" />
              <span className="text-xs">Volume Entrada</span>
            </div>
            <p className="text-lg font-bold tracking-tight">{totalInput.toFixed(1)} m³</p>
          </div>
          <div className="space-y-1 p-3 rounded-xl bg-muted/30">
            <div className="flex items-center text-muted-foreground">
              <Droplets className="h-4 w-4 mr-1 text-[#28A745]" />
              <span className="text-xs">Volume Saída</span>
            </div>
            <p className="text-lg font-bold tracking-tight">{totalOutput.toFixed(1)} m³</p>
          </div>
          <div className="space-y-1 p-3 rounded-xl bg-muted/30">
            <div className="flex items-center text-muted-foreground">
              <Timer className="h-4 w-4 mr-1 text-[#FFC107]" />
              <span className="text-xs">Tempo Médio</span>
            </div>
            <p className="text-lg font-bold tracking-tight">{averageRetentionTime.toFixed(1)} h</p>
          </div>
          <div className="space-y-1 p-3 rounded-xl bg-muted/30">
            <div className="flex items-center text-muted-foreground">
              <CheckCircle className="h-4 w-4 mr-1 text-[#28A745]" />
              <span className="text-xs">Eficiência</span>
            </div>
            <p className="text-lg font-bold tracking-tight">{efficiency.toFixed(1)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
