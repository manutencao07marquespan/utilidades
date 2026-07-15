'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  full_name: string
  email: string
  role: string
  role_id: string
  department: string | null
  job_title: string | null
  is_active: boolean
  roles?: {
    name: string
    level: number
  }
}

interface Permission {
  module: string
  action: string
}

export function usePermissions() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*, roles(name, level)')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData as UserProfile)

        // Fetch user's permissions via role
        if (profileData.role_id) {
          const { data: perms } = await supabase
            .from('role_permissions')
            .select('permissions!inner(action, modules!inner(name))')
            .eq('role_id', profileData.role_id)

          if (perms) {
            const mapped = perms.map((p: any) => ({
              module: p.permissions.modules.name,
              action: p.permissions.action,
            }))
            setPermissions(mapped)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  function hasPermission(module: string, action: string): boolean {
    if (!profile) return false
    // SuperAdmin has all permissions
    if (profile.roles?.level === 100) return true
    return permissions.some(p => p.module === module && p.action === action)
  }

  function hasRole(roleName: string): boolean {
    return profile?.roles?.name === roleName
  }

  function hasMinRole(minRoleName: string): boolean {
    if (!profile?.roles) return false
    const levels: Record<string, number> = {
      'SuperAdmin': 100,
      'Admin': 50,
      'Usuario': 10,
    }
    const userLevel = profile.roles.level
    const minLevel = levels[minRoleName] || 0
    return userLevel >= minLevel
  }

  function canAccessModule(module: string): boolean {
    return hasPermission(module, 'view')
  }

  return {
    profile,
    permissions,
    loading,
    hasPermission,
    hasRole,
    hasMinRole,
    canAccessModule,
    refresh: fetchProfile,
  }
}
