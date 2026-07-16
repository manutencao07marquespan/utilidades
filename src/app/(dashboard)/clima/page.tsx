'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { Button } from '@/components/ui/button'
import {
  Cloud, Droplets, Wind, Thermometer, Eye, Sun, Gauge, RefreshCw,
  AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown,
  CloudRain, CloudLightning, CloudSnow, CloudFog, CloudSun, Cloudy
} from 'lucide-react'
import { cn } from '@/lib/cn'

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: string
  pressure: number
  visibility: number
  cloudCover: number
  precipitationMm: number
  precipitationProbability: number
  uvIndex: number
  weatherCondition: string
  weatherDescription: string
  feelsLike: number
}

interface ForecastHour {
  time: string
  temperature: number
  precipitation: number
  precipitationProbability: number
  weatherCondition: string
}

interface OperationalImpact {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical'
  flowChangePercent: number
  pacChangePercent: number
  polymerChangePercent: number
  sludgeChangePercent: number
  recommendations: string[]
}

interface WeatherAlert {
  id: string
  sender_name: string
  event: string
  start: number
  end: number
  description: string
}

export default function ClimaPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastHour[]>([])
  const [impact, setImpact] = useState<OperationalImpact | null>(null)
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchWeather()
    const interval = setInterval(fetchWeather, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  async function fetchWeather() {
    setLoading(true)
    try {
      // Current weather
      const weatherRes = await fetch(
        'https://api.openweathermap.org/data/2.5/weather?lat=-23.55&lon=-46.63&appid=54b599f98d1fbbdad1bf443a86229008&units=metric&lang=pt_br'
      )
      const weatherData = await weatherRes.json()

      const currentWeather: WeatherData = {
        temperature: Math.round(weatherData.main.temp * 10) / 10,
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed * 3.6),
        windDirection: getWindDir(weatherData.wind.deg),
        pressure: weatherData.main.pressure,
        visibility: Math.round((weatherData.visibility || 10000) / 1000),
        cloudCover: weatherData.clouds?.all || 0,
        precipitationMm: weatherData.rain?.['1h'] || 0,
        precipitationProbability: weatherData.clouds?.all || 0,
        uvIndex: 0,
        weatherCondition: mapCondition(weatherData.weather[0]?.main),
        weatherDescription: weatherData.weather[0]?.description || '',
        feelsLike: Math.round(weatherData.main.feels_like * 10) / 10,
      }
      setWeather(currentWeather)

      // Forecast
      const forecastRes = await fetch(
        'https://api.openweathermap.org/data/2.5/forecast?lat=-23.55&lon=-46.63&appid=54b599f98d1fbbdad1bf443a86229008&units=metric&lang=pt_br'
      )
      const forecastData = await forecastRes.json()

      const forecastHours: ForecastHour[] = forecastData.list.slice(0, 8).map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        temperature: Math.round(item.main.temp),
        precipitation: item.rain?.['3h'] || 0,
        precipitationProbability: Math.round(item.pop * 100),
        weatherCondition: mapCondition(item.weather[0]?.main),
      }))
      setForecast(forecastHours)

      // Calculate operational impact
      const totalPrecip = forecastHours.reduce((sum, h) => sum + h.precipitation, 0)
      setImpact(calculateImpact(totalPrecip, currentWeather))

      setLastUpdate(new Date().toLocaleTimeString('pt-BR'))

      // Fetch alerts (requires One Call API or alerts endpoint)
      try {
        const alertsRes = await fetch(
          'https://api.openweathermap.org/data/2.5/onecall?lat=-23.55&lon=-46.63&appid=54b599f98d1fbbdad1bf443a86229008&exclude=minutely,daily,alerts=false'
        )
        if (alertsRes.ok) {
          const alertsData = await alertsRes.json()
          if (alertsData.alerts) {
            setAlerts(alertsData.alerts.map((a: any) => ({
              id: a.event || Date.now().toString(),
              sender_name: a.sender_name || 'INMET',
              event: a.event,
              start: a.start,
              end: a.end,
              description: a.description,
            })))
          }
        }
      } catch (e) {
        // Alerts API might not be available on free plan
      }

      // Generate alerts based on weather conditions (always check)
      if (currentWeather) {
        const generatedAlerts: WeatherAlert[] = []

        // Wind alerts
        if (currentWeather.windSpeed >= 40) {
          generatedAlerts.push({
            id: 'wind-high',
            sender_name: 'INMET',
            event: 'Vendaval',
            start: Date.now(),
            end: Date.now() + 24 * 3600 * 1000,
            description: `Vento variando entre ${currentWeather.windSpeed} km/h. Risco de danos a equipamentos expostos e queda de galhos.`,
          })
        } else if (currentWeather.windSpeed >= 20) {
          generatedAlerts.push({
            id: 'wind-moderate',
            sender_name: 'INMET',
            event: 'Vento Moderado',
            start: Date.now(),
            end: Date.now() + 12 * 3600 * 1000,
            description: `Vento de ${currentWeather.windSpeed} km/h. Monitorar equipamentos expostos.`,
          })
        }

        // Humidity alerts
        if (currentWeather.humidity <= 30) {
          generatedAlerts.push({
            id: 'humidity-low',
            sender_name: 'INMET',
            event: 'Baixa Umidade',
            start: Date.now(),
            end: Date.now() + 12 * 3600 * 1000,
            description: `Umidade relativa do ar variando entre ${currentWeather.humidity}%. Risco de incêndios florestais e à saúde.`,
          })
        } else if (currentWeather.humidity <= 40) {
          generatedAlerts.push({
            id: 'humidity-low-moderate',
            sender_name: 'INMET',
            event: 'Umidade Baixa',
            start: Date.now(),
            end: Date.now() + 12 * 3600 * 1000,
            description: `Umidade de ${currentWeather.humidity}%. Monitorar condições.`,
          })
        }

        // Rain alerts
        if (currentWeather.precipitationMm >= 10) {
          generatedAlerts.push({
            id: 'rain-high',
            sender_name: 'INMET',
            event: 'Chuva Intensa',
            start: Date.now(),
            end: Date.now() + 6 * 3600 * 1000,
            description: `Precipitação de ${currentWeather.precipitationMm} mm/hora. Risco de alagamento.`,
          })
        }

        // Heat alerts
        if (currentWeather.temperature >= 35) {
          generatedAlerts.push({
            id: 'heat-high',
            sender_name: 'INMET',
            event: 'Calor Intenso',
            start: Date.now(),
            end: Date.now() + 12 * 3600 * 1000,
            description: `Temperatura de ${currentWeather.temperature}°C. Risco à saúde dos operadores.`,
          })
        }

        // Combine with API alerts
        const allAlerts = [...alerts, ...generatedAlerts]
        setAlerts(allAlerts)
      }

      // Save to database
      await supabase.from('weather_data').insert({
        temperature: currentWeather.temperature,
        humidity: currentWeather.humidity,
        wind_speed: currentWeather.windSpeed,
        pressure: currentWeather.pressure,
        uv_index: currentWeather.uvIndex,
        visibility: currentWeather.visibility,
        cloud_cover: currentWeather.cloudCover,
        precipitation_mm: currentWeather.precipitationMm,
        weather_condition: currentWeather.weatherCondition,
      })
    } catch (error) {
      console.error('Error fetching weather:', error)
    }
    setLoading(false)
  }

  function calculateImpact(precipMm: number, weather: WeatherData): OperationalImpact {
    if (precipMm >= 50 || weather.windSpeed >= 60) {
      return {
        riskLevel: 'critical',
        flowChangePercent: 35,
        pacChangePercent: 20,
        polymerChangePercent: 15,
        sludgeChangePercent: 25,
        recommendations: [
          'Preparar equipe de emergência',
          'Verificar todas as bombas',
          'Não abrir leitos de secagem',
          'Monitorar bacia de amortecimento a cada 30min',
          'Conferir estoque de PAC e polímero',
        ],
      }
    }
    if (precipMm >= 25 || weather.windSpeed >= 40) {
      return {
        riskLevel: 'high',
        flowChangePercent: 25,
        pacChangePercent: 15,
        polymerChangePercent: 12,
        sludgeChangePercent: 18,
        recommendations: [
          'Verificar gradeamento de entrada',
          'Confirmar bomba reserva',
          'Suspender abertura de leitos',
          'Aumentar monitoramento de pH e turbidez',
        ],
      }
    }
    if (precipMm >= 10 || weather.windSpeed >= 20) {
      return {
        riskLevel: 'moderate',
        flowChangePercent: 15,
        pacChangePercent: 10,
        polymerChangePercent: 8,
        sludgeChangePercent: 10,
        recommendations: [
          'Monitorar níveis da bacia',
          'Verificar drenagem',
          'Conferir estoque de insumos',
        ],
      }
    }
    return {
      riskLevel: 'low',
      flowChangePercent: 0,
      pacChangePercent: 0,
      polymerChangePercent: 0,
      sludgeChangePercent: 0,
      recommendations: ['Operação normal. Nenhum impacto previsto.'],
    }
  }

  function getWindDir(deg: number) {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    return dirs[Math.round(deg / 45) % 8]
  }

  function mapCondition(cond: string) {
    const map: Record<string, string> = { Clear: 'clear', Clouds: 'cloudy', Rain: 'rain', Drizzle: 'rain', Thunderstorm: 'storm', Snow: 'snow', Mist: 'fog', Fog: 'fog' }
    return map[cond] || 'partly_cloudy'
  }

  function getWeatherIcon(condition: string, size = 'h-8 w-8') {
    const icons: Record<string, any> = {
      clear: Sun, partly_cloudy: CloudSun, cloudy: Cloudy,
      rain: CloudRain, storm: CloudLightning, snow: CloudSnow, fog: CloudFog,
    }
    const Icon = icons[condition] || Cloud
    return <Icon className={size} />
  }

  function getRiskConfig(level: string) {
    const configs: Record<string, { label: string; variant: 'ok' | 'warning' | 'critical'; color: string; bgColor: string }> = {
      low: { label: 'Normal', variant: 'ok', color: 'text-[#28A745]', bgColor: 'bg-[#28A745]/10 border-[#28A745]/30' },
      moderate: { label: 'Moderado', variant: 'warning', color: 'text-[#FFC107]', bgColor: 'bg-[#FFC107]/10 border-[#FFC107]/30' },
      high: { label: 'Alto', variant: 'critical', color: 'text-[#FF8C00]', bgColor: 'bg-[#FF8C00]/10 border-[#FF8C00]/30' },
      critical: { label: 'Crítico', variant: 'critical', color: 'text-[#DC3545]', bgColor: 'bg-[#DC3545]/10 border-[#DC3545]/30' },
    }
    return configs[level] || configs.low
  }

  if (loading && !weather) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const riskConfig = impact ? getRiskConfig(impact.riskLevel) : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoramento Meteorológico"
        description="Clima operacional e impacto na ETE"
        action={{
          label: 'Atualizar',
          onClick: fetchWeather,
          icon: RefreshCw,
        }}
      />

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <Card className="border-l-4 border-l-[#DC3545] bg-[#DC3545]/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#DC3545]">
              <AlertTriangle className="h-5 w-5" />
              Alertas Meteorológicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-3 rounded-lg bg-white/50 border border-[#DC3545]/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-[#DC3545]">{alert.event}</span>
                    <span className="text-xs text-muted-foreground">{alert.sender_name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Início: {new Date(alert.start * 1000).toLocaleString('pt-BR')}</span>
                    <span>Fim: {new Date(alert.end * 1000).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clima Operacional */}
      {weather && (
        <Card className="overflow-hidden">
          <div className={cn(
            'p-6 text-white',
            weather.weatherCondition === 'rain' || weather.weatherCondition === 'storm'
              ? 'bg-gradient-to-r from-[#1A3A5A] to-[#0d4f6b]'
              : 'bg-gradient-to-r from-[#1A3A5A] to-[#00b4d8]'
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Clima Operacional</h3>
              <span className="text-white/60 text-xs">Atualizado: {lastUpdate}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{getWeatherIcon(weather.weatherCondition, 'h-10 w-10')}</div>
                <div>
                  <p className="text-3xl font-bold">{weather.temperature}°C</p>
                  <p className="text-white/60 text-sm capitalize">{weather.weatherDescription}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Droplets className="h-4 w-4" /> Umidade: {weather.humidity}%
                </div>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Wind className="h-4 w-4" /> Vento: {weather.windSpeed} km/h {weather.windDirection}
                </div>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Gauge className="h-4 w-4" /> Pressão: {weather.pressure} hPa
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <CloudRain className="h-4 w-4" /> Chuva: {weather.precipitationMm} mm
                </div>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Sun className="h-4 w-4" /> UV: {weather.uvIndex}
                </div>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Eye className="h-4 w-4" /> Visibilidade: {weather.visibility} km
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Cloud className="h-4 w-4" /> Nuvens: {weather.cloudCover}%
                </div>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Thermometer className="h-4 w-4" /> Sensação: {weather.feelsLike}°C
                </div>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Droplets className="h-4 w-4" /> Chance chuva: {weather.precipitationProbability}%
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Impacto Operacional */}
      {impact && riskConfig && (
        <Card className={cn('border-l-4', impact.riskLevel === 'low' ? 'border-l-[#28A745]' : impact.riskLevel === 'moderate' ? 'border-l-[#FFC107]' : 'border-l-[#DC3545]')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className={cn('h-5 w-5', riskConfig.color)} />
                Impacto na Operação
              </CardTitle>
              <StatusIndicator variant={riskConfig.variant} label={riskConfig.label} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Mudanças Esperadas</h4>
                {impact.flowChangePercent > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-[#DC3545]" />
                    <span>Vazão: <strong>+{impact.flowChangePercent}%</strong></span>
                  </div>
                )}
                {impact.pacChangePercent > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-[#FFC107]" />
                    <span>Consumo PAC: <strong>+{impact.pacChangePercent}%</strong></span>
                  </div>
                )}
                {impact.polymerChangePercent > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-[#00b4d8]" />
                    <span>Polímero: <strong>+{impact.polymerChangePercent}%</strong></span>
                  </div>
                )}
                {impact.sludgeChangePercent > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-[#6C757D]" />
                    <span>Lodo: <strong>+{impact.sludgeChangePercent}%</strong></span>
                  </div>
                )}
                {impact.riskLevel === 'low' && (
                  <div className="flex items-center gap-2 text-sm text-[#28A745]">
                    <CheckCircle className="h-4 w-4" />
                    <span>Sem impactos previstos</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Recomendações</h4>
                <ul className="space-y-1.5">
                  {impact.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-[#28A745] mt-0.5 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previsão Próximas Horas */}
      {forecast.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-[#00b4d8]" />
              Previsão Próximas Horas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {forecast.map((hour, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-shrink-0 w-24 p-3 rounded-xl text-center transition-all',
                    i === 0 ? 'bg-[#1A3A5A] text-white' : 'bg-muted/50 hover:bg-muted'
                  )}
                >
                  <p className={cn('text-xs font-medium', i === 0 ? 'text-white/80' : 'text-muted-foreground')}>
                    {i === 0 ? 'Agora' : hour.time}
                  </p>
                  <div className="my-2">{getWeatherIcon(hour.weatherCondition, 'h-6 w-6')}</div>
                  <p className="text-lg font-bold">{hour.temperature}°</p>
                  {hour.precipitation > 0 && (
                    <p className="text-xs text-[#00b4d8]">💧 {hour.precipitation.toFixed(1)}mm</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">{hour.precipitationProbability}% chuva</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Radar de Chuva - Gráfico de Barras */}
      {forecast.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CloudRain className="h-4 w-4 text-[#00b4d8]" />
              Radar de Chuva - Próximas Horas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-48">
              {forecast.map((hour, i) => {
                const maxPrecip = Math.max(...forecast.map(h => h.precipitation), 1)
                const barHeight = (hour.precipitation / maxPrecip) * 100
                const hasRain = hour.precipitation > 0

                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    {/* Precipitation value */}
                    {hasRain && (
                      <span className="text-xs font-medium text-[#00b4d8] mb-1">
                        {hour.precipitation.toFixed(1)}
                      </span>
                    )}

                    {/* Bar */}
                    <div className={cn(
                      'w-full rounded-t-lg transition-all duration-500 min-h-[4px]',
                      hasRain
                        ? 'bg-gradient-to-t from-[#00b4d8] to-[#0096c7]'
                        : 'bg-muted/30'
                    )} style={{ height: hasRain ? `${Math.max(barHeight, 5)}%` : '4px' }} />

                    {/* Time label */}
                    <span className="text-[10px] text-muted-foreground mt-2">
                      {i === 0 ? 'Agora' : hour.time}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
              <span> Precipitação (mm)</span>
              <span>
                Total previsto: {forecast.reduce((sum, h) => sum + h.precipitation, 0).toFixed(1)} mm
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
