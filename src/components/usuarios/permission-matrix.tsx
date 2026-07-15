'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Shield } from 'lucide-react'

interface Module {
  id: string
  name: string
  display_name: string
}

interface Permission {
  id: string
  module_id: string
  action: string
}

interface RolePermission {
  role_id: string
  permission_id: string
}

interface PermissionMatrixProps {
  roleId: string
  roleName: string
  onSave?: () => void
}

const actionLabels: Record<string, string> = {
  view: 'Visualizar',
  create: 'Inserir',
  update: 'Editar',
  delete: 'Excluir',
  export: 'Exportar',
}

export function PermissionMatrix({ roleId, roleName, onSave }: PermissionMatrixProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [rolePermissions, setRolePermissions] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [roleId])

  async function fetchData() {
    const [modulesRes, permsRes, rolePermsRes] = await Promise.all([
      supabase.from('modules').select('*').order('name'),
      supabase.from('permissions').select('*'),
      supabase.from('role_permissions').select('permission_id').eq('role_id', roleId),
    ])

    if (modulesRes.data) setModules(modulesRes.data)
    if (permsRes.data) setPermissions(permsRes.data)
    if (rolePermsRes.data) {
      setRolePermissions(new Set(rolePermsRes.data.map((rp: any) => rp.permission_id)))
    }
    setLoading(false)
  }

  function togglePermission(permissionId: string) {
    setRolePermissions(prev => {
      const next = new Set(prev)
      if (next.has(permissionId)) {
        next.delete(permissionId)
      } else {
        next.add(permissionId)
      }
      return next
    })
  }

  function toggleModule(moduleId: string, action: string) {
    const perms = permissions.filter(p => p.module_id === moduleId && p.action === action)
    perms.forEach(p => togglePermission(p.id))
  }

  function isModuleActionEnabled(moduleId: string, action: string): boolean {
    const perm = permissions.find(p => p.module_id === moduleId && p.action === action)
    return perm ? rolePermissions.has(perm.id) : false
  }

  async function handleSave() {
    setSaving(true)
    try {
      // Delete existing permissions
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId)

      // Insert new permissions
      const newPerms = Array.from(rolePermissions).map(permission_id => ({
        role_id: roleId,
        permission_id,
      }))

      if (newPerms.length > 0) {
        await supabase
          .from('role_permissions')
          .insert(newPerms)
      }

      onSave?.()
    } catch (error) {
      console.error('Error saving permissions:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Carregando permissões...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Permissões - {roleName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {modules.map((module) => (
            <div key={module.id} className="border rounded-xl p-4">
              <h4 className="font-medium mb-3">{module.display_name}</h4>
              <div className="flex flex-wrap gap-3">
                {Object.entries(actionLabels).map(([action, label]) => (
                  <label
                    key={action}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isModuleActionEnabled(module.id, action)}
                      onChange={() => toggleModule(module.id, action)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="btn-gradient-green text-white border-0"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Permissões'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
