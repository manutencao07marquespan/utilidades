'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@/components/shared/skeleton-loader'

// Lazy load heavy components
export const LazyWeatherCard = dynamic(
  () => import('./weather-card').then(mod => ({ default: mod.WeatherCard })),
  { loading: () => <SkeletonCard /> }
)

export const LazyWeatherForecastCard = dynamic(
  () => import('./weather-forecast-card').then(mod => ({ default: mod.WeatherForecastCard })),
  { loading: () => <SkeletonCard /> }
)

export const LazyOperationalImpactCard = dynamic(
  () => import('./operational-impact-card').then(mod => ({ default: mod.OperationalImpactCard })),
  { loading: () => <SkeletonCard /> }
)

export const LazyWaterBalanceChart = dynamic(
  () => import('./water-balance-chart').then(mod => ({ default: mod.WaterBalanceChart })),
  { loading: () => <SkeletonCard /> }
)

export const LazyPumpStatusCard = dynamic(
  () => import('./pump-status-card').then(mod => ({ default: mod.PumpStatusCard })),
  { loading: () => <SkeletonCard /> }
)

export const LazyCriticalAlertsPanel = dynamic(
  () => import('./critical-alerts-panel').then(mod => ({ default: mod.CriticalAlertsPanel })),
  { loading: () => <SkeletonCard /> }
)

export const LazyCisternSimulator = dynamic(
  () => import('./cistern-simulator').then(mod => ({ default: mod.CisternSimulator })),
  { loading: () => <SkeletonCard /> }
)

export const LazyHydrantSimulator = dynamic(
  () => import('./hydrant-simulator').then(mod => ({ default: mod.HydrantSimulator })),
  { loading: () => <SkeletonCard /> }
)

export const LazyProductionSummary = dynamic(
  () => import('./production-summary').then(mod => ({ default: mod.ProductionSummary })),
  { loading: () => <SkeletonCard /> }
)
