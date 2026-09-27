// app/[locale]/(app)/admin/invites/page.tsx
import { requireAdmin } from '@/lib/auth/session'
import { sql } from '@/lib/db'
import { getConfig } from '@/lib/config'
import { InviteList, type InviteData } from '@/components/admin/InviteList'

export default async function AdminInvitesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireAdmin()
  const invites = await sql<InviteData[]>`
    select id, token, created_at, expires_at, used_by from invites order by created_at desc
  `

  const appUrl = getConfig().appUrl

  return (
    <InviteList
      initialInvites={invites}
      appUrl={appUrl}
      locale={locale}
    />
  )
}
