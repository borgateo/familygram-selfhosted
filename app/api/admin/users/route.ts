import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  if (user.role !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  const users = await sql`
    select id, display_name, username, family_role, role, disabled, created_at
    from users order by created_at asc
  `
  return NextResponse.json({ users })
}
