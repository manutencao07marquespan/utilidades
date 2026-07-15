import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sectorPermissionSchema } from '@/lib/validations/usuarios'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const { data, error } = await supabase
      .from('user_sector_permissions')
      .select('*')
      .eq('user_id', id)

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { permissions } = body as { permissions: Array<{ sector: string; can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean }> }

    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { data: null, error: 'Permissões devem ser um array' },
        { status: 400 }
      )
    }

    for (const perm of permissions) {
      const parsed = sectorPermissionSchema.safeParse(perm)
      if (!parsed.success) {
        return NextResponse.json(
          { data: null, error: parsed.error.flatten().fieldErrors },
          { status: 400 }
        )
      }
    }

    await supabase
      .from('user_sector_permissions')
      .delete()
      .eq('user_id', id)

    const records = permissions.map((p) => ({
      user_id: id,
      sector: p.sector,
      can_view: p.can_view,
      can_create: p.can_create,
      can_edit: p.can_edit,
      can_delete: p.can_delete,
    }))

    const { data, error } = await supabase
      .from('user_sector_permissions')
      .insert(records)
      .select()

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
