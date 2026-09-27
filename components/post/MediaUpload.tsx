// components/post/MediaUpload.tsx
'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { Area } from 'react-easy-crop'
import { Button } from '@/components/ui/Button'
import { CropModal } from './CropModal'
import { FilterPicker, FILTERS } from './FilterPicker'
import { ImagePlus } from 'lucide-react'

type Step = 'select' | 'crop' | 'filter' | 'caption' | 'uploading'

async function getCroppedImageBlob(
  imageSrc: string,
  croppedAreaPixels: Area,
  filterCss: string
): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  const MAX = 1080
  const scale = Math.min(MAX / croppedAreaPixels.width, MAX / croppedAreaPixels.height, 1)
  canvas.width = Math.round(croppedAreaPixels.width * scale)
  canvas.height = Math.round(croppedAreaPixels.height * scale)

  const ctx = canvas.getContext('2d')!
  ctx.filter = filterCss === 'none' ? '' : filterCss
  ctx.drawImage(
    img,
    croppedAreaPixels.x, croppedAreaPixels.y,
    croppedAreaPixels.width, croppedAreaPixels.height,
    0, 0, canvas.width, canvas.height
  )

  const canvasBlob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')), 'image/jpeg', 0.85)
  )

  // Enforce 1MB cap via browser-image-compression
  const imageCompression = (await import('browser-image-compression')).default
  const file = new File([canvasBlob], 'photo.jpg', { type: 'image/jpeg' })
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    useWebWorker: false,
    initialQuality: 0.85,
  })
  return compressed
}

async function extractVideoThumbnail(videoFile: File): Promise<Blob> {
  const video = document.createElement('video')
  video.preload = 'metadata'
  video.muted = true
  video.src = URL.createObjectURL(videoFile)

  await new Promise<void>((resolve, reject) => {
    video.addEventListener('loadeddata', () => resolve(), { once: true })
    video.addEventListener('error', () => reject(new Error('Video load failed')), { once: true })
    video.load()
  })

  const size = Math.min(video.videoWidth, video.videoHeight)
  const x = (video.videoWidth - size) / 2
  const y = (video.videoHeight - size) / 2

  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 400
  canvas.getContext('2d')!.drawImage(video, x, y, size, size, 0, 0, 400, 400)

  URL.revokeObjectURL(video.src)
  return new Promise((resolve, reject) =>
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')), 'image/jpeg', 0.85)
  )
}

export function MediaUpload({ locale }: { locale: string }) {
  const router = useRouter()
  const t = useTranslations('post')
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('select')
  const [file, setFile] = useState<File | null>(null)
  const [previewSrc, setPreviewSrc] = useState<string>('')
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [selectedFilter, setSelectedFilter] = useState('none')
  const [caption, setCaption] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setError(null)
    if (f.type.startsWith('video/')) {
      const video = document.createElement('video')
      video.src = URL.createObjectURL(f)
      video.addEventListener('loadedmetadata', () => {
        if (video.duration > 60) {
          setError(t('videoTooLong'))
          URL.revokeObjectURL(video.src)
          return
        }
        if (f.size > 50 * 1024 * 1024) {
          setError(t('videoTooLarge'))
          URL.revokeObjectURL(video.src)
          return
        }
        URL.revokeObjectURL(video.src)
        setFile(f)
        setPreviewSrc(URL.createObjectURL(f))
        setStep('caption')
      }, { once: true })
      return
    }

    // Photo
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreviewSrc(url)
    setStep('crop')
  }

  async function handleSubmit() {
    if (!file) return
    setStep('uploading')
    setError(null)

    try {
      const isVideo = file.type.startsWith('video/')

      let mediaBlob: Blob
      let thumbBlob: Blob
      const mediaContentType = file.type

      if (isVideo) {
        mediaBlob = file
        thumbBlob = await extractVideoThumbnail(file)
      } else {
        const filterCss = FILTERS.find(f => f.id === selectedFilter)?.css ?? 'none'
        mediaBlob = await getCroppedImageBlob(
          previewSrc,
          croppedAreaPixels ?? { x: 0, y: 0, width: 1080, height: 1080 },
          filterCss
        )
        thumbBlob = mediaBlob
      }

      const form = new FormData()
      form.append('original', new File([mediaBlob], 'original', {
        type: isVideo ? mediaContentType : mediaBlob.type || 'image/jpeg',
      }))
      form.append('thumbnail', new File([thumbBlob], 'thumb.jpg', { type: 'image/jpeg' }))
      form.append('type', isVideo ? 'video' : 'photo')
      form.append('caption', caption.trim())
      form.append('filter', selectedFilter !== 'none' ? selectedFilter : '')
      const postRes = await fetch('/api/posts', {
        method: 'POST',
        body: form,
      })

      if (!postRes.ok) {
        const body = await postRes.text()
        throw new Error(`Failed to create post: ${postRes.status} ${body}`)
      }

      router.push(`/${locale}/feed`)
      router.refresh()
    } catch (err) {
      console.error('[upload] failed:', err instanceof Error ? err.message : String(err))
      setError(t('uploadError'))
      setStep('caption')
    }
  }

  if (step === 'select') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <button
          onClick={() => fileRef.current?.click()}
          className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
        >
          <ImagePlus size={32} />
          <span className="text-xs">{t('selectMedia')}</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    )
  }

  if (step === 'crop' && previewSrc) {
    return (
      <CropModal
        imageSrc={previewSrc}
        onCropDone={(pixels) => {
          setCroppedAreaPixels(pixels)
          setStep('filter')
        }}
        onClose={() => { setStep('select'); setFile(null); setPreviewSrc('') }}
      />
    )
  }

  if (step === 'filter' && previewSrc) {
    return (
      <div className="flex flex-col h-screen bg-black">
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <img
            src={previewSrc}
            alt="preview"
            className="max-h-full max-w-full object-contain"
            style={{ filter: FILTERS.find(f => f.id === selectedFilter)?.css ?? 'none' }}
          />
        </div>
        <div className="bg-gray-950">
          <FilterPicker
            previewSrc={previewSrc}
            selected={selectedFilter}
            onSelect={setSelectedFilter}
          />
          <div className="px-4 pb-6">
            <Button onClick={() => setStep('caption')}>{t('next')}</Button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'caption' || step === 'uploading') {
    const isVideo = file?.type.startsWith('video/')
    return (
      <div className="flex flex-col gap-4 p-4">
        {previewSrc && (
          <div className="aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
            {isVideo ? (
              <video src={previewSrc} className="w-full h-full object-cover" muted />
            ) : (
              <img
                src={previewSrc}
                alt="preview"
                className="w-full h-full object-cover"
                style={{ filter: FILTERS.find(f => f.id === selectedFilter)?.css ?? 'none' }}
              />
            )}
          </div>
        )}
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <textarea
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder={t('captionPlaceholder')}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Button
          onClick={handleSubmit}
          loading={step === 'uploading'}
          disabled={step === 'uploading'}
        >
          {step === 'uploading' ? t('uploading') : t('submit')}
        </Button>
      </div>
    )
  }

  return null
}
