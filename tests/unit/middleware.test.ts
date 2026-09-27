import { describe, expect, it } from 'vitest'
import { isPublicRoute, normalizeLocale } from '@/lib/locales'

describe('routing policy', () => {
  it.each(['/it/login', '/en/register', '/pt-BR/request-invite'])(
    'allows the public route %s',
    route => expect(isPublicRoute(route)).toBe(true),
  )

  it.each(['/it/feed', '/en/profile', '/pt-BR/admin'])(
    'protects the private route %s',
    route => expect(isPublicRoute(route)).toBe(false),
  )

  it('uses English for unsupported locales', () => {
    expect(normalizeLocale('fr')).toBe('en')
  })
})
