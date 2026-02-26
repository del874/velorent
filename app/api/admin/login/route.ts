import { NextRequest, NextResponse } from 'next/server'
import { adminLogin } from '@/lib/admin-auth'

// POST /api/admin/login - Admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Admin login
    const admin = await adminLogin(email, password)

    return NextResponse.json({
      message: 'Login successful',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    })
  } catch (error: any) {
    console.error('Admin login error:', error)

    if (error.message === 'Invalid credentials' || error.message === 'Not authorized as admin') {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
