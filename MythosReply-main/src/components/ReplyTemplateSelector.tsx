'use client'

import { useState, useEffect } from 'react'
import { 
  SparklesIcon, 
  HeartIcon, 
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  MegaphoneIcon,
  QuestionMarkCircleIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline'

interface ReplyTemplate {
  id: string
  name: string
  description: string
  category: string
  template: string
  variables: string[]
  symbols: Record<string, string>
  tone: string
  usageCount: number
}

interface ReplyTemplateSelectorProps {
  selectedTemplates: string[]
  onTemplateSelect: (templateIds: string[]) => void
  customSymbols?: string
  onCustomSymbolsChange?: (symbols: string) => void
  tone?: string
  category?: string
}

const categoryIcons = {
  greeting: FaceSmileIcon,
  question: QuestionMarkCircleIcon,
  support: HeartIcon,
  promotional: MegaphoneIcon,
  technical: CodeBracketIcon
}

const toneColors = {
  casual: 'bg-blue-50 border-blue-200 text-blue-700',
  professional: 'bg-gray-50 border-gray-200 text-gray-700',
  witty: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  supportive: 'bg-green-50 border-green-200 text-green-700',
  technical: 'bg-purple-50 border-purple-200 text-purple-700'
}

export default function ReplyTemplateSelector({
  selectedTemplates,
  onTemplateSelect,
  customSymbols = '',
  onCustomSymbolsChange,
  tone,
  category
}: ReplyTemplateSelectorProps) {
  const [templates, setTemplates] = useState<ReplyTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [previewTemplate, setPreviewTemplate] = useState<ReplyTemplate | null>(null)
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({})

  useEffect(() => {
    loadTemplates()
  }, [tone, category])

  const loadTemplates = async () => {
    try {
      const params = new URLSearchParams()
      if (tone) params.append('tone', tone)
      if (category) params.append('category', category)

      const response = await fetch(`/api/templates?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateToggle = (templateId: string) => {
    const newSelection = selectedTemplates.includes(templateId)
      ? selectedTemplates.filter(id => id !== templateId)
      : [...selectedTemplates, templateId]
    
    onTemplateSelect(newSelection)
  }

  const renderTemplate = (template: ReplyTemplate, values: Record<string, string> = {}) => {
    let rendered = template.template

    // Replace variables
    template.variables.forEach(variable => {
      const value = values[variable] || `[${variable}]`
      rendered = rendered.replace(new RegExp(`{{${variable}}}`, 'g'), value)
    })

    // Replace symbols
    Object.entries(template.symbols).forEach(([key, symbol]) => {
      rendered = rendered.replace(new RegExp(`{{symbol\\.${key}}}`, 'g'), symbol)
    })

    return rendered
  }

  const getCategoryIcon = (category: string) => {
    const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || ChatBubbleLeftRightIcon
    return <IconComponent className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Custom Symbols Input */}
      {onCustomSymbolsChange && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Symbols & Emojis
          </label>
          <input
            type="text"
            value={customSymbols}
            onChange={(e) => onCustomSymbolsChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="🚀 💡 🔥 📊 ⭐ (separate with spaces)"
          />
          <p className="mt-1 text-xs text-gray-500">
            These symbols will be available as variables in your templates
          </p>
        </div>
      )}

      {/* Template Grid */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <SparklesIcon className="h-5 w-5 mr-2" />
          Available Templates
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedTemplates.includes(template.id)
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleTemplateToggle(template.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  {getCategoryIcon(template.category)}
                  <h4 className="text-sm font-medium text-gray-900 ml-2">
                    {template.name}
                  </h4>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  toneColors[template.tone as keyof typeof toneColors] || 'bg-gray-50 border-gray-200 text-gray-700'
                }`}>
                  {template.tone}
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mb-3">{template.description}</p>
              
              <div className="bg-gray-50 rounded p-2 mb-3">
                <code className="text-xs text-gray-700">
                  {renderTemplate(template)}
                </code>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {Object.values(template.symbols).slice(0, 4).map((symbol, index) => (
                    <span key={index} className="text-sm">{symbol}</span>
                  ))}
                  {Object.values(template.symbols).length > 4 && (
                    <span className="text-xs text-gray-400">+{Object.values(template.symbols).length - 4}</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  Used {template.usageCount} times
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setPreviewTemplate(template)
                  setPreviewValues({})
                }}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800"
              >
                Preview with custom values →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Preview: {previewTemplate.name}
                </h3>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template:
                  </label>
                  <div className="bg-gray-50 rounded p-3">
                    <code className="text-sm text-gray-700">{previewTemplate.template}</code>
                  </div>
                </div>

                {previewTemplate.variables.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fill in variables:
                    </label>
                    <div className="space-y-2">
                      {previewTemplate.variables.map((variable) => (
                        <div key={variable}>
                          <label className="block text-xs text-gray-600 mb-1">
                            {variable}:
                          </label>
                          <input
                            type="text"
                            value={previewValues[variable] || ''}
                            onChange={(e) => setPreviewValues({
                              ...previewValues,
                              [variable]: e.target.value
                            })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder={`Enter ${variable}...`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preview result:
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-gray-900">
                      {renderTemplate(previewTemplate, previewValues)}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      handleTemplateToggle(previewTemplate.id)
                      setPreviewTemplate(null)
                    }}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                      selectedTemplates.includes(previewTemplate.id)
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {selectedTemplates.includes(previewTemplate.id) ? 'Remove Template' : 'Use This Template'}
                  </button>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
