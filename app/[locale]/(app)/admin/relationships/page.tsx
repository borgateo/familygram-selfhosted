// app/[locale]/(app)/admin/relationships/page.tsx
import { requireAdmin } from '@/lib/auth/session'
import { sql } from '@/lib/db'
import { RelationshipList, type RelationshipData, type SimpleUser } from '@/components/admin/RelationshipList'

export default async function AdminRelationshipsPage() {
  await requireAdmin()
  const [relationships, users] = await Promise.all([
    sql<RelationshipData[]>`
      select r.id, r.from_user_id, r.to_user_id, r.relationship_type, r.label,
        json_build_object('display_name', f.display_name) as users,
        json_build_object('display_name', t.display_name) as to_user
      from family_relationships r
      join users f on f.id = r.from_user_id
      join users t on t.id = r.to_user_id
      order by r.created_at asc
    `,
    sql<SimpleUser[]>`select id, display_name from users where disabled = false order by display_name asc`,
  ])

  return (
    <RelationshipList
      initialRelationships={relationships}
      users={users}
    />
  )
}
