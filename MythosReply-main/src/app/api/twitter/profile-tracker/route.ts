import { NextRequest, NextResponse } from 'next/server'
import { TwitterIOService, UserTweetsParams } from '@/lib/services/twitterIO'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userName = searchParams.get('userName')
    const userId = searchParams.get('userId')
    const cursor = searchParams.get('cursor')
    const includeReplies = searchParams.get('includeReplies') === 'true'

    if (!userName && !userId) {
      return NextResponse.json(
        { error: 'Either userName or userId must be provided' },
        { status: 400 }
      )
    }

    const params: UserTweetsParams = {
      userName: userName || undefined,
      userId: userId || undefined,
      cursor: cursor || '',
      includeReplies
    }

    const response = await TwitterIOService.getUserLastTweets(params)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Profile tracker API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user tweets' },
      { status: 500 }
    )
  }
}

// POST endpoint to add/remove profiles from tracking list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userName } = body

    if (!action || !userName) {
      return NextResponse.json(
        { error: 'Action and userName are required' },
        { status: 400 }
      )
    }

    // For now, we'll just return success since we're not implementing persistent storage
    // In a full implementation, you would save to a database here
    if (action === 'add') {
      return NextResponse.json({ 
        success: true, 
        message: `Started tracking @${userName}` 
      })
    } else if (action === 'remove') {
      return NextResponse.json({ 
        success: true, 
        message: `Stopped tracking @${userName}` 
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "add" or "remove"' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Profile tracker POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update tracking' },
      { status: 500 }
    )
  }
}
