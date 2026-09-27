import { NextResponse, type NextRequest } from 'next/server'
import { getSessionUserFromRequest } from '@/lib/auth/session'
import createI18nMiddleware from 'next-intl/middleware'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, isPublicRoute } from '@/lib/locales'

const i18nMiddleware = createI18nMiddleware({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
})

export async function proxy(request: NextRequest) {
  const i18nResponse = i18nMiddleware(request)
  const pathname = request.nextUrl.pathname

  const isRootPath = pathname === '/' || SUPPORTED_LOCALES.some(locale => pathname === `/${locale}`)
  const isApiRoute = pathname.startsWith('/api')

  if (isApiRoute) {
    const unsafeMethod = !['GET', 'HEAD', 'OPTIONS'].includes(request.method)
    const origin = request.headers.get('origin')
    if (unsafeMethod && origin && origin !== request.nextUrl.origin) {
      return NextResponse.json({ error: 'invalid_origin' }, { status: 403 })
    }
    return NextResponse.next()
  }

  if (isPublicRoute(pathname) || isRootPath) {
    return i18nResponse
  }

  const user = await getSessionUserFromRequest(request)

  if (!user) {
    const locale = SUPPORTED_LOCALES.find(value => pathname.startsWith(`/${value}`)) ?? DEFAULT_LOCALE
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  return i18nResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)'],
}
