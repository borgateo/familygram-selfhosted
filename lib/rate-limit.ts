type Entry = { count: number; resetAt: number }
const entries = new Map<string, Entry>()

export function clientAddress(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'local'
}

export function consumeRateLimit(
  bucket: string,
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): boolean {
  const id = `${bucket}:${key}`
  const current = entries.get(id)
  if (!current || current.resetAt <= now) {
    entries.set(id, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (current.count >= limit) return false
  current.count += 1
  return true
}
