// components/admin/RelationshipList.tsx
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Trash2 } from 'lucide-react'

const RELATIONSHIP_TYPES = [
  'parent', 'child', 'sibling', 'spouse',
  'grandparent', 'grandchild', 'uncle_aunt',
  'nephew_niece', 'cousin', 'other',
]

export interface RelationshipData {
  id: string
  from_user_id: string
  to_user_id: string
  relationship_type: string
  label: string | null
  users: { display_name: string }
  to_user: { display_name: string }
}

export interface SimpleUser {
  id: string
  display_name: string
}

export function RelationshipList({
  initialRelationships,
  users,
}: {
  initialRelationships: RelationshipData[]
  users: SimpleUser[]
}) {
  const t = useTranslations('admin')
  const [relationships, setRelationships] = useState<RelationshipData[]>(initialRelationships)
  const [fromUserId, setFromUserId] = useState('')
  const [toUserId, setToUserId] = useState('')
  const [relType, setRelType] = useState('parent')
  const [label, setLabel] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    if (!fromUserId || !toUserId || fromUserId === toUserId) return
    setAdding(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_user_id: fromUserId, to_user_id: toUserId, relationship_type: relType, label }),
      })
      if (res.status === 409) { setError(t('relationshipExists')); return }
      if (!res.ok) { setError(t('serverError')); return }
      const listRes = await fetch('/api/admin/relationships')
      if (listRes.ok) {
        const { relationships: updated } = await listRes.json()
        setRelationships(updated)
      }
      setFromUserId(''); setToUserId(''); setLabel('')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/relationships/${id}`, { method: 'DELETE' })
    if (res.ok) setRelationships(prev => prev.filter(r => r.id !== id))
  }

  const selectClass = 'flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm space-y-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('addRelationship')}</p>
        <div className="flex gap-2">
          <select value={fromUserId} onChange={e => setFromUserId(e.target.value)} className={selectClass}>
            <option value="">{t('from')}</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.display_name}</option>)}
          </select>
          <select value={toUserId} onChange={e => setToUserId(e.target.value)} className={selectClass}>
            <option value="">{t('to')}</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.display_name}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <select value={relType} onChange={e => setRelType(e.target.value)} className={selectClass}>
            {RELATIONSHIP_TYPES.map(type => (
              <option key={type} value={type}>
                {t(`relationshipTypes.${type}` as Parameters<typeof t>[0])}
              </option>
            ))}
          </select>
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder={t('label')}
            className={selectClass}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          onClick={handleAdd}
          disabled={adding || !fromUserId || !toUserId}
          className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm disabled:opacity-50"
        >
          {adding ? '...' : t('add')}
        </button>
      </div>

      {relationships.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm">{t('noRelationships')}</p>
      )}
      <ul className="space-y-2">
        {relationships.map(rel => (
          <li key={rel.id} className="bg-white dark:bg-gray-900 rounded-xl px-4 py-3 shadow-sm flex items-center justify-between">
            <p className="text-sm text-gray-800 dark:text-gray-200">
              <span className="font-semibold">{rel.users.display_name}</span>
              {' → '}
              <span className="text-indigo-600 dark:text-indigo-400">
                {rel.label || t(`relationshipTypes.${rel.relationship_type}` as Parameters<typeof t>[0])}
              </span>
              {' → '}
              <span className="font-semibold">{rel.to_user.display_name}</span>
            </p>
            <button
              onClick={() => handleDelete(rel.id)}
              className="text-gray-400 hover:text-red-500 transition-colors ml-3 shrink-0"
              aria-label={t('delete')}
            >
              <Trash2 size={15} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
