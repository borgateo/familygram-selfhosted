// components/post/CropModal.tsx
'use client'
import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'

export function CropModal({
  imageSrc,
  onCropDone,
  onClose,
}: {
  imageSrc: string
  onCropDone: (croppedAreaPixels: Area) => void
  onClose: () => void
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const t = useTranslations('post')
  const tCommon = useTranslations('common')

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>
      <div className="bg-black px-4 py-4 flex gap-3">
        <Button variant="ghost" onClick={onClose}>{tCommon('cancel')}</Button>
        <Button
          onClick={() => croppedAreaPixels && onCropDone(croppedAreaPixels)}
          disabled={!croppedAreaPixels}
        >
          {t('cropTitle')}
        </Button>
      </div>
    </div>
  )
}
