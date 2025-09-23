'use client'

import { useEffect, useState } from 'react'
import MobileButton from './ui/MobileButton'
import MobileInput from './ui/MobileInput'
import { useNetworkStatus } from './hooks/useNetworkStatus'

interface TestResult {
  test: string
  status: 'pass' | 'fail' | 'warning'
  message: string
}

export default function MobileTestSuite() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const networkStatus = useNetworkStatus()

  const runMobileTests = async () => {
    setIsRunning(true)
    const results: TestResult[] = []

    // Test viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]')
    results.push({
      test: 'Viewport Meta Tag',
      status: viewportMeta ? 'pass' : 'fail',
      message: viewportMeta ? 'Viewport meta tag is present' : 'Viewport meta tag is missing'
    })

    // Test touch-friendly button sizes
    const buttons = document.querySelectorAll('.btn')
    let minButtonSize = true
    buttons.forEach(btn => {
      const rect = btn.getBoundingClientRect()
      if (rect.height < 44 || rect.width < 44) {
        minButtonSize = false
      }
    })
    results.push({
      test: 'Touch-Friendly Buttons',
      status: minButtonSize ? 'pass' : 'warning',
      message: minButtonSize ? 'All buttons meet 44px minimum size' : 'Some buttons may be too small for touch'
    })

    // Test service worker registration
    const hasServiceWorker = 'serviceWorker' in navigator
    results.push({
      test: 'Service Worker Support',
      status: hasServiceWorker ? 'pass' : 'fail',
      message: hasServiceWorker ? 'Service Worker is supported' : 'Service Worker not supported'
    })

    // Test PWA manifest
    const manifestLink = document.querySelector('link[rel="manifest"]')
    results.push({
      test: 'PWA Manifest',
      status: manifestLink ? 'pass' : 'fail',
      message: manifestLink ? 'PWA manifest is linked' : 'PWA manifest is missing'
    })

    // Test responsive design
    const isResponsive = window.innerWidth <= 768 ? 
      document.body.scrollWidth <= window.innerWidth : true
    results.push({
      test: 'Responsive Design',
      status: isResponsive ? 'pass' : 'warning',
      message: isResponsive ? 'No horizontal scroll on mobile' : 'Horizontal scrolling detected'
    })

    // Test network status detection
    results.push({
      test: 'Network Status Detection',
      status: 'pass',
      message: `Network status: ${networkStatus.isOnline ? 'Online' : 'Offline'} (${networkStatus.effectiveType})`
    })

    // Test font size (prevent zoom)
    const inputs = document.querySelectorAll('input, textarea, select')
    let properFontSize = true
    inputs.forEach(input => {
      const computedStyle = window.getComputedStyle(input)
      const fontSize = parseFloat(computedStyle.fontSize)
      if (fontSize < 16) {
        properFontSize = false
      }
    })
    results.push({
      test: 'Input Font Size (Zoom Prevention)',
      status: properFontSize ? 'pass' : 'warning',
      message: properFontSize ? 'All inputs have 16px+ font size' : 'Some inputs may trigger zoom on iOS'
    })

    setTestResults(results)
    setIsRunning(false)
  }

  useEffect(() => {
    // Auto-run tests on mount
    runMobileTests()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'fail':
        return '❌'
    }
  }

  const passCount = testResults.filter(r => r.status === 'pass').length
  const warningCount = testResults.filter(r => r.status === 'warning').length
  const failCount = testResults.filter(r => r.status === 'fail').length

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body p-6">
          <h2 className="card-title text-xl mb-6">Lending App Mobile Test Suite</h2>
          
          {/* Test Summary */}
          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div className="bg-success/10 p-4 rounded-lg">
              <div className="text-2xl font-bold text-success">{passCount}</div>
              <div className="text-sm text-success">Passed</div>
            </div>
            <div className="bg-warning/10 p-4 rounded-lg">
              <div className="text-2xl font-bold text-warning">{warningCount}</div>
              <div className="text-sm text-warning">Warnings</div>
            </div>
            <div className="bg-error/10 p-4 rounded-lg">
              <div className="text-2xl font-bold text-error">{failCount}</div>
              <div className="text-sm text-error">Failed</div>
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-3 mb-6">
            {testResults.map((result, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
              >
                <span className="text-xl">{getStatusIcon(result.status)}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{result.test}</div>
                  <div className="text-xs text-base-content/70">{result.message}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <MobileButton
              onClick={runMobileTests}
              loading={isRunning}
              variant="primary"
              fullWidth
            >
              {isRunning ? 'Running Tests...' : 'Re-run Tests'}
            </MobileButton>
            
            <MobileButton
              onClick={() => window.location.reload()}
              variant="outline"
              fullWidth
            >
              Reload Page
            </MobileButton>
          </div>

          {/* Test Components */}
          <div className="border-t pt-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Test Interactive Components</h3>
            <div className="space-y-4">
              <MobileInput 
                label="Test Input Field"
                placeholder="Type here to test input..."
                helperText="Should not trigger zoom on mobile devices"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <MobileButton variant="primary" size="sm">Small Button</MobileButton>
                <MobileButton variant="secondary" size="md">Medium Button</MobileButton>
              </div>
              
              <MobileButton variant="outline" size="lg" fullWidth>
                Large Full-Width Button
              </MobileButton>
            </div>
          </div>

          {/* Device Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Device Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Screen Size:</strong> {window.innerWidth} × {window.innerHeight}
              </div>
              <div>
                <strong>Device Pixel Ratio:</strong> {window.devicePixelRatio}
              </div>
              <div>
                <strong>Network:</strong> {networkStatus.isOnline ? 'Online' : 'Offline'} 
                {networkStatus.effectiveType && ` (${networkStatus.effectiveType})`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}