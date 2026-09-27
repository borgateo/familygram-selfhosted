import { FeedList } from '@/components/feed/FeedList'
import { listFeed } from '@/features/posts/feed'
import { requireUser } from '@/lib/auth/session'

export default async function FeedPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await requireUser()
  const feed = await listFeed(user.id)

  return (
    <main className="max-w-lg mx-auto px-4 pt-4">
      <FeedList
        initialPosts={feed.posts}
        initialCursor={feed.nextCursor}
        currentUserId={user.id}
        isAdmin={user.role === 'admin'}
        locale={locale}
      />
    </main>
  )
}
