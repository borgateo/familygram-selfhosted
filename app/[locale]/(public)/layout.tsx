// app/[locale]/(public)/layout.tsx
import { getSessionUser } from '@/lib/auth/session'
import { BottomNav } from '@/components/layout/BottomNav'
import { InstallBanner } from '@/components/layout/InstallBanner'
import { redirect } from 'next/navigation'

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await getSessionUser()
  if (!user) redirect(`/${locale}/login`)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {children}
      <InstallBanner />
      <BottomNav locale={locale} isAdmin={user.role === 'admin'} />
    </div>
  )
}
