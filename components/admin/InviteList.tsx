// components/admin/InviteList.tsx
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Copy, Check, Trash2 } from 'lucide-react'

export interface InviteData {
  id: string
  token: string
  created_at: string
  expires_at: string
  used_by: string | null
}

function inviteStatus(invite: InviteData): 'active' | 'used' | 'expired' {
  if (invite.used_by) return 'used'
  if (new Date(invite.expires_at) < new Date()) return 'expired'
  return 'active'
}

function StatusBadge({ status }: { status: 'active' | 'used' | 'expired' }) {
  const t = useTranslations('admin')
  const styles = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    used: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    expired: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
  }
  const labels = { active: t('statusActive'), used: t('statusUsed'), expired: t('statusExpired') }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

function CopyButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)
  const t = useTranslations('admin')

  async function handleCopy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? t('copied') : t('copyLink')}
    </button>
  )
}

export function InviteList({
  initialInvites,
  appUrl,
  locale,
}: {
  initialInvites: InviteData[]
  appUrl: string
  locale: string
}) {
  const [invites, setInvites] = useState<InviteData[]>(initialInvites)
  const [creating, setCreating] = useState(false)
  const t = useTranslations('admin')

  async function handleCreate() {
    setCreating(true)
    try {
      const res = await fetch('/api/admin/invites', { method: 'POST' })
      if (res.ok) {
        const { invite } = await res.json()
        setInvites(prev => [invite, ...prev])
      }
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke(id: string) {
    const res = await fetch(`/api/admin/invites/${id}`, { method: 'DELETE' })
    if (res.ok) setInvites(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleCreate}
        disabled={creating}
        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm disabled:opacity-50"
      >
        {creating ? '...' : t('newInvite')}
      </button>

      {invites.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm">{t('noInvites')}</p>
      )}

      <ul className="space-y-3">
        {invites.map(invite => {
          const status = inviteStatus(invite)
          const link = `${appUrl}/${locale}/register?token=${invite.token}`
          return (
            <li
              key={invite.id}
              className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <StatusBadge status={status} />
                {status === 'active' && (
                  <button
                    onClick={() => handleRevoke(invite.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={t('revoke')}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('expires')}: {new Date(invite.expires_at).toLocaleDateString()}
              </p>
              {status === 'active' && <CopyButton link={link} />}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
