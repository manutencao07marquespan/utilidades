'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { AlertTriangle, CheckCircle, Droplets, Beaker, Trash2 } from 'lucide-react'
import { getCurrentWeather, calculateOperationalImpact } from '@/lib/weather/weather-service'
import { getRiskLevelColor, getRiskLevelLabel } from '@/lib/weather/weather-types'
import { cn } from '@/lib/cn'

export function OperationalImpactCard() {
  const [impact, setImpact] = useState<ReturnType<typeof calculateOperationalImpact> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    calculateImpact()
  }, [])

  async function calculateImpact() {
    setLoading(true)
    const weather = await getCurrentWeather()
    if (weather) {
      const operationalImpact = calculateOperationalImpact(weather.precipitationMm)
      setImpact(operationalImpact)
    }
    setLoading(false)
  }

  if (loading || !impact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-[#FFC107]" />
            Impacto Operacional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const recommendations = [
    { text: 'Bacia de amortecimento', checked: impact.riskLevel !== 'low' },
    { text: 'Decantadores', checked: impact.riskLevel !== 'low' },
    { text: 'Bombas', checked: impact.riskLevel !== 'low' },
    { text: 'Leitos de secagem', checked: impact.riskLevel === 'critical' },
    { text: 'Estoque de polímero', checked: impact.riskLevel !== 'low' },
  ]

  return (
    <Card className="border-l-4" style={{ borderLeftColor: getRiskLevelColor(impact.riskLevel) }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4" style={{ color: getRiskLevelColor(impact.riskLevel) }} />
            Impacto Operacional
          </CardTitle>
          <StatusIndicator
            variant={impact.riskLevel === 'low' ? 'ok' : impact.riskLevel === 'moderate' ? 'warning' : 'critical'}
            label={getRiskLevelLabel(impact.riskLevel)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Impact percentages */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-muted/30 text-center">
              <Droplets className="h-5 w-5 mx-auto mb-1 text-[#00b4d8]" />
              <p className="text-lg font-bold">{impact.flowChangePercent > 0 ? '+' : ''}{impact.flowChangePercent}%</p>
              <p className="text-[10px] text-muted-foreground">Vazão</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 text-center">
              <Beaker className="h-5 w-5 mx-auto mb-1 text-[#28A745]" />
              <p className="text-lg font-bold">{impact.pacChangePercent > 0 ? '+' : ''}{impact.pacChangePercent}%</p>
              <p className="text-[10px] text-muted-foreground">PAC</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 text-center">
              <Beaker className="h-5 w-5 mx-auto mb-1 text-[#FFC107]" />
              <p className="text-lg font-bold">{impact.polymerChangePercent > 0 ? '+' : ''}{impact.polymerChangePercent}%</p>
              <p className="text-[10px] text-muted-foreground">Polímero</p>
            </div>
          </div>

          {/* Recommendation */}
          <div className="p-3 rounded-xl bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Recomendação:</p>
            <p className="text-sm">{impact.recommendation}</p>
          </div>

          {/* Checklist */}
          {impact.riskLevel !== 'low' && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Verificar:</p>
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={cn(
                    'w-4 h-4 rounded flex items-center justify-center',
                    rec.checked ? 'bg-[#28A745]' : 'bg-muted'
                  )}>
                    {rec.checked && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                  <span className="text-xs">{rec.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
