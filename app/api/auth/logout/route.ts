import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/auth-api';

// POST /api/auth/logout - Logout user
export async function POST(request: NextRequest) {
  try {
    await logout();

    return NextResponse.json({
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
