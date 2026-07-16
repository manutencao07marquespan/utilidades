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
import {
  Settings, Save, Building, MapPin, Bell, Shield,
  Database, RefreshCw, CheckCircle, AlertTriangle,
  Droplets, Mail, Globe, Clock, Loader2, Gauge
} from 'lucide-react'

interface SystemConfig {
  id: string
  key: string
  value: any
}

export default function ConfiguracoesPage() {
  const { hasMinRole, loading: permsLoading } = usePermissions()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const [config, setConfig] = useState({
    // Dados da ETE
    company_name: '',
    unit_name: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',

    // Configurações de Alertas
    alert_ph_min: '6.0',
    alert_ph_max: '9.0',
    alert_turbidity_max: '20',
    alert_cistern_min: '20',
    enable_whatsapp: false,
    whatsapp_number: '',

    // Configurações de Alertas - Horímetros
    alert_horimeter_min_interval: '6',
    alert_horimeter_max_interval: '48',
    alert_horimeter_warning_hours: '200',
    alert_horimeter_critical_hours: '250',

    // Configurações de Alertas - Hidrômetros
    alert_hydrant_min_interval: '6',
    alert_hydrant_max_interval: '24',
    alert_hydrant_deviation_percent: '20',
    alert_hydrant_critical_level: '50',

    // Configurações de Relatórios
    report_auto_generate: false,
    report_time: '07:00',
    report_recipients: '',

    // Configurações do Sistema
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    date_format: 'DD/MM/YYYY',
    items_per_page: '20',

    // Configurações de Segurança
    session_timeout: '30',
    max_login_attempts: '5',
    password_min_length: '6',

    // Configurações de Estoque
    stock_alert_enabled: true,
    stock_alert_days: '7',
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  async function fetchConfig() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('system_config')
        .select('*')

      if (data) {
        const configMap: any = {}
        data.forEach((item: any) => {
          configMap[item.key] = item.value
        })
        setConfig(prev => ({ ...prev, ...configMap }))
      }
    } catch (err) {
      console.error('Error fetching config:', err)
    }
    setLoading(false)
  }

  async function saveConfig() {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const updates = Object.entries(config).map(([key, value]) => ({
        key,
        value: typeof value === 'boolean' ? value.toString() : value,
      }))

      for (const update of updates) {
        const { error: upsertError } = await supabase
          .from('system_config')
          .upsert({ key: update.key, value: update.value }, { onConflict: 'key' })

        if (upsertError) throw upsertError
      }

      setSuccess('Configurações salvas com sucesso!')
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  if (permsLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!hasMinRole('Admin')) {
    return (
      <div className="space-y-6">
        <PageHeader title="Configurações" description="Acesso restrito a administradores" />
        <Alert className="bg-[#DC3545]/10 border-[#DC3545]/30 text-[#DC3545]">
          <AlertDescription>Apenas administradores podem acessar as configurações do sistema.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações do Sistema"
        description="Gerencie as configurações gerais do Portal de Utilidades"
        action={{
          label: 'Salvar',
          onClick: saveConfig,
          icon: Save,
        }}
      />

      {success && (
        <Alert className="bg-[#28A745]/10 border-[#28A745]/30 text-[#28A745]">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-[#DC3545]/10 border-[#DC3545]/30 text-[#DC3545]">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="company">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="company">
            <Building className="h-4 w-4 mr-2" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell className="h-4 w-4 mr-2" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="reports">
            <Database className="h-4 w-4 mr-2" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="system">
            <Settings className="h-4 w-4 mr-2" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* Empresa */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Dados da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Empresa</Label>
                  <Input
                    value={config.company_name}
                    onChange={(e) => setConfig({ ...config, company_name: e.target.value })}
                    placeholder="Ex: Marquespan"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nome da Unidade</Label>
                  <Input
                    value={config.unit_name}
                    onChange={(e) => setConfig({ ...config, unit_name: e.target.value })}
                    placeholder="Ex: ETE Principal"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input
                    value={config.address}
                    onChange={(e) => setConfig({ ...config, address: e.target.value })}
                    placeholder="Rua, número, bairro"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    value={config.city}
                    onChange={(e) => setConfig({ ...config, city: e.target.value })}
                    placeholder="Ex: São Paulo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input
                    value={config.state}
                    onChange={(e) => setConfig({ ...config, state: e.target.value })}
                    placeholder="Ex: SP"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={config.phone}
                    onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={config.email}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    placeholder="contato@empresa.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alertas */}
        <TabsContent value="alerts">
          <div className="space-y-6">
            {/* Alertas Gerais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alertas Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>pH Mínimo</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={config.alert_ph_min}
                      onChange={(e) => setConfig({ ...config, alert_ph_min: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Alerta abaixo</p>
                  </div>
                  <div className="space-y-2">
                    <Label>pH Máximo</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={config.alert_ph_max}
                      onChange={(e) => setConfig({ ...config, alert_ph_max: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Alerta acima</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Turbidez Máxima (NTU)</Label>
                    <Input
                      type="number"
                      value={config.alert_turbidity_max}
                      onChange={(e) => setConfig({ ...config, alert_turbidity_max: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nível Mín. Cisterna (%)</Label>
                    <Input
                      type="number"
                      value={config.alert_cistern_min}
                      onChange={(e) => setConfig({ ...config, alert_cistern_min: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alertas de Horímetro */}
            <Card className="border-l-4 border-l-[#FFC107]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-[#FFC107]" />
                  Parâmetros de Alerta - Horímetros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Intervalo Mínimo entre Leituras (horas)</Label>
                    <Input
                      type="number"
                      value={config.alert_horimeter_min_interval}
                      onChange={(e) => setConfig({ ...config, alert_horimeter_min_interval: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Alerta se leitura inferior a este intervalo</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Intervalo Máximo entre Leituras (horas)</Label>
                    <Input
                      type="number"
                      value={config.alert_horimeter_max_interval}
                      onChange={(e) => setConfig({ ...config, alert_horimeter_max_interval: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Alerta se leitura superior a este intervalo</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Horas para Aviso (warning)</Label>
                    <Input
                      type="number"
                      value={config.alert_horimeter_warning_hours}
                      onChange={(e) => setConfig({ ...config, alert_horimeter_warning_hours: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Próxima manutenção preventiva</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Horas para Alerta Crítico</Label>
                    <Input
                      type="number"
                      value={config.alert_horimeter_critical_hours}
                      onChange={(e) => setConfig({ ...config, alert_horimeter_critical_hours: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Manutenção urgentemente necessária</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alertas de Hidrômetro */}
            <Card className="border-l-4 border-l-[#00b4d8]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Gauge className="h-4 w-4 text-[#00b4d8]" />
                  Parâmetros de Alerta - Hidrômetros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Intervalo Mínimo entre Leituras (horas)</Label>
                    <Input
                      type="number"
                      value={config.alert_hydrant_min_interval}
                      onChange={(e) => setConfig({ ...config, alert_hydrant_min_interval: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Alerta se leitura inferior</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Intervalo Máximo entre Leituras (horas)</Label>
                    <Input
                      type="number"
                      value={config.alert_hydrant_max_interval}
                      onChange={(e) => setConfig({ ...config, alert_hydrant_max_interval: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Alerta se leitura superior</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Desvio Máximo Permitido (%)</Label>
                    <Input
                      type="number"
                      value={config.alert_hydrant_deviation_percent}
                      onChange={(e) => setConfig({ ...config, alert_hydrant_deviation_percent: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Alerta se desvio da média</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Nível Crítico (m³)</Label>
                    <Input
                      type="number"
                      value={config.alert_hydrant_critical_level}
                      onChange={(e) => setConfig({ ...config, alert_hydrant_critical_level: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Alerta quando atingir</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  Notificações WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.enable_whatsapp}
                      onChange={(e) => setConfig({ ...config, enable_whatsapp: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Habilitar notificações WhatsApp</span>
                  </label>
                </div>
                {config.enable_whatsapp && (
                  <div className="space-y-2">
                    <Label>Número WhatsApp</Label>
                    <Input
                      value={config.whatsapp_number}
                      onChange={(e) => setConfig({ ...config, whatsapp_number: e.target.value })}
                      placeholder="+5511999999999"
                      className="max-w-xs"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Relatórios */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configurações de Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.report_auto_generate}
                    onChange={(e) => setConfig({ ...config, report_auto_generate: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Gerar relatórios automaticamente</span>
                </label>
              </div>

              {config.report_auto_generate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label>Horário de Geração</Label>
                    <Input
                      type="time"
                      value={config.report_time}
                      onChange={(e) => setConfig({ ...config, report_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Destinatários (email)</Label>
                    <Input
                      value={config.report_recipients}
                      onChange={(e) => setConfig({ ...config, report_recipients: e.target.value })}
                      placeholder="email1@email.com, email2@email.com"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sistema */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <select
                    value={config.timezone}
                    onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
                  >
                    <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                    <option value="America/Manaus">Manaus (GMT-4)</option>
                    <option value="America/Belem">Belém (GMT-3)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <select
                    value={config.language}
                    onChange={(e) => setConfig({ ...config, language: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Formato de Data</Label>
                  <select
                    value={config.date_format}
                    onChange={(e) => setConfig({ ...config, date_format: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
                  >
                    <option value="DD/MM/YYYY">DD/MM/AAAA</option>
                    <option value="MM/DD/YYYY">MM/DD/AAAA</option>
                    <option value="YYYY-MM-DD">AAAA-MM-DD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Itens por Página</Label>
                  <select
                    value={config.items_per_page}
                    onChange={(e) => setConfig({ ...config, items_per_page: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Timeout de Sessão (minutos)</Label>
                  <Input
                    type="number"
                    value={config.session_timeout}
                    onChange={(e) => setConfig({ ...config, session_timeout: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Tempo máximo inatividade</p>
                </div>
                <div className="space-y-2">
                  <Label>Máximo de Tentativas de Login</Label>
                  <Input
                    type="number"
                    value={config.max_login_attempts}
                    onChange={(e) => setConfig({ ...config, max_login_attempts: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Após bloquear conta</p>
                </div>
                <div className="space-y-2">
                  <Label>Comprimento Mínimo da Senha</Label>
                  <Input
                    type="number"
                    value={config.password_min_length}
                    onChange={(e) => setConfig({ ...config, password_min_length: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Mínimo de caracteres</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Estoque</h4>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.stock_alert_enabled}
                      onChange={(e) => setConfig({ ...config, stock_alert_enabled: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Alertas de estoque baixo</span>
                  </label>
                </div>
                {config.stock_alert_enabled && (
                  <div className="mt-3">
                    <Label>Dias para alerta de validade</Label>
                    <Input
                      type="number"
                      value={config.stock_alert_days}
                      onChange={(e) => setConfig({ ...config, stock_alert_days: e.target.value })}
                      className="max-w-xs"
                    />
                    <p className="text-xs text-muted-foreground">Alertar produtos que vencem em X dias</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
