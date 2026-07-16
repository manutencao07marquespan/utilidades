'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#DC3545]/10 flex items-center justify-center">
            <WifiOff className="h-8 w-8 text-[#DC3545]" />
          </div>
          <h2 className="text-xl font-bold mb-2">Sem Conexão</h2>
          <p className="text-muted-foreground mb-6">
            Você está offline. Verifique sua conexão com a internet.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Dados salvos localmente serão sincronizados quando a conexão for restaurada.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="btn-gradient-green text-white border-0"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
