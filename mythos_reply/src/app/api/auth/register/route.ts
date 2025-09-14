import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Mock registration for demo
    const user = {
      id: 'demo_user_' + Date.now(),
      email,
      username: username || email.split('@')[0]
    };

    return NextResponse.json({
      success: true,
      user,
      message: 'User registered successfully'
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}