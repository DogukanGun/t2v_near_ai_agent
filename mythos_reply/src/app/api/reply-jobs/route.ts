import { NextRequest, NextResponse } from 'next/server'

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

// Mock data store for development
const replyJobs: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const processedJobs = replyJobs.map(job => ({
      ...job,
      keywords: JSON.parse(job.keywords || '[]'),
      targetUsernames: job.targetUsernames ? JSON.parse(job.targetUsernames) : null
    }));

    return NextResponse.json(processedJobs);
  } catch (error) {
    console.error('Reply jobs GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    } = body;

    if (!twitterAccountId || !replyText) {
      return NextResponse.json(
        { error: 'Twitter account ID and reply text are required' },
        { status: 400 }
      );
    }

    if (!targetTweetId && !targetUsername && targetUsernames.length === 0 && keywords.length === 0) {
      return NextResponse.json(
        { error: 'Must specify either target tweet ID, target username(s), or keywords' },
        { status: 400 }
      );
    }

    const replyJob = {
      id: Date.now().toString(),
      userId: 'mock_user_id',
      twitterAccountId,
      targetTweetId,
      targetUsername,
      targetUsernames: JSON.stringify(targetUsernames),
      keywords: JSON.stringify(keywords),
      replyText,
      maxReplies,
      currentReplies: 0,
      useAI,
      aiTone: useAI ? aiConfig.tone || 'casual' : null,
      aiIncludeHashtags: useAI ? aiConfig.includeHashtags || false : false,
      aiIncludeEmojis: useAI ? aiConfig.includeEmojis || false : false,
      aiInstructions: useAI ? aiConfig.customInstructions : null,
      aiModelId: useAI ? aiConfig.modelId : null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      twitterAccount: {
        twitterUsername: 'demo_user'
      }
    };

    replyJobs.push(replyJob);

    return NextResponse.json(replyJob, { status: 201 });
  } catch (error) {
    console.error('Reply job POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
