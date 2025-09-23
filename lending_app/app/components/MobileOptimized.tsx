'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Lazy load heavy components for better mobile performance
const DynamicThemeSwitcher = dynamic(
  () => import('./ThemeSwitcher'),
  { 
    ssr: false,
    loading: () => <div className="w-10 h-10 bg-base-300 rounded animate-pulse" />
  }
)

// Mobile-optimized loading states
export function MobileLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-4">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="text-base-content/70">Loading...</p>
      </div>
    </div>
  )
}

// Mobile-optimized error boundary
export function MobileErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <Suspense 
      fallback={fallback || <MobileLoader />}
    >
      {children}
    </Suspense>
  )
}

// Performance optimized component wrapper
export function OptimizedComponent({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`${className} will-change-transform`}>
      {children}
    </div>
  )
}

// Export optimized components
export { DynamicThemeSwitcher }