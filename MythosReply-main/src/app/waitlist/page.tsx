'use client'

import { useState } from 'react'
import Link from 'next/link'
import WaitlistForm from '@/components/WaitlistForm'
import { 
  SparklesIcon, 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'

export default function WaitlistPage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [waitlistStats, setWaitlistStats] = useState<{ position: number; estimatedWait: string } | null>(null)

  const handleSuccess = (data: { position: number; estimatedWait: string }) => {
    setWaitlistStats(data)
    setShowSuccess(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 text-indigo-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">MythosReply</h1>
            </div>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link href="/auth/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Twitter
            <span className="text-indigo-600"> Automation</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Automate your Twitter engagement with intelligent replies, multi-profile monitoring, 
            and advanced analytics. Join thousands of creators and businesses already on the waitlist.
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 mb-8">
            <div className="flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2" />
              <span>2,847 people waiting</span>
            </div>
            <div className="flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2" />
              <span>Beta launching soon</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Waitlist Form */}
          <div className="order-2 lg:order-1">
            <WaitlistForm onSuccess={handleSuccess} />
          </div>

          {/* Features */}
          <div className="order-1 lg:order-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Why Join MythosReply?
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Smart Reply Generation
                  </h3>
                  <p className="text-gray-600">
                    AI-powered replies that understand context and maintain your brand voice. 
                    Generate authentic responses that engage your audience naturally.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <UserGroupIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Multi-Profile Monitoring
                  </h3>
                  <p className="text-gray-600">
                    Track tweets from multiple influencers, competitors, or industry leaders. 
                    Never miss important conversations in your space.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <ChartBarIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Advanced Analytics
                  </h3>
                  <p className="text-gray-600">
                    Track engagement metrics, sentiment analysis, and trending topics. 
                    Make data-driven decisions for your Twitter strategy.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Safe & Compliant
                  </h3>
                  <p className="text-gray-600">
                    Built with Twitter's API guidelines in mind. Rate limiting, spam protection, 
                    and user consent ensure your account stays safe.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <LightBulbIcon className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Easy Setup
                  </h3>
                  <p className="text-gray-600">
                    One-click Twitter authentication, intuitive dashboard, and comprehensive 
                    documentation. Get started in minutes, not hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <blockquote className="text-gray-700 italic mb-4">
                "MythosReply has transformed how I engage on Twitter. The AI replies are 
                surprisingly human-like and have helped me grow my following by 300% in just 2 months."
              </blockquote>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold">JS</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">John Smith</p>
                  <p className="text-sm text-gray-500">CEO, TechStartup Inc.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                When will MythosReply launch?
              </h3>
              <p className="text-gray-600">
                We're launching the beta in early 2024. Waitlist members get priority access 
                and exclusive early-bird pricing.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How much will it cost?
              </h3>
              <p className="text-gray-600">
                Pricing starts at $29/month for individuals. Waitlist members get 50% off 
                their first month and access to special beta pricing.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is my Twitter account safe?
              </h3>
              <p className="text-gray-600">
                Absolutely. We follow Twitter's API guidelines strictly and implement 
                rate limiting to ensure your account remains in good standing.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I customize the AI responses?
              </h3>
              <p className="text-gray-600">
                Yes! You can set custom tones, include/exclude hashtags and emojis, 
                and provide specific instructions for different use cases.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <SparklesIcon className="h-6 w-6 mr-2" />
              <span className="text-lg font-semibold">MythosReply</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white">
                Terms
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 MythosReply. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
