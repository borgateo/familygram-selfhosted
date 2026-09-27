// components/feed/CommentSection.tsx
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface Comment {
  id: string
  body: string
  created_at: string
  user_id: string
  users: {
    id: string
    display_name: string
  }
}

export function CommentSection({
  postId,
  initialCount,
  currentUserId,
  isAdmin,
  onGuestAction,
}: {
  postId: string
  initialCount: number
  currentUserId: string | null
  isAdmin: boolean
  onGuestAction?: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [count, setCount] = useState(initialCount)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const t = useTranslations('comments')
  const tPost = useTranslations('post')

  async function loadComments() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/comments?post_id=${postId}`)
      const data = await res.json()
      setComments(data)
      setExpanded(true)
    } finally {
      setLoading(false)
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (currentUserId === null) {
      onGuestAction?.()
      return
    }
    if (!newComment.trim()) return
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, body: newComment.trim() }),
      })
      if (!res.ok) return
      const data = await res.json()
      setComments(prev => [...prev, data])
      setCount(prev => prev + 1)
      setNewComment('')
    } catch {
      // silently ignore network errors
    }
  }

  async function deleteComment(id: string) {
    if (!confirm(t('confirmDelete'))) return
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
      if (!res.ok) return
      setComments(prev => prev.filter(c => c.id !== id))
      setCount(prev => prev - 1)
    } catch {
      // silently ignore
    }
  }

  async function saveEdit(id: string) {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: editBody }),
      })
      if (!res.ok) {
        setEditingId(null)
        return
      }
      const data = await res.json()
      setComments(prev => prev.map(c => c.id === id ? { ...c, body: data.body } : c))
      setEditingId(null)
    } catch {
      setEditingId(null)
    }
  }

  return (
    <div className="mt-2">
      {!expanded ? (
        <button
          onClick={loadComments}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600"
        >
          {loading ? '...' : tPost('comments', { count })}
        </button>
      ) : (
        <div className="space-y-2 mt-2">
          {comments.map(comment => (
            <div key={comment.id} className="text-sm">
              {editingId === comment.id ? (
                <div className="flex gap-2">
                  <input
                    value={editBody}
                    onChange={e => setEditBody(e.target.value)}
                    className="flex-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800"
                  />
                  <button onClick={() => saveEdit(comment.id)} className="text-indigo-600 text-xs">{t('send')}</button>
                  <button onClick={() => setEditingId(null)} className="text-gray-400 text-xs">✕</button>
                </div>
              ) : (
                <div className="flex items-start gap-1">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 shrink-0">
                    {comment.users.display_name}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 flex-1">{comment.body}</span>
                  {(comment.user_id === currentUserId || isAdmin) && (
                    <div className="flex gap-1 ml-1 shrink-0">
                      {comment.user_id === currentUserId && (
                        <button
                          onClick={() => { setEditingId(comment.id); setEditBody(comment.body) }}
                          className="text-xs text-gray-400 hover:text-indigo-600"
                        >
                          {t('edit')}
                        </button>
                      )}
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="text-xs text-gray-400 hover:text-red-500"
                      >
                        {t('delete')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <form onSubmit={submitComment} className="flex gap-2 mt-3">
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onFocus={() => { if (currentUserId === null) onGuestAction?.() }}
              placeholder={t('placeholder')}
              readOnly={currentUserId === null}
              className="flex-1 text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={currentUserId !== null && !newComment.trim()}
              className="text-sm font-semibold text-indigo-600 disabled:opacity-40"
            >
              {t('send')}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
