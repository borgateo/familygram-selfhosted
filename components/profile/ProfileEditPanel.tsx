'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Camera } from 'lucide-react'
import { Input } from '@/components/ui/Input'

interface ProfileEditPanelProps {
  userId: string
  isOwnProfile: boolean
  initialData: {
    display_name: string
    username: string | null
    family_role: string | null
    avatar_url: string | null
  }
  currentAvatarUrl: string | null
  onClose: () => void
}

export function ProfileEditPanel({
  userId,
  isOwnProfile,
  initialData,
  currentAvatarUrl,
  onClose,
}: ProfileEditPanelProps) {
  const t = useTranslations('profile')
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState(initialData.display_name)
  const [username, setUsername] = useState(initialData.username ?? '')
  const [familyRole, setFamilyRole] = useState(initialData.family_role ?? '')
  const [pendingAvatarKey, setPendingAvatarKey] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const blobUrlRef = useRef<string | null>(null)

  const initial = displayName?.[0]?.toUpperCase() ?? '?'

  // Revoke blob URL on unmount
  useEffect(() => () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current) }, [])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      if (!isOwnProfile) form.append('userId', userId)

      const res = await fetch('/api/profile/avatar', { method: 'POST', body: form })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? t('uploadError'))
        return
      }
      const { key } = await res.json()
      setPendingAvatarKey(key)
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
      const blobUrl = URL.createObjectURL(file)
      blobUrlRef.current = blobUrl
      setPreviewUrl(blobUrl)
    } catch {
      setError(t('uploadError'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const body: Record<string, string> = {
        display_name: displayName,
        username,
        family_role: familyRole,
      }
      if (pendingAvatarKey) body.avatar_url = pendingAvatarKey

      const url = isOwnProfile ? '/api/profile' : `/api/profile/${userId}`
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? t('saveError'))
        return
      }
      onClose()
      router.refresh()
    } catch {
      setError(t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setDisplayName(initialData.display_name)
    setUsername(initialData.username ?? '')
    setFamilyRole(initialData.family_role ?? '')
    setPendingAvatarKey(null)
    setPreviewUrl(currentAvatarUrl)
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setError(null)
    onClose()
  }

  return (
    <div className="mt-3 bg-white dark:bg-gray-900 rounded-2xl p-4 space-y-4">
      {/* Avatar upload */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
          {t('changePhoto')}
        </p>
        <div className="flex items-center gap-3">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
              {initial}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-sm bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 disabled:opacity-50 text-gray-700 dark:text-gray-300"
          >
            {uploading ? '...' : <span className="flex items-center gap-1.5"><Camera size={14} />{t('changePhoto')}</span>}
          </button>
        </div>
      </div>

      <Input
        label={t('displayName')}
        value={displayName}
        onChange={e => setDisplayName(e.target.value)}
      />
      <Input
        label={t('username')}
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <Input
        label={t('familyRole')}
        value={familyRole}
        onChange={e => setFamilyRole(e.target.value)}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button variant="secondary" onClick={handleCancel} disabled={saving} className="flex-1">
          {t('cancel')}
        </Button>
        <Button onClick={handleSave} loading={saving} className="flex-1">
          {t('save')}
        </Button>
      </div>
    </div>
  )
}
