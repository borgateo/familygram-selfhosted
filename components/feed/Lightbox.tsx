'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'

const FILTER_CSS: Record<string, string> = {
  sepia: 'sepia(0.8)',
  grayscale: 'grayscale(1)',
  vivid: 'contrast(1.2) saturate(1.4)',
  warm: 'saturate(1.3) hue-rotate(-10deg)',
  cool: 'saturate(0.9) hue-rotate(10deg)',
}

export function Lightbox({
  src,
  type,
  filter,
  onClose,
}: {
  src: string
  type: 'photo' | 'video'
  filter?: string | null
  onClose: () => void
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const cssFilter = filter ? (FILTER_CSS[filter] ?? 'none') : 'none'

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-5 right-5 z-10 text-white/70 hover:text-white"
        onClick={onClose}
      >
        <X size={28} />
      </button>

      <div
        className="w-full h-full flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}
      >
        {type === 'photo' ? (
          <img
            src={src}
            alt=""
            className="max-w-full max-h-full object-contain"
            style={{ filter: cssFilter }}
          />
        ) : (
          <video
            src={src}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-full"
          />
        )}
      </div>
    </div>
  )
}
