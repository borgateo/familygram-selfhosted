import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { sql } from '@/lib/db'
import { deleteObject } from '@/lib/storage'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params

  const rows = user.role === 'admin'
    ? await sql<{ media_url: string; thumb_url: string }[]>`
        delete from posts where id = ${id} returning media_url, thumb_url
      `
    : await sql<{ media_url: string; thumb_url: string }[]>`
        delete from posts where id = ${id} and user_id = ${user.id}
        returning media_url, thumb_url
      `
  const post = rows[0]
  if (!post) return NextResponse.json({ error: 'post_not_found' }, { status: 404 })

  const cleanup = await Promise.allSettled([
    deleteObject(post.media_url),
    deleteObject(post.thumb_url),
  ])
  if (cleanup.some(result => result.status === 'rejected')) {
    console.error('[posts DELETE] database row deleted; object cleanup incomplete', cleanup)
  }
  return new NextResponse(null, { status: 204 })
}
