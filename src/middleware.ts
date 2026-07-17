import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { setSecurityHeaders } from '@/lib/security/headers'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  return setSecurityHeaders(response)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
