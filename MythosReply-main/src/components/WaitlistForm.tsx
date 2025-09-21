'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { 
  UserIcon, 
  EnvelopeIcon, 
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface WaitlistFormData {
  email: string
  name?: string
  company?: string
  useCase?: string
  twitterHandle?: string
  referralSource?: string
  replyStyle?: string
  preferredTemplates?: string[]
  customSymbols?: string
}

interface WaitlistFormProps {
  onSuccess?: (data: { position: number; estimatedWait: string }) => void
  className?: string
}

export default function WaitlistForm({ onSuccess, className }: WaitlistFormProps) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [position, setPosition] = useState<number | null>(null)
  const [estimatedWait, setEstimatedWait] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<WaitlistFormData>()

  const onSubmit = async (data: WaitlistFormData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          toast.error('You\'re already on the waitlist!')
          return
        }
        throw new Error(result.error || 'Failed to join waitlist')
      }

      setPosition(result.position)
      setEstimatedWait(result.estimatedWait)
      setSubmitted(true)
      
      toast.success(`Successfully joined! You're #${result.position} on the waitlist`)
      
      if (onSuccess) {
        onSuccess({ position: result.position, estimatedWait: result.estimatedWait })
      }

    } catch (error: any) {
      console.error('Waitlist signup error:', error)
      toast.error(error.message || 'Failed to join waitlist')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 text-center ${className}`}>
        <div className="mb-4">
          <SparklesIcon className="h-12 w-12 text-green-600 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Welcome to the waitlist!
        </h3>
        <p className="text-green-700 mb-4">
          You're <span className="font-bold">#{position}</span> in line
        </p>
        <p className="text-sm text-green-600">
          Estimated wait time: <span className="font-medium">{estimatedWait}</span>
        </p>
        <div className="mt-4 p-3 bg-green-100 rounded-md">
          <p className="text-xs text-green-800">
            💡 <strong>Pro tip:</strong> Share MythosReply with friends to move up in the queue!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
          <UsersIcon className="h-6 w-6 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Join the MythosReply Waitlist
        </h2>
        <p className="text-gray-600">
          Be among the first to access our AI-powered Twitter automation platform
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email - Required */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <EnvelopeIcon className="h-4 w-4 mr-1" />
            Email Address *
          </label>
          <input
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Name - Optional */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <UserIcon className="h-4 w-4 mr-1" />
            Full Name
          </label>
          <input
            {...register('name')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="John Doe"
          />
        </div>

        {/* Company - Optional */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <BuildingOfficeIcon className="h-4 w-4 mr-1" />
            Company
          </label>
          <input
            {...register('company')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Acme Corp"
          />
        </div>

        {/* Use Case - Optional */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
            How do you plan to use MythosReply?
          </label>
          <textarea
            {...register('useCase')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Automate customer support, engage with industry leaders, grow my personal brand..."
          />
        </div>

        {/* Twitter Handle - Optional */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Twitter Handle
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">@</span>
            <input
              {...register('twitterHandle')}
              type="text"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="yourusername"
            />
          </div>
        </div>

        {/* Referral Source - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            How did you hear about us?
          </label>
          <select
            {...register('referralSource')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select...</option>
            <option value="twitter">Twitter</option>
            <option value="linkedin">LinkedIn</option>
            <option value="product-hunt">Product Hunt</option>
            <option value="hacker-news">Hacker News</option>
            <option value="reddit">Reddit</option>
            <option value="friend">Friend/Colleague</option>
            <option value="google">Google Search</option>
            <option value="blog">Blog/Article</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Reply Style Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Reply Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'casual', label: 'Casual & Fun 😄', desc: 'Friendly, emojis, relaxed tone' },
              { value: 'professional', label: 'Professional 💼', desc: 'Business-focused, formal' },
              { value: 'witty', label: 'Witty & Humorous 😂', desc: 'Clever, funny, engaging' },
              { value: 'supportive', label: 'Supportive 🤝', desc: 'Encouraging, positive' },
              { value: 'technical', label: 'Technical 💻', desc: 'Data-driven, analytical' },
              { value: 'mixed', label: 'Mixed Approach 🎭', desc: 'Adapt to context' }
            ].map((style) => (
              <label key={style.value} className="relative">
                <input
                  {...register('replyStyle')}
                  type="radio"
                  value={style.value}
                  className="sr-only peer"
                />
                <div className="p-3 border border-gray-300 rounded-md cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 hover:border-gray-400 transition-colors">
                  <div className="font-medium text-sm text-gray-900">{style.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{style.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Template Preferences */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interested Reply Templates
          </label>
          <div className="space-y-2">
            {[
              { id: 'greeting', label: 'Greeting & Appreciation', desc: 'Welcome new followers, thank supporters' },
              { id: 'question', label: 'Thoughtful Questions', desc: 'Engage with meaningful questions' },
              { id: 'support', label: 'Support & Encouragement', desc: 'Cheer on achievements and launches' },
              { id: 'technical', label: 'Technical Discussions', desc: 'Deep dive into technical topics' },
              { id: 'promotional', label: 'Product Promotion', desc: 'Highlight your products/services naturally' }
            ].map((template) => (
              <label key={template.id} className="flex items-start">
                <input
                  {...register('preferredTemplates')}
                  type="checkbox"
                  value={template.id}
                  className="mt-1 mr-3 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">{template.label}</div>
                  <div className="text-xs text-gray-500">{template.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Symbols/Emojis */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Favorite Symbols/Emojis (Optional)
          </label>
          <input
            {...register('customSymbols')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="🚀 💡 🔥 📊 (separate with spaces)"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter emojis or symbols you'd like to see in your automated replies
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Joining Waitlist...
            </>
          ) : (
            'Join Waitlist'
          )}
        </button>
      </form>

      {/* Benefits */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">What you'll get:</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center">
            <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Early access to MythosReply beta
          </li>
          <li className="flex items-center">
            <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            50% discount on first month
          </li>
          <li className="flex items-center">
            <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Priority support & onboarding
          </li>
          <li className="flex items-center">
            <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Exclusive feature previews
          </li>
        </ul>
      </div>
    </div>
  )
}
