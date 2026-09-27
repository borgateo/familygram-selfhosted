// components/layout/InstallBanner.tsx
'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { X, Share, Plus, SquarePlus } from 'lucide-react'

const DISMISSED_KEY = 'pwa-install-dismissed'
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY)
    if (!raw) return false
    return Date.now() - parseInt(raw, 10) < DISMISS_TTL_MS
  } catch {
    return false
  }
}

function dismiss() {
  try {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
  } catch {}
}

type Platform = 'ios' | 'android' | null

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  const isIOS = /iphone|ipad|ipod/i.test(ua)
  const isSafari = /safari/i.test(ua) && !/chrome|chromium|crios|fxios/i.test(ua)
  const isAndroidChrome = /android/i.test(ua) && /chrome/i.test(ua) && !/edg/i.test(ua)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true

  if (isStandalone) return null
  if (isIOS && isSafari) return 'ios'
  if (isAndroidChrome) return 'android'
  return null
}

function IOSInstructions({ onClose }: { onClose: () => void }) {
  const t = useTranslations('pwa')
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-t-2xl p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('iosTitle')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <ol className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">1</span>
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-200">{t('iosStep1')}</p>
              <div className="mt-1 flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                <Share size={16} />
                <span className="text-xs font-medium">{t('iosStep1Hint')}</span>
              </div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">2</span>
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-200">{t('iosStep2')}</p>
              <div className="mt-1 flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <SquarePlus size={16} />
                <span className="text-xs font-medium">{t('iosStep2Hint')}</span>
              </div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">3</span>
            <p className="text-sm text-gray-800 dark:text-gray-200">{t('iosStep3')}</p>
          </li>
        </ol>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm"
        >
          {t('iosGotIt')}
        </button>
      </div>
    </div>
  )
}

export function InstallBanner() {
  const t = useTranslations('pwa')
  const [platform, setPlatform] = useState<Platform>(null)
  const [showModal, setShowModal] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => Promise<void> } | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isDismissed()) return

    const p = detectPlatform()

    if (p === 'android') {
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as Event & { prompt: () => Promise<void> })
        setPlatform('android')
        setVisible(true)
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }

    if (p === 'ios') {
      const frame = requestAnimationFrame(() => {
        setPlatform('ios')
        setVisible(true)
      })
      return () => cancelAnimationFrame(frame)
    }
  }, [])

  async function handleInstall() {
    if (platform === 'ios') {
      setShowModal(true)
      return
    }
    if (platform === 'android' && deferredPrompt) {
      await deferredPrompt.prompt()
      handleDismiss()
    }
  }

  function handleDismiss() {
    dismiss()
    setVisible(false)
    setShowModal(false)
  }

  if (!visible) return null

  return (
    <>
      <div className="fixed bottom-20 left-0 right-0 z-40 px-4">
        <div className="max-w-lg mx-auto bg-indigo-600 text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg">
          <Plus size={20} className="shrink-0" />
          <p className="flex-1 text-sm font-medium">{t('bannerText')}</p>
          <button
            onClick={handleInstall}
            className="shrink-0 bg-white text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-lg"
          >
            {t('bannerCta')}
          </button>
          <button onClick={handleDismiss} className="shrink-0 opacity-70 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      </div>

      {showModal && platform === 'ios' && (
        <IOSInstructions onClose={handleDismiss} />
      )}
    </>
  )
}
