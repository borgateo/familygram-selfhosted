// components/feed/PostCard.tsx
import type { ReactNode } from 'react'
import Link from 'next/link'
import { PostMedia } from './PostMedia'
import { LikeButton } from './LikeButton'
import { CommentSection } from './CommentSection'
import { DeletePostButton } from './DeletePostButton'
import type { PostData } from '@/features/posts/types'

function formatRelativeTime(isoDate: string, locale: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return locale === 'it' ? 'adesso' : locale === 'pt-BR' ? 'agora' : 'just now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-9 h-9 rounded-full object-cover bg-gray-200"
      />
    )
  }
  return (
    <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function ProfileLink({
  enabled,
  href,
  children,
  className,
}: {
  enabled: boolean
  href: string
  children: ReactNode
  className?: string
}) {
  return enabled ? (
    <Link href={href} className={className}>{children}</Link>
  ) : (
    <div className={className}>{children}</div>
  )
}

export function PostCard({
  post,
  currentUserId,
  isAdmin,
  locale,
  onDeleted,
  onGuestAction,
}: {
  post: PostData
  currentUserId: string | null
  isAdmin: boolean
  locale: string
  onDeleted: (postId: string) => void
  onGuestAction?: () => void
}) {
  const canDelete = currentUserId !== null && (post.user.id === currentUserId || isAdmin)
  const profileHref = currentUserId !== null && post.user.id === currentUserId
    ? `/${locale}/profile`
    : `/${locale}/profile/${post.user.id}`

  return (
    <article className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm mb-4">
      <div className="flex items-center gap-3 px-4 py-3">
        <ProfileLink enabled={currentUserId !== null} href={profileHref} className="shrink-0">
          <Avatar url={post.user.avatarUrl} name={post.user.displayName} />
        </ProfileLink>
        <ProfileLink enabled={currentUserId !== null} href={profileHref} className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {post.user.displayName}
          </p>
          {post.user.familyRole && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{post.user.familyRole}</p>
          )}
        </ProfileLink>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400">{formatRelativeTime(post.createdAt, locale)}</span>
          {canDelete && (
            <DeletePostButton postId={post.id} onDeleted={() => onDeleted(post.id)} />
          )}
        </div>
      </div>

      <PostMedia
        type={post.type}
        mediaUrl={post.mediaUrl}
        thumbUrl={post.thumbUrl}
        filter={post.filter}
      />

      <div className="px-4 py-3 space-y-2">
        <LikeButton
          postId={post.id}
          initialCount={post.likesCount}
          initialLiked={post.liked}
          currentUserId={currentUserId}
          onGuestAction={onGuestAction}
        />
        {post.caption && (
          <p className="text-sm text-gray-800 dark:text-gray-200">
            <span className="font-semibold mr-1">{post.user.displayName}</span>
            {post.caption}
          </p>
        )}
        <CommentSection
          postId={post.id}
          initialCount={post.commentsCount}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onGuestAction={onGuestAction}
        />
      </div>
    </article>
  )
}
