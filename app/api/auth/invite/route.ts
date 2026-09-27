import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { inviteState } from '@/features/invites/validation'

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token mancante' }, { status: 400 })
  const rows = await sql<{ id: string; expires_at: Date; used_by: string | null }[]>`
    select id, expires_at, used_by from invites where token = ${token}
  `
  const invite = rows[0]
  if (!invite) return NextResponse.json({ error: 'invalid_token' }, { status: 404 })
  const state = inviteState(new Date(invite.expires_at), invite.used_by)
  if (state === 'expired') return NextResponse.json({ error: 'expired_token' }, { status: 410 })
  if (state === 'used') return NextResponse.json({ error: 'token_used' }, { status: 409 })
  return NextResponse.json({ valid: true, inviteId: invite.id })
}
