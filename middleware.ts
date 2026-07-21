import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create Supabase client for middleware
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  let userRole = 'BUYER'

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    userRole = profile?.role?.toUpperCase() || 'BUYER'
  }

  // Admin routes — return 404 for non-admins
  if (pathname.startsWith('/admin')) {
    if (!user || userRole !== 'ADMIN') {
      return NextResponse.rewrite(new URL('/404', request.url))
    }
  }

  // Seller routes — allow SELLER and ADMIN
  if (pathname.startsWith('/seller') || pathname.startsWith('/dashboard/seller')) {
    if (!user) {
      const url = new URL('/auth/signin', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    if (userRole !== 'SELLER' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/seller/apply', request.url))
    }
  }

  // Buyer dashboard
  if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/seller')) {
    if (!user) {
      const url = new URL('/auth/signin', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }

  if (pathname === '/onboard' && !user) {
    const url = new URL('/auth/signin', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/seller/:path*', '/dashboard/:path*', '/onboard'],
}
