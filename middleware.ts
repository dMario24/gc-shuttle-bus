import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  const { pathname } = request.nextUrl;

  // If trying to access admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth?message=로그인이 필요합니다.', request.url));
    }

    // Fetch user profile to check role
    const { data: profile } = await supabase
      .from('gsb_users')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = profile?.role;

    if (pathname.startsWith('/admin/operations') && userRole !== 'operations_admin') {
      return NextResponse.redirect(new URL('/?error=운영 관리자 권한이 없습니다.', request.url));
    }

    if (pathname.startsWith('/admin/company') && userRole !== 'company_admin') {
      return NextResponse.redirect(new URL('/?error=기업 관리자 권한이 없습니다.', request.url));
    }

    if (userRole !== 'operations_admin' && userRole !== 'company_admin') {
        return NextResponse.redirect(new URL('/?error=관리자 권한이 없습니다.', request.url));
    }
  }

  // Protect other routes that require login
  const protectedRoutes = ['/my-reservations', '/my-rewards', '/ticket', '/reservations/new'];
  if (protectedRoutes.some(p => pathname.startsWith(p)) && !user) {
    return NextResponse.redirect(new URL('/auth?message=로그인이 필요합니다.', request.url));
  }


  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
