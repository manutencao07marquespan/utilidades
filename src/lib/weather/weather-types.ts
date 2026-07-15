export interface WeatherData {
  temperature: number
  temperatureMin: number
  temperatureMax: number
  humidity: number
  windSpeed: number
  windDirection: string
  precipitationProbability: number
  precipitationMm: number
  weatherCondition: string
  weatherIcon: string
  weatherDescription: string
  pressure: number
  visibility: number
  cloudCover: number
  sunrise: string
  sunset: string
}

export interface WeatherForecast {
  date: string
  hour: number
  data: WeatherData
}

export interface WeatherAlert {
  id: string
  type: 'rain' | 'storm' | 'flood' | 'heat' | 'cold' | 'wind'
  severity: 'low' | 'moderate' | 'high' | 'critical'
  title: string
  description: string
  recommendation: string
  startsAt: Date
  endsAt: Date | null
  isActive: boolean
}

export interface OperationalImpact {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical'
  flowChangePercent: number
  pacChangePercent: number
  polymerChangePercent: number
  recommendation: string
}

export interface WeatherCondition {
  id: string
  label: string
  icon: string
}

export const WEATHER_CONDITIONS: WeatherCondition[] = [
  { id: 'clear', label: 'Ensolarado', icon: '☀️' },
  { id: 'partly_cloudy', label: 'Parcialmente Nublado', icon: '⛅' },
  { id: 'cloudy', label: 'Nublado', icon: '☁️' },
  { id: 'rain', label: 'Chuvoso', icon: '🌧️' },
  { id: 'heavy_rain', label: 'Chuva Forte', icon: '⛈️' },
  { id: 'storm', label: 'Tempestade', icon: '🌩️' },
  { id: 'fog', label: 'Névoa', icon: '🌫️' },
  { id: 'snow', label: 'Neve', icon: '❄️' },
]

export function getWeatherIcon(condition: string): string {
  const cond = WEATHER_CONDITIONS.find(c => c.id === condition)
  return cond?.icon || '🌤️'
}

export function getRiskLevelColor(level: string): string {
  const colors: Record<string, string> = {
    low: '#28A745',
    moderate: '#FFC107',
    high: '#FF8C00',
    critical: '#DC3545',
  }
  return colors[level] || '#6C757D'
}

export function getRiskLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    low: 'Baixo',
    moderate: 'Moderado',
    high: 'Alto',
    critical: 'Crítico',
  }
  return labels[level] || 'Desconhecido'
}
