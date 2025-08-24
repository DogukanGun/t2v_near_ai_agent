'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface AIModel {
  id: string
  name: string
  description: string
}

interface AIPlaygroundForm {
  originalTweet: string
  context?: string
  tone: string
  maxLength: number
  includeHashtags: boolean
  includeEmojis: boolean
  customInstructions?: string
  modelId: string
  count: number
}

interface AIPlaygroundModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AIPlaygroundModal({ isOpen, onClose }: AIPlaygroundModalProps) {
  const [loading, setLoading] = useState(false)
  const [aiModels, setAIModels] = useState<AIModel[]>([])
  const [generatedReplies, setGeneratedReplies] = useState<string[]>([])
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AIPlaygroundForm>()

  useEffect(() => {
    if (isOpen) {
      loadAIModels()
    }
  }, [isOpen])

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

  const onSubmit = async (data: AIPlaygroundForm) => {
    setLoading(true)
    setGeneratedReplies([])
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/ai/generate-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate replies')
      }

      setGeneratedReplies(result.replies)
      toast.success(`Generated ${result.replies.length} reply${result.replies.length > 1 ? 'ies' : ''}!`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate replies')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleClose = () => {
    reset()
    setGeneratedReplies([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-900">AI Reply Playground</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Tweet to Reply To
                  </label>
                  <textarea
                    {...register('originalTweet', { required: 'Original tweet is required' })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Paste the tweet you want to reply to..."
                  />
                  {errors.originalTweet && (
                    <p className="mt-1 text-sm text-red-600">{errors.originalTweet.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Context (Optional)
                  </label>
                  <textarea
                    {...register('context')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Any additional context for the reply..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tone
                    </label>
                    <select
                      {...register('tone')}
                      defaultValue="casual"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="casual">Casual</option>
                      <option value="professional">Professional</option>
                      <option value="humorous">Humorous</option>
                      <option value="supportive">Supportive</option>
                      <option value="promotional">Promotional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Length
                    </label>
                    <input
                      {...register('maxLength')}
                      type="number"
                      defaultValue={280}
                      min={50}
                      max={280}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      {...register('includeHashtags')}
                      type="checkbox"
                      className="mr-2"
                    />
                    Include hashtags
                  </label>
                  <label className="flex items-center">
                    <input
                      {...register('includeEmojis')}
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
                    {...register('modelId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                    Number of Variations
                  </label>
                  <select
                    {...register('count')}
                    defaultValue={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Instructions (Optional)
                  </label>
                  <textarea
                    {...register('customInstructions')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Additional instructions for the AI..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Generate Replies
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Generated Replies */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Generated Replies</h4>
              {generatedReplies.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Generate some AI replies to see them here!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {generatedReplies.map((reply, index) => (
                    <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-medium text-purple-600">
                          Variation {index + 1} ({reply.length} chars)
                        </span>
                        <button
                          onClick={() => copyToClipboard(reply)}
                          className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{reply}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <button
              onClick={handleClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
