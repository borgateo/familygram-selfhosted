import { redirect } from 'next/navigation'
import { AuthError, requireUser } from '@/lib/auth/session'
import { BottomNav } from '@/components/layout/BottomNav'
import { InstallBanner } from '@/components/layout/InstallBanner'

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  let user
  try {
    user = await requireUser()
  } catch (error) {
    if (error instanceof AuthError) redirect(`/${locale}/login`)
    throw error
  }

  const isAdmin = user.role === 'admin'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {children}
      <InstallBanner />
      <BottomNav locale={locale} isAdmin={isAdmin} />
    </div>
  )
}
