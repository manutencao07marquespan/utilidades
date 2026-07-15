'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScanLine, Search, CheckCircle, XCircle, Camera, CameraOff, Vibrate } from 'lucide-react'

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
  const [cameraActive, setCameraActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const supabase = createClient()

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  function playBeep() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 1200
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.15)
    } catch (e) {
      console.log('Audio not supported')
    }
  }

  function vibrate() {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }
  }

  async function startCamera() {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        streamRef.current = stream
        setCameraActive(true)

        // Start QR detection loop
        startQRDetection()
      }
    } catch (err: any) {
      console.error('Camera error:', err)
      setError('Não foi possível acessar a câmera. Verifique as permissões do navegador.')
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  function startQRDetection() {
    // Simple QR detection using canvas
    const detect = async () => {
      if (!videoRef.current || !cameraActive) return

      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = videoRef.current.videoWidth || 640
        canvas.height = videoRef.current.videoHeight || 480
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

        // For now, we'll rely on manual input or barcode detection API
        // This is a placeholder - real QR detection would use a library like html5-qrcode

        if (cameraActive) {
          requestAnimationFrame(detect)
        }
      } catch (e) {
        console.log('Detection error:', e)
      }
    }

    if (cameraActive) {
      detect()
    }
  }

  async function handleScanResult(code: string) {
    if (!code.trim()) return

    setScanning(true)
    setError(null)
    setSuccess(null)

    // Vibrate and beep on successful scan
    vibrate()
    playBeep()

    try {
      // Search for QR code
      const { data: qrData, error: qrError } = await supabase
        .from('equipment_qrcodes')
        .select('*, assets(name, asset_code, location)')
        .eq('qr_code', code.trim())
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
          equipment_code: qrData.assets?.asset_code || code,
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

  async function handleManualScan() {
    if (!manualCode.trim()) {
      setError('Digite o código do equipamento')
      return
    }
    await handleScanResult(manualCode)
  }

  // Handle barcode detection API (if supported)
  useEffect(() => {
    if (!cameraActive || !videoRef.current) return

    const handleBarcodeDetection = (event: any) => {
      if (event.detail?.code) {
        handleScanResult(event.detail.code)
      }
    }

    // Check if BarcodeDetector is available
    if ('BarcodeDetector' in window) {
      const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })

      const detectLoop = async () => {
        if (!videoRef.current || !cameraActive) return

        try {
          const barcodes = await barcodeDetector.detect(videoRef.current)
          if (barcodes.length > 0) {
            handleScanResult(barcodes[0].rawValue)
          }
        } catch (e) {
          // Ignore detection errors
        }

        if (cameraActive) {
          requestAnimationFrame(detectLoop)
        }
      }

      detectLoop()
    }
  }, [cameraActive])

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

          {/* Camera Area */}
          <div className="relative rounded-xl overflow-hidden border-2 border-muted-foreground/30 bg-black">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover"
              playsInline
              muted
              autoPlay
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                <Camera className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Toque para ativar a câmera
                </p>
                <Button
                  type="button"
                  onClick={startCamera}
                  className="btn-gradient-green text-white border-0"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Ativar Câmera
                </Button>
              </div>
            )}
            {cameraActive && (
              <>
                {/* Scanner overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-4 border-[#28A745] rounded-xl m-8 opacity-50"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#28A745]"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#28A745]"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#28A745]"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#28A745]"></div>
                  </div>
                </div>
                {/* Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={stopCamera}
                  >
                    <CameraOff className="h-4 w-4 mr-1" />
                    Fechar
                  </Button>
                  <div className="flex items-center gap-2 text-white text-xs bg-black/50 px-3 py-1 rounded-full">
                    <Vibrate className="h-3 w-3" />
                    Vibração ativada
                  </div>
                </div>
              </>
            )}
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
