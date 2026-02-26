import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, changePassword } from '@/lib/auth-api';

// PATCH /api/auth/password - Change password
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    // Validate input
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Old password and new password are required' },
        { status: 400 }
      );
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Change password
    await changePassword(user.userId, oldPassword, newPassword);

    return NextResponse.json({
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    console.error('Change password error:', error);

    if (error.message === 'Incorrect password') {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to change password' },
      { status: 500 }
    );
  }
}
