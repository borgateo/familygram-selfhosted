export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'] as const
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024
export const MAX_THUMB_BYTES = 2 * 1024 * 1024
export const MAX_REQUEST_BYTES = MAX_VIDEO_BYTES + MAX_THUMB_BYTES + 1024 * 1024
export const MAX_CAPTION_LENGTH = 2000

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
}

export class MediaValidationError extends Error {}

export function validateMedia(
  postType: string,
  original: File,
  thumbnail: File,
  detectedOriginalType: string | undefined,
  detectedThumbnailType: string | undefined,
): { type: 'photo' | 'video'; extension: string } {
  if (postType !== 'photo' && postType !== 'video') throw new MediaValidationError('invalid_post_type')
  const allowedTypes = postType === 'photo' ? IMAGE_TYPES : VIDEO_TYPES
  const maxBytes = postType === 'photo' ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES

  if (!detectedOriginalType || !(allowedTypes as readonly string[]).includes(detectedOriginalType)) {
    throw new MediaValidationError('unsupported_media_type')
  }
  if (original.size > maxBytes) throw new MediaValidationError('media_too_large')
  if (detectedThumbnailType !== 'image/jpeg') throw new MediaValidationError('invalid_thumbnail')
  if (thumbnail.size > MAX_THUMB_BYTES) throw new MediaValidationError('thumbnail_too_large')

  return { type: postType, extension: EXTENSIONS[detectedOriginalType] }
}

export function validateCaption(value: FormDataEntryValue | null): string | null {
  if (value === null || value === '') return null
  if (typeof value !== 'string') throw new MediaValidationError('invalid_caption')
  const caption = value.trim()
  if (!caption) return null
  if (caption.length > MAX_CAPTION_LENGTH) throw new MediaValidationError('caption_too_long')
  return caption
}
