import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const keywords = searchParams.get('keywords');

    if (!username && !keywords) {
      return NextResponse.json(
        { error: 'Either username or keywords parameter is required' },
        { status: 400 }
      );
    }

    const mockTweets = [
      {
        id: '1',
        text: 'This is a sample tweet for monitoring',
        author: username || 'sample_user',
        timestamp: new Date().toISOString(),
        engagement: { likes: 5, retweets: 2, replies: 1 }
      },
      {
        id: '2',
        text: 'Another tweet matching the keywords',
        author: username || 'another_user',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        engagement: { likes: 10, retweets: 3, replies: 2 }
      }
    ];

    return NextResponse.json({
      success: true,
      tweets: mockTweets,
      totalFound: mockTweets.length,
      query: { username, keywords }
    });

  } catch (error) {
    console.error('Twitter monitoring error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, keywords, interval = 300 } = body;

    if (!username && !keywords) {
      return NextResponse.json(
        { error: 'Either username or keywords is required' },
        { status: 400 }
      );
    }

    const monitoringJob = {
      id: Date.now().toString(),
      username,
      keywords,
      interval,
      status: 'active',
      created: new Date().toISOString(),
      lastCheck: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      monitoring: monitoringJob,
      message: 'Monitoring job created successfully'
    });

  } catch (error) {
    console.error('Create monitoring job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}