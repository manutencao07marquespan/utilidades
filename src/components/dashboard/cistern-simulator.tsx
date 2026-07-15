'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/cn'
import { Droplets, TrendingDown, AlertTriangle } from 'lucide-react'

interface CisternSimulatorProps {
  level: number // 0-100
  code: string
  capacity?: number
  currentVolume?: number
}

export function CisternSimulator({
  level,
  code,
  capacity = 100,
  currentVolume,
}: CisternSimulatorProps) {
  const getLevelColor = () => {
    if (level < 20) return 'from-[#DC3545] to-[#c82333]'
    if (level < 30) return 'from-[#FFC107] to-[#e0a800]'
    return 'from-[#00b4d8] to-[#0096c7]'
  }

  const getLevelBg = () => {
    if (level < 20) return 'bg-[#DC3545]/10'
    if (level < 30) return 'bg-[#FFC107]/10'
    return 'bg-[#00b4d8]/10'
  }

  const getLevelTextColor = () => {
    if (level < 20) return 'text-[#DC3545]'
    if (level < 30) return 'text-[#FFC107]'
    return 'text-[#00b4d8]'
  }

  const getBorderColor = () => {
    if (level < 20) return 'border-[#DC3545]/30'
    if (level < 30) return 'border-[#FFC107]/30'
    return 'border-[#00b4d8]/30'
  }

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-md border-l-4', getBorderColor())}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{code}</CardTitle>
          <div className={cn('p-2 rounded-xl', getLevelBg())}>
            <Droplets className={cn('h-4 w-4', getLevelTextColor())} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          {/* Cistern Visual */}
          <div className="relative w-16 h-28 border-2 border-muted-foreground/20 rounded-b-xl overflow-hidden bg-muted/20">
            {/* Water fill */}
            <div
              className={cn(
                'absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out bg-gradient-to-t rounded-b-lg',
                getLevelColor()
              )}
              style={{ height: `${level}%` }}
            />
            {/* Wave effect at top of water */}
            {level > 0 && (
              <div
                className="absolute left-0 right-0 h-1 bg-white/20 rounded-full"
                style={{ bottom: `${level}%`, transform: 'translateY(50%)' }}
              />
            )}
            {/* Level markers */}
            <div className="absolute top-1/4 left-0 w-2 h-px bg-muted-foreground/30" />
            <div className="absolute top-1/2 left-0 w-2 h-px bg-muted-foreground/30" />
            <div className="absolute top-3/4 left-0 w-2 h-px bg-muted-foreground/30" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className={cn('text-3xl font-bold tracking-tight', getLevelTextColor())}>
              {level.toFixed(1)}%
            </div>
            {currentVolume !== undefined && (
              <p className="text-sm text-muted-foreground mt-1">
                {currentVolume.toFixed(1)} m³ / {capacity} m³
              </p>
            )}

            {/* Progress bar */}
            <div className="mt-3">
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full bg-gradient-to-r transition-all duration-700',
                    getLevelColor()
                  )}
                  style={{ width: `${Math.min(level, 100)}%` }}
                />
              </div>
            </div>

            {/* Status message */}
            {level < 20 && (
              <p className="text-xs text-[#DC3545] font-semibold mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC3545] animate-pulse"></span>
                Nível Crítico!
              </p>
            )}
            {level >= 20 && level < 30 && (
              <p className="text-xs text-[#FFC107] font-semibold mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC107]"></span>
                Nível Baixo
              </p>
            )}
            {level >= 30 && level < 50 && (
              <p className="text-xs text-[#00b4d8] font-semibold mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00b4d8]"></span>
                Nível Normal
              </p>
            )}
            {level >= 50 && (
              <p className="text-xs text-[#28A745] font-semibold mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#28A745]"></span>
                Nível Adequado
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
