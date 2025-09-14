import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Mock authentication for demo
    const user = {
      id: 'demo_user_id',
      email,
      username: email.split('@')[0]
    };

    return NextResponse.json({
      success: true,
      user,
      token: 'demo_token_' + Date.now()
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}