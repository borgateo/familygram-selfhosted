import { fileTypeFromBuffer } from 'file-type'
import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'
import { uploadObject } from '@/lib/storage'
import { MAX_AVATAR_BYTES, validateAvatarFile } from '@/lib/profile-validation'

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > MAX_AVATAR_BYTES + 1024 * 1024) {
    return NextResponse.json({ error: 'File troppo grande' }, { status: 413 })
  }

  let formData: FormData
  try { formData = await request.formData() } catch {
    return NextResponse.json({ error: 'Richiesta non valida' }, { status: 400 })
  }
  const file = formData.get('file')
  const targetUserId = formData.get('userId') as string | null
  if (!(file instanceof File)) return NextResponse.json({ error: 'File mancante' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const detected = await fileTypeFromBuffer(buffer)
  const avatar = validateAvatarFile(file.size, detected?.mime)
  if (!avatar) return NextResponse.json({ error: 'File non supportato o troppo grande' }, { status: 400 })

  let resolvedUserId = user.id
  if (targetUserId && targetUserId !== user.id) {
    if (user.role !== 'admin') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    const target = await sql`select id from users where id = ${targetUserId}`
    if (!target[0]) return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
    resolvedUserId = targetUserId
  }
  const key = `avatars/${resolvedUserId}.${avatar.extension}`
  try {
    await uploadObject(key, buffer, avatar.contentType)
    await sql`update users set avatar_url = ${key} where id = ${resolvedUserId}`
    return NextResponse.json({ key })
  } catch (error) {
    console.error('[avatar] storage upload failed:', error)
    return NextResponse.json({ error: 'Errore upload' }, { status: 500 })
  }
}
