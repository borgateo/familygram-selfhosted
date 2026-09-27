import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'

const INVERSE: Record<string, string> = {
  parent: 'child', child: 'parent', sibling: 'sibling', spouse: 'spouse',
  grandparent: 'grandchild', grandchild: 'grandparent',
  uncle_aunt: 'nephew_niece', nephew_niece: 'uncle_aunt', cousin: 'cousin', other: 'other',
}

async function admin() {
  const user = await getSessionUser()
  return user?.role === 'admin' ? user : null
}

export async function GET() {
  const user = await admin()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  const relationships = await sql`
    select r.id, r.from_user_id, r.to_user_id, r.relationship_type, r.label,
      json_build_object('display_name', f.display_name) as users,
      json_build_object('display_name', t.display_name) as to_user
    from family_relationships r
    join users f on f.id = r.from_user_id
    join users t on t.id = r.to_user_id
    order by r.created_at asc
  `
  return NextResponse.json({ relationships })
}

export async function POST(request: Request) {
  const user = await admin()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  let body: { from_user_id?: string; to_user_id?: string; relationship_type?: string; label?: string }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Richiesta non valida' }, { status: 400 })
  }
  const { from_user_id, to_user_id, relationship_type, label } = body
  if (!from_user_id || !to_user_id || !relationship_type) return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
  if (!INVERSE[relationship_type]) return NextResponse.json({ error: 'Tipo relazione non valido' }, { status: 400 })
  try {
    await sql.begin(async transaction => {
      await transaction`
        insert into family_relationships (from_user_id, to_user_id, relationship_type, label)
        values (${from_user_id}, ${to_user_id}, ${relationship_type}, ${label || null})
      `
      await transaction`
        insert into family_relationships (from_user_id, to_user_id, relationship_type, label)
        values (${to_user_id}, ${from_user_id}, ${INVERSE[relationship_type]}, ${null})
      `
    })
    return new NextResponse(null, { status: 201 })
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
    if (code === '23505') return NextResponse.json({ error: 'Relazione già esistente' }, { status: 409 })
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
