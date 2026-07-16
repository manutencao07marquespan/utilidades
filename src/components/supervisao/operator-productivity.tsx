'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { UserCheck, TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/cn'

interface OperatorProductivityData {
  name: string
  userId: string
  checklistsCompleted: number
  avgTimeMinutes: number
  totalTimeMinutes: number
  nonConformities: number
  efficiency: number
  lastChecklist: string | null
}

interface OperatorProductivityProps {
  operators: OperatorProductivityData[]
}

export function OperatorProductivity({ operators }: OperatorProductivityProps) {
  if (operators.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Nenhum dado de produtividade disponível
        </CardContent>
      </Card>
    )
  }

  const maxChecklists = Math.max(...operators.map(o => o.checklistsCompleted))
  const avgTimeAll = operators.reduce((sum, o) => sum + o.avgTimeMinutes, 0) / operators.length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <UserCheck className="h-4 w-4 text-[#28A745]" />
          Produtividade por Operador
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {operators.map((op, index) => {
            const barWidth = maxChecklists > 0 ? (op.checklistsCompleted / maxChecklists) * 100 : 0
            const timeDiff = op.avgTimeMinutes - avgTimeAll
            const isAboveAvg = timeDiff > 0
            const efficiency = Math.max(0, Math.min(100, 100 - (op.nonConformities * 10)))

            return (
              <div key={op.userId} className="p-4 rounded-xl bg-muted/30 border border-border/50">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#28A745] to-[#218838] flex items-center justify-center text-white text-sm font-bold">
                      {op.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{op.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {op.checklistsCompleted} checklists • {op.avgTimeMinutes} min/médio
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {op.nonConformities > 0 && (
                      <span className="text-xs font-medium text-[#FFC107] bg-[#FFC107]/10 px-2 py-1 rounded">
                        ⚠ {op.nonConformities} NC
                      </span>
                    )}
                    <StatusIndicator
                      variant={efficiency >= 90 ? 'ok' : efficiency >= 70 ? 'warning' : 'critical'}
                      label={`${efficiency}%`}
                    />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div className="text-center">
                    <p className="text-lg font-bold">{op.checklistsCompleted}</p>
                    <p className="text-[10px] text-muted-foreground">Checklists</p>
                  </div>
                  <div className="text-center">
                    <p className={cn('text-lg font-bold', op.avgTimeMinutes <= 10 ? 'text-[#28A745]' : 'text-[#FFC107]')}>
                      {op.avgTimeMinutes} min
                    </p>
                    <p className="text-[10px] text-muted-foreground">Tempo Médio</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{Math.round(op.totalTimeMinutes)} min</p>
                    <p className="text-[10px] text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center">
                    <p className={cn('text-lg font-bold', op.nonConformities === 0 ? 'text-[#28A745]' : 'text-[#FFC107]')}>
                      {op.nonConformities}
                    </p>
                    <p className="text-[10px] text-muted-foreground">NC</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      barWidth >= 80 ? 'bg-[#28A745]' : barWidth >= 50 ? 'bg-[#FFC107]' : 'bg-[#DC3545]'
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {timeDiff > 0 ? (
                      <TrendingUp className="h-3 w-3 text-[#DC3545]" />
                    ) : timeDiff < 0 ? (
                      <TrendingDown className="h-3 w-3 text-[#28A745]" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {timeDiff > 0 ? `+${timeDiff.toFixed(0)} min vs média` : timeDiff < 0 ? `${timeDiff.toFixed(0)} min vs média` : 'Na média'}
                  </span>
                  {op.lastChecklist && (
                    <span>Último: {new Date(op.lastChecklist).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold">{operators.length}</p>
            <p className="text-xs text-muted-foreground">Operadores Ativos</p>
          </div>
          <div>
            <p className="text-lg font-bold">{Math.round(avgTimeAll)} min</p>
            <p className="text-xs text-muted-foreground">Média Geral</p>
          </div>
          <div>
            <p className="text-lg font-bold">
              {operators.reduce((sum, o) => sum + o.checklistsCompleted, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Checklists</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
