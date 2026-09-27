'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ProfileEditPanel } from './ProfileEditPanel'

interface ProfileHeaderProps {
  user: {
    id: string
    display_name: string
    username: string | null
    family_role: string | null
    avatar_url: string | null
  }
  avatarUrl: string | null
  postCount: number
  memberSince: string
  canEdit: boolean
  isOwnProfile: boolean
}

export function ProfileHeader({
  user,
  avatarUrl,
  postCount,
  memberSince,
  canEdit,
  isOwnProfile,
}: ProfileHeaderProps) {
  const t = useTranslations('profile')
  const [isEditing, setIsEditing] = useState(false)

  const initial = user.display_name?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="mb-3">
      {/* Header card */}
      <div className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl p-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user.display_name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
              {initial}
            </div>
          )}
        </div>

        {/* Name / username / role */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 dark:text-white truncate">{user.display_name}</p>
          {user.username && (
            <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
          )}
          {user.family_role && (
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
              {user.family_role}
            </p>
          )}
        </div>

        {/* Edit button — only shown if canEdit and not currently editing */}
        {canEdit && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-1.5 flex-shrink-0"
          >
            {t('editProfile')}
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-3 text-center">
          <p className="font-semibold text-gray-900 dark:text-white">
            {t('posts', { count: postCount })}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('memberSince')}</p>
          <p className="font-bold text-gray-900 dark:text-white text-sm">{memberSince}</p>
        </div>
      </div>

      {/* Inline edit panel — shown below stats when editing */}
      {isEditing && (
        <ProfileEditPanel
          userId={user.id}
          isOwnProfile={isOwnProfile}
          initialData={{
            display_name: user.display_name,
            username: user.username,
            family_role: user.family_role,
            avatar_url: user.avatar_url,
          }}
          currentAvatarUrl={avatarUrl}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  )
}
