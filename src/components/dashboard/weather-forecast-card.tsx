'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, RefreshCw } from 'lucide-react'
import { WeatherForecast } from '@/lib/weather/weather-types'
import { getWeatherForecast } from '@/lib/weather/weather-service'
import { cn } from '@/lib/cn'

export function WeatherForecastCard() {
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchForecast()
  }, [])

  async function fetchForecast() {
    setLoading(true)
    const data = await getWeatherForecast()
    // Group by date and get daily summary
    const dailyForecasts = groupForecastsByDate(data)
    setForecasts(dailyForecasts.slice(0, 5))
    setLoading(false)
  }

  function groupForecastsByDate(forecasts: WeatherForecast[]): WeatherForecast[] {
    const grouped = new Map<string, WeatherForecast[]>()

    forecasts.forEach(forecast => {
      const existing = grouped.get(forecast.date) || []
      existing.push(forecast)
      grouped.set(forecast.date, existing)
    })

    return Array.from(grouped.entries()).map(([date, dayForecasts]) => {
      const maxTemp = Math.max(...dayForecasts.map(f => f.data.temperatureMax))
      const minTemp = Math.min(...dayForecasts.map(f => f.data.temperatureMin))
      const totalPrecip = dayForecasts.reduce((sum, f) => sum + f.data.precipitationMm, 0)
      const avgHumidity = dayForecasts.reduce((sum, f) => sum + f.data.humidity, 0) / dayForecasts.length

      // Get most common condition
      const conditions = dayForecasts.map(f => f.data.weatherCondition)
      const mainCondition = conditions.sort((a, b) =>
        conditions.filter(v => v === b).length - conditions.filter(v => v === a).length
      )[0]

      return {
        date,
        hour: 12,
        data: {
          temperature: (maxTemp + minTemp) / 2,
          temperatureMin: minTemp,
          temperatureMax: maxTemp,
          humidity: avgHumidity,
          windSpeed: dayForecasts[0]?.data.windSpeed || 0,
          windDirection: dayForecasts[0]?.data.windDirection || '',
          precipitationProbability: Math.max(...dayForecasts.map(f => f.data.precipitationProbability)),
          precipitationMm: totalPrecip,
          weatherCondition: mainCondition,
          weatherIcon: dayForecasts[0]?.data.weatherIcon || '',
          weatherDescription: dayForecasts[0]?.data.weatherDescription || '',
          pressure: 0,
          visibility: 0,
          cloudCover: 0,
          sunrise: '',
          sunset: '',
        },
      }
    })
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr + 'T12:00:00')
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return 'Hoje'
    if (date.toDateString() === tomorrow.toDateString()) return 'Amanhã'

    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
  }

  function getWeatherEmoji(condition: string) {
    const emojis: Record<string, string> = {
      clear: '☀️',
      partly_cloudy: '⛅',
      cloudy: '☁️',
      rain: '🌧️',
      heavy_rain: '⛈️',
      storm: '🌩️',
      fog: '🌫️',
    }
    return emojis[condition] || '🌤️'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-[#00b4d8]" />
            Previsão para os Próximos Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-[#00b4d8]" />
            Previsão para os Próximos Dias
          </CardTitle>
          <button
            onClick={fetchForecast}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {forecasts.map((forecast, index) => (
            <div
              key={forecast.date}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl transition-colors',
                index === 0 ? 'bg-[#00b4d8]/5 border border-[#00b4d8]/20' : 'hover:bg-muted/30'
              )}
            >
              <div className="w-20">
                <p className={cn('text-sm font-medium', index === 0 && 'text-[#00b4d8]')}>
                  {formatDate(forecast.date)}
                </p>
              </div>

              <div className="text-2xl">
                {getWeatherEmoji(forecast.data.weatherCondition)}
              </div>

              <div className="flex-1">
                {forecast.data.precipitationMm > 0 && (
                  <p className="text-xs text-[#00b4d8] font-medium">
                    💧 {forecast.data.precipitationMm.toFixed(1)} mm
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="text-sm font-medium">
                  {forecast.data.temperatureMax.toFixed(0)}°
                </p>
                <p className="text-xs text-muted-foreground">
                  {forecast.data.temperatureMin.toFixed(0)}°
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
