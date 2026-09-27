import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let input: { post_id?: unknown }
  try { input = await request.json() } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }
  if (typeof input.post_id !== 'string' || !input.post_id.trim()) {
    return NextResponse.json({ error: 'invalid_post_id' }, { status: 400 })
  }

  try {
    const result = await sql.begin(async transaction => {
      const posts = await transaction<{ likes_count: number }[]>`
        select likes_count from posts where id = ${input.post_id as string} for update
      `
      if (!posts[0]) return null

      const existing = await transaction<{ id: string }[]>`
        select id from likes where post_id = ${input.post_id as string} and user_id = ${user.id}
      `
      if (existing[0]) {
        await transaction`delete from likes where id = ${existing[0].id}`
      } else {
        await transaction`
          insert into likes (post_id, user_id) values (${input.post_id as string}, ${user.id})
        `
      }
      const updated = await transaction<{ likes_count: number }[]>`
        select likes_count from posts where id = ${input.post_id as string}
      `
      return { liked: !existing[0], count: updated[0].likes_count }
    })

    if (!result) return NextResponse.json({ error: 'post_not_found' }, { status: 404 })
    return NextResponse.json(result)
  } catch (error) {
    console.error('[likes POST]', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
