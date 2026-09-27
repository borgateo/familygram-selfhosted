'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LayoutGrid, PlusSquare, User, ShieldCheck } from 'lucide-react'

export function BottomNav({ locale, isAdmin }: { locale: string; isAdmin: boolean }) {
  const pathname = usePathname()
  const t = useTranslations('nav')

  const tabs = [
    { href: `/${locale}/feed`, label: t('feed'), icon: LayoutGrid },
    { href: `/${locale}/post/new`, label: t('newPost'), icon: PlusSquare },
    { href: `/${locale}/profile`, label: t('profile'), icon: User },
    ...(isAdmin ? [{ href: `/${locale}/admin`, label: t('admin'), icon: ShieldCheck }] : []),
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around py-3 z-50">
      {tabs.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex flex-col items-center gap-1 text-xs ${
            pathname.startsWith(href)
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <Icon size={22} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  )
}
