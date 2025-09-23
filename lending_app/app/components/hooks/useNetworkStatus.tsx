'use client'

import { useState, useEffect } from 'react'

interface NetworkStatus {
  isOnline: boolean
  isSlowConnection: boolean
  effectiveType: string
  downlink: number
}

interface NetworkConnection {
  effectiveType?: string
  downlink?: number
  addEventListener?: (type: string, listener: () => void) => void
  removeEventListener?: (type: string, listener: () => void) => void
}

export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: true,
    isSlowConnection: false,
    effectiveType: '4g',
    downlink: 10
  })

  useEffect(() => {
    // Initial status
    const updateNetworkStatus = () => {
      // Type-safe connection access - safely check for network connection API
      const nav = navigator as unknown as { connection?: NetworkConnection; mozConnection?: NetworkConnection; webkitConnection?: NetworkConnection }
      const connection = nav.connection || nav.mozConnection || nav.webkitConnection
      
      setNetworkStatus({
        isOnline: navigator.onLine,
        isSlowConnection: connection ? (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') : false,
        effectiveType: connection?.effectiveType || '4g',
        downlink: connection?.downlink || 10
      })
    }

    updateNetworkStatus()

    const handleOnline = () => {
      updateNetworkStatus()
    }

    const handleOffline = () => {
      setNetworkStatus(prev => ({ ...prev, isOnline: false }))
    }

    const handleConnectionChange = () => {
      updateNetworkStatus()
    }

    // Event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    const nav = navigator as unknown as { connection?: NetworkConnection; mozConnection?: NetworkConnection; webkitConnection?: NetworkConnection }
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection
    if (connection?.addEventListener) {
      connection.addEventListener('change', handleConnectionChange)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (connection?.removeEventListener) {
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [])

  return networkStatus
}

// Hook for offline storage management
export function useOfflineStorage() {
  const saveOfflineData = (key: string, data: unknown) => {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.warn('Failed to save offline data:', error)
    }
  }

  const getOfflineData = (key: string) => {
    try {
      const stored = localStorage.getItem(`offline_${key}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.data
      }
    } catch (error) {
      console.warn('Failed to get offline data:', error)
    }
    return null
  }

  const clearOfflineData = (key?: string) => {
    try {
      if (key) {
        localStorage.removeItem(`offline_${key}`)
      } else {
        // Clear all offline data
        Object.keys(localStorage)
          .filter(k => k.startsWith('offline_'))
          .forEach(k => localStorage.removeItem(k))
      }
    } catch (error) {
      console.warn('Failed to clear offline data:', error)
    }
  }

  return {
    saveOfflineData,
    getOfflineData,
    clearOfflineData
  }
}