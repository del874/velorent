import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import { signToken, verifyToken, setToken, removeToken, JWTPayload } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// Register new user
export async function register(name: string, email: string, password: string) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Create token
  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name || '',
  });

  // Set cookie
  await setToken(token);

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Login user
export async function login(email: string, password: string) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password || '');

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // Create token
  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name || '',
  });

  // Set cookie
  await setToken(token);

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Logout user
export async function logout() {
  await removeToken();
}

// Get current user
export async function getCurrentUser(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    return payload;
  } catch (error) {
    return null;
  }
}

// Helper to get cookies
async function cookies() {
  const { cookies } = await import('next/headers');
  return cookies();
}
