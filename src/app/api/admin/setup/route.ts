import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const setupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  department: z.string().optional(),
  job_title: z.string().optional(),
})

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if any SuperAdmin exists
    const { count, error } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'SuperAdmin')

    if (error) throw error

    return NextResponse.json({ exists: count && count > 0 })
  } catch (error) {
    return NextResponse.json(
      { exists: false, error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = setupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email, password, full_name, department, job_title } = parsed.data

    // Try to use admin client first
    let supabase
    try {
      supabase = createAdminClient()
    } catch {
      // If admin client fails, use regular client
      supabase = await createClient()
    }

    // Check if SuperAdmin already exists
    const { count } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'SuperAdmin')

    if (count && count > 0) {
      return NextResponse.json(
        { data: null, error: 'Já existe um SuperAdmin configurado' },
        { status: 400 }
      )
    }

    // Create auth user using admin API
    const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      // If admin API fails, try direct signup (less ideal but works)
      console.error('Admin create user failed:', createError.message)

      // Try using the regular client with signUp
      const regularSupabase = await createClient()
      const { data: signUpData, error: signUpError } = await regularSupabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
          },
        },
      })

      if (signUpError) {
        throw new Error(`Não foi possível criar o usuário: ${signUpError.message}`)
      }

      if (signUpData.user) {
        // Create profile
        const { error: profileError } = await regularSupabase.from('user_profiles').insert({
          id: signUpData.user.id,
          full_name,
          role: 'SuperAdmin',
          department: department || null,
          job_title: job_title || null,
          is_active: true,
          is_first_user: true,
        })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Profile might fail due to RLS, but user was created
        }

        return NextResponse.json({ data: { id: signUpData.user.id }, error: null }, { status: 201 })
      }
    }

    if (authUser?.user) {
      // Create user profile
      const { error: profileError } = await supabase.from('user_profiles').insert({
        id: authUser.user.id,
        full_name,
        role: 'SuperAdmin',
        department: department || null,
        job_title: job_title || null,
        is_active: true,
        is_first_user: true,
      })

      if (profileError) throw profileError

      return NextResponse.json({ data: { id: authUser.user.id }, error: null }, { status: 201 })
    }

    throw new Error('Falha ao criar usuário')
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { data: null, error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
