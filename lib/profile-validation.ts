export const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'] as const
export type AvatarContentType = typeof ALLOWED_AVATAR_TYPES[number]
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024

const AVATAR_EXTENSIONS: Record<AvatarContentType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
}

export function validateAvatarFile(
  size: number,
  detectedType: string | undefined,
): { contentType: AvatarContentType; extension: string } | null {
  if (size <= 0 || size > MAX_AVATAR_BYTES) return null
  if (!detectedType || !(ALLOWED_AVATAR_TYPES as readonly string[]).includes(detectedType)) return null
  const contentType = detectedType as AvatarContentType
  return { contentType, extension: AVATAR_EXTENSIONS[contentType] }
}

const VALID_THEMES = ['light', 'dark', 'system'] as const
const VALID_LOCALES = ['en', 'it', 'pt-BR'] as const

const ALLOWED_OWN_FIELDS = ['display_name', 'username', 'family_role', 'avatar_url', 'theme', 'locale']
const ALLOWED_ADMIN_FIELDS = ['display_name', 'username', 'family_role', 'avatar_url']
const MAX_LENGTHS: Record<string, number> = {
  display_name: 120,
  username: 50,
  family_role: 120,
  avatar_url: 1000,
  theme: 20,
  locale: 10,
}

/** Returns an error message string, or null if valid. */
export function validateProfilePatchBody(body: Record<string, unknown>): string | null {
  for (const key of ALLOWED_OWN_FIELDS) {
    const val = body[key]
    if (val !== undefined && (typeof val !== 'string' || !val.trim())) {
      return `Il campo ${key} non può essere vuoto`
    }
    if (typeof val === 'string' && val.trim().length > MAX_LENGTHS[key]) {
      return `Il campo ${key} è troppo lungo`
    }
  }
  if (body.theme !== undefined && !(VALID_THEMES as readonly string[]).includes(body.theme as string)) {
    return 'Tema non valido'
  }
  if (body.locale !== undefined && !(VALID_LOCALES as readonly string[]).includes(body.locale as string)) {
    return 'Lingua non valida'
  }
  return null
}

/** Admin PATCH: same as own profile but rejects theme and locale fields. */
export function validateAdminProfilePatchBody(body: Record<string, unknown>): string | null {
  if ('theme' in body || 'locale' in body) {
    return 'Admin non può modificare tema o lingua di altri utenti'
  }
  // Validate only the admin-allowed fields
  for (const key of ALLOWED_ADMIN_FIELDS) {
    const val = body[key]
    if (val !== undefined && (typeof val !== 'string' || !val.trim())) {
      return `Il campo ${key} non può essere vuoto`
    }
    if (typeof val === 'string' && val.trim().length > MAX_LENGTHS[key]) {
      return `Il campo ${key} è troppo lungo`
    }
  }
  return null
}
