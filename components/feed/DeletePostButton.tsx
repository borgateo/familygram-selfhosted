// components/feed/DeletePostButton.tsx
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Trash2 } from 'lucide-react'

export function DeletePostButton({
  postId,
  onDeleted,
}: {
  postId: string
  onDeleted: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const t = useTranslations('post')

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      if (res.ok) onDeleted()
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-gray-400 hover:text-red-500 transition-colors"
        aria-label={t('delete')}
      >
        <Trash2 size={15} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full sm:max-w-sm bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-base font-semibold text-gray-900 dark:text-white text-center">
              {t('confirmDelete')}
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-red-500 text-white font-semibold disabled:opacity-50"
              >
                {loading ? '...' : t('deleteConfirm')}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold"
              >
                {t('deleteCancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
