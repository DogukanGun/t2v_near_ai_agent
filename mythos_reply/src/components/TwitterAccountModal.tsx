'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface TwitterAccountForm {
  twitterUsername: string
  accessToken: string
  accessTokenSecret: string
}

interface TwitterAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function TwitterAccountModal({ isOpen, onClose, onSuccess }: TwitterAccountModalProps) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<TwitterAccountForm>()

  const onSubmit = async (data: TwitterAccountForm) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/twitter/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add Twitter account')
      }

      toast.success('Twitter account added successfully!')
      reset()
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add Twitter account')
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Add Twitter Account</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Twitter Username
            </label>
            <input
              {...register('twitterUsername', { 
                required: 'Twitter username is required',
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Invalid username format'
                }
              })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="your_twitter_handle"
            />
            {errors.twitterUsername && (
              <p className="mt-1 text-sm text-red-600">{errors.twitterUsername.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Token
            </label>
            <input
              {...register('accessToken', { required: 'Access token is required' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Your Twitter access token"
            />
            {errors.accessToken && (
              <p className="mt-1 text-sm text-red-600">{errors.accessToken.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Token Secret
            </label>
            <input
              {...register('accessTokenSecret', { required: 'Access token secret is required' })}
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Your Twitter access token secret"
            />
            {errors.accessTokenSecret && (
              <p className="mt-1 text-sm text-red-600">{errors.accessTokenSecret.message}</p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">How to get Twitter API credentials:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://developer.twitter.com" target="_blank" className="underline">Twitter Developer Portal</a></li>
              <li>Create a new project and app</li>
              <li>Navigate to "Keys and tokens"</li>
              <li>Generate Access Token and Secret</li>
              <li>Copy the credentials here</li>
            </ol>
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
                'Add Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
