import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MythosReply API',
      version: '1.0.0',
      description: 'Automated Twitter reply agent with AI-powered responses for multiple users',
      contact: {
        name: 'MythosReply Support',
        email: 'support@mythosreply.com'
      }
    },
    servers: [
      {
        url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        TwitterAccount: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            twitterUsername: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        ReplyJob: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            targetTweetId: { type: 'string', nullable: true },
            targetUsername: { type: 'string', nullable: true },
            keywords: { type: 'array', items: { type: 'string' } },
            replyText: { type: 'string' },
            useAI: { type: 'boolean' },
            aiTone: { type: 'string', enum: ['professional', 'casual', 'humorous', 'supportive', 'promotional'] },
            aiIncludeHashtags: { type: 'boolean' },
            aiIncludeEmojis: { type: 'boolean' },
            aiInstructions: { type: 'string', nullable: true },
            aiModelId: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            maxReplies: { type: 'number' },
            currentReplies: { type: 'number' },
            lastProcessedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            twitterAccount: { $ref: '#/components/schemas/TwitterAccount' }
          }
        },
        Reply: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            replyJobId: { type: 'string' },
            tweetId: { type: 'string' },
            replyTweetId: { type: 'string' },
            content: { type: 'string' },
            successful: { type: 'boolean' },
            errorMessage: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        AIModel: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            pricing: {
              type: 'object',
              properties: {
                prompt: { type: 'number' },
                completion: { type: 'number' }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Twitter Accounts',
        description: 'Manage Twitter account connections'
      },
      {
        name: 'Reply Jobs',
        description: 'Create and manage automated reply jobs'
      },
      {
        name: 'AI Reply Generation',
        description: 'Generate AI-powered tweet replies using OpenRouter models'
      },
      {
        name: 'AI Models',
        description: 'Available AI models and their capabilities'
      },
      {
        name: 'Twitter OAuth',
        description: 'Twitter OAuth authentication flow'
      }
    ]
  },
  apis: [
    './src/app/api/**/*.ts'
  ]
}

export const swaggerSpec = swaggerJsdoc(options)
