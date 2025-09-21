'use client'

import { useState, useEffect } from 'react'
import { 
  PlusIcon,
  TrashIcon,
  EyeIcon,
  UserIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface TrackedProfile {
  userName: string
  addedAt: string
  isActive: boolean
  lastChecked?: string
}

interface ProfileTweet {
  id: string
  text: string
  createdAt: string
  retweetCount: number
  replyCount: number
  likeCount: number
  quoteCount: number
  viewCount: number
  author: {
    userName: string
    name: string
    profilePicture: string
    followers: number
    following: number
    isBlueVerified: boolean
  }
}

interface ProfileTweetsResponse {
  tweets?: ProfileTweet[]
  has_next_page?: boolean
  next_cursor?: string
  status?: 'success' | 'error'
  message?: string
  data?: {
    tweets?: ProfileTweet[]
    has_next_page?: boolean
    next_cursor?: string
    status?: 'success' | 'error'
    message?: string
  }
}

const getDateRangeInDays = (range: '1day' | '3days' | 'custom', customStart?: string, customEnd?: string): { startDate: Date; endDate: Date } => {
  const now = new Date()
  const endDate = new Date(now)
  
  let startDate: Date
  
  switch (range) {
    case '1day':
      startDate = new Date(now.getTime() - (24 * 60 * 60 * 1000))
      break
    case '3days':
      startDate = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000))
      break
    case 'custom':
      if (customStart && customEnd) {
        startDate = new Date(customStart)
        endDate.setTime(new Date(customEnd).getTime())
      } else {
        // Fallback to 3 days if custom dates are invalid
        startDate = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000))
      }
      break
    default:
      startDate = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000))
  }
  
  return { startDate, endDate }
}

const filterTweetsByDateRange = (tweets: ProfileTweet[], startDate: Date, endDate: Date): ProfileTweet[] => {
  return tweets.filter(tweet => {
    const tweetDate = new Date(tweet.createdAt)
    return tweetDate >= startDate && tweetDate <= endDate
  })
}

export default function TwitterProfileTracker() {
  const [profiles, setProfiles] = useState<TrackedProfile[]>([])
  const [newProfileInput, setNewProfileInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([])
  const [aggregatedTweets, setAggregatedTweets] = useState<(ProfileTweet & { profileSource: string })[]>([])
  const [tweetsLoading, setTweetsLoading] = useState(false)
  const [includeReplies, setIncludeReplies] = useState(false)
  const [viewMode, setViewMode] = useState<'single' | 'multi'>('single')
  const [selectedProfile, setSelectedProfile] = useState<string>('') // Keep for single mode
  const [profileTweets, setProfileTweets] = useState<ProfileTweet[]>([]) // Keep for single mode
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [dateRange, setDateRange] = useState<'1day' | '3days' | 'custom'>('3days')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  useEffect(() => {
    // Load saved profiles from localStorage for now
    const savedProfiles = localStorage.getItem('trackedProfiles')
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles))
    }
  }, [])

  // Auto-refresh tweets when date range changes
  useEffect(() => {
    if (selectedProfile && profileTweets.length > 0) {
      // Re-apply filters to existing tweets without making new API call
      const { startDate, endDate } = getDateRangeInDays(dateRange, customStartDate, customEndDate)
      // For now, we'll just show a notification that filters changed
      // In a production app, you might want to automatically refresh
    }
  }, [dateRange, customStartDate, customEndDate])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const addProfile = async () => {
    if (!newProfileInput.trim()) {
      showNotification('error', 'Please enter a valid username')
      return
    }

    const userName = newProfileInput.replace('@', '').trim()
    
    if (profiles.some(p => p.userName.toLowerCase() === userName.toLowerCase())) {
      showNotification('error', 'Profile is already being tracked')
      return
    }

    setLoading(true)
    try {
      // Test if profile exists by trying to fetch tweets
      const response = await fetch(`/api/twitter/profile-tracker?userName=${userName}`)
      
      if (!response.ok) {
        throw new Error('Failed to verify profile exists')
      }

      const newProfile: TrackedProfile = {
        userName,
        addedAt: new Date().toISOString(),
        isActive: true,
        lastChecked: new Date().toISOString()
      }

      const updatedProfiles = [...profiles, newProfile]
      setProfiles(updatedProfiles)
      localStorage.setItem('trackedProfiles', JSON.stringify(updatedProfiles))
      
      setNewProfileInput('')
      showNotification('success', `Started tracking @${userName}`)
    } catch (error) {
      showNotification('error', 'Failed to add profile. Please check the username.')
    } finally {
      setLoading(false)
    }
  }

  const removeProfile = (userName: string) => {
    const updatedProfiles = profiles.filter(p => p.userName !== userName)
    setProfiles(updatedProfiles)
    localStorage.setItem('trackedProfiles', JSON.stringify(updatedProfiles))
    
    if (selectedProfile === userName) {
      setSelectedProfile('')
      setProfileTweets([])
    }
    
    showNotification('success', `Stopped tracking @${userName}`)
  }

  const toggleProfileSelection = (userName: string) => {
    if (viewMode === 'multi') {
      setSelectedProfiles(prev => 
        prev.includes(userName) 
          ? prev.filter(p => p !== userName)
          : [...prev, userName]
      )
    } else {
      setSelectedProfile(userName)
    }
  }

  const loadMultipleProfileTweets = async () => {
    if (selectedProfiles.length === 0) {
      showNotification('error', 'Please select at least one profile')
      return
    }

    setTweetsLoading(true)
    const allTweets: (ProfileTweet & { profileSource: string })[] = []
    
    try {
      // Fetch tweets from all selected profiles
      for (const userName of selectedProfiles) {
        try {
          const response = await fetch(
            `/api/twitter/profile-tracker?userName=${userName}&includeReplies=${includeReplies}`
          )
          
          if (response.ok) {
            const data: ProfileTweetsResponse = await response.json()
            console.log(`🔍 Multi-Profile - Response for ${userName}:`, {
              hasTweets: 'tweets' in data,
              tweetsLength: data.tweets?.length,
              status: data.status
            })
            
            // Try to extract tweets similar to single profile loading
            let profileTweets: ProfileTweet[] = []
            if (data.tweets && Array.isArray(data.tweets)) {
              profileTweets = data.tweets
            } else if (data.data && data.data.tweets && Array.isArray(data.data.tweets)) {
              profileTweets = data.data.tweets
            }
            
            if (profileTweets.length > 0) {
              const tweetsWithSource = profileTweets.map((tweet: ProfileTweet) => ({
                ...tweet,
                profileSource: userName
              }))
              allTweets.push(...tweetsWithSource)
              console.log(`✅ Multi-Profile - Added ${profileTweets.length} tweets from ${userName}`)
            } else {
              console.log(`❌ Multi-Profile - No tweets found for ${userName}`)
            }
          } else {
            console.log(`❌ Multi-Profile - HTTP error for ${userName}:`, response.status)
          }
        } catch (error) {
          console.error(`Failed to load tweets for ${userName}:`, error)
        }
      }

      // Apply date filtering
      const { startDate, endDate } = getDateRangeInDays(dateRange, customStartDate, customEndDate)
      const filteredTweets = allTweets.filter(tweet => {
        const tweetDate = new Date(tweet.createdAt)
        return tweetDate >= startDate && tweetDate <= endDate
      })

      // Sort by creation date (newest first)
      const sortedTweets = filteredTweets.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      setAggregatedTweets(sortedTweets)

      // Update last checked time for all selected profiles
      const updatedProfiles = profiles.map(p => 
        selectedProfiles.includes(p.userName)
          ? { ...p, lastChecked: new Date().toISOString() }
          : p
      )
      setProfiles(updatedProfiles)
      localStorage.setItem('trackedProfiles', JSON.stringify(updatedProfiles))

      if (sortedTweets.length === 0) {
        showNotification('error', `No tweets found from ${selectedProfiles.length} selected profiles`)
      } else {
        showNotification('success', `Loaded ${sortedTweets.length} tweets from ${selectedProfiles.length} profiles`)
      }
    } catch (error) {
      showNotification('error', `Failed to load tweets from multiple profiles: ${error}`)
      console.error('Error loading multiple profile tweets:', error)
    } finally {
      setTweetsLoading(false)
    }
  }

  const loadProfileTweets = async (userName: string) => {
    setTweetsLoading(true)
    setSelectedProfile(userName)
    
    try {
      const response = await fetch(
        `/api/twitter/profile-tracker?userName=${userName}&includeReplies=${includeReplies}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to load tweets')
      }
      
      const data: ProfileTweetsResponse = await response.json()
      
      console.log('🔍 ProfileTracker - Raw response type:', typeof data)
      console.log('🔍 ProfileTracker - Response keys:', Object.keys(data))
      console.log('🔍 ProfileTracker - Has tweets property:', 'tweets' in data)
      console.log('🔍 ProfileTracker - Tweets type:', typeof data.tweets)
      console.log('🔍 ProfileTracker - Is tweets array:', Array.isArray(data.tweets))
      console.log('🔍 ProfileTracker - Response status field:', data.status)
      console.log('🔍 ProfileTracker - Response message field:', data.message)
      
      // Try to handle different response structures
      let finalTweets = []
      let responseStatus = 'error'
      let responseMessage = 'Unknown error'
      
      try {
        if (data.tweets && Array.isArray(data.tweets)) {
          finalTweets = data.tweets
          responseStatus = data.status || 'success'
          responseMessage = data.message || 'Success'
          console.log('✅ ProfileTracker - Found tweets directly in response:', finalTweets.length)
        } else if (data.data && data.data.tweets && Array.isArray(data.data.tweets)) {
          finalTweets = data.data.tweets
          responseStatus = data.data.status || 'success'
          responseMessage = data.data.message || 'Success'
          console.log('✅ ProfileTracker - Found tweets in data.tweets:', finalTweets.length)
        } else {
          console.log('❌ ProfileTracker - Could not find tweets array in response')
          console.log('❌ ProfileTracker - Full response structure:', JSON.stringify(data, null, 2))
          throw new Error('No tweets found in API response')
        }
      } catch (parseError) {
        console.error('❌ ProfileTracker - Error parsing response:', parseError)
        throw new Error(`Failed to parse API response: ${parseError}`)
      }
      
      if (responseStatus === 'success') {
        const allTweets = finalTweets || []
        console.log('✅ ProfileTracker - Processing tweets:', allTweets.length)
        
        // Apply date filtering
        const { startDate, endDate } = getDateRangeInDays(dateRange, customStartDate, customEndDate)
        const filteredTweets = filterTweetsByDateRange(allTweets, startDate, endDate)
        
        setProfileTweets(filteredTweets)
        
        // Update last checked time
        const updatedProfiles = profiles.map(p => 
          p.userName === userName 
            ? { ...p, lastChecked: new Date().toISOString() }
            : p
        )
        setProfiles(updatedProfiles)
        localStorage.setItem('trackedProfiles', JSON.stringify(updatedProfiles))
        
        // Show filtering info
        if (filteredTweets.length !== allTweets.length) {
          showNotification('success', `Found ${filteredTweets.length} tweets in selected date range (${allTweets.length} total)`)
        } else {
          showNotification('success', `Loaded ${filteredTweets.length} tweets`)
        }
      } else {
        throw new Error(responseMessage || 'Failed to load tweets')
      }
    } catch (error) {
      showNotification('error', 'Failed to load profile tweets')
      console.error('Error loading profile tweets:', error)
    } finally {
      setTweetsLoading(false)
    }
  }

  const handleReplyToTweet = async (tweetId: string, tweetText: string, authorUsername: string) => {
    // For now, this will open Twitter in a new tab for manual reply
    // In a full implementation, you'd integrate with your Twitter posting API
    const replyUrl = `https://twitter.com/intent/tweet?in_reply_to=${tweetId}&text=@${authorUsername} `
    window.open(replyUrl, '_blank', 'noopener,noreferrer')
    showNotification('success', 'Opened Twitter reply interface')
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 mr-2" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <EyeIcon className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Profile Tracker</h2>
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            TwitterAPI.io
          </span>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">View Mode:</span>
          <button
            onClick={() => {
              setViewMode('single')
              setSelectedProfiles([])
              setAggregatedTweets([])
            }}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'single'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Single Profile
          </button>
          <button
            onClick={() => {
              setViewMode('multi')
              setSelectedProfile('')
              setProfileTweets([])
            }}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'multi'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Multi Profile
          </button>
        </div>
      </div>

      {/* Add Profile Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Add Profile to Track</h3>
        <div className="flex space-x-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter Twitter username (e.g., elonmusk)"
              value={newProfileInput}
              onChange={(e) => setNewProfileInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addProfile()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
          </div>
          <button
            onClick={addProfile}
            disabled={loading || !newProfileInput.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <PlusIcon className="h-4 w-4 mr-2" />
            )}
            Add Profile
          </button>
        </div>
      </div>

      {/* Tracked Profiles List */}
      {profiles.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Tracked Profiles ({profiles.length})
              {viewMode === 'multi' && selectedProfiles.length > 0 && (
                <span className="ml-2 text-sm text-indigo-600">
                  - {selectedProfiles.length} selected
                </span>
              )}
            </h3>
            
            {viewMode === 'multi' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedProfiles(profiles.map(p => p.userName))}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedProfiles([])}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => {
              const isSelected = viewMode === 'multi' 
                ? selectedProfiles.includes(profile.userName)
                : selectedProfile === profile.userName
              
              return (
                <div 
                  key={profile.userName} 
                  className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => viewMode === 'multi' && toggleProfileSelection(profile.userName)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {viewMode === 'multi' && (
                        <input
                          type="checkbox"
                          checked={selectedProfiles.includes(profile.userName)}
                          onChange={() => toggleProfileSelection(profile.userName)}
                          className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                      )}
                      <UserIcon className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="font-medium text-gray-900">@{profile.userName}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeProfile(profile.userName)
                      }}
                      className="text-red-500 hover:text-red-700"
                      title="Remove profile"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    <div>Added: {new Date(profile.addedAt).toLocaleDateString()}</div>
                    {profile.lastChecked && (
                      <div>Last checked: {formatTimeAgo(profile.lastChecked)}</div>
                    )}
                  </div>
                  
                  {viewMode === 'single' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        loadProfileTweets(profile.userName)
                      }}
                      disabled={tweetsLoading && selectedProfile === profile.userName}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center"
                    >
                      {tweetsLoading && selectedProfile === profile.userName ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      ) : (
                        <EyeIcon className="h-4 w-4 mr-2" />
                      )}
                      View Tweets
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Multi-Profile Load Button */}
          {viewMode === 'multi' && (
            <div className="mt-4 text-center">
              <button
                onClick={loadMultipleProfileTweets}
                disabled={tweetsLoading || selectedProfiles.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium flex items-center justify-center mx-auto"
              >
                {tweetsLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading tweets from {selectedProfiles.length} profiles...
                  </>
                ) : (
                  <>
                    <EyeIcon className="h-5 w-5 mr-2" />
                    Load Aggregated Tweets ({selectedProfiles.length} profiles)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tweet Settings */}
      {((viewMode === 'single' && selectedProfile) || (viewMode === 'multi' && selectedProfiles.length > 0)) && (
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Tweet Settings
              {viewMode === 'multi' && (
                <span className="ml-2 text-sm text-indigo-600">
                  ({selectedProfiles.length} profiles selected)
                </span>
              )}
            </h4>
            
            <div className="space-y-4">
              {/* Include Replies */}
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={includeReplies}
                  onChange={(e) => setIncludeReplies(e.target.checked)}
                  className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                Include replies in tweets
              </label>

              {/* Date Range Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { value: '1day', label: 'Last 24 hours' },
                    { value: '3days', label: 'Last 3 days' },
                    { value: 'custom', label: 'Custom range' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDateRange(option.value as '1day' | '3days' | 'custom')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        dateRange === option.value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Custom Date Range Inputs */}
                {dateRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* Date Range Info */}
                <div className="mt-2 text-xs text-gray-500">
                  {(() => {
                    const { startDate, endDate } = getDateRangeInDays(dateRange, customStartDate, customEndDate)
                    return `Filtering tweets from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
                  })()}
                </div>
              </div>

              {/* Apply Filters Button */}
              <button
                onClick={() => {
                  if (viewMode === 'single') {
                    loadProfileTweets(selectedProfile)
                  } else {
                    loadMultipleProfileTweets()
                  }
                }}
                disabled={tweetsLoading}
                className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center"
              >
                {tweetsLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                    Applying filters...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Apply Filters & Refresh
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Profile Tweets Display */}
      {viewMode === 'single' && selectedProfile && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Recent tweets from @{selectedProfile}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <span>📅 {
                  (() => {
                    const { startDate, endDate } = getDateRangeInDays(dateRange, customStartDate, customEndDate)
                    const formatDate = (date: Date) => {
                      const today = new Date()
                      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
                      
                      if (date.toDateString() === today.toDateString()) return 'Today'
                      if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
                      return date.toLocaleDateString()
                    }
                    
                    return `${formatDate(startDate)} → ${formatDate(endDate)}`
                  })()
                }</span>
                <span>🐦 {profileTweets.length} tweets found</span>
                {includeReplies && <span>💬 Replies included</span>}
              </div>
            </div>
            <button
              onClick={() => loadProfileTweets(selectedProfile)}
              disabled={tweetsLoading}
              className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-1 ${tweetsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {tweetsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : profileTweets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No tweets found for this profile</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {profileTweets.map((tweet) => (
                <div key={tweet.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <img 
                        src={tweet.author.profilePicture} 
                        alt={`@${tweet.author.userName}`}
                        className="w-10 h-10 rounded-full mr-3"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{tweet.author.name}</span>
                          {tweet.author.isBlueVerified && (
                            <span className="ml-1 text-blue-500">✓</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">@{tweet.author.userName}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatTimeAgo(tweet.createdAt)}
                    </div>
                  </div>
                  
                  <p className="text-gray-900 mb-3">{tweet.text}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                        {formatNumber(tweet.replyCount)}
                      </div>
                      <div className="flex items-center">
                        <ArrowPathIcon className="h-4 w-4 mr-1" />
                        {formatNumber(tweet.retweetCount)}
                      </div>
                      <div className="flex items-center">
                        <HeartIcon className="h-4 w-4 mr-1" />
                        {formatNumber(tweet.likeCount)}
                      </div>
                      <div className="flex items-center text-xs">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {formatNumber(tweet.viewCount)}
                      </div>
                    </div>
                    
                    {/* Reply Button */}
                    <button
                      onClick={() => handleReplyToTweet(tweet.id, tweet.text, tweet.author.userName)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Multi-Profile Aggregated Tweets Display */}
      {viewMode === 'multi' && selectedProfiles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Aggregated Tweets ({selectedProfiles.length} profiles)
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <span>📅 {
                  (() => {
                    const { startDate, endDate } = getDateRangeInDays(dateRange, customStartDate, customEndDate)
                    const formatDate = (date: Date) => {
                      const today = new Date()
                      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
                      
                      if (date.toDateString() === today.toDateString()) return 'Today'
                      if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
                      return date.toLocaleDateString()
                    }
                    
                    return `${formatDate(startDate)} → ${formatDate(endDate)}`
                  })()
                }</span>
                <span>🐦 {aggregatedTweets.length} total tweets</span>
                <span>👥 @{selectedProfiles.join(', @')}</span>
                {includeReplies && <span>💬 Replies included</span>}
              </div>
            </div>
            <button
              onClick={loadMultipleProfileTweets}
              disabled={tweetsLoading}
              className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-1 ${tweetsLoading ? 'animate-spin' : ''}`} />
              Refresh All
            </button>
          </div>

          {tweetsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading tweets from {selectedProfiles.length} profiles...</p>
            </div>
          ) : aggregatedTweets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No tweets found from the selected profiles</p>
              <p className="text-sm mt-2">Try adjusting your date range or selecting different profiles</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {aggregatedTweets.map((tweet) => (
                <div key={`${tweet.profileSource}-${tweet.id}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <img 
                        src={tweet.author.profilePicture} 
                        alt={`@${tweet.author.userName}`}
                        className="w-10 h-10 rounded-full mr-3"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{tweet.author.name}</span>
                          {tweet.author.isBlueVerified && (
                            <span className="ml-1 text-blue-500">✓</span>
                          )}
                          <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                            tracked
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">@{tweet.author.userName}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatTimeAgo(tweet.createdAt)}
                    </div>
                  </div>
                  
                  <p className="text-gray-900 mb-3">{tweet.text}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                        {formatNumber(tweet.replyCount)}
                      </div>
                      <div className="flex items-center">
                        <ArrowPathIcon className="h-4 w-4 mr-1" />
                        {formatNumber(tweet.retweetCount)}
                      </div>
                      <div className="flex items-center">
                        <HeartIcon className="h-4 w-4 mr-1" />
                        {formatNumber(tweet.likeCount)}
                      </div>
                      <div className="flex items-center text-xs">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {formatNumber(tweet.viewCount)}
                      </div>
                    </div>
                    
                    {/* Reply Button */}
                    <button
                      onClick={() => handleReplyToTweet(tweet.id, tweet.text, tweet.author.userName)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {profiles.length === 0 && (
        <div className="text-center py-12">
          <UserIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles being tracked</h3>
          <p className="text-gray-500 mb-6">
            Add Twitter profiles to track their latest tweets using TwitterAPI.io
          </p>
        </div>
      )}
    </div>
  )
}
