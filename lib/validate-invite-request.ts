export interface InviteRequestInput {
  name?: unknown
  email?: unknown
  message?: unknown
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: 'missing_fields' | 'invalid_email' }

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateInviteRequest(input: InviteRequestInput): ValidationResult {
  if (
    typeof input.name !== 'string' || !input.name.trim() ||
    typeof input.email !== 'string' || !input.email.trim()
  ) {
    return { valid: false, error: 'missing_fields' }
  }

  if (input.name.trim().length > 120 || input.email.trim().length > 320) {
    return { valid: false, error: 'missing_fields' }
  }

  if (typeof input.message === 'string' && input.message.trim().length > 2000) {
    return { valid: false, error: 'missing_fields' }
  }

  if (!EMAIL_REGEX.test(input.email)) {
    return { valid: false, error: 'invalid_email' }
  }

  return { valid: true }
}
