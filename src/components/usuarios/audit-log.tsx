'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { History, Filter } from 'lucide-react'

interface AuditEntry {
  id: string
  user_id: string
  action: string
  table_name: string
  record_id: string
  old_values: any
  new_values: any
  ip_address: string
  user_agent: string
  created_at: string
  user_profiles?: { full_name: string }
}

interface AuditLogProps {
  limit?: number
}

export function AuditLog({ limit = 50 }: AuditLogProps) {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [tableFilter, setTableFilter] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    fetchLogs()
  }, [tableFilter])

  async function fetchLogs() {
    setLoading(true)
    let query = supabase
      .from('audit_logs')
      .select('*, user_profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (tableFilter !== 'all') {
      query = query.eq('table_name', tableFilter)
    }

    const { data } = await query
    if (data) {
      setLogs(data as AuditEntry[])
    }
    setLoading(false)
  }

  function formatAction(action: string) {
    const actions: Record<string, string> = {
      INSERT: 'Criou',
      UPDATE: 'Atualizou',
      DELETE: 'Excluiu',
    }
    return actions[action] || action
  }

  function formatTable(table: string) {
    const tables: Record<string, string> = {
      user_profiles: 'Usuário',
      lab_analyses: 'Análise Laboratorial',
      stock_movements: 'Movimentação de Estoque',
      service_requests: 'Solicitação de Serviço',
      assets: 'Ativo',
      products: 'Produto',
      checklists: 'Checklist',
      daily_reports: 'Relatório Diário',
    }
    return tables[table] || table
  }

  function getChangedFields(oldValues: any, newValues: any) {
    if (!oldValues || !newValues) return []
    const changes: string[] = []
    for (const key of Object.keys(newValues)) {
      if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
        changes.push(key)
      }
    }
    return changes
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Alterações
          </CardTitle>
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="h-8 px-2 rounded-lg border border-input bg-transparent text-xs"
          >
            <option value="all">Todas as tabelas</option>
            <option value="user_profiles">Usuários</option>
            <option value="lab_analyses">Laboratório</option>
            <option value="stock_movements">Estoque</option>
            <option value="service_requests">Manutenção</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-4">Carregando...</p>
        ) : logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Nenhum registro encontrado</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-[#28A745] mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">
                      {log.user_profiles?.full_name || 'Sistema'}
                    </span>{' '}
                    {formatAction(log.action)}{' '}
                    <span className="font-medium">{formatTable(log.table_name)}</span>
                  </p>
                  {log.old_values && log.new_values && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Campos alterados: {getChangedFields(log.old_values, log.new_values).join(', ')}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                    {log.ip_address && <span>IP: {log.ip_address}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
