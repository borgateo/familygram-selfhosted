// components/feed/FeedList.tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { PostCard } from './PostCard'
import type { PostData } from '@/features/posts/types'

function GuestModal({
  onClose,
  onRequestInvite,
}: {
  onClose: () => void
  onRequestInvite: () => void
}) {
  const t = useTranslations('guestModal')
  const primaryRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => { primaryRef.current?.focus() }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-modal-title"
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 mx-4 max-w-sm w-full shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="guest-modal-title" className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {t('title')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {t('message')}
        </p>
        <div className="flex flex-col gap-3">
          <button
            ref={primaryRef}
            onClick={onRequestInvite}
            className="w-full py-2.5 px-4 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            {t('requestInvite')}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 text-gray-500 text-sm font-medium hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

export function FeedList({
  initialPosts,
  initialCursor,
  currentUserId,
  isAdmin,
  locale,
}: {
  initialPosts: PostData[]
  initialCursor: string | null
  currentUserId: string | null
  isAdmin: boolean
  locale: string
}) {
  const t = useTranslations('feed')
  const router = useRouter()
  const [posts, setPosts] = useState<PostData[]>(initialPosts)
  const [cursor, setCursor] = useState<string | null>(initialCursor)
  const [loading, setLoading] = useState(false)
  const [showGuestModal, setShowGuestModal] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  function removePost(postId: string) {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  function handleGuestAction() {
    setShowGuestModal(true)
  }

  async function loadMore() {
    if (!cursor || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/posts?cursor=${encodeURIComponent(cursor)}`)
      if (!res.ok) return
      const data = await res.json()
      setPosts(prev => [...prev, ...(data.posts ?? [])])
      setCursor(data.nextCursor ?? null)
    } catch {
      // silently ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [cursor, loading]) // eslint-disable-line react-hooks/exhaustive-deps

  if (posts.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 mt-16">
        {t('noPostsYet')}
      </p>
    )
  }

  return (
    <>
      {showGuestModal && (
        <GuestModal
          onClose={() => setShowGuestModal(false)}
          onRequestInvite={() => router.push(`/${locale}/request-invite`)}
        />
      )}
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          locale={locale}
          onDeleted={removePost}
          onGuestAction={currentUserId === null ? handleGuestAction : undefined}
        />
      ))}
      <div ref={sentinelRef} className="h-8 flex items-center justify-center">
        {loading && <span className="text-sm text-gray-400">...</span>}
      </div>
    </>
  )
}
