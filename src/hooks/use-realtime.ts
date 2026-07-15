'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtime<T>(
  table: string,
  filter?: string
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let channel: RealtimeChannel

    const fetchData = async () => {
      try {
        let query = supabase.from(table).select('*')
        
        if (filter) {
          // Apply filter if provided
          const [column, value] = filter.split('=')
          query = query.eq(column, value)
        }

        const { data, error } = await query

        if (error) {
          setError(error.message)
        } else {
          setData(data as T[])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Subscribe to realtime changes
    channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        (_payload: any) => {
          // Refetch data on any change
          fetchData()
        }
      )
      .subscribe()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, filter, supabase])

  return { data, loading, error }
}
