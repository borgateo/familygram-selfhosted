import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  if (user.role !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  const { id } = await params
  const relationships = await sql<{ from_user_id: string; to_user_id: string }[]>`
    select from_user_id, to_user_id from family_relationships where id = ${id}
  `
  const relationship = relationships[0]
  if (!relationship) return NextResponse.json({ error: 'Non trovato' }, { status: 404 })
  await sql.begin(async transaction => {
    await transaction`delete from family_relationships where id = ${id}`
    await transaction`
      delete from family_relationships
      where from_user_id = ${relationship.to_user_id} and to_user_id = ${relationship.from_user_id}
    `
  })
  return new NextResponse(null, { status: 204 })
}
