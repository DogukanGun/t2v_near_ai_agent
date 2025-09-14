import { NextRequest, NextResponse } from 'next/server';

interface WaitlistEntry {
  id: string;
  email: string;
  name?: string;
  company?: string;
  useCase?: string;
  twitterHandle?: string;
  referralSource?: string;
  priority: string;
  status: string;
  createdAt: Date;
}

const waitlistEntries: WaitlistEntry[] = [];

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      name, 
      company, 
      useCase, 
      twitterHandle, 
      referralSource 
    } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const existingEntry = waitlistEntries.find(entry => entry.email === email);
    if (existingEntry) {
      return NextResponse.json(
        { 
          error: 'Email already on waitlist',
          status: existingEntry.status,
          joinedAt: existingEntry.createdAt
        },
        { status: 409 }
      );
    }

    let priority = 'normal';
    if (company && ['YC', 'Y Combinator', 'Sequoia', 'a16z'].some(vc => 
      company.toLowerCase().includes(vc.toLowerCase())
    )) {
      priority = 'high';
    }
    if (useCase && useCase.toLowerCase().includes('enterprise')) {
      priority = 'premium';
    }

    const waitlistEntry: WaitlistEntry = {
      id: Date.now().toString(),
      email,
      name,
      company,
      useCase,
      twitterHandle,
      referralSource,
      priority,
      status: 'pending',
      createdAt: new Date()
    };

    waitlistEntries.push(waitlistEntry);

    const position = waitlistEntries.filter(e => e.status === 'pending').length;
    const estimatedWait = position <= 100 ? '1-2 weeks' : 
                         position <= 500 ? '2-4 weeks' : 
                         position <= 1000 ? '1-2 months' : '2+ months';

    return NextResponse.json({
      message: 'Successfully joined the waitlist!',
      position,
      estimatedWait,
      priority
    }, { status: 201 });

  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    let filteredEntries = [...waitlistEntries];

    if (status) {
      filteredEntries = filteredEntries.filter(e => e.status === status);
    }

    if (priority) {
      filteredEntries = filteredEntries.filter(e => e.priority === priority);
    }

    const stats = {
      total: waitlistEntries.length,
      byStatus: {
        pending: waitlistEntries.filter(e => e.status === 'pending').length,
        invited: waitlistEntries.filter(e => e.status === 'invited').length,
        registered: waitlistEntries.filter(e => e.status === 'registered').length
      },
      byPriority: {
        normal: waitlistEntries.filter(e => e.priority === 'normal').length,
        high: waitlistEntries.filter(e => e.priority === 'high').length,
        premium: waitlistEntries.filter(e => e.priority === 'premium').length
      }
    };

    return NextResponse.json({
      entries: filteredEntries,
      statistics: stats
    });

  } catch (error) {
    console.error('Waitlist GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}