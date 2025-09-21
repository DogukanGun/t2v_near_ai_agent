import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const callbackUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/twitter/oauth/callback`;
    const state = Date.now().toString();
    
    const authUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=mock_token&state=${state}`;
    
    return NextResponse.json({
      authUrl,
      state
    });
    
  } catch (error) {
    console.error('OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { oauth_token, oauth_verifier, state } = body;

    if (!oauth_token || !oauth_verifier || !state) {
      return NextResponse.json(
        { error: 'Missing OAuth parameters' },
        { status: 400 }
      );
    }

    const mockAccount = {
      id: Date.now().toString(),
      twitterUsername: 'demo_user',
      isActive: true,
      createdAt: new Date()
    };

    return NextResponse.json(mockAccount, { status: 201 });

  } catch (error) {
    console.error('OAuth completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete OAuth flow' },
      { status: 500 }
    );
  }
}