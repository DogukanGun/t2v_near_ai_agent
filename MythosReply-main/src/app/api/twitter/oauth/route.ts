import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth'
import { TwitterOAuthService } from '@/lib/services/twitterOAuth'
import { prisma } from '@/lib/database'

/**
 * @swagger
 * /api/twitter/oauth:
 *   get:
 *     summary: Get Twitter OAuth authorization URL
 *     tags: [Twitter OAuth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OAuth authorization URL generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authUrl:
 *                   type: string
 *                   description: Twitter authorization URL
 *                 state:
 *                   type: string
 *                   description: State parameter for security
 *   post:
 *     summary: Complete Twitter OAuth flow
 *     tags: [Twitter OAuth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oauth_token
 *               - oauth_verifier
 *               - state
 *             properties:
 *               oauth_token:
 *                 type: string
 *               oauth_verifier:
 *                 type: string
 *               state:
 *                 type: string
 *     responses:
 *       201:
 *         description: Twitter account connected successfully
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
    const callbackUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/twitter/oauth/callback`
    
    const { authUrl, state } = await TwitterOAuthService.getAuthorizationUrl(user.id, callbackUrl)
    
    return NextResponse.json({
      authUrl,
      state
    })
    
  } catch (error: any) {
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('OAuth initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    const body = await request.json()
    const { oauth_token, oauth_verifier, state } = body

    if (!oauth_token || !oauth_verifier || !state) {
      return NextResponse.json(
        { error: 'Missing OAuth parameters' },
        { status: 400 }
      )
    }

    const { accessToken, accessSecret, userId, screenName, twitterUserId } = 
      await TwitterOAuthService.completeOAuth(state, oauth_token, oauth_verifier)

    // Verify the user matches
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'User mismatch in OAuth flow' },
        { status: 400 }
      )
    }

    // Store the Twitter account
    const account = await prisma.twitterAccount.upsert({
      where: {
        userId_twitterUsername: {
          userId: user.id,
          twitterUsername: screenName
        }
      },
      update: {
        accessToken,
        accessTokenSecret: accessSecret,
        isActive: true
      },
      create: {
        userId: user.id,
        twitterUsername: screenName,
        accessToken,
        accessTokenSecret: accessSecret,
        isActive: true
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

    console.error('OAuth completion error:', error)
    return NextResponse.json(
      { error: 'Failed to complete OAuth flow' },
      { status: 500 }
    )
  }
}
