export const SUPPORTED_LOCALES = ['en', 'it', 'pt-BR'] as const
export const DEFAULT_LOCALE = 'en'
export type SupportedLocale = typeof SUPPORTED_LOCALES[number]

const PUBLIC_ROUTES = ['/login', '/register', '/request-invite'] as const

export function normalizeLocale(value: unknown): SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale)
    ? value as SupportedLocale
    : DEFAULT_LOCALE
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route =>
    SUPPORTED_LOCALES.some(locale =>
      pathname === `/${locale}${route}` || pathname.startsWith(`/${locale}${route}/`)
    )
  )
}
