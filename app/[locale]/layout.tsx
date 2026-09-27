import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { ProgressBar } from '@/components/layout/ProgressBar'
import { getSessionUser } from '@/lib/auth/session'
import { sql } from '@/lib/db'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()
  const user = await getSessionUser()

  let theme: 'light' | 'dark' | 'system' = 'system'
  if (user) {
    const rows = await sql<{ theme: typeof theme }[]>`select theme from users where id = ${user.id}`
    theme = rows[0]?.theme ?? 'system'
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider theme={theme}>
        <ProgressBar />
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
