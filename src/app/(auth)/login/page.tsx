'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Droplets, Mail, Lock, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f2942] via-[#1A3A5A] to-[#0d4f6b]" />

      {/* Animated pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-[#28A745] rounded-full mix-blend-overlay filter blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-[#00b4d8] rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-[#28A745] rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/[0.07] backdrop-blur-xl rounded-3xl shadow-2xl border border-white/[0.12] p-8">
          {/* Logo and header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#28A745] to-[#218838] shadow-lg shadow-[#28A745]/30 mb-5">
              <Droplets className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Portal de Utilidades
            </h1>
            <p className="text-white/60 text-sm">
              Sistema de Controle para ETE
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <Alert className="bg-red-500/10 border-red-500/30 text-red-300">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80 text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 pl-10 bg-white/[0.06] border-white/[0.12] text-white placeholder:text-white/30 focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80 text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pl-10 bg-white/[0.06] border-white/[0.12] text-white placeholder:text-white/30 focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30 rounded-xl"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#28A745] to-[#218838] hover:from-[#218838] hover:to-[#1a7a32] text-white font-semibold rounded-xl shadow-lg shadow-[#28A745]/25 transition-all duration-300 hover:shadow-xl hover:shadow-[#28A745]/35 hover:-translate-y-0.5 border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/[0.08]">
            <p className="text-center text-white/40 text-xs">
              Gestão de Efluentes &middot; Controle de Qualidade
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
