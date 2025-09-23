'use client'

import { useNetworkStatus } from '../hooks/useNetworkStatus'

export default function MobileNetworkIndicator() {
  const { isOnline, isSlowConnection, effectiveType } = useNetworkStatus()

  if (isOnline && !isSlowConnection) {
    return null // Don't show indicator when connection is good
  }

  return (
    <div className={`
      fixed top-16 left-2 right-2 z-40 
      ${isOnline ? 'bg-warning' : 'bg-error'} 
      text-white px-3 py-2 rounded-lg shadow-lg
      flex items-center gap-2 text-sm
      animate-slide-down
    `}>
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-warning-content' : 'bg-error-content'}`}></div>
      
      {!isOnline ? (
        <span>You&apos;re offline. Some features may be limited.</span>
      ) : isSlowConnection ? (
        <span>Slow connection detected ({effectiveType}). Consider using Wi-Fi.</span>
      ) : null}
      
      <div className="ml-auto">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
  )
}