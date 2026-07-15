'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/cn'

interface Alert {
  id: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  value?: number
  parameter?: string
  acknowledged: boolean
  triggered_at: string
}

interface CriticalAlertsPanelProps {
  alerts: Alert[]
  onAcknowledge?: (id: string) => void
}

const severityStyles = {
  info: 'border-l-[#00b4d8] bg-[#00b4d8]/5',
  warning: 'border-l-[#FFC107] bg-[#FFC107]/5',
  critical: 'border-l-[#DC3545] bg-[#DC3545]/5',
}

const severityDotColors = {
  info: 'bg-[#00b4d8]',
  warning: 'bg-[#FFC107]',
  critical: 'bg-[#DC3545]',
}

export function CriticalAlertsPanel({ alerts, onAcknowledge }: CriticalAlertsPanelProps) {
  const activeAlerts = alerts.filter(a => !a.acknowledged)
  const hasActiveAlerts = activeAlerts.length > 0

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      hasActiveAlerts && 'ring-2 ring-[#DC3545]/30'
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          Alertas Ativos
          {hasActiveAlerts && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DC3545] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#DC3545]"></span>
            </span>
          )}
        </CardTitle>
        <div className={cn(
          'p-2 rounded-xl',
          hasActiveAlerts ? 'bg-[#DC3545]/20' : 'bg-[#DC3545]/10'
        )}>
          <AlertTriangle className={cn(
            'h-4 w-4',
            hasActiveAlerts ? 'text-[#DC3545] animate-pulse' : 'text-[#DC3545]'
          )} />
        </div>
      </CardHeader>
      <CardContent>
        {activeAlerts.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <CheckCircle className="h-5 w-5 mr-2 text-[#28A745]" />
            Nenhum alerta ativo
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeAlerts.slice(0, 5).map(alert => (
              <div
                key={alert.id}
                className={cn(
                  'p-3 rounded-lg border-l-4',
                  severityStyles[alert.severity],
                  'animate-pulse'
                )}
                style={{ animationDuration: '2s' }}
              >
                <div className="flex items-start gap-2">
                  <span className={cn(
                    'mt-1.5 w-2 h-2 rounded-full',
                    severityDotColors[alert.severity],
                    'animate-ping'
                  )}></span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    {alert.parameter && alert.value !== undefined && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.parameter}: {alert.value}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.triggered_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  {onAcknowledge && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAcknowledge(alert.id)}
                      className="hover:bg-[#28A745]/10 hover:text-[#28A745]"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {activeAlerts.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{activeAlerts.length - 5} alertas mais
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
