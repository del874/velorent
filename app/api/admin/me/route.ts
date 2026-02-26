import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth'

// GET /api/admin/me - Get current admin
export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin(request)

    if (!admin) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({ admin })
  } catch (error) {
    console.error('Get current admin error:', error)
    return NextResponse.json(
      { error: 'Failed to get admin' },
      { status: 500 }
    )
  }
}
