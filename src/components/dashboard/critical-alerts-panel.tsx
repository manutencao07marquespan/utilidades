'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle } from 'lucide-react'

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

export function CriticalAlertsPanel({ alerts, onAcknowledge }: CriticalAlertsPanelProps) {
  const activeAlerts = alerts.filter(a => !a.acknowledged)

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Alertas Ativos</CardTitle>
        <div className="p-2 rounded-xl bg-[#DC3545]/10">
          <AlertTriangle className="h-4 w-4 text-[#DC3545]" />
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
                className={`p-3 rounded-lg border-l-4 ${severityStyles[alert.severity]}`}
              >
                <div className="flex items-start justify-between">
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
