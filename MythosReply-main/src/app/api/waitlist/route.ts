import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth'
import { prisma } from '@/lib/database'
import { z } from 'zod'

/**
 * @swagger
 * /api/waitlist:
 *   post:
 *     summary: Join the waitlist
 *     tags: [Waitlist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               name:
 *                 type: string
 *                 description: User's full name
 *               company:
 *                 type: string
 *                 description: Company or organization
 *               useCase:
 *                 type: string
 *                 description: How they plan to use MythosReply
 *               twitterHandle:
 *                 type: string
 *                 description: Twitter username (without @)
 *               referralSource:
 *                 type: string
 *                 description: How they heard about us
 *     responses:
 *       201:
 *         description: Successfully joined waitlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 position:
 *                   type: number
 *                 estimatedWait:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already on waitlist
 *   get:
 *     summary: Get waitlist statistics (admin only)
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, invited, registered]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [normal, high, premium]
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: Waitlist statistics
 *       401:
 *         description: Unauthorized
 */

// Validation schema
const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  company: z.string().optional(),
  useCase: z.string().optional(),
  twitterHandle: z.string().optional(),
  referralSource: z.string().optional(),
  replyStyle: z.string().optional(),
  preferredTemplates: z.array(z.string()).optional(),
  customSymbols: z.union([z.string(), z.array(z.string())]).optional()
})

async function getAuthUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    throw new Error('No token provided')
  }
  return await AuthService.getUserFromToken(token)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = waitlistSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    const { 
      email, 
      name, 
      company, 
      useCase, 
      twitterHandle, 
      referralSource,
      replyStyle,
      preferredTemplates,
      customSymbols 
    } = validationResult.data

    // Check if email already exists
    const existingEntry = await prisma.waitlistEntry.findUnique({
      where: { email }
    })

    if (existingEntry) {
      return NextResponse.json(
        { 
          error: 'Email already on waitlist',
          status: existingEntry.status,
          joinedAt: existingEntry.createdAt
        },
        { status: 409 }
      )
    }

    // Determine priority based on certain criteria
    let priority = 'normal'
    if (company && ['YC', 'Y Combinator', 'Sequoia', 'a16z'].some(vc => 
      company.toLowerCase().includes(vc.toLowerCase())
    )) {
      priority = 'high'
    }
    if (useCase && useCase.toLowerCase().includes('enterprise')) {
      priority = 'premium'
    }

    // Process custom symbols
    const processedCustomSymbols = Array.isArray(customSymbols) 
      ? customSymbols 
      : typeof customSymbols === 'string' 
        ? customSymbols.split(' ').filter(s => s.trim())
        : []

    // Create waitlist entry
    const waitlistEntry = await prisma.waitlistEntry.create({
      data: {
        email,
        name,
        company,
        useCase,
        twitterHandle,
        referralSource,
        priority,
        replyStyle,
        preferredTemplates: preferredTemplates ? JSON.stringify(preferredTemplates) : null,
        customSymbols: processedCustomSymbols.length > 0 ? JSON.stringify(processedCustomSymbols) : null,
        metadata: JSON.stringify({
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          timestamp: new Date().toISOString()
        })
      }
    })

    // Calculate position in waitlist
    const position = await prisma.waitlistEntry.count({
      where: {
        createdAt: {
          lte: waitlistEntry.createdAt
        },
        status: 'pending'
      }
    })

    // Estimate wait time (simplified)
    const estimatedWait = position <= 100 ? '1-2 weeks' : 
                         position <= 500 ? '2-4 weeks' : 
                         position <= 1000 ? '1-2 months' : '2+ months'

    // TODO: Send welcome email here
    // await sendWelcomeEmail(email, name, position)

    return NextResponse.json({
      message: 'Successfully joined the waitlist!',
      position,
      estimatedWait,
      priority
    }, { status: 201 })

  } catch (error: any) {
    console.error('Waitlist signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin access (you can customize this logic)
    const user = await getAuthUser(request)
    
    // For now, let's check if user email contains 'admin' or is a specific admin email
    const isAdmin = user.email.includes('admin') || 
                   user.email === process.env.ADMIN_EMAIL ||
                   user.username === 'admin'

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    // Build filter conditions
    const where: any = {}
    if (status) where.status = status
    if (priority) where.priority = priority

    // Get waitlist entries
    const entries = await prisma.waitlistEntry.findMany({
      where,
      orderBy: [
        { priority: 'desc' }, // premium > high > normal
        { createdAt: 'asc' }   // earlier first
      ],
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        useCase: true,
        twitterHandle: true,
        referralSource: true,
        priority: true,
        status: true,
        createdAt: true,
        invitedAt: true
      }
    })

    // Get statistics
    const stats = await prisma.waitlistEntry.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    const priorityStats = await prisma.waitlistEntry.groupBy({
      by: ['priority'],
      _count: {
        priority: true
      }
    })

    // Calculate growth metrics
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const dailySignups = await prisma.waitlistEntry.count({
      where: {
        createdAt: {
          gte: yesterday
        }
      }
    })

    const weeklySignups = await prisma.waitlistEntry.count({
      where: {
        createdAt: {
          gte: lastWeek
        }
      }
    })

    return NextResponse.json({
      entries,
      statistics: {
        total: entries.length,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.status
          return acc
        }, {} as Record<string, number>),
        byPriority: priorityStats.reduce((acc, stat) => {
          acc[stat.priority] = stat._count.priority
          return acc
        }, {} as Record<string, number>),
        growth: {
          dailySignups,
          weeklySignups
        }
      }
    })

  } catch (error: any) {
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Waitlist GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Admin-only endpoint to update waitlist entries
    const user = await getAuthUser(request)
    const isAdmin = user.email.includes('admin') || 
                   user.email === process.env.ADMIN_EMAIL ||
                   user.username === 'admin'

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, status, priority } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (status === 'invited') updateData.invitedAt = new Date()

    const updatedEntry = await prisma.waitlistEntry.update({
      where: { email },
      data: updateData
    })

    return NextResponse.json({
      message: 'Waitlist entry updated successfully',
      entry: updatedEntry
    })

  } catch (error: any) {
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Waitlist PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
