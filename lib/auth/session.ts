import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getConfig } from '@/lib/config'

const COOKIE_NAME = 'familygram_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30

export interface SessionUser {
  id: string
  email: string
  username: string
  displayName: string
  role: 'admin' | 'member'
  disabled: boolean
}

export class AuthError extends Error {
  constructor(public status: 401 | 403, message = 'Non autorizzato') {
    super(message)
  }
}

function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

async function findSessionUser(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null

  const rows = await sql<SessionUser[]>`
    select
      u.id,
      u.email,
      u.username,
      u.display_name as "displayName",
      u.role,
      u.disabled
    from sessions s
    join users u on u.id = s.user_id
    where s.id = ${tokenHash(token)}
      and s.expires_at > now()
    limit 1
  `

  const user = rows[0] ?? null
  return user?.disabled ? null : user
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000)

  await sql.begin(async transaction => {
    await transaction`delete from sessions where expires_at <= now()`
    await transaction`
      insert into sessions (id, user_id, expires_at)
      values (${tokenHash(token)}, ${userId}, ${expiresAt})
    `
  })

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: getConfig().appUrl.startsWith('https://'),
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  return findSessionUser(cookieStore.get(COOKIE_NAME)?.value)
}

export function getSessionUserFromRequest(request: NextRequest): Promise<SessionUser | null> {
  return findSessionUser(request.cookies.get(COOKIE_NAME)?.value)
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (token) await sql`delete from sessions where id = ${tokenHash(token)}`
  cookieStore.delete(COOKIE_NAME)
}

export async function destroyAllSessionsForUser(userId: string): Promise<void> {
  await sql`delete from sessions where user_id = ${userId}`
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) throw new AuthError(401)
  return user
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser()
  if (user.role !== 'admin') throw new AuthError(403)
  return user
}
