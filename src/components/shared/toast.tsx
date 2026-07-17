'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/cn'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    success: 'bg-[#28A745]/10 border-[#28A745]/30 text-[#28A745]',
    error: 'bg-[#DC3545]/10 border-[#DC3545]/30 text-[#DC3545]',
    warning: 'bg-[#FFC107]/10 border-[#FFC107]/30 text-[#FFC107]',
    info: 'bg-[#00b4d8]/10 border-[#00b4d8]/30 text-[#00b4d8]',
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map(toast => {
          const Icon = icons[toast.type]
          return (
            <div
              key={toast.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border shadow-lg animate-slide-in',
                colors[toast.type]
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-sm flex-1">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 opacity-70 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
