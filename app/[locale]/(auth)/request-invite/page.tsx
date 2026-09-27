'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function RequestInvitePage() {
  const t = useTranslations('requestInvite')
  const tCommon = useTranslations('common')
  const { locale } = useParams<{ locale: string }>()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/invite-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error === 'invalid_email' ? t('errorEmail') : t('errorRequired'))
        return
      }
      setSuccess(true)
    } catch {
      setError(t('errorRequired'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <p className="text-gray-700 dark:text-gray-300 text-sm">{t('success')}</p>
        <Link
          href={`/${locale}/feed`}
          className="inline-block text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
        >
          {tCommon('backToFeed')}
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">{t('title')}</h1>
      <Input
        label={t('name')}
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <Input
        label={t('email')}
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <Input
        label={t('message')}
        type="text"
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" loading={loading}>
        {t('submit')}
      </Button>
    </form>
  )
}
