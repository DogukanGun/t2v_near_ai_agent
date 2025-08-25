import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth'

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrUsername
 *               - password
 *             properties:
 *               emailOrUsername:
 *                 type: string
 *                 description: User's email address or username
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: User successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Invalid credentials
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Login API received body:', body) // Debug log
    const { emailOrUsername, password } = body

    if (!emailOrUsername || !password) {
      console.log('Missing fields - emailOrUsername:', emailOrUsername, 'password:', !!password) // Debug log
      return NextResponse.json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      )
    }

    const result = await AuthService.login({ emailOrUsername, password })

    return NextResponse.json(result)
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
