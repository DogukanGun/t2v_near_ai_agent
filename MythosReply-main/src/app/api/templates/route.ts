import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth'
import { prisma } from '@/lib/database'

/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: Get available reply templates
 *     tags: [Templates]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [greeting, question, support, promotional, technical]
 *         description: Filter by template category
 *       - in: query
 *         name: tone
 *         schema:
 *           type: string
 *           enum: [casual, professional, witty, supportive, technical]
 *         description: Filter by tone
 *     responses:
 *       200:
 *         description: List of templates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   category:
 *                     type: string
 *                   template:
 *                     type: string
 *                   tone:
 *                     type: string
 *                   symbols:
 *                     type: object
 *   post:
 *     summary: Create custom template (admin only)
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - template
 *               - category
 *               - tone
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               template:
 *                 type: string
 *               tone:
 *                 type: string
 *               symbols:
 *                 type: object
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
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const tone = searchParams.get('tone')

    const where: any = { isActive: true }
    if (category) where.category = category
    if (tone) where.tone = tone

    const templates = await prisma.replyTemplate.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        template: true,
        variables: true,
        symbols: true,
        tone: true,
        usageCount: true
      },
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Parse JSON fields
    const processedTemplates = templates.map(template => ({
      ...template,
      variables: JSON.parse(template.variables || '[]'),
      symbols: JSON.parse(template.symbols || '{}')
    }))

    return NextResponse.json(processedTemplates)

  } catch (error: any) {
    console.error('Templates GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    
    // Check admin access
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
    const { name, description, category, template, variables = [], symbols = {}, tone } = body

    if (!name || !template || !category || !tone) {
      return NextResponse.json(
        { error: 'Name, template, category, and tone are required' },
        { status: 400 }
      )
    }

    const newTemplate = await prisma.replyTemplate.create({
      data: {
        name,
        description: description || '',
        category,
        template,
        variables: JSON.stringify(variables),
        symbols: JSON.stringify(symbols),
        tone
      }
    })

    return NextResponse.json(newTemplate, { status: 201 })

  } catch (error: any) {
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Templates POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Initialize default templates
export async function initializeDefaultTemplates() {
  const defaultTemplates = [
    {
      name: "Supportive Response",
      description: "Encouraging reply for achievements or launches",
      category: "support",
      template: "{{symbol.celebrate}} Congratulations on {{achievement}}! {{symbol.fire}} What's next on your roadmap?",
      variables: ["achievement"],
      symbols: { celebrate: "🎉", fire: "🔥", heart: "❤️" },
      tone: "supportive"
    },
    {
      name: "Professional Question",
      description: "Professional follow-up question",
      category: "question",
      template: "Interesting perspective on {{topic}}. {{symbol.thinking}} How do you see this evolving in the next {{timeframe}}?",
      variables: ["topic", "timeframe"],
      symbols: { thinking: "🤔", chart: "📊", bulb: "💡" },
      tone: "professional"
    },
    {
      name: "Casual Appreciation",
      description: "Casual way to show appreciation",
      category: "greeting",
      template: "Love this take! {{symbol.thumbs}} {{username}} always dropping gems {{symbol.gem}}",
      variables: ["username"],
      symbols: { thumbs: "👍", gem: "💎", fire: "🔥" },
      tone: "casual"
    },
    {
      name: "Technical Discussion",
      description: "For technical or development topics",
      category: "technical",
      template: "Great point about {{technology}}! {{symbol.code}} Have you considered {{suggestion}}? Would love to hear your thoughts.",
      variables: ["technology", "suggestion"],
      symbols: { code: "💻", rocket: "🚀", gear: "⚙️" },
      tone: "technical"
    },
    {
      name: "Witty Response",
      description: "Humorous and engaging reply",
      category: "greeting",
      template: "{{symbol.laugh}} This is gold! {{username}} out here speaking facts {{symbol.facts}}",
      variables: ["username"],
      symbols: { laugh: "😂", facts: "📈", chef: "👨‍🍳", fire: "🔥" },
      tone: "witty"
    },
    {
      name: "Product Launch Support",
      description: "Supporting product launches and announcements",
      category: "promotional",
      template: "{{symbol.rocket}} Excited to see {{product}} launch! {{symbol.celebrate}} The {{feature}} looks game-changing. When's the public release?",
      variables: ["product", "feature"],
      symbols: { rocket: "🚀", celebrate: "🎉", star: "⭐", fire: "🔥" },
      tone: "supportive"
    },
    {
      name: "Industry Insight",
      description: "Adding value to industry discussions",
      category: "professional",
      template: "Spot on about {{industry_topic}}. {{symbol.chart}} In my experience, {{insight}}. What's your take on {{question}}?",
      variables: ["industry_topic", "insight", "question"],
      symbols: { chart: "📊", bulb: "💡", target: "🎯", growth: "📈" },
      tone: "professional"
    }
  ]

  for (const template of defaultTemplates) {
    try {
      await prisma.replyTemplate.upsert({
        where: { name: template.name },
        update: {}, // Don't update existing templates
        create: {
          ...template,
          variables: JSON.stringify(template.variables),
          symbols: JSON.stringify(template.symbols)
        }
      })
    } catch (error) {
      console.error(`Failed to create template ${template.name}:`, error)
    }
  }
}
