'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { usePermissions } from '@/hooks/use-permissions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Cloud, Mail, MessageSquare, Bell, CheckCircle, XCircle,
  Loader2, Save, Wifi, WifiOff, Zap, AlertTriangle
} from 'lucide-react'

export default function IntegracoesPage() {
  const { hasMinRole, loading: permsLoading } = usePermissions()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const [config, setConfig] = useState({
    // OpenWeather
    openweather_enabled: true,
    openweather_api_key: '',
    openweather_location: 'Tatuí, BR',

    // WhatsApp
    whatsapp_enabled: false,
    whatsapp_api_url: '',
    whatsapp_api_key: '',
    whatsapp_number: '',

    // Email
    email_enabled: false,
    email_smtp_host: '',
    email_smtp_port: '587',
    email_smtp_user: '',
    email_smtp_pass: '',
    email_from: '',

    // Push Notifications
    push_enabled: true,

    // Webhooks
    webhook_enabled: false,
    webhook_url: '',
  })

  const [integrations, setIntegrations] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchConfig()
    checkIntegrationStatus()
  }, [])

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

  async function checkIntegrationStatus() {
    // Check OpenWeather API
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=-23.55&lon=-46.63&appid=${config.openweather_api_key}&units=metric`)
      setIntegrations(prev => ({ ...prev, openweather: res.ok }))
    } catch {
      setIntegrations(prev => ({ ...prev, openweather: false }))
    }

    // Other integrations would be checked similarly
    setIntegrations(prev => ({
      ...prev,
      whatsapp: config.whatsapp_enabled && !!config.whatsapp_api_url,
      email: config.email_enabled && !!config.email_smtp_host,
      push: config.push_enabled,
      webhook: config.webhook_enabled && !!config.webhook_url,
    }))
  }

  async function saveConfig() {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      for (const [key, value] of Object.entries(config)) {
        await supabase.from('system_config').upsert(
          { key, value: typeof value === 'boolean' ? value.toString() : value },
          { onConflict: 'key' }
        )
      }
      setSuccess('Integrações salvas com sucesso!')
      checkIntegrationStatus()
    } catch (err: any) { setError(err.message) }
    finally { setSaving(false) }
  }

  if (permsLoading || loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  if (!hasMinRole('Admin')) {
    return (
      <div className="space-y-6">
        <PageHeader title="Integrações" description="Acesso restrito a administradores" />
        <Alert className="bg-[#DC3545]/10 border-[#DC3545]/30 text-[#DC3545]">
          <AlertDescription>Apenas administradores podem acessar as integrações.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrações"
        description="Configuração de serviços externos"
        action={{ label: 'Salvar', onClick: saveConfig, icon: Save }}
      />

      {success && <Alert className="bg-[#28A745]/10 border-[#28A745]/30 text-[#28A745]"><CheckCircle className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}
      {error && <Alert className="bg-[#DC3545]/10 border-[#DC3545]/30 text-[#DC3545]"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="grid gap-5 md:grid-cols-2">
        {/* OpenWeather */}
        <Card className="border-l-4 border-l-[#00b4d8]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Cloud className="h-5 w-5 text-[#00b4d8]" />
                OpenWeather
              </CardTitle>
              <StatusIndicator
                variant={integrations.openweather ? 'ok' : 'critical'}
                label={integrations.openweather ? 'ONLINE' : 'OFFLINE'}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={config.openweather_enabled}
                onChange={e => setConfig({...config, openweather_enabled: e.target.checked})}
                className="rounded" />
              <span className="text-sm">Habilitado</span>
            </label>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" value={config.openweather_api_key}
                onChange={e => setConfig({...config, openweather_api_key: e.target.value})}
                placeholder="Sua chave da API" />
            </div>
            <div className="space-y-2">
              <Label>Localização</Label>
              <Input value={config.openweather_location}
                onChange={e => setConfig({...config, openweather_location: e.target.value})}
                placeholder="Ex: Tatuí, BR" />
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp */}
        <Card className="border-l-4 border-l-[#25D366]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-5 w-5 text-[#25D366]" />
                WhatsApp
              </CardTitle>
              <StatusIndicator
                variant={integrations.whatsapp ? 'ok' : 'inactive'}
                label={integrations.whatsapp ? 'CONECTADO' : 'DESCONECTADO'}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={config.whatsapp_enabled}
                onChange={e => setConfig({...config, whatsapp_enabled: e.target.checked})}
                className="rounded" />
              <span className="text-sm">Habilitado</span>
            </label>
            <div className="space-y-2">
              <Label>API URL (Evolution API)</Label>
              <Input value={config.whatsapp_api_url}
                onChange={e => setConfig({...config, whatsapp_api_url: e.target.value})}
                placeholder="https://api.evolution.com" />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" value={config.whatsapp_api_key}
                onChange={e => setConfig({...config, whatsapp_api_key: e.target.value})}
                placeholder="Sua chave da API" />
            </div>
            <div className="space-y-2">
              <Label>Número WhatsApp</Label>
              <Input value={config.whatsapp_number}
                onChange={e => setConfig({...config, whatsapp_number: e.target.value})}
                placeholder="+5511999999999" />
            </div>
          </CardContent>
        </Card>

        {/* Email */}
        <Card className="border-l-4 border-l-[#EA4335]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Mail className="h-5 w-5 text-[#EA4335]" />
                Email (SMTP)
              </CardTitle>
              <StatusIndicator
                variant={integrations.email ? 'ok' : 'inactive'}
                label={integrations.email ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={config.email_enabled}
                onChange={e => setConfig({...config, email_enabled: e.target.checked})}
                className="rounded" />
              <span className="text-sm">Habilitado</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>SMTP Host</Label>
                <Input value={config.email_smtp_host}
                  onChange={e => setConfig({...config, email_smtp_host: e.target.value})}
                  placeholder="smtp.gmail.com" />
              </div>
              <div className="space-y-2">
                <Label>Porta</Label>
                <Input value={config.email_smtp_port}
                  onChange={e => setConfig({...config, email_smtp_port: e.target.value})}
                  placeholder="587" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Usuário</Label>
              <Input value={config.email_smtp_user}
                onChange={e => setConfig({...config, email_smtp_user: e.target.value})}
                placeholder="seu@email.com" />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input type="password" value={config.email_smtp_pass}
                onChange={e => setConfig({...config, email_smtp_pass: e.target.value})}
                placeholder="Sua senha" />
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card className="border-l-4 border-l-[#FFC107]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bell className="h-5 w-5 text-[#FFC107]" />
                Notificações Push
              </CardTitle>
              <StatusIndicator
                variant={integrations.push ? 'ok' : 'inactive'}
                label={integrations.push ? 'ATIVO' : 'INATIVO'}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={config.push_enabled}
                onChange={e => setConfig({...config, push_enabled: e.target.checked})}
                className="rounded" />
              <span className="text-sm">Habilitado</span>
            </label>
            <p className="text-xs text-muted-foreground">
              Notificações push para o navegador quando houver alertas ou novas OS.
            </p>
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card className="border-l-4 border-l-[#6C757D] md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Zap className="h-5 w-5 text-[#6C757D]" />
                Webhooks
              </CardTitle>
              <StatusIndicator
                variant={integrations.webhook ? 'ok' : 'inactive'}
                label={integrations.webhook ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={config.webhook_enabled}
                onChange={e => setConfig({...config, webhook_enabled: e.target.checked})}
                className="rounded" />
              <span className="text-sm">Habilitado</span>
            </label>
            <div className="space-y-2">
              <Label>URL do Webhook</Label>
              <Input value={config.webhook_url}
                onChange={e => setConfig({...config, webhook_url: e.target.value})}
                placeholder="https://seu-sistema.com/webhook" />
            </div>
            <p className="text-xs text-muted-foreground">
              Envia dados quando houver alertas, novas OS ou checklist concluído.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
