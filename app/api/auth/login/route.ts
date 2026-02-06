import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth-api';

// POST /api/auth/login - Login user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Login user
    const user = await login(email, password);

    return NextResponse.json({
      message: 'Login successful',
      user,
    });
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
