'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Droplets, Loader2, Shield } from 'lucide-react'

export default function SetupPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    job_title: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkFirstUser()
  }, [])

  async function checkFirstUser() {
    try {
      const response = await fetch('/api/admin/setup')
      const result = await response.json()
      if (result.exists) {
        router.push('/login')
      }
    } catch (err) {
      // If check fails, allow setup attempt
    } finally {
      setChecking(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          department: formData.department,
          job_title: formData.job_title,
        }),
      })

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      router.push('/login?setup=success')
    } catch (err: any) {
      console.error('Setup error:', err)
      // Show more helpful error message
      if (err.message?.includes('User not allowed') || err.message?.includes('admin')) {
        setError('A API Admin do Supabase não está habilitada. Acesse o Dashboard do Supabase > Authentication > Settings e habilite "Enable auth admin API".')
      } else {
        setError(err.message || 'Erro ao criar Super Administrador')
      }
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2942] via-[#1A3A5A] to-[#0d4f6b]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f2942] via-[#1A3A5A] to-[#0d4f6b]" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-[#28A745] rounded-full mix-blend-overlay filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-40 w-80 h-80 bg-[#00b4d8] rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/[0.07] backdrop-blur-xl rounded-3xl shadow-2xl border border-white/[0.12] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#28A745] to-[#218838] shadow-lg shadow-[#28A745]/30 mb-5">
              <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Portal das Utilidades
            </h1>
            <p className="text-white/60 text-sm">
              Primeiro Acesso - Criação do Super Administrador
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="bg-red-500/10 border-red-500/30 text-red-300">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-white/80 text-sm font-medium">
                Nome Completo *
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                className="h-11 bg-white/[0.06] border-white/[0.12] text-white placeholder:text-white/30 focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30 rounded-xl"
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80 text-sm font-medium">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-11 bg-white/[0.06] border-white/[0.12] text-white placeholder:text-white/30 focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30 rounded-xl"
                placeholder="seu@email.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department" className="text-white/80 text-sm font-medium">
                  Empresa
                </Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="h-11 bg-white/[0.06] border-white/[0.12] text-white placeholder:text-white/30 focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30 rounded-xl"
                  placeholder="Empresa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_title" className="text-white/80 text-sm font-medium">
                  Unidade
                </Label>
                <Input
                  id="job_title"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  className="h-11 bg-white/[0.06] border-white/[0.12] text-white placeholder:text-white/30 focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30 rounded-xl"
                  placeholder="Unidade"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80 text-sm font-medium">
                Senha *
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="h-11 bg-white/[0.06] border-white/[0.12] text-white placeholder:text-white/30 focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30 rounded-xl"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/80 text-sm font-medium">
                Confirmar Senha *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="h-11 bg-white/[0.06] border-white/[0.12] text-white placeholder:text-white/30 focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30 rounded-xl"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#28A745] to-[#218838] hover:from-[#218838] hover:to-[#1a7a32] text-white font-semibold rounded-xl shadow-lg shadow-[#28A745]/25 transition-all duration-300 hover:shadow-xl hover:shadow-[#28A745]/35 hover:-translate-y-0.5 border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Super Administrador'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/[0.08]">
            <p className="text-center text-white/40 text-xs">
              Este usuário terá acesso total ao sistema
            </p>
            <p className="text-center text-white/30 text-xs mt-2">
              Pré-requisito: Habilite a API Admin em{' '}
              <span className="text-white/50">Supabase Dashboard &gt; Authentication &gt; Settings</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
