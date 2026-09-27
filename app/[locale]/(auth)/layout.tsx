// app/[locale]/(auth)/layout.tsx
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('common')
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">
          FamilyGram
        </h1>
        <div className="text-center mb-8">
          <Link
            href={`/${locale}/feed`}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {t('backToFeed')}
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
