import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'
import { validateAdminProfilePatchBody } from '@/lib/profile-validation'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  if (user.role !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  const { id } = await params
  const exists = await sql`select id from users where id = ${id}`
  if (!exists[0]) return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Richiesta non valida' }, { status: 400 })
  }
  const validationError = validateAdminProfilePatchBody(body)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })
  const allowed = ['display_name', 'username', 'family_role', 'avatar_url'] as const
  const update: Record<string, string> = {}
  for (const key of allowed) if (typeof body[key] === 'string') update[key] = body[key].trim()
  if (!Object.keys(update).length) return NextResponse.json({ error: 'Nessun campo da aggiornare' }, { status: 400 })
  try {
    const rows = await sql`
      update users set ${sql(update, ...Object.keys(update))}
      where id = ${id}
      returning display_name, username, family_role, avatar_url
    `
    return NextResponse.json(rows[0])
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
    if (code === '23505') return NextResponse.json({ error: 'Username già in uso' }, { status: 409 })
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
