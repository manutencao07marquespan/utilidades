'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { Cloud, Droplets, Wind, Thermometer, RefreshCw } from 'lucide-react'
import { WeatherData, getRiskLevelColor, getRiskLevelLabel } from '@/lib/weather/weather-types'
import { getCurrentWeather, calculateOperationalImpact } from '@/lib/weather/weather-service'
import { cn } from '@/lib/cn'

export function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    fetchWeather()
    // Refresh every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  async function fetchWeather() {
    setLoading(true)
    const data = await getCurrentWeather()
    setWeather(data)
    setLastUpdate(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    setLoading(false)
  }

  if (loading && !weather) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Cloud className="h-4 w-4 text-[#00b4d8]" />
            Previsão do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!weather) return null

  const impact = calculateOperationalImpact(weather.precipitationMm)

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Cloud className="h-4 w-4 text-[#00b4d8]" />
            Previsão do Tempo
          </CardTitle>
          <button
            onClick={fetchWeather}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw className={cn('h-3.5 w-3.5 text-muted-foreground', loading && 'animate-spin')} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main weather info */}
          <div className="flex items-center gap-4">
            <div className="text-4xl">
              {weather.weatherCondition === 'rain' ? '🌧️' :
               weather.weatherCondition === 'cloudy' ? '☁️' :
               weather.weatherCondition === 'clear' ? '☀️' : '⛅'}
            </div>
            <div>
              <p className="text-3xl font-bold">{weather.temperature.toFixed(0)}°C</p>
              <p className="text-sm text-muted-foreground capitalize">{weather.weatherDescription}</p>
            </div>
          </div>

          {/* Weather details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <Droplets className="h-4 w-4 text-[#00b4d8]" />
              <div>
                <p className="text-xs text-muted-foreground">Umidade</p>
                <p className="text-sm font-medium">{weather.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <Wind className="h-4 w-4 text-[#6C757D]" />
              <div>
                <p className="text-xs text-muted-foreground">Vento</p>
                <p className="text-sm font-medium">{weather.windSpeed} km/h {weather.windDirection}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <Cloud className="h-4 w-4 text-[#FFC107]" />
              <div>
                <p className="text-xs text-muted-foreground">Precipitação</p>
                <p className="text-sm font-medium">{weather.precipitationMm.toFixed(1)} mm</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <Thermometer className="h-4 w-4 text-[#DC3545]" />
              <div>
                <p className="text-xs text-muted-foreground">Máx/Mín</p>
                <p className="text-sm font-medium">{weather.temperatureMax.toFixed(0)}° / {weather.temperatureMin.toFixed(0)}°</p>
              </div>
            </div>
          </div>

          {/* Operational Impact */}
          <div className="p-3 rounded-xl border" style={{ borderColor: getRiskLevelColor(impact.riskLevel) + '40', backgroundColor: getRiskLevelColor(impact.riskLevel) + '10' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Impacto Operacional</span>
              <StatusIndicator
                variant={impact.riskLevel === 'low' ? 'ok' : impact.riskLevel === 'moderate' ? 'warning' : 'critical'}
                label={getRiskLevelLabel(impact.riskLevel)}
              />
            </div>
            <p className="text-xs text-muted-foreground">{impact.recommendation}</p>
          </div>

          {/* Sunrise/Sunset */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>🌅 Nascer: {weather.sunrise}</span>
            <span>🌇 Pôr: {weather.sunset}</span>
          </div>

          {/* Last update */}
          <p className="text-[10px] text-muted-foreground text-center">
            Última atualização: {lastUpdate}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
