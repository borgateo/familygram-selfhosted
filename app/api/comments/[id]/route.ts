import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  let input: { body?: unknown }
  try { input = await request.json() } catch {
    return NextResponse.json({ error: 'Richiesta non valida' }, { status: 400 })
  }
  if (typeof input.body !== 'string' || !input.body.trim() || input.body.trim().length > 2000) {
    return NextResponse.json({ error: 'Testo mancante' }, { status: 400 })
  }
  const { id } = await params
  const rows = await sql`
    update comments set body = ${input.body.trim()}
    where id = ${id} and user_id = ${user.id} returning *
  `
  if (!rows[0]) return NextResponse.json({ error: 'Commento non trovato' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const { id } = await params
  const rows = user.role === 'admin'
    ? await sql`delete from comments where id = ${id} returning id`
    : await sql`delete from comments where id = ${id} and user_id = ${user.id} returning id`
  if (!rows[0]) return NextResponse.json({ error: 'Commento non trovato' }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
