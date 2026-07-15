'use client'

import { useState, useCallback } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  isLoading: boolean
  error: string | null
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    isLoading: false,
    error: null,
  })

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
      }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          isLoading: false,
          error: null,
        })
      },
      (error) => {
        let errorMessage = 'Unknown error'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permission denied. Please enable location access.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Request timed out.'
            break
        }

        setState({
          latitude: null,
          longitude: null,
          accuracy: null,
          isLoading: false,
          error: errorMessage,
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [])

  const validateLocation = useCallback(
    (targetLat: number, targetLng: number, radiusMeters: number = 50) => {
      if (state.latitude === null || state.longitude === null) {
        return false
      }

      // Calculate distance using Haversine formula
      const R = 6371e3 // Earth's radius in meters
      const φ1 = (state.latitude * Math.PI) / 180
      const φ2 = (targetLat * Math.PI) / 180
      const Δφ = ((targetLat - state.latitude) * Math.PI) / 180
      const Δλ = ((targetLng - state.longitude) * Math.PI) / 180

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

      const distance = R * c

      return distance <= radiusMeters
    },
    [state.latitude, state.longitude]
  )

  return {
    ...state,
    getCurrentPosition,
    validateLocation,
  }
}
