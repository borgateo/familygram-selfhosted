import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  if (user.role !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  const invites = await sql`
    select id, token, created_at, expires_at, used_by from invites order by created_at desc
  `
  return NextResponse.json({ invites })
}

export async function POST() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  if (user.role !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  const rows = await sql`
    insert into invites (created_by) values (${user.id})
    returning id, token, created_at, expires_at
  `
  return NextResponse.json({ invite: rows[0] }, { status: 201 })
}
