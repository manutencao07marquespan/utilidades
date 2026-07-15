'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { StatsCard } from '@/components/shared/stats-card'
import { UserTable } from '@/components/usuarios/user-table'
import { UserForm } from '@/components/usuarios/user-form'
import { AuditLog } from '@/components/usuarios/audit-log'
import { usePermissions } from '@/hooks/use-permissions'
import { Users, UserCheck, Shield, History, Plus, ArrowLeft } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function UsuariosPage() {
  const { profile, hasMinRole, loading: permsLoading } = usePermissions()
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const canManageUsers = hasMinRole('Admin')

  if (permsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-accent"></div>
      </div>
    )
  }

  if (!canManageUsers) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Controle de Usuários"
          description="Você não tem permissão para acessar este módulo."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Controle de Usuários"
        description="Gerencie perfis, cargos, permissões e setores."
        action={
          view === 'list' && canManageUsers
            ? {
                label: 'Novo Usuário',
                onClick: () => setView('create'),
                icon: Plus,
              }
            : undefined
        }
      />

      {view === 'list' && (
        <>
          {/* Stats */}
          <div className="grid gap-5 md:grid-cols-3">
            <StatsCard
              title="Usuários"
              value="—"
              subtitle="cadastrados"
              icon={Users}
              variant="default"
            />
            <StatsCard
              title="Ativos"
              value="—"
              subtitle="logados hoje"
              icon={UserCheck}
              variant="success"
            />
            <StatsCard
              title="Auditoria"
              value="—"
              subtitle="registros"
              icon={History}
              variant="default"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users">
            <TabsList>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="audit">
                <History className="h-4 w-4 mr-2" />
                Auditoria
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <UserTable
                key={refreshKey}
                onEdit={(user) => {
                  setSelectedUserId(user.id)
                  setView('edit')
                }}
                onResetPassword={async (user) => {
                  const password = prompt('Nova senha para ' + user.full_name + ':')
                  if (password) {
                    await fetch(`/api/admin/users/${user.id}/reset-password`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ password }),
                    })
                    alert('Senha redefinida com sucesso!')
                  }
                }}
                onDeactivate={async (user) => {
                  if (confirm('Deseja desativar o usuário ' + user.full_name + '?')) {
                    await fetch(`/api/admin/users/${user.id}`, {
                      method: 'DELETE',
                    })
                    setRefreshKey(k => k + 1)
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="audit">
              <AuditLog />
            </TabsContent>
          </Tabs>
        </>
      )}

      {view === 'create' && (
        <UserForm
          hideSuperAdmin={!profile?.roles?.name?.includes('SuperAdmin')}
          onSuccess={() => {
            setView('list')
            setRefreshKey(k => k + 1)
          }}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'edit' && selectedUserId && (
        <UserForm
          userId={selectedUserId}
          onSuccess={() => {
            setView('list')
            setRefreshKey(k => k + 1)
          }}
          onCancel={() => setView('list')}
        />
      )}
    </div>
  )
}
