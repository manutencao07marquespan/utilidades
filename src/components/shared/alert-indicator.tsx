'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/cn'

export function AlertIndicator() {
  const [hasAlerts, setHasAlerts] = useState(false)
  const [alertCount, setAlertCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    checkAlerts()
    // Check every 30 seconds
    const interval = setInterval(checkAlerts, 30 * 1000)
    return () => clearInterval(interval)
  }, [])

  async function checkAlerts() {
    const { count } = await supabase
      .from('alert_history')
      .select('id', { count: 'exact', head: true })
      .eq('acknowledged', false)

    if (count && count > 0) {
      setHasAlerts(true)
      setAlertCount(count)
    } else {
      setHasAlerts(false)
      setAlertCount(0)
    }
  }

  if (!hasAlerts) return null

  return (
    <div className="relative">
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DC3545] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#DC3545]"></span>
      </span>
    </div>
  )
}
