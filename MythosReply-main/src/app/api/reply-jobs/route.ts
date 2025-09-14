import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth'
import { prisma } from '@/lib/database'

/**
 * @swagger
 * /api/reply-jobs:
 *   get:
 *     summary: Get user's reply jobs
 *     tags: [Reply Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reply jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   targetTweetId:
 *                     type: string
 *                   targetUsername:
 *                     type: string
 *                   keywords:
 *                     type: array
 *                     items:
 *                       type: string
 *                   replyText:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *                   maxReplies:
 *                     type: number
 *                   currentReplies:
 *                     type: number
 *                   twitterAccount:
 *                     type: object
 *                     properties:
 *                       twitterUsername:
 *                         type: string
 *   post:
 *     summary: Create a new reply job
 *     tags: [Reply Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - twitterAccountId
 *               - replyText
 *             properties:
 *               twitterAccountId:
 *                 type: string
 *                 description: ID of the Twitter account to use
 *               targetTweetId:
 *                 type: string
 *                 description: Specific tweet ID to reply to
 *               targetUsername:
 *                 type: string
 *                 description: Username to monitor for replies
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Keywords to monitor for
 *               replyText:
 *                 type: string
 *                 description: Text to reply with
 *               maxReplies:
 *                 type: number
 *                 description: Maximum number of replies (default 10)
 *     responses:
 *       201:
 *         description: Reply job created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

async function getAuthUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    throw new Error('No token provided')
  }
  return await AuthService.getUserFromToken(token)
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    const replyJobs = await prisma.replyJob.findMany({
      where: { userId: user.id },
      include: {
        twitterAccount: {
          select: {
            twitterUsername: true
          }
        },
        replies: {
          select: {
            id: true,
            successful: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    // Parse keywords and targetUsernames JSON back to arrays
    const processedJobs = replyJobs.map((job: any) => ({
      ...job,
      keywords: JSON.parse(job.keywords || '[]'),
      targetUsernames: JSON.parse(job.targetUsernames || '[]')
    }))

    return NextResponse.json(processedJobs)
  } catch (error: any) {
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    const body = await request.json()
    const { 
      twitterAccountId, 
      targetTweetId, 
      targetUsername, 
      targetUsernames = [],
      keywords = [], 
      replyText, 
      maxReplies = 10,
      useAI = false,
      aiConfig = {}
    } = body

    if (!twitterAccountId || !replyText) {
      return NextResponse.json(
        { error: 'Twitter account ID and reply text are required' },
        { status: 400 }
      )
    }

    // Handle backward compatibility and new multiple usernames
    const finalTargetUsernames = targetUsernames.length > 0 ? targetUsernames : (targetUsername ? [targetUsername] : [])

    if (!targetTweetId && finalTargetUsernames.length === 0 && keywords.length === 0) {
      return NextResponse.json(
        { error: 'Must specify either target tweet ID, target usernames, or keywords' },
        { status: 400 }
      )
    }

    // Verify the Twitter account belongs to the user
    const twitterAccount = await prisma.twitterAccount.findFirst({
      where: {
        id: twitterAccountId,
        userId: user.id
      }
    })

    if (!twitterAccount) {
      return NextResponse.json(
        { error: 'Twitter account not found or does not belong to user' },
        { status: 404 }
      )
    }

    const replyJob = await prisma.replyJob.create({
      data: {
        userId: user.id,
        twitterAccountId,
        targetTweetId,
        targetUsername: finalTargetUsernames.length === 1 ? finalTargetUsernames[0] : null, // Keep for backward compatibility
        targetUsernames: JSON.stringify(finalTargetUsernames),
        keywords: JSON.stringify(keywords),
        replyText,
        maxReplies,
        useAI,
        aiTone: useAI ? aiConfig.tone || 'casual' : null,
        aiIncludeHashtags: useAI ? aiConfig.includeHashtags || false : false,
        aiIncludeEmojis: useAI ? aiConfig.includeEmojis || false : false,
        aiInstructions: useAI ? aiConfig.customInstructions : null,
        aiModelId: useAI ? aiConfig.modelId : null
      },
      include: {
        twitterAccount: {
          select: {
            twitterUsername: true
          }
        }
      }
    })

    return NextResponse.json(replyJob, { status: 201 })
  } catch (error: any) {
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
