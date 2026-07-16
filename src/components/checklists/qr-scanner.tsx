'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScanLine, Search, CheckCircle, XCircle, Camera, CameraOff, Vibrate } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'

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
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedEquipment, setSelectedEquipment] = useState('')
  const [equipmentList, setEquipmentList] = useState<any[]>([])
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchTemplates()
    fetchEquipment()
    return () => stopCamera()
  }, [])

  async function fetchTemplates() {
    const { data } = await supabase
      .from('checklist_templates')
      .select('id, name, category, sector')
      .eq('is_active', true)
      .order('name')
    if (data) setTemplates(data)
  }

  async function fetchEquipment() {
    const { data } = await supabase
      .from('assets')
      .select('id, name, asset_code, location')
      .eq('is_active', true)
      .order('name')
    if (data) setEquipmentList(data)
  }

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 1200
      osc.type = 'sine'
      gain.gain.value = 0.3
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } catch (e) { }
  }

  function vibrate() {
    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100])
  }

  async function startCamera() {
    try {
      setError(null)
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          vibrate()
          playBeep()
          handleScanResult(decodedText)
          stopCamera()
        },
        () => {}
      )
      setCameraActive(true)
    } catch (err: any) {
      console.error('Camera error:', err)
      setError('Não foi possível acessar a câmera: ' + (err.message || 'Erro desconhecido'))
    }
  }

  function stopCamera() {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {})
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setCameraActive(false)
  }

  async function handleScanResult(code: string) {
    if (!code.trim()) return
    setScanning(true)
    setError(null)
    setSuccess(null)

    try {
      // Check if it's a checklist QR (format: checklist:uuid)
      if (code.includes('checklist:') || code.includes('/checklists/scan/')) {
        const templateId = code.replace('checklist:', '').replace('https://portalutilidades.com/checklists/scan/', '')
        const { data: template, error: tErr } = await supabase
          .from('checklist_templates')
          .select('id, name, category, sector')
          .eq('id', templateId.trim())
          .single()

        if (tErr || !template) {
          setError('Checklist não encontrado')
          setScanning(false)
          return
        }

        setSuccess(`Checklist: ${template.name}`)
        setTimeout(() => {
          onScan({
            equipment_id: '',
            equipment_name: template.name,
            equipment_code: template.id.substring(0, 8).toUpperCase(),
            sector: template.sector || '-',
            template_id: template.id,
            template_name: template.name,
          })
          setScanning(false)
        }, 800)
        return
      }

      // Equipment QR
      const { data: qrData, error: qrErr } = await supabase
        .from('equipment_qrcodes')
        .select('*, assets(name, asset_code, location)')
        .eq('qr_code', code.trim())
        .eq('status', 'active')
        .single()

      if (qrErr || !qrData) {
        setError('QR Code não encontrado: ' + code)
        setScanning(false)
        return
      }

      setSuccess(`Equipamento: ${qrData.assets?.name || code}`)
      setTimeout(() => {
        onScan({
          equipment_id: qrData.equipment_id,
          equipment_name: qrData.assets?.name || 'Desconhecido',
          equipment_code: qrData.assets?.asset_code || code,
          sector: qrData.sector || qrData.assets?.location || '-',
          template_id: selectedTemplate || '',
          template_name: templates.find(t => t.id === selectedTemplate)?.name || 'Checklist',
        })
        setScanning(false)
      }, 800)
    } catch (err: any) {
      setError('Erro ao processar: ' + err.message)
      setScanning(false)
    }
  }

  function handleManualStart() {
    if (!selectedTemplate) {
      setError('Selecione um checklist')
      return
    }
    vibrate()
    playBeep()
    const template = templates.find(t => t.id === selectedTemplate)
    const equipment = equipmentList.find(e => e.id === selectedEquipment)
    setSuccess(`Iniciando: ${template?.name}`)

    setTimeout(() => {
      onScan({
        equipment_id: selectedEquipment || '',
        equipment_name: equipment?.name || template?.name || 'Checklist',
        equipment_code: equipment?.asset_code || template?.id?.substring(0, 8).toUpperCase() || '',
        sector: equipment?.location || template?.sector || '-',
        template_id: selectedTemplate,
        template_name: template?.name || 'Checklist',
      })
    }, 500)
  }

  const categoryLabels: Record<string, string> = {
    daily: 'Diário',
    weekly: 'Semanal',
    monthly: 'Mensal',
    lubrication: 'Lubrificação',
    inspection: 'Inspeção',
    custom: 'Personalizado',
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert className="bg-[#DC3545]/10 border-[#DC3545]/30 text-[#DC3545]">
          <AlertDescription className="flex items-center gap-2">
            <XCircle className="h-4 w-4" /> {error}
          </AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-[#28A745]/10 border-[#28A745]/30 text-[#28A745]">
          <AlertDescription className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Camera Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <ScanLine className="h-4 w-4 text-[#00b4d8]" />
            Scanner QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div id="qr-reader" className="w-full rounded-xl overflow-hidden" />
          <div className="mt-3 flex justify-center">
            {!cameraActive ? (
              <Button type="button" onClick={startCamera} className="btn-gradient-green text-white border-0">
                <Camera className="h-4 w-4 mr-2" /> Ativar Câmera
              </Button>
            ) : (
              <Button type="button" onClick={stopCamera} variant="outline">
                <CameraOff className="h-4 w-4 mr-2" /> Fechar Câmera
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Search className="h-4 w-4 text-[#28A745]" />
            Selecionar Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Checklist *</Label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-input bg-transparent text-sm"
            >
              <option value="">Selecione o checklist...</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} — {categoryLabels[t.category] || t.category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Equipamento (opcional)</Label>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-input bg-transparent text-sm"
            >
              <option value="">Nenhum equipamento</option>
              {equipmentList.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.asset_code} — {eq.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="button"
            onClick={handleManualStart}
            disabled={!selectedTemplate}
            className="w-full btn-gradient-green text-white border-0 h-11"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Iniciar Checklist
          </Button>
        </CardContent>
      </Card>

      {/* Manual Code Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label>Ou digite o código QR</Label>
            <div className="flex gap-2">
              <Input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Cole o código do QR Code"
                onKeyDown={(e) => e.key === 'Enter' && handleScanResult(manualCode)}
              />
              <Button
                type="button"
                onClick={() => handleScanResult(manualCode)}
                disabled={!manualCode.trim()}
                className="btn-gradient-green text-white border-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
