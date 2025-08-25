import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthUser {
  id: string
  email: string
  username: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
}

export interface LoginData {
  emailOrUsername: string
  password: string
}

export class AuthService {
  static async register(data: RegisterData): Promise<{ user: AuthUser; token: string }> {
    const { email, username, password } = data

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      throw new Error('User with this email or username already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword
      }
    })

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token
    }
  }

  static async login(data: LoginData): Promise<{ user: AuthUser; token: string }> {
    const { emailOrUsername, password } = data

    // Find user by email OR username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername }
        ]
      }
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token
    }
  }

  static async validateToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })

      if (!user) return null

      return {
        id: user.id,
        email: user.email,
        username: user.username
      }
    } catch (error) {
      return null
    }
  }

  static async getUserFromToken(token: string): Promise<AuthUser> {
    const user = await this.validateToken(token)
    if (!user) {
      throw new Error('Invalid token')
    }
    return user
  }
}
