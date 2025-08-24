import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth'
import { OpenRouterService, ReplyGenerationOptions } from '@/lib/services/openrouter'

/**
 * @swagger
 * /api/ai/generate-reply:
 *   post:
 *     summary: Generate AI-powered tweet replies
 *     tags: [AI Reply Generation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - originalTweet
 *             properties:
 *               originalTweet:
 *                 type: string
 *                 description: The original tweet to reply to
 *               context:
 *                 type: string
 *                 description: Additional context for the reply
 *               tone:
 *                 type: string
 *                 enum: [professional, casual, humorous, supportive, promotional]
 *                 default: casual
 *                 description: Tone of the reply
 *               maxLength:
 *                 type: number
 *                 default: 280
 *                 description: Maximum character length
 *               includeHashtags:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to include hashtags
 *               includeEmojis:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to include emojis
 *               customInstructions:
 *                 type: string
 *                 description: Custom instructions for reply generation
 *               count:
 *                 type: number
 *                 default: 1
 *                 description: Number of reply variations to generate
 *               modelId:
 *                 type: string
 *                 description: Specific OpenRouter model to use
 *     responses:
 *       200:
 *         description: Generated replies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 replies:
 *                   type: array
 *                   items:
 *                     type: string
 *                 modelUsed:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

async function getAuthUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    throw new Error('No token provided')
  }
  return await AuthService.getUserFromToken(token)
}

export async function POST(request: NextRequest) {
  try {
    await getAuthUser(request) // Verify authentication
    
    const body = await request.json()
    const { 
      originalTweet,
      context,
      tone = 'casual',
      maxLength = 280,
      includeHashtags = false,
      includeEmojis = false,
      customInstructions,
      count = 1,
      modelId
    } = body

    if (!originalTweet) {
      return NextResponse.json(
        { error: 'Original tweet is required' },
        { status: 400 }
      )
    }

    if (count < 1 || count > 5) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 5' },
        { status: 400 }
      )
    }

    const openRouterService = new OpenRouterService()
    
    const options: ReplyGenerationOptions = {
      originalTweet,
      context,
      tone: tone as any,
      maxLength,
      includeHashtags,
      includeEmojis,
      customInstructions
    }

    let replies: string[]
    const selectedModel = modelId || OpenRouterService.FREE_MODELS[0].id

    if (count === 1) {
      const reply = await openRouterService.generateReply(options, selectedModel)
      replies = [reply]
    } else {
      replies = await openRouterService.generateMultipleReplies(options, count, selectedModel)
    }

    return NextResponse.json({
      replies,
      modelUsed: selectedModel,
      charactersUsed: replies.map(reply => reply.length)
    })

  } catch (error: any) {
    console.error('Generate reply error:', error)
    
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (error.message.includes('Failed to generate reply')) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
