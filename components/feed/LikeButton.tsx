// components/feed/LikeButton.tsx
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Heart } from 'lucide-react'

export function LikeButton({
  postId,
  initialCount,
  initialLiked,
  currentUserId,
  onGuestAction,
}: {
  postId: string
  initialCount: number
  initialLiked: boolean
  currentUserId: string | null
  onGuestAction?: () => void
}) {
  const [count, setCount] = useState(initialCount)
  const [liked, setLiked] = useState(initialLiked)
  const [loading, setLoading] = useState(false)
  const t = useTranslations('post')

  async function toggle() {
    if (currentUserId === null) {
      onGuestAction?.()
      return
    }
    if (loading) return
    setLoading(true)
    const wasLiked = liked
    setLiked(!wasLiked)
    setCount(prev => wasLiked ? prev - 1 : prev + 1)

    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId }),
      })
      const data = await res.json()
      setLiked(data.liked)
      setCount(data.count)
    } catch {
      setLiked(wasLiked)
      setCount(prev => wasLiked ? prev + 1 : prev - 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
        liked
          ? 'text-red-500'
          : 'text-gray-500 dark:text-gray-400 hover:text-red-400'
      }`}
      aria-label={liked ? t('unlikeLabel') : t('likeLabel')}
    >
      <Heart size={18} className={liked ? 'fill-current' : ''} aria-hidden="true" />
      <span>{t('likes', { count })}</span>
    </button>
  )
}
