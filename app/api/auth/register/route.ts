import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { hashPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { normalizeLocale } from '@/lib/locales'

export async function POST(request: Request) {
  const formData = await request.formData()
  const token = String(formData.get('token') ?? '')
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const displayName = String(formData.get('display_name') ?? '').trim()
  const username = String(formData.get('username') ?? '').trim()
  const locale = normalizeLocale(formData.get('locale'))

  if (
    !token || token.length > 100 ||
    !email || email.length > 320 ||
    !displayName || displayName.length > 120 ||
    !username || username.length > 50 ||
    password.length < 12 || password.length > 1024
  ) {
    return NextResponse.redirect(new URL(`/${locale}/register?token=${encodeURIComponent(token)}&error=registration`, request.url), 303)
  }

  const passwordHash = await hashPassword(password)
  let userId = ''
  try {
    await sql.begin(async transaction => {
      const invites = await transaction<{ id: string }[]>`
        select id from invites
        where token = ${token} and used_by is null and expires_at > now()
        for update
      `
      const invite = invites[0]
      if (!invite) throw new Error('invalid_invite')
      const users = await transaction<{ id: string }[]>`
        insert into users (email, username, display_name, password_hash, locale)
        values (${email}, ${username}, ${displayName}, ${passwordHash}, ${locale})
        returning id
      `
      userId = users[0].id
      await transaction`update invites set used_by = ${userId} where id = ${invite.id}`
    })
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
    const errorCode = code === '23505' ? 'duplicate' : 'registration'
    return NextResponse.redirect(new URL(`/${locale}/register?token=${encodeURIComponent(token)}&error=${errorCode}`, request.url), 303)
  }

  await createSession(userId)
  return NextResponse.redirect(new URL(`/${locale}/feed`, request.url), 303)
}
