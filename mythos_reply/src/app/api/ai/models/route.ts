import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth'
import { OpenRouterService } from '@/lib/services/openrouter'

/**
 * @swagger
 * /api/ai/models:
 *   get:
 *     summary: Get available AI models
 *     tags: [AI Models]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available AI models
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 models:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       pricing:
 *                         type: object
 *                         properties:
 *                           prompt:
 *                             type: number
 *                           completion:
 *                             type: number
 *       401:
 *         description: Unauthorized
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
    await getAuthUser(request) // Verify authentication

    const models = OpenRouterService.getAvailableModels()
    
    return NextResponse.json({
      models,
      count: models.length,
      note: 'All listed models are free to use via OpenRouter'
    })

  } catch (error: any) {
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
