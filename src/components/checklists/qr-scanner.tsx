'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScanLine, Search, CheckCircle, XCircle } from 'lucide-react'

interface QRData {
  equipment_id: string
  equipment_name: string
  equipment_code: string
  sector: string
  template_id: string
  template_name: string
}

interface QRScannerProps {
  onScan: (data: QRData) => void
}

export function QRScanner({ onScan }: QRScannerProps) {
  const [manualCode, setManualCode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  async function handleManualScan() {
    if (!manualCode.trim()) {
      setError('Digite o código do equipamento')
      return
    }

    setScanning(true)
    setError(null)
    setSuccess(null)

    try {
      // Search for QR code by equipment code
      const { data: qrData, error: qrError } = await supabase
        .from('equipment_qrcodes')
        .select('*, assets(name, asset_code, location)')
        .eq('qr_code', manualCode.trim())
        .eq('status', 'active')
        .single()

      if (qrError || !qrData) {
        setError('QR Code não encontrado ou inativo')
        setScanning(false)
        return
      }

      // Find matching template
      const { data: templateData } = await supabase
        .from('checklist_templates')
        .select('id, name')
        .eq('is_active', true)
        .limit(1)
        .single()

      setSuccess(`Equipamento encontrado: ${qrData.assets?.name || 'Desconhecido'}`)

      // Simulate scan delay
      setTimeout(() => {
        onScan({
          equipment_id: qrData.equipment_id,
          equipment_name: qrData.assets?.name || 'Desconhecido',
          equipment_code: qrData.assets?.asset_code || manualCode,
          sector: qrData.sector || qrData.assets?.location || '-',
          template_id: templateData?.id || '',
          template_name: templateData?.name || 'Checklist Padrão',
        })
        setScanning(false)
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Erro ao escanear QR Code')
      setScanning(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-[#00b4d8]" />
          Scanner QR Code
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <Alert className="bg-[#DC3545]/10 border-[#DC3545]/30 text-[#DC3545]">
              <AlertDescription className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                {error}
              </AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-[#28A745]/10 border-[#28A745]/30 text-[#28A745]">
              <AlertDescription className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* QR Code Visual Area */}
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center">
            <div className="w-32 h-32 mx-auto border-4 border-muted-foreground/20 rounded-lg flex items-center justify-center mb-4">
              <ScanLine className="h-16 w-16 text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground">
              Posicione o QR Code dentro da área
            </p>
          </div>

          {/* Manual Input */}
          <div className="space-y-2">
            <Label htmlFor="manual_code">Ou digite o código manualmente</Label>
            <div className="flex gap-2">
              <Input
                id="manual_code"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Ex: EQ-000245"
                onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
              />
              <Button
                type="button"
                onClick={handleManualScan}
                disabled={scanning || !manualCode.trim()}
                className="btn-gradient-green text-white border-0"
              >
                {scanning ? (
                  <span className="animate-spin">⟳</span>
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
