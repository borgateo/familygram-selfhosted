import { requireAdmin } from '@/lib/auth/session'
import { sql } from '@/lib/db'
import { InviteRequestList, type InviteRequest } from '@/components/admin/InviteRequestList'

export default async function AdminInviteRequestsPage() {
  await requireAdmin()
  const requests = await sql<InviteRequest[]>`
    select id, name, email, message, status, created_at from invite_requests order by created_at desc
  `
  return <InviteRequestList requests={requests} />
}
