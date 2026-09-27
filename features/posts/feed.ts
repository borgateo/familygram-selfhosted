import { sql } from '@/lib/db'
import { getPresignedGetUrl } from '@/lib/storage'
import type { FeedPage, PostData } from './types'

type PostRow = {
  id: string
  type: 'photo' | 'video'
  media_url: string
  thumb_url: string
  caption: string | null
  filter: string | null
  likes_count: number
  comments_count: number
  liked: boolean
  created_at: Date
  user_id: string
  display_name: string
  avatar_url: string | null
  family_role: string | null
}

export const FEED_PAGE_SIZE = 20

export async function listFeed(userId: string, cursor?: Date): Promise<FeedPage> {
  const rows = cursor
    ? await sql<PostRow[]>`
        select p.*, u.display_name, u.avatar_url, u.family_role,
          exists(select 1 from likes l where l.post_id = p.id and l.user_id = ${userId}) as liked
        from posts p join users u on u.id = p.user_id
        where p.created_at < ${cursor}
        order by p.created_at desc, p.id desc
        limit ${FEED_PAGE_SIZE + 1}
      `
    : await sql<PostRow[]>`
        select p.*, u.display_name, u.avatar_url, u.family_role,
          exists(select 1 from likes l where l.post_id = p.id and l.user_id = ${userId}) as liked
        from posts p join users u on u.id = p.user_id
        order by p.created_at desc, p.id desc
        limit ${FEED_PAGE_SIZE + 1}
      `

  const hasMore = rows.length > FEED_PAGE_SIZE
  const pageRows = rows.slice(0, FEED_PAGE_SIZE)
  const signedAvatars = new Map<string, Promise<string>>()

  const posts: PostData[] = await Promise.all(pageRows.map(async row => {
    let avatarUrl: string | null = null
    if (row.avatar_url) {
      if (!signedAvatars.has(row.avatar_url)) {
        signedAvatars.set(row.avatar_url, getPresignedGetUrl(row.avatar_url))
      }
      avatarUrl = await signedAvatars.get(row.avatar_url)!
    }

    return {
      id: row.id,
      type: row.type,
      mediaUrl: await getPresignedGetUrl(row.media_url),
      thumbUrl: await getPresignedGetUrl(row.thumb_url),
      caption: row.caption,
      filter: row.filter,
      likesCount: row.likes_count,
      commentsCount: row.comments_count,
      liked: row.liked,
      createdAt: row.created_at.toISOString(),
      user: {
        id: row.user_id,
        displayName: row.display_name,
        avatarUrl,
        familyRole: row.family_role,
      },
    }
  }))

  return {
    posts,
    nextCursor: hasMore ? pageRows.at(-1)?.created_at.toISOString() ?? null : null,
  }
}
