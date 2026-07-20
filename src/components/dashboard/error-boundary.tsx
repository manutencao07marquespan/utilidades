'use client'

import { Component, ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Dashboard widget error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="p-4">
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <AlertTriangle className="h-5 w-5 text-[#FFC107]" />
            <span>Erro ao carregar componente</span>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
