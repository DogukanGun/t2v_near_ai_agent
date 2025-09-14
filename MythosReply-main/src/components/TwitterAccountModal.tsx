'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { XMarkIcon } from '@heroicons/react/24/outline'
import TwitterConnectButton from './TwitterConnectButton'

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
  const [showManualForm, setShowManualForm] = useState(false)
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

        <div className="p-6 space-y-6">
          {/* Easy OAuth Method (Recommended) */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center mb-3">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                Recommended
              </span>
              <h4 className="text-lg font-medium text-gray-900">Easy Setup</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Connect your Twitter account with one click using secure OAuth authentication.
            </p>
            <TwitterConnectButton 
              onSuccess={() => {
                onSuccess()
                onClose()
              }}
              className="w-full"
            />
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or use manual setup</span>
            </div>
          </div>

          {/* Manual Token Method */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                Advanced
              </span>
              <h4 className="text-lg font-medium text-gray-900">Manual Setup</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              For advanced users who want to use their own Twitter Developer credentials.
            </p>
            
            <button
              onClick={() => setShowManualForm(!showManualForm)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              {showManualForm ? 'Hide manual setup' : 'Show manual setup →'}
            </button>

            {showManualForm && (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
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

                <div className="bg-blue-50 p-3 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">How to get credentials:</h4>
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
                    onClick={() => setShowManualForm(false)}
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
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-center">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
