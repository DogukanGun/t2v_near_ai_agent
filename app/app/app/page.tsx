'use client'

import { useEffect } from 'react'

export default function MythOSApp() {
  useEffect(() => {
    // Redirect to external URL
    window.location.href = 'https://6e0907dab094d1512a9b569584b75b0ac17fa88f-5678.dstack-prod5.phala.network/form/e59e78eb-05e0-4c94-b53b-15c9e83045f5'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg mb-4"></div>
        <p className="text-lg">Redirecting to MythOS App...</p>
        <p className="text-sm text-base-content/70 mt-2">
          If you are not redirected automatically, 
          <a 
            href="https://6e0907dab094d1512a9b569584b75b0ac17fa88f-5678.dstack-prod5.phala.network/form/e59e78eb-05e0-4c94-b53b-15c9e83045f5" 
            className="link link-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            click here
          </a>
        </p>
      </div>
    </div>
  )
}