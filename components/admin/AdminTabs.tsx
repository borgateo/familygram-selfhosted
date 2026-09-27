'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

export function AdminTabs({ locale }: { locale: string }) {
  const pathname = usePathname()
  const t = useTranslations('admin')

  const tabs = [
    { href: `/${locale}/admin/invites`, label: t('invites') },
    { href: `/${locale}/admin/invite-requests`, label: t('inviteRequests') },
    { href: `/${locale}/admin/users`, label: t('users') },
    { href: `/${locale}/admin/relationships`, label: t('relationships') },
  ]

  return (
    <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-800">
      {tabs.map(tab => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            pathname.startsWith(tab.href)
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
