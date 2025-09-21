import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tweetId, analysisType = 'sentiment' } = body;

    if (!tweetId) {
      return NextResponse.json(
        { error: 'Tweet ID is required' },
        { status: 400 }
      );
    }

    let analysis;
    switch (analysisType) {
      case 'sentiment':
        analysis = {
          sentiment: 'positive',
          confidence: 0.85,
          score: 0.7,
          breakdown: {
            positive: 0.7,
            neutral: 0.2,
            negative: 0.1
          }
        };
        break;
      case 'engagement':
        analysis = {
          engagementRate: 0.05,
          viralScore: 0.3,
          reachEstimate: 1500,
          predictedLikes: 25,
          predictedShares: 8
        };
        break;
      case 'topic':
        analysis = {
          topics: ['technology', 'social media', 'startup'],
          categories: ['business', 'innovation'],
          keywords: ['AI', 'automation', 'growth']
        };
        break;
      default:
        analysis = { message: 'Analysis type not supported' };
    }

    return NextResponse.json({
      success: true,
      tweetId,
      analysisType,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Twitter analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const timeframe = searchParams.get('timeframe') || '7d';

    if (!username) {
      return NextResponse.json(
        { error: 'Username parameter is required' },
        { status: 400 }
      );
    }

    const profileAnalysis = {
      username,
      timeframe,
      metrics: {
        totalTweets: 45,
        avgEngagement: 0.034,
        topHashtags: ['#startup', '#AI', '#tech'],
        sentimentTrend: {
          positive: 0.6,
          neutral: 0.3,
          negative: 0.1
        },
        activityPattern: {
          mostActiveHours: [9, 14, 18],
          mostActiveDays: ['Monday', 'Wednesday', 'Friday']
        }
      },
      insights: [
        'User shows consistent positive sentiment',
        'High engagement during business hours',
        'Strong focus on technology topics'
      ]
    };

    return NextResponse.json({
      success: true,
      profile: profileAnalysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Profile analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}