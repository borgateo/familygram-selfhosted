import { describe, it, expect } from 'vitest'
import { validateInviteRequest } from '@/lib/validate-invite-request'

describe('validateInviteRequest', () => {
  it('returns valid for name + email', () => {
    expect(validateInviteRequest({ name: 'Mario', email: 'mario@example.com' }))
      .toEqual({ valid: true })
  })

  it('returns missing_fields when name is empty string', () => {
    expect(validateInviteRequest({ name: '', email: 'mario@example.com' }))
      .toEqual({ valid: false, error: 'missing_fields' })
  })

  it('returns missing_fields when name is whitespace only', () => {
    expect(validateInviteRequest({ name: '   ', email: 'mario@example.com' }))
      .toEqual({ valid: false, error: 'missing_fields' })
  })

  it('returns missing_fields when email is missing', () => {
    expect(validateInviteRequest({ name: 'Mario' }))
      .toEqual({ valid: false, error: 'missing_fields' })
  })

  it('returns missing_fields when name is not a string', () => {
    expect(validateInviteRequest({ name: 42, email: 'mario@example.com' }))
      .toEqual({ valid: false, error: 'missing_fields' })
  })

  it('returns invalid_email for malformed email', () => {
    expect(validateInviteRequest({ name: 'Mario', email: 'not-an-email' }))
      .toEqual({ valid: false, error: 'invalid_email' })
  })

  it('returns invalid_email for email without domain', () => {
    expect(validateInviteRequest({ name: 'Mario', email: 'mario@' }))
      .toEqual({ valid: false, error: 'invalid_email' })
  })

  it('accepts optional message', () => {
    expect(validateInviteRequest({ name: 'Mario', email: 'mario@example.com', message: 'ciao' }))
      .toEqual({ valid: true })
  })

  it('accepts undefined message', () => {
    expect(validateInviteRequest({ name: 'Mario', email: 'mario@example.com', message: undefined }))
      .toEqual({ valid: true })
  })
})
