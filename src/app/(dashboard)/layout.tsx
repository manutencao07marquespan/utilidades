'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  LayoutDashboard,
  FlaskConical,
  Gauge,
  Package,
  Trash2,
  Wrench,
  Users,
  CalendarCheck,
  ClipboardCheck,
  FileText,
  LogOut,
  Menu,
  X,
  Bell,
  Droplets,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Indicadores', href: '/indicadores', icon: BarChart3 },
  { name: 'Laboratório', href: '/laboratorio', icon: FlaskConical },
  { name: 'Utilidades', href: '/utilidades', icon: Gauge },
  { name: 'Insumos', href: '/insumos', icon: Package },
  { name: 'Resíduos', href: '/residuos', icon: Trash2 },
  { name: 'Manutenção', href: '/manutencao', icon: Wrench },
  { name: 'Atividades', href: '/atividades-preventivas', icon: CalendarCheck },
  { name: 'Checklists', href: '/checklists', icon: ClipboardCheck },
  { name: 'Relatórios', href: '/relatorios', icon: FileText },
  { name: 'Usuários', href: '/usuarios', icon: Users },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-muted border-t-accent"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-10 w-10 border border-accent/20"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar-gradient px-6 pb-4 shadow-xl shadow-black/20">
          {/* Logo */}
          <div className="flex h-16 items-center">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#28A745] to-[#218838] flex items-center justify-center shadow-lg shadow-[#28A745]/30">
                <Droplets className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-white font-semibold text-sm">Portal das</span>
                <span className="text-white/60 text-sm ml-1">Utilidades</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-0.5">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`relative flex gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-white/[0.1] text-white nav-active-indicator'
                          : 'text-white/50 hover:bg-white/[0.06] hover:text-white/80'
                      }`}
                    >
                      <item.icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="border-t border-white/10 pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-white/50 hover:text-white hover:bg-white/[0.06] h-10"
              onClick={handleLogout}
            >
              <LogOut className="h-4.5 w-4.5 mr-3" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-lg border-b border-border/50">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="hover:bg-accent/10"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#28A745] to-[#218838] flex items-center justify-center shadow-md shadow-[#28A745]/20">
                <Droplets className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-sm">Portal das Utilidades</span>
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="hover:bg-accent/10">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full focus:outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-[#28A745] to-[#218838] text-white text-xs font-bold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b bg-sidebar-gradient shadow-xl">
            <nav className="px-4 py-3">
              <ul role="list" className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname.startsWith(item.href)
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-white/[0.12] text-white nav-active-indicator'
                            : 'text-white/50 hover:bg-white/[0.06] hover:text-white/80'
                        }`}
                      >
                        <item.icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:pl-72">
        <div className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-lg border-b border-border/50">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">
              {navigation.find(item => pathname.startsWith(item.href))?.name || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hover:bg-accent/10 rounded-xl">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full focus:outline-none">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-[#28A745] to-[#218838] text-white text-sm font-bold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="px-4 py-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
