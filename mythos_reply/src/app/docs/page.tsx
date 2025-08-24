'use client'

import { useEffect, useState } from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function DocsPage() {
  const [spec, setSpec] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        const response = await fetch('/api/docs')
        if (!response.ok) {
          throw new Error('Failed to fetch API specification')
        }
        const specData = await response.json()
        setSpec(specData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSpec()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600">Error loading API documentation: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-indigo-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">MythosReply API Documentation</h1>
          <p className="mt-2 text-indigo-100">
            Complete API reference for the Twitter Reply Agent
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">🚀 Getting Started</h2>
          <div className="text-blue-700 space-y-2">
            <p>1. Register an account using <code className="bg-blue-100 px-2 py-1 rounded">/api/auth/register</code></p>
            <p>2. Login to get your JWT token using <code className="bg-blue-100 px-2 py-1 rounded">/api/auth/login</code></p>
            <p>3. Add your Twitter account credentials using <code className="bg-blue-100 px-2 py-1 rounded">/api/twitter/accounts</code></p>
            <p>4. Create reply jobs with optional AI-powered responses using <code className="bg-blue-100 px-2 py-1 rounded">/api/reply-jobs</code></p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-green-800 mb-2">🤖 AI Features</h2>
          <div className="text-green-700 space-y-2">
            <p>• Generate intelligent replies using free OpenRouter AI models</p>
            <p>• Choose from multiple tones: professional, casual, humorous, supportive, promotional</p>
            <p>• Customize with hashtags, emojis, and custom instructions</p>
            <p>• Models available: Gemma 2, Phi-3 Mini, Qwen 2 - all completely free!</p>
          </div>
        </div>

        {spec && (
          <SwaggerUI 
            spec={spec} 
            docExpansion="list"
            defaultModelsExpandDepth={2}
            supportedSubmitMethods={['get', 'post', 'delete', 'put', 'patch']}
          />
        )}
      </div>
    </div>
  )
}
