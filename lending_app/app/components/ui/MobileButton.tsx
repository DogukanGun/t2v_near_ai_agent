'use client'

import { ReactNode } from 'react'

interface MobileButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  className?: string
}

export default function MobileButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  className = ''
}: MobileButtonProps) {
  const baseClasses = `
    btn
    transition-all duration-200
    active:scale-95
    touch-manipulation
    select-none
    min-h-[44px]
    rounded-lg
    font-medium
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    disabled:opacity-50
    disabled:cursor-not-allowed
  `

  const variants = {
    primary: 'btn-primary hover:btn-primary focus:ring-primary',
    secondary: 'btn-secondary hover:btn-secondary focus:ring-secondary', 
    outline: 'btn-outline hover:btn-outline focus:ring-base-300',
    ghost: 'btn-ghost hover:btn-ghost focus:ring-base-300'
  }

  const sizes = {
    sm: 'btn-sm min-h-[40px] px-4 text-sm',
    md: 'btn-md min-h-[44px] px-6 text-base',
    lg: 'btn-lg min-h-[48px] px-8 text-lg'
  }

  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim()

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      type="button"
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <span className="loading loading-spinner loading-sm"></span>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}