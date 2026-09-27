import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { destroyAllSessionsForUser, getSessionUser } from '@/lib/auth/session'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const caller = await getSessionUser()
  if (!caller) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  if (caller.role !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  let body: { family_role?: unknown; disabled?: unknown }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Richiesta non valida' }, { status: 400 })
  }
  const updates: Record<string, string | boolean | null> = {}
  if (typeof body.family_role === 'string') updates.family_role = body.family_role || null
  if (typeof body.disabled === 'boolean') updates.disabled = body.disabled
  if (!Object.keys(updates).length) return NextResponse.json({ error: 'Nessun campo da aggiornare' }, { status: 400 })
  const { id } = await params
  const rows = await sql`update users set ${sql(updates, ...Object.keys(updates))} where id = ${id} returning id`
  if (!rows[0]) return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
  if (body.disabled === true) await destroyAllSessionsForUser(id)
  return new NextResponse(null, { status: 204 })
}
