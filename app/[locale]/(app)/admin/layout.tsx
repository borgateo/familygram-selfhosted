import { redirect } from 'next/navigation'
import { AuthError, requireAdmin } from '@/lib/auth/session'
import { getTranslations } from 'next-intl/server'
import { AdminTabs } from '@/components/admin/AdminTabs'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(error.status === 401 ? `/${locale}/login` : `/${locale}/feed`)
    }
    throw error
  }

  const t = await getTranslations('admin')

  return (
    <main className="max-w-lg mx-auto px-4 pt-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('title')}</h1>
      <AdminTabs locale={locale} />
      {children}
    </main>
  )
}
