import { notFound, redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { requireUser } from '@/lib/auth/session'
import { sql } from '@/lib/db'
import { getPresignedGetUrl } from '@/lib/storage'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileGrid } from '@/components/profile/ProfileGrid'

export default async function OtherProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id: profileId } = await params
  const t = await getTranslations('profile')
  const currentUser = await requireUser()

  // Redirect to own profile if viewing self
  if (profileId === currentUser.id) {
    redirect(`/${locale}/profile`)
  }

  // Check if caller is admin
  const isAdmin = currentUser.role === 'admin'

  // Fetch target user profile
  const profiles = await sql<Array<{
    id: string; display_name: string; username: string; family_role: string | null
    avatar_url: string | null; created_at: Date
  }>>`
    select id, display_name, username, family_role, avatar_url, created_at
    from users where id = ${profileId}
  `
  const profile = profiles[0]
  if (!profile) notFound()

  // Fetch target user posts
  let rawPosts: Array<{ id: string; thumb_url: string; media_url: string; type: string; filter: string | null }> = []
  try {
    const posts = await sql<typeof rawPosts>`
      select id, thumb_url, media_url, type, filter from posts
      where user_id = ${profileId} order by created_at desc
    `
    rawPosts = posts.filter(p => p.thumb_url)
  } catch {
    rawPosts = []
  }

  // Presign avatar
  let avatarUrl: string | null = null
  if (profile.avatar_url) {
    try {
      avatarUrl = await getPresignedGetUrl(profile.avatar_url)
    } catch {
      avatarUrl = null
    }
  }

  // Presign post thumbnails + media
  const gridPosts = await Promise.all(
    rawPosts.map(async post => {
      try {
        const [thumbUrl, mediaUrl] = await Promise.all([
          getPresignedGetUrl(post.thumb_url),
          getPresignedGetUrl(post.media_url),
        ])
        return { id: post.id, thumbUrl, mediaUrl, type: post.type as 'photo' | 'video', filter: post.filter }
      } catch {
        return null
      }
    })
  ).then(results => results.filter((p): p is { id: string; thumbUrl: string; mediaUrl: string; type: 'photo' | 'video'; filter: string | null } => p !== null))

  // Format member since date
  const memberSince = new Date(profile.created_at).toLocaleDateString(
    locale === 'pt-BR' ? 'pt-BR' : 'it-IT',
    { month: 'long', year: 'numeric' }
  )

  return (
    <main className="max-w-lg mx-auto px-4 pt-4 pb-4">
      <ProfileHeader
        user={{
          id: profile.id,
          display_name: profile.display_name,
          username: profile.username,
          family_role: profile.family_role,
          avatar_url: profile.avatar_url,
        }}
        avatarUrl={avatarUrl}
        postCount={rawPosts.length}
        memberSince={memberSince}
        canEdit={isAdmin}
        isOwnProfile={false}
      />

      <ProfileGrid posts={gridPosts} noPosts={t('noPosts')} />
    </main>
  )
}
