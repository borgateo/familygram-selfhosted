'use client'
import { useState } from 'react'
import { Lightbox } from './Lightbox'

const FILTER_CSS: Record<string, string> = {
  sepia: 'sepia(0.8)',
  grayscale: 'grayscale(1)',
  vivid: 'contrast(1.2) saturate(1.4)',
  warm: 'saturate(1.3) hue-rotate(-10deg)',
  cool: 'saturate(0.9) hue-rotate(10deg)',
}

export function PostMedia({
  type,
  mediaUrl,
  thumbUrl,
  filter,
}: {
  type: 'photo' | 'video'
  mediaUrl: string
  thumbUrl: string
  filter: string | null
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const cssFilter = filter ? (FILTER_CSS[filter] ?? 'none') : 'none'

  if (type === 'photo') {
    return (
      <>
        <button
          className="aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800 block"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={mediaUrl}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: cssFilter }}
            loading="lazy"
          />
        </button>
        {lightboxOpen && (
          <Lightbox
            src={mediaUrl}
            type="photo"
            filter={filter}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </>
    )
  }

  return (
    <div className="aspect-video w-full bg-black">
      <video
        src={mediaUrl}
        poster={thumbUrl}
        controls
        playsInline
        className="w-full h-full object-contain"
      />
    </div>
  )
}
