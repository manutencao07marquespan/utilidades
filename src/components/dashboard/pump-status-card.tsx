'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { Activity, AlertTriangle } from 'lucide-react'

interface PumpStatus {
  id: string
  name: string
  asset_code: string
  status: string
}

interface PumpStatusCardProps {
  pumps: PumpStatus[]
}

const statusMap: Record<string, { variant: 'ok' | 'warning' | 'critical' | 'inactive'; label: string }> = {
  active: { variant: 'ok', label: 'Ativa' },
  running: { variant: 'ok', label: 'Funcionando' },
  stopped: { variant: 'inactive', label: 'Parada' },
  maintenance: { variant: 'warning', label: 'Manutenção' },
  fault: { variant: 'critical', label: 'Falha' },
  inactive: { variant: 'inactive', label: 'Inativa' },
  retired: { variant: 'inactive', label: 'Aposentada' },
}

function getStatusInfo(status: string) {
  return statusMap[status] || { variant: 'inactive' as const, label: status || 'Desconhecido' }
}

export function PumpStatusCard({ pumps }: PumpStatusCardProps) {
  const activeCount = pumps.filter(p => p.status === 'active' || p.status === 'running').length
  const faultCount = pumps.filter(p => p.status === 'fault').length

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Status das Bombas</CardTitle>
        <div className="p-2 rounded-xl bg-[#28A745]/10">
          <Activity className="h-4 w-4 text-[#28A745]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight mb-1">
          {activeCount}/{pumps.length}
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ativas
          </span>
        </div>

        {faultCount > 0 && (
          <div className="flex items-center text-[#DC3545] text-sm mb-3 font-medium">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {faultCount} bomba(s) com falha
          </div>
        )}

        <div className="space-y-2.5">
          {pumps.slice(0, 5).map(pump => {
            const statusInfo = getStatusInfo(pump.status)
            return (
              <div key={pump.id} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="text-sm font-medium">{pump.asset_code || pump.name}</span>
                <StatusIndicator
                  variant={statusInfo.variant}
                  label={statusInfo.label}
                />
              </div>
            )
          })}
          {pumps.length > 5 && (
            <p className="text-xs text-muted-foreground text-center pt-1">
              +{pumps.length - 5} mais
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
