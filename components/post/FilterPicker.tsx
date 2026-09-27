// components/post/FilterPicker.tsx
'use client'
import { useTranslations } from 'next-intl'

export const FILTERS: { id: string; css: string }[] = [
  { id: 'none', css: 'none' },
  { id: 'sepia', css: 'sepia(0.8)' },
  { id: 'grayscale', css: 'grayscale(1)' },
  { id: 'vivid', css: 'contrast(1.2) saturate(1.4)' },
  { id: 'warm', css: 'saturate(1.3) hue-rotate(-10deg)' },
  { id: 'cool', css: 'saturate(0.9) hue-rotate(10deg)' },
]

export function FilterPicker({
  previewSrc,
  selected,
  onSelect,
}: {
  previewSrc: string
  selected: string
  onSelect: (filterId: string) => void
}) {
  const t = useTranslations('post')

  return (
    <div className="flex gap-3 overflow-x-auto py-3 px-4">
      {FILTERS.map(f => (
        <button
          key={f.id}
          onClick={() => onSelect(f.id)}
          className={`flex flex-col items-center gap-1 shrink-0 ${
            selected === f.id ? 'opacity-100' : 'opacity-60'
          }`}
        >
          <div
            className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${
              selected === f.id
                ? 'border-indigo-600'
                : 'border-transparent'
            }`}
          >
            <img
              src={previewSrc}
              alt={f.id}
              className="w-full h-full object-cover"
              style={{ filter: f.css }}
            />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {f.id === 'none' ? t('filterNone') : f.id}
          </span>
        </button>
      ))}
    </div>
  )
}
