'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePermissions } from '@/hooks/use-permissions'
import { StatusIndicator } from '@/components/shared/status-indicator'
import {
  Settings, Save, Building, Bell, Shield, Database,
  CheckCircle, AlertTriangle, Droplets, Mail, Clock,
  Loader2, Gauge, Wrench, ClipboardCheck, FileText, Users,
  Cloud, Zap, Activity, Package, Timer
} from 'lucide-react'
import { cn } from '@/lib/cn'

export default function ConfiguracoesPage() {
  const { hasMinRole, loading: permsLoading } = usePermissions()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const [config, setConfig] = useState({
    // Geral
    company_name: '', unit_name: '', address: '', city: '', state: '', phone: '', email: '',
    timezone: 'America/Sao_Paulo', language: 'pt-BR', logo_url: '',

    // Operação
    alert_ph_min: '6.0', alert_ph_max: '9.0', alert_turbidity_max: '20',
    alert_cistern_min: '20', efficiency_min: '90',

    // Horímetros
    alert_horimeter_min_interval: '6', alert_horimeter_max_interval: '48',
    alert_horimeter_warning_hours: '200', alert_horimeter_critical_hours: '250',

    // Hidrômetros
    alert_hydrant_min_interval: '6', alert_hydrant_max_interval: '24',
    alert_hydrant_deviation_percent: '20', alert_hydrant_critical_level: '50',

    // Alarmes
    enable_whatsapp: false, whatsapp_number: '',
    enable_email: false, email_recipients: '',
    enable_push: true,

    // Turnos
    shift_1a_start: '06:00', shift_1a_end: '18:00',
    shift_1b_start: '18:00', shift_1b_end: '06:00',

    // APIs
    openweather_api_key: '', google_maps_key: '',

    // Manutenção
    auto_generate_os: true,
    os_trigger_nc: true,
    os_trigger_preventive: true,
    os_trigger_horimeter: true,

    // Checklists
    checklist_require_gps: false,
    checklist_require_photo: false,
    checklist_require_signature: true,
  })

  useEffect(() => { fetchConfig() }, [])

  async function fetchConfig() {
    setLoading(true)
    try {
      const { data } = await supabase.from('system_config').select('*')
      if (data) {
        const configMap: any = {}
        data.forEach((item: any) => { configMap[item.key] = item.value })
        setConfig(prev => ({ ...prev, ...configMap }))
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  async function saveConfig() {
    setSaving(true); setError(null); setSuccess(null)
    try {
      for (const [key, value] of Object.entries(config)) {
        await supabase.from('system_config').upsert(
          { key, value: typeof value === 'boolean' ? value.toString() : value },
          { onConflict: 'key' }
        )
      }
      setSuccess('Configurações salvas com sucesso!')
    } catch (err: any) { setError(err.message) }
    finally { setSaving(false) }
  }

  if (permsLoading || loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  if (!hasMinRole('Admin')) {
    return (
      <div className="space-y-6">
        <PageHeader title="Configurações" description="Acesso restrito a administradores" />
        <Alert className="bg-[#DC3545]/10 border-[#DC3545]/30 text-[#DC3545]">
          <AlertDescription>Apenas administradores podem acessar as configurações.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Centro de Configurações" description="Parametrização completa do sistema"
        action={{ label: 'Salvar', onClick: saveConfig, icon: Save }} />

      {success && <Alert className="bg-[#28A745]/10 border-[#28A745]/30 text-[#28A745]"><CheckCircle className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}
      {error && <Alert className="bg-[#DC3545]/10 border-[#DC3545]/30 text-[#DC3545]"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="geral"><Building className="h-4 w-4 mr-1" />Geral</TabsTrigger>
          <TabsTrigger value="operacao"><Gauge className="h-4 w-4 mr-1" />Operação</TabsTrigger>
          <TabsTrigger value="turnos"><Clock className="h-4 w-4 mr-1" />Turnos</TabsTrigger>
          <TabsTrigger value="alarmes"><Bell className="h-4 w-4 mr-1" />Alarmes</TabsTrigger>
          <TabsTrigger value="manutencao"><Wrench className="h-4 w-4 mr-1" />Manutenção</TabsTrigger>
          <TabsTrigger value="checklists"><ClipboardCheck className="h-4 w-4 mr-1" />Checklists</TabsTrigger>
          <TabsTrigger value="apis"><Cloud className="h-4 w-4 mr-1" />APIs</TabsTrigger>
          <TabsTrigger value="seguranca"><Shield className="h-4 w-4 mr-1" />Segurança</TabsTrigger>
        </TabsList>

        {/* Geral */}
        <TabsContent value="geral">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" />Dados da Empresa</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nome da Empresa</Label><Input value={config.company_name} onChange={e => setConfig({...config, company_name: e.target.value})} placeholder="Ex: Marquespan" /></div>
                <div className="space-y-2"><Label>Nome da Unidade</Label><Input value={config.unit_name} onChange={e => setConfig({...config, unit_name: e.target.value})} placeholder="Ex: ETE Principal" /></div>
                <div className="space-y-2"><Label>Endereço</Label><Input value={config.address} onChange={e => setConfig({...config, address: e.target.value})} /></div>
                <div className="space-y-2"><Label>Cidade</Label><Input value={config.city} onChange={e => setConfig({...config, city: e.target.value})} /></div>
                <div className="space-y-2"><Label>Estado</Label><Input value={config.state} onChange={e => setConfig({...config, state: e.target.value})} /></div>
                <div className="space-y-2"><Label>Telefone</Label><Input value={config.phone} onChange={e => setConfig({...config, phone: e.target.value})} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={config.email} onChange={e => setConfig({...config, email: e.target.value})} /></div>
                <div className="space-y-2"><Label>Timezone</Label>
                  <select value={config.timezone} onChange={e => setConfig({...config, timezone: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm">
                    <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                    <option value="America/Manaus">Manaus (GMT-4)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operação */}
        <TabsContent value="operacao">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5" />Limites Operacionais</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>pH Mínimo</Label><Input type="number" step="0.1" value={config.alert_ph_min} onChange={e => setConfig({...config, alert_ph_min: e.target.value})} /></div>
                  <div className="space-y-2"><Label>pH Máximo</Label><Input type="number" step="0.1" value={config.alert_ph_max} onChange={e => setConfig({...config, alert_ph_max: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Turbidez Máxima (NTU)</Label><Input type="number" value={config.alert_turbidity_max} onChange={e => setConfig({...config, alert_turbidity_max: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Nível Mín. Cisterna (%)</Label><Input type="number" value={config.alert_cistern_min} onChange={e => setConfig({...config, alert_cistern_min: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Eficiência Mínima (%)</Label><Input type="number" value={config.efficiency_min} onChange={e => setConfig({...config, efficiency_min: e.target.value})} /></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#FFC107]">
              <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Timer className="h-4 w-4 text-[#FFC107]" />Horímetros</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Intervalo Mín. (horas)</Label><Input type="number" value={config.alert_horimeter_min_interval} onChange={e => setConfig({...config, alert_horimeter_min_interval: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Intervalo Máx. (horas)</Label><Input type="number" value={config.alert_horimeter_max_interval} onChange={e => setConfig({...config, alert_horimeter_max_interval: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Aviso (horas)</Label><Input type="number" value={config.alert_horimeter_warning_hours} onChange={e => setConfig({...config, alert_horimeter_warning_hours: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Crítico (horas)</Label><Input type="number" value={config.alert_horimeter_critical_hours} onChange={e => setConfig({...config, alert_horimeter_critical_hours: e.target.value})} /></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#00b4d8]">
              <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Droplets className="h-4 w-4 text-[#00b4d8]" />Hidrômetros</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Intervalo Mín. (horas)</Label><Input type="number" value={config.alert_hydrant_min_interval} onChange={e => setConfig({...config, alert_hydrant_min_interval: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Intervalo Máx. (horas)</Label><Input type="number" value={config.alert_hydrant_max_interval} onChange={e => setConfig({...config, alert_hydrant_max_interval: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Desvio Máx. (%)</Label><Input type="number" value={config.alert_hydrant_deviation_percent} onChange={e => setConfig({...config, alert_hydrant_deviation_percent: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Nível Crítico (m³)</Label><Input type="number" value={config.alert_hydrant_critical_level} onChange={e => setConfig({...config, alert_hydrant_critical_level: e.target.value})} /></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Turnos */}
        <TabsContent value="turnos">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Configuração de Turnos</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl border bg-muted/30">
                  <h4 className="font-medium mb-3 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#28A745]"></span>Turno 1A</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Início</Label><Input type="time" value={config.shift_1a_start} onChange={e => setConfig({...config, shift_1a_start: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Fim</Label><Input type="time" value={config.shift_1a_end} onChange={e => setConfig({...config, shift_1a_end: e.target.value})} /></div>
                  </div>
                </div>
                <div className="p-4 rounded-xl border bg-muted/30">
                  <h4 className="font-medium mb-3 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#00b4d8]"></span>Turno 1B</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Início</Label><Input type="time" value={config.shift_1b_start} onChange={e => setConfig({...config, shift_1b_start: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Fim</Label><Input type="time" value={config.shift_1b_end} onChange={e => setConfig({...config, shift_1b_end: e.target.value})} /></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alarmes */}
        <TabsContent value="alarmes">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Notificações</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={config.enable_whatsapp} onChange={e => setConfig({...config, enable_whatsapp: e.target.checked})} className="rounded" /><span className="text-sm">WhatsApp</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={config.enable_email} onChange={e => setConfig({...config, enable_email: e.target.checked})} className="rounded" /><span className="text-sm">Email</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={config.enable_push} onChange={e => setConfig({...config, enable_push: e.target.checked})} className="rounded" /><span className="text-sm">Push</span></label>
              </div>
              {config.enable_whatsapp && <div className="space-y-2"><Label>Nº WhatsApp</Label><Input value={config.whatsapp_number} onChange={e => setConfig({...config, whatsapp_number: e.target.value})} placeholder="+5511999999999" className="max-w-xs" /></div>}
              {config.enable_email && <div className="space-y-2"><Label>Destinatários</Label><Input value={config.email_recipients} onChange={e => setConfig({...config, email_recipients: e.target.value})} placeholder="email1@email.com, email2@email.com" /></div>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manutenção */}
        <TabsContent value="manutencao">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" />Regras de Manutenção</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <h4 className="text-sm font-medium">Geração Automática de OS</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-2"><input type="checkbox" checked={config.os_trigger_nc} onChange={e => setConfig({...config, os_trigger_nc: e.target.checked})} className="rounded" /><span className="text-sm">Não conformidade crítica gera OS</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={config.os_trigger_preventive} onChange={e => setConfig({...config, os_trigger_preventive: e.target.checked})} className="rounded" /><span className="text-sm">Preventiva vencida gera OS</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={config.os_trigger_horimeter} onChange={e => setConfig({...config, os_trigger_horimeter: e.target.checked})} className="rounded" /><span className="text-sm">Horímetro no limite gera preventiva</span></label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checklists */}
        <TabsContent value="checklists">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5" />Configuração de Checklists</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-2"><input type="checkbox" checked={config.checklist_require_gps} onChange={e => setConfig({...config, checklist_require_gps: e.target.checked})} className="rounded" /><span className="text-sm">GPS obrigatório</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={config.checklist_require_photo} onChange={e => setConfig({...config, checklist_require_photo: e.target.checked})} className="rounded" /><span className="text-sm">Foto obrigatória</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={config.checklist_require_signature} onChange={e => setConfig({...config, checklist_require_signature: e.target.checked})} className="rounded" /><span className="text-sm">Assinatura obrigatória</span></label>
            </CardContent>
          </Card>
        </TabsContent>

        {/* APIs */}
        <TabsContent value="apis">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Cloud className="h-5 w-5" />Integrações</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">OpenWeather</span>
                  <StatusIndicator variant={config.openweather_api_key ? 'ok' : 'inactive'} label={config.openweather_api_key ? 'Configurado' : 'Não configurado'} />
                </div>
                <Input type="password" value={config.openweather_api_key} onChange={e => setConfig({...config, openweather_api_key: e.target.value})} placeholder="Chave da API" />
              </div>
              <div className="p-4 rounded-xl border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Google Maps</span>
                  <StatusIndicator variant={config.google_maps_key ? 'ok' : 'inactive'} label={config.google_maps_key ? 'Configurado' : 'Não configurado'} />
                </div>
                <Input type="password" value={config.google_maps_key} onChange={e => setConfig({...config, google_maps_key: e.target.value})} placeholder="Chave da API" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="seguranca">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Segurança</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Timeout Sessão (min)</Label><Input type="number" defaultValue="30" /></div>
                <div className="space-y-2"><Label>Máx. Tentativas Login</Label><Input type="number" defaultValue="5" /></div>
                <div className="space-y-2"><Label>Mín. Senha (chars)</Label><Input type="number" defaultValue="6" /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
