'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface TwitterAccount {
  id: string
  twitterUsername: string
  isActive: boolean
}

interface AIModel {
  id: string
  name: string
  description: string
}

interface ReplyJobForm {
  twitterAccountId: string
  targetType: 'tweet' | 'user' | 'users' | 'keywords'
  targetTweetId?: string
  targetUsername?: string
  targetUsernames?: string
  keywords?: string
  replyText: string
  maxReplies: number
  useAI: boolean
  aiTone?: string
  aiIncludeHashtags?: boolean
  aiIncludeEmojis?: boolean
  aiInstructions?: string
  aiModelId?: string
}

interface CreateReplyJobModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateReplyJobModal({ isOpen, onClose, onSuccess }: CreateReplyJobModalProps) {
  const [loading, setLoading] = useState(false)
  const [twitterAccounts, setTwitterAccounts] = useState<TwitterAccount[]>([])
  const [aiModels, setAIModels] = useState<AIModel[]>([])
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<ReplyJobForm>()

  const targetType = watch('targetType')
  const useAI = watch('useAI')

  useEffect(() => {
    if (isOpen) {
      loadTwitterAccounts()
      loadAIModels()
    }
  }, [isOpen])

  const loadTwitterAccounts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/twitter/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const accounts = await response.json()
        setTwitterAccounts(accounts.filter((acc: TwitterAccount) => acc.isActive))
      }
    } catch (error) {
      console.error('Failed to load Twitter accounts:', error)
    }
  }

  const loadAIModels = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/ai/models', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setAIModels(data.models)
      }
    } catch (error) {
      console.error('Failed to load AI models:', error)
    }
  }

  const onSubmit = async (data: ReplyJobForm) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // Prepare the request body
      const requestBody: any = {
        twitterAccountId: data.twitterAccountId,
        replyText: data.replyText,
        maxReplies: data.maxReplies,
        useAI: data.useAI
      }

      // Add target based on type
      if (data.targetType === 'tweet' && data.targetTweetId) {
        requestBody.targetTweetId = data.targetTweetId
      } else if (data.targetType === 'user' && data.targetUsername) {
        requestBody.targetUsername = data.targetUsername
      } else if (data.targetType === 'users' && data.targetUsernames) {
        requestBody.targetUsernames = data.targetUsernames.split(',').map(u => u.trim()).filter(u => u)
      } else if (data.targetType === 'keywords' && data.keywords) {
        requestBody.keywords = data.keywords.split(',').map(k => k.trim()).filter(k => k)
      }

      // Add AI config if enabled
      if (data.useAI) {
        requestBody.aiConfig = {
          tone: data.aiTone,
          includeHashtags: data.aiIncludeHashtags,
          includeEmojis: data.aiIncludeEmojis,
          customInstructions: data.aiInstructions,
          modelId: data.aiModelId
        }
      }

      const response = await fetch('/api/reply-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create reply job')
      }

      toast.success('Reply job created successfully!')
      reset()
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create reply job')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Create Reply Job</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Twitter Account Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Twitter Account
            </label>
            <select
              {...register('twitterAccountId', { required: 'Please select a Twitter account' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Twitter account...</option>
              {twitterAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  @{account.twitterUsername}
                </option>
              ))}
            </select>
            {errors.twitterAccountId && (
              <p className="mt-1 text-sm text-red-600">{errors.twitterAccountId.message}</p>
            )}
          </div>

          {/* Target Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  {...register('targetType', { required: 'Please select a target type' })}
                  type="radio"
                  value="tweet"
                  className="mr-2"
                />
                Reply to specific tweet ID
              </label>
              <label className="flex items-center">
                <input
                  {...register('targetType')}
                  type="radio"
                  value="user"
                  className="mr-2"
                />
                Monitor single user's tweets
              </label>
              <label className="flex items-center">
                <input
                  {...register('targetType')}
                  type="radio"
                  value="users"
                  className="mr-2"
                />
                Monitor multiple users' tweets
              </label>
              <label className="flex items-center">
                <input
                  {...register('targetType')}
                  type="radio"
                  value="keywords"
                  className="mr-2"
                />
                Monitor keywords
              </label>
            </div>
          </div>

          {/* Target-specific inputs */}
          {targetType === 'tweet' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tweet ID
              </label>
              <input
                {...register('targetTweetId', { required: 'Tweet ID is required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="1234567890123456789"
              />
            </div>
          )}

          {targetType === 'user' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username (without @)
              </label>
              <input
                {...register('targetUsername', { required: 'Username is required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="username"
              />
            </div>
          )}

          {targetType === 'users' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usernames (without @, comma-separated)
              </label>
              <input
                {...register('targetUsernames', { required: 'Usernames are required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="user1, user2, user3"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter multiple usernames separated by commas to monitor tweets from all of them
              </p>
            </div>
          )}

          {targetType === 'keywords' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords (comma-separated)
              </label>
              <input
                {...register('keywords', { required: 'Keywords are required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="crypto, blockchain, web3"
              />
            </div>
          )}

          {/* Reply Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reply Text {useAI && '(Base text for AI enhancement)'}
            </label>
            <textarea
              {...register('replyText', { required: 'Reply text is required' })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={useAI ? "Base message that AI will enhance..." : "Your reply message..."}
            />
          </div>

          {/* Max Replies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Replies
            </label>
            <input
              {...register('maxReplies', { 
                required: 'Max replies is required',
                min: { value: 1, message: 'Must be at least 1' },
                max: { value: 100, message: 'Must be 100 or less' }
              })}
              type="number"
              defaultValue={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* AI Settings */}
          <div className="border-t pt-4">
            <label className="flex items-center mb-4">
              <input
                {...register('useAI')}
                type="checkbox"
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Use AI-powered replies (Free OpenRouter models)
              </span>
            </label>

            {useAI && (
              <div className="space-y-4 bg-purple-50 p-4 rounded-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    AI Tone
                  </label>
                  <select
                    {...register('aiTone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="casual">Casual</option>
                    <option value="professional">Professional</option>
                    <option value="humorous">Humorous</option>
                    <option value="supportive">Supportive</option>
                    <option value="promotional">Promotional</option>
                  </select>
                </div>

                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      {...register('aiIncludeHashtags')}
                      type="checkbox"
                      className="mr-2"
                    />
                    Include hashtags
                  </label>
                  <label className="flex items-center">
                    <input
                      {...register('aiIncludeEmojis')}
                      type="checkbox"
                      className="mr-2"
                    />
                    Include emojis
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    AI Model
                  </label>
                  <select
                    {...register('aiModelId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {aiModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Instructions (Optional)
                  </label>
                  <textarea
                    {...register('aiInstructions')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Additional instructions for the AI..."
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Create Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
