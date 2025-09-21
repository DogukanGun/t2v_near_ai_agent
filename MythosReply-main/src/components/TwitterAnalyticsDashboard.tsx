'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  UserGroupIcon, 
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  ClockIcon,
  HashtagIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface TrendingTopic {
  topic: string
  count: number
  sentiment: number
}

interface ProfileAnalytics {
  username: string
  displayName?: string
  followersCount: number
  avgLikesPerTweet: number
  avgRepliesPerTweet: number
  avgRetweetsPerTweet: number
  engagementRate: number
  postingFrequency: number
  mostActiveHours: number[]
  topTopics: string[]
  verified: boolean
}

interface OverviewData {
  totalTweets: number
  recentTweets: number
  averageSentiment: number
  topProfiles: { username: string; tweetCount: number }[]
}

export default function TwitterAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'trending' | 'profiles'>('overview')
  const [loading, setLoading] = useState(false)
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null)
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [selectedProfile, setSelectedProfile] = useState<string>('')
  const [profileAnalytics, setProfileAnalytics] = useState<ProfileAnalytics | null>(null)
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day')

  useEffect(() => {
    if (activeTab === 'overview') {
      loadOverviewData()
    } else if (activeTab === 'trending') {
      loadTrendingData()
    }
  }, [activeTab, timeframe])

  const loadOverviewData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/twitter/analysis?type=overview', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setOverviewData(result.data)
      }
    } catch (error) {
      console.error('Failed to load overview data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTrendingData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/twitter/analysis?type=trending&timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setTrendingTopics(result.data.topics)
      }
    } catch (error) {
      console.error('Failed to load trending data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProfileAnalytics = async (username: string) => {
    if (!username) return
    
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/twitter/analysis?type=profile&username=${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setProfileAnalytics(result.data)
      }
    } catch (error) {
      console.error('Failed to load profile analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.2) return <FaceSmileIcon className="h-5 w-5 text-green-500" />
    if (sentiment < -0.2) return <FaceFrownIcon className="h-5 w-5 text-red-500" />
    return <SparklesIcon className="h-5 w-5 text-gray-500" />
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.2) return 'text-green-600 bg-green-50'
    if (sentiment < -0.2) return 'text-red-600 bg-red-50'
    return 'text-gray-600 bg-gray-50'
  }

  const formatEngagementRate = (rate: number) => {
    return (rate * 100).toFixed(2) + '%'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ChartBarIcon className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Twitter Analytics</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as 'day' | 'week' | 'month')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
          
          <button
            onClick={() => {
              if (activeTab === 'overview') loadOverviewData()
              else if (activeTab === 'trending') loadTrendingData()
            }}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-white text-indigo-600 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'trending'
              ? 'bg-white text-indigo-600 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Trending Topics
        </button>
        <button
          onClick={() => setActiveTab('profiles')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'profiles'
              ? 'bg-white text-indigo-600 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Profile Analytics
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && overviewData && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Total Tweets</p>
                  <p className="text-2xl font-bold text-blue-900">{overviewData.totalTweets.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Recent Tweets</p>
                  <p className="text-2xl font-bold text-green-900">{overviewData.recentTweets.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center">
                {getSentimentIcon(overviewData.averageSentiment)}
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">Avg Sentiment</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {overviewData.averageSentiment.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-600">Active Profiles</p>
                  <p className="text-2xl font-bold text-orange-900">{overviewData.topProfiles.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Most Active Profiles</h3>
            <div className="space-y-2">
              {overviewData.topProfiles.slice(0, 8).map((profile, index) => (
                <div key={profile.username} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 w-6">#{index + 1}</span>
                    <span className="font-medium text-gray-900">@{profile.username}</span>
                  </div>
                  <span className="text-sm text-gray-600">{profile.tweetCount} tweets</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trending Topics Tab */}
      {activeTab === 'trending' && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Trending Topics</h3>
            <span className="text-sm text-gray-500">Last {timeframe}</span>
          </div>
          
          {trendingTopics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <HashtagIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No trending topics found for this timeframe</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingTopics.map((topic, index) => (
                <div key={topic.topic} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <HashtagIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <h4 className="font-medium text-gray-900 truncate">{topic.topic}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{topic.count} mentions</p>
                    </div>
                    <div className="flex items-center ml-2">
                      {getSentimentIcon(topic.sentiment)}
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(topic.sentiment)}`}>
                        {topic.sentiment.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((topic.count / Math.max(...trendingTopics.map(t => t.count))) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile Analytics Tab */}
      {activeTab === 'profiles' && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Enter username (without @)"
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => loadProfileAnalytics(selectedProfile)}
              disabled={!selectedProfile || loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Analyze
            </button>
          </div>

          {profileAnalytics && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      @{profileAnalytics.username}
                      {profileAnalytics.verified && (
                        <span className="ml-2 text-blue-500">✓</span>
                      )}
                    </h3>
                    {profileAnalytics.displayName && (
                      <p className="text-gray-600">{profileAnalytics.displayName}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Followers</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {profileAnalytics.followersCount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <HeartIcon className="h-6 w-6 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Avg Likes</p>
                      <p className="text-lg font-bold text-green-900">
                        {profileAnalytics.avgLikesPerTweet.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Avg Replies</p>
                      <p className="text-lg font-bold text-blue-900">
                        {profileAnalytics.avgRepliesPerTweet.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Engagement</p>
                      <p className="text-lg font-bold text-purple-900">
                        {formatEngagementRate(profileAnalytics.engagementRate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Most Active Hours
                  </h4>
                  <div className="space-y-2">
                    {profileAnalytics.mostActiveHours.map((hour) => (
                      <div key={hour} className="flex items-center">
                        <span className="text-sm text-gray-600 w-16">
                          {hour.toString().padStart(2, '0')}:00
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 ml-3">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: '60%' }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <HashtagIcon className="h-5 w-5 mr-2" />
                    Top Topics
                  </h4>
                  <div className="space-y-2">
                    {profileAnalytics.topTopics.slice(0, 5).map((topic, index) => (
                      <div key={topic} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">#{topic}</span>
                        <span className="text-xs text-gray-500">#{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Posting Frequency</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {profileAnalytics.postingFrequency.toFixed(1)} tweets/day
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
