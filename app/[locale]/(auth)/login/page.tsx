// app/[locale]/(auth)/login/page.tsx
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getTranslations } from 'next-intl/server'

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { locale } = await params
  const { error } = await searchParams
  const t = await getTranslations('auth')

  return (
    <div className="space-y-4">
      <form action="/api/auth/login" method="post" className="space-y-3">
        {error && (
          <p className="text-sm text-red-500 text-center">
            {error === 'invalid_credentials' ? t('invalidCredentials') : decodeURIComponent(error)}
          </p>
        )}
        <Input id="identifier" name="identifier" label={t('identifier')} required autoComplete="username" />
        <Input id="password" name="password" type="password" label={t('password')} required autoComplete="current-password" />
        <input type="hidden" name="locale" value={locale} />
        <Button type="submit">{t('login')}</Button>
      </form>
    </div>
  )
}
