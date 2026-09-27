import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'

export async function GET(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const postId = new URL(request.url).searchParams.get('post_id')
  if (!postId) return NextResponse.json({ error: 'post_id mancante' }, { status: 400 })
  try {
    const comments = await sql`
      select c.*, json_build_object('id', u.id, 'display_name', u.display_name, 'avatar_url', u.avatar_url) as users
      from comments c join users u on u.id = c.user_id
      where c.post_id = ${postId} order by c.created_at asc
    `
    return NextResponse.json(comments)
  } catch (error) {
    console.error('[comments GET]', error)
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  let input: { post_id?: unknown; body?: unknown }
  try { input = await request.json() } catch {
    return NextResponse.json({ error: 'Richiesta non valida' }, { status: 400 })
  }
  if (
    typeof input.post_id !== 'string' || !input.post_id.trim() ||
    typeof input.body !== 'string' || !input.body.trim() || input.body.trim().length > 2000
  ) {
    return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
  }
  try {
    const rows = await sql`
      with inserted as (
        insert into comments (post_id, user_id, body)
        values (${input.post_id}, ${user.id}, ${input.body.trim()}) returning *
      )
      select i.*, json_build_object('id', u.id, 'display_name', u.display_name, 'avatar_url', u.avatar_url) as users
      from inserted i join users u on u.id = i.user_id
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    console.error('[comments POST]', error)
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
