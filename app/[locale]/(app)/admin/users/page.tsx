// app/[locale]/(app)/admin/users/page.tsx
import { requireAdmin } from '@/lib/auth/session'
import { sql } from '@/lib/db'
import { UserList, type UserData } from '@/components/admin/UserList'

export default async function AdminUsersPage() {
  const user = await requireAdmin()
  const users = await sql<UserData[]>`
    select id, display_name, username, family_role, role, disabled, created_at
    from users order by created_at asc
  `
  return <UserList users={users} currentUserId={user.id} />
}
