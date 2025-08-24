import OpenAI from 'openai'

export interface ReplyGenerationOptions {
  originalTweet: string
  context?: string
  tone?: 'professional' | 'casual' | 'humorous' | 'supportive' | 'promotional'
  maxLength?: number
  includeHashtags?: boolean
  includeEmojis?: boolean
  customInstructions?: string
}

export interface AIModel {
  id: string
  name: string
  description: string
  pricing: {
    prompt: number
    completion: number
  }
}

export class OpenRouterService {
  private client: OpenAI
  
  constructor() {
    this.client = new OpenAI({
      baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'MythosReply - Twitter Reply Agent'
      }
    })
  }

  // List of free models available on OpenRouter
  static readonly FREE_MODELS: AIModel[] = [
    {
      id: 'google/gemma-2-9b-it:free',
      name: 'Gemma 2 9B',
      description: 'Google\'s efficient conversational model',
      pricing: { prompt: 0, completion: 0 }
    },
    {
      id: 'microsoft/phi-3-mini-128k-instruct:free',
      name: 'Phi-3 Mini',
      description: 'Microsoft\'s compact but capable model',
      pricing: { prompt: 0, completion: 0 }
    },
    {
      id: 'google/gemma-2-2b-it:free',
      name: 'Gemma 2 2B',
      description: 'Lightweight Google model for quick responses',
      pricing: { prompt: 0, completion: 0 }
    },
    {
      id: 'qwen/qwen-2-7b-instruct:free',
      name: 'Qwen 2 7B',
      description: 'Alibaba\'s multilingual instruction-following model',
      pricing: { prompt: 0, completion: 0 }
    }
  ]

  async generateReply(options: ReplyGenerationOptions, modelId?: string): Promise<string> {
    const {
      originalTweet,
      context = '',
      tone = 'casual',
      maxLength = 280,
      includeHashtags = false,
      includeEmojis = false,
      customInstructions = ''
    } = options

    const selectedModel = modelId || OpenRouterService.FREE_MODELS[0].id

    const systemPrompt = this.buildSystemPrompt(tone, maxLength, includeHashtags, includeEmojis, customInstructions)
    const userPrompt = this.buildUserPrompt(originalTweet, context)

    try {
      const completion = await this.client.chat.completions.create({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: Math.min(Math.ceil(maxLength / 3), 150), // Rough token estimate
        temperature: 0.7,
        top_p: 0.9,
        stream: false
      })

      const reply = completion.choices[0]?.message?.content?.trim()
      
      if (!reply) {
        throw new Error('No reply generated')
      }

      // Ensure reply doesn't exceed Twitter's character limit
      return this.truncateToCharLimit(reply, maxLength)
    } catch (error: any) {
      console.error('OpenRouter API error:', error)
      throw new Error(`Failed to generate reply: ${error.message}`)
    }
  }

  private buildSystemPrompt(
    tone: string, 
    maxLength: number, 
    includeHashtags: boolean, 
    includeEmojis: boolean, 
    customInstructions: string
  ): string {
    let prompt = `You are a helpful AI assistant that generates Twitter replies. Your task is to create engaging, relevant, and appropriate responses to tweets.

Guidelines:
- Keep responses under ${maxLength} characters (Twitter limit)
- Use a ${tone} tone
- Be respectful and avoid controversial topics
- Make the reply feel natural and conversational
- Don't repeat the original tweet's content
- Focus on adding value to the conversation`

    if (includeHashtags) {
      prompt += '\n- Include relevant hashtags where appropriate'
    }

    if (includeEmojis) {
      prompt += '\n- Use emojis to make the response more engaging'
    }

    if (customInstructions) {
      prompt += `\n\nAdditional instructions: ${customInstructions}`
    }

    return prompt
  }

  private buildUserPrompt(originalTweet: string, context: string): string {
    let prompt = `Original tweet to reply to: "${originalTweet}"`
    
    if (context) {
      prompt += `\n\nAdditional context: ${context}`
    }
    
    prompt += '\n\nGenerate an appropriate reply:'
    
    return prompt
  }

  private truncateToCharLimit(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text
    }

    // Try to truncate at a word boundary
    const truncated = text.substring(0, maxLength - 3)
    const lastSpace = truncated.lastIndexOf(' ')
    
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...'
    }
    
    return truncated + '...'
  }

  async generateMultipleReplies(
    options: ReplyGenerationOptions, 
    count: number = 3,
    modelId?: string
  ): Promise<string[]> {
    const replies: string[] = []
    const promises: Promise<string>[] = []

    for (let i = 0; i < count; i++) {
      // Add slight variation in temperature for each generation
      const modifiedOptions = {
        ...options,
        customInstructions: options.customInstructions + ` (Variation ${i + 1})`
      }
      promises.push(this.generateReply(modifiedOptions, modelId))
    }

    try {
      const results = await Promise.allSettled(promises)
      
      for (const result of results) {
        if (result.status === 'fulfilled') {
          replies.push(result.value)
        }
      }

      return replies
    } catch (error) {
      console.error('Error generating multiple replies:', error)
      throw error
    }
  }

  static getAvailableModels(): AIModel[] {
    return OpenRouterService.FREE_MODELS
  }

  async testModelConnection(modelId?: string): Promise<boolean> {
    try {
      const testOptions: ReplyGenerationOptions = {
        originalTweet: 'Hello, world!',
        maxLength: 50,
        tone: 'casual'
      }
      
      await this.generateReply(testOptions, modelId)
      return true
    } catch (error) {
      console.error('Model connection test failed:', error)
      return false
    }
  }
}
