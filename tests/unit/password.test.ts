import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from '@/lib/auth/password'

describe('password hashing', () => {
  it('stores a bcrypt hash and verifies the correct password', async () => {
    const hash = await hashPassword('correct-horse-battery-staple')
    expect(hash).not.toContain('correct-horse-battery-staple')
    expect(hash).toMatch(/^\$2[aby]\$/)
    expect(await verifyPassword('correct-horse-battery-staple', hash)).toBe(true)
  })

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('right-password')
    expect(await verifyPassword('wrong-password', hash)).toBe(false)
  })
})
