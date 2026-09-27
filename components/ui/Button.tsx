// components/ui/Button.tsx
import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const base = 'w-full py-3 px-4 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-50'
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white',
    ghost: 'text-indigo-600 dark:text-indigo-400',
  }

  return (
    <button
      type={type}
      className={cn(base, variants[variant], className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? <span aria-hidden="true">...</span> : children}
    </button>
  )
}
