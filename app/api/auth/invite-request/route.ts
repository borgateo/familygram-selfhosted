import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { validateInviteRequest } from '@/lib/validate-invite-request'
import { clientAddress, consumeRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  if (!consumeRateLimit('invite-request', clientAddress(request), 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'too_many_requests' }, { status: 429 })
  }
  let body: { name?: unknown; email?: unknown; message?: unknown }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }
  const result = validateInviteRequest(body)
  if (!result.valid) return NextResponse.json({ error: result.error }, { status: 400 })
  const name = (body.name as string).trim()
  const email = (body.email as string).trim().toLowerCase()
  const message = typeof body.message === 'string' && body.message.trim() ? body.message.trim() : null
  try {
    await sql`insert into invite_requests (name, email, message) values (${name}, ${email}, ${message})`
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
    if (code === '23505') return NextResponse.json({ error: 'already_requested' }, { status: 409 })
    console.error('[invite-request POST]', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
