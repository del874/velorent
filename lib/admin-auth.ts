import { NextRequest } from 'next/server'
import { JWTPayload, verifyToken, signToken, setToken } from './auth'
import { prisma } from './prisma'

export interface AdminPayload extends JWTPayload {
  role: 'admin'
}

// Verify if user is admin
export async function getCurrentAdmin(request: NextRequest): Promise<AdminPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value

    if (!token) {
      return null
    }

    const payload = await verifyToken(token) as AdminPayload | null

    if (!payload || payload.role !== 'admin') {
      return null
    }

    // Verify user still exists and is admin
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        role: true,
      },
    })

    if (!user || user.role !== 'admin') {
      return null
    }

    return payload
  } catch (error) {
    return null
  }
}

// Admin login
export async function adminLogin(email: string, password: string) {
  // Find admin user
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new Error('Invalid credentials')
  }

  if (user.role !== 'admin') {
    throw new Error('Not authorized as admin')
  }

  // Verify password
  const bcrypt = await import('bcryptjs')
  const isValidPassword = await bcrypt.compare(password, user.password || '')

  if (!isValidPassword) {
    throw new Error('Invalid credentials')
  }

  // Create token
  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name || '',
    role: 'admin',
  })

  // Set admin-specific cookie
  const cookieStore = await cookies()
  cookieStore.set('admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  // Return admin user without password
  const { password: _, ...adminWithoutPassword } = user
  return adminWithoutPassword
}

// Admin logout
export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin-token')
}

// Helper to get cookies
async function cookies() {
  const { cookies } = await import('next/headers')
  return cookies()
}
