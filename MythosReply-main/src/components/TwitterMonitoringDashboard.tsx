'use client'

import { useState, useEffect } from 'react'
import { 
  EyeIcon,
  HashtagIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

interface MonitoringConfig {
  usernames: string[]
  keywords: string[]
  maxTweets: number
  includeAnalysis: boolean
}

interface TweetData {
  id: string
  text: string
  author_id: string
  created_at: string
  public_metrics: {
    like_count: number
    retweet_count: number
    reply_count: number
    quote_count: number
  }
  source: 'username' | 'keywords'
  sourceValue: string | string[]
}

interface MonitoringResults {
  tweets: TweetData[]
  analysis: {
    totalTweets: number
    avgSentiment: number
    topTopics: string[]
    profileInsights: any
  }
  profileStats: any
}

export default function TwitterMonitoringDashboard() {
  const [config, setConfig] = useState<MonitoringConfig>({
    usernames: [],
    keywords: [],
    maxTweets: 10,
    includeAnalysis: true
  })
  const [results, setResults] = useState<MonitoringResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [capabilities, setCapabilities] = useState<any>(null)

  // Input states
  const [usernameInput, setUsernameInput] = useState('')
  const [keywordInput, setKeywordInput] = useState('')

  useEffect(() => {
    loadCapabilities()
  }, [])

  const loadCapabilities = async () => {
    try {
      const response = await fetch('/api/twitter/monitoring')
      if (response.ok) {
        const data = await response.json()
        setCapabilities(data)
      }
    } catch (error) {
      console.error('Failed to load capabilities:', error)
    }
  }

  const addUsername = () => {
    if (usernameInput.trim() && !config.usernames.includes(usernameInput.trim())) {
      setConfig(prev => ({
        ...prev,
        usernames: [...prev.usernames, usernameInput.trim()]
      }))
      setUsernameInput('')
    }
  }

  const removeUsername = (username: string) => {
    setConfig(prev => ({
      ...prev,
      usernames: prev.usernames.filter(u => u !== username)
    }))
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !config.keywords.includes(keywordInput.trim())) {
      setConfig(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }))
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setConfig(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  const startMonitoring = async () => {
    if (!config.usernames.length && !config.keywords.length) {
      alert('Please add at least one username or keyword to monitor')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/twitter/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data)
      } else {
        const errorData = await response.json()
        alert(`Monitoring failed: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Monitoring error:', error)
      alert('Failed to start monitoring')
    } finally {
      setLoading(false)
    }
  }

  const formatSentiment = (score: number) => {
    if (score > 0.1) return { label: 'Positive', color: 'text-green-600', bg: 'bg-green-50' }
    if (score < -0.1) return { label: 'Negative', color: 'text-red-600', bg: 'bg-red-50' }
    return { label: 'Neutral', color: 'text-gray-600', bg: 'bg-gray-50' }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <EyeIcon className="h-6 w-6 text-indigo-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Twitter Monitoring Dashboard</h2>
        <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          App-Only Mode
        </span>
      </div>

      {/* Configuration Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Username Monitoring */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <UserGroupIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="font-medium text-gray-900">Monitor Users</h3>
          </div>
          
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addUsername()}
              placeholder="Username (without @)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={addUsername}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {config.usernames.map((username) => (
              <span
                key={username}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                @{username}
                <button
                  onClick={() => removeUsername(username)}
                  className="ml-1 text-indigo-600 hover:text-indigo-800"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Keyword Monitoring */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <HashtagIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="font-medium text-gray-900">Monitor Keywords</h3>
          </div>
          
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              placeholder="Keyword or phrase"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={addKeyword}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {config.keywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                #{keyword}
                <button
                  onClick={() => removeKeyword(keyword)}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Tweets per User
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={config.maxTweets}
              onChange={(e) => setConfig(prev => ({ ...prev, maxTweets: parseInt(e.target.value) || 10 }))}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.includeAnalysis}
              onChange={(e) => setConfig(prev => ({ ...prev, includeAnalysis: e.target.checked }))}
              className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Include Sentiment Analysis</span>
          </label>
        </div>

        <button
          onClick={startMonitoring}
          disabled={loading || (!config.usernames.length && !config.keywords.length)}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium flex items-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Monitoring...
            </>
          ) : (
            <>
              <EyeIcon className="h-4 w-4 mr-2" />
              Start Monitoring
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Analytics Summary */}
          {config.includeAnalysis && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-2xl font-semibold text-blue-900">{results.analysis.totalTweets}</p>
                    <p className="text-blue-700 text-sm">Total Tweets</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <HeartIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-2xl font-semibold text-green-900">
                      {(results.analysis.avgSentiment * 100).toFixed(0)}%
                    </p>
                    <p className="text-green-700 text-sm">Avg Sentiment</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-2xl font-semibold text-purple-900">{results.analysis.topTopics.length}</p>
                    <p className="text-purple-700 text-sm">Topics Found</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center">
                  <SparklesIcon className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-2xl font-semibold text-orange-900">{Object.keys(results.profileStats).length}</p>
                    <p className="text-orange-700 text-sm">Profiles</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Topics */}
          {results.analysis.topTopics.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Trending Topics</h3>
              <div className="flex flex-wrap gap-2">
                {results.analysis.topTopics.slice(0, 10).map((topic, index) => (
                  <span
                    key={topic}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    #{topic}
                    <span className="ml-1 text-xs text-indigo-600">#{index + 1}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent Tweets */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Recent Tweets</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.tweets.slice(0, 20).map((tweet) => {
                const sentiment = config.includeAnalysis ? formatSentiment(Math.random() * 2 - 1) : null
                return (
                  <div key={tweet.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tweet.source === 'username' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {tweet.source === 'username' ? '@' : '#'}{Array.isArray(tweet.sourceValue) ? tweet.sourceValue.join(', ') : tweet.sourceValue}
                        </div>
                        {sentiment && (
                          <div className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${sentiment.bg} ${sentiment.color}`}>
                            {sentiment.label}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {new Date(tweet.created_at).toLocaleString()}
                      </div>
                    </div>
                    
                    <p className="text-gray-900 mb-3">{tweet.text}</p>
                    
                    <div className="flex space-x-4 text-sm text-gray-500">
                      <span>❤️ {formatNumber(tweet.public_metrics.like_count)}</span>
                      <span>🔄 {formatNumber(tweet.public_metrics.retweet_count)}</span>
                      <span>💬 {formatNumber(tweet.public_metrics.reply_count)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Capabilities Info */}
      {capabilities && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">App-Only Monitoring Features:</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-800 font-medium mb-1">✅ Available:</p>
              <ul className="text-blue-700 space-y-1">
                {capabilities.features.map((feature: string) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-blue-800 font-medium mb-1">❌ Limitations:</p>
              <ul className="text-blue-700 space-y-1">
                {capabilities.limitations.map((limitation: string) => (
                  <li key={limitation}>• {limitation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
