import { WeatherData, WeatherForecast, OperationalImpact } from './weather-types'

// API Key from environment variable
const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || ''
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5'

// Cache for weather data (15 minutes)
let weatherCache: { data: WeatherData; timestamp: number } | null = null
let forecastCache: { data: WeatherForecast[]; timestamp: number } | null = null
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

// Default location: São Paulo, ETE
const DEFAULT_LAT = -23.55
const DEFAULT_LON = -46.63

export async function getCurrentWeather(lat: number = DEFAULT_LAT, lon: number = DEFAULT_LON): Promise<WeatherData | null> {
  // Check cache
  if (weatherCache && Date.now() - weatherCache.timestamp < CACHE_DURATION) {
    return weatherCache.data
  }

  if (!OPENWEATHER_API_KEY) {
    console.warn('OpenWeather API key not configured, using mock data')
    return getMockWeatherData()
  }

  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`
    )

    if (!response.ok) {
      console.error('Weather API error:', response.status, response.statusText)
      return getMockWeatherData()
    }

    const data = await response.json()

    const weatherData: WeatherData = {
      temperature: Math.round(data.main.temp * 10) / 10,
      temperatureMin: Math.round(data.main.temp_min * 10) / 10,
      temperatureMax: Math.round(data.main.temp_max * 10) / 10,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
      windDirection: getWindDirection(data.wind.deg),
      precipitationProbability: data.clouds?.all || 0,
      precipitationMm: data.rain?.['1h'] || data.rain?.['3h'] || 0,
      weatherCondition: mapWeatherCondition(data.weather[0]?.main),
      weatherIcon: data.weather[0]?.icon || '01d',
      weatherDescription: data.weather[0]?.description || '',
      pressure: data.main.pressure,
      visibility: (data.visibility || 10000) / 1000,
      cloudCover: data.clouds?.all || 0,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }

    // Update cache
    weatherCache = { data: weatherData, timestamp: Date.now() }

    return weatherData
  } catch (error) {
    console.error('Error fetching weather:', error)
    return getMockWeatherData()
  }
}

export async function getWeatherForecast(lat: number = DEFAULT_LAT, lon: number = DEFAULT_LON): Promise<WeatherForecast[]> {
  // Check cache
  if (forecastCache && Date.now() - forecastCache.timestamp < CACHE_DURATION) {
    return forecastCache.data
  }

  if (!OPENWEATHER_API_KEY) {
    return getMockForecastData()
  }

  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`
    )

    if (!response.ok) {
      console.error('Forecast API error:', response.status, response.statusText)
      return getMockForecastData()
    }

    const data = await response.json()

    const forecasts: WeatherForecast[] = data.list.map((item: any) => ({
      date: new Date(item.dt * 1000).toISOString().split('T')[0],
      hour: new Date(item.dt * 1000).getHours(),
      data: {
        temperature: Math.round(item.main.temp * 10) / 10,
        temperatureMin: Math.round(item.main.temp_min * 10) / 10,
        temperatureMax: Math.round(item.main.temp_max * 10) / 10,
        humidity: item.main.humidity,
        windSpeed: Math.round(item.wind.speed * 3.6),
        windDirection: getWindDirection(item.wind.deg),
        precipitationProbability: item.pop * 100,
        precipitationMm: item.rain?.['3h'] || 0,
        weatherCondition: mapWeatherCondition(item.weather[0]?.main),
        weatherIcon: item.weather[0]?.icon || '01d',
        weatherDescription: item.weather[0]?.description || '',
        pressure: item.main.pressure,
        visibility: (item.visibility || 10000) / 1000,
        cloudCover: item.clouds?.all || 0,
        sunrise: '',
        sunset: '',
      },
    }))

    // Update cache
    forecastCache = { data: forecasts, timestamp: Date.now() }

    return forecasts
  } catch (error) {
    console.error('Error fetching forecast:', error)
    return getMockForecastData()
  }
}

export function calculateOperationalImpact(precipitationMm: number): OperationalImpact {
  if (precipitationMm >= 50) {
    return {
      riskLevel: 'critical',
      flowChangePercent: 35,
      pacChangePercent: 20,
      polymerChangePercent: 15,
      recommendation: 'Evitar abertura de leitos. Verificar bombas e drenagem. Aumentar monitoramento.',
    }
  } else if (precipitationMm >= 25) {
    return {
      riskLevel: 'high',
      flowChangePercent: 25,
      pacChangePercent: 15,
      polymerChangePercent: 12,
      recommendation: 'Verificar bacia de amortecimento e decantadores. Monitorar bombas.',
    }
  } else if (precipitationMm >= 10) {
    return {
      riskLevel: 'moderate',
      flowChangePercent: 15,
      pacChangePercent: 10,
      polymerChangePercent: 8,
      recommendation: 'Monitorar níveis. Verificar equipamentos de drenagem.',
    }
  }
  return {
    riskLevel: 'low',
    flowChangePercent: 0,
    pacChangePercent: 0,
    polymerChangePercent: 0,
    recommendation: 'Operação normal.',
  }
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}

function mapWeatherCondition(condition: string): string {
  const mapping: Record<string, string> = {
    Clear: 'clear',
    Clouds: 'cloudy',
    Rain: 'rain',
    Drizzle: 'rain',
    Thunderstorm: 'storm',
    Snow: 'snow',
    Mist: 'fog',
    Fog: 'fog',
    Haze: 'fog',
  }
  return mapping[condition] || 'partly_cloudy'
}

function getMockWeatherData(): WeatherData {
  return {
    temperature: 24,
    temperatureMin: 18,
    temperatureMax: 28,
    humidity: 78,
    windSpeed: 12,
    windDirection: 'NE',
    precipitationProbability: 85,
    precipitationMm: 18,
    weatherCondition: 'rain',
    weatherIcon: '10d',
    weatherDescription: 'chuva leve',
    pressure: 1013,
    visibility: 8,
    cloudCover: 75,
    sunrise: '06:45',
    sunset: '17:30',
  }
}

function getMockForecastData(): WeatherForecast[] {
  const today = new Date()
  const forecasts: WeatherForecast[] = []

  for (let i = 0; i < 5; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)

    forecasts.push({
      date: date.toISOString().split('T')[0],
      hour: 12,
      data: {
        temperature: 22 + Math.random() * 8,
        temperatureMin: 16 + Math.random() * 4,
        temperatureMax: 26 + Math.random() * 6,
        humidity: 60 + Math.random() * 30,
        windSpeed: 5 + Math.random() * 15,
        windDirection: 'NE',
        precipitationProbability: Math.random() * 100,
        precipitationMm: Math.random() * 30,
        weatherCondition: i === 0 ? 'rain' : i === 1 ? 'partly_cloudy' : 'clear',
        weatherIcon: i === 0 ? '10d' : i === 1 ? '02d' : '01d',
        weatherDescription: i === 0 ? 'chuva leve' : i === 1 ? 'parcialmente nublado' : 'ensolarado',
        pressure: 1010 + Math.random() * 10,
        visibility: 5 + Math.random() * 10,
        cloudCover: i === 0 ? 80 : i === 1 ? 50 : 20,
        sunrise: '06:45',
        sunset: '17:30',
      },
    })
  }

  return forecasts
}
