import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth'
import { prisma } from '@/lib/database'
import { TwitterService } from '@/lib/services/twitter'

/**
 * @swagger
 * /api/twitter/accounts:
 *   get:
 *     summary: Get user's Twitter accounts
 *     tags: [Twitter Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of Twitter accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   twitterUsername:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *   post:
 *     summary: Add a new Twitter account
 *     tags: [Twitter Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - twitterUsername
 *               - accessToken
 *               - accessTokenSecret
 *             properties:
 *               twitterUsername:
 *                 type: string
 *                 description: Twitter username
 *               accessToken:
 *                 type: string
 *                 description: Twitter access token
 *               accessTokenSecret:
 *                 type: string
 *                 description: Twitter access token secret
 *     responses:
 *       201:
 *         description: Twitter account added successfully
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

    const accounts = await prisma.twitterAccount.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        twitterUsername: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json(accounts)
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
    const { twitterUsername, accessToken, accessTokenSecret } = body

    if (!twitterUsername || !accessToken || !accessTokenSecret) {
      return NextResponse.json(
        { error: 'Twitter username, access token, and access token secret are required' },
        { status: 400 }
      )
    }

    // Test the credentials by making a simple API call
    try {
      const twitterService = new TwitterService({
        apiKey: process.env.TWITTER_API_KEY!,
        apiSecret: process.env.TWITTER_API_SECRET!,
        accessToken,
        accessTokenSecret
      })
      
      // Try to get user tweets to verify credentials
      await twitterService.getUserTweets(twitterUsername, 1)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid Twitter credentials' },
        { status: 400 }
      )
    }

    const account = await prisma.twitterAccount.create({
      data: {
        userId: user.id,
        twitterUsername,
        accessToken,
        accessTokenSecret
      },
      select: {
        id: true,
        twitterUsername: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error: any) {
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Twitter account already exists for this user' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
