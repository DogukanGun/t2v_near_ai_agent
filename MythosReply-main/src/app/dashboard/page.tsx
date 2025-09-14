'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import TwitterAccountModal from '@/components/TwitterAccountModal'
import CreateReplyJobModal from '@/components/CreateReplyJobModal'
import AIPlaygroundModal from '@/components/AIPlaygroundModal'
import MultipleProfileDemo from '@/components/MultipleProfileDemo'
import TwitterAnalyticsDashboard from '@/components/TwitterAnalyticsDashboard'
import TwitterMonitoringDashboard from '@/components/TwitterMonitoringDashboard'
import TwitterProfileTracker from '@/components/TwitterProfileTracker'

interface TwitterAccount {
  id: string
  twitterUsername: string
  isActive: boolean
  createdAt: string
}

interface ReplyJob {
  id: string
  targetTweetId?: string
  targetUsername?: string
  targetUsernames?: string[]
  keywords: string[]
  replyText: string
  useAI: boolean
  aiTone?: string
  maxReplies: number
  currentReplies: number
  isActive: boolean
  twitterAccount: {
    twitterUsername: string
  }
  createdAt: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [twitterAccounts, setTwitterAccounts] = useState<TwitterAccount[]>([])
  const [replyJobs, setReplyJobs] = useState<ReplyJob[]>([])
  const [loading, setLoading] = useState(true)
  const [twitterAccountModalOpen, setTwitterAccountModalOpen] = useState(false)
  const [createJobModalOpen, setCreateJobModalOpen] = useState(false)
  const [aiPlaygroundModalOpen, setAIPlaygroundModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      try {
        const response = await fetch('/api/auth/validate', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          localStorage.removeItem('token')
          router.push('/auth/login')
          return
        }
        
        const { user } = await response.json()
        setUser(user)
        await loadData(token)
      } catch (error) {
        console.error('Auth validation error:', error)
        localStorage.removeItem('token')
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const loadData = async (token: string) => {
    try {
      // Load Twitter accounts
      const accountsResponse = await fetch('/api/twitter/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (accountsResponse.ok) {
        const accounts = await accountsResponse.json()
        setTwitterAccounts(accounts)
      }

      // Load reply jobs
      const jobsResponse = await fetch('/api/reply-jobs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (jobsResponse.ok) {
        const jobs = await jobsResponse.json()
        setReplyJobs(jobs)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    toast.success('Logged out successfully')
    router.push('/')
  }

  const refreshData = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      await loadData(token)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const activeJobs = replyJobs.filter(job => job.isActive)
  const totalReplies = replyJobs.reduce((sum, job) => sum + job.currentReplies, 0)
  const aiEnabledJobs = replyJobs.filter(job => job.useAI).length

  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow border-b border-gray-300/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="pixel-cat" style={{transform: 'scale(0.8)'}}></div>
              <div className="mythos-logo">
                <span className="mythos-logo-text">myth.os</span>
                <div className="mythos-logo-icon"></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.username}!</span>
              <Link
                href="/docs"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                API Docs
              </Link>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">T</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">Twitter Accounts</dt>
                    <dd className="text-lg font-medium text-gray-800">{twitterAccounts.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-accent-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">A</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">Active Jobs</dt>
                    <dd className="text-lg font-medium text-gray-800">{activeJobs.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-400 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">R</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">Total Replies</dt>
                    <dd className="text-lg font-medium text-gray-800">{totalReplies}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-accent-600 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">AI</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">AI Jobs</dt>
                    <dd className="text-lg font-medium text-gray-800">{aiEnabledJobs}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Multiple Profile Demo */}
        <div className="mb-8">
          <MultipleProfileDemo />
        </div>

        {/* App-Only Monitoring Dashboard */}
        <div className="mb-8">
          <TwitterMonitoringDashboard />
        </div>

        {/* Profile Tracker Dashboard */}
        <div className="mb-8">
          <TwitterProfileTracker />
        </div>

        {/* Quick Actions */}
        <div className="card mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setTwitterAccountModalOpen(true)}
                className="btn-primary py-3 px-4 text-center transition duration-200"
              >
                Add Twitter Account
              </button>
              <button
                onClick={() => setCreateJobModalOpen(true)}
                className="bg-accent-600 hover:bg-accent-700 text-white font-bold py-3 px-4 rounded-lg text-center transition duration-200"
              >
                Create Reply Job
              </button>
              <button
                onClick={() => setAIPlaygroundModalOpen(true)}
                className="bg-primary-400 hover:bg-primary-500 text-white font-bold py-3 px-4 rounded-lg text-center transition duration-200"
              >
                AI Playground
              </button>
            </div>
          </div>
        </div>

        {/* Twitter Accounts */}
        {twitterAccounts.length > 0 && (
          <div className="card mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Connected Twitter Accounts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {twitterAccounts.map((account) => (
                  <div key={account.id} className="border border-gray-300 rounded-lg p-4 bg-white/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">@{account.twitterUsername}</h4>
                        <p className="text-sm text-gray-600">
                          Added {new Date(account.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        account.isActive 
                          ? 'bg-accent-100 text-accent-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {account.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Twitter Analytics Dashboard */}
        <div className="mb-8">
          <TwitterAnalyticsDashboard />
        </div>

        {/* Recent Reply Jobs */}
        {replyJobs.length > 0 && (
          <div className="card">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Reply Jobs</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Target
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        AI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {replyJobs.slice(0, 5).map((job) => (
                      <tr key={job.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                          @{job.twitterAccount.twitterUsername}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {job.targetUsernames && job.targetUsernames.length > 0 && 
                            `@${job.targetUsernames.join(', @')}`}
                          {!job.targetUsernames && job.targetUsername && `@${job.targetUsername}`}
                          {job.targetTweetId && 'Specific Tweet'}
                          {job.keywords.length > 0 && job.keywords.join(', ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {job.useAI ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {job.aiTone || 'AI'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Manual
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {job.currentReplies}/{job.maxReplies}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            job.isActive 
                              ? 'bg-accent-100 text-accent-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {job.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {twitterAccounts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🐦</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Twitter accounts connected</h3>
            <p className="text-gray-600 mb-6">
              Get started by connecting your first Twitter account to begin automating replies.
            </p>
            <button
              onClick={() => setTwitterAccountModalOpen(true)}
              className="btn-primary py-2 px-4"
            >
              Connect Twitter Account
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <TwitterAccountModal
        isOpen={twitterAccountModalOpen}
        onClose={() => setTwitterAccountModalOpen(false)}
        onSuccess={refreshData}
      />
      <CreateReplyJobModal
        isOpen={createJobModalOpen}
        onClose={() => setCreateJobModalOpen(false)}
        onSuccess={refreshData}
      />
      <AIPlaygroundModal
        isOpen={aiPlaygroundModalOpen}
        onClose={() => setAIPlaygroundModalOpen(false)}
      />
    </div>
  )
}
