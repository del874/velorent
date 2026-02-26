import { NextRequest, NextResponse } from 'next/server'
import { adminLogout } from '@/lib/admin-auth'

// POST /api/admin/logout - Admin logout
export async function POST(request: NextRequest) {
  try {
    await adminLogout()

    return NextResponse.json({
      message: 'Logout successful',
    })
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
