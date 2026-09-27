import { describe, it, expect } from 'vitest'
import {
  ALLOWED_AVATAR_TYPES,
  MAX_AVATAR_BYTES,
  validateAvatarFile,
  validateProfilePatchBody,
  validateAdminProfilePatchBody,
} from '@/lib/profile-validation'

describe('ALLOWED_AVATAR_TYPES', () => {
  it('contiene image/jpeg, image/png, image/webp', () => {
    expect(ALLOWED_AVATAR_TYPES).toContain('image/jpeg')
    expect(ALLOWED_AVATAR_TYPES).toContain('image/png')
    expect(ALLOWED_AVATAR_TYPES).toContain('image/webp')
  })

  it('non contiene video/mp4', () => {
    expect((ALLOWED_AVATAR_TYPES as readonly string[])).not.toContain('video/mp4')
  })
})

describe('validateAvatarFile', () => {
  it('uses the detected type instead of the browser-provided name', () => {
    expect(validateAvatarFile(1024, 'image/png')).toEqual({ contentType: 'image/png', extension: 'png' })
  })

  it('rejects unsupported and oversized files', () => {
    expect(validateAvatarFile(1024, 'text/html')).toBeNull()
    expect(validateAvatarFile(MAX_AVATAR_BYTES + 1, 'image/jpeg')).toBeNull()
  })
})

describe('validateProfilePatchBody', () => {
  it('restituisce null per body valido', () => {
    expect(validateProfilePatchBody({ display_name: 'Mario', theme: 'dark' })).toBeNull()
  })

  it('rifiuta display_name vuoto', () => {
    expect(validateProfilePatchBody({ display_name: '' })).not.toBeNull()
  })

  it('rifiuta username con solo spazi', () => {
    expect(validateProfilePatchBody({ username: '   ' })).not.toBeNull()
  })

  it('rifiuta theme non valido', () => {
    expect(validateProfilePatchBody({ theme: 'purple' })).not.toBeNull()
  })

  it('accetta theme validi', () => {
    expect(validateProfilePatchBody({ theme: 'light' })).toBeNull()
    expect(validateProfilePatchBody({ theme: 'dark' })).toBeNull()
    expect(validateProfilePatchBody({ theme: 'system' })).toBeNull()
  })

  it('rifiuta locale non valido', () => {
    expect(validateProfilePatchBody({ locale: 'fr' })).not.toBeNull()
  })

  it('accetta locale validi', () => {
    expect(validateProfilePatchBody({ locale: 'it' })).toBeNull()
    expect(validateProfilePatchBody({ locale: 'pt-BR' })).toBeNull()
  })
})

describe('validateAdminProfilePatchBody', () => {
  it('rifiuta theme', () => {
    expect(validateAdminProfilePatchBody({ theme: 'dark' })).not.toBeNull()
  })

  it('rifiuta locale', () => {
    expect(validateAdminProfilePatchBody({ locale: 'it' })).not.toBeNull()
  })

  it('rifiuta sia theme che locale', () => {
    expect(validateAdminProfilePatchBody({ theme: 'dark', locale: 'it' })).not.toBeNull()
  })

  it('accetta display_name e username', () => {
    expect(validateAdminProfilePatchBody({ display_name: 'Sofia', username: 'sofia' })).toBeNull()
  })

  it('accetta family_role e avatar_url', () => {
    expect(validateAdminProfilePatchBody({ family_role: 'Figlia', avatar_url: 'avatars/abc.jpg' })).toBeNull()
  })
})
