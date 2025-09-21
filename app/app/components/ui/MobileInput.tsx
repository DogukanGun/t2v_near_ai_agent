'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface MobileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'bordered' | 'ghost'
  fullWidth?: boolean
}

const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(({
  label,
  error,
  helperText,
  size = 'md',
  variant = 'bordered',
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  const baseClasses = `
    input
    transition-all duration-200
    touch-manipulation
    min-h-[44px]
    rounded-lg
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    focus:ring-primary
    disabled:opacity-50
    disabled:cursor-not-allowed
  `

  const variants = {
    default: 'input-primary',
    bordered: 'input-bordered',
    ghost: 'input-ghost'
  }

  const sizes = {
    sm: 'input-sm min-h-[40px] text-sm',
    md: 'input-md min-h-[44px] text-base',
    lg: 'input-lg min-h-[48px] text-lg'
  }

  const inputClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${error ? 'input-error border-error' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim()

  return (
    <div className={`form-control ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="label">
          <span className="label-text font-medium text-sm sm:text-base">
            {label}
          </span>
        </label>
      )}
      
      <input
        ref={ref}
        className={inputClasses}
        {...props}
      />
      
      {(error || helperText) && (
        <label className="label">
          <span className={`label-text-alt text-xs sm:text-sm ${
            error ? 'text-error' : 'text-base-content/70'
          }`}>
            {error || helperText}
          </span>
        </label>
      )}
    </div>
  )
})

MobileInput.displayName = 'MobileInput'

export default MobileInput