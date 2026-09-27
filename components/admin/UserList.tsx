// components/admin/UserList.tsx
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export interface UserData {
  id: string
  display_name: string
  username: string
  family_role: string | null
  role: string
  disabled: boolean
  created_at: string
}

function UserRow({
  user,
  currentUserId,
}: {
  user: UserData
  currentUserId: string
}) {
  const t = useTranslations('admin')
  const [disabled, setDisabled] = useState(user.disabled)
  const [familyRole, setFamilyRole] = useState(user.family_role ?? '')
  const [editingRole, setEditingRole] = useState(false)
  const [savingRole, setSavingRole] = useState(false)

  async function toggleDisable() {
    const next = !disabled
    setDisabled(next)
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disabled: next }),
    })
    if (!res.ok) setDisabled(!next)
  }

  async function saveRole() {
    setSavingRole(true)
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ family_role: familyRole }),
    })
    setSavingRole(false)
    setEditingRole(false)
  }

  const isSelf = user.id === currentUserId

  return (
    <li className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {user.display_name}
            {user.role === 'admin' && (
              <span className="ml-2 text-xs text-indigo-500 font-normal">{t('roleAdmin')}</span>
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
        </div>
        {!isSelf && (
          <button
            onClick={toggleDisable}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${
              disabled
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
            }`}
          >
            {disabled ? t('enable') : t('disable')}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {editingRole ? (
          <>
            <input
              value={familyRole}
              onChange={e => setFamilyRole(e.target.value)}
              placeholder={t('familyRole')}
              className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={saveRole}
              disabled={savingRole}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 disabled:opacity-50"
            >
              {t('save')}
            </button>
            <button
              onClick={() => { setFamilyRole(user.family_role ?? ''); setEditingRole(false) }}
              className="text-xs text-gray-400"
            >
              ✕
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditingRole(true)}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            {familyRole || `+ ${t('familyRole')}`}
          </button>
        )}
      </div>
    </li>
  )
}

export function UserList({
  users,
  currentUserId,
}: {
  users: UserData[]
  currentUserId: string
}) {
  const t = useTranslations('admin')

  if (users.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 text-sm">{t('noUsers')}</p>
  }

  return (
    <ul className="space-y-3">
      {users.map(user => (
        <UserRow key={user.id} user={user} currentUserId={currentUserId} />
      ))}
    </ul>
  )
}
