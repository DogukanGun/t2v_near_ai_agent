'use client'

import { useEffect, useState } from 'react'
import MobileButton from '../components/ui/MobileButton'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    if (isOnline) {
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-200">
      <div className="w-full max-w-md">
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-6 text-center">
            <h2 className="card-title justify-center text-xl mb-2">
              {isOnline ? "Connection Restored!" : "You're Offline"}
            </h2>
            
            <p className="text-base-content/70 mb-6">
              {isOnline 
                ? "Your connection has been restored. You can now access all lending features."
                : "Some lending features may not be available while you're offline. We'll sync your data when you reconnect."
              }
            </p>

            {/* Offline icon */}
            <div className="flex justify-center mb-6">
              {isOnline ? (
                <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-success-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              ) : (
                <div className="w-20 h-20 bg-error rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-error-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
                  </svg>
                </div>
              )}
            </div>

            {/* Offline features */}
            {!isOnline && (
              <div className="bg-base-200 p-4 rounded-lg border border-base-300 mb-6">
                <h3 className="font-semibold mb-3 text-sm">Available Offline:</h3>
                <ul className="text-sm text-base-content/70 space-y-2">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    View cached lending data
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Review loan history
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Calculate loan estimates
                  </li>
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-3">
              <MobileButton
                onClick={handleRetry}
                variant={isOnline ? "primary" : "outline"}
                fullWidth
                disabled={!isOnline}
              >
                {isOnline ? "Continue to App" : "Retry Connection"}
              </MobileButton>

              <MobileButton
                onClick={() => window.history.back()}
                variant="ghost"
                fullWidth
              >
                Go Back
              </MobileButton>
            </div>

            {/* Network status indicator */}
            <div className="flex items-center justify-center gap-2 text-xs text-base-content/50 mt-4">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success' : 'bg-error'}`}></div>
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}