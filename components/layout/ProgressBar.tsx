'use client'
import { useEffect, useRef, useState, Suspense } from 'react'
import { usePathname } from 'next/navigation'

function Bar() {
  const pathname = usePathname()
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevPathname = useRef(pathname)

  // Start bar on link click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return
      // same page — skip
      const path = href.split('?')[0]
      if (path === pathname) return

      setVisible(true)
      setWidth(30)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setWidth(70), 300)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [pathname])

  // Complete bar when pathname changes
  useEffect(() => {
    if (prevPathname.current === pathname) return
    prevPathname.current = pathname

    const frame = requestAnimationFrame(() => {
      setWidth(100)
      timerRef.current = setTimeout(() => {
        setVisible(false)
        setWidth(0)
      }, 300)
    })

    return () => cancelAnimationFrame(frame)
  }, [pathname])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        width: `${width}%`,
        background: '#4f46e5',
        zIndex: 9999,
        transition: width === 100 ? 'width 0.15s ease' : 'width 0.4s ease',
        borderRadius: '0 2px 2px 0',
      }}
    />
  )
}

export function ProgressBar() {
  return (
    <Suspense>
      <Bar />
    </Suspense>
  )
}
