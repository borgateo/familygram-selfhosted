// app/[locale]/(auth)/register/page.tsx
import { sql } from '@/lib/db'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getTranslations } from 'next-intl/server'

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ token?: string; error?: string }>
}) {
  const { locale } = await params
  const { token, error } = await searchParams
  const t = await getTranslations('auth')

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-gray-600 dark:text-gray-400">{t('inviteRequired')}</p>
      </div>
    )
  }

  const inviteToken = token

  const invites = await sql<{ id: string; used_by: string | null; expires_at: Date }[]>`
    select id, used_by, expires_at from invites where token = ${inviteToken} limit 1
  `
  const invite = invites[0]
  if (!invite || invite.used_by || new Date(invite.expires_at) < new Date()) {
    const msg = invite?.used_by ? t('tokenUsed') : t('invalidToken')
    return (
      <div className="text-center">
        <p className="text-red-500">{msg}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <form action="/api/auth/register" method="post" className="space-y-3">
        {error && (
          <p className="text-sm text-red-500 text-center">
            {error === 'duplicate' ? t('emailOrUsernameTaken') : t('registrationError')}
          </p>
        )}
        <Input id="display_name" name="display_name" label={t('displayName')} required />
        <Input id="username" name="username" label={t('username')} required />
        <Input id="email" name="email" type="email" label={t('email')} required />
        <Input id="password" name="password" type="password" label={t('password')} required minLength={8} />
        <input type="hidden" name="token" value={inviteToken} />
        <input type="hidden" name="locale" value={locale} />
        <Button type="submit">{t('register')}</Button>
      </form>
    </div>
  )
}
