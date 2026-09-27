import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

function responseHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('origin')
  const allowedOrigin = process.env.HEALTH_ALLOWED_ORIGIN?.replace(/\/$/, '')
  const headers: HeadersInit = { 'Cache-Control': 'no-store' }

  if (origin && allowedOrigin && origin === allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin
    headers.Vary = 'Origin'
  }

  return headers
}

export async function GET(request: Request) {
  const headers = responseHeaders(request)
  try {
    await sql`select 1`
    return NextResponse.json({ ok: true }, { headers })
  } catch {
    return NextResponse.json({ ok: false }, { status: 503, headers })
  }
}
