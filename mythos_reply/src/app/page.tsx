'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthService } from '@/lib/services/auth'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const isValid = await AuthService.validateToken(token)
          if (isValid) {
            setIsAuthenticated(true)
            router.push('/dashboard')
          }
        } catch (error) {
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            MythosReply
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Automate Twitter replies across multiple accounts with intelligent targeting and customizable responses.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">Smart Automation</h3>
              <p className="text-gray-600">Automatically reply to tweets based on keywords, usernames, or specific tweet IDs.</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Multi-User Support</h3>
              <p className="text-gray-600">Manage multiple Twitter accounts from a single dashboard with user-specific configurations.</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Analytics & Control</h3>
              <p className="text-gray-600">Track reply performance, set limits, and monitor all automated responses in real-time.</p>
            </div>
          </div>

          <div className="space-x-4">
            <Link
              href="/auth/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              Get Started
            </Link>
            <Link
              href="/api/docs"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              API Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
