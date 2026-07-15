'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { Search, MoreHorizontal, UserCog, Trash2, KeyRound, Edit } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

interface User {
  id: string
  full_name: string
  email: string
  role: string
  department: string | null
  job_title: string | null
  is_active: boolean
  last_login_at: string | null
  created_at: string
  roles?: { name: string; level: number }
}

interface UserTableProps {
  onEdit?: (user: User) => void
  onResetPassword?: (user: User) => void
  onDeactivate?: (user: User) => void
}

export function UserTable({ onEdit, onResetPassword, onDeactivate }: UserTableProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter])

  async function fetchUsers() {
    setLoading(true)
    let query = supabase
      .from('user_profiles')
      .select('*, roles(name, level)')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (roleFilter !== 'all') {
      query = query.eq('role', roleFilter)
    }

    const { data, error } = await query

    if (data) {
      setUsers(data as User[])
    }
    setLoading(false)
  }

  function getRoleBadgeVariant(role: string) {
    switch (role) {
      case 'SuperAdmin': return 'critical'
      case 'Admin': return 'warning'
      default: return 'ok'
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return 'Nunca'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `${diffDays} dias atrás`
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-11 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
        >
          <option value="all">Todos os perfis</option>
          <option value="SuperAdmin">SuperAdmin</option>
          <option value="Admin">Admin</option>
          <option value="Usuario">Usuário</option>
        </select>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Nome</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground hidden md:table-cell">Email</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Perfil</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">Cargo</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">Setor</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground hidden xl:table-cell">Último acesso</th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#28A745] to-[#218838] flex items-center justify-center text-white text-xs font-bold">
                        {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span className="font-medium text-sm">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">{user.email}</td>
                  <td className="p-3">
                    <StatusIndicator
                      variant={getRoleBadgeVariant(user.role)}
                      label={user.roles?.name || user.role}
                    />
                  </td>
                  <td className="p-3 text-sm text-muted-foreground hidden lg:table-cell">{user.job_title || '-'}</td>
                  <td className="p-3 text-sm text-muted-foreground hidden lg:table-cell">{user.department || '-'}</td>
                  <td className="p-3">
                    <StatusIndicator
                      variant={user.is_active ? 'ok' : 'inactive'}
                      label={user.is_active ? 'Ativo' : 'Inativo'}
                    />
                  </td>
                  <td className="p-3 text-sm text-muted-foreground hidden xl:table-cell">
                    {formatDate(user.last_login_at)}
                  </td>
                  <td className="p-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onResetPassword?.(user)}>
                          <KeyRound className="h-4 w-4 mr-2" />
                          Resetar Senha
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeactivate?.(user)}
                          className="text-[#DC3545]"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Desativar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
