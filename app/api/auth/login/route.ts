import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { normalizeLocale } from '@/lib/locales'
import { clientAddress, consumeRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const formData = await request.formData()
  const identifier = String(formData.get('identifier') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const locale = normalizeLocale(formData.get('locale'))
  const allowed = consumeRateLimit('login', `${clientAddress(request)}:${identifier}`, 10, 15 * 60 * 1000)
  if (!allowed) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=too_many_attempts`, request.url), 303)
  }
  if (!identifier || identifier.length > 320 || !password || password.length > 1024) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=invalid_credentials`, request.url), 303)
  }

  const rows = await sql<{ id: string; password_hash: string; disabled: boolean }[]>`
    select id, password_hash, disabled from users
    where lower(email) = ${identifier} or lower(username) = ${identifier}
    limit 1
  `
  const user = rows[0]
  const passwordValid = user ? await verifyPassword(password, user.password_hash) : false
  if (!user || user.disabled || !passwordValid) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=invalid_credentials`, request.url), 303)
  }

  await createSession(user.id)
  return NextResponse.redirect(new URL(`/${locale}/feed`, request.url), 303)
}
