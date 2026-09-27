import { describe, expect, it } from 'vitest'
import { inviteState } from '@/features/invites/validation'

describe('inviteState', () => {
  const now = new Date('2026-01-02T00:00:00Z')

  it('accepts an unused, unexpired invite', () => {
    expect(inviteState(new Date('2026-01-03T00:00:00Z'), null, now)).toBe('valid')
  })

  it('rejects an expired invite', () => {
    expect(inviteState(new Date('2026-01-01T00:00:00Z'), null, now)).toBe('expired')
  })

  it('rejects a used invite before checking expiry', () => {
    expect(inviteState(new Date('2026-01-03T00:00:00Z'), 'user-id', now)).toBe('used')
  })
})
