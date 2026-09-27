import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  if (user.role !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  const { id } = await params
  await sql`delete from invites where id = ${id} and used_by is null`
  return new NextResponse(null, { status: 204 })
}
