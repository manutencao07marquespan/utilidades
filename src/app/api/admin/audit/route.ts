import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const tableFilter = searchParams.get('table') || ''
    const userFilter = searchParams.get('user_id') || ''
    const offset = (page - 1) * limit

    let query = supabase
      .from('audit_logs')
      .select('*, user_profiles(full_name, email)', { count: 'exact' })

    if (tableFilter) {
      query = query.eq('table_name', tableFilter)
    }

    if (userFilter) {
      query = query.eq('user_id', userFilter)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      data: {
        logs: data,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
      error: null,
    })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
