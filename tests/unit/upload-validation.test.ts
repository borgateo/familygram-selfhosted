import { describe, expect, it } from 'vitest'
import {
  MAX_IMAGE_BYTES,
  MediaValidationError,
  validateCaption,
  validateMedia,
} from '@/features/media/validation'

function file(size: number, type: string): File {
  return new File([new Uint8Array(size)], 'file', { type })
}

describe('media validation', () => {
  it('accepts a JPEG photo and thumbnail', () => {
    expect(validateMedia(
      'photo',
      file(1024, 'image/jpeg'),
      file(512, 'image/jpeg'),
      'image/jpeg',
      'image/jpeg',
    )).toEqual({ type: 'photo', extension: 'jpg' })
  })

  it('rejects content whose detected type does not match the post type', () => {
    expect(() => validateMedia(
      'photo',
      file(1024, 'application/octet-stream'),
      file(512, 'image/jpeg'),
      'video/mp4',
      'image/jpeg',
    )).toThrow(MediaValidationError)
  })

  it('rejects oversized photos', () => {
    expect(() => validateMedia(
      'photo',
      file(MAX_IMAGE_BYTES + 1, 'image/jpeg'),
      file(512, 'image/jpeg'),
      'image/jpeg',
      'image/jpeg',
    )).toThrow('media_too_large')
  })

  it('bounds captions', () => {
    expect(validateCaption(' hello ')).toBe('hello')
    expect(() => validateCaption('x'.repeat(2001))).toThrow('caption_too_long')
  })
})
