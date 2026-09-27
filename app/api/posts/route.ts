import { fileTypeFromBuffer } from 'file-type'
import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { sql } from '@/lib/db'
import { deleteObject, uploadObject } from '@/lib/storage'
import { listFeed } from '@/features/posts/feed'
import {
  MAX_REQUEST_BYTES,
  MediaValidationError,
  validateCaption,
  validateMedia,
} from '@/features/media/validation'

export async function GET(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const cursorValue = new URL(request.url).searchParams.get('cursor')
  const cursor = cursorValue ? new Date(cursorValue) : undefined
  if (cursor && Number.isNaN(cursor.getTime())) {
    return NextResponse.json({ error: 'invalid_cursor' }, { status: 400 })
  }

  try {
    return NextResponse.json(await listFeed(user.id, cursor))
  } catch (error) {
    console.error('[posts GET]', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: 'request_too_large' }, { status: 413 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  const original = formData.get('original')
  const thumbnail = formData.get('thumbnail')
  if (!(original instanceof File) || !(thumbnail instanceof File)) {
    return NextResponse.json({ error: 'missing_media' }, { status: 400 })
  }

  const originalBuffer = Buffer.from(await original.arrayBuffer())
  const thumbnailBuffer = Buffer.from(await thumbnail.arrayBuffer())
  let validated: ReturnType<typeof validateMedia>
  let caption: string | null
  let detectedOriginalType: string | undefined
  try {
    const [detectedOriginal, detectedThumbnail] = await Promise.all([
      fileTypeFromBuffer(originalBuffer),
      fileTypeFromBuffer(thumbnailBuffer),
    ])
    detectedOriginalType = detectedOriginal?.mime
    validated = validateMedia(
      String(formData.get('type') ?? ''),
      original,
      thumbnail,
      detectedOriginalType,
      detectedThumbnail?.mime,
    )
    caption = validateCaption(formData.get('caption'))
  } catch (error) {
    if (error instanceof MediaValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    throw error
  }

  const filterValue = formData.get('filter')
  const filter = typeof filterValue === 'string' && filterValue ? filterValue : null
  const postId = crypto.randomUUID()
  const prefix = `posts/${user.id}/${postId}`
  const mediaKey = `${prefix}/original.${validated.extension}`
  const thumbKey = `${prefix}/thumb.jpg`

  try {
    await Promise.all([
      uploadObject(mediaKey, originalBuffer, detectedOriginalType!),
      uploadObject(thumbKey, thumbnailBuffer, 'image/jpeg'),
    ])
    await sql`
      insert into posts (id, user_id, type, media_url, thumb_url, caption, filter)
      values (${postId}, ${user.id}, ${validated.type}, ${mediaKey}, ${thumbKey}, ${caption}, ${filter})
    `
    return NextResponse.json({ id: postId }, { status: 201 })
  } catch (error) {
    await Promise.allSettled([deleteObject(mediaKey), deleteObject(thumbKey)])
    console.error('[posts POST]', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
