'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Palette, Globe, LogOut } from 'lucide-react'

interface ProfileSettingsProps {
  currentTheme: 'light' | 'dark' | 'system'
  currentLocale: string
  locale: string
}

export function ProfileSettings({ currentTheme, currentLocale, locale }: ProfileSettingsProps) {
  const t = useTranslations('profile')
  const router = useRouter()
  const [theme, setTheme] = useState(currentTheme)
  const [loc, setLoc] = useState(currentLocale)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function patchProfile(patch: Record<string, string>) {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    return res.ok
  }

  async function handleThemeChange(newTheme: 'light' | 'dark' | 'system') {
    setTheme(newTheme)
    setError(null)
    setSaving(true)
    try {
      const ok = await patchProfile({ theme: newTheme })
      if (ok) {
        router.refresh()
      } else {
        setError(t('themeError'))
        setTheme(currentTheme)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleLocaleChange(newLocale: string) {
    setLoc(newLocale)
    setError(null)
    setSaving(true)
    try {
      const ok = await patchProfile({ locale: newLocale })
      if (ok) {
        router.push(`/${newLocale}/profile`)
      } else {
        setError(t('languageError'))
        setLoc(currentLocale)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push(`/${locale}/login`)
  }

  const themeOptions: Array<{ value: 'light' | 'dark' | 'system'; label: string }> = [
    { value: 'light', label: t('themeLight') },
    { value: 'dark', label: t('themeDark') },
    { value: 'system', label: t('themeSystem') },
  ]

  const localeOptions = [
    { value: 'en', label: 'English' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt-BR', label: 'Português (BR)' },
  ]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
        {t('settings')}
      </p>

      {/* Theme */}
      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
        <span className="flex items-center gap-2 text-sm text-gray-900 dark:text-white"><Palette size={16} />{t('theme')}</span>
        <select
          value={theme}
          onChange={e => handleThemeChange(e.target.value as 'light' | 'dark' | 'system')}
          disabled={saving}
          className="text-sm text-indigo-600 dark:text-indigo-400 bg-transparent border-none outline-none cursor-pointer disabled:opacity-50"
        >
          {themeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Language */}
      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
        <span className="flex items-center gap-2 text-sm text-gray-900 dark:text-white"><Globe size={16} />{t('language')}</span>
        <select
          value={loc}
          onChange={e => handleLocaleChange(e.target.value)}
          disabled={saving}
          className="text-sm text-indigo-600 dark:text-indigo-400 bg-transparent border-none outline-none cursor-pointer disabled:opacity-50"
        >
          {localeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full text-left py-3 text-sm font-medium text-red-500 hover:text-red-600"
      >
        <span className="flex items-center gap-2"><LogOut size={16} />{t('logout')}</span>
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}
    </div>
  )
}
