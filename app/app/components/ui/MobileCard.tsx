'use client'

import { ReactNode } from 'react'

interface MobileCardProps {
  children: ReactNode
  title?: string
  subtitle?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  bordered?: boolean
  compact?: boolean
  clickable?: boolean
  onClick?: () => void
  className?: string
}

export default function MobileCard({
  children,
  title,
  subtitle,
  padding = 'md',
  shadow = 'md',
  rounded = 'lg',
  bordered = true,
  compact = false,
  clickable = false,
  onClick,
  className = ''
}: MobileCardProps) {
  const baseClasses = `
    card
    bg-base-100
    transition-all duration-200
    w-full
  `

  const paddingClasses = {
    none: '',
    sm: 'card-body p-3 sm:p-4',
    md: 'card-body p-4 sm:p-6',
    lg: 'card-body p-6 sm:p-8'
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl'
  }

  const interactiveClasses = clickable ? `
    cursor-pointer 
    hover:shadow-lg 
    active:scale-[0.98]
    touch-manipulation
    select-none
  ` : ''

  const classes = `
    ${baseClasses}
    ${shadowClasses[shadow]}
    ${roundedClasses[rounded]}
    ${bordered ? 'border border-base-300' : ''}
    ${compact ? 'card-compact' : ''}
    ${interactiveClasses}
    ${className}
  `.replace(/\s+/g, ' ').trim()

  const CardContent = () => (
    <>
      {(title || subtitle) && (
        <div className="card-title flex-col items-start gap-1 mb-3">
          {title && (
            <h2 className="text-lg sm:text-xl font-bold text-base-content">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm sm:text-base font-normal text-base-content/70">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="w-full">
        {children}
      </div>
    </>
  )

  if (padding === 'none') {
    return (
      <div className={classes} onClick={clickable ? onClick : undefined}>
        <CardContent />
      </div>
    )
  }

  return (
    <div className={classes} onClick={clickable ? onClick : undefined}>
      <div className={paddingClasses[padding]}>
        <CardContent />
      </div>
    </div>
  )
}